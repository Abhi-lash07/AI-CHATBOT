# ChatBot AI – Gemini-Inspired AI Assistant ✨

A modern, responsive, high-performance AI Chatbot web application inspired by Google Gemini's clean, minimalist aesthetics. Engineered with React 18, Tailwind CSS, Lucide Icons, and client-side Local Storage persistence.

Designed for production usability and college UI/UX design & full-stack development demonstrations.

---

## 🌟 Key Features

### 1. Minimalist & Premium Google Gemini Aesthetic
* **Fluid Theme Engine:** Seamless light and dark modes with system preference auto-detection.
* **Gemini Spark Gradients:** Blue, purple, and rose gradient accents (`#4285F4` → `#9B72CF` → `#D96570`).
* **Subtle Micro-interactions:** Smooth slide-ups, typing wave animations, code block copy confirmations, and pill capsules.
* **Full Responsive Architecture:** Optimized for desktop, tablet, and mobile screens with a slide-over navigation drawer.

### 2. Main Chat Experience
* **Welcome Screen:** "Hello! How can I help you today?" with 4 interactive suggestion cards:
  1. ⚛️ **Explain a difficult topic** (Quantum Computing, concepts)
  2. 🌌 **Write a creative story** (Sci-Fi deep space exploration)
  3. ⚡ **Help me write code** (React hooks, clean implementations)
  4. 🚀 **Generate new project ideas** (5 innovative full-stack project blueprints)
* **Rich Markdown Engine:**
  * Headers (`#`, `##`, `###`, `####`), lists (ordered & unordered), blockquotes, horizontal dividers.
  * Formatted markdown tables with responsive horizontal scrolling.
  * Syntax-highlighted code blocks with language badge and **One-Click Copy** buttons.
* **AI Action Toolbar:**
  * Copy complete response to clipboard.
  * Regenerate a response from its message toolbar.
  * Thumbs up / down feedback interactions.
  * Message timestamps.
* **Simulated Typing / Streaming Animation:** Realistic token-by-token streaming effect with blinking cursor.

### 3. Smart Bottom Input Capsule
* **Floating Capsule Design:** Rounded-3xl floating container with automatic height expansion up to 180px.
* **Keyboard Navigation:** `Enter` to send, `Shift + Enter` for new lines, `Esc` to dismiss dialogs.
* **Attachment System:** Multi-file picker supporting images and text documents with preview chips and instant deletion.
* **Voice Input (Speech-to-Text):** Integrated with the browser's Web Speech API for voice dictation.
* **Interactive State:** Send button is smartly enabled/disabled based on content, transforming into a stop button during response generation.

### 4. Robust Conversation Management & History
* **Local Storage Persistence:** All conversations, message histories, and user settings persist across page refreshes.
* **Sidebar Controls:**
  * Quick **New Chat** button.
  * Real-time conversation search filtering by keyword.
  * Inline conversation rename.
  * Individual conversation deletion.
  * Clear all conversations with safe confirmation dialogue.
  * Expandable and collapsible sidebar drawer.

### 5. Multi-Mode AI Backend
* **Built-in Demo Mode (Zero Setup Required):** If no API key is provided, the app runs in full demo mode providing rich, realistic, streaming responses across coding, creative writing, concepts, and general inquiries.
* **Google Gemini API Integration:**
  * Connect directly to Google's official Gemini models (`gemini-1.5-flash`, `gemini-1.5-pro`, `gemini-2.0-flash-exp`).
  * Server-Sent Events (SSE) streaming for real-time word-by-word streaming.
  * Multimodal support: sends image attachments directly to Gemini's inline data endpoint.
  * **Zero Server Secret Leakage:** Keys are saved strictly in your client-side browser LocalStorage.

### 6. Interactive Modals & Panels
* **Settings Modal (⚙️):**
  * Appearance theme selector (Light, Dark, System).
  * AI Provider toggle (Demo Mode vs. Live Gemini API).
  * API Key configuration with show/hide password toggle and a live **Test Key** verification button.
  * Model architecture selector & temperature creativity slider.
  * System persona instructions customization.
  * Chat history JSON export.
* **About Modal (ℹ️):**
  * Academic showcase details, technical architecture, and UI/UX design principles.
