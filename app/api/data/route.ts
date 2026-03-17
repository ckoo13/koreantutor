import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const [grammar, idioms, business, vocab, articles, quiz] = await Promise.all([
      supabase.from("grammar").select("*").order("id"),
      supabase.from("idioms").select("*").order("id"),
      supabase.from("business_phrases").select("*").order("id"),
      supabase.from("vocab").select("*").order("id"),
      supabase.from("articles").select("*").order("id"),
      supabase.from("quiz_questions").select("*").order("id"),
    ]);

    const grammarData = (grammar.data || []).map((r) => ({
      pattern: r.pattern,
      meaning: r.meaning,
      level: r.level,
      example: r.example,
      translation: r.translation,
      usage: r.usage,
      similar: r.similar || [],
      practice: r.practice,
      answer: r.answer,
    }));

    const idiomData = (idioms.data || []).map((r) => ({
      idiom: r.idiom,
      hanja: r.hanja,
      meaning: r.meaning,
      englishMeaning: r.english_meaning,
      example: r.example,
      context: r.context,
      breakdown: r.breakdown,
    }));

    const businessData = (business.data || []).map((r) => ({
      situation: r.situation,
      formal: r.formal,
      casual: r.casual,
      keyPhrases: r.key_phrases || [],
      notes: r.notes,
      register: r.register,
    }));

    const vocabData = (vocab.data || []).map((r) => ({
      category: r.category,
      word: r.word,
      hanja: r.hanja,
      meaning: r.meaning,
      korean_def: r.korean_def,
      example: r.example,
      synonyms: r.synonyms || [],
      antonyms: r.antonyms || [],
      cloze: r.cloze,
      cloze_answer: r.cloze_answer,
    }));

    const articleData = (articles.data || []).map((r) => ({
      id: r.id,
      topic: r.topic,
      title: r.title,
      vocabUsed: r.vocab_used || [],
      body: r.body,
      shortQuestions: r.short_questions || [],
      writingPrompts: r.writing_prompts || [],
    }));

    const quizPool = (quiz.data || []).map((r) => ({
      cat: r.cat,
      question: r.question,
      options: r.options || [],
      correct: r.correct,
      explanation: r.explanation,
    }));

    const categories = Array.from(new Set(vocabData.map((v: any) => v.category)));
    const vocabCategories = categories.reduce((acc: any, cat: any) => {
      const key = cat.replace(/[/\s]/g, "_").toUpperCase();
      return { ...acc, [key]: cat };
    }, {});

    return NextResponse.json({
      grammarData,
      idiomData,
      businessData,
      vocabData,
      vocabCategories,
      articleData,
      quizPool,
    });
  } catch {
    return NextResponse.json({});
  }
}
