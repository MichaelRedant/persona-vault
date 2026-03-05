const STOPWORDS = new Set([
  'the',
  'and',
  'for',
  'with',
  'that',
  'this',
  'from',
  'your',
  'you',
  'are',
  'was',
  'were',
  'into',
  'about',
  'have',
  'has',
  'had',
  'their',
  'will',
  'can',
  'not',
  'but',
  'our',
  'out',
  'all',
  'per',
]);

const PERSONA_STRUCTURE_TEMPLATES = [
  {
    id: 'persona-goals',
    label: 'Goals + Pain Points + Triggers',
    keywords: ['goal', 'pain', 'trigger', 'audience', 'customer', 'persona'],
    html: [
      '<h3>Goals</h3><ul><li>[Primary goal]</li><li>[Secondary goal]</li></ul>',
      '<h3>Pain Points</h3><ul><li>[Pain point 1]</li><li>[Pain point 2]</li></ul>',
      '<h3>Decision Triggers</h3><ul><li>[Trigger 1]</li><li>[Trigger 2]</li></ul>',
    ].join(''),
  },
  {
    id: 'persona-context',
    label: 'Context + Tools + Constraints',
    keywords: ['operations', 'workflow', 'team', 'tools', 'constraints', 'process'],
    html: [
      '<h3>Context</h3><p>[Team, company stage, operating model]</p>',
      '<h3>Tools and Systems</h3><ul><li>[Tool 1]</li><li>[Tool 2]</li></ul>',
      '<h3>Constraints</h3><ul><li>[Constraint 1]</li><li>[Constraint 2]</li></ul>',
    ].join(''),
  },
  {
    id: 'persona-voice',
    label: 'Voice + Objections + Success Metrics',
    keywords: ['voice', 'tone', 'objection', 'buying', 'success', 'metric'],
    html: [
      '<h3>Voice and Tone</h3><p>[How this persona communicates]</p>',
      '<h3>Common Objections</h3><ul><li>[Objection 1]</li><li>[Objection 2]</li></ul>',
      '<h3>Success Metrics</h3><ul><li>[Metric 1]</li><li>[Metric 2]</li></ul>',
    ].join(''),
  },
];

const PROMPT_STRUCTURE_TEMPLATES = [
  {
    id: 'prompt-brief',
    label: 'Goal + Context + Constraints + Output',
    keywords: ['brief', 'launch', 'campaign', 'content', 'message'],
    html: [
      '<h3>Goal</h3><p>[What should be produced]</p>',
      '<h3>Context</h3><p>[Background and assumptions]</p>',
      '<h3>Constraints</h3><ul><li>[Constraint 1]</li><li>[Constraint 2]</li></ul>',
      '<h3>Output Format</h3><p>[Expected structure, tone, length]</p>',
    ].join(''),
  },
  {
    id: 'prompt-analysis',
    label: 'Input + Analysis + Recommendation',
    keywords: ['analysis', 'review', 'audit', 'insight', 'risk'],
    html: [
      '<h3>Input</h3><p>[Data, notes, or transcript]</p>',
      '<h3>Analysis Task</h3><p>[How to analyze the input]</p>',
      '<h3>Recommendation Format</h3><p>[Ranked actions with rationale]</p>',
    ].join(''),
  },
  {
    id: 'prompt-workflow',
    label: 'Steps + Validation + Next Actions',
    keywords: ['workflow', 'process', 'plan', 'execution', 'checklist'],
    html: [
      '<h3>Steps</h3><ol><li>[Step 1]</li><li>[Step 2]</li><li>[Step 3]</li></ol>',
      '<h3>Validation</h3><p>[How quality should be checked]</p>',
      '<h3>Next Actions</h3><p>[Immediate follow-up tasks]</p>',
    ].join(''),
  },
];

function normalizeTag(tag) {
  return String(tag || '').trim();
}

function parseTagsFromString(value) {
  return String(value || '')
    .split(',')
    .map((entry) => normalizeTag(entry))
    .filter((entry) => entry.length > 0);
}

