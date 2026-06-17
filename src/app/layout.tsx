import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import CanvasBackground from "@/components/CanvasBackground";
import Navigation from "@/components/Navigation";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Prithvi - Personal Ecosystem",
  description: "High-end cinematic personal ecosystem.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased relative min-h-screen bg-[#050505] text-white`}
      >
        <div className="fixed inset-0 z-0 pointer-events-none">
          <CanvasBackground />
        </div>
        <Navigation />
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
