import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Command,
  Save,
  Search,
  FileText,
  Terminal,
  GitBranch,
  PanelLeft,
  PanelRight,
  ZoomIn,
  ZoomOut,
  CornerDownLeft,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  X,
  Sparkles,
  Lightbulb,
  Zap,
} from 'lucide-react';

const shortcutGroups = [
  {
    title: 'General',
    shortcuts: [
      { key: '⌘K', description: 'Command Palette', icon: Command },
      { key: '⌘S', description: 'Save File', icon: Save },
      { key: '⌘P', description: 'Quick Open File', icon: FileText },
      { key: '⌘⇧P', description: 'Show All Commands', icon: Command },
      { key: '⌘B', description: 'Toggle Sidebar', icon: PanelLeft },
      { key: '⌘J', description: 'Toggle Terminal', icon: Terminal },
    ],
  },
  {
    title: 'Navigation',
    shortcuts: [
      { key: '⌘G', description: 'Go to Line', icon: ArrowDown },
      { key: '⌘F', description: 'Find in File', icon: Search },
      { key: '⌘⇧F', description: 'Find in Files', icon: Search },
      { key: '⌘[', description: 'Navigate Back', icon: ArrowLeft },
      { key: '⌘]', description: 'Navigate Forward', icon: ArrowRight },
      { key: '⌘↑', description: 'Scroll Up', icon: ArrowUp },
      { key: '⌘↓', description: 'Scroll Down', icon: ArrowDown },
    ],
  },
  {
    title: 'Editor',
    shortcuts: [
      { key: '⌘/', description: 'Toggle Comment', icon: Lightbulb },
      { key: '⌘D', description: 'Select Next Occurrence', icon: Search },
      { key: '⌘⇧K', description: 'Delete Line', icon: X },
      { key: '⌘⇧↑', description: 'Move Line Up', icon: ArrowUp },
      { key: '⌘⇧↓', description: 'Move Line Down', icon: ArrowDown },
      { key: '⌘Enter', description: 'Insert Line Below', icon: CornerDownLeft },
      { key: '⌘⇧Enter', description: 'Insert Line Above', icon: CornerDownLeft },
    ],
  },
  {
    title: 'AI Assistant',
    shortcuts: [
      { key: '⌘I', description: 'Inline AI Chat', icon: Sparkles },
      { key: '⌘R', description: 'AI Refactor', icon: Zap },
      { key: '⌘E', description: 'AI Explain', icon: Lightbulb },
      { key: '⌘⇧A', description: 'Open AI Sidebar', icon: PanelRight },
    ],
  },
  {
    title: 'View',
    shortcuts: [
      { key: '⌘=', description: 'Zoom In', icon: ZoomIn },
      { key: '⌘-', description: 'Zoom Out', icon: ZoomOut },
      { key: '⌘0', description: 'Reset Zoom', icon: ZoomIn },
      { key: '⌘\\', description: 'Split Editor', icon: PanelLeft },
    ],
  },
  {
    title: 'Git',
    shortcuts: [
      { key: '⌘⇧G', description: 'Open Source Control', icon: GitBranch },
      { key: '⌘Enter', description: 'Commit', icon: GitBranch },
      { key: '⌘⇧P', description: 'Push', icon: GitBranch },
      { key: '⌘⇧O', description: 'Pull', icon: GitBranch },
    ],
  },
];

export function KeyboardShortcutsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGroups = shortcutGroups.map((group) => ({
    ...group,
    shortcuts: group.shortcuts.filter(
      (s) =>
        s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.key.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((g) => g.shortcuts.length > 0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false);
      }
    };

    if (open) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-background-soft/30 border-white/10">
        <DialogHeader>
          <DialogTitle className="text-lg">Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search shortcuts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 px-3 rounded-lg bg-background border border-white/10 text-sm outline-none focus:border-primary/50 transition-colors placeholder:text-muted-foreground/50"
          />
        </div>
        <ScrollArea className="h-[500px] thin-scrollbar pr-4">
          <div className="space-y-4">
            {filteredGroups.map((group, groupIndex) => (
              <div key={group.title}>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  {group.title}
                </h3>
                <div className="space-y-1">
                  {group.shortcuts.map((shortcut, index) => (
                    <motion.div
                      key={shortcut.key}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (groupIndex * 10 + index) * 0.01 }}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {shortcut.icon && (
                          <shortcut.icon className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="text-sm">{shortcut.description}</span>
                      </div>
                      <Badge variant="secondary" className="font-mono text-xs h-6">
                        {shortcut.key}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
                {groupIndex < filteredGroups.length - 1 && <Separator className="my-4" />}
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
