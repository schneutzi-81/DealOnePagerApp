/** A single row in a multi-column table field. */
export interface TableRow {
  cols: string[];
}

export interface DealOnePagerFields {
  // ── Header ──────────────────────────────────────────────────────────────
  customerName: string;    // "[Customer Name — Deal Description]"
  opportunityId: string;   // "OPP-XXXX-XXXXX"
  businessLines: string;   // "Business Lines: [insert business line]"

  // ── Client Overview ──────────────────────────────────────────────────────
  company: string;
  industry: string;
  companyFacts: string;    // employees, revenue, locations, core products…

  // ── Subject / Scope of the Deal ──────────────────────────────────────────
  subjectScope: string;    // large free-text area
  contractTerm: string;    // Contract Term / Timeline

  // ── Summary / Key Points ─────────────────────────────────────────────────
  summaryKeyPoints: string; // newline-separated bullet points

  // ── Risks | Mitigation ───────────────────────────────────────────────────
  risksMitigation: TableRow[]; // cols: [risk, mitigation]

  // ── Deal Information ─────────────────────────────────────────────────────
  dealName: string;
  client: string;
  businessType: string;
  tcv: string;
  signingQuarter: string;
  accountManager: string;
  presales: string;
  sponsor: string;

  // ── Customer Timeline ────────────────────────────────────────────────────
  customerTimeline: TableRow[]; // cols: [label, value]  e.g. Submission Date | 2024-07-01

  // ── Commercials – TCV | CM1 ──────────────────────────────────────────────
  commercials: TableRow[]; // cols: [item, value, margin]

  // ── Help Needed ──────────────────────────────────────────────────────────
  helpNeeded: TableRow[]; // cols: [item, details]

  // ── Stakeholder (Customer) ───────────────────────────────────────────────
  stakeholders: TableRow[]; // cols: [name, role, rag]  rag: Positive | Neutral | Issue

  // ── Competition ──────────────────────────────────────────────────────────
  competition: TableRow[]; // cols: [competitor, relation, swoDifferentiator]

  // ── Additional Comments ──────────────────────────────────────────────────
  additionalComments: string;

  // ── Next Steps [Internal] ────────────────────────────────────────────────
  nextSteps: TableRow[]; // cols: [date, step]

  // ── Bid Recommendation ───────────────────────────────────────────────────
  bidRecommendation: string;
  signOffAccountManagement: string;
  signOffPresales: string;
  signOffDelivery: string;
  signOffLegal: string;
}

