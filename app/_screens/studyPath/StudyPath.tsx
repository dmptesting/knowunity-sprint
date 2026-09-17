"use client";

import { Screen } from "../../_components/screen/Screen";
import {
  PathNode,
  type PathNodeProgress,
} from "../../_components/pathNode/PathNode";
import { Chips } from "../../_components/chips/Chips";
import { CalendarIcon, TargetIcon, TimerIcon } from "../../_components/icons/UiIcons";
import { SECTION_TITLE } from "../../_recall/script";
import {
  EXPLAIN_STEP,
  NEXT_SECTION,
  NEXT_SECTION_STEPS,
  SECTION_GROUP,
  PLAN_DEADLINE,
  PLAN_GRADE_GOAL,
  PLAN_MODE,
  PLAN_TITLE,
  SECTION_STEPS,
} from "../../_recall/plan";
import styles from "./StudyPath.module.css";

export type StudyPathProps = {
  /**
   * How far the three quizzes are. All done by default, so the recall node is
   * the one thing left in the section — it is reachable either way, which is
   * the point of it being persistent.
   */
  quizProgress?: PathNodeProgress[];
  /**
   * The recall node's own state. `completed` only once at least one question
   * has passed — sitting through four misses is not a completed node, and
   * marking it done would overstate what happened (SPEC.md).
   */
  explainProgress?: PathNodeProgress;
  /** Tapping the recall node. The prototype's one live control on this screen. */
  onExplain?: () => void;
};

/**
 * The study plan path — Figma screen 01, and the screen the recall step is
 * launched from and returned to.
 *
 * It already ships in the beta, so this is a reproduction, not new design.
 * It exists here because the prototype otherwise had no entry and no exit:
 * SPEC.md's out-of-scope note says the entry is **"node tap only"**, and the
 * node lives here.
 *
 * **Only the recall node does anything.** The tabs, the quizzes and the next
 * section are drawn because the frame draws them, but this prototype's scope
 * is the recall step — everything else is scenery.
 */
export function StudyPath({
  quizProgress = ["completed", "completed", "completed"],
  explainProgress = "current",
  onExplain,
}: StudyPathProps) {
  return (
    <Screen>
      <div className={styles.content}>
        {/*
          The beta's header: the focus-mode pill on the left, the plan's name
          centred under it, then how long the plan runs and the grade it is
          aimed at, each beside its own icon.
        */}
        <Chips
          className={styles.mode}
          size="S"
          Text={PLAN_MODE}
          showRightIcon={false}
          leftIcon={<TimerIcon size="var(--dimension-icon-200)" />}
        />

        <h1 className={styles.title}>{PLAN_TITLE}</h1>

        <p className={styles.meta}>
          <span className={styles.fact}>
            {/* Decorative: the words beside each icon already say what it is. */}
            <span className={styles.factIcon} aria-hidden="true">
              <CalendarIcon size="var(--dimension-icon-200)" />
            </span>
            {PLAN_DEADLINE}
          </span>
          <span className={styles.fact}>
            <span className={styles.factIcon} aria-hidden="true">
              <TargetIcon size="var(--dimension-icon-200)" />
            </span>
            {PLAN_GRADE_GOAL}
          </span>
        </p>

        {/*
          Figma draws the tabs as a single text node. They are scenery: this
          prototype has no Materials view, so rendering them as buttons would
          promise something that is not there.
        */}
        <p className={styles.tabs}>
          <span className={styles.tabActive}>Plan</span>
          <span className={styles.tab}>Materials</span>
        </p>

        <h2 className={styles.section}>{SECTION_TITLE}</h2>

        {/*
          Both sections' steps share one centred column, so every marker in
          both lines up; the divider heading between them spans the full row.
        */}
        <div className={styles.path}>
          {/*
            The section's own group heading, so the first four nodes are
            introduced the same way the next section's are, rather than
            starting straight under the title.
          */}
          <h3 className={styles.group}>{SECTION_GROUP}</h3>

          <ul className={styles.steps}>
            {SECTION_STEPS.map((step, i) => (
              <li key={step.id}>
                <PathNode
                  progress={quizProgress[i] ?? "upcoming"}
                  format={step.format}
                  label={step.label}
                />
              </li>
            ))}
            <li>
              <PathNode
                progress={explainProgress}
                format={EXPLAIN_STEP.format}
                label={EXPLAIN_STEP.label}
                onClick={onExplain}
              />
            </li>
          </ul>

          {/*
            The next section: its title centred between two rules, then its
            steps, none started. Scenery like the quizzes — nothing here opens.
          */}
          <h2 className={styles.nextSection}>{NEXT_SECTION}</h2>

          <ul className={styles.steps}>
            {NEXT_SECTION_STEPS.map((step) => (
              <li key={step.id}>
                <PathNode
                  progress="upcoming"
                  format={step.format}
                  label={step.label}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Screen>
  );
}
