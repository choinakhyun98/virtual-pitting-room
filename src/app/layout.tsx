import type { Metadata } from "next";
import { Geist, Geist_Mono, Roboto } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: "가상 피팅룸",
  description: "간편하게 직접 입어보지 않고 고를 수 있도록 도와드리겠습니다.",
  verification: {
    google: "nRYw8EnECkgngEq83dfiuFqakKQM-A8rnhgmxN9CuPw", 
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${roboto.className} antialiased`}
      >
      <div className="page">
        <div className="page container">
          {children}
        </div>
      </div>
      </body>
    </html>
  );
}
