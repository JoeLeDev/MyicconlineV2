import type { Metadata } from "next";
import { ContactForm } from "@/components/ui/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contactez l’équipe ICC Online — questions, prière, ou rejoindre une Famille d’Impact Online.",
};

export default function ContactPage() {
  return (
    <div className="bg-white pt-28 pb-20 md:pt-32">
      <div className="container-icc grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-icc-coral">
            Écrire à l’équipe
          </p>
          <h1 className="mt-2 text-[clamp(2rem,5vw,3.2rem)] font-extrabold tracking-tight text-icc-ink">
            Contact
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-icc-muted md:text-lg">
            Une question, une demande de prière, ou l’envie de rejoindre une
            FIO ? Laissez-nous un message — nous vous répondrons avec joie.
          </p>
          <p className="mt-6 text-sm text-icc-muted">
            Communauté ·{" "}
            <a
              href="https://myicconline.com/"
              className="font-medium text-icc-coral hover:text-icc-coral-deep"
            >
              myicconline.com
            </a>
          </p>
        </div>

        <ContactForm />
      </div>
    </div>
  );
}
