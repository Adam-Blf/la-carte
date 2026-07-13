import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

function getClient() {
  return new Groq({ apiKey: process.env.GROQ_API_KEY ?? "" });
}

export async function POST(req: NextRequest) {
  const { personne, situation, vibe } = await req.json();

  if (!personne || !situation) {
    return NextResponse.json({ error: "Contexte insuffisant" }, { status: 400 });
  }

  const prompt = `Tu es un coach en séduction parisien, vif, cultivé, sans clichés. Tu génères des accroches qui sonnent VRAI — pas de compliments bateau, pas de formules vues partout.

Contexte :
- Personne : ${personne}
- Lieu / situation : ${situation}
- Vibe : ${vibe || "naturelle, un peu audacieuse"}

Génère exactement 5 accroches. Chacune doit :
- Partir d'un détail CONCRET lié à la personne ou au lieu (pas générique)
- Sonner spontané, comme si ça venait de te traverser l'esprit
- Être courte : 1 ou 2 phrases max
- Éviter : "vous avez un sourire…", "je n'ai pas pu m'empêcher…", tout ce qui est trop vu
- Varier les angles : observation, humour, curiosité, légèreté, audace

Réponds UNIQUEMENT avec un tableau JSON de 5 strings, sans aucun texte autour :
["accroche 1", "accroche 2", "accroche 3", "accroche 4", "accroche 5"]`;

  try {
    const completion = await getClient().chat.completions.create({
      model: "mixtral-8x7b-32768",
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
