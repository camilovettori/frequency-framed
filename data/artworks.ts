export type Artwork = {
  slug: string;
  title: string;
  image: string;
  price: string;
  status: "Available" | "Sold" | "Reserved";
  category: "Numerology" | "Nature" | "Cosmic & Spiritual" | "Symbols";
  description: string;
};

export const artworks: Artwork[] = [
  {
    slug: "222-energy",
    title: "222 Energy",
    image: "/images/art-1.jpg",
    price: "€450",
    status: "Available",
    category: "Numerology",
    description:
      "A symbolic piece centered around the powerful number 777, representing alignment, intuition, and spiritual awakening. The composition blends depth and contrast to create a sense of inner clarity and elevated energy.",
  },
  {
    slug: "golden-path",
    title: "Golden Path",
    image: "/images/art-2.jpg",
    price: "€520",
    status: "Available",
    category: "Cosmic & Spiritual",
    description:
      "An exploration of direction and purpose, this artwork reflects the journey of following one's inner path. Golden tones represent clarity, growth, and alignment with higher intention.",
  },
  {
    slug: "cosmic-balance",
    title: "Cosmic Balance",
    image: "/images/art-3.jpg",
    price: "€390",
    status: "Sold",
    category: "Symbols",
    description:
      "A visual interpretation of balance between opposing forces. This piece combines symbolic elements to represent harmony between light and shadow, material and spiritual dimensions.",
  },
  {
    slug: "tree-of-light",
    title: "Tree of Light",
    image: "/images/art-4.jpg",
    price: "€480",
    status: "Available",
    category: "Nature",
    description:
      "A symbolic tree representing growth, grounding, and expansion. The artwork connects natural elements with inner evolution, inviting reflection and presence.",
  },
  {
    slug: "sacred-number",
    title: "Sacred Number",
    image: "/images/art-5.jpg",
    price: "€610",
    status: "Reserved",
    category: "Numerology",
    description:
      "This piece explores the meaning behind sacred numerical patterns, translating abstract concepts into visual form with depth, texture, and symbolic composition.",
  },
  {
    slug: "moon-symbol",
    title: "Moon Symbol",
    image: "/images/art-6.jpg",
    price: "€430",
    status: "Available",
    category: "Symbols",
    description:
      "Inspired by lunar cycles and intuition, this artwork reflects inner rhythms, emotional depth, and the unseen forces that guide human experience.",
  },
];