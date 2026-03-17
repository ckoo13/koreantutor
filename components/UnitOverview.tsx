"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useAppData } from "@/lib/app-data";
import { getAllUnitCompletions } from "@/lib/progress";

const palette = {
  bg: "#0F0F0F",
  surface: "#1A1A1A",
  surfaceHover: "#242424",
  accent: "#E8D5B7",
  accentDim: "#B8A080",
  text: "#F0EDE8",
  textDim: "#8A8580",
  border: "#2A2A2A",
  correct: "#6BCB77",
  incorrect: "#FF6B6B",
  tag: "#2A2520",
};

const font = {
  display: "'Noto Serif KR', 'Georgia', serif",
  body: "'Noto Sans KR', 'Pretendard', sans-serif",
};

interface Completion {
  unit_id: number;
  best_score: number;
  completed: boolean;
}

interface Props {
  onSelectUnit: (unitId: number) => void;
  onFreeMode: () => void;
}

export default function UnitOverview({ onSelectUnit, onFreeMode }: Props) {
  const { user, signOut } = useAuth();
  const { units } = useAppData();
  const [completions, setCompletions] = useState<Completion[]>([]);

  useEffect(() => {
    if (user) {
      getAllUnitCompletions(user.id).then(setCompletions);
    }
  }, [user]);

  const getCompletion = (unitId: number) =>
    completions.find((c) => c.unit_id === unitId);

  const isUnlocked = (unitNumber: number): boolean => {
    if (unitNumber === 1) return true;
    const prev = units.find((u) => u.unit_number === unitNumber - 1);
    if (!prev) return false;
    const prevCompletion = getCompletion(prev.id);
    return prevCompletion?.completed ?? false;
  };

  return (
    <div style={{ minHeight: "100vh", background: palette.bg, padding: "0 0 80px 0" }}>
      {/* Header */}
      <div style={{
        borderBottom: `1px solid ${palette.border}`,
        padding: "20px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <div>
          <span style={{ fontFamily: font.display, color: palette.accent, fontSize: 20 }}>韓</span>
          <span style={{ fontFamily: font.body, color: palette.textDim, fontSize: 13, marginLeft: 10 }}>
            고급 한국어 학습
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontFamily: font.body, color: palette.textDim, fontSize: 12 }}>
            {user?.email}
          </span>
          <button
            onClick={signOut}
            style={{
              background: "transparent",
              border: `1px solid ${palette.border}`,
              borderRadius: 6,
              color: palette.textDim,
              fontFamily: font.body,
              fontSize: 12,
              padding: "5px 12px",
              cursor: "pointer",
            }}
          >
            로그아웃
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "40px 24px" }}>
        {/* Title */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontFamily: font.display, color: palette.text, fontSize: 26, margin: "0 0 8px 0" }}>
            학습 커리큘럼
          </h1>
          <p style={{ fontFamily: font.body, color: palette.textDim, fontSize: 14, margin: 0 }}>
            각 유닛을 순서대로 완료하여 다음 유닛을 잠금 해제하세요. 70점 이상이면 통과입니다.
          </p>
        </div>

        {/* Unit cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {units.length === 0 ? (
            // Loading skeleton
            [1, 2, 3, 4].map((n) => (
              <div key={n} style={{
                background: palette.surface,
                border: `1px solid ${palette.border}`,
                borderRadius: 12,
                padding: 24,
                opacity: 0.5,
                height: 100,
              }} />
            ))
          ) : (
            units.map((unit) => {
              const unlocked = isUnlocked(unit.unit_number);
              const completion = getCompletion(unit.id);
              const score = completion?.best_score ?? 0;
              const done = completion?.completed ?? false;

              return (
                <div
                  key={unit.id}
                  onClick={() => unlocked && onSelectUnit(unit.id)}
                  style={{
                    background: palette.surface,
                    border: `1px solid ${done ? palette.correct + "40" : unlocked ? palette.border : palette.border}`,
                    borderRadius: 12,
                    padding: 24,
                    cursor: unlocked ? "pointer" : "default",
                    opacity: unlocked ? 1 : 0.45,
                    transition: "all 0.2s ease",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Progress bar background */}
                  {done && (
                    <div style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      height: "100%",
                      width: `${score}%`,
                      background: palette.correct + "08",
                      pointerEvents: "none",
                    }} />
                  )}

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                        <span style={{
                          fontFamily: font.body,
                          fontSize: 11,
                          color: palette.accentDim,
                          background: palette.tag,
                          padding: "2px 8px",
                          borderRadius: 4,
                        }}>
                          UNIT {unit.unit_number}
                        </span>
                        {done && (
                          <span style={{ fontFamily: font.body, fontSize: 11, color: palette.correct }}>
                            ✓ 완료 · {score}점
                          </span>
                        )}
                        {!unlocked && (
                          <span style={{ fontFamily: font.body, fontSize: 11, color: palette.textDim }}>
                            🔒 잠금
                          </span>
                        )}
                        {unlocked && !done && (
                          <span style={{ fontFamily: font.body, fontSize: 11, color: palette.accent }}>
                            진행 중
                          </span>
                        )}
                      </div>
                      <h2 style={{ fontFamily: font.display, color: palette.text, fontSize: 18, margin: "0 0 4px 0" }}>
                        {unit.title}
                      </h2>
                      <p style={{ fontFamily: font.body, color: palette.accentDim, fontSize: 12, margin: "0 0 8px 0" }}>
                        {unit.theme}
                      </p>
                      <p style={{ fontFamily: font.body, color: palette.textDim, fontSize: 13, margin: 0 }}>
                        {unit.description}
                      </p>
                    </div>
                    {unlocked && (
                      <div style={{
                        fontFamily: font.body,
                        fontSize: 20,
                        color: palette.accentDim,
                        marginLeft: 16,
                        marginTop: 4,
                      }}>
                        →
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Free mode */}
        <div style={{ marginTop: 32, textAlign: "center" }}>
          <button
            onClick={onFreeMode}
            style={{
              background: "transparent",
              border: `1px solid ${palette.border}`,
              borderRadius: 8,
              color: palette.textDim,
              fontFamily: font.body,
              fontSize: 13,
              padding: "10px 24px",
              cursor: "pointer",
            }}
          >
            자유 학습 모드 (전체 콘텐츠)
          </button>
        </div>
      </div>
    </div>
  );
}
