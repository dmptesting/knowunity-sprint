import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Knowunity — talk it through",
  description:
    "Voice-based active recall: explain a concept out loud, Knowie judges in text.",
};

/*
 * `interactiveWidget: 'resizes-content'` — without it, iOS Safari's keyboard
 * covers the layout instead of shrinking it: the visual viewport shrinks but
 * the layout viewport (what `100dvh` and this app's flex column measure)
 * doesn't, so the browser scrolls the focused input into view by pushing the
 * whole page up, carrying `knowieSays` (the mascot and his bubble) off the
 * top. `resizes-content` makes the layout viewport itself shrink to the space
 * above the keyboard, so `Screen`'s pinned top/bottom regions and scrolling
 * middle stay correct and everything above `chatInput` stays visible.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  interactiveWidget: "resizes-content",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
