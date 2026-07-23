import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "OMR Evaluator",
    short_name: "OMR Evaluator",
    description: "Grade OMR answer sheets and track progress, entirely in your browser.",
    start_url: "/evaluate",
    display: "standalone",
    background_color: "#e8e9e2",
    theme_color: "#e8e9e2",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
