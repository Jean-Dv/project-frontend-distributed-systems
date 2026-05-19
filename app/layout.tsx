import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layouts/Header";
import Footer from "@/components/layouts/Footer";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Ledger - Distributed Systems",
  description: "Secure access to your legal archives.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es" className="light"
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-on-background min-h-screen flex flex-col">
        <Header />
        {children}
        <Footer />
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
