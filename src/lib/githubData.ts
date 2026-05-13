export interface WorkPackage {
  id: string
  name: string
  startingPoint: string
  scope: string
  customerInvolvement: string
  deliverables: string
  effort: string
  dependencies?: string
  exclusions?: string
  optionalExtensions?: string
}

export interface Offering {
  id: string
  name: string
  description: string
  workPackageIds: string[]
  category: 'core' | 'optional'
  developerRange?: string
  duration?: string
}

export const workPackages: WorkPackage[] = [
  {
    id: 'azure-devops-discovery',
    name: 'Azure DevOps Discovery',
    startingPoint: 'Assess the current Azure DevOps environment to establish a clear understanding of existing projects, repositories, pipelines, and work items. The goal is to create a foundation for migration planning or modernization.',
    scope: '• Execution of discovery workshops and automated assessments of Azure DevOps instances\n• Collection and analysis of metadata (projects, builds, repositories)\n• Documentation of findings and dependencies',
    customerInvolvement: 'Provide access to Azure DevOps with sufficient permissions to perform automated discovery. Support scheduling of workshops and validation of findings.',
    deliverables: 'A comprehensive report detailing the current state, dependencies, and a recommended approach for migration or modernization.',
    effort: '5–15 person-days, depending on environment complexity.',
    dependencies: 'Availability of Azure DevOps administrative access and stakeholder participation for validation.',
    exclusions: 'No remediation or migration activities are included. No performance tuning or tool optimization performed.',
    optionalExtensions: 'Follow-up advisory for migration readiness or GitHub Adoption Strategy.'
  },
  {
    id: 'github-adoption-strategy',
    name: 'GitHub Adoption Strategy & Migration Plan',
    startingPoint: 'Define a structured GitHub adoption approach covering governance, architecture, and migration roadmap to ensure a smooth transition from existing systems.',
    scope: '• Conduct strategy and design workshops\n• Define GitHub organization and repository structure, roles, authentication, authorization, and governance model\n• Create a migration and rollout plan',
    customerInvolvement: 'Provide insights into current toolchain, processes, and security standards. Ensure key decision-makers are available for workshops.',
    deliverables: 'A GitHub Adoption and Migration Plan, including governance, rollout sequencing, and architecture recommendations.',
    effort: '10–25 person-days.',
    dependencies: 'Completion of discovery or assessment phase (e.g., Azure DevOps Discovery).',
    exclusions: 'Implementation or technical configuration of GitHub not included.',
    optionalExtensions: 'GitHub Deployment (Enterprise or Cloud), CI/CD Enablement with GitHub Actions.'
  },
  {
    id: 'github-deployment',
    name: 'GitHub Deployment (Enterprise or Cloud)',
    startingPoint: 'Deploy and configure GitHub Enterprise Cloud or Server to establish a secure, governed, and operational environment for repositories and development workflows.',
    scope: '• Setup of GitHub Organizations, SSO integration (Entra ID), access policies, audit configuration, governance controls, and onboarding repositories\n• Includes initial runner setup and documentation',
    customerInvolvement: 'Provide Azure Subscription for billing and Entra ID configuration access. Participate in workshops and validation sessions.',
    deliverables: 'GitHub Enterprise environment configured and ready for adoption, including documentation for governance and operations.',
    effort: '15–25 person-days.',
    dependencies: 'GitHub Adoption Strategy defined. Entra ID setup completed.',
    exclusions: 'Custom automation, non-standard integrations, and user training beyond defined workshops.',
    optionalExtensions: 'CI/CD Enablement, GHAS Enablement, or Copilot rollout.'
  },
  {
    id: 'repository-migration',
    name: 'Repository Migration (SVN / Azure DevOps → GitHub)',
    startingPoint: 'Migrate existing repositories and associated assets to GitHub to unify development workflows and version control.',
    scope: '• Assessment of repository structures\n• Planning and execution of migration\n• Dry-run testing, dependency updates, and verification\n• Documentation and validation',
    customerInvolvement: 'Provide access to source systems, support dry-run validation, and ensure acceptance testing availability.',
    deliverables: 'Successfully migrated repositories with validated access and functioning CI/CD pipelines.',
    effort: '25–100 person-days depending on size and complexity.',
    dependencies: 'GitHub environment fully deployed and accessible.',
    exclusions: 'No re-engineering or refactoring of applications. Data or artifact migration beyond source control is excluded.',
    optionalExtensions: 'CI/CD Enablement, Hypercare & Enablement Support.'
  },
  {
    id: 'cicd-enablement',
    name: 'CI/CD Enablement with GitHub Actions',
    startingPoint: 'Establish GitHub Actions as a scalable and secure CI/CD platform to automate builds, testing, and deployment.',
    scope: '• Design and implement pipelines and reusable workflows\n• Configure runner infrastructure and security settings\n• Implement secrets management\n• Testing and documentation',
    customerInvolvement: 'Provide Azure environment access and credentials for target systems. Participate in review and acceptance testing.',
    deliverables: 'Operational CI/CD pipelines implemented and documented in GitHub.',
    effort: '25–100 person-days depending on number of pipelines.',
    dependencies: 'GitHub Deployment completed and runners available.',
    exclusions: 'Application-specific testing or deployment scripting outside standard pipelines.',
    optionalExtensions: 'GHAS Enablement, Hypercare & Support, or Performance Optimization.'
  },
  {
    id: 'github-copilot-fundamentals',
    name: 'GitHub Copilot Fundamentals',
    startingPoint: 'Enable developers and technical users to understand and use GitHub Copilot effectively and securely.',
    scope: '• Conduct interactive workshops and hands-on sessions introducing Copilot capabilities\n• Setup and policy management\n• Best practices and live demonstrations\n• Includes enablement materials',
    customerInvolvement: 'Provide user access and licenses for Copilot. Participants attend all sessions.',
    deliverables: 'Copilot configured for pilot group, participants trained, and enablement documentation shared.',
    effort: '4–24 person-days depending on group size.',
    dependencies: 'GitHub Enterprise setup completed with Copilot licenses available.',
    exclusions: 'No integration into third-party IDEs beyond supported environments.',
    optionalExtensions: 'Copilot Advanced & ROI Measurement, Microsoft Expert on Demand.'
  },
  {
    id: 'expert-on-demand',
    name: 'Microsoft Expert on Demand (GitHub & Copilot Enablement)',
    startingPoint: 'Provide short-term expert engagement to accelerate GitHub and Copilot setup or troubleshooting.',
    scope: '• One-day interactive engagement for configuration review\n• Entra ID integration\n• Copilot activation\n• Q&A session',
    customerInvolvement: 'Provide administrative access to GitHub and Entra ID. Ensure relevant stakeholders join the session.',
    deliverables: 'GitHub and Copilot environment optimized and configured for effective use.',
    effort: '1 person-day.',
    dependencies: 'Existing GitHub environment and Copilot licenses.',
    exclusions: 'Continuous support or full rollout activities.',
    optionalExtensions: 'Copilot Fundamentals or Advanced enablement sessions.'
  },
  {
    id: 'copilot-advanced-roi',
    name: 'GitHub Copilot Advanced & ROI Measurement',
    startingPoint: 'Assess and optimize Copilot adoption while quantifying productivity and value outcomes.',
    scope: '• Conduct workshops on advanced Copilot use\n• Productivity analytics and ROI metrics\n• Process improvement tracking\n• Develop dashboards for usage reporting',
    customerInvolvement: 'Provide access to Copilot analytics and participant feedback. Engage in periodic review sessions.',
    deliverables: 'ROI measurement dashboards, adoption optimization plan, and productivity improvement report.',
    effort: '10 person-days.',
    dependencies: 'Copilot Fundamentals completed, active user base available.',
    exclusions: 'No data collection beyond Copilot usage metrics.',
    optionalExtensions: 'DevOps AI Readiness Advisory, continuous optimization workshops.'
  },
  {
    id: 'hypercare-enablement',
    name: 'Hypercare & Enablement Support',
    startingPoint: 'Ensure post-deployment stability, adoption success, and user confidence through targeted support and enablement.',
    scope: '• Provide configuration assistance and troubleshooting\n• Operational support and user enablement\n• Periodic review sessions and Q&A',
    customerInvolvement: 'Provide timely feedback and access to relevant systems for troubleshooting.',
    deliverables: 'Stable GitHub environment, trained users, and reduced operational issues.',
    effort: '10–20 person-days or equivalent hours.',
    dependencies: 'Completion of initial project deployment or migration.',
    exclusions: 'Long-term managed support, 24/7 coverage, or incident response.',
    optionalExtensions: 'Expert Project Management, Consulting Package.'
  },
  {
    id: 'expert-project-management',
    name: 'Expert Project Management',
    startingPoint: 'Deliver structured oversight and coordination to ensure successful execution of multiple work packages.',
    scope: '• Assign a project manager for governance, coordination, and timeline control\n• Progress reporting and stakeholder management\n• Risk tracking and mitigation',
    customerInvolvement: 'Define project sponsor, escalation paths, and ensure stakeholder participation in reviews.',
    deliverables: 'Coordinated execution of work packages, transparent progress, and risk mitigation.',
    effort: '10–20% of overall project effort.',
    dependencies: 'Engagement of at least one technical work package.',
    exclusions: 'No financial or contract management.',
    optionalExtensions: 'Hypercare Support or Governance Advisory.'
  },
  {
    id: 'consulting-package',
    name: 'Consulting Package (Flexible Advisory)',
    startingPoint: 'Provide on-demand consulting capacity to support diverse technical and strategic needs.',
    scope: '• Ad-hoc expert advisory across GitHub, DevOps, automation, and AI topics\n• Reviews, configuration adjustments, or mentoring',
    customerInvolvement: 'Define use cases and provide access to systems or stakeholders as needed.',
    deliverables: 'Documented consulting sessions and recommendations aligned to specific goals.',
    effort: 'Typically 35 hours or equivalent.',
    dependencies: 'Active GitHub environment or project context.',
    exclusions: 'No delivery of full-scale implementations or migrations.',
    optionalExtensions: 'Project Management, Hypercare, or Governance Advisory.'
  },
  {
    id: 'devops-ai-readiness',
    name: 'DevOps AI Readiness Advisory',
    startingPoint: 'Evaluate the organization\'s readiness for AI-assisted DevOps practices using GitHub tools and automation.',
    scope: '• Conduct executive and technical workshops\n• Maturity assessments and roadmap planning\n• AI integration and Copilot adoption strategy',
    customerInvolvement: 'Participate in workshops, provide current process documentation and relevant data.',
    deliverables: 'AI readiness report, roadmap, and prioritized recommendations for adoption.',
    effort: '5 person-days.',
    dependencies: 'Existing GitHub environment and Copilot pilot group recommended.',
    exclusions: 'No AI model training or custom data processing.',
    optionalExtensions: 'Copilot Advanced, Consulting Package.'
  }
]

