import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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
    const message = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 1024,
      thinking: { type: "adaptive" },
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json({ error: "Réponse invalide" }, { status: 500 });
    }

    const match = textBlock.text.match(/\[[\s\S]*\]/);
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
