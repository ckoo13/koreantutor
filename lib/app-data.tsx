"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { GRAMMAR_DATA } from "@/data/grammar";
import { IDIOM_DATA } from "@/data/idioms";
import { BUSINESS_DATA } from "@/data/business";
import { VOCAB_CATEGORIES, VOCAB_DATA } from "@/data/vocab";
import { ARTICLE_DATA } from "@/data/articles";
import { QUIZ_POOL } from "@/data/quiz";

export interface Unit {
  id: number;
  unit_number: number;
  title: string;
  theme: string;
  description: string;
  unlock_score: number;
}

export interface UnitItem {
  id: number;
  unit_id: number;
  item_type: "vocab" | "grammar" | "idiom" | "business" | "article" | "quiz";
  item_id: number;
}

interface AppData {
  // All content (full library)
  allGrammarData: typeof GRAMMAR_DATA;
  allIdiomData: typeof IDIOM_DATA;
  allBusinessData: typeof BUSINESS_DATA;
  allVocabData: typeof VOCAB_DATA;
  allVocabCategories: typeof VOCAB_CATEGORIES;
  allArticleData: typeof ARTICLE_DATA;
  allQuizPool: typeof QUIZ_POOL;

  // Filtered content (based on selected unit, or all if null)
  grammarData: typeof GRAMMAR_DATA;
  idiomData: typeof IDIOM_DATA;
  businessData: typeof BUSINESS_DATA;
  vocabData: typeof VOCAB_DATA;
  vocabCategories: typeof VOCAB_CATEGORIES;
  articleData: typeof ARTICLE_DATA;
  quizPool: typeof QUIZ_POOL;

  // Units
  units: Unit[];
  unitItems: UnitItem[];
  selectedUnitId: number | null;
  setSelectedUnitId: (id: number | null) => void;
}

const defaultData: AppData = {
  allGrammarData: GRAMMAR_DATA,
  allIdiomData: IDIOM_DATA,
  allBusinessData: BUSINESS_DATA,
  allVocabData: VOCAB_DATA,
  allVocabCategories: VOCAB_CATEGORIES,
  allArticleData: ARTICLE_DATA,
  allQuizPool: QUIZ_POOL,

  grammarData: GRAMMAR_DATA,
  idiomData: IDIOM_DATA,
  businessData: BUSINESS_DATA,
  vocabData: VOCAB_DATA,
  vocabCategories: VOCAB_CATEGORIES,
  articleData: ARTICLE_DATA,
  quizPool: QUIZ_POOL,

  units: [],
  unitItems: [],
  selectedUnitId: null,
  setSelectedUnitId: () => {},
};

const AppDataContext = createContext<AppData>(defaultData);

function filterByUnit(all: any[], unitItems: UnitItem[], unitId: number, itemType: string) {
  const ids = unitItems
    .filter((ui) => ui.unit_id === unitId && ui.item_type === itemType)
    .map((ui) => ui.item_id);
  // item_id is 1-indexed matching insert order
  return all.filter((_, idx) => ids.includes(idx + 1));
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [allData, setAllData] = useState({
    grammarData: GRAMMAR_DATA,
    idiomData: IDIOM_DATA,
    businessData: BUSINESS_DATA,
    vocabData: VOCAB_DATA,
    vocabCategories: VOCAB_CATEGORIES,
    articleData: ARTICLE_DATA,
    quizPool: QUIZ_POOL,
    units: [] as Unit[],
    unitItems: [] as UnitItem[],
  });

  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/data")
      .then((r) => r.json())
      .then((d) => {
        setAllData({
          grammarData: d.grammarData?.length ? d.grammarData : GRAMMAR_DATA,
          idiomData: d.idiomData?.length ? d.idiomData : IDIOM_DATA,
          businessData: d.businessData?.length ? d.businessData : BUSINESS_DATA,
          vocabData: d.vocabData?.length ? d.vocabData : VOCAB_DATA,
          vocabCategories: Object.keys(d.vocabCategories || {}).length ? d.vocabCategories : VOCAB_CATEGORIES,
          articleData: d.articleData?.length ? d.articleData : ARTICLE_DATA,
          quizPool: d.quizPool?.length ? d.quizPool : QUIZ_POOL,
          units: d.units || [],
          unitItems: d.unitItems || [],
        });
      })
      .catch(() => {});
  }, []);

  // Apply unit filter
  const filtered = selectedUnitId
    ? {
        grammarData: filterByUnit(allData.grammarData, allData.unitItems, selectedUnitId, "grammar"),
        idiomData: filterByUnit(allData.idiomData, allData.unitItems, selectedUnitId, "idiom"),
        businessData: filterByUnit(allData.businessData, allData.unitItems, selectedUnitId, "business"),
        vocabData: filterByUnit(allData.vocabData, allData.unitItems, selectedUnitId, "vocab"),
        articleData: filterByUnit(allData.articleData, allData.unitItems, selectedUnitId, "article"),
        quizPool: filterByUnit(allData.quizPool, allData.unitItems, selectedUnitId, "quiz"),
        vocabCategories: allData.vocabCategories,
      }
    : {
        grammarData: allData.grammarData,
        idiomData: allData.idiomData,
        businessData: allData.businessData,
        vocabData: allData.vocabData,
        articleData: allData.articleData,
        quizPool: allData.quizPool,
        vocabCategories: allData.vocabCategories,
      };

  const value: AppData = {
    allGrammarData: allData.grammarData,
    allIdiomData: allData.idiomData,
    allBusinessData: allData.businessData,
    allVocabData: allData.vocabData,
    allVocabCategories: allData.vocabCategories,
    allArticleData: allData.articleData,
    allQuizPool: allData.quizPool,
    ...filtered,
    units: allData.units,
    unitItems: allData.unitItems,
    selectedUnitId,
    setSelectedUnitId,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  return useContext(AppDataContext);
}
