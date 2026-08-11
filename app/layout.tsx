import type { Metadata, Viewport } from "next";
import { Inter, Anek_Malayalam } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const anekMalayalam = Anek_Malayalam({
  subsets: ["malayalam"],
  variable: "--font-anek",
  display: "swap",
});

// NEW: Viewport export for PWA mobile status bars
export const viewport: Viewport = {
  themeColor: "#0f172a", // Dark slate color for a premium feel
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://click-on-notify-quiz-app.vercel.app"),
  title: "Click on Notify Quiz App",
  description: "Click on Notify Mega Quiz Competition App",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Click on Notify",
  },
  openGraph: {
    title: "Click on Notify Quiz App",
    description: "Click on Notify Mega Quiz Competition App",
    url: "https://click-on-notify-quiz-app.vercel.app",
    siteName: "Click on Notify",
    images: [
      {
        url: "/clicknotifylogo.jpeg", // Using the correct logo for this project
        width: 512,
        height: 512,
        alt: "Click on Notify Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  applicationName: "Click on Notify",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${anekMalayalam.variable} font-anek antialiased min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}