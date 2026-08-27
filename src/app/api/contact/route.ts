import { NextResponse } from "next/server";
import { Resend } from "resend";
import { CONTACT_EMAIL } from "@/lib/site";

type ContactPayload = {
  name?: string;
  email?: string;
  message?: string;
};

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  let body: ContactPayload;

  try {
    body = (await request.json()) as ContactPayload;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Requête invalide." },
      { status: 400 },
    );
  }

  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const message = String(body.message || "").trim();

  if (!name || !email || !message) {
    return NextResponse.json(
      { ok: false, error: "Tous les champs sont requis." },
      { status: 400 },
    );
  }

  if (!isValidEmail(email) || name.length > 120 || message.length > 5000) {
    return NextResponse.json(
      { ok: false, error: "Données invalides." },
      { status: 400 },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        ok: false,
        error: "Envoi e-mail non configuré.",
        fallback: "mailto",
      },
      { status: 503 },
    );
  }

  const to = process.env.CONTACT_TO_EMAIL || CONTACT_EMAIL;
  const from =
    process.env.CONTACT_FROM_EMAIL ||
    "ICC Online <onboarding@resend.dev>";

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: [to],
      replyTo: email,
      subject: `Contact ICC Online — ${name}`,
      text: `Nom : ${name}\nE-mail : ${email}\n\nMessage :\n${message}`,
    });

    if (error) {
      console.error("[contact]", error);
      return NextResponse.json(
        { ok: false, error: "Impossible d’envoyer le message." },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact]", err);
    return NextResponse.json(
      { ok: false, error: "Erreur serveur." },
      { status: 500 },
    );
  }
}
