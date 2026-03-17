"use client";
import { useState } from "react";
import { AuthProvider, useAuth } from "@/lib/auth";
import { AppDataProvider, useAppData } from "@/lib/app-data";
import LoginScreen from "@/components/LoginScreen";
import UnitOverview from "@/components/UnitOverview";
import KoreanTutor from "@/components/KoreanTutor";

type View = "units" | "tutor";

function AppShell() {
  const { user, loading } = useAuth();
  const { setSelectedUnitId } = useAppData();
  const [view, setView] = useState<View>("units");

  if (loading) return null;
  if (!user) return <LoginScreen />;

  if (view === "units") {
    return (
      <UnitOverview
        onSelectUnit={(unitId) => {
          setSelectedUnitId(unitId);
          setView("tutor");
        }}
        onFreeMode={() => {
          setSelectedUnitId(null);
          setView("tutor");
        }}
      />
    );
  }

  return (
    <KoreanTutor
      onBackToUnits={() => {
        setView("units");
      }}
    />
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <AppDataProvider>
        <AppShell />
      </AppDataProvider>
    </AuthProvider>
  );
}
