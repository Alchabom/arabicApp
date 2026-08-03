import { Inter, EB_Garamond, Amiri, IBM_Plex_Mono } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
});
const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-arabic",
});
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
});

export const metadata = {
  title: "Alim: Learn the Arabic Alphabet",
  description:
    "Trace, flip, and quiz your way through the Arabic alphabet, stroke by stroke.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={cn(
        "font-sans",
        inter.variable,
        ebGaramond.variable,
        amiri.variable,
        plexMono.variable
      )}
    >
      <body>{children}</body>
    </html>
  );
}
