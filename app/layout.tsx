import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "AI Corpus — Knowledge Layer for the AI Age",
  description: "Write once. Stored on-chain. Consumed by humans and AI agents alike. The decentralized knowledge marketplace built on Shelby.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full text-[#f8f8ff]">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
