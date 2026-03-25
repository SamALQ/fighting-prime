import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { OrganizationJSONLD } from "@/components/seo/json-ld";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth-context";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Fighting Prime Academy | Train Like a Pro",
    template: "%s | Fighting Prime Academy",
  },
  description: "Elite Muay Thai courses led by ONE Championship athlete Jake Peacock. Learn the system. Earn your prime.",
  keywords: ["Muay Thai", "Martial Arts", "Online Training", "ONE Championship", "Jake Peacock"],
  authors: [{ name: "Fighting Prime Academy" }],
  openGraph: {
    title: "Fighting Prime Academy | Train Like a Pro",
    description: "Elite Muay Thai courses led by ONE Championship athlete Jake Peacock.",
    type: "website",
    siteName: "Fighting Prime Academy",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fighting Prime Academy | Train Like a Pro",
    description: "Elite Muay Thai courses led by ONE Championship athlete Jake Peacock.",
  },
  metadataBase: new URL("https://fightingprime.com"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#D71212" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js')})}`,
          }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <OrganizationJSONLD />
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
