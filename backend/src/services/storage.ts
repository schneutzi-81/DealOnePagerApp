import { TableClient, TableEntity, odata } from '@azure/data-tables';
import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import { DefaultAzureCredential } from '@azure/identity';
import { v4 as uuidv4 } from 'uuid';
import type { Deal, DealFields, DealStatus, ApprovalRecord } from '../models/deal.js';

const STORAGE_ACCOUNT = process.env.AZURE_STORAGE_ACCOUNT_NAME!;
const CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;

// Table Storage for metadata
function getTableClient(): TableClient {
  if (CONNECTION_STRING) {
    return TableClient.fromConnectionString(CONNECTION_STRING, 'deals');
  }
  const url = `https://${STORAGE_ACCOUNT}.table.core.windows.net`;
  return new TableClient(url, 'deals', new DefaultAzureCredential());
}

// Blob Storage for PDFs
function getBlobContainer(): ContainerClient {
  if (CONNECTION_STRING) {
    const blobService = BlobServiceClient.fromConnectionString(CONNECTION_STRING);
    return blobService.getContainerClient('deal-pdfs');
  }
  const url = `https://${STORAGE_ACCOUNT}.blob.core.windows.net`;
  const blobService = new BlobServiceClient(url, new DefaultAzureCredential());
  return blobService.getContainerClient('deal-pdfs');
}

// Sequential deal number counter (stored in a separate table)
async function getNextDealNumber(year: number): Promise<string> {
  const counterTable = CONNECTION_STRING
    ? TableClient.fromConnectionString(CONNECTION_STRING, 'counters')
    : new TableClient(
        `https://${STORAGE_ACCOUNT}.table.core.windows.net`,
        'counters',
        new DefaultAzureCredential()
      );

  const partitionKey = 'deal-numbers';
  const rowKey = year.toString();

  try {
    const entity = await counterTable.getEntity<{ count: number }>(partitionKey, rowKey);
    const next = (entity.count || 0) + 1;
    await counterTable.updateEntity(
      { partitionKey, rowKey, count: next },
      'Replace',
      { etag: entity.etag }
    );
    return `DOP-${year}-${String(next).padStart(4, '0')}`;
  } catch {
    // Entity doesn't exist yet — create it
    await counterTable.createEntity({ partitionKey, rowKey, count: 1 });
    return `DOP-${year}-0001`;
  }
}

interface DealEntity extends TableEntity {
  id: string;
  dealNumber: string | null;
  version: number;
  status: string;
  fields: string; // JSON
  createdBy: string;
  createdByName: string;
  createdByEmail: string;
  createdAt: string;
  updatedAt: string;
  approvals: string; // JSON
  blobUrl: string | null;
}

function toDealEntity(deal: Deal): DealEntity {
  return {
    partitionKey: deal.createdBy,
    rowKey: deal.id,
    id: deal.id,
    dealNumber: deal.dealNumber,
    version: deal.version,
    status: deal.status,
    fields: JSON.stringify(deal.fields),
    createdBy: deal.createdBy,
    createdByName: deal.createdByName,
    createdByEmail: deal.createdByEmail,
    createdAt: deal.createdAt,
    updatedAt: deal.updatedAt,
    approvals: JSON.stringify(deal.approvals),
    blobUrl: deal.blobUrl,
  };
}

function fromDealEntity(entity: DealEntity): Deal {
  return {
    id: entity.id,
    dealNumber: entity.dealNumber,
    version: entity.version,
    status: entity.status as DealStatus,
    fields: JSON.parse(entity.fields as string),
    createdBy: entity.createdBy,
    createdByName: entity.createdByName,
    createdByEmail: entity.createdByEmail,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
    approvals: JSON.parse(entity.approvals as string),
    blobUrl: entity.blobUrl,
  };
}

export class StorageService {
  private tableClient = getTableClient();
  private blobContainer = getBlobContainer();

  async initialize(): Promise<void> {
    await this.blobContainer.createIfNotExists({ access: 'blob' });
  }

  // ─── CRUD ───────────────────────────────────────────

  async createDeal(fields: DealFields, user: { oid: string; name: string; email: string }): Promise<Deal> {
    const now = new Date().toISOString();
    const deal: Deal = {
      id: uuidv4(),
      dealNumber: null,
      version: 1,
      status: 'draft',
      fields,
      createdBy: user.oid,
      createdByName: user.name,
      createdByEmail: user.email,
      createdAt: now,
      updatedAt: now,
      approvals: [],
      blobUrl: null,
    };

    await this.tableClient.createEntity(toDealEntity(deal));
    return deal;
  }

  async getDeal(id: string, userOid: string): Promise<Deal | null> {
    try {
      const entity = await this.tableClient.getEntity<DealEntity>(userOid, id);
      return fromDealEntity(entity as DealEntity);
    } catch {
      return null;
    }
  }

  async getDealById(id: string): Promise<Deal | null> {
    // Search across all partitions
    const entities = this.tableClient.listEntities<DealEntity>({
      queryOptions: { filter: odata`id eq ${id}` },
    });
    for await (const entity of entities) {
      return fromDealEntity(entity as DealEntity);
    }
    return null;
  }

  async updateDeal(deal: Deal): Promise<void> {
    deal.updatedAt = new Date().toISOString();
    await this.tableClient.updateEntity(toDealEntity(deal), 'Replace');
  }

  async listDeals(userOid: string): Promise<Deal[]> {
    const deals: Deal[] = [];
    const entities = this.tableClient.listEntities<DealEntity>({
      queryOptions: { filter: odata`PartitionKey eq ${userOid}` },
    });
    for await (const entity of entities) {
      deals.push(fromDealEntity(entity as DealEntity));
    }
    return deals;
  }

  async listPendingApprovals(): Promise<Deal[]> {
    const deals: Deal[] = [];
    const entities = this.tableClient.listEntities<DealEntity>({
      queryOptions: {
        filter: odata`status eq 'pending_level_1' or status eq 'pending_level_2'`,
      },
    });
    for await (const entity of entities) {
      deals.push(fromDealEntity(entity as DealEntity));
    }
    return deals;
  }

  // ─── Approval ───────────────────────────────────────

  async submitForApproval(deal: Deal): Promise<Deal> {
    deal.status = 'pending_level_1';
    deal.updatedAt = new Date().toISOString();
    await this.updateDeal(deal);
    return deal;
  }

  async recordApproval(deal: Deal, approval: ApprovalRecord): Promise<Deal> {
    deal.approvals.push(approval);

    if (approval.decision === 'rejected') {
      deal.status = 'rejected';
    } else if (approval.level === 1) {
      deal.status = 'pending_level_2';
    } else if (approval.level === 2) {
      deal.status = 'approved';
      // Assign deal number on first full approval
      if (!deal.dealNumber) {
        const year = new Date().getFullYear();
        deal.dealNumber = await getNextDealNumber(year);
      }
    }

    deal.updatedAt = new Date().toISOString();
    await this.updateDeal(deal);
    return deal;
  }

  // ─── Blob Storage ───────────────────────────────────

  async uploadApprovedPDF(deal: Deal, pdfBuffer: Buffer): Promise<string> {
    const blobName = `approved/${deal.dealNumber}/v${deal.version}/${deal.dealNumber}.pdf`;
    const blockBlob = this.blobContainer.getBlockBlobClient(blobName);
    await blockBlob.upload(pdfBuffer, pdfBuffer.length, {
      blobHTTPHeaders: { blobContentType: 'application/pdf' },
    });
    deal.blobUrl = blockBlob.url;
    await this.updateDeal(deal);
    return blockBlob.url;
  }
}

export const storageService = new StorageService();
