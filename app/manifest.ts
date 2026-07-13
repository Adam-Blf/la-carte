import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "La Carte · Maison A.",
    short_name: "La Carte",
    description:
      "Composez votre soirée idéale · mise en bouche, plat, dessert. La maison s'occupe du reste.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a1422",
    theme_color: "#0a1422",
    orientation: "portrait",
    lang: "fr",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
