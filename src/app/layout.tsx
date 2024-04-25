import { Toaster } from "react-hot-toast";

import { type Metadata, type Viewport } from "next";
import { Inter } from "next/font/google";

import Providers from "./providers";

import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Chatbot UI",
  description: "ChatGPT but better.",
};

export const viewport: Viewport = {
  height: "device-height",
  width: "device-width",
  initialScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <html>
        <body className={inter.className}>
          {children}
          <Toaster />
        </body>
      </html>
    </Providers>
  );
}
