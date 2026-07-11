import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nova AI — Your Intelligent Conversational Companion",
  description:
    "Nova AI is a next-generation AI assistant platform. Chat with advanced AI models, manage conversations, upload files, and personalize your experience with a premium glassmorphism interface.",
  keywords: [
    "Nova AI",
    "AI assistant",
    "AI chat",
    "ChatGPT alternative",
    "Gemini",
    "GLM",
    "conversational AI",
    "AI platform",
  ],
  authors: [{ name: "Nova AI Team" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Nova AI — Your Intelligent Conversational Companion",
    description:
      "Chat with advanced AI models through a modern, premium conversational interface. Streaming responses, file uploads, and full conversation history.",
    url: "https://nova.ai",
    siteName: "Nova AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nova AI — Your Intelligent Conversational Companion",
    description:
      "A next-generation AI assistant platform with streaming responses and a premium glassmorphism UI.",
  },
  metadataBase: new URL("https://nova.ai"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <SonnerToaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
