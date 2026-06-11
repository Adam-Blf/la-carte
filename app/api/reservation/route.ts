import { NextResponse } from "next/server";

// Adresse du chef · vit côté serveur uniquement, jamais dans le bundle client
const CHEF_EMAIL = "adam.beloucif@efrei.net";
const FORMSUBMIT_ENDPOINT = `https://formsubmit.co/ajax/${CHEF_EMAIL}`;

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

type Reservation = {
  summary: string;
  guestName: string;
  hostName: string | null;
  hostPhone: string | null;
};

// Persistance en base · la clé anon ne peut qu'insérer (RLS write-only)
async function saveReservation(r: Reservation): Promise<boolean> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return false;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/reservations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        summary: r.summary,
        guest_name: r.guestName || null,
        host_name: r.hostName,
        host_phone: r.hostPhone,
      }),
    });
    if (!res.ok) {
      console.error("supabase insert", res.status, await res.text());
    }
    return res.ok;
  } catch (err) {
    console.error("supabase insert failed", err);
    return false;
  }
}

// Email du chef · uniquement pour la carte de la maison mère (pas en mode hôte)
async function emailChef(r: Reservation): Promise<boolean> {
  try {
    const res = await fetch(FORMSUBMIT_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        // FormSubmit est derrière un WAF qui rejette les clients non-navigateur
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        Origin: "https://la-carte.beloucif.com",
        Referer: "https://la-carte.beloucif.com/",
      },
      body: JSON.stringify({
        _subject: `La Carte · nouvelle réservation${r.guestName ? ` de ${r.guestName}` : ""}`,
        _template: "box",
        _captcha: "false",
        prenom: r.guestName || "non précisé",
        reservation: r.summary,
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("formsubmit", res.status, detail.slice(0, 500));
    }
    return res.ok;
  } catch (err) {
    console.error("formsubmit fetch failed", err);
    return false;
  }
}

export async function POST(request: Request) {
  let payload: Partial<Reservation>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const reservation: Reservation = {
    summary: (payload.summary ?? "").slice(0, 4000),
    guestName: (payload.guestName ?? "").slice(0, 80),
    hostName: payload.hostName ? String(payload.hostName).slice(0, 30) : null,
    hostPhone: payload.hostPhone
      ? String(payload.hostPhone).replace(/\D/g, "").slice(0, 15)
      : null,
  };
  if (!reservation.summary) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const saved = await saveReservation(reservation);
  const mailed = reservation.hostName ? false : await emailChef(reservation);

  const ok = saved || mailed;
  return NextResponse.json({ ok, saved, mailed }, { status: ok ? 200 : 502 });
}
