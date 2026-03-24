import Container from "@/components/ui/container";
import ClearCartOnSuccess from "@/components/ClearCartOnSuccess";

export default function SuccessPage() {
  return (
    <main className="pt-20 md:pt-24 pb-24 md:pb-32">
      <ClearCartOnSuccess />

      <Container>
        <section className="max-w-4xl">
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
            Payment Complete
          </p>

          <h1 className="mt-6 text-5xl md:text-7xl leading-[0.95] tracking-[-0.03em] text-[var(--foreground)]">
            Thank you
          </h1>

          <p className="mt-8 max-w-3xl text-[20px] md:text-[22px] leading-[1.5] text-[var(--muted)]">
            Your order has been successfully submitted. You will receive a
            confirmation by email shortly.
          </p>
        </section>
      </Container>
    </main>
  );
}