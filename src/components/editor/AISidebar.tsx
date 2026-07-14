import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Send,
  Paperclip,
  MessageSquare,
  Code2,
  Lightbulb,
  Zap,
  Loader2,
  X,
  FileCode2,
  GitBranch,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreHorizontal,
  Copy,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { geminiService } from '@/services/gemini';

const ease = [0.16, 1, 0.3, 1] as const;

interface Message {
  role: 'user' | 'ai';
  text: string;
  timestamp?: string;
}

interface CodeReview {
  id: string;
  file: string;
  line: number;
  type: 'suggestion' | 'warning' | 'error';
  message: string;
  code: string;
  status: 'pending' | 'accepted' | 'rejected';
}

interface VersionHistory {
  id: string;
  version: string;
  author: string;
  timestamp: string;
  message: string;
  changes: number;
}

const codeReviews: CodeReview[] = [
  {
    id: '1',
    file: 'engine/index.ts',
    line: 23,
    type: 'suggestion',
    message: 'Consider using a microtask queue for batching updates',
    code: 'engine.on("update", (ops) => {',
    status: 'pending',
  },
  {
    id: '2',
    file: 'engine/resolver.ts',
    line: 45,
    type: 'warning',
    message: 'Potential memory leak: event listener not cleaned up',
    code: 'document.addEventListener("resize", handler);',
    status: 'pending',
  },
  {
    id: '3',
    file: 'scheduler.ts',
    line: 12,
    type: 'error',
    message: 'Missing error handling for async operations',
    code: 'await processQueue();',
    status: 'accepted',
  },
];

const versionHistory: VersionHistory[] = [
  {
    id: '1',
    version: 'v2.4.1',
    author: 'Maya Chen',
    timestamp: '2 hours ago',
    message: 'feat: add incremental re-indexing',
    changes: 23,
  },
  {
    id: '2',
    version: 'v2.4.0',
    author: 'Dev Patel',
    timestamp: '1 day ago',
    message: 'fix: resolve race condition in CRDT merge',
    changes: 8,
  },
  {
    id: '3',
    version: 'v2.3.9',
    author: 'Sora Kim',
    timestamp: '3 days ago',
    message: 'perf: optimize spatial queries by 40%',
    changes: 15,
  },
  {
    id: '4',
    version: 'v2.3.8',
    author: 'Lina Park',
    timestamp: '5 days ago',
    message: 'chore: upgrade dependencies',
    changes: 42,
  },
];

