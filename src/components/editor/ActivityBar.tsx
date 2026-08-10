import { demoStorage } from '@/services/demoStorage';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Files,
  Search,
  GitBranch,
  Sparkles,
  Settings,
  Play,
  Bot,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FolderPlus,
  FileCode2,
  Circle,
  Plus,
  MoreHorizontal,
  Bug,
  Rocket,
  Puzzle,
  History,
  AlertTriangle,
  CheckCircle,
  X,
  Loader2,
  Pencil,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';

import { type File as FileType } from '@/services/firestore';
import { firestoreService } from '@/services/firestore';
import { useAuth } from '@/contexts/AuthContext';

const ease = [0.16, 1, 0.3, 1] as const;

export type ActivityPanel =
  | 'explorer'
  | 'search'
  | 'source-control'
  | 'ai'
  | 'run-debug'
  | 'extensions';

const activityIcons = [
  { id: 'explorer' as ActivityPanel, icon: Files, label: 'Explorer' },
  { id: 'search' as ActivityPanel, icon: Search, label: 'Search' },
  {
    id: 'source-control' as ActivityPanel,
    icon: GitBranch,
    label: 'Source Control',
  },
  { id: 'ai' as ActivityPanel, icon: Bot, label: 'AI Assistant' },
  { id: 'run-debug' as ActivityPanel, icon: Play, label: 'Run & Debug' },
  {
    id: 'extensions' as ActivityPanel,
    icon: Sparkles,
    label: 'Extensions',
  },
];

interface ActivityBarProps {
  activePanel: ActivityPanel;
  onPanelChange: (panel: ActivityPanel) => void;
}

export function ActivityBar({
  activePanel,
  onPanelChange,
}: ActivityBarProps) {
  return (
    <div className="w-12 shrink-0 flex flex-col items-center py-3 gap-1 border-r border-border/40 bg-background-soft/60">
      {activityIcons.map((item) => (
        <button
          key={item.id}
          onClick={() => onPanelChange(item.id)}
          className={`relative h-10 w-10 flex items-center justify-center rounded-lg transition-colors group ${
            activePanel === item.id
              ? 'text-foreground'
              : 'text-foreground/70 hover:text-foreground'
          }`}
        >
          {activePanel === item.id && (
            <div className="absolute left-0 h-6 w-0.5 rounded-r bg-primary" />
          )}

          <item.icon className="h-5 w-5" />

          <div className="absolute left-12 z-50 bg-card border border-border/40 rounded-md px-2 py-1 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-sm font-medium text-foreground">
            {item.label}
          </div>
        </button>
      ))}

      <div className="mt-auto flex flex-col gap-1">
        <button className="h-10 w-10 flex items-center justify-center text-foreground/70 hover:text-foreground rounded-lg">
          <Settings className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

export interface SidePanelProps {
  panel: ActivityPanel;
  onBack: () => void;
  projectFiles?: FileType[];
  onFileSelect?: (fileId: string) => Promise<void>;
  projectId?: string;
  activeFileId?: string;
}

export function SidePanel({
  panel,
  onBack,
  projectFiles = [],
  onFileSelect,
  projectId,
  activeFileId,
}: SidePanelProps) {
  switch (panel) {
    case 'explorer':
      return (
        <FileExplorerPanel
          onBack={onBack}
          projectFiles={projectFiles}
          onFileSelect={onFileSelect}
          projectId={projectId}
          activeFileId={activeFileId}
        />
      );

    case 'search':
      return <SearchPanel />;

    case 'source-control':
      return <SourceControlPanel />;

    case 'ai':
      return <AIPanel />;

    case 'run-debug':
      return <RunDebugPanel />;

    case 'extensions':
      return <ExtensionsPanel />;

    default:
      return (
        <FileExplorerPanel
          onBack={onBack}
          projectFiles={projectFiles}
          onFileSelect={onFileSelect}
          projectId={projectId}
          activeFileId={activeFileId}
        />
      );
  }
}

interface ExplorerFileNode {
  name: string;
  type: 'file' | 'folder';
  path: string;
  fileId?: string;
  children?: ExplorerFileNode[];
  modified?: boolean;
}

function buildFileTree(files: FileType[]): ExplorerFileNode[] {
  const root: ExplorerFileNode[] = [];

  files.forEach((file) => {
    const parts = file.path.split('/').filter(Boolean);

    let currentLevel = root;
    let currentPath = '';

    parts.forEach((part, index) => {
      const isLast = index === parts.length - 1;

      // .keep is only used to make folders exist in Firestore.
      // It should never appear in the UI.
      if (isLast && part === '.keep') {
        return;
      }

      currentPath += '/' + part;

      let existingNode = currentLevel.find(
        (node) => node.path === currentPath
      );

      if (!existingNode) {
        existingNode = {
          name: part,
          type: isLast ? 'file' : 'folder',
          path: currentPath,
          fileId: isLast ? file.id : undefined,
          children: isLast ? undefined : [],
          modified: isLast ? file.modified : false,
        };

        currentLevel.push(existingNode);
      } else if (isLast) {
        existingNode.fileId = file.id;
        existingNode.type = 'file';
        existingNode.modified = file.modified;
      }

      if (!isLast && existingNode.children) {
        currentLevel = existingNode.children;
      }
    });
  });

  const sortTree = (nodes: ExplorerFileNode[]) => {
    nodes.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }

      return a.name.localeCompare(b.name);
    });

    nodes.forEach((node) => {
      if (node.children) {
        sortTree(node.children);
      }
    });
  };

  sortTree(root);

  return root;
}

