import { Suspense } from 'react';
import { RecallSession } from './_recall/RecallSession';

/**
 * The recall step.
 *
 * `RecallSession` reads `?verdict=` with `useSearchParams`, which forces
 * client rendering up to the nearest Suspense boundary — without this one,
 * `next build` fails during prerender (SPEC.md, Step 0b). The boundary lives
 * here, in the server page, so the shell around it can still be prerendered.
 */
export default function Page() {
  return (
    <Suspense fallback={null}>
      <RecallSession />
    </Suspense>
  );
}
