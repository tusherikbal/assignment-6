import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import "./globals.css";
import { FitLogProvider } from "@/context/FitlogContext";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-oswald",
});

// export const metadata: Metadata = {
//   title: "FitLog — Workout Library",
//   description:
//     "FitLog is a dark, no-nonsense gym companion: pick a lift, lock it into today's plan, and watch the week's work add up.",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${oswald.variable}`} suppressHydrationWarning>
     <body className="min-h-screen flex flex-col bg-[#0a0a0a] text-white font-sans antialiased" suppressHydrationWarning>
  <FitLogProvider>
  <Navbar />
  <main className="flex-1">{children}</main>
  <Footer />

  </FitLogProvider>
</body>
    </html>
  );
}