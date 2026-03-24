"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Container from "@/components/ui/container";
import { CartItem, getCart, getCartTotal, removeFromCart } from "@/lib/cart";

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    setCart(getCart());
  }, []);

  function handleRemove(id: string) {
    const updated = removeFromCart(id);
    setCart(updated);
  }

  const total = useMemo(() => getCartTotal(cart), [cart]);

  return (
    <main className="pt-20 md:pt-24 pb-24 md:pb-32">
      <Container>
        <section className="max-w-4xl">
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
            Basket
          </p>

          <h1 className="mt-6 text-5xl md:text-7xl leading-[0.95] tracking-[-0.03em] text-[var(--foreground)]">
            Your Cart
          </h1>

          <p className="mt-8 max-w-3xl text-[20px] md:text-[22px] leading-[1.5] text-[var(--muted)]">
            Review your selected artwork before proceeding to checkout.
          </p>
        </section>

        {cart.length === 0 ? (
          <section className="mt-16 border border-[var(--border)] bg-[var(--surface)] p-8 md:p-10">
            <h2 className="text-2xl md:text-3xl text-[var(--foreground)]">
              Your cart is empty
            </h2>

            <p className="mt-4 max-w-2xl text-[18px] md:text-[20px] leading-[1.6] text-[var(--muted)]">
              Explore the gallery and add a piece to continue.
            </p>

            <div className="mt-8">
              <Link
                href="/gallery"
                className="inline-flex items-center justify-center px-7 py-4 bg-[var(--foreground)] text-white text-sm uppercase tracking-[0.16em] transition-all duration-300 hover:opacity-90"
              >
                View Gallery
              </Link>
            </div>
          </section>
        ) : (
          <section className="mt-16 grid lg:grid-cols-[1fr_360px] gap-10 md:gap-14 items-start">
            <div className="space-y-6">
              {cart.map((item) => (
                <article
                  key={item.id}
                  className="grid grid-cols-[120px_1fr] md:grid-cols-[160px_1fr_auto] gap-5 border border-[var(--border)] bg-[var(--surface)] p-5 md:p-6 items-center"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-white">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="160px"
                      className="object-contain p-3"
                    />
                  </div>

                  <div>
                    <h2 className="text-2xl md:text-3xl leading-tight text-[var(--foreground)]">
                      {item.title}
                    </h2>

                    <p className="mt-3 text-lg text-[var(--foreground)]">
                      €{item.price.toFixed(2)}
                    </p>
                  </div>

                  <div className="md:text-right">
                    <button
                      type="button"
                      onClick={() => handleRemove(item.id)}
                      className="text-xs uppercase tracking-[0.18em] text-[var(--muted)] transition hover:text-[var(--foreground)]"
                    >
                      Remove
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <aside className="border border-[var(--border)] bg-[var(--surface)] p-8 md:p-10">
              <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
                Summary
              </p>

              <div className="mt-6 space-y-4 border-b border-[var(--border)] pb-6">
                <div className="flex items-center justify-between text-[18px] text-[var(--muted)]">
                  <span>Items</span>
                  <span>{cart.length}</span>
                </div>

                <div className="flex items-center justify-between text-[18px] text-[var(--muted)]">
                  <span>Subtotal</span>
                  <span>€{total.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <span className="text-xl md:text-2xl text-[var(--foreground)]">
                  Total
                </span>

                <span className="text-2xl md:text-3xl font-medium text-[var(--foreground)]">
                  €{total.toFixed(2)}
                </span>
              </div>

              <div className="mt-8 flex flex-col gap-4">
                <Link
                  href="/checkout"
                  className="inline-flex items-center justify-center px-7 py-4 bg-[var(--foreground)] text-white text-sm uppercase tracking-[0.16em] transition-all duration-300 hover:opacity-90"
                >
                  Proceed to Checkout
                </Link>

                <Link
                  href="/gallery"
                  className="inline-flex items-center justify-center px-7 py-4 border border-[var(--foreground)] text-sm uppercase tracking-[0.16em] text-[var(--foreground)] transition-all duration-300 hover:bg-[var(--foreground)] hover:text-white"
                >
                  Continue Shopping
                </Link>
              </div>
            </aside>
          </section>
        )}
      </Container>
    </main>
  );
}