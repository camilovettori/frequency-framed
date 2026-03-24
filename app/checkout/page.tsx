"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import Container from "@/components/ui/container";
import { CartItem, getCart, getCartTotal } from "@/lib/cart";

type CheckoutForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  county: string;
  postalCode: string;
  country: string;
};

const initialForm: CheckoutForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  county: "",
  postalCode: "",
  country: "Ireland",
};

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [form, setForm] = useState<CheckoutForm>(initialForm);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setCart(getCart());
  }, []);

  const subtotal = useMemo(() => getCartTotal(cart), [cart]);
  const shipping = useMemo(() => 0, []);
  const total = subtotal + shipping;

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (cart.length === 0) {
      setMessage("Your cart is empty.");
      return;
    }

    setMessage(
      "Checkout UI is ready. Next step: connect Stripe Payment Element and Express Checkout."
    );
  }

  if (cart.length === 0) {
    return (
      <main className="pt-20 md:pt-24 pb-24 md:pb-32">
        <Container>
          <section className="max-w-4xl">
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
              Checkout
            </p>

            <h1 className="mt-6 text-5xl md:text-7xl leading-[0.95] tracking-[-0.03em] text-[var(--foreground)]">
              Your cart is empty
            </h1>

            <p className="mt-8 max-w-2xl text-[20px] md:text-[22px] leading-[1.5] text-[var(--muted)]">
              Add an artwork before proceeding to checkout.
            </p>

            <div className="mt-10">
              <Link
                href="/gallery"
                className="inline-flex items-center justify-center px-7 py-4 bg-[var(--foreground)] text-white text-sm uppercase tracking-[0.16em] transition-all duration-300 hover:opacity-90"
              >
                View Gallery
              </Link>
            </div>
          </section>
        </Container>
      </main>
    );
  }

  return (
    <main className="pt-20 md:pt-24 pb-24 md:pb-32">
      <Container>
        <section className="max-w-4xl">
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
            Checkout
          </p>

          <h1 className="mt-6 text-5xl md:text-7xl leading-[0.95] tracking-[-0.03em] text-[var(--foreground)]">
            Delivery & Payment
          </h1>

          <p className="mt-8 max-w-3xl text-[20px] md:text-[22px] leading-[1.5] text-[var(--muted)]">
            Complete your details below to prepare your order. Payment
            integration with Stripe will be connected in the next step.
          </p>
        </section>

        <section className="mt-16 grid lg:grid-cols-[1fr_380px] gap-10 md:gap-14 items-start">
          {/* FORM */}
          <div className="border border-[var(--border)] bg-[var(--surface)] p-8 md:p-10 shadow-[0_12px_35px_rgba(0,0,0,0.04)]">
            <form onSubmit={handleSubmit} className="space-y-10">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
                  Customer Information
                </p>

                <div className="mt-6 grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                      First Name
                    </label>
                    <input
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      required
                      className="mt-3 w-full border border-[var(--border)] bg-white px-5 py-4 outline-none transition-all duration-300 focus:border-[var(--foreground)] focus:shadow-[0_0_0_1px_var(--foreground)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                      Last Name
                    </label>
                    <input
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                      required
                      className="mt-3 w-full border border-[var(--border)] bg-white px-5 py-4 outline-none transition-all duration-300 focus:border-[var(--foreground)] focus:shadow-[0_0_0_1px_var(--foreground)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                      Email
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className="mt-3 w-full border border-[var(--border)] bg-white px-5 py-4 outline-none transition-all duration-300 focus:border-[var(--foreground)] focus:shadow-[0_0_0_1px_var(--foreground)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                      Phone
                    </label>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      className="mt-3 w-full border border-[var(--border)] bg-white px-5 py-4 outline-none transition-all duration-300 focus:border-[var(--foreground)] focus:shadow-[0_0_0_1px_var(--foreground)]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
                  Delivery Address
                </p>

                <div className="mt-6 grid gap-5">
                  <div>
                    <label className="block text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                      Address Line 1
                    </label>
                    <input
                      name="addressLine1"
                      value={form.addressLine1}
                      onChange={handleChange}
                      required
                      className="mt-3 w-full border border-[var(--border)] bg-white px-5 py-4 outline-none transition-all duration-300 focus:border-[var(--foreground)] focus:shadow-[0_0_0_1px_var(--foreground)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                      Address Line 2
                    </label>
                    <input
                      name="addressLine2"
                      value={form.addressLine2}
                      onChange={handleChange}
                      className="mt-3 w-full border border-[var(--border)] bg-white px-5 py-4 outline-none transition-all duration-300 focus:border-[var(--foreground)] focus:shadow-[0_0_0_1px_var(--foreground)]"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                        City
                      </label>
                      <input
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        required
                        className="mt-3 w-full border border-[var(--border)] bg-white px-5 py-4 outline-none transition-all duration-300 focus:border-[var(--foreground)] focus:shadow-[0_0_0_1px_var(--foreground)]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                        County / State
                      </label>
                      <input
                        name="county"
                        value={form.county}
                        onChange={handleChange}
                        className="mt-3 w-full border border-[var(--border)] bg-white px-5 py-4 outline-none transition-all duration-300 focus:border-[var(--foreground)] focus:shadow-[0_0_0_1px_var(--foreground)]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                        Postal Code
                      </label>
                      <input
                        name="postalCode"
                        value={form.postalCode}
                        onChange={handleChange}
                        required
                        className="mt-3 w-full border border-[var(--border)] bg-white px-5 py-4 outline-none transition-all duration-300 focus:border-[var(--foreground)] focus:shadow-[0_0_0_1px_var(--foreground)]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                        Country
                      </label>
                      <select
                        name="country"
                        value={form.country}
                        onChange={handleChange}
                        className="mt-3 w-full border border-[var(--border)] bg-white px-5 py-4 outline-none transition-all duration-300 focus:border-[var(--foreground)] focus:shadow-[0_0_0_1px_var(--foreground)]"
                      >
                        <option>Ireland</option>
                        <option>United Kingdom</option>
                        <option>Portugal</option>
                        <option>Brazil</option>
                        <option>Spain</option>
                        <option>France</option>
                        <option>Germany</option>
                        <option>Italy</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
                  Payment
                </p>

                <div className="mt-6 border border-dashed border-[var(--border)] bg-white px-5 py-6 text-[var(--muted)]">
                  Stripe Payment Element and Express Checkout Element will be
                  connected here next.
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center px-7 py-4 bg-[var(--foreground)] text-white text-sm uppercase tracking-[0.16em] transition-all duration-300 hover:opacity-90"
                >
                  Continue to Payment
                </button>

                {message && (
                  <div className="border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--foreground)]">
                    {message}
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* SUMMARY */}
          <aside className="border border-[var(--border)] bg-[var(--surface)] p-8 md:p-10">
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
              Order Summary
            </p>

            <div className="mt-6 space-y-5">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-[72px_1fr_auto] gap-4 items-center"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-white">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="72px"
                      className="object-contain p-2"
                    />
                  </div>

                  <div>
                    <p className="text-base text-[var(--foreground)]">
                      {item.title}
                    </p>
                  </div>

                  <p className="text-sm text-[var(--foreground)]">
                    €{item.price.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 space-y-4 border-t border-[var(--border)] pt-6">
              <div className="flex items-center justify-between text-[16px] text-[var(--muted)]">
                <span>Subtotal</span>
                <span>€{subtotal.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between text-[16px] text-[var(--muted)]">
                <span>Shipping</span>
                <span>
                  {shipping === 0 ? "Calculated later" : `€${shipping.toFixed(2)}`}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xl text-[var(--foreground)]">Total</span>
                <span className="text-2xl font-medium text-[var(--foreground)]">
                  €{total.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="mt-8">
              <Link
                href="/cart"
                className="text-xs uppercase tracking-[0.2em] text-[var(--muted)] transition hover:text-[var(--foreground)]"
              >
                Back to Cart
              </Link>
            </div>
          </aside>
        </section>
      </Container>
    </main>
  );
}