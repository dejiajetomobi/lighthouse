import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Last Light — a tiny lighthouse adventure",
  description: "A quiet place at the edge of the sea. Explore four illustrated rooms in a tiny lighthouse text adventure.",
};

export const viewport: Viewport = { themeColor: "#f4f1e9" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
