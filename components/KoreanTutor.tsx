"use client";
import { useState, useEffect, useCallback } from "react";
import { shuffleArray } from "@/data/quiz";
import { useAppData } from "@/lib/app-data";

// Helper to call our API route instead of Anthropic directly
async function callAI(prompt: string) {
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.result;
}

const MODES = {
  HOME: "home",
  GRAMMAR: "grammar",
  IDIOMS: "idioms",
  BUSINESS: "business",
  VOCAB: "vocab",
  READING: "reading",
  QUIZ: "quiz",
};

// ── Shared style constants ─────────────────────────────────────────
const palette = {
  bg: "#0F0F0F",
  surface: "#1A1A1A",
  surfaceHover: "#242424",
  accent: "#E8D5B7",
  accentDim: "#B8A080",
  accentGlow: "rgba(232, 213, 183, 0.08)",
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
  mono: "'JetBrains Mono', monospace",
};

// ── Components ─────────────────────────────────────────────────────

function ProgressDots({ total, current }) {
  return (
    <div style={{ display: "flex", gap: 6, justifyContent: "center", margin: "16px 0" }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: i === current ? palette.accent : i < current ? palette.accentDim : palette.border,
            transition: "all 0.3s ease",
          }}
        />
      ))}
    </div>
  );
}

function Tag({ children }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        borderRadius: 4,
        background: palette.tag,
        color: palette.accentDim,
        fontSize: 12,
        fontFamily: font.body,
        letterSpacing: 0.5,
      }}
    >
      {children}
    </span>
  );
}

function NavButton({ label, icon, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? palette.accentGlow : "transparent",
        border: `1px solid ${active ? palette.accentDim : palette.border}`,
        color: active ? palette.accent : palette.textDim,
        padding: "10px 18px",
        borderRadius: 8,
        cursor: "pointer",
        fontFamily: font.body,
        fontSize: 14,
        transition: "all 0.25s ease",
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <span style={{ fontSize: 18 }}>{icon}</span>
      {label}
    </button>
  );
}

// ── Home Screen ────────────────────────────────────────────────────
function HomeScreen({ setMode }) {
  const { grammarData, idiomData, businessData, vocabData, articleData, quizPool } = useAppData();
  const cards = [
    { mode: MODES.GRAMMAR, icon: "文", title: "고급 문법", subtitle: "Advanced Grammar Patterns", count: grammarData.length },
    { mode: MODES.IDIOMS, icon: "漢", title: "사자성어", subtitle: "Four-Character Idioms", count: idiomData.length },
    { mode: MODES.BUSINESS, icon: "業", title: "비즈니스 한국어", subtitle: "Business & Formal Register", count: businessData.length },
    { mode: MODES.VOCAB, icon: "語", title: "어휘력", subtitle: "Vocabulary Builder", count: vocabData.length },
    { mode: MODES.READING, icon: "讀", title: "읽기·쓰기", subtitle: "Reading & Writing Practice", count: articleData.length },
    { mode: MODES.QUIZ, icon: "試", title: "종합 퀴즈", subtitle: "Mixed Review Quiz", count: quizPool.length },
  ];

  return (
    <div style={{ animation: "fadeIn 0.6s ease" }}>
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <div
          style={{
            fontSize: 64,
            fontFamily: font.display,
            color: palette.accent,
            marginBottom: 8,
            letterSpacing: -2,
          }}
        >
          韓
        </div>
        <h1
          style={{
            fontFamily: font.display,
            fontSize: 28,
            color: palette.text,
            fontWeight: 400,
            margin: 0,
            letterSpacing: 1,
          }}
        >
          고급 한국어 학습
        </h1>
        <p style={{ color: palette.textDim, fontFamily: font.body, fontSize: 14, marginTop: 8 }}>
          TOPIK 5-6 · 비즈니스 · 사자성어 · 고급 문법
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 16,
          maxWidth: 580,
          margin: "0 auto",
        }}
      >
        {cards.map((card) => (
          <button
            key={card.mode}
            onClick={() => setMode(card.mode)}
            style={{
              background: palette.surface,
              border: `1px solid ${palette.border}`,
              borderRadius: 12,
              padding: 24,
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.3s ease",
              position: "relative",
              overflow: "hidden",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = palette.accentDim;
              e.currentTarget.style.background = palette.surfaceHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = palette.border;
              e.currentTarget.style.background = palette.surface;
            }}
          >
            <div
              style={{
                fontFamily: font.display,
                fontSize: 32,
                color: palette.accent,
                marginBottom: 12,
                opacity: 0.9,
              }}
            >
              {card.icon}
            </div>
            <div style={{ fontFamily: font.display, fontSize: 18, color: palette.text, marginBottom: 4 }}>
              {card.title}
            </div>
            <div style={{ fontFamily: font.body, fontSize: 12, color: palette.textDim }}>{card.subtitle}</div>
            <div
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                fontFamily: font.mono,
                fontSize: 11,
                color: palette.textDim,
              }}
            >
              {card.count}항목
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Grammar Mode ───────────────────────────────────────────────────
function GrammarMode() {
  const { grammarData } = useAppData();
  const [idx, setIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const item = grammarData[idx];

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", animation: "fadeIn 0.5s ease" }}>
      <ProgressDots total={grammarData.length} current={idx} />

      <div
        style={{
          background: palette.surface,
          border: `1px solid ${palette.border}`,
          borderRadius: 14,
          padding: 32,
          marginTop: 16,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <Tag>{item.level}</Tag>
          <span style={{ fontFamily: font.mono, fontSize: 12, color: palette.textDim }}>
            {idx + 1}/{grammarData.length}
          </span>
        </div>

        <h2 style={{ fontFamily: font.display, fontSize: 28, color: palette.accent, margin: "0 0 4px 0", fontWeight: 400 }}>
          {item.pattern}
        </h2>
        <p style={{ fontFamily: font.body, fontSize: 14, color: palette.textDim, margin: "0 0 24px 0" }}>
          {item.meaning}
        </p>

        <div
          style={{
            background: palette.bg,
            borderRadius: 8,
            padding: 20,
            marginBottom: 20,
            borderLeft: `3px solid ${palette.accentDim}`,
          }}
        >
          <p style={{ fontFamily: font.body, fontSize: 16, color: palette.text, margin: 0, lineHeight: 1.8 }}>
            {item.example}
          </p>
          <p style={{ fontFamily: font.body, fontSize: 13, color: palette.textDim, margin: "8px 0 0 0", fontStyle: "italic" }}>
            {item.translation}
          </p>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            background: "transparent",
            border: "none",
            color: palette.accentDim,
            fontFamily: font.body,
            fontSize: 13,
            cursor: "pointer",
            padding: "4px 0",
            marginBottom: expanded ? 12 : 0,
          }}
        >
          {expanded ? "▾ 상세 설명 접기" : "▸ 상세 설명 보기"}
        </button>

        {expanded && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <p style={{ fontFamily: font.body, fontSize: 14, color: palette.text, lineHeight: 1.8, margin: "0 0 12px 0" }}>
              {item.usage}
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontFamily: font.body, fontSize: 12, color: palette.textDim }}>유사 표현:</span>
              {item.similar.map((s) => (
                <Tag key={s}>{s}</Tag>
              ))}
            </div>
          </div>
        )}

        <div
          style={{
            marginTop: 24,
            background: palette.accentGlow,
            borderRadius: 8,
            padding: 20,
          }}
        >
          <p style={{ fontFamily: font.body, fontSize: 13, color: palette.accentDim, margin: "0 0 8px 0" }}>
            ✏️ 연습 문제
          </p>
          <p style={{ fontFamily: font.body, fontSize: 15, color: palette.text, margin: "0 0 12px 0" }}>
            {item.practice}
          </p>
          <button
            onClick={() => setShowAnswer(!showAnswer)}
            style={{
              background: showAnswer ? palette.accent : "transparent",
              color: showAnswer ? palette.bg : palette.accent,
              border: `1px solid ${palette.accent}`,
              padding: "8px 20px",
              borderRadius: 6,
              cursor: "pointer",
              fontFamily: font.body,
              fontSize: 13,
              transition: "all 0.2s ease",
            }}
          >
            {showAnswer ? `정답: ${item.answer}` : "정답 확인"}
          </button>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
        <button
          onClick={() => { setIdx(Math.max(0, idx - 1)); setShowAnswer(false); setExpanded(false); }}
          disabled={idx === 0}
          style={{
            background: "transparent",
            border: `1px solid ${palette.border}`,
            color: idx === 0 ? palette.border : palette.textDim,
            padding: "10px 24px",
            borderRadius: 8,
            cursor: idx === 0 ? "default" : "pointer",
            fontFamily: font.body,
            fontSize: 14,
          }}
        >
          ← 이전
        </button>
        <button
          onClick={() => { setIdx(Math.min(grammarData.length - 1, idx + 1)); setShowAnswer(false); setExpanded(false); }}
          disabled={idx === grammarData.length - 1}
          style={{
            background: idx === grammarData.length - 1 ? palette.border : palette.accent,
            border: "none",
            color: idx === grammarData.length - 1 ? palette.textDim : palette.bg,
            padding: "10px 24px",
            borderRadius: 8,
            cursor: idx === grammarData.length - 1 ? "default" : "pointer",
            fontFamily: font.body,
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          다음 →
        </button>
      </div>
    </div>
  );
}

