import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://agla-kadam.vercel.app"),
  title: {
    default: "AglaKadam — Find a mentor, book one call",
    template: "%s | AglaKadam",
  },
  description:
    "Agla kadam means 'next step' in Hindi. Find useful perspective from someone who has already navigated the kind of decision you are facing.",
  applicationName: "AglaKadam",
  keywords: [
    "career mentor",
    "career guidance",
    "mentorship",
    "career transition",
    "student mentor",
    "career advice",
    "AglaKadam",
  ],
  openGraph: {
    type: "website",
    url: "https://agla-kadam.vercel.app",
    siteName: "AglaKadam",
    title: "AglaKadam — Find a mentor, book one call",
    description:
      "Find someone who has already navigated the kind of decision you are facing, then have one focused conversation with them.",
  },
  twitter: {
    card: "summary",
    title: "AglaKadam — Find a mentor, book one call",
    description: "Find useful perspective when you are between chapters.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${inter.variable} ${jetbrainsMono.variable} font-body`}>
        {children}
      </body>
    </html>
  );
}
