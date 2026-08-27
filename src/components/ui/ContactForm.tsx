"use client";

import { FormEvent, useState } from "react";

export function ContactForm() {
  const [sent, setSent] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Phase 1 : formulaire vitrine (pas d’API mail encore)
    setSent(true);
  }

  if (sent) {
    return (
      <div className="border border-icc-coral/25 bg-icc-cream px-6 py-10">
        <h2 className="text-xl font-bold text-icc-ink">Merci !</h2>
        <p className="mt-2 text-icc-muted">
          Votre message a bien été préparé. L’équipe ICC Online vous répondra
          prochainement.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 border border-black/8 bg-icc-cream/40 p-6 md:p-8">
      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-semibold text-icc-ink">
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
        <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-icc-ink">
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
        <label htmlFor="message" className="mb-1.5 block text-sm font-semibold text-icc-ink">
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
