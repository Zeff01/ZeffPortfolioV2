import "./globals.css";
import { Inter } from "next/font/google";
import { Share_Tech } from "next/font/google";

const techFont = Share_Tech({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-tech",
});

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${techFont.variable}`}>
        {children}
      </body>
    </html>
  );
}