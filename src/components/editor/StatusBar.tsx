import { useState } from 'react';
import {
  Radio,
  GitBranch,
  Check,
  X,
  Wifi,
  Sparkles,
  AlertCircle,
  Keyboard,
  Settings,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface StatusBarProps {
  line?: number;
  column?: number;
  encoding?: string;
  language?: string;
  gitBranch?: string;
  gitStatus?: { added: number; modified: number; deleted: number };
  collaborators?: number;
  onToggleShortcuts?: () => void;
}

export function StatusBar({
  line = 17,
  column = 24,
  encoding = 'UTF-8',
  language = 'TypeScript',
  gitBranch = 'main',
  gitStatus = { added: 0, modified: 2, deleted: 0 },
  collaborators = 4,
  onToggleShortcuts,
}: StatusBarProps) {
  const [isLive, setIsLive] = useState(true);
  const [isConnected, setIsConnected] = useState(true);

  return (
    <div className="h-6 flex items-center gap-0 text-[11px] bg-gradient-to-r from-sky-600 to-indigo-600 text-white px-2">
      {}
      <button
        onClick={() => setIsLive(!isLive)}
        className="flex items-center gap-1 px-2 h-full hover:bg-white/10 transition-colors"
      >
        <Radio className={`h-3 w-3 ${isLive ? 'animate-pulse' : ''}`} />
        {isLive ? 'Live' : 'Paused'}
      </button>

      {}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-1 px-2 h-full hover:bg-white/10 transition-colors">
            <GitBranch className="h-3 w-3" />
            {gitBranch}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem>main</DropdownMenuItem>
          <DropdownMenuItem>develop</DropdownMenuItem>
          <DropdownMenuItem>feat/new-feature</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Git additions/deletions */}
      <button className="hidden sm:flex items-center gap-1 px-2 h-full hover:bg-white/10 transition-colors">
        <Check className="h-3 w-3" />
        {gitStatus.added}
        <X className="h-3 w-3" />
        {gitStatus.deleted}
        {gitStatus.modified > 0 && (
          <Badge variant="secondary" className="ml-1 h-4 px-1 text-[9px] bg-amber-500/20 text-amber-200 border-amber-500/30">
            M{gitStatus.modified}
          </Badge>
        )}
      </button>

      {}
      <button
        onClick={() => setIsConnected(!isConnected)}
        className="flex items-center gap-1 px-2 h-full hover:bg-white/10 transition-colors"
      >
        <Wifi className={`h-3 w-3 ${isConnected ? '' : 'text-red-300'}`} />
        {isConnected ? 'Connected' : 'Offline'}
      </button>

      {/* Collaborator details */}
      {collaborators > 0 && (
        <div className="hidden md:flex items-center gap-1 px-2 h-full">
          <div className="flex -space-x-1">
            {[...Array(Math.min(collaborators, 3))].map((_, i) => (
              <div
                key={i}
                className="h-4 w-4 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-[8px]"
              >
                {String.fromCharCode(65 + i)}
              </div>
            ))}
          </div>
          {collaborators > 3 && (
            <span className="text-[9px] opacity-70">+{collaborators - 3}</span>
          )}
        </div>
      )}

      {/* Diagnostics warnings */}
      {(gitStatus.modified > 0) && (
        <button className="hidden sm:flex items-center gap-1 px-2 h-full hover:bg-white/10 transition-colors text-amber-200">
          <AlertCircle className="h-3 w-3" />
          {gitStatus.modified}
        </button>
      )}

      <div className="ml-auto flex items-center h-full">
        {/* Cursor Position */}
        <button className="flex items-center gap-1 px-2 h-full hover:bg-white/10 transition-colors">
          <span>Ln {line}, Col {column}</span>
        </button>

        {/* Encoding */}
        <button className="hidden md:flex items-center gap-1 px-2 h-full hover:bg-white/10 transition-colors">
          <span>{encoding}</span>
        </button>

        {/* Language */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1 px-2 h-full hover:bg-white/10 transition-colors">
              <span>{language}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>TypeScript</DropdownMenuItem>
            <DropdownMenuItem>JavaScript</DropdownMenuItem>
            <DropdownMenuItem>Python</DropdownMenuItem>
            <DropdownMenuItem>Rust</DropdownMenuItem>
            <DropdownMenuItem>Go</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* AI ready status */}
        <button className="hidden sm:flex items-center gap-1 px-2 h-full hover:bg-white/10 transition-colors">
          <Sparkles className="h-3 w-3" />
          AI ready
        </button>

        {/* Spaces config */}
        <button className="hidden md:flex items-center gap-1 px-2 h-full hover:bg-white/10 transition-colors">
          <span>Spaces: 2</span>
        </button>

        {/* Line feed format */}
        <button className="hidden md:flex items-center gap-1 px-2 h-full hover:bg-white/10 transition-colors">
          <span>LF</span>
        </button>

        {/* Keyboard Shortcuts */}
        {onToggleShortcuts && (
          <button
            onClick={onToggleShortcuts}
            className="hidden sm:flex items-center gap-1 px-2 h-full hover:bg-white/10 transition-colors"
          >
            <Keyboard className="h-3 w-3" />
          </button>
        )}

        {/* Settings */}
        <button className="flex items-center gap-1 px-2 h-full hover:bg-white/10 transition-colors">
          <Settings className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
