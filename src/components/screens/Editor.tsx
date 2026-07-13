import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  Files,
  Search,
  GitBranch,
  Sparkles,
  Settings,
  Bell,
  Play,
  SquareTerminal,
  Bot,
  PanelRight,
  PanelLeft,
  ChevronRight,
  ChevronDown,
  Circle,
  FileCode2,
  Folder,
  FolderOpen,
  Check,
  X,
  Plus,
  MoreHorizontal,
  Wifi,
  Radio,
  ArrowLeft,
  Send,
  Paperclip,
  Zap,
  Lightbulb,
  Code2,
  MessageSquare,
  Loader2,
} from 'lucide-react';
import { Logo } from '@/components/shared/Logo';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
} from '@/components/ui/command';
import { collaborators, fileTree, codeSample, type FileNode, type Screen } from '@/lib/data';

const ease = [0.16, 1, 0.3, 1] as const;

const activityIcons = [
  { icon: Files, label: 'Explorer', active: true },
  { icon: Search, label: 'Search' },
  { icon: GitBranch, label: 'Source Control' },
  { icon: Bot, label: 'AI Assistant' },
  { icon: Play, label: 'Run & Debug' },
  { icon: Sparkles, label: 'Extensions' },
];

function ActivityBar() {
  return (
    <div className="w-12 shrink-0 flex flex-col items-center py-3 gap-1 border-r border-white/5 bg-background-soft/30">
      {activityIcons.map((item, i) => (
        <button
          key={i}
          className={`relative h-10 w-10 flex items-center justify-center rounded-lg transition-colors group ${
            item.active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {item.active && <div className="absolute left-0 h-6 w-0.5 rounded-r bg-primary" />}
          <item.icon className="h-5 w-5" />
          <div className="absolute left-12 z-50 glass-strong rounded-md px-2 py-1 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            {item.label}
          </div>
        </button>
      ))}
      <div className="mt-auto flex flex-col gap-1">
        <button className="h-10 w-10 flex items-center justify-center text-muted-foreground hover:text-foreground rounded-lg">
          <Settings className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

function FileExplorer({ onBack }: { onBack: () => void }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['src', 'engine']));

  const toggle = (name: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const renderNode = (node: FileNode, depth: number) => {
    const isOpen = expanded.has(node.name);
    if (node.type === 'folder') {
      return (
        <div key={node.name}>
          <button
            onClick={() => toggle(node.name)}
            className="w-full flex items-center gap-1 px-2 py-1 rounded text-sm text-muted-foreground hover:bg-white/5 transition-colors"
            style={{ paddingLeft: `${depth * 12 + 8}px` }}
          >
            {isOpen ? <ChevronDown className="h-3.5 w-3.5 shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
            {isOpen ? <FolderOpen className="h-3.5 w-3.5 text-sky-400 shrink-0" /> : <Folder className="h-3.5 w-3.5 text-sky-400 shrink-0" />}
            <span className="truncate">{node.name}</span>
          </button>
          <AnimatePresence>
            {isOpen && node.children && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease }}
                className="overflow-hidden"
              >
                {node.children.map((child) => renderNode(child, depth + 1))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }
    return (
      <button
        key={node.name}
        className={`w-full flex items-center gap-1.5 px-2 py-1 rounded text-sm transition-colors ${
          node.active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
        }`}
        style={{ paddingLeft: `${depth * 12 + 22}px` }}
      >
        <FileCode2 className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{node.name}</span>
        {node.modified && <Circle className="ml-auto h-2 w-2 fill-current text-primary" />}
      </button>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="h-11 flex items-center justify-between px-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="h-6 w-6 flex items-center justify-center rounded hover:bg-white/5 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Explorer</span>
        </div>
        <div className="flex items-center gap-0.5">
          <button className="h-6 w-6 flex items-center justify-center rounded hover:bg-white/5">
            <Plus className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          <button className="h-6 w-6 flex items-center justify-center rounded hover:bg-white/5">
            <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>
      <div className="px-3 py-2">
        <button className="w-full flex items-center gap-1.5 text-xs font-medium">
          <ChevronDown className="h-3.5 w-3.5" />
          <span>ATLAS-ENGINE</span>
          <Badge variant="secondary" className="ml-auto text-[9px] h-4">main</Badge>
        </button>
      </div>
      <ScrollArea className="flex-1 thin-scrollbar px-1 pb-4">
        <div className="space-y-0.5">
          {fileTree.map((node) => renderNode(node, 0))}
        </div>
      </ScrollArea>
    </div>
  );
}

interface Tab {
  name: string;
  modified?: boolean;
  active?: boolean;
}

const tabs: Tab[] = [
  { name: 'index.ts', modified: true, active: true },
  { name: 'resolver.ts' },
  { name: 'scheduler.ts', modified: true },
  { name: 'app.tsx' },
];

function EditorTabs() {
  return (
    <div className="flex items-center border-b border-white/5 bg-background-soft/30">
      <div className="flex items-center overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <div
            key={tab.name}
            className={`group flex items-center gap-2 px-3 py-2.5 text-xs border-r border-white/5 cursor-pointer transition-colors ${
              tab.active ? 'bg-background text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.03]'
            }`}
          >
            <FileCode2 className="h-3.5 w-3.5 text-sky-400" />
            <span className="whitespace-nowrap">{tab.name}</span>
            {tab.modified ? (
              <Circle className="h-2 w-2 fill-current text-primary group-hover:hidden" />
            ) : null}
            <X className="h-3 w-3 opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity" />
            {tab.active && <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary" />}
          </div>
        ))}
      </div>
      <div className="ml-auto flex items-center pr-2 gap-1">
        <button className="h-7 w-7 flex items-center justify-center rounded hover:bg-white/5">
          <PanelLeft className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
        <button className="h-7 w-7 flex items-center justify-center rounded hover:bg-white/5">
          <PanelRight className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}

function CodeEditor() {
  const lines = codeSample.split('\n');
  const syntax: Record<string, string> = {
    import: 'text-violet-400',
    export: 'text-violet-400',
    function: 'text-sky-400',
    const: 'text-sky-400',
    return: 'text-violet-400',
    '//': 'text-muted-foreground/60 italic',
  };

  const colorize = (line: string) => {
    if (line.trim().startsWith('//')) return <span className="text-muted-foreground/50 italic">{line}</span>;
    const parts: React.ReactNode[] = [];
    let remaining = line;
    let key = 0;
    while (remaining.length > 0) {
      let matched = false;
      for (const [kw, cls] of Object.entries(syntax)) {
        if (kw === '//') continue;
        if (remaining.startsWith(kw)) {
          parts.push(<span key={key++} className={cls}>{kw}</span>);
          remaining = remaining.slice(kw.length);
          matched = true;
          break;
        }
      }
      if (!matched) {
        // strings
        const strMatch = remaining.match(/^['"`]/);
        if (strMatch) {
          const end = remaining.indexOf(remaining[0], 1);
          const str = remaining.slice(0, end + 1);
          parts.push(<span key={key++} className="text-emerald-300">{str}</span>);
          remaining = remaining.slice(end + 1);
          continue;
        }
        // numbers
        const numMatch = remaining.match(/^\d+/);
        if (numMatch) {
          parts.push(<span key={key++} className="text-amber-300">{numMatch[0]}</span>);
          remaining = remaining.slice(numMatch[0].length);
          continue;
        }
        // identifiers / punctuation
        const tokMatch = remaining.match(/^[a-zA-Z_$][a-zA-Z0-9_$]*/);
        if (tokMatch) {
          const tok = tokMatch[0];
          if (['createEngine', 'CRDT', 'Doc', 'init'].includes(tok)) {
            parts.push(<span key={key++} className="text-teal-300">{tok}</span>);
          } else if (['doc', 'engine', 'ops', 'presence', 'awareness', 'throttle'].includes(tok)) {
            parts.push(<span key={key++} className="text-foreground">{tok}</span>);
          } else {
            parts.push(<span key={key++} className="text-foreground/90">{tok}</span>);
          }
          remaining = remaining.slice(tok.length);
          continue;
        }
        const punct = remaining[0];
        parts.push(<span key={key++} className="text-muted-foreground">{punct}</span>);
        remaining = remaining.slice(1);
      }
    }
    return parts;
  };

  return (
    <div className="flex h-full font-mono text-[13px] leading-[1.65]">
      {/* Line numbers */}
      <div className="select-none text-right pr-3 pl-4 py-3 text-muted-foreground/30">
        {lines.map((_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>
      {/* Code */}
      <div className="flex-1 py-3 pr-4 overflow-auto thin-scrollbar">
        {lines.map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.02, duration: 0.3 }}
            className="whitespace-pre"
          >
            {line === '' ? ' ' : colorize(line)}
          </motion.div>
        ))}
        {/* AI ghost text suggestion */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: lines.length * 0.02 + 0.3, duration: 0.6 }}
          className="whitespace-pre text-muted-foreground/50 italic"
        >
          {'\n'}{'  '}// TODO: add throttling for awareness updates
        </motion.div>
        {/* Cursor */}
        <motion.span
          className="inline-block w-[2px] h-4 bg-primary align-middle ml-0.5"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      </div>
    </div>
  );
}

