import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  Play,
  SquareTerminal,
  Plus,
  X,
  Loader2,
  FileCode2,
  Sparkles,
} from 'lucide-react';
import type { editor } from 'monaco-editor';
import type { RemoteCursor } from '@/services/socket';
import { Logo } from '@/components/shared/Logo';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';
import { ActivityBar, SidePanel, type ActivityPanel } from './ActivityBar';
import { EditorTabs } from './EditorTabs';
import { StatusBar } from './StatusBar';
import { NotificationsPanel } from './Notifications';
import { KeyboardShortcutsDialog } from './KeyboardShortcuts';
import { firestoreService, type File as FileType } from '@/services/firestore';
import { demoStorage } from '@/services/demoStorage';
import { socketService } from '@/services/socket';
import { pistonService } from '@/services/piston';
import { useAuth } from '@/contexts/AuthContext';

// Lazy load heavy components
const MonacoEditor = lazy(() => import('./MonacoEditor').then(m => ({ default: m.MonacoEditor })));
const AISidebar = lazy(() => import('./AISidebar').then(m => ({ default: m.AISidebar })));

// Loading fallback for lazy components
function ComponentLoader() {
  return (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}

const ease = [0.16, 1, 0.3, 1] as const;

interface Tab {
  id: string;
  name: string;
  language?: string;
  modified?: boolean;
  active: boolean;
}

interface EditorProps {
  onBack: () => void;
  onCommand: () => void;
  projectId?: string;
  fileId?: string;
}

export function Editor({ onBack, onCommand, projectId, fileId }: EditorProps) {
  const [activePanel, setActivePanel] = useState<ActivityPanel>('explorer');
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState('');
  
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);
  const [leftPanelOpen, setLeftPanelOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);

  // Simulated interactions states
  const [activeAITab, setActiveAITab] = useState('chat');
  const [simulatedMessageTrigger, setSimulatedMessageTrigger] = useState(0);

  const handleAskAISim = () => {
    setRightPanelOpen(true);
    setActiveAITab('chat');
    setSimulatedMessageTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    const handleResize = () => {
      const isSmall = window.innerWidth < 1025; // xl breakpoint
      setIsMobileOrTablet(isSmall);
      setLeftPanelOpen(!isSmall);
      setRightPanelOpen(window.innerWidth >= 1367); // 2xl breakpoint
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [editorValue, setEditorValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [runOutput, setRunOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [currentFile, setCurrentFile] = useState<FileType | null>(null);
  const [projectFiles, setProjectFiles] = useState<FileType[]>([]);
  const [remoteCursors, setRemoteCursors] = useState<RemoteCursor[]>([]);
  const [cursorLine, setCursorLine] = useState(1);
  const [cursorColumn, setCursorColumn] = useState(1);
  const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const { user } = useAuth();

  const userTheme = localStorage.getItem('lumen_editor_theme') || 'Lumen Dark';
  const userFont = localStorage.getItem('lumen_editor_font') || 'JetBrains Mono';
  const userKeybindings = localStorage.getItem('lumen_editor_keybindings') || 'Standard VS Code';

  const editorValueRef = useRef(editorValue);
  useEffect(() => {
    editorValueRef.current = editorValue;
  }, [editorValue]);

  useEffect(() => {
    const handleSaveEvent = () => {
      saveFileContent(editorValueRef.current);
    };
    const handleCommandPaletteEvent = () => {
      onCommand();
    };
    const handleAskAIEvent = () => {
      handleAskAISim();
    };

    window.addEventListener('lumen-editor-save', handleSaveEvent);
    window.addEventListener('lumen-editor-command-palette', handleCommandPaletteEvent);
    window.addEventListener('lumen-editor-ask-ai', handleAskAIEvent);

    return () => {
      window.removeEventListener('lumen-editor-save', handleSaveEvent);
      window.removeEventListener('lumen-editor-command-palette', handleCommandPaletteEvent);
      window.removeEventListener('lumen-editor-ask-ai', handleAskAIEvent);
    };
  }, [onCommand]);

  
  useEffect(() => {
    if (fileId) {
      loadFileContent(fileId);
    }
  }, [fileId]);

  
  useEffect(() => {
    if (!projectId) return;

    if (user?.uid) {
      const unsubscribe = firestoreService.subscribeToProjectFiles(projectId, setProjectFiles);
      return () => unsubscribe();
    }

    return demoStorage.subscribeToProjectFiles(projectId, setProjectFiles);
  }, [projectId, user?.uid]);

  
  useEffect(() => {
    if (projectFiles.length > 0 && !currentFile && !loading) {
      loadFileContent(projectFiles[0].id);
    }
  }, [projectFiles, currentFile, loading]);

  
  useEffect(() => {
    if (!projectId || !user?.uid) return;
    socketService.connect(user.uid, user.displayName || user.email || 'User');
    socketService.joinProject(projectId);
    return () => {
      socketService.disconnect();
    };
  }, [user?.uid, projectId]);

  
  useEffect(() => {
    const activeUserId = user?.uid;
    if (projectId && currentFile?.id && activeUserId) {
      const activeFileId = currentFile.id;
      socketService.joinFile(activeFileId);

      
      const handleCursorMove = (cursor: RemoteCursor) => {
        if (!cursor.fileId || cursor.fileId === activeFileId) {
          setRemoteCursors((prev) => {
            const existing = prev.findIndex((c) => c.userId === cursor.userId);
            if (existing >= 0) {
              const updated = [...prev];
              updated[existing] = cursor;
              return updated;
            }
            return [...prev, cursor];
          });
        }
      };

      socketService.onCursorMove(handleCursorMove);

      
      const handleFileUpdate = (update: { fileId: string; content: string; userId: string; timestamp: number }) => {
        if (update.fileId === activeFileId && update.userId !== activeUserId) {
          setEditorValue(update.content);
        }
      };

      socketService.onFileUpdate(handleFileUpdate);

      return () => {
        socketService.offCursorMove(handleCursorMove);
        socketService.offFileUpdate(handleFileUpdate);
        socketService.leaveFile();
        setRemoteCursors([]);
      };
    }
  }, [user, projectId, currentFile?.id]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onCommand();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        setLeftPanelOpen((prev) => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setRightPanelOpen((prev) => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '?') {
        e.preventDefault();
        setShortcutsOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onCommand]);

  const handleTabChange = async (id: string) => {
    const currentTab = tabs.find((t) => t.id === activeTabId);
    if (currentTab?.modified) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      await saveFileContent(editorValue);
    }
    loadFileContent(id);
  };

  const handleTabClose = async (id: string) => {
    const tabToClose = tabs.find((t) => t.id === id);
    if (tabToClose?.modified && id === activeTabId) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      await saveFileContent(editorValue);
    }

    const newTabs = tabs.filter((tab) => tab.id !== id);
    if (newTabs.length === 0) {
      setTabs([]);
      setActiveTabId('');
      setCurrentFile(null);
      setEditorValue('');
    } else if (activeTabId === id) {
      const newActive = newTabs[newTabs.length - 1];
      setTabs(newTabs.map((tab) => ({ ...tab, active: tab.id === newActive.id })));
      setActiveTabId(newActive.id);
      loadFileContent(newActive.id);
    } else {
      setTabs(newTabs);
    }
  };

  const handleNewTab = () => {
    if (!projectId) return;

    const newFileName = `untitled_${Math.floor(Math.random() * 1000)}.ts`;
    setLoading(true);

    try {
      if (user?.uid) {
        firestoreService.createFile({
          projectId,
          name: newFileName,
          content: '',
          language: 'typescript',
          path: `/${newFileName}`,
          modified: false
        }).then((fileId) => {
          loadFileContent(fileId);
        }).catch((err) => {
          console.error('Failed to create file via new tab:', err);
          setLoading(false);
        });
      } else {
        const fileId = demoStorage.createFile({
          projectId,
          name: newFileName,
          content: '',
          language: 'typescript',
          path: `/${newFileName}`,
          modified: false
        });
        loadFileContent(fileId);
      }
    } catch (err) {
      console.error('Failed to create file via new tab:', err);
      setLoading(false);
    }
  };

  const loadFileContent = async (fileId: string) => {
    setLoading(true);
    setError(null);
    try {
      const file = user?.uid
        ? await firestoreService.getFile(fileId)
        : demoStorage.getFile(fileId);

      if (file) {
        const localDraft = localStorage.getItem(`lumen_draft_${fileId}`);
        const finalContent = localDraft !== null ? localDraft : file.content;
        setCurrentFile(file);
        setEditorValue(finalContent);
        setTabs((prev) => {
          const existingTab = prev.find((t) => t.id === fileId);
          if (existingTab) {
            return prev.map((t) => ({ ...t, active: t.id === fileId, modified: localDraft !== null && localDraft !== file.content }));
          }
          return [
            ...prev.map((t) => ({ ...t, active: false })),
            { id: fileId, name: file.name, language: file.language, active: true, modified: localDraft !== null && localDraft !== file.content }
          ];
        });
        setActiveTabId(fileId);
      }
    } catch (err) {
      const localDraft = localStorage.getItem(`lumen_draft_${fileId}`);
      if (localDraft !== null) {
        setError('Offline: Loaded local cache');
        setEditorValue(localDraft);
        setCurrentFile({
          id: fileId,
          projectId: projectId || '',
          name: 'cached_file',
          content: localDraft,
          language: 'typescript',
          path: '',
          createdAt: {} as any,
          updatedAt: {} as any,
          modified: true
        });
        setTabs((prev) => {
          const existingTab = prev.find((t) => t.id === fileId);
          if (existingTab) {
            return prev.map((t) => ({ ...t, active: t.id === fileId, modified: true }));
          }
          return [
            ...prev.map((t) => ({ ...t, active: false })),
            { id: fileId, name: 'cached_file', language: 'typescript', active: true, modified: true }
          ];
        });
        setActiveTabId(fileId);
      } else {
        setError('Failed to load file');
        console.error('Failed to load file:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    const newValue = value || '';
    setEditorValue(newValue);
    setTabs((prev) => prev.map((t) => ({ ...t, modified: t.id === activeTabId ? true : t.modified })));
    
    if (activeTabId) {
      localStorage.setItem(`lumen_draft_${activeTabId}`, newValue);
    }
    
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    autoSaveTimeoutRef.current = setTimeout(() => {
      saveFileContent(newValue);
    }, 2000);
  };

  const saveFileContent = async (content: string) => {
    if (!currentFile) return;

    setSaving(true);
    setError(null);

    try {
      localStorage.setItem(`lumen_draft_${currentFile.id}`, content);

      if (user?.uid) {
        await firestoreService.updateFile(currentFile.id, { content, modified: true });
        socketService.broadcastFileUpdate(content);

        await firestoreService.logActivity({
          userId: user.uid,
          userName: user.displayName || user.email || 'User',
          action: 'file_updated',
          message: `Updated file: ${currentFile.name}`,
          projectName: projectId
        });
      } else {
        demoStorage.updateFile(currentFile.id, {
          content,
          modified: true
        });

        demoStorage.logActivity({
          userId: 'demo-user',
          userName: 'Demo User',
          action: 'file_updated',
          message: `Updated file: ${currentFile.name}`,
          projectName: projectId
        });
      }

      setTabs((prev) =>
        prev.map((t) => ({
          ...t,
          modified: t.id === activeTabId ? false : t.modified
        }))
      );
    } catch (err) {
      setError('Saved locally');
      console.warn('Save failed. Draft kept locally:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleRun = async () => {
    if (!currentFile) {
      setRunOutput('No file is open.');
      return;
    }

    setIsRunning(true);
    setRunOutput('Running...');

    try {
      const language =
        activeTab?.language?.toLowerCase() ||
        currentFile.language?.toLowerCase() ||
        'javascript';

      const result = await pistonService.executeCode(
        language,
        editorValue
      );

      if (result.error) {
        setRunOutput(`Error: ${result.error}`);
      } else if (result.stderr) {
        setRunOutput(result.stderr);
      } else {
        setRunOutput(
          result.stdout || 'Program finished successfully.'
        );
      }
    } catch (err: any) {
      setRunOutput(
        err?.message || 'Failed to run code.'
      );
    } finally {
      setIsRunning(false);
    }
  };

  const handleEditorMount = (editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
    
    
    editor.onDidChangeCursorPosition((e) => {
      setCursorLine(e.position.lineNumber);
      setCursorColumn(e.position.column);
    });

    
    editor.onDidChangeCursorSelection((e) => {
      if (socketService.isConnected()) {
        socketService.broadcastCursor(
          { line: e.selection.positionLineNumber, column: e.selection.positionColumn },
          {
            start: { line: e.selection.startLineNumber, column: e.selection.startColumn },
            end: { line: e.selection.endLineNumber, column: e.selection.endColumn }
          }
        );
      }
    });
  };

  const activeTab = tabs.find((tab) => tab.id === activeTabId);

  if (isMobileOrTablet) {
    return (
      <div className="flex flex-col h-screen overflow-hidden bg-background text-foreground">
        {/* Top Header */}
        <div className="h-12 flex items-center gap-2 px-3 border-b border-border/40 bg-background-soft/80 backdrop-blur-xl shrink-0">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Logo size={20} />
          </button>
          <Separator orientation="vertical" className="h-4 bg-border/40 mx-1" />
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors max-w-[120px]"
          >
            <span className="text-foreground font-medium truncate font-serif">{activeTab?.name || 'untitled'}</span>
          </button>
          <div className="ml-auto flex items-center gap-2">
            {error && (
              <div className="text-[10px] text-red-600 bg-red-100 border border-red-200 rounded px-1.5 py-0.5">
                Err
              </div>
            )}
            {saving && (
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Loader2 className="h-2.5 w-2.5 animate-spin" />
              </div>
            )}

            {/* Tablet Action Simulator Buttons */}
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                onClick={handleAskAISim}
                className="h-7 px-2.5 border border-border/40 bg-background-soft hover:bg-primary hover:text-foreground hover:border-primary text-[10px] font-mono font-bold rounded flex items-center gap-1 transition-all text-muted-foreground hover:shadow-sm"
              >
                <Sparkles className="h-3 w-3" />
                Ask AI
              </button>
            </div>

            <CollaboratorAvatars isMobile />
            <Separator orientation="vertical" className="h-4 bg-border/40 mx-1" />
            <NotificationsPanel />
            <Button
              size="sm"
              onClick={handleRun}
              disabled={isRunning || !currentFile}
              className="h-7 px-2 bg-primary text-foreground hover:bg-primary/90 text-xs font-mono font-bold"
            >
              {isRunning ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Play className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>

        {/* Workspace body */}
        <div className="flex-1 flex min-h-0 relative">
          <ActivityBar activePanel={activePanel} onPanelChange={(panel) => {
            setActivePanel(panel);
            setLeftPanelOpen(true);
          }} />

          {/* Left panel overlay drawer */}
          <AnimatePresence>
            {leftPanelOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setLeftPanelOpen(false)}
                  className="absolute inset-0 bg-foreground/20 z-20 cursor-pointer"
                />
                <motion.div
                  initial={{ x: -280, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -280, opacity: 0 }}
                  transition={{ duration: 0.2, ease }}
                  className="absolute left-12 top-0 bottom-0 z-30 w-72 max-w-[85vw] bg-card border-r border-border/40 flex flex-col shadow-lg"
                >
                  <SidePanel 
                    panel={activePanel} 
                    onBack={onBack} 
                    projectFiles={projectFiles} 
                    onFileSelect={async (id) => {
                      await loadFileContent(id);
                      setLeftPanelOpen(false);
                    }} 
                    projectId={projectId} 
                    activeFileId={currentFile?.id}
                  />
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Center Editor area */}
          <div className="flex-1 flex flex-col min-w-0 bg-background relative z-10">
            <EditorTabs
              tabs={tabs}
              onTabChange={handleTabChange}
              onTabClose={handleTabClose}
              onNewTab={handleNewTab}
              onToggleLeftPanel={() => setLeftPanelOpen(!leftPanelOpen)}
              onToggleRightPanel={() => setRightPanelOpen(!rightPanelOpen)}
            />
            <div className="flex-1 relative overflow-hidden">
              {loading ? (
                <div className="absolute inset-0 bg-background-soft z-10 p-6 space-y-4">
                  <div className="shimmer absolute inset-0" />
                  <div className="h-4 w-1/4 rounded bg-border/30" />
                  <div className="space-y-2">
                    <div className="h-4 w-3/4 rounded bg-border/30" />
                    <div className="h-4 w-1/2 rounded bg-border/30" />
                  </div>
                </div>
              ) : !currentFile ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-background-soft/30">
                  <div className="relative mb-4">
                    <div className="h-14 w-14 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                      <FileCode2 className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-sm font-medium text-foreground/80">No active file open</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed">
                    Select a file from the explorer sidebar.
                  </p>
                </div>
              ) : (
                <>
                  <Suspense fallback={<ComponentLoader />}>
                    <MonacoEditor
                      value={editorValue}
                      onChange={handleEditorChange}
                      onMount={handleEditorMount}
                      language={activeTab?.language || 'typescript'}
                    />
                  </Suspense>
                  <CollaboratorCursors cursors={remoteCursors} />
                </>
              )}
            </div>

            {/* Terminal area */}
            <div className="h-24 sm:h-28 border-t border-border/40 bg-background-soft/60 flex flex-col">
              <div className="h-6 sm:h-7 flex items-center gap-2 sm:gap-3 px-2 sm:px-3 border-b border-border/40 text-[9px] sm:text-[10px]">
                <span className="flex items-center gap-1 text-foreground font-semibold">
                  <SquareTerminal className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  <span className="hidden xs:inline">Terminal</span>
                  <span className="xs:inline">Term</span>
                </span>
                <div className="ml-auto flex items-center gap-1">
                  <button onClick={() => setLeftPanelOpen(false)} className="h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center rounded hover:bg-border/20">
                    <X className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-muted-foreground" />
                  </button>
                </div>
              </div>
              <div className="flex-1 font-mono text-[9px] sm:text-[10px] px-2 sm:px-3 py-1 sm:py-1.5 overflow-auto thin-scrollbar">
                <div className="text-muted-foreground">
                  <span className="text-green-600">➜</span> <span className="hidden xs:inline">atlas-engine git:(main) npm run dev</span>
                  <span className="xs:inline">npm run dev</span>
                </div>
                <div className="text-muted-foreground/70 mt-0.5">
                  <span className="text-teal-600">✓</span> Ready on http://localhost:5173
                </div>
              </div>
            </div>
          </div>

          {/* Right panel overlay drawer */}
          <AnimatePresence>
            {rightPanelOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setRightPanelOpen(false)}
                  className="absolute inset-0 bg-foreground/20 z-20 cursor-pointer"
                />
                <motion.div
                  initial={{ x: 320, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 320, opacity: 0 }}
                  transition={{ duration: 0.2, ease }}
                  className="absolute right-0 top-0 bottom-0 z-30 w-80 max-w-[90vw] bg-card border-l border-border/40 flex flex-col shadow-lg"
                >
                  <div className="flex items-center justify-between p-3 border-b border-border/40 bg-background-soft/60">
                    <span className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono">AI Companion</span>
                    <button onClick={() => setRightPanelOpen(false)} className="p-1 rounded hover:bg-border/20">
                      <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    </button>
                  </div>
                  <div className="flex-1 min-h-0 overflow-y-auto">
                    <AISidebar
                      currentCode={editorValue}
                      language={activeTab?.language}
                      activeTab={activeAITab}
                      setActiveTab={setActiveAITab}
                      simulatedMessageTrigger={simulatedMessageTrigger}
                    />
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Status Bar */}
        <StatusBar
          line={cursorLine}
          column={cursorColumn}
          encoding="UTF-8"
          language={activeTab?.language || 'TypeScript'}
          gitBranch="main"
          gitStatus={{ added: 0, modified: currentFile?.modified ? 1 : 0, deleted: 0 }}
          collaborators={remoteCursors.length + 1}
          onToggleShortcuts={() => setShortcutsOpen(true)}
        />
        <KeyboardShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />

      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Top Header */}
      <div className="h-10 sm:h-12 flex items-center gap-2 sm:gap-3 px-2 sm:px-3 border-b border-border/40 bg-background-soft/80 backdrop-blur-xl">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Logo size={18} className="sm:size-22" />
        </button>
        <Separator orientation="vertical" className="h-4 sm:h-5 bg-border/40" />
        <button
          onClick={onBack}
          className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-muted-foreground hover:text-foreground transition-colors truncate max-w-[150px] sm:max-w-none"
        >
          <span className="hidden xs:inline">atlas-engine</span>
          <span className="xs:hidden">atlas</span>
          <ChevronRight className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
          <span className="hidden xs:inline">engine</span>
          <span className="xs:inline">eng</span>
          <ChevronRight className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
          <span className="text-foreground font-medium font-serif truncate">{activeTab?.name}</span>
        </button>
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {error && (
            <div className="text-[10px] sm:text-xs text-red-600 bg-red-100 border border-red-200 rounded px-1.5 sm:px-2 py-0.5 sm:py-1">
              {error}
            </div>
          )}
          {saving && (
            <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
              <Loader2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 animate-spin" />
              <span className="hidden xs:inline">Saving...</span>
              <span className="xs:inline">...</span>
            </div>
          )}

          {/* Action Simulator buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={handleAskAISim}
              className="h-7 sm:h-8 px-2 sm:px-3 border border-border/40 bg-background-soft hover:bg-primary hover:text-foreground hover:border-primary text-[10px] sm:text-xs font-mono font-bold rounded-lg flex items-center gap-1 sm:gap-1.5 transition-all text-muted-foreground hover:shadow-sm"
            >
              <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span className="hidden xs:inline">Ask AI</span>
              <span className="xs:inline">AI</span>
            </button>
          </div>

          <div className="hidden sm:block">
            <CollaboratorAvatars />
          </div>
          <Separator orientation="vertical" className="h-4 sm:h-5 bg-border/40 hidden sm:block" />
          <NotificationsPanel />
          <Button
            size="sm"
            onClick={handleRun}
            disabled={isRunning || !currentFile}
            className="h-7 sm:h-8 bg-primary text-foreground hover:bg-primary/90 font-mono font-bold text-[10px] sm:text-xs uppercase shadow-sm"
          >
            {isRunning ? (
              <Loader2 className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 mr-1 animate-spin" />
            ) : (
              <Play className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 mr-1" />
            )}
            <span className="hidden xs:inline">{isRunning ? 'Running...' : 'Run'}</span>
            <span className="xs:inline">{isRunning ? '...' : '▶'}</span>
          </Button>
        </div>
      </div>

      {/* Middle Panels */}
      <div className="flex-1 flex min-h-0">
        <ActivityBar activePanel={activePanel} onPanelChange={setActivePanel} />

        {/* Mobile-only simple layout */}
        <div className="flex-1 flex flex-col md:hidden">
          <div className="flex flex-col h-full bg-background min-w-0">
            <EditorTabs
              tabs={tabs}
              onTabChange={handleTabChange}
              onTabClose={handleTabClose}
              onNewTab={handleNewTab}
              onToggleLeftPanel={() => setLeftPanelOpen(!leftPanelOpen)}
              onToggleRightPanel={() => setRightPanelOpen(!rightPanelOpen)}
            />

            <div className="flex-1 relative overflow-hidden">
              {loading ? (
                <div className="absolute inset-0 bg-background-soft z-10 p-4 space-y-3">
                  <div className="shimmer absolute inset-0" />
                  <div className="h-3 w-1/4 rounded bg-border/30" />
                  <div className="space-y-2">
                    <div className="h-3 w-3/4 rounded bg-border/30" />
                    <div className="h-3 w-1/2 rounded bg-border/30" />
                  </div>
                </div>
              ) : !currentFile ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-4 bg-background-soft/30">
                  <div className="relative mb-3">
                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                      <FileCode2 className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-sm font-medium text-foreground/80">No active file open</h3>
                  <p className="text-[10px] text-muted-foreground mt-1 max-w-xs leading-relaxed">
                    Select a file from the explorer sidebar.
                  </p>
                </div>
              ) : (
                <>
                  <Suspense fallback={<ComponentLoader />}>
                    <MonacoEditor
                      value={editorValue}
                      onChange={handleEditorChange}
                      onMount={handleEditorMount}
                      language={activeTab?.language || 'typescript'}
                      theme={userTheme}
                      fontFamily={userFont}
                      keybindings={userKeybindings}
                    />
                  </Suspense>
                  <CollaboratorCursors cursors={remoteCursors} />
                </>
              )}
            </div>

            {/* Mobile Terminal */}
            <div className="h-20 border-t border-border/40 bg-background-soft/60 flex flex-col">
              <div className="h-6 flex items-center gap-2 px-2 border-b border-border/40 text-[9px]">
                <span className="flex items-center gap-1 text-foreground">
                  <SquareTerminal className="h-2.5 w-2.5" />
                  Terminal
                </span>
              </div>
              <div className="flex-1 font-mono text-[9px] px-2 py-1 overflow-auto thin-scrollbar">
                <div className="text-muted-foreground">
                  <span className="text-green-600">➜</span> npm run dev
                </div>
                <div className="text-muted-foreground/70 mt-0.5">
                  <span className="text-teal-600">✓</span> Ready
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop resizable layout */}
        <ResizablePanelGroup direction="horizontal" className="flex-1 hidden md:flex">
          {/* Left Panel */}
          <ResizablePanel
            defaultSize={18}
            minSize={0}
            maxSize={28}
            collapsible
            collapsedSize={0}
            onCollapse={() => setLeftPanelOpen(false)}
            onExpand={() => setLeftPanelOpen(true)}
          >
            <AnimatePresence mode="wait">
              {leftPanelOpen && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2, ease }}
                  className="h-full bg-background-soft/60 border-r border-border/40"
                >
                  <SidePanel 
                    panel={activePanel} 
                    onBack={onBack} 
                    projectFiles={projectFiles} 
                    onFileSelect={loadFileContent} 
                    projectId={projectId} 
                    activeFileId={currentFile?.id} 
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </ResizablePanel>

          <ResizableHandle className="bg-border/40 hover:bg-primary/40 transition-colors w-px" />

          {/* Editor Center */}
          <ResizablePanel defaultSize={54} minSize={30}>
            <div className="flex flex-col h-full bg-background min-w-0">
              <EditorTabs
                tabs={tabs}
                onTabChange={handleTabChange}
                onTabClose={handleTabClose}
                onNewTab={handleNewTab}
                onToggleLeftPanel={() => setLeftPanelOpen(!leftPanelOpen)}
                onToggleRightPanel={() => setRightPanelOpen(!rightPanelOpen)}
              />

              <div className="flex-1 relative overflow-hidden">
                {loading ? (
                  <div className="absolute inset-0 bg-background-soft z-10 p-6 space-y-4">
                    <div className="shimmer absolute inset-0" />
                    <div className="h-4 w-1/4 rounded bg-border/30" />
                    <div className="space-y-2">
                      <div className="h-4 w-3/4 rounded bg-border/30" />
                      <div className="h-4 w-1/2 rounded bg-border/30" />
                      <div className="h-4 w-5/6 rounded bg-border/30" />
                      <div className="h-4 w-2/3 rounded bg-border/30" />
                    </div>
                    <div className="h-4 w-1/3 rounded bg-border/30 pt-4" />
                    <div className="space-y-2">
                      <div className="h-4 w-4/5 rounded bg-border/30" />
                      <div className="h-4 w-3/5 rounded bg-border/30" />
                    </div>
                  </div>
                ) : !currentFile ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-background-soft/30">
                    <div className="relative mb-4">
                      <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                        <FileCode2 className="h-6 w-6 text-primary" />
                      </div>
                      <div className="absolute inset-0 rounded-full blur bg-primary/20 opacity-40 animate-pulse-glow" />
                    </div>
                    <h3 className="text-base font-medium text-foreground/80">No active file open</h3>
                    <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed">
                      Select a file from the explorer sidebar or create a new file to start coding.
                    </p>
                    <div className="mt-6 space-y-2 max-w-xs w-full">
                      <div className="flex items-center gap-6 justify-between text-xs text-muted-foreground/60 border-b border-border/30 pb-1.5">
                        <span>Open Command Palette</span>
                        <kbd className="font-mono text-[10px] bg-border/20 px-1.5 py-0.5 rounded">⌘K</kbd>
                      </div>
                      <div className="flex items-center gap-6 justify-between text-xs text-muted-foreground/60 border-b border-border/30 pb-1.5">
                        <span>Toggle Explorer Panel</span>
                        <kbd className="font-mono text-[10px] bg-border/20 px-1.5 py-0.5 rounded">⌘B</kbd>
                      </div>
                      <div className="flex items-center gap-6 justify-between text-xs text-muted-foreground/60">
                        <span>Toggle AI Assistant</span>
                        <kbd className="font-mono text-[10px] bg-border/20 px-1.5 py-0.5 rounded">⌘⇧A</kbd>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <MonacoEditor
                      value={editorValue}
                      onChange={handleEditorChange}
                      onMount={handleEditorMount}
                      language={activeTab?.language || 'typescript'}
                      theme={userTheme}
                      fontFamily={userFont}
                      keybindings={userKeybindings}
                    />
                    <CollaboratorCursors cursors={remoteCursors} />
                  </>
                )}
              </div>

              {/* Terminal */}
              <div className="h-28 sm:h-32 border-t border-border/40 bg-background-soft/60 flex flex-col">
                <div className="h-7 sm:h-8 flex items-center gap-2 sm:gap-4 px-2 sm:px-4 border-b border-border/40 text-[10px] sm:text-xs">
                  <span className="flex items-center gap-1 sm:gap-1.5 text-foreground">
                    <SquareTerminal className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    <span className="hidden xs:inline">Terminal</span>
                    <span className="xs:inline">Term</span>
                  </span>
                  <span className="hidden sm:inline text-muted-foreground hover:text-foreground cursor-pointer">
                    Problems
                  </span>
                  <span className="hidden sm:inline text-muted-foreground hover:text-foreground cursor-pointer">
                    Output
                  </span>
                  <span className="hidden sm:inline text-muted-foreground hover:text-foreground cursor-pointer">
                    Debug Console
                  </span>
                  <div className="ml-auto flex items-center gap-1">
                    <button className="h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center rounded hover:bg-border/20">
                      <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground" />
                    </button>
                    <button className="h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center rounded hover:bg-border/20">
                      <X className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 font-mono text-[10px] sm:text-xs px-2 sm:px-4 py-1.5 sm:py-2 overflow-auto thin-scrollbar whitespace-pre-wrap">
                  {runOutput ? (
                    <div className="text-foreground">
                      {runOutput}
                    </div>
                  ) : (
                    <div className="text-muted-foreground/50">
                      Click Run to execute your code.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle className="bg-border/40 hover:bg-primary/40 transition-colors w-px" />

          {/* Right Panel */}
          <ResizablePanel
            defaultSize={28}
            minSize={0}
            maxSize={40}
            collapsible
            collapsedSize={0}
            onCollapse={() => setRightPanelOpen(false)}
            onExpand={() => setRightPanelOpen(true)}
          >
            <AnimatePresence mode="wait">
              {rightPanelOpen && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2, ease }}
                  className="h-full"
                >
                  <AISidebar
                    currentCode={editorValue}
                    language={activeTab?.language}
                    activeTab={activeAITab}
                    setActiveTab={setActiveAITab}
                    simulatedMessageTrigger={simulatedMessageTrigger}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Status Bar */}
      <StatusBar
        line={cursorLine}
        column={cursorColumn}
        encoding="UTF-8"
        language={activeTab?.language || 'TypeScript'}
        gitBranch="main"
        gitStatus={{ added: 0, modified: currentFile?.modified ? 1 : 0, deleted: 0 }}
        collaborators={remoteCursors.length + 1}
        onToggleShortcuts={() => setShortcutsOpen(true)}
      />

      <KeyboardShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />

    </div>
  );
}

function CollaboratorAvatars({ isMobile = false }: { isMobile?: boolean }) {
  // TODO: Replace with real collaborator data from Socket.io (Phase 10)
  const placeholderCollabs = [
    { name: 'You', initials: 'ME', color: '#38bdf8', status: 'active' as const },
  ];
  const visibleCollabs = isMobile ? placeholderCollabs.slice(0, 2) : placeholderCollabs;
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex -space-x-2">
        {visibleCollabs.map((c) => (
          <div key={c.name} className="relative group">
            <Avatar className="h-6 w-6 sm:h-7 sm:w-7 border-2 border-background">
              <AvatarFallback
                className="text-[9px] sm:text-[10px] font-medium text-white"
                style={{ background: c.color }}
              >
                {c.initials}
              </AvatarFallback>
            </Avatar>
            <div
              className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full ring-2 ring-background ${
                c.status === 'active'
                  ? 'bg-emerald-400'
                  : c.status === 'viewing'
                  ? 'bg-sky-400'
                  : 'bg-muted-foreground'
              }`}
            />
            <div className="absolute top-9 right-0 z-50 glass-strong rounded-md px-2 py-1 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {c.name} · {c.status}
            </div>
          </div>
        ))}
      </div>
      <Button
        size="sm"
        variant="outline"
        className="h-6 sm:h-7 px-1.5 sm:px-2 glass border-white/10 text-[10px] sm:text-xs flex items-center gap-0.5 sm:gap-1"
      >
        <Plus className="h-3 w-3" />
        <span className="hidden sm:inline">Invite</span>
      </Button>
    </div>
  );
}

function CollaboratorCursors({ cursors }: { cursors: RemoteCursor[] }) {
  return (
    <div className="relative pointer-events-none">
      {cursors.map((cursor) => (
        <motion.div
          key={cursor.userId}
          className="absolute"
          style={{ 
            top: `${cursor.position.line * 20}px`, 
            left: `${cursor.position.column * 8}px` 
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex items-center gap-0">
            <div className="w-0.5 h-4" style={{ background: cursor.color }} />
            <div
              className="ml-0.5 -mt-1 px-1.5 py-0.5 rounded text-[10px] text-white font-medium"
              style={{ background: cursor.color }}
            >
              {cursor.userName}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}