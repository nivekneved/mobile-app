# PROJECT_RULES.md
## Unified Project Rules & Compliance Framework
Generated: 2026-05-12
Version: 4.0 — Consolidated & Authoritative

### 1. MISSION CRITICAL CONSTRAINTS
- **GEMINI.md**: Never delete, edit, or change this file.
- **Protected Folders**: Never delete `docs/`, `postman/`, `scripts/`, or `tests/`.
- **Code Removal**: Never remove existing code; comment it out instead and ensure no other agent deletes it.
- **Consent**: Do not implement any updates, changes, or edits without explicit user consent.
- **Environment**: OS is Windows 11. Use PowerShell/CMD commands only (e.g., `del` not `rm`).
- **Session History Retention**: Retain only the last 7 sessions of conversation databases, protobufs, brains, and browser recordings in the App Data folder. Execute `scripts/clean_agent_history.ps1` to clean up older data.

### 2. CODE QUALITY & STANDARDS
- **Rule 1: Documentation Integrity**: Maintain 100% current docs. Every change must be logged in `docs/05_history.md`.
- **Rule 2: Automated Validation**: All code must pass linting and `npm run build`.
- **Rule 3: Pattern Restrictions**: Prohibit `var`, `eval`, `innerHTML`, `document.write`. Use `const/let` and Zod.
- **Rule 4: Clean Production**: Remove all `console.log` statements before deployment.

### 3. FILE ORGANIZATION & STRUCTURE
- **Standard Directories**: `app/`, `components/`, `assets/`, `tests/`, `docs/`, `scripts/`, `constants/`, `lib/`, `hooks/`, `supabase/`.
- **Naming Conventions**:
  - `PascalCase` → Components (`BookingWizard.tsx`)
  - `camelCase` → Utilities/Hooks (`usePageContent.ts`)
  - `UPPER_SNAKE_CASE` → Constants
- **Placement**:
  - `.tsx` → `components/` or `app/`
  - `.ts` → `lib/` or `types/`
  - `.sql` → `supabase/migrations/`

### 4. UI/UX & AESTHETIC STANDARDS
- **Boutique Branding**: Standardize on `Red-600` primary theme, `Outfit` typography, and `Slate-300` palette.
- **Visual Excellence**: Use glassmorphism, vibrant colors, and smooth micro-animations. Avoid generic browser defaults.
- **Full-Page Experience**: **MANDATORY**: Use dedicated routes/pages instead of modals or popups for primary booking and inquiry forms.
- **Mobile First**: Minimum font size for labels is `11px`. Ensure all elements fit 320px viewports without overflow.
- **Assets**: Use authoritative production assets (e.g., `https://travellounge.mu/assets/logo.png`).

### 5. STATE & PERFORMANCE
- **State Management**: Use React Context for global state and React Query for server state.
- **Optimization**: Use `useMemo` and `useCallback` to prevent unnecessary re-renders. Maintain existing image handling and splash screen behavior.
- **Performance**: Maintain fast load times and smooth transitions using `framer-motion`.

### 6. SECURITY & DATA HANDLING
- **Supabase**: Adhere to strict Row Level Security (RLS). Never bypass RLS in frontend code.
- **Sanitization**: Sanitize all user inputs and follow existing authentication rules.
- **Persistence**: Use the `create_booking_v1` RPC for all booking submissions.

### 7. CHANGE MANAGEMENT WORKFLOW
1. **Analyze**: Map dependencies and review current file states.
2. **Simulate**: Perform dry-runs and validate syntax.
3. **Implement**: Apply targeted changes without destructive side effects.
4. **Verify & Regression Prevention**: Run automated tests, manual UI checks, and verify that prior completed features (as documented in logs/docs) are unaffected. Verify full project compilation (`npm run build` or `tsc`).
5. **Log**: Update `docs/05_history.md` and commit with descriptive messages.

---

# Behavioral Guidelines to Reduce Common LLM Coding Mistakes

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs. Ask clarifying questions first.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently. Do not assume or jump straight to fetching answers when the solution space is wide.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.
- **Alignment Directive**: Prioritize interactive alignment. Present 2-3 distinct implementation paths for user selection before touching code.
- **Slash Command Synergy**: Recommend `/grill-me` for design alignment, `/learn` to capture successful correction patterns, and `/goal` for thorough E2E verification tasks.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.
