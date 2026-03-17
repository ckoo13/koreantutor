import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { type, prompt } = await req.json();

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not configured" },
        { status: 500 }
      );
    }

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("");

    // Strip markdown fences if present
    const clean = text.replace(/```json|```/g, "").trim();

    // Try to parse as JSON, otherwise return raw text
    try {
      const parsed = JSON.parse(clean);
      return NextResponse.json({ result: parsed });
    } catch {
      return NextResponse.json({ result: clean });
    }
  } catch (error: any) {
    console.error("AI API error:", error);
    return NextResponse.json(
      { error: error.message || "AI generation failed" },
      { status: 500 }
    );
  }
}
