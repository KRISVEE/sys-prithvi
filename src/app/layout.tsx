import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import CanvasBackground from "@/components/CanvasBackground";
import Navigation from "@/components/Navigation";
import LiveTelemetry from "@/components/LiveTelemetry";
import Comms from "@/components/Comms";

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
        <LiveTelemetry />
        <Comms />
        <main className="relative z-10 p-6 md:p-12 lg:p-24 min-h-screen flex flex-col max-w-7xl mx-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
