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
/** The two meta facts, each beside its own icon in the header. */
export const PLAN_DEADLINE = '2 weeks';
export const PLAN_GRADE_GOAL = 'Grade goal: B';

/** The section the recall step belongs to. Matches script.ts's SECTION_TITLE. */
export const SECTION_STEPS: PlanStep[] = [
  { id: 'network-devices', label: 'Network devices', format: 'quiz' },
  { id: 'protocol-layers', label: 'Protocol layers', format: 'quiz' },
  { id: 'network-weaknesses', label: 'Network weaknesses', format: 'quiz' },
];

/** The node this whole prototype hangs off. Persistent, always reachable. */
export const EXPLAIN_STEP: PlanStep = {
  id: 'talk-it-through',
  label: 'Talk it through',
  format: 'explainOutLoud',
};

/**
 * The group of lessons the section opens with — the divider above the first
 * four nodes, the same treatment `NEXT_SECTION` gets below them. New copy for
 * this prototype: the beta names this group only in its section card, and
 * repeating "Network Basics" under itself would say nothing, so this names
 * what the four nodes actually cover.
 */
export const SECTION_GROUP = 'Devices and protocols';

/** The next section, beneath the current one. */
export const NEXT_SECTION = 'Disruption and interception';

/**
 * The next section's steps, none started — the same shape as the section
 * above: three quizzes, then its own talk-it-through. Invented for the
 * prototype; the beta's frame shows only the section's title.
 */
export const NEXT_SECTION_STEPS: PlanStep[] = [
  { id: 'packet-sniffing', label: 'Packet sniffing', format: 'quiz' },
  { id: 'denial-of-service', label: 'Denial of service', format: 'quiz' },
  { id: 'session-hijacking', label: 'Session hijacking', format: 'quiz' },
  { id: 'next-talk-it-through', label: 'Talk it through', format: 'explainOutLoud' },
];
