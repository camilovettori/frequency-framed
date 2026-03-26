import type { Metadata } from "next";
import ContactPageClient from "./ContactPageClient";

export const metadata: Metadata = {
  title: "Contact | Artwork Enquiries & Commissions | Frequency Framed",
  description:
    "Get in touch for artwork enquiries, commissions, pricing, and availability of original paintings from Frequency Framed.",
};

export default function ContactPage() {
  return <ContactPageClient />;
}