function getTokenSet(text) {
  const normalized = String(text || '')
    .toLowerCase()
    .replace(/<[^>]+>/g, ' ')
    .replace(/[^a-z0-9\s-]/g, ' ');

  return new Set(
    normalized
      .split(/\s+/)
      .map((token) => token.trim())
      .filter((token) => token.length >= 3 && !STOPWORDS.has(token))
  );
}

function scoreKeywordMatch(tokens, phrase) {
  const normalizedPhrase = String(phrase || '').toLowerCase();
  if (!normalizedPhrase) {
    return 0;
  }

  const parts = normalizedPhrase
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return 0;
  }

  let score = 0;
  for (const part of parts) {
    if (tokens.has(part)) {
      score += 2;
      continue;
    }

    for (const token of tokens) {
      if (token.includes(part) || part.includes(token)) {
        score += 1;
        break;
      }
    }
  }

  return score;
}

export function mergeUniqueTags(...groups) {
  const dedup = new Map();

  groups.forEach((group) => {
    const values = Array.isArray(group) ? group : parseTagsFromString(group);
    values.forEach((rawTag) => {
      const clean = normalizeTag(rawTag);
      if (!clean) {
        return;
      }

      const key = clean.toLowerCase();
      if (!dedup.has(key)) {
        dedup.set(key, clean);
      }
    });
  });

  return Array.from(dedup.values());
}

export function buildWorkspaceTagPool(personas = [], prompts = [], limit = 12) {
  const counts = new Map();

  const entries = [...(Array.isArray(personas) ? personas : []), ...(Array.isArray(prompts) ? prompts : [])];

  entries.forEach((entry) => {
    const tags = Array.isArray(entry?.tags) ? entry.tags : parseTagsFromString(entry?.tags || '');
    tags.forEach((tag) => {
      const clean = normalizeTag(tag);
      if (!clean) {
        return;
      }

      const key = clean.toLowerCase();
      const current = counts.get(key);
      if (current) {
        current.count += 1;
      } else {
        counts.set(key, { label: clean, count: 1 });
      }
    });
  });

  return Array.from(counts.values())
    .sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }
      return a.label.localeCompare(b.label);
    })
    .slice(0, Math.max(1, limit))
    .map((entry) => entry.label);
}

export function suggestTagsFromContent({
  title = '',
  body = '',
  workspaceTags = [],
  seedTags = [],
  currentTags = [],
  max = 6,
}) {
  const activeMax = Math.max(1, max);
  const text = `${title} ${body}`;
  const tokens = getTokenSet(text);
  const existing = new Set(mergeUniqueTags(currentTags).map((tag) => tag.toLowerCase()));
  const candidates = mergeUniqueTags(seedTags, workspaceTags);

  const scored = candidates
    .map((candidate) => ({
      tag: candidate,
      score: scoreKeywordMatch(tokens, candidate),
    }))
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.tag.localeCompare(b.tag);
    });

  const suggested = scored
    .filter((entry) => entry.score > 0 && !existing.has(entry.tag.toLowerCase()))
    .slice(0, activeMax)
    .map((entry) => entry.tag);

  if (suggested.length >= activeMax) {
    return suggested;
  }

  const fallback = candidates.filter((candidate) => !existing.has(candidate.toLowerCase()));
  return mergeUniqueTags(suggested, fallback).slice(0, activeMax);
}

export function suggestStructureBlocks({ type = 'prompt', title = '', body = '' }) {
  const templates = type === 'persona' ? PERSONA_STRUCTURE_TEMPLATES : PROMPT_STRUCTURE_TEMPLATES;
  const tokens = getTokenSet(`${title} ${body}`);

  const scored = templates
    .map((template) => ({
      template,
      score: template.keywords.reduce((sum, keyword) => sum + scoreKeywordMatch(tokens, keyword), 0),
    }))
    .sort((a, b) => b.score - a.score);

  return scored
    .slice(0, 2)
    .map((entry) => ({
      id: entry.template.id,
      label: entry.template.label,
      html: entry.template.html,
    }));
}
