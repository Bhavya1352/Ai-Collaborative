# Lumen — AI-Native Collaborative Editor & Development IDE

Lumen is a high-fidelity, production-grade collaborative code editor that combines real-time multi-user editing with agentic Gemini AI features. Built with modern **React**, **TypeScript**, **Monaco Editor**, **Firebase**, **Firestore**, and **Socket.io**, it offers developers a frictionless space to write, review, explain, and refactor code together.

---

## 🚀 Key Features

*   👥 **Real-Time Multiplayer Editing**: Conflict-free text sync, live cursor coordinates tracking, and collaborator active presence indicators powered by Socket.io.
*   🧠 **Gemini AI Developer Suite**:
    *   **Explain**: Instantly breaks down complex functions and patterns in plain language.
    *   **Generate**: Writes production-ready code based on textual prompts and workspace context.
    *   **Review**: Audits files for security, performance, bugs, and best practices.
    *   **Fix**: Pinpoints issues, provides corrected code blocks, and explains refactors.
*   💾 **Auto-Saving & Cloud Sync**: Keystrokes are automatically debounced and saved to Google Firestore. Tabs are saved before switching so you never lose a line of code.
*   🎨 **Custom Monaco Editor Experience**: Tailored theme customization loaded directly during editor mount, with custom scrollbars, typography, minimap, and bracket pair colorization.
*   🔐 **Secure Authentication**: Email/Password login and one-click Google OAuth Login powered by Firebase Auth.
*   🖥 **Responsive Design**: Collapsible absolute drawers with backdrops on mobile and tablet devices, sliced collaborator lists, and dynamic status bars.

---

## ⭐ Premium Enhancements Added

### 1. Dynamic Hierarchical Explorer & Collapsible Folder Trees
- **Tree Parsing Engine**: Replaced the flat list file explorer with a tree-builder that parses absolute database paths (e.g. `/src/components/button.tsx`) into a recursive folder tree. Sorts folders first, then files alphabetically.
- **Collapsible Toggle**: Expanded states are indexed by directory path (e.g., `/src/components`) to avoid collision conflicts between folders of the same name.
- **Nested Folder Creations**: Added a "New Folder" icon button that creates collapsible folders using a Git-style `.keep` placeholder file. Empty placeholder files are automatically filtered out from the user tree.
- **Directory Path Selection**: Selecting a folder sets the active path. Creating a new file or folder will automatically mount it inside the selected directory.

### 2. Offline & Guest Local Cache Persistence
- **Auto-Draft Backups**: Keystrokes instantly write drafts to `localStorage` under `lumen_draft_${fileId}` to protect work during browser crashes.
- **Offline Fallback**: Network failures trigger offline mode. The editor loads from the local draft cache instead of crashing, and shows an `Offline: Loaded local cache` warning banner.
- **Guest Workspace Access**: Dashboard and database operations gracefully fallback to local storage under a `'guest-user'` state when unauthenticated, making the sandbox fully usable out-of-the-box.

### 3. Advanced Monaco Customization & Custom Shortcuts
- **Custom Keybindings**: Registered commands directly inside Monaco Editor:
  - `Cmd+S` / `Ctrl+S`: Save changes instantly and display local success notifications.
  - `Cmd+P` / `Ctrl+P`: Summons the Lumen Command Palette from anywhere inside the text canvas.
  - `Cmd+I` / `Ctrl+I`: Auto-opens the AI Sidebar and focuses the chat panel.
- **Workspace Settings Integration**: Linked settings selects (Theme, Font Family, Keybindings) to local state:
  - **Font Shifting**: Switches Monaco's typography between *JetBrains Mono*, *Fira Code*, and *Courier New* in real-time.
  - **Lumen Light Neo-Brutalist Theme**: Created a custom light theme using Ivory base (`#faf8f5`), Charcoal text (`#18181b`), and Lavender selections (`#e9dcf8`) matching the site's primary style tokens.

---

## 🛠 Tech Stack

*   **Frontend**: React 18, TypeScript, Tailwind CSS, Framer Motion, Radix UI.
*   **Editor**: Monaco Editor (`@monaco-editor/react`).
*   **Database & Auth**: Google Firebase v12 (Firestore Database & Authentication).
*   **Multiplayer Server**: Socket.io / WebSockets.
*   **AI Engine**: Google Gemini AI (`@google/generative-ai` SDK).
*   **Deployment**: Vercel (SPA clean URL routing) / Vite Bundler.

---

## ⚙️ Installation Guide

### Prerequisites
Make sure you have [Node.js](https://nodejs.org) (v18+) and npm installed.

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/lumen-collaborative.git
cd lumen-collaborative
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` in the project root:
```bash
cp .env.example .env
```
Fill in your credentials:
*   Create a Firebase project at [Firebase Console](https://console.firebase.google.com/) and register a Web app to generate keys.
*   Enable **Email/Password Provider** and **Google Provider** under Firebase Auth.
*   Obtain a Google Gemini API Key from [Google AI Studio](https://aistudio.google.com/).

### 3. Run Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

---

## 📦 Deployment Configuration

### Deploying to Vercel
Lumen is configured for instant Vercel deployment with routing configuration in [vercel.json](file:///c:/Users/pbhav/OneDrive/Desktop/Project1/Ai-Collaborative/vercel.json) to handle clean URL routing:
1. Push your code to a GitHub repository.
2. Link the repository inside your Vercel Dashboard.
3. Add the environment variables from your `.env` file under the **Environment Variables** settings.
4. Click **Deploy**. Vercel will build the React SPA and serve it over a secure HTTPS edge network.
