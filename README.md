# Intentional

> *"Don't give the user an empty box. Give them something worth thinking about."*
> — core interaction principle

**A quiet place to begin.**

Intentional is a mobile app built around short, deliberate practices — **Learn, Journal, Notice, Choose, and Zoom Out** — plus a memory practice, **Revisit**. Each is designed to feel like a moment of genuine attention rather than another feed to manage. The product's central bet is that software can create space for curiosity and reflection without turning it into a productivity metric.

**Platform:** iOS / Android — React Native + Expo
**Status:** V1 shipped · V2 (on-device Resonance Engine) in progress

---

## 01 · Product Overview

### Guiding product values

| Value | Meaning |
| --- | --- |
| **Clarity** | One primary action stands out on any given screen. |
| **Calm** | Generous whitespace and warm tones reduce mental clutter. |
| **Human** | Language that feels like a friend, not a taskmaster. |
| **Private** | User data stays on-device. No feeds, no streaks, no comparison. |

### Explicit non-goals (V1)

- No mood tracking or productivity metrics.
- No AI-generated summaries, insights, or content — prompts are hand-written and deterministic.
- No backend, accounts, or sync. All data is local (SQLite).
- No streaks, feeds, or social comparison of any kind.

---

## 02 · The Practices

### Learn — the ritual

A 10-minute immersive search. The user picks a curated question or types their own curiosity, sets an intention, and enters a cinematic dark-forest Challenge screen. The app gets out of the way while they search the real world, then walks them through a tactile Reflection to capture what they found.

**Flow:**

1. **Learn Home** — a place to begin, with the user's own curiosity or a curated question.
2. **Explore Questions** — curated prompts across categories (Science, History, People, Tech, Art).
3. **Set Your Intention** — a short moment to set focus before the search begins.
4. **The Challenge** — a focused 10-minute search. The user can leave the app; time keeps running.
5. **Paused** *(optional)* — the user can step away; the clock is safely paused.
6. **Finish Early** *(optional)* — when ready, move into reflection.

Supporting copy reinforces autonomy over compliance:
*"Search. Read. Follow the question. You can leave the app."* and, on exit, *"The best discoveries come from your own curiosity — go find out for yourself, you don't need to stay here."*

### Reflection — discovery capture

An empty textarea reads as a form and kills curiosity. The fix is the interaction model: small, tactile, initially-collapsed prompts that expand into a writing space only when tapped — the user is never confronted with a blank box.

| Before | After |
| --- | --- |
| Capture what you discovered | **What did you find?** |
| *(blank textarea)* | Tell yourself the story while it's still fresh. |
| What did you learn? | What is the one thing you don't want to forget? |
| What surprised you? | Anything that surprised you? |
| Did anything change your mind? | Did it change how you see the question? |
| Save discovery | **Keep this.** |

The flow ends with **Sources** (optional) and a **Folder** picker, then the primary action, *Keep this.*

### Journal — thinking without performing

Deliberately the simplest practice. Two doors: **Write something** or **Give me a question**.

> *JOURNAL — A place for thoughts that don't need anywhere else to go.*

- Free writing starts with a subtle *"What's on your mind?"* — once writing begins, the UI gets out of the way.
- Prompt mode offers one hand-written question at a time; no endless prompt feed.
- After writing, the app asks plainly: **"Keep this thought?"** — Keep / Discard. No success toasts.
- Recent entries are re-readable and editable.

### Notice — one quiet minute

A 60-second somatic pause. *"Look up."* The user observes their immediate surroundings, then captures a single line.

### Choose — attention is a choice

Two collapsed prompts: *What gets your attention today?* and *What are you setting down?* A practice about naming where energy goes — and what stops being carried.

### Zoom Out — see it from further away

An atmospheric, dark-mode practice. It takes a recently kept discovery and asks: *What is this a part of?* and *How does this connect to what you already know?* In V2, the Resonance Engine quietly surfaces a past note that echoes the subject.

### Revisit — memory is a practice

Discoveries ripen for a few days before they're worth revisiting. The user writes what they remember, then reveals the original — a gentle comparison, never a score. In V2, the surfaced discovery is chosen by **meaning**, not by chance.

---

## 03 · Visual Identity

The direction is editorial, not SaaS: warm ivory and deep forest tones with a muted bronze accent, serif display type for headlines, and the user's own writing as the visually dominant element throughout.

### Color palette

| Token | Hex | Use |
| --- | --- | --- |
| Ivory (background) | `#FCFBF8` | App background |
| Ivory (surface) | `#F7F5F0` | Cards, inputs |
| Ink | `#242321` | Primary text |
| Grey | `#6F6B63` | Secondary text |
| Bronze | `#7A6652` | Accent, primary actions |
| Divider | `#E9E4DB` | Hairlines, borders |
| Forest | `#1E2A24` | Immersive surfaces |
| Forest Deep | `#141E19` | Challenge gradient end |

### Typography

- **Source Serif 4** (incl. SemiBold Italic) — display type; headlines read like a physical journal.
- **Inter** — body and UI controls.

