export const WORKFLOW_PACKS = [
  {
    id: 'launch-sprint',
    title: 'Launch Sprint',
    subtitle: 'Go from idea to launch assets in one flow',
    description:
      'Build a consistent launch narrative with ready-made personas and prompts for positioning, channels, and QA.',
    defaultCollectionName: 'Launch Sprint',
    tags: ['launch', 'positioning', 'campaign', 'go-to-market'],
    structureSteps: [
      'Define target audience and positioning.',
      'Generate channel-specific assets.',
      'Run message QA before publishing.',
    ],
    personas: [
      {
        name: 'Growth PMM',
        tags: ['positioning', 'launch', 'strategy'],
        description: [
          '<p>Acts as the launch owner for cross-functional go-to-market execution.</p>',
          '<ul>',
          '<li>Translates product value into clear messaging.</li>',
          '<li>Aligns product, sales, and support on one narrative.</li>',
          '<li>Balances speed with quality for launch deadlines.</li>',
          '</ul>',
        ].join(''),
      },
      {
        name: 'Demand Gen Lead',
        tags: ['campaign', 'growth', 'channels'],
        description: [
          '<p>Owns campaign activation across paid, owned, and partner channels.</p>',
          '<ul>',
          '<li>Prioritizes high-converting audience segments.</li>',
          '<li>Needs reusable content angles per channel.</li>',
          '<li>Tracks performance and quickly iterates messaging.</li>',
          '</ul>',
        ].join(''),
      },
    ],
    prompts: [
      {
        title: 'Launch Positioning Brief',
        category: 'Marketing',
        tags: ['positioning', 'brief', 'launch'],
        content: [
          '<h3>Goal</h3><p>Create a concise launch positioning brief.</p>',
          '<h3>Context</h3><p>[Product], [Audience], [Problem], [Differentiator].</p>',
          '<h3>Constraints</h3><ul><li>Use plain language.</li><li>Max 200 words.</li></ul>',
          '<h3>Output</h3><p>Value proposition, proof points, and CTA.</p>',
        ].join(''),
      },
      {
        title: 'Channel Message Matrix',
        category: 'Marketing',
        tags: ['campaign', 'channels', 'messaging'],
        content: [
          '<h3>Goal</h3><p>Create channel-ready message variants.</p>',
          '<h3>Channels</h3><p>Email, LinkedIn, landing page, sales one-pager.</p>',
          '<h3>Output Format</h3><p>Table: channel, angle, message, CTA.</p>',
        ].join(''),
      },
      {
        title: 'Pre-Launch Message QA',
        category: 'Operations',
        tags: ['qa', 'review', 'launch'],
        content: [
          '<h3>Goal</h3><p>Review messaging quality and consistency.</p>',
          '<h3>Checklist</h3><ul><li>Clarity</li><li>Credibility</li><li>Tone</li><li>CTA fit</li></ul>',
          '<h3>Output</h3><p>Pass/fail + concrete edits.</p>',
        ].join(''),
      },
    ],
  },
  {
    id: 'customer-voice-loop',
    title: 'Customer Voice Loop',
    subtitle: 'Turn feedback into structured insights and actions',
    description:
      'Capture support and interview signals, cluster themes, and generate next-step actions for product and CX teams.',
    defaultCollectionName: 'Customer Voice Loop',
    tags: ['customer-research', 'insights', 'feedback', 'retention'],
    structureSteps: [
      'Collect raw feedback from support and interviews.',
      'Cluster recurring themes and urgency.',
      'Convert insights into prioritized action items.',
    ],
    personas: [
      {
        name: 'Customer Success Manager',
        tags: ['customer-success', 'retention', 'feedback'],
        description: [
          '<p>Maintains customer health and escalates recurring friction signals.</p>',
          '<ul>',
          '<li>Needs fast summaries of weekly feedback trends.</li>',
          '<li>Focuses on retention-risk indicators.</li>',
          '<li>Coordinates follow-up actions across teams.</li>',
          '</ul>',
        ].join(''),
      },
      {
        name: 'Product Analyst',
        tags: ['analysis', 'research', 'prioritization'],
        description: [
          '<p>Turns qualitative and quantitative feedback into roadmap inputs.</p>',
          '<ul>',
          '<li>Clusters themes and estimates impact.</li>',
          '<li>Highlights confidence and evidence level.</li>',
          '<li>Needs actionable recommendations per sprint.</li>',
          '</ul>',
        ].join(''),
      },
    ],
    prompts: [
      {
        title: 'Feedback Theme Clustering',
        category: 'Research',
        tags: ['feedback', 'themes', 'analysis'],
        content: [
          '<h3>Input</h3><p>Paste support notes and customer quotes.</p>',
          '<h3>Task</h3><p>Cluster by recurring pain point and frequency.</p>',
          '<h3>Output</h3><p>Theme, frequency, representative quote, severity.</p>',
        ].join(''),
      },
      {
        title: 'Retention Risk Snapshot',
        category: 'Research',
        tags: ['retention', 'risk', 'customer-success'],
        content: [
          '<h3>Goal</h3><p>Identify top churn-risk patterns from recent interactions.</p>',
          '<h3>Output</h3><p>Risk pattern, warning signal, owner, mitigation action.</p>',
        ].join(''),
      },
      {
        title: 'Insight to Roadmap Translation',
        category: 'Product',
        tags: ['prioritization', 'roadmap', 'insights'],
        content: [
          '<h3>Goal</h3><p>Convert customer insights into prioritized roadmap proposals.</p>',
          '<h3>Output</h3><p>Problem, impact, suggested fix, confidence, effort.</p>',
        ].join(''),
      },
    ],
  },
  {
    id: 'hiring-interview-kit',
    title: 'Hiring Interview Kit',
    subtitle: 'Standardize interview prep, scoring, and summaries',
    description:
      'Set up role personas and interview prompts to improve hiring consistency across screening, interviews, and debrief.',
    defaultCollectionName: 'Hiring Interview Kit',
    tags: ['hiring', 'interview', 'scorecard', 'talent'],
    structureSteps: [
      'Define role outcomes and candidate profile.',
      'Run structured interviews with consistent scorecards.',
      'Generate concise debrief and decision recommendation.',
    ],
    personas: [
      {
        name: 'Hiring Manager',
        tags: ['hiring', 'decision-making', 'scorecard'],
        description: [
          '<p>Owns final hiring decision and role success criteria.</p>',
          '<ul>',
          '<li>Needs evidence-based candidate comparisons.</li>',
          '<li>Prioritizes team fit and role-critical competencies.</li>',
          '<li>Wants structured and unbiased evaluations.</li>',
          '</ul>',
        ].join(''),
      },
      {
        name: 'Talent Partner',
        tags: ['recruiting', 'process', 'candidate-experience'],
        description: [
          '<p>Coordinates end-to-end hiring process and candidate communication.</p>',
          '<ul>',
          '<li>Tracks funnel quality and bottlenecks.</li>',
          '<li>Maintains interview consistency across interviewers.</li>',
          '<li>Ensures clean documentation for every stage.</li>',
          '</ul>',
        ].join(''),
      },
    ],
    prompts: [
      {
        title: 'Role Outcome Definition',
        category: 'Hiring',
        tags: ['hiring', 'role-design', 'planning'],
        content: [
          '<h3>Goal</h3><p>Define measurable outcomes for the role in the first 6 months.</p>',
          '<h3>Output</h3><p>Top outcomes, KPIs, collaboration map, risk factors.</p>',
        ].join(''),
      },
      {
        title: 'Structured Interview Questions',
        category: 'Hiring',
        tags: ['interview', 'question-bank', 'evaluation'],
        content: [
          '<h3>Goal</h3><p>Create behavioral and technical interview questions.</p>',
          '<h3>Output</h3><p>Question, competency tested, strong signal, weak signal.</p>',
        ].join(''),
      },
      {
        title: 'Interview Debrief Summary',
        category: 'Hiring',
        tags: ['debrief', 'scorecard', 'decision'],
        content: [
          '<h3>Goal</h3><p>Summarize panel feedback into a decision-ready debrief.</p>',
          '<h3>Output</h3><p>Score by competency, evidence notes, final recommendation.</p>',
        ].join(''),
      },
    ],
  },
];

export function getWorkflowPackById(packId) {
  return WORKFLOW_PACKS.find((pack) => pack.id === packId) || null;
}
