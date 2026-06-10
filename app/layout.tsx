import type { Metadata } from "next";
import { EB_Garamond, Fraunces, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
});

const garamond = EB_Garamond({
  variable: "--font-garamond",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "La Carte · Maison A.",
  description:
    "Une invitation à composer le rendez-vous idéal · mise en bouche, plat, dessert, et l'addition est déjà réglée.",
};

const themeInit = `try{var t=localStorage.getItem("carte-theme");if(t==="soir"||t==="jour")document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${fraunces.variable} ${garamond.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="grain min-h-full">
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        {children}
      </body>
    </html>
  );
}
