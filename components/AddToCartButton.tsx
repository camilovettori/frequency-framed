"use client";

import { useRouter } from "next/navigation";
import { addToCart } from "@/lib/cart";

type AddToCartButtonProps = {
  artwork: {
    id: string;
    title: string;
    price: number;
    image: string;
  };
};

export default function AddToCartButton({ artwork }: AddToCartButtonProps) {
  const router = useRouter();

  function handleAddToCart() {
    addToCart(artwork);
    router.push("/cart");
  }

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      className="inline-flex items-center justify-center px-7 py-4 bg-[var(--foreground)] text-white text-sm uppercase tracking-[0.16em] transition-all duration-300 hover:opacity-90"
    >
      Add to Cart
    </button>
  );
}