### Screen-by-screen visual register

Not every screen is equally elaborate. Visual intensity is scaled to emotional weight:

| Screen | Register |
| --- | --- |
| Library | Quiet |
| Writing | Almost invisible UI |
| Challenge (Learn) | Immersive |
| Zoom Out | Atmospheric |
| Revisit | Emotional |

That contrast — quiet library, invisible writing surface, immersive challenge — is what makes the app read as designed rather than templated.

---

## 04 · Interaction Design Philosophy

Wording alone doesn't fix a screen that feels like a productivity app — the interaction model does.

- Reflection prompts are collapsed and tactile, each with a label and short sub-label; tapping expands one into a writing space.
- Transitions are narrated in-voice (*"You went looking. What did you find?"*) — a conversation with yourself, not a sequence of form submissions.
- Prompts are hand-written and deterministic — predictable, private, fast, and consistent in voice.
- Language is human throughout: *"Keep this"* instead of *"Save"*, *"Keep this thought?"* instead of a success toast.

---

## 05 · Data Model

Local persistence only (SQLite), deliberately small. Zod schemas validate every write.

**JournalEntry**

| Field | Type | Notes |
| --- | --- | --- |
| id | string | Primary key |
| userId | string | Local user identifier |
| title | string? | Optional |
| body | string | Entry content |
| prompt | string? | Set only when written from a provided question |
| createdAt / updatedAt | datetime | |

**Discovery**

| Field | Type | Notes |
| --- | --- | --- |
| id | string | Primary key |
| userId | string | Local user identifier |
| category | string | Learn category or practice name |
| prompt | string | The question that was pursued |
| intention | string? | Set before the challenge |
| findings | record | Answers to the collapsed reflection prompts |
| sources | string? | Optional, free-form |
| folderName | string? | Optional shelf in the Library |
| createdAt | datetime | |

**Folder** — `id`, `name`. Shelves in the Library; filtering by folder or category.

---

## 06 · Technical Architecture

### Stack

| Layer | Choice |
| --- | --- |
| Framework | React Native + Expo (SDK 54) + TypeScript (strict) |
| Navigation | Expo Router (file-based) |
| Local storage | SQLite (`expo-sqlite`) |
| Validation | Zod |
| Testing | Vitest |
| Package manager | pnpm workspaces (v11) |
| Backend | None — all data on-device |

### Repository structure

```text
intentional/
├── apps/
│   └── mobile/        # Expo Router application — thin UI layer over the packages
├── packages/
│   ├── domain/        # Pure TypeScript: Zod schemas, hand-written prompts, deterministic logic
│   ├── database/      # SQLite migrations + repository pattern
│   ├── ui/            # Editorial design system: theme, Text, Surface, Button, BackBar
│   └── resonance/     # V2 on-device semantic librarian (embeddings + cosine similarity)
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

### Architectural rules

- **Domain is pure** — no React, no database; fully unit-tested.
- **Screens are thin** — they wire domain logic and the design system together.
- **Native modules are shared** — `expo-sqlite` is a peer dependency of `database` so TypeScript sees exactly one copy.
- **Commit and push at every milestone** — history is the backup.

---

## 07 · V2 — The Resonance Engine (on-device AI librarian)

V1 banned AI that *writes* for you. V2 adds AI that *remembers* for you.

`@intentional/resonance` is a deterministic, zero-dependency semantic engine: tokenize → stem → hashed 512-dim bag-of-words embeddings → cosine similarity, computed entirely on-device over the local SQLite library. It never generates text; it only finds what echoes.

Where it appears:

- **Zoom Out** — a quiet card, *"From your library — it echoes,"* hands you a relevant note from your own past.
- **Revisit** — the surfaced discovery is chosen by resonance with your latest writing, not by chance.
- **Home** — the contextual memory card uses the same resonance pick, and only appears when relevant.

The engine is a stand-in interface: screens ask *"what echoes this?"*, so a real on-device transformer can replace the embeddings later without touching a single screen.

---

## 08 · Roadmap

**V3 pillars (in order):**

1. **The Reading Room** — DeepTutor-style local RAG: ingest PDFs/EPUBs on-device; Learn questions generate from what you're actually reading; three-level memory (session / episodic / semantic).
2. **Somatic Rituals** — Calm-style breathwork (4-7-8 visual pacing) opening the Notice practice; generative soundscapes for the Challenge and Zoom Out.
3. **Thematic Resurfacing** — upgrade the Resonance Engine to on-device transformer embeddings (`transformers.js`) for meaning-based clustering beyond bag-of-words.

---

## Getting Started

### Prerequisites

- Node.js 18+, pnpm 11+
- Expo Go on your iOS/Android device (SDK 54)

### Run

```bash
pnpm install

# typecheck the whole monorepo
pnpm typecheck

# run domain + resonance tests
pnpm test

# start the app
cd apps/mobile
EXPO_NO_DOCTOR=1 pnpm exec expo start --clear --lan
```

Scan the QR code with Expo Go.

---

*Built with care. A quiet place to begin.*