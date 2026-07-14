import { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import type { editor } from 'monaco-editor';

declare global {
  interface Window {
    monaco: any;
  }
}

interface MonacoEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  language?: string;
  theme?: string;
  fontFamily?: string;
  keybindings?: string;
  readOnly?: boolean;
  onMount?: (editor: editor.IStandaloneCodeEditor) => void;
}

export function MonacoEditor({ 
  value, 
  onChange, 
  language = 'typescript', 
  theme = 'Lumen Dark',
  fontFamily = 'JetBrains Mono',
  readOnly = false,
  onMount
}: MonacoEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor, monaco: any) => {
    editorRef.current = editor;
    
    // Define Lumen Dark theme
    monaco.editor.defineTheme('custom-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6b7280', fontStyle: 'italic' },
        { token: 'keyword', foreground: '38bdf8' },
        { token: 'string', foreground: '34d399' },
        { token: 'number', foreground: 'fbbf24' },
        { token: 'type', foreground: '818cf8' },
        { token: 'function', foreground: '38bdf8' },
        { token: 'variable', foreground: 'e5e7eb' },
      ],
      colors: {
        'editor.background': '#0a0a0f',
        'editor.foreground': '#e5e7eb',
        'editor.lineHighlightBackground': '#13131a',
        'editorCursor.foreground': '#38bdf8',
        'editor.selectionBackground': '#38bdf833',
        'editor.inactiveSelectionBackground': '#38bdf822',
        'editorLineNumber.foreground': '#4b5563',
        'editorLineNumber.activeForeground': '#9ca3af',
        'editorIndentGuide.background': '#1f2937',
        'editorIndentGuide.activeBackground': '#374151',
        'editorBracketMatch.background': '#38bdf822',
        'editorBracketMatch.border': '#38bdf8',
      },
    });

    // Define Lumen Light Neo-Brutalist theme
    monaco.editor.defineTheme('light-neo-brutalist', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6b7280', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'a78bfa', fontStyle: 'bold' },
        { token: 'string', foreground: '18181b' },
        { token: 'number', foreground: '3b82f6' },
        { token: 'type', foreground: '18181b' },
        { token: 'function', foreground: '18181b', fontStyle: 'bold' },
        { token: 'variable', foreground: '18181b' },
      ],
      colors: {
        'editor.background': '#faf8f5',
        'editor.foreground': '#18181b',
        'editor.lineHighlightBackground': '#faf8f5',
        'editorCursor.foreground': '#18181b',
        'editor.selectionBackground': '#e9dcf8',
        'editor.inactiveSelectionBackground': '#e9dcf888',
        'editorLineNumber.foreground': '#a1a1aa',
        'editorLineNumber.activeForeground': '#18181b',
        'editorIndentGuide.background': '#e5e7eb',
        'editorIndentGuide.activeBackground': '#d1d5db',
        'editorBracketMatch.background': '#e9dcf8',
        'editorBracketMatch.border': '#18181b',
      },
    });

    // Set Editor keybindings / commands
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      window.dispatchEvent(new CustomEvent('lumen-editor-save'));
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyP, () => {
      window.dispatchEvent(new CustomEvent('lumen-editor-command-palette'));
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyI, () => {
      window.dispatchEvent(new CustomEvent('lumen-editor-ask-ai'));
    });

    // Default configuration options
    editor.updateOptions({
      theme: theme === 'VS-Dark' ? 'vs-dark' : theme === 'Light Neo-Brutalist' ? 'light-neo-brutalist' : 'custom-dark',
      fontSize: 13,
      fontFamily: fontFamily === 'Courier New' ? 'Courier New, monospace' : fontFamily === 'Fira Code' ? "'Fira Code', monospace" : "'JetBrains Mono', 'Fira Code', monospace",
      lineHeight: 1.65,
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      padding: { top: 8, bottom: 8 },
      renderLineHighlight: 'all',
      cursorBlinking: 'smooth',
      cursorSmoothCaretAnimation: 'on',
      smoothScrolling: true,
      bracketPairColorization: { enabled: true },
    });

    onMount?.(editor);
  };

  useEffect(() => {
    if (editorRef.current) {
      let activeTheme = 'custom-dark';
      if (theme === 'VS-Dark') {
        activeTheme = 'vs-dark';
      } else if (theme === 'Light Neo-Brutalist') {
        activeTheme = 'light-neo-brutalist';
      }

      editorRef.current.updateOptions({
        theme: activeTheme,
        fontFamily: fontFamily === 'Courier New' ? 'Courier New, monospace' : fontFamily === 'Fira Code' ? "'Fira Code', monospace" : "'JetBrains Mono', 'Fira Code', monospace",
      });
    }
  }, [theme, fontFamily]);

  return (
    <div className="h-full w-full">
      <Editor
        height="100%"
        language={language}
        value={value}
        onChange={onChange}
        onMount={handleEditorDidMount}
        options={{
          readOnly,
          domReadOnly: false,
          scrollbar: {
            vertical: 'visible',
            horizontal: 'visible',
            useShadows: false,
            verticalScrollbarSize: 6,
            horizontalScrollbarSize: 6,
          },
        }}
        loading={
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm font-mono">
            Loading editor...
          </div>
        }
      />
    </div>
  );
}
