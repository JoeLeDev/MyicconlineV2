"use client";

import { FormEvent, useState } from "react";
import { CONTACT_EMAIL } from "@/lib/site";

export function ContactForm() {
  const [sent, setSent] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const message = String(data.get("message") || "").trim();

    const subject = encodeURIComponent(`Contact ICC Online — ${name}`);
    const body = encodeURIComponent(
      `Nom : ${name}\nE-mail : ${email}\n\nMessage :\n${message}`,
    );

    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    setSent(true);
  }

  if (sent) {
    return (
      <div className="border border-icc-coral/25 bg-icc-cream px-6 py-10">
        <h2 className="text-xl font-bold text-icc-ink">Merci !</h2>
        <p className="mt-2 text-icc-muted">
          Votre client e-mail devrait s’ouvrir pour envoyer le message à{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="font-medium text-icc-coral hover:text-icc-coral-deep"
          >
            {CONTACT_EMAIL}
          </a>
          . Si ce n’est pas le cas, écrivez-nous directement à cette adresse.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-5 border border-black/8 bg-icc-cream/40 p-6 md:p-8"
    >
      <div>
        <label
          htmlFor="name"
          className="mb-1.5 block text-sm font-semibold text-icc-ink"
        >
          Nom
        </label>
        <input
          id="name"
          name="name"
          required
          className="w-full border border-black/10 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-icc-coral"
        />
      </div>
      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-sm font-semibold text-icc-ink"
        >
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full border border-black/10 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-icc-coral"
        />
      </div>
      <div>
        <label
          htmlFor="message"
          className="mb-1.5 block text-sm font-semibold text-icc-ink"
        >
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className="w-full resize-y border border-black/10 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-icc-coral"
        />
      </div>
      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-lg border border-icc-coral bg-icc-coral px-5 py-3 text-sm font-semibold text-white transition hover:border-icc-coral-deep hover:bg-icc-coral-deep"
      >
        Envoyer
      </button>
    </form>
  );
}