function CollaboratorCursors() {
  return (
    <div className="relative pointer-events-none">
      <motion.div
        className="absolute"
        style={{ top: '88px', left: '320px' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <div className="flex items-center gap-0">
          <div className="w-0.5 h-4 bg-sky-400" />
          <div className="ml-0.5 -mt-1 px-1.5 py-0.5 rounded text-[10px] text-white font-medium" style={{ background: '#38bdf8' }}>
            Maya
          </div>
        </div>
      </motion.div>
      <motion.div
        className="absolute"
        style={{ top: '152px', left: '200px' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <div className="flex items-center gap-0">
          <div className="w-0.5 h-4 bg-teal-400" />
          <div className="ml-0.5 -mt-1 px-1.5 py-0.5 rounded text-[10px] text-black font-medium" style={{ background: '#5eead4' }}>
            Dev
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function EditorArea() {
  return (
    <div className="flex flex-col h-full bg-background min-w-0">
      <EditorTabs />
      <div className="flex-1 relative overflow-hidden">
        <CodeEditor />
        <CollaboratorCursors />
      </div>
      {/* Mini terminal */}
      <div className="h-32 border-t border-white/5 bg-background-soft/40 flex flex-col">
        <div className="h-8 flex items-center gap-4 px-4 border-b border-white/5 text-xs">
          <span className="flex items-center gap-1.5 text-foreground">
            <SquareTerminal className="h-3.5 w-3.5" />
            Terminal
          </span>
          <span className="text-muted-foreground hover:text-foreground cursor-pointer">Problems</span>
          <span className="text-muted-foreground hover:text-foreground cursor-pointer">Output</span>
          <span className="text-muted-foreground hover:text-foreground cursor-pointer">Debug Console</span>
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
            <span className="text-emerald-400">➜</span> atlas-engine <span className="text-sky-400">git:(main)</span> npm run dev
          </div>
          <div className="text-muted-foreground/70 mt-1">
            <span className="text-teal-400">✓</span> Compiled successfully in 184ms
          </div>
          <div className="text-muted-foreground/70">
            <span className="text-teal-400">✓</span> Ready on <span className="text-sky-300">http://localhost:3000</span>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-muted-foreground/70"
          >
            <span className="text-amber-400">⚠</span> 2 collaborators editing engine/index.ts
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
  );
}

function AISidebar() {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: "I see you're working on the collaborative engine. I noticed the `update` handler could benefit from batching. Want me to refactor it?" },
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);

  const send = () => {
    if (!input.trim()) return;
    const userMsg = input;
    setMessages((m) => [...m, { role: 'user', text: userMsg }]);
    setInput('');
    setThinking(true);
    setTimeout(() => {
      setThinking(false);
      setMessages((m) => [...m, { role: 'ai', text: "I'll batch the updates using a microtask queue so we flush once per frame. This reduces worker messages by ~80%. I can open a PR for this — shall I proceed?" }]);
    }, 1600);
  };

  return (
    <div className="flex flex-col h-full bg-background-soft/30">
      {/* Header */}
      <div className="h-11 flex items-center justify-between px-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-medium">Assistant</span>
          <Badge variant="secondary" className="text-[9px] h-4 gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Online
          </Badge>
        </div>
        <button className="h-6 w-6 flex items-center justify-center rounded hover:bg-white/5">
          <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>

      {/* Context chips */}
      <div className="px-3 py-2 border-b border-white/5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {['engine/index.ts', 'CRDT', 'batching'].map((chip) => (
          <div key={chip} className="shrink-0 flex items-center gap-1 text-[10px] glass rounded-full px-2 py-0.5 text-muted-foreground">
            <FileCode2 className="h-2.5 w-2.5" />
            {chip}
            <X className="h-2.5 w-2.5 hover:text-foreground" />
          </div>
        ))}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 thin-scrollbar">
        <div className="p-3 space-y-4">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease }}
              className={msg.role === 'user' ? 'flex justify-end' : 'flex gap-2.5'}
            >
              {msg.role === 'ai' && (
                <div className="h-6 w-6 shrink-0 rounded-md bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center">
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
              )}
              <div
                className={`rounded-xl px-3 py-2 text-sm leading-relaxed max-w-[85%] ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'glass text-foreground/90'
                }`}
              >
                {msg.text}
              </div>
            </motion.div>
          ))}
          {thinking && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2.5">
              <div className="h-6 w-6 shrink-0 rounded-md bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center">
                <Sparkles className="h-3 w-3 text-white" />
              </div>
              <div className="glass rounded-xl px-3 py-2.5 flex items-center gap-1.5">
                {[0, 1, 2].map((d) => (
                  <motion.span
                    key={d}
                    className="h-1.5 w-1.5 rounded-full bg-muted-foreground"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: d * 0.2 }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Quick actions */}
      <div className="px-3 py-2 flex items-center gap-1.5 border-t border-white/5">
        {[
          { icon: Code2, label: 'Explain' },
          { icon: Lightbulb, label: 'Refactor' },
          { icon: Zap, label: 'Optimize' },
        ].map((a) => (
          <button
            key={a.label}
            className="flex items-center gap-1 text-[11px] glass rounded-md px-2 py-1 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
          >
            <a.icon className="h-3 w-3" />
            {a.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-white/5">
        <div className="glass rounded-xl p-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Ask anything, or describe a change…"
            className="w-full bg-transparent text-sm resize-none outline-none placeholder:text-muted-foreground/50 min-h-[40px] max-h-24"
            rows={2}
          />
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-1">
              <button className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-white/5">
                <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
              <button className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-white/5">
                <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>
            <Button size="sm" className="h-7 px-2.5 text-xs" onClick={send} disabled={!input.trim() && !thinking}>
              {thinking ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBar() {
  return (
    <div className="h-6 flex items-center gap-0 text-[11px] bg-gradient-to-r from-sky-600 to-indigo-600 text-white px-2">
      <button className="flex items-center gap-1 px-2 h-full hover:bg-white/10 transition-colors">
        <Radio className="h-3 w-3" />
        Live
      </button>
      <div className="flex items-center gap-1 px-2 h-full">
        <GitBranch className="h-3 w-3" />
        main
      </div>
      <div className="flex items-center gap-1 px-2 h-full hover:bg-white/10 cursor-pointer">
        <Check className="h-3 w-3" />
        0
        <X className="h-3 w-3" />
        0
      </div>
      <div className="flex items-center gap-1 px-2 h-full">
        <Wifi className="h-3 w-3" />
        Connected
      </div>
      <div className="ml-auto flex items-center">
        <div className="flex items-center gap-1 px-2 h-full">
          <span>Ln 17, Col 24</span>
        </div>
        <div className="flex items-center gap-1 px-2 h-full">
          <span>UTF-8</span>
        </div>
        <div className="flex items-center gap-1 px-2 h-full">
          <span>TypeScript</span>
        </div>
        <div className="flex items-center gap-1 px-2 h-full hover:bg-white/10 cursor-pointer">
          <Sparkles className="h-3 w-3" />
          AI ready
        </div>
      </div>
    </div>
  );
}

function CollaboratorAvatars() {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex -space-x-2">
        {collaborators.map((c) => (
          <div key={c.name} className="relative group">
            <Avatar className="h-7 w-7 border-2 border-background">
              <AvatarFallback
                className="text-[10px] font-medium text-white"
                style={{ background: c.color }}
              >
                {c.initials}
              </AvatarFallback>
            </Avatar>
            <div
              className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-background ${
                c.status === 'active' ? 'bg-emerald-400' : c.status === 'viewing' ? 'bg-sky-400' : 'bg-muted-foreground'
              }`}
            />
            <div className="absolute top-9 right-0 z-50 glass-strong rounded-md px-2 py-1 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {c.name} · {c.status}
            </div>
          </div>
        ))}
      </div>
      <Button size="sm" variant="outline" className="h-7 px-2 glass border-white/10 text-xs">
        <Plus className="h-3 w-3" />
        Invite
      </Button>
    </div>
  );
}

function EditorTopBar({ onBack }: { onBack: () => void }) {
  return (
    <div className="h-12 flex items-center gap-3 px-3 border-b border-white/5 bg-background-soft/50 backdrop-blur-xl">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <Logo size={22} />
      </button>
      <Separator orientation="vertical" className="h-5 bg-white/5" />
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
        <span>atlas-engine</span>
        <ChevronRight className="h-3 w-3" />
        <span>engine</span>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground font-medium">index.ts</span>
      </button>
      <div className="ml-auto flex items-center gap-3">
        <CollaboratorAvatars />
        <Separator orientation="vertical" className="h-5 bg-white/5" />
        <button className="h-8 w-8 flex items-center justify-center rounded-lg glass hover:bg-white/5 transition-colors">
          <Bell className="h-4 w-4 text-muted-foreground" />
        </button>
        <Button size="sm" className="h-8 bg-foreground text-background hover:bg-foreground/90">
          <Play className="h-3.5 w-3.5 mr-1" />
          Run
        </Button>
      </div>
    </div>
  );
}

export function Editor({ onBack, onCommand }: { onBack: () => void; onCommand: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onCommand();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onCommand]);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <EditorTopBar onBack={onBack} />
      <div className="flex-1 flex min-h-0">
        <ActivityBar />
        <div className="flex-1 min-w-0">
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={18} minSize={14} maxSize={28} className="bg-background-soft/20">
              <FileExplorer onBack={onBack} />
            </ResizablePanel>
            <ResizableHandle className="bg-white/5 hover:bg-primary/30 transition-colors w-px" />
            <ResizablePanel defaultSize={54} minSize={30}>
              <EditorArea />
            </ResizablePanel>
            <ResizableHandle className="bg-white/5 hover:bg-primary/30 transition-colors w-px" />
            <ResizablePanel defaultSize={28} minSize={20} maxSize={40}>
              <AISidebar />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
      <StatusBar />
    </div>
  );
}

export function CommandPalette({ open, onOpenChange, onNavigate }: { open: boolean; onOpenChange: (o: boolean) => void; onNavigate: (s: Screen) => void }) {
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search files, run commands, ask AI…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => { onNavigate('landing'); onOpenChange(false); }}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go to Landing Page
            <CommandShortcut>⌘1</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => { onNavigate('dashboard'); onOpenChange(false); }}>
            <Files className="mr-2 h-4 w-4" />
            Go to Dashboard
            <CommandShortcut>⌘2</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => { onNavigate('editor'); onOpenChange(false); }}>
            <Code2 className="mr-2 h-4 w-4" />
            Open Editor
            <CommandShortcut>⌘3</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="AI Actions">
          <CommandItem>
            <Sparkles className="mr-2 h-4 w-4" />
            Refactor this file with AI
            <CommandShortcut>⌘R</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <Lightbulb className="mr-2 h-4 w-4" />
            Explain selection
          </CommandItem>
          <CommandItem>
            <Zap className="mr-2 h-4 w-4" />
            Generate unit tests
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Files">
          <CommandItem>
            <FileCode2 className="mr-2 h-4 w-4" />
            engine/index.ts
          </CommandItem>
          <CommandItem>
            <FileCode2 className="mr-2 h-4 w-4" />
            engine/resolver.ts
          </CommandItem>
          <CommandItem>
            <FileCode2 className="mr-2 h-4 w-4" />
            components/Canvas.tsx
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