function FileExplorerPanel({
  onBack,
  projectFiles = [],
  onFileSelect,
  projectId,
  activeFileId,
}: {
  onBack: () => void;
  projectFiles?: FileType[];
  onFileSelect?: (fileId: string) => Promise<void>;
  projectId?: string;
  activeFileId?: string;
}) {
  const { user } = useAuth();

  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(['/src', '/engine'])
  );

  const [selectedPath, setSelectedPath] = useState<string>('');

  const [createFileOpen, setCreateFileOpen] = useState(false);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);

  const [newFileName, setNewFileName] = useState('');
  const [newFolderName, setNewFolderName] = useState('');

  const [creating, setCreating] = useState(false);

  const toggle = (path: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);

      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }

      return next;
    });
  };

  const handleFileClick = async (fileId: string) => {
    if (onFileSelect) {
      await onFileSelect(fileId);
    }
  };

  /*
   * ---------------------------------------------------------
   * CREATE FILE
   * ---------------------------------------------------------
   *
   * Works in both:
   * 1. Logged-in Firebase mode
   * 2. Demo mode
   */
  const handleCreateFile = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanFileName = newFileName.trim();

    if (!cleanFileName || !projectId) {
      return;
    }

    setCreating(true);

    try {
      let targetPath = selectedPath || '/';

      if (!targetPath.startsWith('/')) {
        targetPath = '/' + targetPath;
      }

      if (
        targetPath.endsWith('/') &&
        targetPath !== '/'
      ) {
        targetPath = targetPath.slice(0, -1);
      }

      const fullPath =
        targetPath === '/'
          ? `/${cleanFileName}`
          : `${targetPath}/${cleanFileName}`;

      let language = 'javascript';

      if (cleanFileName.endsWith('.tsx')) {
        language = 'tsx';
      } else if (cleanFileName.endsWith('.ts')) {
        language = 'typescript';
      } else if (cleanFileName.endsWith('.jsx')) {
        language = 'jsx';
      } else if (cleanFileName.endsWith('.py')) {
        language = 'python';
      } else if (cleanFileName.endsWith('.java')) {
        language = 'java';
      } else if (cleanFileName.endsWith('.json')) {
        language = 'json';
      } else if (cleanFileName.endsWith('.css')) {
        language = 'css';
      } else if (cleanFileName.endsWith('.html')) {
        language = 'html';
      }

      const fileData = {
        projectId,
        name: cleanFileName,
        content: '',
        language,
        path: fullPath,
        modified: false,
      };

      let fileId: string;

      if (user?.uid) {
        // Firebase mode
        fileId = await firestoreService.createFile(fileData);
      } else {
        // Demo mode
        fileId = demoStorage.createFile(fileData);
      }

      // Open newly created file
      if (onFileSelect) {
        await onFileSelect(fileId);
      }

      // Close modal
      setCreateFileOpen(false);
      setNewFileName('');
    } catch (error) {
      console.error('Failed to create file:', error);
    } finally {
      setCreating(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * CREATE FOLDER
   * ---------------------------------------------------------
   *
   * Firestore/demoStorage doesn't have a separate folder
   * collection, so we create a hidden .keep file.
   */
  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanFolderName = newFolderName.trim();

    if (!cleanFolderName || !projectId) {
      return;
    }

    setCreating(true);

    try {
      let targetPath = selectedPath || '/';

      if (!targetPath.startsWith('/')) {
        targetPath = '/' + targetPath;
      }

      if (
        targetPath.endsWith('/') &&
        targetPath !== '/'
      ) {
        targetPath = targetPath.slice(0, -1);
      }

      const cleanPath =
        targetPath === '/'
          ? `/${cleanFolderName}`
          : `${targetPath}/${cleanFolderName}`;

      const keepFilePath = `${cleanPath}/.keep`;

      const folderFileData = {
        projectId,
        name: '.keep',
        content: '',
        language: 'plaintext',
        path: keepFilePath,
        modified: false,
      };

      if (user?.uid) {
        // Firebase mode
        await firestoreService.createFile(folderFileData);
      } else {
        // Demo mode
        demoStorage.createFile(folderFileData);
      }

      // Open newly created folder
      setExpanded((prev) => {
        const next = new Set(prev);
        next.add(cleanPath);
        return next;
      });

      setSelectedPath(cleanPath);

      setCreateFolderOpen(false);
      setNewFolderName('');
    } catch (error) {
      console.error('Failed to create folder:', error);
    } finally {
      setCreating(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * RENAME FILE / FOLDER
   * ---------------------------------------------------------
   *
   * Double click any file/folder to rename.
   */
  const handleRename = async (node: ExplorerFileNode) => {
    const newName = window.prompt(
      `Rename "${node.name}" to:`,
      node.name
    );

    if (!newName) {
      return;
    }

    const cleanName = newName.trim();

    if (!cleanName || cleanName === node.name) {
      return;
    }

    try {
      /*
       * FILE RENAME
       */
      if (node.type === 'file' && node.fileId) {
        const file = projectFiles.find(
          (item) => item.id === node.fileId
        );

        if (!file) {
          return;
        }

        const lastSlash = node.path.lastIndexOf('/');

        const parentPath =
          lastSlash > 0
            ? node.path.substring(0, lastSlash)
            : '/';

        const newPath =
          parentPath === '/'
            ? `/${cleanName}`
            : `${parentPath}/${cleanName}`;

        if (user?.uid) {
          await firestoreService.updateFile(
            node.fileId,
            {
              name: cleanName,
              path: newPath,
            }
          );
        } else {
          demoStorage.updateFile(
            node.fileId,
            {
              name: cleanName,
              path: newPath,
            }
          );
        }

        return;
      }

      /*
       * FOLDER RENAME
       *
       * A folder is represented by its .keep file and
       * all child files underneath the folder path.
       */
      if (node.type === 'folder') {
        const oldPath = node.path;

        const lastSlash = oldPath.lastIndexOf('/');

        const parentPath =
          lastSlash > 0
            ? oldPath.substring(0, lastSlash)
            : '';

        const newPath =
          parentPath
            ? `${parentPath}/${cleanName}`
            : `/${cleanName}`;

        const children = projectFiles.filter(
          (file) =>
            file.path === `${oldPath}/.keep` ||
            file.path.startsWith(`${oldPath}/`)
        );

        for (const file of children) {
          const updatedPath = file.path.replace(
            oldPath,
            newPath
          );

          if (user?.uid) {
            await firestoreService.updateFile(
              file.id,
              {
                path: updatedPath,
              }
            );
          } else {
            demoStorage.updateFile(
              file.id,
              {
                path: updatedPath,
              }
            );
          }
        }

        setExpanded((prev) => {
          const next = new Set(prev);

          if (next.has(oldPath)) {
            next.delete(oldPath);
            next.add(newPath);
          }

          return next;
        });

        if (selectedPath === oldPath) {
          setSelectedPath(newPath);
        }
      }
    } catch (error) {
      console.error('Failed to rename:', error);
    }
  };

  const treeNodes = buildFileTree(projectFiles);

  const renderNode = (
    node: ExplorerFileNode,
    depth: number
  ) => {
    const isOpen = expanded.has(node.path);

    /*
     * -------------------------------------------------------
     * FOLDER
     * -------------------------------------------------------
     */
    if (node.type === 'folder') {
      const isSelected =
        selectedPath === node.path;

      return (
        <div key={node.path}>
          <div className="group relative">
            <button
              onClick={() => {
                toggle(node.path);
                setSelectedPath(node.path);
              }}
              onDoubleClick={() => {
                handleRename(node);
              }}
              className={`w-full flex items-center gap-1.5 px-2 py-1 rounded text-sm transition-colors ${
                isSelected
                  ? 'bg-primary/30 text-foreground font-bold'
                  : 'text-foreground/80 hover:bg-primary/20 hover:text-foreground font-medium'
              }`}
              style={{
                paddingLeft: `${depth * 12 + 8}px`,
              }}
            >
              {isOpen ? (
                <ChevronDown className="h-3.5 w-3.5 shrink-0" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 shrink-0" />
              )}

              {isOpen ? (
                <FolderOpen className="h-3.5 w-3.5 text-primary shrink-0" />
              ) : (
                <Folder className="h-3.5 w-3.5 text-foreground/60 shrink-0" />
              )}

              <span className="truncate">
                {node.name}
              </span>
            </button>

            {/* Rename icon appears on hover */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRename(node);
              }}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 hidden group-hover:flex items-center justify-center rounded hover:bg-white/10"
              title="Rename folder"
            >
              <Pencil className="h-3 w-3 text-muted-foreground" />
            </button>
          </div>

          <AnimatePresence>
            {isOpen && node.children && (
              <motion.div
                initial={{
                  height: 0,
                  opacity: 0,
                }}
                animate={{
                  height: 'auto',
                  opacity: 1,
                }}
                exit={{
                  height: 0,
                  opacity: 0,
                }}
                transition={{
                  duration: 0.2,
                  ease,
                }}
                className="overflow-hidden"
              >
                {node.children.map((child) =>
                  renderNode(child, depth + 1)
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    /*
     * -------------------------------------------------------
     * FILE
     * -------------------------------------------------------
     */

    const isActive =
      activeFileId === node.fileId;

    return (
      <div
        key={node.path}
        className="group relative"
      >
        <button
          onClick={() => {
            if (node.fileId) {
              handleFileClick(node.fileId);

              const lastSlash =
                node.path.lastIndexOf('/');

              const parentPath =
                lastSlash > 0
                  ? node.path.substring(
                      0,
                      lastSlash
                    )
                  : '/';

              setSelectedPath(parentPath);
            }
          }}
          onDoubleClick={() => {
            handleRename(node);
          }}
          className={`w-full flex items-center gap-1.5 px-2 py-1 rounded text-sm transition-colors ${
            isActive
              ? 'bg-primary/40 text-foreground font-bold'
              : 'text-foreground/80 hover:bg-primary/20 hover:text-foreground font-medium'
          }`}
          style={{
            paddingLeft: `${depth * 12 + 22}px`,
          }}
        >
          <FileCode2 className="h-3.5 w-3.5 shrink-0" />

          <span className="truncate">
            {node.name}
          </span>

          {node.modified && (
            <Circle className="ml-auto h-2 w-2 fill-current text-primary" />
          )}
        </button>

        {/* Rename icon appears on hover */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleRename(node);
          }}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 hidden group-hover:flex items-center justify-center rounded hover:bg-white/10"
          title="Rename file"
        >
          <Pencil className="h-3 w-3 text-muted-foreground" />
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">

      {/* =====================================================
          EXPLORER HEADER
      ====================================================== */}
      <div className="relative z-50 h-11 flex items-center justify-between px-3 border-b border-white/5 pointer-events-auto">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="h-6 w-6 flex items-center justify-center rounded hover:bg-white/5 transition-colors"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>

          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Explorer
          </span>
        </div>

        <div className="relative z-50 flex items-center gap-0.5 pointer-events-auto">

          {/* NEW FILE */}
          <button
            onClick={() => {
              setNewFileName('');
              setCreateFileOpen(true);
            }}
            className="h-6 w-6 flex items-center justify-center rounded hover:bg-white/5"
            title="New File"
          >
            <Plus className="h-3.5 w-3.5 text-muted-foreground" />
          </button>

          {/* NEW FOLDER */}
          <button
            onClick={() => {
              setNewFolderName('');
              setCreateFolderOpen(true);
            }}
            className="h-6 w-6 flex items-center justify-center rounded hover:bg-white/5"
            title="New Folder"
          >
            <FolderPlus className="h-3.5 w-3.5 text-muted-foreground" />
          </button>

          <button
            className="h-6 w-6 flex items-center justify-center rounded hover:bg-white/5"
            title="More"
          >
            <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* =====================================================
          PROJECT ROOT
      ====================================================== */}
      <div className="px-3 py-2">
        <button
          onClick={() => setSelectedPath('/')}
          className={`w-full flex items-center gap-1.5 text-xs font-medium p-1 rounded hover:bg-white/5 ${
            selectedPath === '/' ||
            selectedPath === ''
              ? 'text-primary'
              : 'text-foreground'
          }`}
        >
          <ChevronDown className="h-3.5 w-3.5" />

          <span>ATLAS-ENGINE</span>

          <Badge
            variant="secondary"
            className="ml-auto text-[9px] h-4"
          >
            main
          </Badge>
        </button>
      </div>

      {/* =====================================================
          FILE TREE
      ====================================================== */}
      <ScrollArea className="flex-1 thin-scrollbar px-1 pb-4">
        {treeNodes.length > 0 ? (
          <div className="space-y-0.5">
            {treeNodes.map((node) =>
              renderNode(node, 0)
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-muted-foreground font-mono">
            No files in project
          </div>
        )}
      </ScrollArea>

      {/* =====================================================
          CREATE FILE MODAL
      ====================================================== */}
      <AnimatePresence>
        {createFileOpen &&
          createPortal(
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
              onClick={() =>
                setCreateFileOpen(false)
              }
            >
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.95,
                  y: 10,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.95,
                  y: 10,
                }}
                onClick={(e) =>
                  e.stopPropagation()
                }
                className="bg-[#faf8f5] border-2 border-[#18181b] p-6 w-full max-w-sm shadow-[6px_6px_0px_0px_#18181b] text-foreground"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif text-lg font-bold text-[#18181b]">
                    Create new file
                  </h3>

                  <button
                    onClick={() =>
                      setCreateFileOpen(false)
                    }
                    className="h-6 w-6 flex items-center justify-center rounded border border-[#e5e2db] hover:bg-black/5"
                  >
                    <X className="h-3.5 w-3.5 text-[#5e5f62]" />
                  </button>
                </div>

                <form
                  onSubmit={handleCreateFile}
                  className="space-y-4"
                >
                  <div className="space-y-1.5">

                    <div className="text-[10px] font-mono text-zinc-500 mb-1">
                      Target directory:{' '}
                      <span className="text-[#18181b] font-bold">
                        {selectedPath || '/'}
                      </span>
                    </div>

                    <label
                      htmlFor="fileName"
                      className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold"
                    >
                      File name
                    </label>

                    <input
                      id="fileName"
                      type="text"
                      placeholder="example.ts"
                      value={newFileName}
                      onChange={(e) =>
                        setNewFileName(
                          e.target.value
                        )
                      }
                      className="w-full h-9 px-3 border-2 border-[#18181b] bg-white text-[#18181b] font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[#e9dcf8]"
                      required
                      autoFocus
                    />
                  </div>

                  <div className="flex gap-2 justify-end pt-2">

                    <button
                      type="button"
                      onClick={() =>
                        setCreateFileOpen(false)
                      }
                      className="flex-1 h-9 border-2 border-[#18181b] bg-white text-[#18181b] font-mono text-xs font-bold uppercase"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="flex-1 h-9 bg-[#e9dcf8] text-[#18181b] border-2 border-[#18181b] font-mono text-xs font-bold uppercase shadow-[2px_2px_0px_0px_#18181b] flex items-center justify-center"
                      disabled={creating}
                    >
                      {creating ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        'Create'
                      )}
                    </button>

                  </div>
                </form>
              </motion.div>
            </motion.div>,
            document.body
          )}
      </AnimatePresence>

      {/* =====================================================
          CREATE FOLDER MODAL
      ====================================================== */}
      <AnimatePresence>
        {createFolderOpen &&
          createPortal(
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
              onClick={() =>
                setCreateFolderOpen(false)
              }
            >
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.95,
                  y: 10,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.95,
                  y: 10,
                }}
                onClick={(e) =>
                  e.stopPropagation()
                }
                className="bg-[#faf8f5] border-2 border-[#18181b] p-6 w-full max-w-sm shadow-[6px_6px_0px_0px_#18181b] text-foreground"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif text-lg font-bold text-[#18181b]">
                    Create new folder
                  </h3>

                  <button
                    onClick={() =>
                      setCreateFolderOpen(false)
                    }
                    className="h-6 w-6 flex items-center justify-center rounded border border-[#e5e2db] hover:bg-black/5"
                  >
                    <X className="h-3.5 w-3.5 text-[#5e5f62]" />
                  </button>
                </div>

                <form
                  onSubmit={handleCreateFolder}
                  className="space-y-4"
                >
                  <div className="space-y-1.5">

                    <div className="text-[10px] font-mono text-zinc-500 mb-1">
                      Target directory:{' '}
                      <span className="text-[#18181b] font-bold">
                        {selectedPath || '/'}
                      </span>
                    </div>

                    <label
                      htmlFor="folderName"
                      className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold"
                    >
                      Folder name
                    </label>

                    <input
                      id="folderName"
                      type="text"
                      placeholder="e.g. components"
                      value={newFolderName}
                      onChange={(e) =>
                        setNewFolderName(
                          e.target.value
                        )
                      }
                      className="w-full h-9 px-3 border-2 border-[#18181b] bg-white text-[#18181b] font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[#e9dcf8]"
                      required
                      autoFocus
                    />
                  </div>

                  <div className="flex gap-2 justify-end pt-2">

                    <button
                      type="button"
                      onClick={() =>
                        setCreateFolderOpen(false)
                      }
                      className="flex-1 h-9 border-2 border-[#18181b] bg-white text-[#18181b] font-mono text-xs font-bold uppercase"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="flex-1 h-9 bg-[#e9dcf8] text-[#18181b] border-2 border-[#18181b] font-mono text-xs font-bold uppercase shadow-[2px_2px_0px_0px_#18181b] flex items-center justify-center"
                      disabled={creating}
                    >
                      {creating ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        'Create'
                      )}
                    </button>

                  </div>
                </form>
              </motion.div>
            </motion.div>,
            document.body
          )}
      </AnimatePresence>
    </div>
  );
}

/* ============================================================
   SEARCH PANEL
============================================================ */

function SearchPanel() {
  const [query, setQuery] = useState('');

  const [results] = useState([
    {
      file: 'engine/index.ts',
      matches: 3,
      line: 23,
    },
    {
      file: 'engine/resolver.ts',
      matches: 1,
      line: 45,
    },
    {
      file: 'scheduler.ts',
      matches: 2,
      line: 12,
    },
  ]);

  return (
    <div className="flex flex-col h-full">

      <div className="h-11 flex items-center justify-between px-3 border-b border-white/5">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Search
        </span>

        <div className="flex items-center gap-0.5">
          <button className="h-6 w-6 flex items-center justify-center rounded hover:bg-white/5">
            <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="p-3 border-b border-white/5">
        <Input
          placeholder="Search files..."
          value={query}
          onChange={(e) =>
            setQuery(e.target.value)
          }
          className="h-8 text-xs"
        />
      </div>

      <ScrollArea className="flex-1 thin-scrollbar p-2">
        <div className="space-y-1">

          {results.map((result, i) => (
            <motion.div
              key={result.file}
              initial={{
                opacity: 0,
                x: -10,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                delay: i * 0.05,
              }}
              className="p-2 rounded hover:bg-white/5 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">

                <FileCode2 className="h-3.5 w-3.5 text-sky-400" />

                <span className="text-xs">
                  {result.file}
                </span>

                <Badge
                  variant="secondary"
                  className="ml-auto text-[9px] h-4"
                >
                  {result.matches}
                </Badge>

              </div>

              <div className="text-[10px] text-muted-foreground mt-1 ml-5">
                Line {result.line}
              </div>
            </motion.div>
          ))}

        </div>
      </ScrollArea>
    </div>
  );
}

/* ============================================================
   SOURCE CONTROL
============================================================ */

function SourceControlPanel() {
  const changes = [
    {
      file: 'engine/index.ts',
      status: 'modified',
      additions: 12,
      deletions: 3,
    },
    {
      file: 'scheduler.ts',
      status: 'modified',
      additions: 5,
      deletions: 8,
    },
    {
      file: 'components/Canvas.tsx',
      status: 'added',
      additions: 45,
      deletions: 0,
    },
  ];

  return (
    <div className="flex flex-col h-full">

      <div className="h-11 flex items-center justify-between px-3 border-b border-white/5">

        <div className="flex items-center gap-2">
          <GitBranch className="h-3.5 w-3.5 text-emerald-400" />

          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Source Control
          </span>
        </div>

        <Badge
          variant="secondary"
          className="text-[9px] h-4"
        >
          main
        </Badge>

      </div>

      <div className="p-3 border-b border-white/5">

        <div className="flex items-center gap-2">

          <Button
            size="sm"
            className="h-7 text-xs"
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Commit
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs glass border-white/10"
          >
            <History className="h-3 w-3 mr-1" />
            Sync
          </Button>

        </div>
      </div>

      <ScrollArea className="flex-1 thin-scrollbar p-2">

        <div className="space-y-1">

          {changes.map((change, i) => (
            <motion.div
              key={change.file}
              initial={{
                opacity: 0,
                x: -10,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                delay: i * 0.05,
              }}
              className="p-2 rounded hover:bg-white/5 cursor-pointer transition-colors"
            >

              <div className="flex items-center gap-2">

                {change.status === 'modified' && (
                  <Circle className="h-3 w-3 fill-current text-amber-400" />
                )}

                {change.status === 'added' && (
                  <Plus className="h-3 w-3 text-emerald-400" />
                )}

                <span className="text-xs">
                  {change.file}
                </span>

              </div>

              <div className="flex items-center gap-3 mt-1 ml-5 text-[10px]">

                <span className="text-emerald-400">
                  +{change.additions}
                </span>

                <span className="text-red-400">
                  -{change.deletions}
                </span>

              </div>

            </motion.div>
          ))}

        </div>

      </ScrollArea>
    </div>
  );
}

/* ============================================================
   AI PANEL
============================================================ */

function AIPanel() {
  return (
    <div className="flex flex-col h-full">

      <div className="h-11 flex items-center justify-between px-3 border-b border-white/5">

        <div className="flex items-center gap-2">

          <Bot className="h-3.5 w-3.5 text-sky-400" />

          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            AI Assistant
          </span>

        </div>

        <Badge
          variant="secondary"
          className="text-[9px] h-4 gap-1"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Online
        </Badge>

      </div>

      <div className="flex-1 flex items-center justify-center p-4">

        <div className="text-center">

          <Bot className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />

          <p className="text-xs text-muted-foreground">
            AI features available in the right sidebar
          </p>

        </div>

      </div>
    </div>
  );
}

/* ============================================================
   RUN & DEBUG
============================================================ */

function RunDebugPanel() {
  return (
    <div className="flex flex-col h-full">

      <div className="h-11 flex items-center justify-between px-3 border-b border-white/5">

        <div className="flex items-center gap-2">

          <Play className="h-3.5 w-3.5 text-emerald-400" />

          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Run & Debug
          </span>

        </div>

      </div>

      <div className="p-3 border-b border-white/5">

        <Button
          size="sm"
          className="h-7 text-xs w-full"
        >
          <Play className="h-3 w-3 mr-1" />
          Run and Debug
        </Button>

      </div>

      <ScrollArea className="flex-1 thin-scrollbar p-2">

        <div className="space-y-2">

          <div className="text-[10px] text-muted-foreground uppercase tracking-wider px-2">
            Recent
          </div>

          {[
            'npm run dev',
            'npm test',
            'npm build',
          ].map((cmd, i) => (
            <motion.button
              key={cmd}
              initial={{
                opacity: 0,
                x: -10,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                delay: i * 0.05,
              }}
              className="w-full p-2 rounded hover:bg-white/5 text-left transition-colors"
            >

              <div className="flex items-center gap-2">

                <Rocket className="h-3.5 w-3.5 text-muted-foreground" />

                <span className="text-xs">
                  {cmd}
                </span>

              </div>

            </motion.button>
          ))}

        </div>

      </ScrollArea>
    </div>
  );
}

/* ============================================================
   EXTENSIONS
============================================================ */

function ExtensionsPanel() {
  const extensions = [
    {
      name: 'Prettier',
      author: 'Prettier',
      installed: true,
      icon: Sparkles,
    },
    {
      name: 'ESLint',
      author: 'Microsoft',
      installed: true,
      icon: AlertTriangle,
    },
    {
      name: 'GitLens',
      author: 'GitKraken',
      installed: false,
      icon: GitBranch,
    },
    {
      name: 'Thunder Client',
      author: 'Ranga Vadhineni',
      installed: false,
      icon: Bug,
    },
  ];

  return (
    <div className="flex flex-col h-full">

      <div className="h-11 flex items-center justify-between px-3 border-b border-white/5">

        <div className="flex items-center gap-2">

          <Puzzle className="h-3.5 w-3.5 text-violet-400" />

          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Extensions
          </span>

        </div>

        <button className="h-6 w-6 flex items-center justify-center rounded hover:bg-white/5">
          <Plus className="h-3.5 w-3.5 text-muted-foreground" />
        </button>

      </div>

      <div className="p-3 border-b border-white/5">

        <Input
          placeholder="Search extensions..."
          className="h-8 text-xs"
        />

      </div>

      <ScrollArea className="flex-1 thin-scrollbar p-2">

        <div className="space-y-2">

          <div className="text-[10px] text-muted-foreground uppercase tracking-wider px-2">
            Installed
          </div>

          {extensions
            .filter((e) => e.installed)
            .map((ext, i) => (
              <motion.div
                key={ext.name}
                initial={{
                  opacity: 0,
                  x: -10,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  delay: i * 0.05,
                }}
                className="p-2 rounded hover:bg-white/5 cursor-pointer transition-colors"
              >

                <div className="flex items-center gap-2">

                  <ext.icon className="h-4 w-4 text-muted-foreground" />

                  <div className="flex-1 min-w-0">

                    <div className="text-xs font-medium">
                      {ext.name}
                    </div>

                    <div className="text-[10px] text-muted-foreground">
                      {ext.author}
                    </div>

                  </div>

                  <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />

                </div>

              </motion.div>
            ))}

          <div className="text-[10px] text-muted-foreground uppercase tracking-wider px-2 mt-4">
            Recommended
          </div>

          {extensions
            .filter((e) => !e.installed)
            .map((ext, i) => (
              <motion.div
                key={ext.name}
                initial={{
                  opacity: 0,
                  x: -10,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  delay: i * 0.05,
                }}
                className="p-2 rounded hover:bg-white/5 cursor-pointer transition-colors"
              >

                <div className="flex items-center gap-2">

                  <ext.icon className="h-4 w-4 text-muted-foreground" />

                  <div className="flex-1 min-w-0">

                    <div className="text-xs font-medium">
                      {ext.name}
                    </div>

                    <div className="text-[10px] text-muted-foreground">
                      {ext.author}
                    </div>

                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2 text-[10px]"
                  >
                    Install
                  </Button>

                </div>

              </motion.div>
            ))}

        </div>

      </ScrollArea>
    </div>
  );
}