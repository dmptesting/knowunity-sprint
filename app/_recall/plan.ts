/*
 * The study plan this recall step sits inside, as Figma screen 01 draws it.
 *
 * Existing shipped content, reproduced rather than invented — the recall step
 * is the new work; the path is where it is launched from and returned to.
 *
 * DRAFT COPY in the same sense as script.ts: the lesson titles are the beta's,
 * re-cased to the sentence case CLAUDE.md requires.
 */

import type { PathNodeFormat } from '../_components/pathNode/PathNode';

export type PlanStep = {
  id: string;
  label: string;
  format: PathNodeFormat;
};

/** Kept as Figma writes it: the name of a specific exam, so a proper noun. */
export const PLAN_TITLE = 'AP Cybersecurity Exam';
export const PLAN_MODE = 'Focus mode';
export const PLAN_META = '2 weeks · Grade goal: B';

/** The section the recall step belongs to. Matches script.ts's SECTION_TITLE. */
export const SECTION_STEPS: PlanStep[] = [
  { id: 'network-devices', label: 'Network devices', format: 'quiz' },
  { id: 'protocol-layers', label: 'Protocol layers', format: 'quiz' },
  { id: 'network-weaknesses', label: 'Network weaknesses', format: 'quiz' },
];

/** The node this whole prototype hangs off. Persistent, always reachable. */
export const EXPLAIN_STEP: PlanStep = {
  id: 'explain-out-loud',
  label: 'Explain out loud',
  format: 'explainOutLoud',
};

/** The next section, beneath the current one. */
export const NEXT_SECTION = 'Disruption and interception';

/**
 * The next section's steps, none started — the same shape as the section
 * above: three quizzes, then its own explain-out-loud. Invented for the
 * prototype; the beta's frame shows only the section's title.
 */
export const NEXT_SECTION_STEPS: PlanStep[] = [
  { id: 'packet-sniffing', label: 'Packet sniffing', format: 'quiz' },
  { id: 'denial-of-service', label: 'Denial of service', format: 'quiz' },
  { id: 'session-hijacking', label: 'Session hijacking', format: 'quiz' },
  { id: 'next-explain-out-loud', label: 'Explain out loud', format: 'explainOutLoud' },
];
