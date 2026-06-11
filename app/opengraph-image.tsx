import { ImageResponse } from "next/og";

export const alt = "La Carte · Maison A. · une invitation";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function loadGoogleFont(family: string, text: string) {
  const url = `https://fonts.googleapis.com/css2?family=${family}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(url)).text();
  const resource = css.match(
    /src: url\((.+?)\) format\('(opentype|truetype)'\)/,
  );
  if (resource) {
    const res = await fetch(resource[1]);
    if (res.ok) return res.arrayBuffer();
  }
  throw new Error(`Échec de chargement de la police ${family}`);
}

export default async function OpengraphImage() {
  const display = "La Carte";
  const small = "MAISON A. · DES RENDEZ-VOUS";
  const footer =
    "table pour deux · l'addition est déjà réglée « Tout le monde peut cuisiner. »";

  const [fraunces, garamond] = await Promise.all([
    loadGoogleFont("Fraunces:ital@1", display).catch(() => null),
    loadGoogleFont("EB+Garamond:ital@0;1", small + footer).catch(() => null),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f6f0e2",
          padding: 36,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid rgba(14,29,49,0.45)",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              right: 10,
              bottom: 10,
              border: "1px solid rgba(14,29,49,0.3)",
              display: "flex",
            }}
          />
          <div
            style={{
              fontSize: 26,
              letterSpacing: "0.45em",
              color: "#8c6c1d",
              fontFamily: garamond ? "Garamond" : "serif",
            }}
          >
            MAISON A. · DES RENDEZ-VOUS
          </div>
          <div
            style={{
              fontSize: 168,
              fontStyle: "italic",
              color: "#0e1d31",
              marginTop: 8,
              fontFamily: fraunces ? "Fraunces" : "serif",
            }}
          >
            La Carte
          </div>
          <div
            style={{
              fontSize: 30,
              fontStyle: "italic",
              color: "#3c4a5e",
              marginTop: 18,
              fontFamily: garamond ? "Garamond" : "serif",
            }}
          >
            « Tout le monde peut cuisiner. »
          </div>
          <div
            style={{
              fontSize: 22,
              letterSpacing: "0.3em",
              color: "#8c6c1d",
              marginTop: 26,
              fontFamily: garamond ? "Garamond" : "serif",
            }}
          >
            TABLE POUR DEUX · L&apos;ADDITION EST DÉJÀ RÉGLÉE
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        ...(fraunces
          ? [{ name: "Fraunces", data: fraunces, style: "italic" as const }]
          : []),
        ...(garamond
          ? [{ name: "Garamond", data: garamond, style: "normal" as const }]
          : []),
      ],
    },
  );
}
