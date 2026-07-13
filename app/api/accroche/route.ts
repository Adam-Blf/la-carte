import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  const { personne, situation, vibe } = await req.json();

  if (!personne || !situation) {
    return NextResponse.json({ error: "Contexte insuffisant" }, { status: 400 });
  }

  const prompt = `Tu es un expert en séduction et en art de l'approche. Génère exactement 5 phrases d'accroche originales, élégantes et adaptées au contexte suivant.

Personne : ${personne}
Situation / lieu : ${situation}
Vibe souhaitée : ${vibe || "naturelle et sincère"}

Règles :
- Chaque phrase doit être unique dans son angle d'attaque
- Ton français, charmant, jamais vulgaire
- Entre 1 et 3 phrases par accroche (pas de monologues)
- Adaptées au lieu et à la personne décrite
- Mélange de styles : audacieux, poétique, humoristique, direct, intriguant

Réponds UNIQUEMENT avec un tableau JSON de 5 strings, sans aucun texte autour :
["phrase 1", "phrase 2", "phrase 3", "phrase 4", "phrase 5"]`;

  try {
    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.9,
      max_tokens: 1024,
    });

    const text = completion.choices[0]?.message?.content ?? "";
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) {
      return NextResponse.json({ error: "Format inattendu" }, { status: 500 });
    }

    const phrases: string[] = JSON.parse(match[0]);
    return NextResponse.json({ phrases });
  } catch (err) {
    console.error("accroche error", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