* **Help Panel (❓):**
  * Quick start 3-step guide, keyboard shortcuts reference, and 12+ instant-run prompt templates.

### 7. Ratings & Feedback
* Rate each AI response as helpful or unhelpful, copy it, regenerate it, or open a detailed feedback form.
* Submit a five-star rating with optional categories and comments; rate the overall app experience from the sidebar.
* User feedback is validated by the Express backend and persisted in SQLite; users can review only their own submissions.
* Open **More → Feedback Dashboard** to review your submissions and their support status.
* Administrators use `/admin` for protected analytics, search, filters, feedback status, and private internal notes.

### Admin Feedback Setup
Set `ADMIN_EMAIL` and a unique `ADMIN_PASSWORD` (at least 14 characters) in the backend `.env` file. Do not prefix these values with `VITE_`. The backend hashes the password with scrypt and provisions the administrator in SQLite. The admin portal is available at `http://localhost:5173/admin`; admin sessions use HttpOnly, SameSite cookies.

Feedback records and admin accounts are stored in `data/feedback.sqlite` by default. Set `FEEDBACK_DB_PATH` on the backend to use another SQLite database location. User feedback endpoints are `POST /api/feedback` and `GET /api/feedback/mine`; admin endpoints under `/api/admin` require an authenticated administrator session. The database contains `feedback`, `admin_accounts`, and `admin_sessions` tables.

Run both the API and frontend with `npm run dev`, then open `http://localhost:5173`. Configure admin credentials before starting the backend to enable the admin login.

### Google Sign-In Setup

Google sign-in uses the backend authorization-code flow. Google redirects to Vite on port **5173**; the Vite `/api` proxy forwards the callback to Express on port **3001**. The OAuth client secret stays in the backend `.env`.

