import type {Metadata} from "next";
import {Inter} from "next/font/google";
import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import RainbowProvider from "./providers/rainbow-provider";
import {cn} from "@/lib/utils";
import {ThemeProvider} from "./providers/theme-providers";
import Navbar from "@/components/app-components/navbar";
import {GuestWalletProvider} from "./providers/guest-mode";
import {SocketProvider} from "./providers/socket-provider";

const inter = Inter({subsets: ["latin"], variable: "--font-sans"});

export const metadata: Metadata = {
  title: "Omegle",
  description: "Omegle using Push Protocol w2w calling",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <RainbowProvider>
            <SocketProvider>
              <GuestWalletProvider>
                <Navbar />
                {children}
              </GuestWalletProvider>
            </SocketProvider>
          </RainbowProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