// ── Idiom Mode ─────────────────────────────────────────────────────
function IdiomMode() {
  const { idiomData } = useAppData();
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const item = idiomData[idx];

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", animation: "fadeIn 0.5s ease" }}>
      <ProgressDots total={idiomData.length} current={idx} />

      <div
        onClick={() => setFlipped(!flipped)}
        style={{
          background: palette.surface,
          border: `1px solid ${palette.border}`,
          borderRadius: 14,
          padding: 40,
          marginTop: 16,
          cursor: "pointer",
          minHeight: 320,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          transition: "all 0.3s ease",
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", top: 16, right: 20, fontFamily: font.mono, fontSize: 11, color: palette.textDim }}>
          {flipped ? "뒤집기 ↩" : "탭하여 뒤집기"}
        </div>

        {!flipped ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: font.display, fontSize: 48, color: palette.accent, marginBottom: 8, letterSpacing: 8 }}>
              {item.idiom}
            </div>
            <div style={{ fontFamily: font.mono, fontSize: 16, color: palette.textDim, letterSpacing: 4 }}>
              {item.hanja}
            </div>
          </div>
        ) : (
          <div style={{ animation: "fadeIn 0.4s ease" }}>
            <div style={{ fontFamily: font.display, fontSize: 24, color: palette.accent, marginBottom: 16 }}>
              {item.idiom} <span style={{ fontSize: 14, color: palette.textDim }}>({item.hanja})</span>
            </div>

            <p style={{ fontFamily: font.body, fontSize: 14, color: palette.textDim, margin: "0 0 4px 0" }}>
              한자 풀이
            </p>
            <p style={{ fontFamily: font.mono, fontSize: 13, color: palette.text, margin: "0 0 16px 0", lineHeight: 1.8 }}>
              {item.breakdown}
            </p>

            <p style={{ fontFamily: font.body, fontSize: 15, color: palette.text, margin: "0 0 8px 0", lineHeight: 1.7 }}>
              {item.meaning}
            </p>
            <p style={{ fontFamily: font.body, fontSize: 13, color: palette.textDim, fontStyle: "italic", margin: "0 0 16px 0" }}>
              {item.englishMeaning}
            </p>

            <div style={{ background: palette.bg, borderRadius: 8, padding: 16, borderLeft: `3px solid ${palette.accentDim}` }}>
              <p style={{ fontFamily: font.body, fontSize: 14, color: palette.text, margin: 0, lineHeight: 1.7 }}>
                {item.example}
              </p>
            </div>

            <p style={{ fontFamily: font.body, fontSize: 13, color: palette.textDim, marginTop: 12, lineHeight: 1.6 }}>
              💡 {item.context}
            </p>
          </div>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
        <button
          onClick={() => { setIdx(Math.max(0, idx - 1)); setFlipped(false); }}
          disabled={idx === 0}
          style={{
            background: "transparent",
            border: `1px solid ${palette.border}`,
            color: idx === 0 ? palette.border : palette.textDim,
            padding: "10px 24px",
            borderRadius: 8,
            cursor: idx === 0 ? "default" : "pointer",
            fontFamily: font.body,
            fontSize: 14,
          }}
        >
          ← 이전
        </button>
        <button
          onClick={() => { setIdx(Math.min(idiomData.length - 1, idx + 1)); setFlipped(false); }}
          disabled={idx === idiomData.length - 1}
          style={{
            background: idx === idiomData.length - 1 ? palette.border : palette.accent,
            border: "none",
            color: idx === idiomData.length - 1 ? palette.textDim : palette.bg,
            padding: "10px 24px",
            borderRadius: 8,
            cursor: idx === idiomData.length - 1 ? "default" : "pointer",
            fontFamily: font.body,
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          다음 →
        </button>
      </div>
    </div>
  );
}

// ── Business Mode ──────────────────────────────────────────────────
function BusinessMode() {
  const { businessData } = useAppData();
  const [idx, setIdx] = useState(0);
  const [showCasual, setShowCasual] = useState(false);
  const item = businessData[idx];

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", animation: "fadeIn 0.5s ease" }}>
      <ProgressDots total={businessData.length} current={idx} />

      <div
        style={{
          background: palette.surface,
          border: `1px solid ${palette.border}`,
          borderRadius: 14,
          padding: 32,
          marginTop: 16,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <Tag>{item.register}</Tag>
          <span style={{ fontFamily: font.mono, fontSize: 12, color: palette.textDim }}>
            {idx + 1}/{businessData.length}
          </span>
        </div>

        <h2 style={{ fontFamily: font.display, fontSize: 22, color: palette.accent, margin: "0 0 24px 0", fontWeight: 400 }}>
          {item.situation}
        </h2>

        <div style={{ marginBottom: 20 }}>
          <p style={{ fontFamily: font.body, fontSize: 12, color: palette.accentDim, margin: "0 0 8px 0", textTransform: "uppercase", letterSpacing: 1 }}>
            격식체 (Formal)
          </p>
          <div style={{ background: palette.bg, borderRadius: 8, padding: 20, borderLeft: `3px solid ${palette.accent}` }}>
            <p style={{ fontFamily: font.body, fontSize: 15, color: palette.text, margin: 0, lineHeight: 1.8 }}>
              {item.formal}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCasual(!showCasual)}
          style={{
            background: "transparent",
            border: `1px solid ${palette.border}`,
            color: palette.textDim,
            padding: "8px 16px",
            borderRadius: 6,
            cursor: "pointer",
            fontFamily: font.body,
            fontSize: 13,
            marginBottom: showCasual ? 16 : 0,
            transition: "all 0.2s ease",
          }}
        >
          {showCasual ? "▾ 비격식체 숨기기" : "▸ 비격식체 비교하기"}
        </button>

        {showCasual && (
          <div style={{ animation: "fadeIn 0.3s ease", marginBottom: 20 }}>
            <p style={{ fontFamily: font.body, fontSize: 12, color: palette.textDim, margin: "0 0 8px 0", textTransform: "uppercase", letterSpacing: 1 }}>
              비격식체 (Casual)
            </p>
            <div style={{ background: palette.bg, borderRadius: 8, padding: 20, borderLeft: `3px solid ${palette.textDim}` }}>
              <p style={{ fontFamily: font.body, fontSize: 15, color: palette.textDim, margin: 0, lineHeight: 1.8 }}>
                {item.casual}
              </p>
            </div>
          </div>
        )}

        <div style={{ marginTop: 20 }}>
          <p style={{ fontFamily: font.body, fontSize: 12, color: palette.accentDim, margin: "0 0 8px 0" }}>
            핵심 표현
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
            {item.keyPhrases.map((kp) => (
              <Tag key={kp}>{kp}</Tag>
            ))}
          </div>
          <p style={{ fontFamily: font.body, fontSize: 14, color: palette.text, lineHeight: 1.7, margin: 0 }}>
            {item.notes}
          </p>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
        <button
          onClick={() => { setIdx(Math.max(0, idx - 1)); setShowCasual(false); }}
          disabled={idx === 0}
          style={{
            background: "transparent",
            border: `1px solid ${palette.border}`,
            color: idx === 0 ? palette.border : palette.textDim,
            padding: "10px 24px",
            borderRadius: 8,
            cursor: idx === 0 ? "default" : "pointer",
            fontFamily: font.body,
            fontSize: 14,
          }}
        >
          ← 이전
        </button>
        <button
          onClick={() => { setIdx(Math.min(businessData.length - 1, idx + 1)); setShowCasual(false); }}
          disabled={idx === businessData.length - 1}
          style={{
            background: idx === businessData.length - 1 ? palette.border : palette.accent,
            border: "none",
            color: idx === businessData.length - 1 ? palette.textDim : palette.bg,
            padding: "10px 24px",
            borderRadius: 8,
            cursor: idx === businessData.length - 1 ? "default" : "pointer",
            fontFamily: font.body,
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          다음 →
        </button>
      </div>
    </div>
  );
}

// ── Vocab Mode ─────────────────────────────────────────────────────
function VocabMode() {
  const { vocabData, vocabCategories } = useAppData();
  const [catFilter, setCatFilter] = useState("all");
  const [idx, setIdx] = useState(0);
  const [practiceMode, setPracticeMode] = useState("study"); // study | cloze | synonym
  const [showAnswer, setShowAnswer] = useState(false);
  const [synAnswer, setSynAnswer] = useState(null);
  const [expanded, setExpanded] = useState(false);

  const filtered = catFilter === "all" ? vocabData : vocabData.filter((v) => v.category === catFilter);
  const item = filtered[idx] || filtered[0];

  const resetCard = () => { setShowAnswer(false); setSynAnswer(null); setExpanded(false); };
  const goNext = () => { setIdx(Math.min(filtered.length - 1, idx + 1)); resetCard(); };
  const goPrev = () => { setIdx(Math.max(0, idx - 1)); resetCard(); };

  useEffect(() => { setIdx(0); resetCard(); }, [catFilter, practiceMode]);

  // Generate synonym matching options
  const getSynonymOptions = () => {
    if (!item) return [];
    const correct = item.synonyms[0];
    const allWords = vocabData.filter((v) => v.word !== item.word).map((v) => v.word);
    const distractors = allWords.sort(() => Math.random() - 0.5).slice(0, 3);
    const options = [correct, ...distractors].sort(() => Math.random() - 0.5);
    return options;
  };

  const [synOptions] = useState(() => {
    // Pre-generate for each card
    const map = {};
    vocabData.forEach((v, i) => {
      const correct = v.synonyms[0];
      const others = vocabData.filter((x) => x.word !== v.word).map((x) => x.word);
      const picks = others.sort(() => Math.random() - 0.5).slice(0, 3);
      map[i] = [correct, ...picks].sort(() => Math.random() - 0.5);
    });
    return map;
  });

  const globalIdx = vocabData.indexOf(item);

  return (
    <div style={{ maxWidth: 620, margin: "0 auto", animation: "fadeIn 0.5s ease" }}>
      {/* Category filter tabs */}
      <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap", marginBottom: 12 }}>
        {[{ key: "all", label: "전체" }, ...Object.entries(vocabCategories).map(([k, v]) => ({ key: v, label: v }))].map((c) => (
          <button
            key={c.key}
            onClick={() => setCatFilter(c.key)}
            style={{
              background: catFilter === c.key ? palette.accentGlow : "transparent",
              border: `1px solid ${catFilter === c.key ? palette.accentDim : palette.border}`,
              color: catFilter === c.key ? palette.accent : palette.textDim,
              padding: "6px 14px",
              borderRadius: 6,
              cursor: "pointer",
              fontFamily: font.body,
              fontSize: 12,
              transition: "all 0.2s ease",
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Practice mode toggle */}
      <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 16 }}>
        {[
          { key: "study", label: "📖 학습", desc: "Study" },
          { key: "cloze", label: "✏️ 빈칸", desc: "Cloze" },
          { key: "synonym", label: "🔗 유의어", desc: "Synonyms" },
        ].map((m) => (
          <button
            key={m.key}
            onClick={() => setPracticeMode(m.key)}
            style={{
              background: practiceMode === m.key ? palette.accent : "transparent",
              border: `1px solid ${practiceMode === m.key ? palette.accent : palette.border}`,
              color: practiceMode === m.key ? palette.bg : palette.textDim,
              padding: "7px 16px",
              borderRadius: 6,
              cursor: "pointer",
              fontFamily: font.body,
              fontSize: 13,
              fontWeight: practiceMode === m.key ? 600 : 400,
              transition: "all 0.2s ease",
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      <ProgressDots total={filtered.length} current={idx} />

      {/* Main Card */}
      <div style={{ background: palette.surface, border: `1px solid ${palette.border}`, borderRadius: 14, padding: 32, marginTop: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <Tag>{item.category}</Tag>
          <span style={{ fontFamily: font.mono, fontSize: 12, color: palette.textDim }}>
            {idx + 1}/{filtered.length}
          </span>
        </div>

        {/* Word Header */}
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontFamily: font.display, fontSize: 30, color: palette.accent, margin: "0 0 4px 0", fontWeight: 400 }}>
            {item.word}
          </h2>
          {item.hanja && (
            <span style={{ fontFamily: font.mono, fontSize: 14, color: palette.textDim }}>{item.hanja}</span>
          )}
        </div>

        {/* ─── Study Mode ─── */}
        {practiceMode === "study" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <p style={{ fontFamily: font.body, fontSize: 15, color: palette.text, margin: "0 0 4px 0", lineHeight: 1.7 }}>
              {item.korean_def}
            </p>
            <p style={{ fontFamily: font.body, fontSize: 13, color: palette.textDim, fontStyle: "italic", margin: "0 0 20px 0" }}>
              {item.meaning}
            </p>

            <div style={{ background: palette.bg, borderRadius: 8, padding: 18, borderLeft: `3px solid ${palette.accentDim}`, marginBottom: 16 }}>
              <p style={{ fontFamily: font.body, fontSize: 15, color: palette.text, margin: 0, lineHeight: 1.8 }}>
                {item.example}
              </p>
            </div>

            <button
              onClick={() => setExpanded(!expanded)}
              style={{
                background: "transparent",
                border: "none",
                color: palette.accentDim,
                fontFamily: font.body,
                fontSize: 13,
                cursor: "pointer",
                padding: "4px 0",
              }}
            >
              {expanded ? "▾ 유의어/반의어 접기" : "▸ 유의어/반의어 보기"}
            </button>

            {expanded && (
              <div style={{ marginTop: 12, animation: "fadeIn 0.3s ease" }}>
                {item.synonyms.length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    <span style={{ fontFamily: font.body, fontSize: 12, color: palette.accentDim }}>유의어: </span>
                    {item.synonyms.map((s) => <Tag key={s}>{s}</Tag>)}
                  </div>
                )}
                {item.antonyms && item.antonyms.length > 0 && (
                  <div>
                    <span style={{ fontFamily: font.body, fontSize: 12, color: palette.textDim }}>반의어: </span>
                    {item.antonyms.map((a) => (
                      <span key={a} style={{
                        display: "inline-block", padding: "3px 10px", borderRadius: 4,
                        background: "rgba(255,107,107,0.08)", color: "#cc8888",
                        fontSize: 12, fontFamily: font.body, marginLeft: 4,
                      }}>{a}</span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ─── Cloze Mode ─── */}
        {practiceMode === "cloze" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <p style={{ fontFamily: font.body, fontSize: 13, color: palette.textDim, margin: "0 0 16px 0" }}>
              다음 빈칸에 알맞은 단어를 생각해 보세요.
            </p>
            <div style={{ background: palette.bg, borderRadius: 8, padding: 20, marginBottom: 20, borderLeft: `3px solid ${palette.accentDim}` }}>
              <p style={{ fontFamily: font.body, fontSize: 16, color: palette.text, margin: 0, lineHeight: 1.9 }}>
                {item.cloze}
              </p>
            </div>

            <button
              onClick={() => setShowAnswer(!showAnswer)}
              style={{
                background: showAnswer ? palette.accent : "transparent",
                color: showAnswer ? palette.bg : palette.accent,
                border: `1px solid ${palette.accent}`,
                padding: "10px 24px",
                borderRadius: 6,
                cursor: "pointer",
                fontFamily: font.body,
                fontSize: 14,
                transition: "all 0.2s ease",
              }}
            >
              {showAnswer ? `정답: ${item.cloze_answer}` : "정답 확인"}
            </button>

            {showAnswer && (
              <div style={{ marginTop: 16, animation: "fadeIn 0.3s ease" }}>
                <p style={{ fontFamily: font.body, fontSize: 14, color: palette.text, lineHeight: 1.7, margin: 0 }}>
                  <span style={{ color: palette.accentDim }}>뜻:</span> {item.korean_def}
                </p>
                <p style={{ fontFamily: font.body, fontSize: 13, color: palette.textDim, fontStyle: "italic", marginTop: 4 }}>
                  {item.meaning}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ─── Synonym Matching Mode ─── */}
        {practiceMode === "synonym" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <p style={{ fontFamily: font.body, fontSize: 14, color: palette.text, margin: "0 0 4px 0" }}>
              {item.korean_def}
            </p>
            <p style={{ fontFamily: font.body, fontSize: 13, color: palette.textDim, margin: "0 0 20px 0", fontStyle: "italic" }}>
              {item.meaning}
            </p>

            <p style={{ fontFamily: font.body, fontSize: 13, color: palette.accentDim, margin: "0 0 12px 0" }}>
              위 단어의 유의어를 고르세요:
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {(synOptions[globalIdx] || []).map((opt, i) => {
                const isCorrect = item.synonyms.includes(opt);
                let bg = palette.bg;
                let borderColor = palette.border;
                let color = palette.text;

                if (synAnswer !== null) {
                  if (opt === synAnswer && isCorrect) {
                    bg = "rgba(107, 203, 119, 0.1)";
                    borderColor = palette.correct;
                    color = palette.correct;
                  } else if (opt === synAnswer && !isCorrect) {
                    bg = "rgba(255, 107, 107, 0.1)";
                    borderColor = palette.incorrect;
                    color = palette.incorrect;
                  } else if (isCorrect) {
                    bg = "rgba(107, 203, 119, 0.06)";
                    borderColor = palette.correct;
                    color = palette.correct;
                  }
                }

                return (
                  <button
                    key={i}
                    onClick={() => { if (synAnswer === null) setSynAnswer(opt); }}
                    style={{
                      background: bg,
                      border: `1px solid ${borderColor}`,
                      borderRadius: 8,
                      padding: "12px 18px",
                      cursor: synAnswer === null ? "pointer" : "default",
                      textAlign: "left",
                      fontFamily: font.body,
                      fontSize: 15,
                      color,
                      transition: "all 0.2s ease",
                    }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {synAnswer !== null && (
              <div style={{ marginTop: 16, animation: "fadeIn 0.3s ease" }}>
                <p style={{ fontFamily: font.body, fontSize: 14, color: palette.text, margin: 0 }}>
                  <span style={{ color: palette.accentDim }}>유의어:</span> {item.synonyms.join(", ")}
                  {item.antonyms && item.antonyms.length > 0 && (
                    <span style={{ color: palette.textDim }}> · 반의어: {item.antonyms.join(", ")}</span>
                  )}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
        <button
          onClick={goPrev}
          disabled={idx === 0}
          style={{
            background: "transparent",
            border: `1px solid ${palette.border}`,
            color: idx === 0 ? palette.border : palette.textDim,
            padding: "10px 24px",
            borderRadius: 8,
            cursor: idx === 0 ? "default" : "pointer",
            fontFamily: font.body,
            fontSize: 14,
          }}
        >
          ← 이전
        </button>
        <button
          onClick={goNext}
          disabled={idx === filtered.length - 1}
          style={{
            background: idx === filtered.length - 1 ? palette.border : palette.accent,
            border: "none",
            color: idx === filtered.length - 1 ? palette.textDim : palette.bg,
            padding: "10px 24px",
            borderRadius: 8,
            cursor: idx === filtered.length - 1 ? "default" : "pointer",
            fontFamily: font.body,
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          다음 →
        </button>
      </div>
    </div>
  );
}

// ── Reading/Writing Mode ───────────────────────────────────────────
function ReadingMode() {
  const { articleData, vocabData } = useAppData();
  const PHASES = { SELECT: "select", READ: "read", SHORT: "short", WRITE: "write", FEEDBACK: "feedback" };

  const [phase, setPhase] = useState(PHASES.SELECT);
  const [article, setArticle] = useState(null);
  const [aiArticle, setAiArticle] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [shortAnswers, setShortAnswers] = useState({});
  const [shortResults, setShortResults] = useState(null);
  const [writingIdx, setWritingIdx] = useState(0);
  const [writingText, setWritingText] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [showVocab, setShowVocab] = useState(false);

  const currentArticle = aiArticle || article;

  const generateAiArticle = async (topic) => {
    setAiLoading(true);
    try {
      const vocabList = vocabData.map((v) => v.word).join(", ");
      const parsed = await callAI(`TOPIK 5-6급 수준의 한국어 기사를 JSON으로 생성하세요. 주제: ${topic}. PE(사모펀드) 종사자에게 유용한 맥락을 포함하세요.

다음 어휘를 최소 6개 이상 자연스럽게 포함하세요: ${vocabList}

JSON 형식 (JSON만 출력, 마크다운 금지):
{"topic":"주제","title":"제목","vocabUsed":["사용된어휘들"],"body":"기사 본문 (3문단, 각 문단 3-4문장)","shortQuestions":[{"q":"단답형질문","answer":"모범답안"},{"q":"질문2","answer":"답2"},{"q":"질문3","answer":"답3"}],"writingPrompts":[{"prompt":"서술형 질문1","hint":"힌트1"},{"prompt":"서술형 질문2","hint":"힌트2"}]}`);
      parsed.id = "ai";
      setAiArticle(parsed);
      setArticle(parsed);
      setPhase(PHASES.READ);
    } catch (err) {
      console.error("AI article generation failed:", err);
    }
    setAiLoading(false);
  };

  const submitWriting = async () => {
    setFeedbackLoading(true);
    try {
      const wp = currentArticle.writingPrompts[writingIdx];
      const parsed = await callAI(`한국어 고급 학습자(TOPIK 5-6급, PE 업계 종사자)의 작문을 분석해 주세요. 주로 한국어로 피드백하되, 복잡한 설명은 영어를 보충해 주세요.

기사 제목: ${currentArticle.title}
작문 과제: ${wp.prompt}
학습자의 답안:
${writingText}

다음 항목을 분석하여 JSON으로만 응답하세요 (마크다운 금지):
{"score":0-100점수,"summary":"전반적 평가 2-3문장","grammar":{"errors":[{"original":"틀린부분","corrected":"교정","explanation":"설명"}],"praise":"잘한 문법 포인트"},"vocabulary":{"used":["사용된 목표 어휘"],"missed":["사용하면 좋았을 어휘"],"feedback":"어휘 사용에 대한 피드백"},"content":{"strengths":"내용의 강점","improvements":"개선할 점"},"rewrite":"교정 및 개선된 모범 답안"}`);
      setFeedback(parsed);
      setPhase(PHASES.FEEDBACK);
    } catch (err) {
      console.error("Feedback generation failed:", err);
      setFeedback({ score: 0, summary: "피드백 생성에 실패했습니다. 다시 시도해 주세요.", grammar: { errors: [], praise: "" }, vocabulary: { used: [], missed: [], feedback: "" }, content: { strengths: "", improvements: "" }, rewrite: "" });
      setPhase(PHASES.FEEDBACK);
    }
    setFeedbackLoading(false);
  };

  const resetAll = () => {
    setPhase(PHASES.SELECT);
    setArticle(null);
    setAiArticle(null);
    setShortAnswers({});
    setShortResults(null);
    setWritingIdx(0);
    setWritingText("");
    setFeedback(null);
  };

  // ── Select Screen ──
  if (phase === PHASES.SELECT) {
    const topics = ["금융/경제", "사회/시사", "기술", "문화"];
    return (
      <div style={{ maxWidth: 600, margin: "0 auto", animation: "fadeIn 0.5s ease" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontFamily: font.display, fontSize: 40, color: palette.accent, marginBottom: 8 }}>讀</div>
          <h2 style={{ fontFamily: font.display, fontSize: 24, color: palette.text, fontWeight: 400, margin: "0 0 8px 0" }}>읽기 · 쓰기 연습</h2>
          <p style={{ fontFamily: font.body, fontSize: 13, color: palette.textDim, margin: 0 }}>기사를 읽고 → 단답형으로 이해도 확인 → 서술형으로 쓰기 연습</p>
        </div>

        <div style={{ background: palette.surface, border: `1px solid ${palette.border}`, borderRadius: 14, padding: 28, marginBottom: 20 }}>
          <p style={{ fontFamily: font.body, fontSize: 13, color: palette.accentDim, margin: "0 0 16px 0" }}>📰 준비된 기사 선택</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {articleData.map((a) => (
              <button
                key={a.id}
                onClick={() => { setArticle(a); setAiArticle(null); setPhase(PHASES.READ); }}
                style={{
                  background: palette.bg, border: `1px solid ${palette.border}`, borderRadius: 10,
                  padding: "16px 20px", cursor: "pointer", textAlign: "left", transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = palette.accentDim; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = palette.border; }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <Tag>{a.topic}</Tag>
                    <p style={{ fontFamily: font.display, fontSize: 16, color: palette.text, margin: "8px 0 4px 0" }}>{a.title}</p>
                    <p style={{ fontFamily: font.body, fontSize: 12, color: palette.textDim, margin: 0 }}>목표 어휘 {a.vocabUsed.length}개 포함</p>
                  </div>
                  <span style={{ color: palette.textDim, fontSize: 20 }}>→</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div style={{ background: palette.surface, border: `1px solid ${palette.border}`, borderRadius: 14, padding: 28 }}>
          <p style={{ fontFamily: font.body, fontSize: 13, color: palette.accentDim, margin: "0 0 16px 0" }}>🤖 AI 기사 생성</p>
          <p style={{ fontFamily: font.body, fontSize: 12, color: palette.textDim, margin: "0 0 12px 0" }}>
            현재 학습 어휘를 기반으로 새로운 기사를 생성합니다
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {topics.map((t) => (
              <button
                key={t}
                onClick={() => generateAiArticle(t)}
                disabled={aiLoading}
                style={{
                  background: "transparent", border: `1px solid ${palette.accentDim}`,
                  color: palette.accent, padding: "8px 16px", borderRadius: 6,
                  cursor: aiLoading ? "wait" : "pointer", fontFamily: font.body, fontSize: 13,
                  opacity: aiLoading ? 0.5 : 1, transition: "all 0.2s ease",
                }}
              >
                {t}
              </button>
            ))}
          </div>
          {aiLoading && (
            <p style={{ fontFamily: font.body, fontSize: 13, color: palette.accentDim, marginTop: 12 }}>
              ⏳ AI가 기사를 생성하고 있습니다...
            </p>
          )}
        </div>
      </div>
    );
  }

  // ── Read Screen ──
  if (phase === PHASES.READ) {
    return (
      <div style={{ maxWidth: 660, margin: "0 auto", animation: "fadeIn 0.5s ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <button onClick={resetAll} style={{ background: "transparent", border: "none", color: palette.textDim, cursor: "pointer", fontFamily: font.body, fontSize: 13 }}>← 기사 목록</button>
          <Tag>{currentArticle.topic}</Tag>
        </div>

        <div style={{ background: palette.surface, border: `1px solid ${palette.border}`, borderRadius: 14, padding: 32 }}>
          <h2 style={{ fontFamily: font.display, fontSize: 22, color: palette.accent, fontWeight: 400, margin: "0 0 20px 0", lineHeight: 1.5 }}>
            {currentArticle.title}
          </h2>

          <div style={{ fontFamily: font.body, fontSize: 15, color: palette.text, lineHeight: 2, whiteSpace: "pre-wrap" }}>
            {currentArticle.body}
          </div>

          <button
            onClick={() => setShowVocab(!showVocab)}
            style={{
              marginTop: 20, background: "transparent", border: "none",
              color: palette.accentDim, fontFamily: font.body, fontSize: 13, cursor: "pointer",
            }}
          >
            {showVocab ? "▾ 목표 어휘 접기" : "▸ 이 기사의 목표 어휘 보기"}
          </button>

          {showVocab && (
            <div style={{ marginTop: 12, display: "flex", gap: 6, flexWrap: "wrap", animation: "fadeIn 0.3s ease" }}>
              {currentArticle.vocabUsed.map((v) => <Tag key={v}>{v}</Tag>)}
            </div>
          )}
        </div>

        <button
          onClick={() => { setPhase(PHASES.SHORT); setShortAnswers({}); setShortResults(null); }}
          style={{
            marginTop: 20, width: "100%", background: palette.accent, border: "none",
            color: palette.bg, padding: "14px 0", borderRadius: 8, cursor: "pointer",
            fontFamily: font.body, fontSize: 15, fontWeight: 600,
          }}
        >
          이해도 확인 (단답형) →
        </button>
      </div>
    );
  }

  // ── Short Answer Screen ──
  if (phase === PHASES.SHORT) {
    const qs = currentArticle.shortQuestions;
    const allAnswered = qs.every((_, i) => shortAnswers[i] && shortAnswers[i].trim());

    const checkAnswers = () => {
      const results = qs.map((q, i) => ({
        question: q.q,
        userAnswer: shortAnswers[i] || "",
        correctAnswer: q.answer,
      }));
      setShortResults(results);
    };

    return (
      <div style={{ maxWidth: 620, margin: "0 auto", animation: "fadeIn 0.5s ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <button onClick={() => setPhase(PHASES.READ)} style={{ background: "transparent", border: "none", color: palette.textDim, cursor: "pointer", fontFamily: font.body, fontSize: 13 }}>← 기사로 돌아가기</button>
          <Tag>1단계: 단답형</Tag>
        </div>

        <div style={{ background: palette.surface, border: `1px solid ${palette.border}`, borderRadius: 14, padding: 28 }}>
          <h3 style={{ fontFamily: font.display, fontSize: 18, color: palette.accent, fontWeight: 400, margin: "0 0 24px 0" }}>이해도 확인 질문</h3>

          {qs.map((q, i) => (
            <div key={i} style={{ marginBottom: 24 }}>
              <p style={{ fontFamily: font.body, fontSize: 14, color: palette.text, margin: "0 0 8px 0", lineHeight: 1.6 }}>
                <span style={{ color: palette.accentDim, fontFamily: font.mono, fontSize: 12, marginRight: 8 }}>Q{i + 1}</span>
                {q.q}
              </p>
              <input
                type="text"
                value={shortAnswers[i] || ""}
                onChange={(e) => setShortAnswers({ ...shortAnswers, [i]: e.target.value })}
                placeholder="답을 입력하세요..."
                disabled={!!shortResults}
                style={{
                  width: "100%", background: palette.bg, border: `1px solid ${palette.border}`,
                  borderRadius: 8, padding: "12px 16px", color: palette.text,
                  fontFamily: font.body, fontSize: 14, outline: "none", boxSizing: "border-box",
                }}
              />
              {shortResults && (
                <div style={{ marginTop: 8, animation: "fadeIn 0.3s ease" }}>
                  <p style={{ fontFamily: font.body, fontSize: 13, color: palette.correct, margin: "0 0 2px 0" }}>
                    모범 답안: {q.answer}
                  </p>
                </div>
              )}
            </div>
          ))}

          {!shortResults ? (
            <button
              onClick={checkAnswers}
              disabled={!allAnswered}
              style={{
                width: "100%", background: allAnswered ? palette.accent : palette.border,
                border: "none", color: allAnswered ? palette.bg : palette.textDim,
                padding: "12px 0", borderRadius: 8, cursor: allAnswered ? "pointer" : "default",
                fontFamily: font.body, fontSize: 14, fontWeight: 600,
              }}
            >
              답안 확인하기
            </button>
          ) : (
            <button
              onClick={() => { setWritingIdx(0); setWritingText(""); setFeedback(null); setPhase(PHASES.WRITE); }}
              style={{
                width: "100%", background: palette.accent, border: "none", color: palette.bg,
                padding: "12px 0", borderRadius: 8, cursor: "pointer",
                fontFamily: font.body, fontSize: 14, fontWeight: 600,
              }}
            >
              서술형 쓰기 연습으로 →
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Writing Screen ──
  if (phase === PHASES.WRITE) {
    const wp = currentArticle.writingPrompts[writingIdx];
    return (
      <div style={{ maxWidth: 620, margin: "0 auto", animation: "fadeIn 0.5s ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <button onClick={() => setPhase(PHASES.SHORT)} style={{ background: "transparent", border: "none", color: palette.textDim, cursor: "pointer", fontFamily: font.body, fontSize: 13 }}>← 단답형으로</button>
          <Tag>2단계: 서술형</Tag>
        </div>

        <div style={{ background: palette.surface, border: `1px solid ${palette.border}`, borderRadius: 14, padding: 28 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            {currentArticle.writingPrompts.map((_, i) => (
              <button
                key={i}
                onClick={() => { setWritingIdx(i); setWritingText(""); setFeedback(null); }}
                style={{
                  background: writingIdx === i ? palette.accentGlow : "transparent",
                  border: `1px solid ${writingIdx === i ? palette.accentDim : palette.border}`,
                  color: writingIdx === i ? palette.accent : palette.textDim,
                  padding: "6px 14px", borderRadius: 6, cursor: "pointer",
                  fontFamily: font.body, fontSize: 12,
                }}
              >
                과제 {i + 1}
              </button>
            ))}
          </div>

          <div style={{ background: palette.bg, borderRadius: 8, padding: 20, borderLeft: `3px solid ${palette.accentDim}`, marginBottom: 16 }}>
            <p style={{ fontFamily: font.body, fontSize: 15, color: palette.text, margin: "0 0 8px 0", lineHeight: 1.7 }}>
              {wp.prompt}
            </p>
            <p style={{ fontFamily: font.body, fontSize: 12, color: palette.textDim, margin: 0, fontStyle: "italic" }}>
              💡 {wp.hint}
            </p>
          </div>

          <textarea
            value={writingText}
            onChange={(e) => setWritingText(e.target.value)}
            placeholder="여기에 한국어로 작성하세요..."
            rows={8}
            style={{
              width: "100%", background: palette.bg, border: `1px solid ${palette.border}`,
              borderRadius: 8, padding: 16, color: palette.text, fontFamily: font.body,
              fontSize: 15, lineHeight: 1.9, outline: "none", resize: "vertical",
              boxSizing: "border-box",
            }}
          />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
            <span style={{ fontFamily: font.mono, fontSize: 12, color: palette.textDim }}>
              {writingText.length}자
            </span>
            <button
              onClick={submitWriting}
              disabled={writingText.trim().length < 20 || feedbackLoading}
              style={{
                background: writingText.trim().length >= 20 && !feedbackLoading ? palette.accent : palette.border,
                border: "none",
                color: writingText.trim().length >= 20 && !feedbackLoading ? palette.bg : palette.textDim,
                padding: "10px 28px", borderRadius: 8,
                cursor: writingText.trim().length >= 20 && !feedbackLoading ? "pointer" : "default",
                fontFamily: font.body, fontSize: 14, fontWeight: 600,
              }}
            >
              {feedbackLoading ? "⏳ AI 분석 중..." : "🤖 AI 피드백 받기"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Feedback Screen ──
  if (phase === PHASES.FEEDBACK && feedback) {
    return (
      <div style={{ maxWidth: 640, margin: "0 auto", animation: "fadeIn 0.5s ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <button onClick={() => { setPhase(PHASES.WRITE); setFeedback(null); }} style={{ background: "transparent", border: "none", color: palette.textDim, cursor: "pointer", fontFamily: font.body, fontSize: 13 }}>← 다시 쓰기</button>
          <Tag>AI 피드백</Tag>
        </div>

        {/* Score */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{
            display: "inline-block", width: 80, height: 80, borderRadius: "50%",
            border: `3px solid ${feedback.score >= 80 ? palette.correct : feedback.score >= 50 ? palette.accent : palette.incorrect}`,
            lineHeight: "80px", fontFamily: font.mono, fontSize: 28, color: palette.text,
          }}>
            {feedback.score}
          </div>
          <p style={{ fontFamily: font.body, fontSize: 15, color: palette.text, marginTop: 12, lineHeight: 1.7 }}>
            {feedback.summary}
          </p>
        </div>

        {/* Grammar */}
        <div style={{ background: palette.surface, border: `1px solid ${palette.border}`, borderRadius: 14, padding: 24, marginBottom: 16 }}>
          <h3 style={{ fontFamily: font.display, fontSize: 16, color: palette.accent, fontWeight: 400, margin: "0 0 16px 0" }}>📝 문법 분석</h3>
          {feedback.grammar.errors && feedback.grammar.errors.length > 0 ? (
            feedback.grammar.errors.map((err, i) => (
              <div key={i} style={{ marginBottom: 12, padding: 12, background: palette.bg, borderRadius: 8, borderLeft: `3px solid ${palette.incorrect}` }}>
                <p style={{ fontFamily: font.body, fontSize: 14, margin: "0 0 4px 0" }}>
                  <span style={{ color: palette.incorrect, textDecoration: "line-through" }}>{err.original}</span>
                  <span style={{ color: palette.textDim, margin: "0 8px" }}>→</span>
                  <span style={{ color: palette.correct }}>{err.corrected}</span>
                </p>
                <p style={{ fontFamily: font.body, fontSize: 12, color: palette.textDim, margin: 0 }}>{err.explanation}</p>
              </div>
            ))
          ) : (
            <p style={{ fontFamily: font.body, fontSize: 13, color: palette.correct, margin: 0 }}>문법 오류가 발견되지 않았습니다!</p>
          )}
          {feedback.grammar.praise && (
            <p style={{ fontFamily: font.body, fontSize: 13, color: palette.correct, marginTop: 8 }}>✓ {feedback.grammar.praise}</p>
          )}
        </div>

        {/* Vocabulary */}
        <div style={{ background: palette.surface, border: `1px solid ${palette.border}`, borderRadius: 14, padding: 24, marginBottom: 16 }}>
          <h3 style={{ fontFamily: font.display, fontSize: 16, color: palette.accent, fontWeight: 400, margin: "0 0 16px 0" }}>📚 어휘 분석</h3>
          {feedback.vocabulary.used && feedback.vocabulary.used.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <span style={{ fontFamily: font.body, fontSize: 12, color: palette.correct }}>사용한 목표 어휘: </span>
              {feedback.vocabulary.used.map((v) => <Tag key={v}>{v}</Tag>)}
            </div>
          )}
          {feedback.vocabulary.missed && feedback.vocabulary.missed.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <span style={{ fontFamily: font.body, fontSize: 12, color: palette.accentDim }}>활용하면 좋았을 어휘: </span>
              {feedback.vocabulary.missed.map((v) => (
                <span key={v} style={{ display: "inline-block", padding: "3px 10px", borderRadius: 4, background: "rgba(255,107,107,0.08)", color: "#cc8888", fontSize: 12, fontFamily: font.body, marginLeft: 4 }}>{v}</span>
              ))}
            </div>
          )}
          {feedback.vocabulary.feedback && (
            <p style={{ fontFamily: font.body, fontSize: 13, color: palette.text, marginTop: 8, lineHeight: 1.6 }}>{feedback.vocabulary.feedback}</p>
          )}
        </div>

        {/* Content */}
        <div style={{ background: palette.surface, border: `1px solid ${palette.border}`, borderRadius: 14, padding: 24, marginBottom: 16 }}>
          <h3 style={{ fontFamily: font.display, fontSize: 16, color: palette.accent, fontWeight: 400, margin: "0 0 12px 0" }}>💡 내용 분석</h3>
          {feedback.content.strengths && (
            <p style={{ fontFamily: font.body, fontSize: 13, color: palette.correct, margin: "0 0 8px 0", lineHeight: 1.6 }}>✓ {feedback.content.strengths}</p>
          )}
          {feedback.content.improvements && (
            <p style={{ fontFamily: font.body, fontSize: 13, color: palette.accentDim, margin: 0, lineHeight: 1.6 }}>△ {feedback.content.improvements}</p>
          )}
        </div>

        {/* Rewrite */}
        {feedback.rewrite && (
          <div style={{ background: palette.surface, border: `1px solid ${palette.border}`, borderRadius: 14, padding: 24, marginBottom: 16 }}>
            <h3 style={{ fontFamily: font.display, fontSize: 16, color: palette.accent, fontWeight: 400, margin: "0 0 12px 0" }}>✨ 모범 답안</h3>
            <p style={{ fontFamily: font.body, fontSize: 14, color: palette.text, margin: 0, lineHeight: 2, whiteSpace: "pre-wrap" }}>
              {feedback.rewrite}
            </p>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => { setPhase(PHASES.WRITE); setWritingText(""); setFeedback(null); }}
            style={{
              flex: 1, background: palette.accent, border: "none", color: palette.bg,
              padding: "12px 0", borderRadius: 8, cursor: "pointer",
              fontFamily: font.body, fontSize: 14, fontWeight: 600,
            }}
          >
            ✏️ 다시 쓰기
          </button>
          <button
            onClick={resetAll}
            style={{
              flex: 1, background: "transparent", border: `1px solid ${palette.border}`,
              color: palette.textDim, padding: "12px 0", borderRadius: 8, cursor: "pointer",
              fontFamily: font.body, fontSize: 14,
            }}
          >
            📰 다른 기사 선택
          </button>
        </div>
      </div>
    );
  }

  return null;
}

// ── Quiz Mode ──────────────────────────────────────────────────────
function QuizMode() {
  const { quizPool } = useAppData();
  const QUIZ_SIZES = [10, 15, 20];
  const CATS = ["전체", "문법", "사자성어", "비즈니스", "어휘"];

  const [catFilter, setCatFilter] = useState("전체");
  const [quizSize, setQuizSize] = useState(10);
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiQuestions, setAiQuestions] = useState([]);
  const [wrongOnes, setWrongOnes] = useState([]);

  const startQuiz = (extraQs?) => {
    const pool = catFilter === "전체" ? quizPool : quizPool.filter((q) => q.cat === catFilter);
    const shuffled = shuffleArray(pool).slice(0, quizSize);
    const combined = extraQs ? [...shuffled, ...extraQs] : shuffled;
    setQuestions(combined);
    setIdx(0);
    setSelected(null);
    setScore(0);
    setStarted(true);
    setFinished(false);
    setAiQuestions([]);
    setWrongOnes([]);
  };

  const handleSelect = (i) => {
    if (selected !== null) return;
    setSelected(i);
    if (i === questions[idx].correct) {
      setScore(score + 1);
    } else {
      setWrongOnes((prev) => [...prev, questions[idx]]);
    }
  };

  const handleNext = () => {
    if (idx < questions.length - 1) {
      setIdx(idx + 1);
      setSelected(null);
    } else {
      setFinished(true);
    }
  };

  const generateAI = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const topicHint = catFilter === "전체"
        ? "고급 한국어 문법, 사자성어, 비즈니스 한국어, 고급 어휘 (한자어, 고유어, 금융용어, 시사용어)"
        : catFilter;
      const parsed = await callAI(`TOPIK 5-6급 수준의 한국어 퀴즈 문제 5개를 JSON 배열로만 생성해 주세요. 주제: ${topicHint}. PE(사모펀드) 업계 종사자에게 유용한 금융/비즈니스 맥락도 포함해 주세요.

각 문제는 다음 형식이어야 합니다:
{"cat":"카테고리","question":"문제","options":["선택지1","선택지2","선택지3","선택지4"],"correct":정답인덱스(0-3),"explanation":"해설"}

JSON 배열만 출력하세요. 마크다운이나 다른 텍스트는 절대 포함하지 마세요.`);
      setAiQuestions(parsed);
    } catch (err: any) {
      console.error("AI generation failed:", err);
      setAiError(err.message || "AI 생성 실패");
      setAiQuestions([]);
    }
    setAiLoading(false);
  };

  // ── Setup Screen ──
  if (!started) {
    return (
      <div style={{ maxWidth: 500, margin: "0 auto", animation: "fadeIn 0.5s ease" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontFamily: font.display, fontSize: 40, color: palette.accent, marginBottom: 8 }}>試</div>
          <h2 style={{ fontFamily: font.display, fontSize: 24, color: palette.text, fontWeight: 400, margin: 0 }}>퀴즈 설정</h2>
        </div>

        <div style={{ background: palette.surface, border: `1px solid ${palette.border}`, borderRadius: 14, padding: 28 }}>
          <p style={{ fontFamily: font.body, fontSize: 13, color: palette.accentDim, margin: "0 0 10px 0" }}>카테고리</p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 24 }}>
            {CATS.map((c) => (
              <button
                key={c}
                onClick={() => setCatFilter(c)}
                style={{
                  background: catFilter === c ? palette.accentGlow : "transparent",
                  border: `1px solid ${catFilter === c ? palette.accentDim : palette.border}`,
                  color: catFilter === c ? palette.accent : palette.textDim,
                  padding: "7px 16px",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontFamily: font.body,
                  fontSize: 13,
                }}
              >
                {c}
              </button>
            ))}
          </div>

          <p style={{ fontFamily: font.body, fontSize: 13, color: palette.accentDim, margin: "0 0 10px 0" }}>문제 수</p>
          <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
            {QUIZ_SIZES.map((s) => (
              <button
                key={s}
                onClick={() => setQuizSize(s)}
                style={{
                  background: quizSize === s ? palette.accent : "transparent",
                  border: `1px solid ${quizSize === s ? palette.accent : palette.border}`,
                  color: quizSize === s ? palette.bg : palette.textDim,
                  padding: "8px 20px",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontFamily: font.mono,
                  fontSize: 14,
                  fontWeight: quizSize === s ? 600 : 400,
                }}
              >
                {s}문제
              </button>
            ))}
          </div>

          <p style={{ fontFamily: font.body, fontSize: 12, color: palette.textDim, margin: "0 0 20px 0" }}>
            {catFilter === "전체" ? quizPool.length : quizPool.filter((q) => q.cat === catFilter).length}개 문제 풀에서 랜덤 출제됩니다
          </p>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => startQuiz()}
              style={{
                flex: 1,
                background: palette.accent,
                border: "none",
                color: palette.bg,
                padding: "12px 0",
                borderRadius: 8,
                cursor: "pointer",
                fontFamily: font.body,
                fontSize: 15,
                fontWeight: 600,
              }}
            >
              시작하기
            </button>
            <button
              onClick={generateAI}
              disabled={aiLoading}
              style={{
                flex: 1,
                background: "transparent",
                border: `1px solid ${palette.accentDim}`,
                color: palette.accent,
                padding: "12px 0",
                borderRadius: 8,
                cursor: aiLoading ? "wait" : "pointer",
                fontFamily: font.body,
                fontSize: 14,
                opacity: aiLoading ? 0.5 : 1,
              }}
            >
              {aiLoading ? "⏳ AI 생성 중..." : "🤖 AI 문제 추가 생성"}
            </button>
          </div>

          {aiError && (
            <div style={{ marginTop: 16 }}>
              <p style={{ fontFamily: font.body, fontSize: 13, color: palette.incorrect, margin: 0 }}>
                ❌ AI 오류: {aiError}
              </p>
            </div>
          )}

          {aiQuestions.length > 0 && (
            <div style={{ marginTop: 16, animation: "fadeIn 0.3s ease" }}>
              <p style={{ fontFamily: font.body, fontSize: 13, color: palette.correct, margin: "0 0 8px 0" }}>
                ✅ AI 문제 {aiQuestions.length}개 생성 완료!
              </p>
              <button
                onClick={() => startQuiz(aiQuestions)}
                style={{
                  width: "100%",
                  background: palette.correct,
                  border: "none",
                  color: palette.bg,
                  padding: "10px 0",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontFamily: font.body,
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                기본 {quizSize}문제 + AI {aiQuestions.length}문제로 시작 →
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Results Screen ──
  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div style={{ maxWidth: 540, margin: "0 auto", animation: "fadeIn 0.5s ease", paddingTop: 20 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontFamily: font.display, fontSize: 64, color: palette.accent, marginBottom: 16 }}>
            {pct >= 80 ? "🎉" : pct >= 50 ? "👏" : "💪"}
          </div>
          <h2 style={{ fontFamily: font.display, fontSize: 28, color: palette.text, fontWeight: 400, margin: "0 0 8px 0" }}>
            결과: {score}/{questions.length} ({pct}%)
          </h2>
          <p style={{ fontFamily: font.body, fontSize: 16, color: palette.textDim, margin: "0 0 24px 0" }}>
            {pct >= 80 ? "훌륭합니다! 고급 수준의 실력이시네요." : pct >= 50 ? "좋은 출발입니다. 복습하면 더 좋아질 거예요." : "어려웠죠? 각 섹션을 복습해 보세요!"}
          </p>
        </div>

        {wrongOnes.length > 0 && (
          <div style={{ background: palette.surface, border: `1px solid ${palette.border}`, borderRadius: 14, padding: 24, marginBottom: 24 }}>
            <p style={{ fontFamily: font.body, fontSize: 14, color: palette.incorrect, margin: "0 0 16px 0", fontWeight: 600 }}>
              ✗ 틀린 문제 복습 ({wrongOnes.length}개)
            </p>
            {wrongOnes.map((q, i) => (
              <div key={i} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: i < wrongOnes.length - 1 ? `1px solid ${palette.border}` : "none" }}>
                <p style={{ fontFamily: font.body, fontSize: 14, color: palette.text, margin: "0 0 6px 0", lineHeight: 1.6 }}>
                  {q.question}
                </p>
                <p style={{ fontFamily: font.body, fontSize: 13, color: palette.correct, margin: "0 0 4px 0" }}>
                  → 정답: {q.options[q.correct]}
                </p>
                <p style={{ fontFamily: font.body, fontSize: 12, color: palette.textDim, margin: 0, lineHeight: 1.6 }}>
                  {q.explanation}
                </p>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => startQuiz()}
            style={{
              flex: 1,
              background: palette.accent,
              border: "none",
              color: palette.bg,
              padding: "12px 0",
              borderRadius: 8,
              cursor: "pointer",
              fontFamily: font.body,
              fontSize: 15,
              fontWeight: 600,
            }}
          >
            🔄 새 퀴즈 도전
          </button>
          <button
            onClick={() => { setStarted(false); setFinished(false); setAiQuestions([]); }}
            style={{
              flex: 1,
              background: "transparent",
              border: `1px solid ${palette.border}`,
              color: palette.textDim,
              padding: "12px 0",
              borderRadius: 8,
              cursor: "pointer",
              fontFamily: font.body,
              fontSize: 14,
            }}
          >
            ⚙️ 설정으로
          </button>
        </div>
      </div>
    );
  }

  // ── Question Screen ──
  const item = questions[idx];
  if (!item) return null;

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", animation: "fadeIn 0.5s ease" }}>
      {/* Progress bar */}
      <div style={{ background: palette.border, borderRadius: 4, height: 6, marginBottom: 16, overflow: "hidden" }}>
        <div
          style={{
            width: `${((idx + 1) / questions.length) * 100}%`,
            height: "100%",
            background: `linear-gradient(90deg, ${palette.accentDim}, ${palette.accent})`,
            borderRadius: 4,
            transition: "width 0.4s ease",
          }}
        />
      </div>

      <div style={{ background: palette.surface, border: `1px solid ${palette.border}`, borderRadius: 14, padding: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <Tag>{item.cat || "종합"}</Tag>
          <span style={{ fontFamily: font.mono, fontSize: 12, color: palette.textDim }}>
            {score}점 · {idx + 1}/{questions.length}
          </span>
        </div>

        <h2 style={{ fontFamily: font.display, fontSize: 20, color: palette.text, fontWeight: 400, margin: "0 0 24px 0", lineHeight: 1.6 }}>
          {item.question}
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {item.options.map((opt, i) => {
            let bg = palette.bg;
            let borderColor = palette.border;
            let color = palette.text;
            if (selected !== null) {
              if (i === item.correct) { bg = "rgba(107,203,119,0.1)"; borderColor = palette.correct; color = palette.correct; }
              else if (i === selected && i !== item.correct) { bg = "rgba(255,107,107,0.1)"; borderColor = palette.incorrect; color = palette.incorrect; }
            }
            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                style={{
                  background: bg, border: `1px solid ${borderColor}`, borderRadius: 8,
                  padding: "14px 20px", cursor: selected === null ? "pointer" : "default",
                  textAlign: "left", fontFamily: font.body, fontSize: 15, color, transition: "all 0.2s ease",
                }}
              >
                <span style={{ fontFamily: font.mono, fontSize: 12, marginRight: 12, opacity: 0.5 }}>
                  {String.fromCharCode(9312 + i)}
                </span>
                {opt}
              </button>
            );
          })}
        </div>

        {selected !== null && (
          <div style={{ marginTop: 20, animation: "fadeIn 0.3s ease" }}>
            <div style={{
              background: palette.bg, borderRadius: 8, padding: 16,
              borderLeft: `3px solid ${selected === item.correct ? palette.correct : palette.incorrect}`,
            }}>
              <p style={{ fontFamily: font.body, fontSize: 14, color: palette.text, margin: 0, lineHeight: 1.7 }}>
                {item.explanation}
              </p>
            </div>
            <button
              onClick={handleNext}
              style={{
                marginTop: 16, background: palette.accent, border: "none", color: palette.bg,
                padding: "10px 28px", borderRadius: 8, cursor: "pointer",
                fontFamily: font.body, fontSize: 14, fontWeight: 600, float: "right",
              }}
            >
              {idx < questions.length - 1 ? "다음 문제 →" : "결과 보기"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────────
export default function KoreanTutor({ onBackToUnits }: { onBackToUnits?: () => void }) {
  const [mode, setMode] = useState(MODES.HOME);
  const { selectedUnitId, units } = useAppData();
  const selectedUnit = units.find((u) => u.id === selectedUnitId);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: palette.bg,
        color: palette.text,
        fontFamily: font.body,
        padding: "24px 20px 60px",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;700&family=Noto+Sans+KR:wght@300;400;600&display=swap');
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        * { box-sizing: border-box; }
        button:focus { outline: 2px solid ${palette.accentDim}; outline-offset: 2px; }
        ::selection { background: ${palette.accentDim}; color: ${palette.bg}; }
      `}</style>

      {/* Back to units + unit label */}
      {onBackToUnits && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, maxWidth: 680, margin: "0 auto 16px" }}>
          <button
            onClick={onBackToUnits}
            style={{ background: "transparent", border: "none", color: palette.textDim, cursor: "pointer", fontFamily: font.body, fontSize: 13, padding: 0 }}
          >
            ← 커리큘럼
          </button>
          {selectedUnit && (
            <span style={{ fontFamily: font.body, fontSize: 12, color: palette.accentDim, background: palette.tag, padding: "2px 8px", borderRadius: 4 }}>
              Unit {selectedUnit.unit_number} · {selectedUnit.title}
            </span>
          )}
          {!selectedUnit && (
            <span style={{ fontFamily: font.body, fontSize: 12, color: palette.textDim }}>자유 학습 모드</span>
          )}
        </div>
      )}

      {mode !== MODES.HOME && (
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 24 }}>
          <NavButton label="홈" icon="⌂" active={false} onClick={() => setMode(MODES.HOME)} />
          <NavButton label="문법" icon="文" active={mode === MODES.GRAMMAR} onClick={() => setMode(MODES.GRAMMAR)} />
          <NavButton label="사자성어" icon="漢" active={mode === MODES.IDIOMS} onClick={() => setMode(MODES.IDIOMS)} />
          <NavButton label="비즈니스" icon="業" active={mode === MODES.BUSINESS} onClick={() => setMode(MODES.BUSINESS)} />
          <NavButton label="어휘" icon="語" active={mode === MODES.VOCAB} onClick={() => setMode(MODES.VOCAB)} />
          <NavButton label="읽기·쓰기" icon="讀" active={mode === MODES.READING} onClick={() => setMode(MODES.READING)} />
          <NavButton label="퀴즈" icon="試" active={mode === MODES.QUIZ} onClick={() => setMode(MODES.QUIZ)} />
        </div>
      )}

      {mode === MODES.HOME && <HomeScreen setMode={setMode} />}
      {mode === MODES.GRAMMAR && <GrammarMode />}
      {mode === MODES.IDIOMS && <IdiomMode />}
      {mode === MODES.BUSINESS && <BusinessMode />}
      {mode === MODES.VOCAB && <VocabMode />}
      {mode === MODES.READING && <ReadingMode />}
      {mode === MODES.QUIZ && <QuizMode />}
    </div>
  );
}
