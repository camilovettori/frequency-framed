"use client";

import { useState } from "react";
import { addToCart } from "@/lib/cart";

type AddToCartButtonProps = {
  artwork: {
    slug: string;
    title: string;
    price: string;
    image: string;
  };
};

export default function AddToCartButton({
  artwork,
}: AddToCartButtonProps) {
  const [added, setAdded] = useState(false);

  function handleAddToCart() {
    const numericPrice = Number(artwork.price.replace(/[^\d.]/g, ""));

    const success = addToCart({
      id: artwork.slug,
      title: artwork.title,
      price: numericPrice,
      image: artwork.image,
    });

    if (success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  }

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      className={`inline-flex items-center justify-center px-7 py-4 text-sm uppercase tracking-[0.16em] transition-all duration-300 ${
        added
          ? "bg-green-700 text-white"
          : "bg-[var(--foreground)] text-white hover:opacity-90"
      }`}
    >
      {added ? "Added to Cart" : "Add to Cart"}
    </button>
  );
}