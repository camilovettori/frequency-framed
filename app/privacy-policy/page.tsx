import Container from "@/components/ui/container";

export const metadata = {
  title: "Privacy Policy | Frequency Framed",
  description: "Privacy Policy for Frequency Framed.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="pt-20 md:pt-24 pb-24 md:pb-32">
      <Container>
        <section className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
            Legal
          </p>

          <h1 className="mt-6 text-5xl md:text-7xl leading-[0.95] tracking-[-0.03em] text-[var(--foreground)]">
            Privacy Policy
          </h1>

          <div className="mt-10 space-y-6 text-[16px] leading-[1.7] text-[var(--muted)]">
            <p>
              Your privacy is respected and protected.
            </p>

            <p>
              Any personal information shared with Frequency Framed (including
              name, email, phone number, and address) is used exclusively for
              communication, order processing, and delivery purposes.
            </p>

            <p>
              We do not sell, rent, or share your personal information with third
              parties under any circumstances.
            </p>

            <p>
              All data is handled securely and only retained for as long as
              necessary to fulfill your order and provide customer support.
            </p>

            <p>
              By using this website, you agree to the terms of this Privacy
              Policy.
            </p>

            <p className="pt-4 text-sm">
              Last updated: March 2026
            </p>
          </div>
        </section>
      </Container>
    </main>
  );
}