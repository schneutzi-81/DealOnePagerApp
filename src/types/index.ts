export interface DealOnePagerFields {
  dealName: string;
  clientName: string;
  date: string;
  dealOwner: string;
  dealSize: string;
  timeline: string;
  executiveSummary: string;
  scopeOfWork: string;
  keyDeliverables: string;
  pricingOverview: string;
  keyRisks: string;
  team: string;
  nextSteps: string;
  notes: string;
}

export const FIELD_LABELS: Record<keyof DealOnePagerFields, string> = {
  dealName: 'Deal / Project Name',
  clientName: 'Client Name',
  date: 'Date',
  dealOwner: 'Deal Owner / Lead',
  dealSize: 'Deal Size / Value',
  timeline: 'Timeline / Duration',
  executiveSummary: 'Executive Summary',
  scopeOfWork: 'Scope of Work',
  keyDeliverables: 'Key Deliverables',
  pricingOverview: 'Pricing Overview',
  keyRisks: 'Key Risks & Mitigations',
  team: 'Team / Resources',
  nextSteps: 'Next Steps',
  notes: 'Notes / Comments',
};

export const SHORT_FIELDS: Array<keyof DealOnePagerFields> = [
  'dealName',
  'clientName',
  'date',
  'dealOwner',
  'dealSize',
  'timeline',
];

export const LONG_FIELDS: Array<keyof DealOnePagerFields> = [
  'executiveSummary',
  'scopeOfWork',
  'keyDeliverables',
  'pricingOverview',
  'keyRisks',
  'team',
  'nextSteps',
  'notes',
];

export const DEFAULT_FIELDS: DealOnePagerFields = {
  dealName: '',
  clientName: '',
  date: '',
  dealOwner: '',
  dealSize: '',
  timeline: '',
  executiveSummary: '',
  scopeOfWork: '',
  keyDeliverables: '',
  pricingOverview: '',
  keyRisks: '',
  team: '',
  nextSteps: '',
  notes: '',
};
