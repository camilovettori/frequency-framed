import type { Metadata } from "next";
import GalleryPageClient from "./GalleryPageClient";

export const metadata: Metadata = {
  title: "Original Art Gallery | Oil Paintings for Sale Ireland",
  description:
    "Browse original oil paintings and abstract artworks. Unique pieces available for collectors in Ireland and international shipping.",
};

export default function GalleryPage() {
  return <GalleryPageClient />;
}