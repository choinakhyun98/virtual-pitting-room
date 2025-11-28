import type { Metadata } from "next";
import { Geist, Geist_Mono, Roboto } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: "가상 피팅룸",
  description: "간편하게 직접 입어보지 않고 고를 수 있도록 도와드리겠습니다.",
  keywords:['fitting room','피팅룸','가상피팅','가상피팅룸','virtual fitting room','virtual fitting'],
  metadataBase: new URL("https://my-fitting-room.vercel.app"),
  openGraph:{
    title: "가상 피팅룸",
    siteName: '가상 피팅룸',
    description: "간편하게 직접 입어보지 않고 고를 수 있도록 도와드리겠습니다.",
    url: "https://my-fitting-room.vercel.app",
    images:{
      url:"/icon.png",
      width: 512,
      height: 512
    },
  },
  icons:{
    icon: "/icon.png"
  },
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "가상 피팅룸",
              url: "https://my-fitting-room.vercel.app",
              publisher: {
                "@type": "Organization",
                name: "가상 피팅룸",
                logo: {
                  "@type": "ImageObject",
                  url: "https://my-fitting-room-vercel.app/icon.png", 
                  width: 512,
                  height: 512,
                },
              },
            }),
          }}
        />
      </head>
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
