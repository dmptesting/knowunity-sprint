/*
 * The microphone permission, in three flavours.
 *
 * **Mocked is the default.** Nothing in this prototype records anything —
 * speech-to-text, the judge and the verdicts are all scripted — so firing a
 * real OS prompt spends a one-per-origin decision on a screen that does not
 * need it. Worse, it is remembered: one accidental "Block" and the reviewer is
 * routed into text mode for good, unable to reach the voice turn that is the
 * point of the whole thing. That is what happened.
 *
 * SPEC.md asks for the real prompt, and the Voice UX Reference's third
 * principle is why — whether students actually grant it is worth learning. So
 * the real call is kept and reachable, just not the default: `?mic=real`.
 *
 * `?mic=deny` makes the denied screen reviewable without digging through
 * browser settings to undo a block.
 *
 * Story tests need the seam too: they run in headless Chromium via Playwright,
 * where `getUserMedia` rejects outright or, more often, hangs waiting on a
 * prompt nobody can answer.
 */

/** What the browser said. Nothing here distinguishes *why* it was refused. */
export type MicPermission = 'granted' | 'denied';

/** The shape a screen asks for. Stub it in stories; never call it in a test. */
export type RequestMicrophone = () => Promise<MicPermission>;

/** Which implementation `?mic=` selects. */
export type MicMode = 'mock' | 'real' | 'deny';

export function readMicMode(value: string | null): MicMode {
  return value === 'real' || value === 'deny' ? value : 'mock';
}

/**
 * Fires the real OS permission prompt.
 *
 * Called only from a tap on "let's get started" — never on mount, never on
 * page load. You get one prompt per feature, and a request the student did not
 * ask for is the one most likely to be refused.
 *
 * The track is stopped the moment it is granted: this asks for permission, it
 * does not start recording. Recording is push-to-talk, and nothing here
 * listens until the student holds the button.
 */
export const requestMicrophone: RequestMicrophone = async () => {
  // Undefined on an insecure origin, and in any browser without the API.
  // Treated as a refusal, because the outcome for the student is the same:
  // no voice, so route them into text.
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    return 'denied';
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    for (const track of stream.getTracks()) track.stop();
    return 'granted';
  } catch {
    return 'denied';
  }
};

/**
 * The default. Grants immediately, with no prompt and no device access.
 *
 * There is no artificial delay: the OS prompt it stands in for is modal, and
 * pretending to be slow would only add a wait that teaches nobody anything.
 */
export const mockMicrophone: RequestMicrophone = async () => 'granted';

/** Always refuses, so the denied screen can be reviewed on demand. */
export const denyMicrophone: RequestMicrophone = async () => 'denied';

export function microphoneFor(mode: MicMode): RequestMicrophone {
  if (mode === 'real') return requestMicrophone;
  if (mode === 'deny') return denyMicrophone;
  return mockMicrophone;
}
