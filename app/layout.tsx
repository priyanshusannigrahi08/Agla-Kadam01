import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AglaKadam — Your next step starts with a conversation",
  description:
    "Connect with experienced mentors for career guidance, higher studies, career transitions, skills and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
