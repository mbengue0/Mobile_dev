# 🤖 AGENT BEHAVIOR PROTOCOL (KANTEEN PROJECT)

## 1. 🛑 DEFINITION OF DONE (MANDATORY)
You are STRICTLY FORBIDDEN from finishing a task until you have updated the documentation.
Every response that involves code changes must end with a confirmation:
> "✅ Docs updated: [list of modified doc files]"

## 2. 📝 DOCUMENTATION CHECKLIST
You must check and update these files according to the context:

*   **`development_log.md`**: 
    *   *When:* EVERY time.
    *   *Action:* Log bugs fixed, features added, or SQL ran with a timestamp.
    
*   **`CONTEXT.md`**: 
    *   *When:* Architecture, Tech Stack, or "Current Focus" changes.
    *   *Action:* Keep the "Current Status" section live so we know where we are.

*   **`README.md` (Root Project)**: 
    *   *When:* New dependencies are installed, `.env` variables change, or setup commands change.
    *   *Action:* Keep the "Getting Started" guide accurate.

*   **`database/README.md`**: 
    *   *When:* Schema changes, new RLS policies, or new Functions.
    *   *Action:* Document the SQL logic.

## 3. 🛡️ TECHNICAL CONSTRAINTS (DO NOT BREAK)
- **Framework:** Expo SDK 54 + React Native 0.76.9 + React 18.3.1.
- **Strict Rule:** NEVER upgrade to React 19. It breaks Supabase compatibility.
- **Branding:** "Kanteen". 
    - Colors: Navy Blue `#132439` & Gold `#FFD700`.
- **Database:** Do not use `auth.users` directly without syncing to `public.profiles`.