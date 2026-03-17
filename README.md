# 고급 한국어 학습 | Korean Tutor

A personalized Korean language learning app for TOPIK 5-6 level learners, with a focus on PE/finance vocabulary, advanced grammar, and business Korean.

## Features

- **고급 문법** — Advanced grammar patterns with practice exercises
- **사자성어** — Four-character idioms with hanja breakdowns
- **비즈니스 한국어** — Formal/informal register comparisons
- **어휘력** — Vocabulary builder with cloze & synonym matching (4 categories)
- **읽기·쓰기** — Reading articles + AI-powered writing feedback
- **종합 퀴즈** — 38-question pool with shuffle + AI generation

## Quick Deploy (15-20 minutes)

### Prerequisites

1. **Node.js** (v18+): Download from https://nodejs.org/
2. **GitHub account**: https://github.com/signup
3. **Vercel account**: https://vercel.com/signup (sign up with GitHub)
4. **Anthropic API key**: https://console.anthropic.com/

### Step 1: Set up locally

```bash
# Clone or download this project, then:
cd korean-tutor
npm install
```

### Step 2: Add your API key

Create a file called `.env.local` in the project root:

```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

### Step 3: Test locally

```bash
npm run dev
```

Open http://localhost:3000 — you should see the app!

### Step 4: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit - Korean tutor app"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/korean-tutor.git
git push -u origin main
```

### Step 5: Deploy to Vercel

1. Go to https://vercel.com/new
2. Click "Import Git Repository" and select `korean-tutor`
3. In **Environment Variables**, add:
   - Key: `ANTHROPIC_API_KEY`
   - Value: your Anthropic API key
4. Click **Deploy**

Your app will be live at `https://korean-tutor-xxxxx.vercel.app` within ~60 seconds!

## Updating Vocabulary

The key benefit of this setup: **vocab lives in simple data files** you can edit.

To add new words, edit the files in `/data/`:

| File | What it contains |
|------|-----------------|
| `data/vocab.ts` | Vocabulary words (한자어, 고유어, 금융, 시사) |
| `data/grammar.ts` | Advanced grammar patterns |
| `data/idioms.ts` | 사자성어 with hanja breakdowns |
| `data/business.ts` | Business Korean register comparisons |
| `data/articles.ts` | Reading comprehension articles |
| `data/quiz.ts` | Quiz question pool |

After editing, just push to GitHub and Vercel auto-deploys:

```bash
git add .
git commit -m "Add new vocab set - week 3"
git push
```

## Project Structure

```
korean-tutor/
├── app/
│   ├── api/ai/route.ts    # Server-side API route for Claude calls
│   ├── layout.tsx          # Root HTML layout
│   └── page.tsx            # Main page
├── components/
│   └── KoreanTutor.tsx     # Main app component (all 6 modules)
├── data/
│   ├── vocab.ts            # ← Edit this to update vocabulary
│   ├── grammar.ts          # ← Edit this to update grammar
│   ├── idioms.ts           # ← Edit this to update idioms
│   ├── business.ts         # ← Edit this to update business Korean
│   ├── articles.ts         # ← Edit this to update reading articles
│   └── quiz.ts             # ← Edit this to update quiz questions
├── .env.local              # Your API key (never commit this!)
├── next.config.js
├── package.json
└── tsconfig.json
```

## Adding New Vocab (Example)

Open `data/vocab.ts` and add an entry:

```typescript
{
  category: "금융/비즈니스",
  word: "유동성",
  hanja: "流動性",
  meaning: "liquidity",
  korean_def: "자산을 현금으로 쉽게 전환할 수 있는 정도",
  example: "시장의 유동성이 풍부해지면서 자산 가격이 상승했다.",
  synonyms: ["현금성", "환금성"],
  antonyms: ["비유동성"],
  cloze: "중앙은행이 ___을 공급하면서 금융시장이 안정되었다.",
  cloze_answer: "유동성",
},
```

Then push — done! The new word appears in the app automatically.

## Cost

- **Vercel hosting**: Free tier (plenty for personal use)
- **Anthropic API**: ~$0.01-0.05 per AI generation (quiz, article, feedback)
- Estimated monthly cost with regular use: **$1-3**
