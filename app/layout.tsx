import type { Metadata } from "next";
import "./globals.css";
import "flag-icons/css/flag-icons.min.css";

export const metadata: Metadata = {
  title: "BTA Booking Board",
  description: "Tour booking management tool",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}