"use client";
import KoreanTutor from "@/components/KoreanTutor";
import { AppDataProvider } from "@/lib/app-data";

export default function Home() {
  return (
    <AppDataProvider>
      <KoreanTutor />
    </AppDataProvider>
  );
}
