import type { Metadata } from "next";
import { EB_Garamond, Fraunces, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import BackgroundMusic from "@/components/BackgroundMusic";
import PwaRegister from "@/components/PwaRegister";

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
  metadataBase: new URL("https://la-carte.beloucif.com"),
  title: "La Carte · Maison A.",
  description:
    "Une invitation à composer le rendez-vous idéal · mise en bouche, plat, dessert, et l'addition est déjà réglée.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "La Carte",
  },
  openGraph: {
    title: "La Carte · Maison A.",
    description:
      "Composez votre menu, indiquez vos disponibilités, demandez l'addition. Total : 0,00 €, réglé d'avance par la maison.",
    url: "https://la-carte.beloucif.com",
    siteName: "La Carte · Maison A.",
    locale: "fr_FR",
    type: "website",
  },
};

// Choix manuel prioritaire · sinon le thème suit le service en cours (soir dès 19 h, jour dès 7 h)
const themeInit = `try{var t=localStorage.getItem("carte-theme");if(t!=="soir"&&t!=="jour"){var h=new Date().getHours();t=(h>=19||h<7)?"soir":"jour"}document.documentElement.dataset.theme=t}catch(e){}`;

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
        <BackgroundMusic />
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
