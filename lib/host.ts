// Mode multi-hôte · n'importe qui peut envoyer sa propre carte.
// L'hôte (prénom + numéro WhatsApp) voyage dans l'URL, encodé en base64url,
// aucune base de données. Sans paramètre, la carte reste celle de la maison mère.

export type Host = {
  name: string;
  phone: string;
};

export const DEFAULT_PHONE = "33786466834";

function toBase64Url(value: string): string {
  return btoa(unescape(encodeURIComponent(value)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64Url(value: string): string {
  const b64 = value.replace(/-/g, "+").replace(/_/g, "/");
  return decodeURIComponent(escape(atob(b64)));
}

export function parseHostFromLocation(): Host | null {
  try {
    const raw = new URLSearchParams(window.location.search).get("h");
    if (!raw) return null;
    const data = JSON.parse(fromBase64Url(raw)) as { n?: string; p?: string };
    const name = (data.n ?? "").trim().slice(0, 30);
    const phone = (data.p ?? "").replace(/\D/g, "");
    if (!name || phone.length < 8 || phone.length > 15) return null;
    return { name, phone };
  } catch {
    return null;
  }
}

export function buildHostLink(name: string, phone: string): string {
  const payload = toBase64Url(JSON.stringify({ n: name.trim(), p: phone }));
  return `${window.location.origin}/?h=${payload}`;
}

export function hostInitial(host: Host): string {
  return host.name.charAt(0).toUpperCase();
}
