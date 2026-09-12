import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Knowunity — explain out loud",
  description:
    "Voice-based active recall: explain a concept out loud, Knowie judges in text.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