1. In [Google Cloud Console](https://console.cloud.google.com/), create or select a project.
2. Open **Google Auth Platform** (or **APIs & Services → OAuth consent screen**) and configure the app name, support email, audience, and contact email. Add test users if the app remains in Testing.
3. Open **Clients** (or **Credentials → Create credentials → OAuth client ID**) and select **Web application**.
4. Add `http://localhost:5173` under **Authorized JavaScript origins**.
5. Add `http://localhost:5173/api/auth/google/callback` under **Authorized redirect URIs**.
6. Copy `.env.example` to `.env`, then put the generated Client ID and Client Secret in `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`. Set `GOOGLE_REDIRECT_URI` to the same callback URI. Do not use a `VITE_` prefix or commit `.env`.
7. Restart the backend and open `http://localhost:5173/signin` or choose **Continue with Google** in the existing sign-in dialog. Google handles password entry; ChatBot AI never receives or stores Google passwords.

For production, use HTTPS and a same-origin reverse proxy that forwards `/api` to Express. Set `GOOGLE_REDIRECT_URI` to `https://your-production-host/api/auth/google/callback`, add that exact redirect URI and `https://your-production-host` as the authorized origin in Google Cloud Console, set `APP_ORIGIN` to the production origin, and set `NODE_ENV=production` so session cookies are Secure. Provision admin access separately using `ADMIN_EMAIL` and `ADMIN_PASSWORD`; signing in with Google does not grant admin rights.

The backend verifies Google's signed ID token, audience, verified email and OAuth nonce, and compares the callback state with a short-lived HttpOnly cookie. Google identities are upserted by Google's stable `sub` into SQLite `app_users`; session tokens are stored hashed in `app_sessions` and sent only as HttpOnly cookies. The existing explicitly provisioned admin accounts and admin authorization checks remain separate.

---

## 🚀 Quick Start Guide

### Prerequisites
* **Node.js**: v18.0.0 or higher (v20.9.0+ tested)
* **npm**: v9.0.0 or higher

### Installation
Clone or navigate to the project directory:
```bash
cd "d:\chart bot"
```

Install dependencies:
```bash
npm install
```

### Running Locally in Development Mode
Start the Vite development server:
```bash
npm run dev
```

Open your browser and navigate to:
```
http://localhost:5173
```

---

## 🔑 Configuring Google Gemini API (Optional)

ChatBot AI works 100% out-of-the-box in **Demo Mode**. To connect live to Google's real Gemini models:

### Option A: Via Settings UI (Recommended)
1. Open the application at `http://localhost:5173`.
2. Click the **Settings ⚙️** icon in the top navigation bar.
3. Switch to the **AI Model & API** tab.
4. Toggle off **Free Demo Mode**.
5. Paste your free Google Gemini API Key (obtained from [Google AI Studio](https://aistudio.google.com/app/apikey)).
6. Click **Test** to verify your key, then click **Save Changes**.

### Option B: Via Backend Environment Variable (`.env`)
1. In the root directory, configure `.env`:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   PORT=3001
   ```
2. The backend server automatically loads your key securely without ever exposing it to frontend JavaScript code!
3. Restart the dev server: `npm run dev`.

---

## 📁 Project Structure

```text
d:\chart bot/
├── index.html                   # HTML entry point with Gemini fonts & spark favicon
├── package.json                 # Dependencies & scripts
├── postcss.config.js            # PostCSS configuration
├── tailwind.config.js           # Custom Gemini colors, animations & fonts
├── vite.config.js               # Vite bundler configuration
├── .env.example                 # Example environment variables
├── src/
│   ├── main.jsx                 # React root mount
│   ├── App.jsx                  # Main application layout & modal controller
│   ├── index.css                # Global CSS, scrollbar & gradient utilities
│   ├── context/
│   │   └── ChatContext.jsx      # Central chat state, storage synchronization & actions
│   ├── services/
│   │   ├── demoAiService.js     # Simulated streaming AI responses across categories
│   │   ├── geminiApi.js         # Google Gemini streaming API client
│   │   └── storageService.js    # LocalStorage CRUD, export & settings persistence
│   │   ├── feedbackApi.js       # Feedback submission and own-feedback API client
│   ├── components/
│   │   ├── auth/
│   │   │   └── GoogleSignInPage.jsx # Google OAuth sign-in entry page
│   ├── server/
│   │   └── database.js          # SQLite schema and secure admin password hashing
│   ├── components/
│   │   ├── admin/
│   │   │   └── AdminPortal.jsx  # Protected admin login, analytics and feedback management
│   │   ├── layout/
│   │   │   ├── Navbar.jsx       # Header with model badge, theme toggle & profile menu
│   │   │   └── Sidebar.jsx      # Drawer with search, history, rename, delete & clear
│   │   ├── chat/
│   │   │   ├── ChatArea.jsx     # Auto-scrolling conversation viewport
│   │   │   ├── WelcomeScreen.jsx# Gemini greeting with 4 interactive suggestion cards
│   │   │   ├── MessageItem.jsx  # User & AI bubbles with code formatting, copy & retry
│   │   │   └── ChatInput.jsx    # Capsule input, auto-resize, voice mic & file attachment
│   │   ├── modals/
│   │   │   ├── SettingsModal.jsx# Theme, API key test, model selection & data export
│   │   │   ├── AboutModal.jsx   # College showcase information & architectural highlights
│   │   │   ├── HelpModal.jsx    # User guide, keyboard shortcuts & prompt templates
│   │   │   └── ConfirmModal.jsx # Clear history and delete confirmation dialogues
│   │   └── ui/
│   │       ├── MarkdownRenderer.jsx # Markdown parser, code highlighting & tables
│   │       └── Toast.jsx        # Notification alert banners
```

---

## 🛠️ Build for Production

To create an optimized, minified production build:
```bash
npm run build
```

To preview the production build locally:
```bash
npm run preview
```

---

## 🎨 Design System & UI/UX Principles

| Dimension | Specification |
| :--- | :--- |
| **Light Background** | `#F0F4F9` (Gemini Light canvas) / `#FFFFFF` (Surface) |
| **Dark Background** | `#131314` (Gemini Dark canvas) / `#1E1F20` (Surface) |
| **Accent Gradient** | `linear-gradient(135deg, #4285F4 0%, #9B72CF 50%, #D96570 100%)` |
| **Typography** | `Plus Jakarta Sans`, `Inter`, `system-ui` for UI; `Fira Code` for code blocks |
| **Border Radius** | `rounded-2xl` for cards, `rounded-3xl` for input capsules and dialogs |
| **Interactivity** | Bouncing dot wave for typing, instant copy with checkmark animations |

---

## 📜 License
MIT License. Free to use, adapt, and expand for academic and commercial projects.
