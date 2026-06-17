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
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased relative min-h-screen bg-black text-white`}
      >
        <div className="fixed top-0 left-0 w-full h-full z-[-1] pointer-events-auto">
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
