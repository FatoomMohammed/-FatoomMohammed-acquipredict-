// riskEngine.js — direct JS port of model.py's formula, corrected to match
// app.py's enrich(): document completeness now actually affects risk, and
// the recommendations engine is included.

const STAGE_EFFECT = {
  'Planning': 0, 'Notification': 5, 'Land Verification': 10,
  'Compensation Processing': 15, 'R&R Processing': 12, 'Legal Review': 18,
  'Acquisition': 12, 'Award / Possession': 8, 'Acquisition Complete': -8,
};

const FEATURE_LABELS = {
  approval_delay_days: 'Pending approvals',
  compensation_pct: 'Low compensation completion',
  legal_disputes: 'Legal disputes',
  land_dispute_flag: 'Ownership / land dispute',
  rr_completion_pct: 'Incomplete R&R',
  avg_response_days: 'Slow departmental response',
  land_area_acres: 'Large acquisition area',
  affected_families: 'Large affected population',
  missing_document_count: 'Missing documents',
};

const DOCS = [
  ['ownership_doc', 'Ownership document'],
  ['land_record', 'Land record'],
  ['compensation_doc', 'Compensation document'],
  ['approval_doc', 'Approval document'],
  ['notification_doc', 'Notification document'],
];

const MAX_DAYS = 180;

/** Document completeness - mirrors app.py's enrich(). */
export function docCompleteness(project) {
  const missingDocs = DOCS.filter(([key]) => !project[key]).map(([, label]) => label);
  const docCompletePct = Math.round((1000 * (DOCS.length - missingDocs.length)) / DOCS.length) / 10;
  return { missingDocs, docCompletePct, missingDocumentCount: missingDocs.length };
}

/** Recommendations - mirrors app.py's enrich() action list. */
export function recommendations(project, missingDocs) {
  const actions = [];
  if (missingDocs.length) {
    actions.push('Complete missing documents: ' + missingDocs.slice(0, 2).join(', '));
  }
  if ((project.legal_disputes || 0) > 0 || project.land_dispute_flag) {
    actions.push('Prioritize ownership and legal verification');
  }
  if ((project.compensation_pct || 0) < 70) {
    actions.push('Review pending compensation cases');
  }
  if ((project.approval_delay_days || 0) > 30) {
    actions.push('Escalate pending approvals');
  }
  if ((project.rr_completion_pct || 0) < 60) {
    actions.push('Review R&R progress and pending cases');
  }
  if (!actions.length) actions.push('Continue routine monitoring');
  return actions.slice(0, 4);
}

export function predictRisk(project) {
  // Document completeness now correctly feeds into the score.
  const { missingDocs, docCompletePct, missingDocumentCount } = docCompleteness(project);

  const stage = project.acquisition_stage || 'Planning';
  const stageEffect = STAGE_EFFECT[stage] ?? 0;
  const rrGap = 100 - (project.rr_completion_pct || 0);

  const days =
    0.75 * (project.approval_delay_days || 0) +
    1.35 * (project.legal_disputes || 0) * 30 +
    42 * (project.land_dispute_flag ? 1 : 0) +
    -0.55 * (project.compensation_pct || 0) +
    -0.45 * (project.rr_completion_pct || 0) +
    1.1 * (project.avg_response_days || 0) +
    0.018 * (project.affected_families || 0) +
    14 * missingDocumentCount +
    stageEffect;

  const predictedDays = Math.max(0, Math.round(days * 10) / 10);
  const risk = Math.max(0, Math.min(100, Math.round((predictedDays / MAX_DAYS) * 1000) / 10));
  const level = risk >= 66 ? 'High' : risk >= 33 ? 'Medium' : 'Low';

  const signals = {
    approval_delay_days: Math.max(0, project.approval_delay_days || 0),
    compensation_pct: Math.max(0, 100 - (project.compensation_pct || 0)),
    legal_disputes: Math.max(0, (project.legal_disputes || 0) * 30),
    land_dispute_flag: (project.land_dispute_flag ? 1 : 0) * 60,
    rr_completion_pct: Math.max(0, rrGap),
    avg_response_days: Math.max(0, project.avg_response_days || 0),
    affected_families: Math.max(0, project.affected_families || 0),
    missing_document_count: Math.max(0, missingDocumentCount * 25),
  };
  const topDrivers = Object.entries(signals)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([k]) => FEATURE_LABELS[k]);

  const actions = recommendations(project, missingDocs);

  return {
    risk,
    level,
    predicted_delay_days: predictedDays,
    top_drivers: topDrivers.length ? topDrivers : ['No major risk signal detected'],
    missing_docs: missingDocs,
    doc_complete_pct: docCompletePct,
    recommendations: actions,
    alert: level === 'High',
  };
}

// --- Legal-risk NLP signal (new vs original prototype, matches PPT's /legal-risk) ---
const HIGH_TERMS = ['stay order', 'injunction', 'high court', 'supreme court', 'writ petition',
  'litigation', 'encroachment dispute', 'title dispute', 'ownership dispute',
  'compensation withheld', 'possession denied', 'appeal filed'];
const MED_TERMS = ['objection', 'grievance', 'delay', 'pending hearing', 'notice issued',
  'compensation delay', 'survey dispute', 'boundary dispute'];
const RESOLVED_TERMS = ['resolved', 'withdrawn', 'settled', 'dismissed',
  'compensation disbursed', 'possession granted'];

export function analyzeLegalText(text) {
  const t = (text || '').toLowerCase();
  const high = HIGH_TERMS.filter((term) => t.includes(term));
  const med = MED_TERMS.filter((term) => t.includes(term));
  const resolved = RESOLVED_TERMS.filter((term) => t.includes(term));
  let score = Math.min(100, high.length * 25 + med.length * 10);
  score = Math.max(0, score - resolved.length * 20);
  const level = score >= 60 ? 'High' : score >= 25 ? 'Medium' : 'Low';
  return { legal_risk_score: score, legal_risk_level: level, matched_high_severity: high, matched_medium_severity: med, matched_resolution_terms: resolved };
}
