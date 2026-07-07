import type { Metadata } from "next";
import { Bricolage_Grotesque, Hanken_Grotesk } from "next/font/google";
// Import our new AuthProvider
import { AuthProvider } from "@/components/auth/auth-provider";
import "../globals.css";

export const metadata: Metadata = {
  title: "RamLink",
  description: "Campus club discovery and management for students and club officers.",
};

const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-hanken",
});

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-bricolage",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${hankenGrotesk.variable} ${bricolageGrotesque.variable} font-sans`}>
        {/* Wrap the children so every page has access to auth data! */}
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
