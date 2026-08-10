import { useState, useEffect, useRef } from 'react';
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
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

const versionHistory: VersionHistory[] = [];

function CodeSnippet({
  code,
  language,
}: {
  code: string;
  language: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div className="rounded-lg border border-border/40 overflow-hidden font-mono text-[11px] my-2 bg-background-soft w-full max-w-full">
      <div className="flex items-center justify-between px-3 py-1.5 bg-background border-b border-border/40 text-[9px] text-foreground select-none font-semibold">
        <span className="uppercase tracking-wider">
          {language || 'code'}
        </span>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-foreground transition-colors focus-ring rounded p-1"
          aria-label="Copy code snippet"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-green-600" />
              <span className="text-green-600">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      <pre className="p-3 overflow-x-auto thin-scrollbar text-foreground whitespace-pre">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function ChatMessageContent({ text }: { text: string }) {
  const parts = text.split(/```/);

  if (parts.length === 1) {
    return (
      <p className="whitespace-pre-wrap">
        {text}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {parts.map((part, index) => {
        const isCode = index % 2 === 1;

        if (isCode) {
          const match = part.match(
            /^([a-zA-Z0-9+#-]+)?\n([\s\S]*)$/
          );

          const lang = match ? match[1] || '' : '';
          const code = match ? match[2] : part;

          return (
            <CodeSnippet
              key={index}
              code={code.trim()}
              language={lang}
            />
          );
        }

        return (
          <p
            key={index}
            className="whitespace-pre-wrap text-foreground font-medium"
          >
            {part}
          </p>
        );
      })}
    </div>
  );
}

export function AISidebar({
  currentCode,
  language,
  activeTab: controlledActiveTab,
  setActiveTab: controlledSetActiveTab,
  simulatedMessageTrigger,
}: {
  currentCode?: string;
  language?: string;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  simulatedMessageTrigger?: number;
}) {
  const [localActiveTab, setLocalActiveTab] =
    useState('chat');

  const activeTab =
    controlledActiveTab !== undefined
      ? controlledActiveTab
      : localActiveTab;

  const setActiveTab =
    controlledSetActiveTab !== undefined
      ? controlledSetActiveTab
      : setLocalActiveTab;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [context, setContext] = useState<string[]>([]);
  const [aiError, setAiError] = useState<string | null>(null);
  const [codeReviews, setCodeReviews] = useState<CodeReview[]>([]);

  // Chat scroll reference
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Automatically scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    });
  }, [messages, thinking, aiError]);

  useEffect(() => {
    if (
      simulatedMessageTrigger &&
      simulatedMessageTrigger > 0
    ) {
      setActiveTab('chat');

      setMessages((m) => [
        ...m,
        {
          role: 'user',
          text: 'How can I refactor my collaborative engine updates?',
          timestamp: 'Just now',
        },
      ]);

      setThinking(true);

      const timer = setTimeout(() => {
        setThinking(false);

        setMessages((m) => [
          ...m,
          {
            role: 'ai',
            text:
              'Here is an optimized refactor of your collaborative sync loop that batches events:\n\n```typescript\nexport function mergeCollaboratorEdits(ops: Edit[]) {\n  // AI suggestion: microtask queueing prevents visual lag\n  queueMicrotask(() => {\n    applyOps(ops);\n    broadcastState();\n  });\n}\n```\nThis prevents thread blocks when multiple cursors are typing simultaneously.',
            timestamp: 'Just now',
          },
        ]);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [simulatedMessageTrigger]);

  const send = async () => {
    if (!input.trim()) return;

    const userMsg = input;

    setMessages((m) => [
      ...m,
      {
        role: 'user',
        text: userMsg,
        timestamp: 'Just now',
      },
    ]);

    setInput('');
    setThinking(true);
    setAiError(null);

    try {
      const response = await geminiService.chat(
        userMsg,
        messages.map((m) => ({
          role: m.role,
          content: m.text,
        }))
      );

      if (response.error) {
        setAiError(response.error);
      } else {
        setMessages((m) => [
          ...m,
          {
            role: 'ai',
            text: response.text,
            timestamp: 'Just now',
          },
        ]);
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

    setMessages((m) => [
      ...m,
      {
        role: 'user',
        text: 'Explain this code',
        timestamp: 'Just now',
      },
    ]);

    try {
      const response = await geminiService.explainCode(
        currentCode,
        language || 'typescript'
      );

      if (response.error) {
        setAiError(response.error);
      } else {
        setMessages((m) => [
          ...m,
          {
            role: 'ai',
            text: response.text,
            timestamp: 'Just now',
          },
        ]);
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

    setMessages((m) => [
      ...m,
      {
        role: 'user',
        text: `Generate: ${input}`,
        timestamp: 'Just now',
      },
    ]);

    try {
      const response = await geminiService.generateCode(
        input,
        language || 'typescript',
        currentCode
      );

      if (response.error) {
        setAiError(response.error);
      } else {
        setMessages((m) => [
          ...m,
          {
            role: 'ai',
            text: response.text,
            timestamp: 'Just now',
          },
        ]);
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
    setCodeReviews([]);

    try {
      const response = await geminiService.reviewCode(
        currentCode,
        language || 'typescript'
      );

      if (response.error) {
        setAiError(response.error);
      } else {
        const lines = response.text
          .split('\n')
          .filter((line) => line.trim());

        const newReviews: CodeReview[] =
          lines.slice(0, 5).map((line, i) => ({
            id: `review-${Date.now()}-${i}`,
            file: 'current_file',
            line: Math.floor(Math.random() * 100) + 1,
            type: line
              .toLowerCase()
              .includes('error')
              ? 'error'
              : line
                  .toLowerCase()
                  .includes('warning')
                ? 'warning'
                : 'suggestion',
            message: line.substring(0, 100),
            code: currentCode.substring(0, 50),
            status: 'pending',
          }));

        setCodeReviews(newReviews);

        setMessages((m) => [
          ...m,
          {
            role: 'ai',
            text: response.text,
            timestamp: 'Just now',
          },
        ]);
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

    setMessages((m) => [
      ...m,
      {
        role: 'user',
        text: 'Fix any issues in this code',
        timestamp: 'Just now',
      },
    ]);

    try {
      const response = await geminiService.fixCode(
        currentCode,
        language || 'typescript'
      );

      if (response.error) {
        setAiError(response.error);
      } else {
        setMessages((m) => [
          ...m,
          {
            role: 'ai',
            text: response.text,
            timestamp: 'Just now',
          },
        ]);
      }
    } catch {
      setAiError('Failed to fix code');
    } finally {
      setThinking(false);
    }
  };

  const handleRefactor = async () => {
    if (!currentCode) return;

    const instructions = prompt(
      'Refactoring instructions (e.g., "Make it more readable", "Optimize performance"):'
    );

    if (!instructions) return;

    setThinking(true);
    setAiError(null);

    setMessages((m) => [
      ...m,
      {
        role: 'user',
        text: `Refactor: ${instructions}`,
        timestamp: 'Just now',
      },
    ]);

    try {
      const response =
        await geminiService.refactorCode(
          currentCode,
          language || 'typescript',
          instructions
        );

      if (response.error) {
        setAiError(response.error);
      } else {
        setMessages((m) => [
          ...m,
          {
            role: 'ai',
            text: response.text,
            timestamp: 'Just now',
          },
        ]);
      }
    } catch {
      setAiError('Failed to refactor code');
    } finally {
      setThinking(false);
    }
  };

  const removeContext = (item: string) => {
    setContext((c) =>
      c.filter((x) => x !== item)
    );
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-background-soft/60">
      {/* Header */}
      <div className="h-11 shrink-0 flex items-center justify-between px-3 border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>

          <span className="text-sm font-bold text-foreground">
            AI Assistant
          </span>

          <Badge
            variant="secondary"
            className="text-[9px] h-4 gap-1 bg-green-100 text-green-700 border-green-200 font-semibold"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-green-600 animate-pulse" />
            Online
          </Badge>
        </div>

        <button className="h-6 w-6 flex items-center justify-center rounded hover:bg-border/40">
          <MoreHorizontal className="h-3.5 w-3.5 text-foreground/70" />
        </button>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 min-h-0 flex flex-col"
      >
        <TabsList className="h-9 shrink-0 bg-transparent border-b border-border/40 rounded-none px-3">
          <TabsTrigger
            value="chat"
            className="text-xs h-7 data-[state=active]:bg-primary/30 text-foreground font-medium"
          >
            Chat
          </TabsTrigger>

          <TabsTrigger
            value="review"
            className="text-xs h-7 data-[state=active]:bg-primary/30 text-foreground font-medium"
          >
            Code Review
          </TabsTrigger>

          <TabsTrigger
            value="history"
            className="text-xs h-7 data-[state=active]:bg-primary/30 text-foreground font-medium"
          >
            History
          </TabsTrigger>
        </TabsList>

        {/* CHAT */}
        <TabsContent
          value="chat"
          className="flex-1 min-h-0 flex flex-col m-0 p-0"
        >
          {/* Context */}
          <div className="shrink-0 px-3 py-2 border-b border-border/40 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {context.map((chip) => (
              <div
                key={chip}
                className="shrink-0 flex items-center gap-1 text-[10px] bg-card border border-border/40 rounded-full px-2 py-0.5 text-foreground font-medium"
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

          {/* FIXED SCROLLABLE CHAT AREA */}
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden thin-scrollbar">
            <div className="p-3 space-y-4">
              {aiError && (
                <div className="text-xs text-red-600 bg-red-100 border border-red-200 rounded-lg p-3 font-medium">
                  {aiError}
                </div>
              )}

              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    ease,
                  }}
                  className={
                    msg.role === 'user'
                      ? 'flex justify-end'
                      : 'flex gap-2.5'
                  }
                >
                  {msg.role === 'ai' && (
                    <div className="h-6 w-6 shrink-0 rounded-md bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center mt-0.5">
                      <Sparkles className="h-3 w-3 text-white" />
                    </div>
                  )}

                  <div className="flex flex-col gap-1 max-w-[85%] min-w-0">
                    <div
                      className={`rounded-xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed overflow-x-auto max-w-full ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-sm font-semibold'
                          : 'bg-card border border-border/40 text-foreground font-medium'
                      }`}
                    >
                      <ChatMessageContent text={msg.text} />
                    </div>

                    {msg.timestamp && (
                      <span className="text-[9px] text-foreground/50 mt-0.5 px-1 self-start font-medium">
                        {msg.timestamp}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}

              {thinking && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="flex gap-2.5"
                >
                  <div className="h-6 w-6 shrink-0 rounded-md bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center mt-0.5">
                    <Sparkles className="h-3 w-3 text-white animate-pulse" />
                  </div>

                  <div className="bg-card border border-border/40 rounded-xl px-4 py-3 flex-1 max-w-[85%] space-y-2 relative overflow-hidden shadow-sm">
                    <div className="shimmer absolute inset-0 opacity-40" />
                    <div className="h-3 w-1/3 rounded bg-border/40" />
                    <div className="h-3 w-5/6 rounded bg-border/40" />
                    <div className="h-3 w-2/3 rounded bg-border/40" />
                  </div>
                </motion.div>
              )}

              {/* Auto-scroll target */}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="shrink-0 px-3 py-2 flex items-center gap-1.5 border-t border-border/40 overflow-x-auto">
            <button
              onClick={handleExplain}
              disabled={!currentCode || thinking}
              className="shrink-0 flex items-center gap-1 text-[11px] bg-card border border-border/40 rounded-md px-2 py-1 text-foreground hover:bg-primary/20 transition-colors disabled:opacity-50 font-medium"
            >
              <Code2 className="h-3 w-3" />
              Explain
            </button>

            <button
              onClick={handleGenerate}
              disabled={thinking}
              className="shrink-0 flex items-center gap-1 text-[11px] bg-card border border-border/40 rounded-md px-2 py-1 text-foreground hover:bg-primary/20 transition-colors disabled:opacity-50 font-medium"
            >
              <Sparkles className="h-3 w-3" />
              Generate
            </button>

            <button
              onClick={handleReview}
              disabled={!currentCode || thinking}
              className="shrink-0 flex items-center gap-1 text-[11px] bg-card border border-border/40 rounded-md px-2 py-1 text-foreground hover:bg-primary/20 transition-colors disabled:opacity-50 font-medium"
            >
              <Lightbulb className="h-3 w-3" />
              Review
            </button>

            <button
              onClick={handleFix}
              disabled={!currentCode || thinking}
              className="shrink-0 flex items-center gap-1 text-[11px] bg-card border border-border/40 rounded-md px-2 py-1 text-foreground hover:bg-primary/20 transition-colors disabled:opacity-50 font-medium"
            >
              <Zap className="h-3 w-3" />
              Fix
            </button>

            <button
              onClick={handleRefactor}
              disabled={!currentCode || thinking}
              className="shrink-0 flex items-center gap-1 text-[11px] bg-card border border-border/40 rounded-md px-2 py-1 text-foreground hover:bg-primary/20 transition-colors disabled:opacity-50 font-medium"
            >
              <GitBranch className="h-3 w-3" />
              Refactor
            </button>
          </div>

          {/* Input */}
          <div className="shrink-0 p-3 border-t border-border/40">
            <div className="bg-card border border-border/40 rounded-xl p-2 shadow-sm">
              <textarea
                value={input}
                onChange={(e) =>
                  setInput(e.target.value)
                }
                onKeyDown={(e) => {
                  if (
                    e.key === 'Enter' &&
                    !e.shiftKey
                  ) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Ask anything, or describe a change…"
                className="w-full bg-transparent text-sm resize-none outline-none placeholder:text-foreground/40 min-h-[40px] max-h-24 font-medium"
                rows={2}
              />

              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center gap-1">
                  <button className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-border/40">
                    <Paperclip className="h-3.5 w-3.5 text-foreground/70" />
                  </button>

                  <button className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-border/40">
                    <MessageSquare className="h-3.5 w-3.5 text-foreground/70" />
                  </button>
                </div>

                <Button
                  size="sm"
                  className="h-7 px-2.5 text-xs font-semibold"
                  onClick={send}
                  disabled={
                    !input.trim() || thinking
                  }
                >
                  {thinking ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Send className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* CODE REVIEW */}
        <TabsContent
          value="review"
          className="flex-1 min-h-0 m-0 p-0"
        >
          <ScrollArea className="h-full thin-scrollbar">
            <div className="p-3 space-y-3">
              {codeReviews.length === 0 ? (
                <div className="text-center text-xs text-muted-foreground font-mono py-8">
                  No code reviews yet. Click "Review" to analyze your code.
                </div>
              ) : (
                codeReviews.map((review) => (
                  <motion.div
                    key={review.id}
                    initial={{
                      opacity: 0,
                      x: -10,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
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

                        <span className="text-xs font-medium">
                          {review.file}
                        </span>

                        <Badge
                          variant="outline"
                          className="text-[9px] h-4"
                        >
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

                    <p className="text-xs text-muted-foreground">
                      {review.message}
                    </p>

                    <div className="bg-background/50 rounded p-2 font-mono text-[11px] text-sky-300">
                      {review.code}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* HISTORY */}
        <TabsContent
          value="history"
          className="flex-1 min-h-0 m-0 p-0"
        >
          <ScrollArea className="h-full thin-scrollbar">
            <div className="p-3 space-y-2">
              {versionHistory.map((version, i) => (
                <motion.div
                  key={version.id}
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: i * 0.05,
                  }}
                  className="group"
                >
                  <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                    <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center">
                      <GitBranch className="h-4 w-4 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {version.version}
                        </span>

                        <Badge
                          variant="secondary"
                          className="text-[9px] h-4"
                        >
                          {version.changes} changes
                        </Badge>
                      </div>

                      <p className="text-xs text-muted-foreground truncate">
                        {version.message}
                      </p>

                      <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground/60">
                        <span>{version.author}</span>
                        <span>·</span>
                        <span>{version.timestamp}</span>
                      </div>
                    </div>

                    <Clock className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {i < versionHistory.length - 1 && (
                    <Separator className="ml-11" />
                  )}
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}