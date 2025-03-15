import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/toaster"
import { SocketProvider } from "@/lib/SocketContext";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Type Racer",
  description: "Race against others in this real-time typing challenge!",
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="description" content="Race against others in this real-time typing challenge! Improve your typing speed and accuracy while competing with players worldwide." />
          <meta name="keywords" content="typing game, speed typing, typing race, typing competition, typing practice" />

          {/* Open Graph / Facebook */}
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://usetyperacer.vercel.app/" />
          <meta property="og:title" content="Type Racer - Real-time Typing Competition" />
          <meta property="og:description" content="Race against others in this real-time typing challenge! Improve your typing speed and accuracy while competing with players worldwide." />
          <meta property="og:image" content="/checkered-racing-flag.jpg" />

          {/* Twitter */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:url" content="https://usetyperacer.vercel.app/" />
          <meta name="twitter:title" content="Type Racer - Real-time Typing Competition" />
          <meta name="twitter:description" content="Race against others in this real-time typing challenge! Improve your typing speed and accuracy while competing with players worldwide." />
          <meta name="twitter:image" content="/checkered-racing-flag.jpg" />

          {/* Favicon */}
          <link rel="icon" href="/checkered-racing-flag.jpg" />
          <meta name="theme-color" content="#ffffff" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SocketProvider>
          {children}
          <Toaster />
        </SocketProvider>
      </body>
    </html>
  );
}
