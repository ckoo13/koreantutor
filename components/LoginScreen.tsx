"use client";
import { useState } from "react";
import { useAuth } from "@/lib/auth";

const palette = {
  bg: "#0F0F0F",
  surface: "#1A1A1A",
  accent: "#E8D5B7",
  accentDim: "#B8A080",
  text: "#F0EDE8",
  textDim: "#8A8580",
  border: "#2A2A2A",
  incorrect: "#FF6B6B",
};

const font = {
  display: "'Noto Serif KR', 'Georgia', serif",
  body: "'Noto Sans KR', 'Pretendard', sans-serif",
};

export default function LoginScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (mode === "signin") {
      const { error } = await signIn(email, password);
      if (error) setError(error.message);
    } else {
      const { error } = await signUp(email, password);
      if (error) setError(error.message);
      else setMessage("계정이 생성되었습니다. 이메일을 확인하여 인증을 완료해 주세요.");
    }

    setLoading(false);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: palette.surface,
    border: `1px solid ${palette.border}`,
    borderRadius: 8,
    padding: "12px 14px",
    color: palette.text,
    fontFamily: font.body,
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
  };

  const btnStyle: React.CSSProperties = {
    width: "100%",
    background: palette.accent,
    border: "none",
    borderRadius: 8,
    padding: "13px 0",
    color: palette.bg,
    fontFamily: font.body,
    fontSize: 15,
    fontWeight: 600,
    cursor: loading ? "wait" : "pointer",
    opacity: loading ? 0.7 : 1,
    marginTop: 8,
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: palette.bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
    }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 56, fontFamily: font.display, color: palette.accent, marginBottom: 8 }}>
            韓
          </div>
          <h1 style={{ fontFamily: font.display, color: palette.text, fontSize: 22, margin: "0 0 6px 0", fontWeight: 700 }}>
            고급 한국어 학습
          </h1>
          <p style={{ fontFamily: font.body, color: palette.textDim, fontSize: 13, margin: 0 }}>
            TOPIK 5–6 · PE Professional Korean
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: palette.surface,
          border: `1px solid ${palette.border}`,
          borderRadius: 12,
          padding: 28,
        }}>
          {/* Toggle */}
          <div style={{ display: "flex", marginBottom: 24, background: palette.bg, borderRadius: 8, padding: 4 }}>
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(null); setMessage(null); }}
                style={{
                  flex: 1,
                  padding: "8px 0",
                  background: mode === m ? palette.surface : "transparent",
                  border: "none",
                  borderRadius: 6,
                  color: mode === m ? palette.accent : palette.textDim,
                  fontFamily: font.body,
                  fontSize: 13,
                  fontWeight: mode === m ? 600 : 400,
                  cursor: "pointer",
                }}
              >
                {m === "signin" ? "로그인" : "회원가입"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontFamily: font.body, fontSize: 12, color: palette.textDim, marginBottom: 6 }}>
                이메일
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontFamily: font.body, fontSize: 12, color: palette.textDim, marginBottom: 6 }}>
                비밀번호
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder={mode === "signup" ? "6자 이상" : ""}
                style={inputStyle}
              />
            </div>

            {error && (
              <p style={{ fontFamily: font.body, fontSize: 13, color: palette.incorrect, margin: "0 0 12px 0" }}>
                {error}
              </p>
            )}
            {message && (
              <p style={{ fontFamily: font.body, fontSize: 13, color: "#6BCB77", margin: "0 0 12px 0" }}>
                {message}
              </p>
            )}

            <button type="submit" disabled={loading} style={btnStyle}>
              {loading ? "..." : mode === "signin" ? "로그인" : "계정 만들기"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
