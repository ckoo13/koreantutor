"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { GRAMMAR_DATA } from "@/data/grammar";
import { IDIOM_DATA } from "@/data/idioms";
import { BUSINESS_DATA } from "@/data/business";
import { VOCAB_CATEGORIES, VOCAB_DATA } from "@/data/vocab";
import { ARTICLE_DATA } from "@/data/articles";
import { QUIZ_POOL } from "@/data/quiz";

interface AppData {
  grammarData: typeof GRAMMAR_DATA;
  idiomData: typeof IDIOM_DATA;
  businessData: typeof BUSINESS_DATA;
  vocabData: typeof VOCAB_DATA;
  vocabCategories: typeof VOCAB_CATEGORIES;
  articleData: typeof ARTICLE_DATA;
  quizPool: typeof QUIZ_POOL;
}

const defaultData: AppData = {
  grammarData: GRAMMAR_DATA,
  idiomData: IDIOM_DATA,
  businessData: BUSINESS_DATA,
  vocabData: VOCAB_DATA,
  vocabCategories: VOCAB_CATEGORIES,
  articleData: ARTICLE_DATA,
  quizPool: QUIZ_POOL,
};

const AppDataContext = createContext<AppData>(defaultData);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(defaultData);

  useEffect(() => {
    fetch("/api/data")
      .then((r) => r.json())
      .then((d) => {
        setData({
          grammarData: d.grammarData?.length ? d.grammarData : GRAMMAR_DATA,
          idiomData: d.idiomData?.length ? d.idiomData : IDIOM_DATA,
          businessData: d.businessData?.length ? d.businessData : BUSINESS_DATA,
          vocabData: d.vocabData?.length ? d.vocabData : VOCAB_DATA,
          vocabCategories: Object.keys(d.vocabCategories || {}).length
            ? d.vocabCategories
            : VOCAB_CATEGORIES,
          articleData: d.articleData?.length ? d.articleData : ARTICLE_DATA,
          quizPool: d.quizPool?.length ? d.quizPool : QUIZ_POOL,
        });
      })
      .catch(() => {}); // silently fall back to static data
  }, []);

  return <AppDataContext.Provider value={data}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  return useContext(AppDataContext);
}