function CodeSnippet({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border border-white/10 overflow-hidden font-mono text-[11px] my-2 bg-black/40 w-full max-w-full">
      <div className="flex items-center justify-between px-3 py-1.5 bg-white/5 border-b border-white/5 text-[9px] text-muted-foreground select-none">
        <span className="uppercase tracking-wider">{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-foreground transition-colors focus-ring rounded p-1"
          aria-label="Copy code snippet"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3 overflow-x-auto thin-scrollbar text-sky-300 whitespace-pre">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function ChatMessageContent({ text }: { text: string }) {
  const parts = text.split(/```/);
  if (parts.length === 1) {
    return <p className="whitespace-pre-wrap">{text}</p>;
  }

  return (
    <div className="space-y-2">
      {parts.map((part, index) => {
        const isCode = index % 2 === 1;
        if (isCode) {
          // Extract language and code content
          const match = part.match(/^([a-zA-Z0-9+#-]+)?\n([\s\S]*)$/);
          const lang = match ? match[1] || '' : '';
          const code = match ? match[2] : part;
          
          return <CodeSnippet key={index} code={code.trim()} language={lang} />;
        } else {
          return <p key={index} className="whitespace-pre-wrap">{part}</p>;
        }
      })}
    </div>
  );
}

export function AISidebar({
  currentCode,
  language,
  activeTab: controlledActiveTab,
  setActiveTab: controlledSetActiveTab,
  simulatedMessageTrigger
}: {
  currentCode?: string;
  language?: string;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  simulatedMessageTrigger?: number;
}) {
  const [localActiveTab, setLocalActiveTab] = useState('chat');
  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : localActiveTab;
  const setActiveTab = controlledSetActiveTab !== undefined ? controlledSetActiveTab : setLocalActiveTab;

  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: "I see you're working on the collaborative engine. I noticed the `update` handler could benefit from batching. Want me to refactor it?" },
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [context, setContext] = useState<string[]>(['engine/index.ts', 'CRDT', 'batching']);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    if (simulatedMessageTrigger && simulatedMessageTrigger > 0) {
      setActiveTab('chat');
      setMessages((m) => [
        ...m,
        { role: 'user', text: "How can I refactor my collaborative engine updates?", timestamp: 'Just now' }
      ]);
      setThinking(true);
      
      const timer = setTimeout(() => {
        setThinking(false);
        setMessages((m) => [
          ...m,
          {
            role: 'ai',
            text: "Here is an optimized refactor of your collaborative sync loop that batches events:\n\n```typescript\nexport function mergeCollaboratorEdits(ops: Edit[]) {\n  // AI suggestion: microtask queueing prevents visual lag\n  queueMicrotask(() => {\n    applyOps(ops);\n    broadcastState();\n  });\n}\n```\nThis prevents thread blocks when multiple cursors are typing simultaneously.",
            timestamp: 'Just now'
          }
        ]);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [simulatedMessageTrigger]);

  const send = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setMessages((m) => [...m, { role: 'user', text: userMsg, timestamp: 'Just now' }]);
    setInput('');
    setThinking(true);
    setAiError(null);
    
    try {
      const response = await geminiService.chat(userMsg, messages.map(m => ({ role: m.role, content: m.text })));
      if (response.error) {
        setAiError(response.error);
      } else {
        setMessages((m) => [...m, { role: 'ai', text: response.text, timestamp: 'Just now' }]);
      }
    } catch {
      setAiError('Failed to get AI response');
    } finally {
      setThinking(false);
    }
  };

  const handleExplain = async () => {
    if (!currentCode) return;
    setThinking(true);
    setAiError(null);
    setMessages((m) => [...m, { role: 'user', text: 'Explain this code', timestamp: 'Just now' }]);
    
    try {
      const response = await geminiService.explainCode(currentCode, language || 'typescript');
      if (response.error) {
        setAiError(response.error);
      } else {
        setMessages((m) => [...m, { role: 'ai', text: response.text, timestamp: 'Just now' }]);
      }
    } catch {
      setAiError('Failed to explain code');
    } finally {
      setThinking(false);
    }
  };

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setThinking(true);
    setAiError(null);
    setMessages((m) => [...m, { role: 'user', text: `Generate: ${input}`, timestamp: 'Just now' }]);
    
    try {
      const response = await geminiService.generateCode(input, language || 'typescript', currentCode);
      if (response.error) {
        setAiError(response.error);
      } else {
        setMessages((m) => [...m, { role: 'ai', text: response.text, timestamp: 'Just now' }]);
      }
    } catch {
      setAiError('Failed to generate code');
    } finally {
      setThinking(false);
      setInput('');
    }
  };

  const handleReview = async () => {
    if (!currentCode) return;
    setThinking(true);
    setAiError(null);
    setMessages((m) => [...m, { role: 'user', text: 'Review this code', timestamp: 'Just now' }]);
    
    try {
      const response = await geminiService.reviewCode(currentCode, language || 'typescript');
      if (response.error) {
        setAiError(response.error);
      } else {
        setMessages((m) => [...m, { role: 'ai', text: response.text, timestamp: 'Just now' }]);
      }
    } catch {
      setAiError('Failed to review code');
    } finally {
      setThinking(false);
    }
  };

  const handleFix = async () => {
    if (!currentCode) return;
    setThinking(true);
    setAiError(null);
    setMessages((m) => [...m, { role: 'user', text: 'Fix any issues in this code', timestamp: 'Just now' }]);
    
    try {
      const response = await geminiService.fixCode(currentCode, language || 'typescript');
      if (response.error) {
        setAiError(response.error);
      } else {
        setMessages((m) => [...m, { role: 'ai', text: response.text, timestamp: 'Just now' }]);
      }
    } catch {
      setAiError('Failed to fix code');
    } finally {
      setThinking(false);
    }
  };

  const removeContext = (item: string) => {
    setContext((c) => c.filter((x) => x !== item));
  };

  return (
    <div className="flex flex-col h-full bg-background-soft/30">
      {/* Header */}
      <div className="h-11 flex items-center justify-between px-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-medium">AI Assistant</span>
          <Badge variant="secondary" className="text-[9px] h-4 gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Online
          </Badge>
        </div>
        <button className="h-6 w-6 flex items-center justify-center rounded hover:bg-white/5">
          <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="h-9 bg-transparent border-b border-white/5 rounded-none px-3">
          <TabsTrigger value="chat" className="text-xs h-7 data-[state=active]:bg-white/5">
            Chat
          </TabsTrigger>
          <TabsTrigger value="review" className="text-xs h-7 data-[state=active]:bg-white/5">
            Code Review
          </TabsTrigger>
          <TabsTrigger value="history" className="text-xs h-7 data-[state=active]:bg-white/5">
            History
          </TabsTrigger>
        </TabsList>

        {/* Chat Panel */}
        <TabsContent value="chat" className="flex-1 flex flex-col m-0 p-0">
          {/* Context chips */}
          <div className="px-3 py-2 border-b border-white/5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {context.map((chip) => (
              <div
                key={chip}
                className="shrink-0 flex items-center gap-1 text-[10px] glass rounded-full px-2 py-0.5 text-muted-foreground"
              >
                <FileCode2 className="h-2.5 w-2.5" />
                {chip}
                <button
                  onClick={() => removeContext(chip)}
                  className="hover:text-foreground transition-colors"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 thin-scrollbar">
            <div className="p-3 space-y-4">
              {aiError && (
                <div className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg p-3">
                  {aiError}
                </div>
              )}
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease }}
                  className={msg.role === 'user' ? 'flex justify-end' : 'flex gap-2.5'}
                >
                  {msg.role === 'ai' && (
                    <div className="h-6 w-6 shrink-0 rounded-md bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center mt-0.5">
                      <Sparkles className="h-3 w-3 text-white" />
                    </div>
                  )}
                  <div className="flex flex-col gap-1 max-w-[85%]">
                    <div
                      className={`rounded-xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed overflow-x-auto max-w-full ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-glow-sm font-medium'
                          : 'glass-strong text-foreground/90 border border-white/5'
                      }`}
                    >
                      <ChatMessageContent text={msg.text} />
                    </div>
                    {msg.timestamp && (
                      <span className="text-[9px] text-muted-foreground/40 mt-0.5 px-1 self-start">
                        {msg.timestamp}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
              {thinking && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2.5"
                >
                  <div className="h-6 w-6 shrink-0 rounded-md bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center mt-0.5">
                    <Sparkles className="h-3 w-3 text-white animate-pulse" />
                  </div>
                  <div className="glass rounded-xl px-4 py-3 flex-1 max-w-[85%] space-y-2 relative overflow-hidden">
                    <div className="shimmer absolute inset-0 opacity-40" />
                    <div className="h-3 w-1/3 rounded bg-white/10" />
                    <div className="h-3 w-5/6 rounded bg-white/10" />
                    <div className="h-3 w-2/3 rounded bg-white/10" />
                  </div>
                </motion.div>
              )}
            </div>
          </ScrollArea>

          {/* Quick actions */}
          <div className="px-3 py-2 flex items-center gap-1.5 border-t border-white/5">
            <button
              onClick={handleExplain}
              disabled={!currentCode || thinking}
              className="flex items-center gap-1 text-[11px] glass rounded-md px-2 py-1 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors disabled:opacity-50"
            >
              <Code2 className="h-3 w-3" />
              Explain
            </button>
            <button
              onClick={handleGenerate}
              disabled={thinking}
              className="flex items-center gap-1 text-[11px] glass rounded-md px-2 py-1 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors disabled:opacity-50"
            >
              <Sparkles className="h-3 w-3" />
              Generate
            </button>
            <button
              onClick={handleReview}
              disabled={!currentCode || thinking}
              className="flex items-center gap-1 text-[11px] glass rounded-md px-2 py-1 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors disabled:opacity-50"
            >
              <Lightbulb className="h-3 w-3" />
              Review
            </button>
            <button
              onClick={handleFix}
              disabled={!currentCode || thinking}
              className="flex items-center gap-1 text-[11px] glass rounded-md px-2 py-1 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors disabled:opacity-50"
            >
              <Zap className="h-3 w-3" />
              Fix
            </button>
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
                <Button
                  size="sm"
                  className="h-7 px-2.5 text-xs"
                  onClick={send}
                  disabled={!input.trim() && !thinking}
                >
                  {thinking ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Code Review Panel */}
        <TabsContent value="review" className="flex-1 m-0 p-0">
          <ScrollArea className="h-full thin-scrollbar">
            <div className="p-3 space-y-3">
              {codeReviews.map((review) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass rounded-lg p-3 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {review.type === 'error' && (
                        <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                      )}
                      {review.type === 'warning' && (
                        <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
                      )}
                      {review.type === 'suggestion' && (
                        <Lightbulb className="h-4 w-4 text-sky-400 shrink-0" />
                      )}
                      <span className="text-xs font-medium">{review.file}</span>
                      <Badge variant="outline" className="text-[9px] h-4">
                        Ln {review.line}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      {review.status === 'pending' && (
                        <>
                          <button className="h-6 w-6 flex items-center justify-center rounded hover:bg-emerald-500/20 text-emerald-400">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          </button>
                          <button className="h-6 w-6 flex items-center justify-center rounded hover:bg-red-500/20 text-red-400">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                      {review.status === 'accepted' && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{review.message}</p>
                  <div className="bg-background/50 rounded p-2 font-mono text-[11px] text-sky-300">
                    {review.code}
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Version History Panel */}
        <TabsContent value="history" className="flex-1 m-0 p-0">
          <ScrollArea className="h-full thin-scrollbar">
            <div className="p-3 space-y-2">
              {versionHistory.map((version, i) => (
                <motion.div
                  key={version.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group"
                >
                  <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                    <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center">
                      <GitBranch className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{version.version}</span>
                        <Badge variant="secondary" className="text-[9px] h-4">
                          {version.changes} changes
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{version.message}</p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground/60">
                        <span>{version.author}</span>
                        <span>·</span>
                        <span>{version.timestamp}</span>
                      </div>
                    </div>
                    <Clock className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  {i < versionHistory.length - 1 && <Separator className="ml-11" />}
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
