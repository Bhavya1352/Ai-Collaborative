import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  Play,
  SquareTerminal,
  Plus,
  X,
  Loader2,
  FileCode2,
  GitBranch,
  GitPullRequest,
  Globe,
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
import { AISidebar } from './AISidebar';
import { MonacoEditor } from './MonacoEditor';
import { EditorTabs } from './EditorTabs';
import { StatusBar } from './StatusBar';
import { NotificationsPanel } from './Notifications';
import { KeyboardShortcutsDialog } from './KeyboardShortcuts';
import { collaborators } from '@/lib/data';
import { firestoreService, type File as FileType } from '@/services/firestore';
import { socketService } from '@/services/socket';
import { useAuth } from '@/contexts/AuthContext';

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
  const [gitBranch, setGitBranch] = useState('main');
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [branchInput, setBranchInput] = useState('');
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [deployStatus, setDeployStatus] = useState<'idle' | 'started' | 'success'>('idle');
  const [toasts, setToasts] = useState<{ id: string; message: string }[]>([]);

  const showToast = (message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((t) => [...t, { id, message }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 4000);
  };

  const handleAskAISim = () => {
    setRightPanelOpen(true);
    setActiveAITab('chat');
    setSimulatedMessageTrigger((prev) => prev + 1);
  };

  const handleOpenPRSim = () => {
    setRightPanelOpen(true);
    setActiveAITab('review');
  };

  const handleDeploySim = () => {
    setShowDeployModal(true);
    setDeployStatus('started');
    
    setTimeout(() => {
      setDeployStatus('success');
      
      setTimeout(() => {
        setShowDeployModal(false);
        showToast('Deployment successful ✅ - Production build is live!');
      }, 1500);
    }, 2000);
  };

  const handleCreateBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (branchInput.trim()) {
      setGitBranch(branchInput.trim());
      showToast(`Switched to new branch: ${branchInput.trim()} 🌿`);
    }
    setBranchInput('');
    setShowBranchModal(false);
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
  const [currentFile, setCurrentFile] = useState<FileType | null>(null);
  const [projectFiles, setProjectFiles] = useState<FileType[]>([]);
  const [remoteCursors, setRemoteCursors] = useState<RemoteCursor[]>([]);
  const [cursorLine, setCursorLine] = useState(1);
  const [cursorColumn, setCursorColumn] = useState(1);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
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
      showToast('Saved file changes! 💾');
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
    if (projectId) {
      const unsubscribe = firestoreService.subscribeToProjectFiles(projectId, (files) => {
        setProjectFiles(files);
      });
      return () => unsubscribe();
    }
  }, [projectId]);

  
  useEffect(() => {
    if (projectFiles.length > 0 && !currentFile && !loading) {
      loadFileContent(projectFiles[0].id);
    }
  }, [projectFiles, currentFile, loading]);

  
  useEffect(() => {
    if (projectId) {
      const uid = user?.uid || 'guest-user';
      const name = user?.displayName || user?.email || 'Guest Developer';
      socketService.connect(uid, name);
      socketService.joinProject(projectId);
      return () => {
        socketService.disconnect();
      };
    }
  }, [user, projectId]);

  
  useEffect(() => {
    const activeUserId = user?.uid || 'guest-user';
    if (projectId && currentFile?.id) {
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
  };

  const loadFileContent = async (fileId: string) => {
    setLoading(true);
    setError(null);
    try {
      const file = await firestoreService.getFile(fileId);
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
      // Offline fallback: try to load from local storage
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
    if (!currentFile || !content) return;
    setSaving(true);
    setError(null);
    try {
      localStorage.setItem(`lumen_draft_${currentFile.id}`, content);
      await firestoreService.updateFile(currentFile.id, { content, modified: true });
      
      socketService.broadcastFileUpdate(content);
      setTabs((prev) => prev.map((t) => ({ ...t, modified: t.id === activeTabId ? false : t.modified })));
    } catch (err) {
      setError('Offline: Saved locally');
      console.warn('Network failure. Saved draft locally:', err);
    } finally {
      setSaving(false);
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
        <div className="h-12 flex items-center gap-2 px-3 border-b border-white/5 bg-background-soft/50 backdrop-blur-xl shrink-0">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Logo size={20} />
          </button>
          <Separator orientation="vertical" className="h-4 bg-white/5 mx-1" />
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors max-w-[120px]"
          >
            <span className="text-foreground font-medium truncate font-serif">{activeTab?.name || 'untitled'}</span>
          </button>
          <div className="ml-auto flex items-center gap-2">
            {error && (
              <div className="text-[10px] text-red-400 bg-red-400/10 border border-red-400/20 rounded px-1.5 py-0.5">
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
                className="h-7 px-2.5 border border-white/5 bg-background-soft hover:bg-[#e9dcf8] hover:text-[#18181b] hover:border-[#18181b] text-[10px] font-mono font-bold rounded flex items-center gap-1 transition-all text-muted-foreground hover:shadow-[1.5px_1.5px_0px_0px_#18181b]"
              >
                <Sparkles className="h-3 w-3" />
                Ask AI
              </button>
              <button
                onClick={handleOpenPRSim}
                className="h-7 px-2.5 border border-white/5 bg-background-soft hover:bg-[#e9dcf8] hover:text-[#18181b] hover:border-[#18181b] text-[10px] font-mono font-bold rounded flex items-center gap-1 transition-all text-muted-foreground hover:shadow-[1.5px_1.5px_0px_0px_#18181b]"
              >
                <GitPullRequest className="h-3 w-3" />
                Open PR
              </button>
              <button
                onClick={handleDeploySim}
                className="h-7 px-2.5 border border-white/5 bg-background-soft hover:bg-[#e9dcf8] hover:text-[#18181b] hover:border-[#18181b] text-[10px] font-mono font-bold rounded flex items-center gap-1 transition-all text-muted-foreground hover:shadow-[1.5px_1.5px_0px_0px_#18181b]"
              >
                <Globe className="h-3 w-3" />
                Deploy
              </button>
              <button
                onClick={() => setShowBranchModal(true)}
                className="h-7 px-2.5 border border-white/5 bg-background-soft hover:bg-[#e9dcf8] hover:text-[#18181b] hover:border-[#18181b] text-[10px] font-mono font-bold rounded flex items-center gap-1 transition-all text-muted-foreground hover:shadow-[1.5px_1.5px_0px_0px_#18181b]"
              >
                <GitBranch className="h-3 w-3" />
                Branch
              </button>
            </div>

            <CollaboratorAvatars isMobile />
            <Separator orientation="vertical" className="h-4 bg-white/5 mx-1" />
            <NotificationsPanel />
            <Button size="sm" className="h-7 px-2 bg-foreground text-background hover:bg-foreground/90 text-xs font-mono font-bold">
              <Play className="h-3 w-3" />
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
                  className="absolute inset-0 bg-black z-20 cursor-pointer"
                />
                <motion.div
                  initial={{ x: -280, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -280, opacity: 0 }}
                  transition={{ duration: 0.2, ease }}
                  className="absolute left-12 top-0 bottom-0 z-30 w-72 bg-zinc-950 border-r border-white/5 flex flex-col"
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
                <div className="absolute inset-0 bg-[#0a0a0f] z-10 p-6 space-y-4">
                  <div className="shimmer absolute inset-0" />
                  <div className="h-4 w-1/4 rounded bg-white/5" />
                  <div className="space-y-2">
                    <div className="h-4 w-3/4 rounded bg-white/5" />
                    <div className="h-4 w-1/2 rounded bg-white/5" />
                  </div>
                </div>
              ) : !currentFile ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-background-soft/10">
                  <div className="relative mb-4">
                    <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
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
                  <MonacoEditor
                    value={editorValue}
                    onChange={handleEditorChange}
                    onMount={handleEditorMount}
                    language={activeTab?.language || 'typescript'}
                  />
                  <CollaboratorCursors cursors={remoteCursors} />
                </>
              )}
            </div>

            {/* Terminal area */}
            <div className="h-28 border-t border-white/5 bg-background-soft/40 flex flex-col">
              <div className="h-7 flex items-center gap-3 px-3 border-b border-white/5 text-[10px]">
                <span className="flex items-center gap-1 text-foreground font-semibold">
                  <SquareTerminal className="h-3 w-3" />
                  Terminal
                </span>
                <div className="ml-auto flex items-center gap-1">
                  <button onClick={() => setLeftPanelOpen(false)} className="h-5 w-5 flex items-center justify-center rounded hover:bg-white/5">
                    <X className="h-3 w-3 text-muted-foreground" />
                  </button>
                </div>
              </div>
              <div className="flex-1 font-mono text-[10px] px-3 py-1.5 overflow-auto thin-scrollbar">
                <div className="text-muted-foreground">
                  <span className="text-emerald-400">➜</span> atlas-engine git:(main) npm run dev
                </div>
                <div className="text-muted-foreground/70 mt-0.5">
                  <span className="text-teal-400">✓</span> Ready on http://localhost:5173
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
                  className="absolute inset-0 bg-black z-20 cursor-pointer"
                />
                <motion.div
                  initial={{ x: 320, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 320, opacity: 0 }}
                  transition={{ duration: 0.2, ease }}
                  className="absolute right-0 top-0 bottom-0 z-30 w-80 bg-[#0c0d12] border-l border-white/5 flex flex-col"
                >
                  <div className="flex items-center justify-between p-3 border-b border-white/5 bg-background-soft/30">
                    <span className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono">AI Companion</span>
                    <button onClick={() => setRightPanelOpen(false)} className="p-1 rounded hover:bg-white/5">
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
          gitBranch={gitBranch}
          gitStatus={{ added: 0, modified: currentFile?.modified ? 1 : 0, deleted: 0 }}
          collaborators={remoteCursors.length + 1}
          onToggleShortcuts={() => setShortcutsOpen(true)}
        />
        <KeyboardShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />

        {/* New Branch Modal */}
        <AnimatePresence>
          {showBranchModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: 10 }}
                className="bg-[#faf8f5] border-2 border-[#18181b] p-6 w-full max-w-sm shadow-[6px_6px_0px_0px_#18181b]"
              >
                <h3 className="font-serif text-lg font-bold text-[#18181b] mb-4">Create New Git Branch</h3>
                <form onSubmit={handleCreateBranch} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold">Branch Name</label>
                    <input
                      type="text"
                      placeholder="e.g. feature/new-ui"
                      value={branchInput}
                      onChange={(e) => setBranchInput(e.target.value)}
                      className="w-full h-9 px-3 border-2 border-[#18181b] bg-white text-[#18181b] font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[#e9dcf8]"
                      autoFocus
                      required
                    />
                  </div>
                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setShowBranchModal(false)}
                      className="px-3 py-1.5 border-2 border-[#18181b] bg-white text-[#18181b] font-mono text-[10px] font-bold uppercase"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-[#e9dcf8] text-[#18181b] border-2 border-[#18181b] font-mono text-[10px] font-bold uppercase shadow-[2px_2px_0px_0px_#18181b]"
                    >
                      Create
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Deploy Modal */}
        <AnimatePresence>
          {showDeployModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: 10 }}
                className="bg-[#faf8f5] border-2 border-[#18181b] p-6 w-full max-w-sm shadow-[6px_6px_0px_0px_#18181b] text-center"
              >
                <h3 className="font-serif text-xl font-bold text-[#18181b] mb-4">Deployment Status</h3>
                <div className="py-6 flex flex-col items-center justify-center space-y-4">
                  {deployStatus === 'started' ? (
                    <>
                      <Loader2 className="h-10 w-10 text-[#18181b] animate-spin" />
                      <p className="font-mono text-xs text-zinc-600 animate-pulse">Deployment started... uploading build chunks</p>
                    </>
                  ) : (
                    <>
                      <div className="h-12 w-12 rounded-full bg-emerald-100 border-2 border-emerald-500 flex items-center justify-center text-emerald-600 font-bold text-xl mx-auto">
                        ✓
                      </div>
                      <p className="font-serif text-base font-bold text-[#18181b]">Deployment successful ✅</p>
                      <p className="font-mono text-[10px] text-zinc-500">Live preview update is processing globally.</p>
                    </>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Toast Notifications Container */}
        <div className="fixed bottom-10 right-5 z-[60] flex flex-col gap-2 max-w-sm pointer-events-none">
          <AnimatePresence>
            {toasts.map((t) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.9 }}
                className="bg-white border-2 border-[#18181b] p-4 shadow-[4px_4px_0px_0px_#18181b] rounded-lg pointer-events-auto"
              >
                <p className="font-mono text-xs text-[#18181b] font-bold">{t.message}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Top Header */}
      <div className="h-12 flex items-center gap-3 px-3 border-b border-white/5 bg-background-soft/50 backdrop-blur-xl">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Logo size={22} />
        </button>
        <Separator orientation="vertical" className="h-5 bg-white/5" />
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <span>atlas-engine</span>
          <ChevronRight className="h-3 w-3" />
          <span>engine</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium font-serif">{activeTab?.name}</span>
        </button>
        <div className="ml-auto flex items-center gap-3">
          {error && (
            <div className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded px-2 py-1">
              {error}
            </div>
          )}
          {saving && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Saving...
            </div>
          )}

          {/* Action Simulator buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleAskAISim}
              className="h-8 px-3 border border-white/5 bg-background-soft hover:bg-[#e9dcf8] hover:text-[#18181b] hover:border-[#18181b] text-xs font-mono font-bold rounded-lg flex items-center gap-1.5 transition-all text-muted-foreground hover:shadow-[2px_2px_0px_0px_#18181b]"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Ask AI
            </button>
            <button
              onClick={handleOpenPRSim}
              className="h-8 px-3 border border-white/5 bg-background-soft hover:bg-[#e9dcf8] hover:text-[#18181b] hover:border-[#18181b] text-xs font-mono font-bold rounded-lg flex items-center gap-1.5 transition-all text-muted-foreground hover:shadow-[2px_2px_0px_0px_#18181b]"
            >
              <GitPullRequest className="h-3.5 w-3.5" />
              Open PR
            </button>
            <button
              onClick={handleDeploySim}
              className="h-8 px-3 border border-white/5 bg-background-soft hover:bg-[#e9dcf8] hover:text-[#18181b] hover:border-[#18181b] text-xs font-mono font-bold rounded-lg flex items-center gap-1.5 transition-all text-muted-foreground hover:shadow-[2px_2px_0px_0px_#18181b]"
            >
              <Globe className="h-3.5 w-3.5" />
              Deploy
            </button>
            <button
              onClick={() => setShowBranchModal(true)}
              className="h-8 px-3 border border-white/5 bg-background-soft hover:bg-[#e9dcf8] hover:text-[#18181b] hover:border-[#18181b] text-xs font-mono font-bold rounded-lg flex items-center gap-1.5 transition-all text-muted-foreground hover:shadow-[2px_2px_0px_0px_#18181b]"
            >
              <GitBranch className="h-3.5 w-3.5" />
              Branch
            </button>
          </div>

          <CollaboratorAvatars />
          <Separator orientation="vertical" className="h-5 bg-white/5" />
          <NotificationsPanel />
          <Button size="sm" className="h-8 bg-foreground text-background hover:bg-foreground/90 font-mono font-bold text-xs uppercase shadow-[2px_2px_0px_0px_rgba(255,255,255,0.15)]">
            <Play className="h-3.5 w-3.5 mr-1" />
            Run
          </Button>
        </div>
      </div>

      {/* Middle Panels */}
      <div className="flex-1 flex min-h-0">
        <ActivityBar activePanel={activePanel} onPanelChange={setActivePanel} />

        <ResizablePanelGroup direction="horizontal" className="flex-1">
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
                  className="h-full bg-background-soft/20 border-r border-white/5"
                >
                  <SidePanel panel={activePanel} onBack={onBack} projectFiles={projectFiles} onFileSelect={loadFileContent} projectId={projectId} activeFileId={currentFile?.id} />
                </motion.div>
              )}
            </AnimatePresence>
          </ResizablePanel>

          <ResizableHandle className="bg-white/5 hover:bg-primary/30 transition-colors w-px" />

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
                  <div className="absolute inset-0 bg-[#0a0a0f] z-10 p-6 space-y-4">
                    <div className="shimmer absolute inset-0" />
                    <div className="h-4 w-1/4 rounded bg-white/5" />
                    <div className="space-y-2">
                      <div className="h-4 w-3/4 rounded bg-white/5" />
                      <div className="h-4 w-1/2 rounded bg-white/5" />
                      <div className="h-4 w-5/6 rounded bg-white/5" />
                      <div className="h-4 w-2/3 rounded bg-white/5" />
                    </div>
                    <div className="h-4 w-1/3 rounded bg-white/5 pt-4" />
                    <div className="space-y-2">
                      <div className="h-4 w-4/5 rounded bg-white/5" />
                      <div className="h-4 w-3/5 rounded bg-white/5" />
                    </div>
                  </div>
                ) : !currentFile ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-background-soft/10">
                    <div className="relative mb-4">
                      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                        <FileCode2 className="h-6 w-6 text-primary" />
                      </div>
                      <div className="absolute inset-0 rounded-full blur bg-primary/20 opacity-40 animate-pulse-glow" />
                    </div>
                    <h3 className="text-base font-medium text-foreground/80">No active file open</h3>
                    <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed">
                      Select a file from the explorer sidebar or create a new file to start coding.
                    </p>
                    <div className="mt-6 space-y-2 max-w-xs w-full">
                      <div className="flex items-center gap-6 justify-between text-xs text-muted-foreground/60 border-b border-white/5 pb-1.5">
                        <span>Open Command Palette</span>
                        <kbd className="font-mono text-[10px] bg-white/10 px-1.5 py-0.5 rounded">⌘K</kbd>
                      </div>
                      <div className="flex items-center gap-6 justify-between text-xs text-muted-foreground/60 border-b border-white/5 pb-1.5">
                        <span>Toggle Explorer Panel</span>
                        <kbd className="font-mono text-[10px] bg-white/10 px-1.5 py-0.5 rounded">⌘B</kbd>
                      </div>
                      <div className="flex items-center gap-6 justify-between text-xs text-muted-foreground/60">
                        <span>Toggle AI Assistant</span>
                        <kbd className="font-mono text-[10px] bg-white/10 px-1.5 py-0.5 rounded">⌘⇧A</kbd>
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
              <div className="h-32 border-t border-white/5 bg-background-soft/40 flex flex-col">
                <div className="h-8 flex items-center gap-4 px-4 border-b border-white/5 text-xs">
                  <span className="flex items-center gap-1.5 text-foreground">
                    <SquareTerminal className="h-3.5 w-3.5" />
                    Terminal
                  </span>
                  <span className="text-muted-foreground hover:text-foreground cursor-pointer">
                    Problems
                  </span>
                  <span className="text-muted-foreground hover:text-foreground cursor-pointer">
                    Output
                  </span>
                  <span className="text-muted-foreground hover:text-foreground cursor-pointer">
                    Debug Console
                  </span>
                  <div className="ml-auto flex items-center gap-1">
                    <button className="h-6 w-6 flex items-center justify-center rounded hover:bg-white/5">
                      <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                    <button className="h-6 w-6 flex items-center justify-center rounded hover:bg-white/5">
                      <X className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 font-mono text-xs px-4 py-2 overflow-auto thin-scrollbar">
                  <div className="text-muted-foreground">
                    <span className="text-emerald-400">➜</span> atlas-engine{' '}
                    <span className="text-sky-400">git:(main)</span> npm run dev
                  </div>
                  <div className="text-muted-foreground/70 mt-1">
                    <span className="text-teal-400">✓</span> Compiled successfully in 184ms
                  </div>
                  <div className="text-muted-foreground/70">
                    <span className="text-teal-400">✓</span> Ready on{' '}
                    <span className="text-sky-300">http://localhost:5173</span>
                  </div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="text-muted-foreground/70"
                  >
                    <span className="text-amber-400">⚠</span> 2 collaborators editing
                    engine/index.ts
                  </motion.div>
                  <div className="flex items-center mt-1">
                    <span className="text-emerald-400">➜</span>
                    <span className="ml-2 text-muted-foreground/50">_</span>
                    <motion.span
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="inline-block w-1.5 h-3.5 bg-muted-foreground/50 ml-0.5"
                    />
                  </div>
                </div>
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle className="bg-white/5 hover:bg-primary/30 transition-colors w-px" />

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
        gitBranch={gitBranch}
        gitStatus={{ added: 0, modified: currentFile?.modified ? 1 : 0, deleted: 0 }}
        collaborators={remoteCursors.length + 1}
        onToggleShortcuts={() => setShortcutsOpen(true)}
      />

      <KeyboardShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />

      {/* New Branch Modal */}
      <AnimatePresence>
        {showBranchModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              className="bg-[#faf8f5] border-2 border-[#18181b] p-6 w-full max-w-sm shadow-[6px_6px_0px_0px_#18181b]"
            >
              <h3 className="font-serif text-lg font-bold text-[#18181b] mb-4">Create New Git Branch</h3>
              <form onSubmit={handleCreateBranch} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold">Branch Name</label>
                  <input
                    type="text"
                    placeholder="e.g. feature/new-ui"
                    value={branchInput}
                    onChange={(e) => setBranchInput(e.target.value)}
                    className="w-full h-9 px-3 border-2 border-[#18181b] bg-white text-[#18181b] font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[#e9dcf8]"
                    autoFocus
                    required
                  />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowBranchModal(false)}
                    className="px-3 py-1.5 border-2 border-[#18181b] bg-white text-[#18181b] font-mono text-[10px] font-bold uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-[#e9dcf8] text-[#18181b] border-2 border-[#18181b] font-mono text-[10px] font-bold uppercase shadow-[2px_2px_0px_0px_#18181b]"
                  >
                    Create
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Deploy Modal */}
      <AnimatePresence>
        {showDeployModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              className="bg-[#faf8f5] border-2 border-[#18181b] p-6 w-full max-w-sm shadow-[6px_6px_0px_0px_#18181b] text-center"
            >
              <h3 className="font-serif text-xl font-bold text-[#18181b] mb-4">Deployment Status</h3>
              <div className="py-6 flex flex-col items-center justify-center space-y-4">
                {deployStatus === 'started' ? (
                  <>
                    <Loader2 className="h-10 w-10 text-[#18181b] animate-spin" />
                    <p className="font-mono text-xs text-zinc-600 animate-pulse">Deployment started... uploading build chunks</p>
                  </>
                ) : (
                  <>
                    <div className="h-12 w-12 rounded-full bg-emerald-100 border-2 border-emerald-500 flex items-center justify-center text-emerald-600 font-bold text-xl mx-auto">
                      ✓
                    </div>
                    <p className="font-serif text-base font-bold text-[#18181b]">Deployment successful ✅</p>
                    <p className="font-mono text-[10px] text-zinc-500">Live preview update is processing globally.</p>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notifications Container */}
      <div className="fixed bottom-10 right-5 z-[60] flex flex-col gap-2 max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              className="bg-white border-2 border-[#18181b] p-4 shadow-[4px_4px_0px_0px_#18181b] rounded-lg pointer-events-auto"
            >
              <p className="font-mono text-xs text-[#18181b] font-bold">{t.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}

function CollaboratorAvatars({ isMobile = false }: { isMobile?: boolean }) {
  const visibleCollabs = isMobile ? collaborators.slice(0, 2) : collaborators;
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
