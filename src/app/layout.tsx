import type { Metadata } from "next";
import "./globals.css";

const title = "CrewForge — Build stronger teams together";
const description =
  "Discover teammates by complementary skills, understand team needs and build balanced teams with reliable membership rules.";

export const metadata: Metadata = {
  title,
  description,
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  alternates: { canonical: "/" },
  keywords: ["team formation", "skill matching", "team collaboration", "project teams", "teammates"],
  openGraph: {
    title,
    description,
    type: "website",
  },
  twitter: {
    card: "summary",
    title,
    description,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