// ── Field labels (used by the markdown parser) ───────────────────────────────
export const FIELD_LABELS: Record<string, keyof DealOnePagerFields> = {
  'customer name': 'customerName',
  'deal description': 'customerName',
  'opportunity id': 'opportunityId',
  'opportunity': 'opportunityId',
  'business lines': 'businessLines',
  'business line': 'businessLines',
  'company': 'company',
  'industry': 'industry',
  'company facts': 'companyFacts',
  'company facts figures': 'companyFacts',
  'facts figures': 'companyFacts',
  'subject scope': 'subjectScope',
  'subject': 'subjectScope',
  'scope': 'subjectScope',
  'scope of the deal': 'subjectScope',
  'subject scope of the deal': 'subjectScope',
  'contract term': 'contractTerm',
  'contract term timeline': 'contractTerm',
  'timeline': 'contractTerm',
  'summary': 'summaryKeyPoints',
  'summary key points': 'summaryKeyPoints',
  'key points': 'summaryKeyPoints',
  'risks': 'risksMitigation',
  'risks mitigation': 'risksMitigation',
  'risk mitigation': 'risksMitigation',
  'deal name': 'dealName',
  'client': 'client',
  'business type': 'businessType',
  'tcv': 'tcv',
  'signing quarter': 'signingQuarter',
  'account manager': 'accountManager',
  'presales': 'presales',
  'sponsor': 'sponsor',
  'customer timeline': 'customerTimeline',
  'commercials': 'commercials',
  'help needed': 'helpNeeded',
  'stakeholder': 'stakeholders',
  'stakeholders': 'stakeholders',
  'competition': 'competition',
  'additional comments': 'additionalComments',
  'additional comment': 'additionalComments',
  'comments': 'additionalComments',
  'next steps': 'nextSteps',
  'bid recommendation': 'bidRecommendation',
  'sign off account management': 'signOffAccountManagement',
  'sign off presales': 'signOffPresales',
  'sign off delivery': 'signOffDelivery',
  // ── Aliases ──────────────────────────────────────────────────────────────────
  'tco': 'tcv',
  'total contract value': 'tcv',
  'contract value': 'tcv',
  'total value': 'tcv',
  'acv': 'tcv',
  'arr': 'tcv',
  'deal value': 'tcv',
  'deal size': 'tcv',
  'deal size value': 'tcv',
  'value': 'tcv',
  'account mgr': 'accountManager',
  'account mgr manager': 'accountManager',
  'am': 'accountManager',
  'pre sales': 'presales',
  'pre-sales': 'presales',
  'exec summary': 'summaryKeyPoints',
  'executive summary': 'summaryKeyPoints',
  'highlights': 'summaryKeyPoints',
  'overview': 'summaryKeyPoints',
  'scope of work': 'subjectScope',
  'project scope': 'subjectScope',
  'duration': 'contractTerm',
  'term': 'contractTerm',
  'period': 'contractTerm',
  'opp id': 'opportunityId',
  'opp': 'opportunityId',
  'opp number': 'opportunityId',
  'opportunity number': 'opportunityId',
  'sfdc id': 'opportunityId',
  'sfdc': 'opportunityId',
  'crm id': 'opportunityId',
  'risk': 'risksMitigation',
  'risks and mitigation': 'risksMitigation',
  'competitor': 'competition',
  'competitors': 'competition',
  'next step': 'nextSteps',
  'action items': 'nextSteps',
  'actions': 'nextSteps',
  'additional info': 'additionalComments',
  'notes': 'additionalComments',
  'note': 'additionalComments',
  'help': 'helpNeeded',
  'assistance needed': 'helpNeeded',
  'stakeholder customer': 'stakeholders',
  'key stakeholders': 'stakeholders',
  'people': 'stakeholders',
  'contact': 'stakeholders',
  'contacts': 'stakeholders',
  'financials': 'commercials',
  'financial': 'commercials',
  'pricing': 'commercials',
  'cost': 'commercials',
  'costs': 'commercials',
  'bid': 'bidRecommendation',
  'recommendation': 'bidRecommendation',
  'sign off legal': 'signOffLegal',
};

/** Fields whose values are TableRow arrays (used by the parser). */
export const TABLE_FIELDS = new Set<keyof DealOnePagerFields>([
  'risksMitigation',
  'customerTimeline',
  'commercials',
  'helpNeeded',
  'stakeholders',
  'competition',
  'nextSteps',
]);

/** Number of columns for each table field. */
export const TABLE_COL_COUNTS: Partial<Record<keyof DealOnePagerFields, number>> = {
  risksMitigation: 2,
  customerTimeline: 2,
  commercials: 3,
  helpNeeded: 2,
  stakeholders: 3,
  competition: 3,
  nextSteps: 2,
};

function emptyRows(count: number, cols: number): TableRow[] {
  return Array.from({ length: count }, () => ({ cols: Array(cols).fill('') }));
}

export const DEFAULT_FIELDS: DealOnePagerFields = {
  customerName: '',
  opportunityId: '',
  businessLines: '',
  company: '',
  industry: '',
  companyFacts: '',
  subjectScope: '',
  contractTerm: '',
  summaryKeyPoints: '',
  risksMitigation: emptyRows(5, 2),
  dealName: '',
  client: '',
  businessType: '',
  tcv: '',
  signingQuarter: '',
  accountManager: '',
  presales: '',
  sponsor: '',
  customerTimeline: emptyRows(6, 2),
  commercials: emptyRows(4, 3),
  helpNeeded: emptyRows(3, 2),
  stakeholders: emptyRows(4, 3),
  competition: emptyRows(3, 3),
  additionalComments: '',
  nextSteps: emptyRows(5, 2),
  bidRecommendation: '',
  signOffAccountManagement: '',
  signOffPresales: '',
  signOffDelivery: '',
  signOffLegal: '',
};
