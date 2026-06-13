import { AzureKeyCredential } from '@azure/ai-form-recognizer';
import { DefaultAzureCredential } from '@azure/identity';
import type { DealFields } from '../models/deal.js';

const AI_ENDPOINT = process.env.AZURE_AI_ENDPOINT!;
const AI_KEY = process.env.AZURE_AI_KEY;
const OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT!;
const OPENAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o';

const SYSTEM_PROMPT = `You are a deal document analyst. Given the text content of a document, 
extract structured fields for a Deal One Pager. Return ONLY valid JSON matching this schema:

{
  "dealName": "string - project or deal title",
  "customerName": "string - client/customer name",
  "opportunityId": "string - opportunity/deal ID if found",
  "company": "string - company name",
  "industry": "string - industry/sector",
  "tcv": "string - total contract value with currency",
  "cm1": "string - contribution margin if found",
  "timeline": "string - project timeline/duration",
  "executiveSummary": "string - brief executive summary",
  "scopeOfWork": "string - scope description",
  "solution": "string - proposed solution",
  "pricingOverview": "string - pricing details",
  "risks": [{"cells": ["risk description", "mitigation"]}],
  "stakeholdersCustomer": [{"cells": ["name", "role", "sentiment"]}],
  "stakeholdersInternal": [{"cells": ["name", "role"]}],
  "commercials": [{"cells": ["period", "amount"]}],
  "nextSteps": "string - next steps",
  "notes": "string - additional notes"
}

Rules:
- Extract only information explicitly present in the document
- Leave fields as empty string "" if not found
- Leave array fields as [] if not found
- Do not invent or hallucinate information
- Preserve currency symbols and formatting`;

export class AIService {
  /**
   * Extract deal fields from an uploaded document using Azure AI.
   * 1. Extract text from document (Document Intelligence for PDFs/images, direct for text)
   * 2. Send text to GPT to structure into deal fields
   */
  async extractDealFields(
    fileBuffer: Buffer,
    mimeType: string
  ): Promise<Partial<DealFields>> {
    // Step 1: Extract text content
    const textContent = await this.extractText(fileBuffer, mimeType);

    if (!textContent.trim()) {
      throw new Error('Could not extract any text from the document');
    }

    // Step 2: Use GPT to structure into deal fields
    const structuredFields = await this.structureWithGPT(textContent);
    return structuredFields;
  }

  private async extractText(fileBuffer: Buffer, mimeType: string): Promise<string> {
    // For text/markdown files, just decode directly
    if (mimeType === 'text/plain' || mimeType === 'text/markdown') {
      return fileBuffer.toString('utf-8');
    }

    // For PDFs, Word docs, images — use Azure Document Intelligence
    const { DocumentAnalysisClient } = await import('@azure/ai-form-recognizer');

    const credential = AI_KEY
      ? new AzureKeyCredential(AI_KEY)
      : new DefaultAzureCredential();

    const client = new DocumentAnalysisClient(
      AI_ENDPOINT,
      credential as unknown as AzureKeyCredential
    );

    const poller = await client.beginAnalyzeDocument('prebuilt-read', fileBuffer);

    const result = await poller.pollUntilDone();

    // Concatenate all page content
    let text = '';
    if (result.content) {
      text = result.content;
    } else if (result.pages) {
      for (const page of result.pages) {
        for (const line of page.lines || []) {
          text += line.content + '\n';
        }
      }
    }

    return text;
  }

  private async structureWithGPT(textContent: string): Promise<Partial<DealFields>> {
    const credential = AI_KEY
      ? new AzureKeyCredential(AI_KEY)
      : new DefaultAzureCredential();

    // Use Azure OpenAI REST API
    const deploymentUrl = `${OPENAI_ENDPOINT}/openai/deployments/${OPENAI_DEPLOYMENT}/chat/completions?api-version=2024-08-01-preview`;

    const response = await fetch(deploymentUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(AI_KEY ? { 'api-key': AI_KEY } : {}),
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: `Extract deal fields from this document:\n\n${textContent.slice(0, 15000)}`,
          },
        ],
        temperature: 0.1,
        max_tokens: 4000,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Azure OpenAI API error: ${response.status} - ${error}`);
    }

    const data = await response.json() as {
      choices: Array<{ message: { content: string } }>;
    };

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No response from AI model');
    }

    try {
      return JSON.parse(content) as Partial<DealFields>;
    } catch {
      throw new Error('AI returned invalid JSON');
    }
  }
}

export const aiService = new AIService();
