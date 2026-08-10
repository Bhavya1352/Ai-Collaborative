# Lumen

A browser-based coding workspace built with React and TypeScript. It combines a Monaco-based code editor, code execution, file management, and Gemini-powered coding assistance in one interface.

## Features

- **Code Editor**
  - Monaco Editor integration
  - Syntax highlighting
  - Multiple files/tabs
  - Code editing directly in the browser

- **Code Execution**
  - Run code from the editor
  - Supports multiple programming languages through the execution server
  - Displays program output and execution errors

- **AI Assistant**
  - Explain code
  - Generate code from a description
  - Review code for bugs and improvements
  - Fix code using error information
  - Refactor existing code
  - Chat with the AI assistant
  - Streaming responses for chat and code explanations

- **Project & File Management**
  - Create and open files
  - Edit file contents
  - Save project data
  - Project-specific file handling
  - Demo storage using browser localStorage

- **Developer Workspace**
  - Explorer panel
  - Editor tabs
  - Output/terminal area
  - AI assistant panel
  - Responsive workspace layout

## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- Monaco Editor
- Lucide React
- Framer Motion

### APIs & Storage
- Google Gemini API
- Piston-based code execution
- Firebase
- Browser localStorage for demo data

## Project Structure

```text
Ai-Collaborative/
├── src/
│   ├── components/
│   │   ├── editor/
│   │   └── ui/
│   ├── services/
│   │   ├── demoStorage.ts
│   │   ├── gemini.ts
│   │   └── piston.ts
│   └── ...
├── server/
│   └── index.js
├── public/
├── package.json
└── vite.config.ts
Create a `.env` file and add your Firebase and Gemini API keys before running the project.