export const offerings: Offering[] = [
  {
    id: 'core-adoption',
    name: 'Core Adoption',
    description: 'Small-scale adoption incl. configuration, migration, security, integrations, and GitHub feature support.',
    workPackageIds: [
      'github-deployment',
      'github-adoption-strategy'
    ],
    category: 'core',
    developerRange: '1-10 developers',
    duration: '1-2 weeks'
  },
  {
    id: 'actions-adoption',
    name: 'Actions Adoption',
    description: 'Enterprise-grade Actions migration and implementation. Reuse patterns and guidance. Secure deployments.',
    workPackageIds: [
      'cicd-enablement',
      'repository-migration',
      'hypercare-enablement'
    ],
    category: 'core',
    developerRange: '10-50 developers',
    duration: '1 week'
  },
  {
    id: 'ghas-adoption',
    name: 'Advanced Security Adoption',
    description: 'At-scale planning and GHAS pilot. Assessment, configuration, tools onboarding & guidance.',
    workPackageIds: [
      'github-deployment',
      'devops-ai-readiness'
    ],
    category: 'core',
    developerRange: '10-50 developers',
    duration: '1 week'
  },
  {
    id: 'migration-enablement',
    name: 'Migration Enablement',
    description: 'Planning, gap analysis & filling, approach & tools evaluation, dry-runs, pilot & troubleshooting.',
    workPackageIds: [
      'azure-devops-discovery',
      'repository-migration',
      'expert-project-management'
    ],
    category: 'core',
    developerRange: '50+ developers',
    duration: '1 week'
  },
  {
    id: 'copilot-adoption',
    name: 'Copilot Adoption',
    description: 'End-to-end adoption planning and swarming enablement for pilot teams with own code & work items.',
    workPackageIds: [
      'github-copilot-fundamentals',
      'expert-on-demand',
      'copilot-advanced-roi'
    ],
    category: 'core',
    developerRange: '1+ developers',
    duration: '1 week'
  },
  {
    id: 'ai-readiness',
    name: 'AI Readiness & Automation',
    description: 'Evaluate AI maturity and automation capabilities across DevOps processes.',
    workPackageIds: [
      'devops-ai-readiness'
    ],
    category: 'optional'
  },
  {
    id: 'consulting-support',
    name: 'Consulting / Expert Support',
    description: 'Provides flexible expert hours for additional guidance, reviews, and ad-hoc improvements.',
    workPackageIds: [
      'consulting-package'
    ],
    category: 'optional'
  },
  {
    id: 'governance-pmo',
    name: 'Governance & PMO',
    description: 'Adds structured coordination, risk tracking, and communication to ensure project success.',
    workPackageIds: [
      'expert-project-management'
    ],
    category: 'optional'
  }
]
