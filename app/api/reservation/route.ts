import { NextResponse } from "next/server";

// Adresse du chef · vit côté serveur uniquement, jamais dans le bundle client
const CHEF_EMAIL = "adam.beloucif@efrei.net";
const FORMSUBMIT_ENDPOINT = `https://formsubmit.co/ajax/${CHEF_EMAIL}`;

export async function POST(request: Request) {
  let payload: { summary?: string; guestName?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const summary = (payload.summary ?? "").slice(0, 4000);
  const guestName = (payload.guestName ?? "").slice(0, 80);
  if (!summary) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  try {
    const res = await fetch(FORMSUBMIT_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        _subject: `La Carte · nouvelle réservation${guestName ? ` de ${guestName}` : ""}`,
        _template: "box",
        _captcha: "false",
        prenom: guestName || "non précisé",
        reservation: summary,
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("formsubmit", res.status, detail.slice(0, 500));
    }
    return NextResponse.json({ ok: res.ok }, { status: res.ok ? 200 : 502 });
  } catch (err) {
    console.error("formsubmit fetch failed", err);
    return NextResponse.json({ ok: false }, { status: 502 });
  }
}
