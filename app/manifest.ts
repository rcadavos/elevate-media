import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "elev8temedia workspace",
    short_name: "elev8",
    description:
      "Internal workspace for elev8temedia — clients, pipeline, finance, and operations.",
    start_url: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#fafafa",
    theme_color: "#7c3aed",
    icons: [
      {
        src: "/icons/pwa-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/pwa-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
