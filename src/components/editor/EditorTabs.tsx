import { motion, AnimatePresence } from 'framer-motion';
import {
  FileCode2,
  X,
  Circle,
  PanelLeft,
  PanelRight,
  Plus,
  MoreHorizontal,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const ease = [0.16, 1, 0.3, 1] as const;

interface Tab {
  id: string;
  name: string;
  language?: string;
  modified?: boolean;
  active?: boolean;
}

interface EditorTabsProps {
  tabs: Tab[];
  onTabChange: (id: string) => void;
  onTabClose: (id: string) => void;
  onNewTab?: () => void;
  onToggleLeftPanel?: () => void;
  onToggleRightPanel?: () => void;
}

export function EditorTabs({
  tabs,
  onTabChange,
  onTabClose,
  onNewTab,
  onToggleLeftPanel,
  onToggleRightPanel,
}: EditorTabsProps) {
  return (
    <div className="flex items-center border-b border-white/5 bg-background-soft/30">
      <div className="flex items-center overflow-x-auto no-scrollbar flex-1">
        <AnimatePresence mode="popLayout">
          {tabs.map((tab) => (
            <motion.div
              key={tab.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2, ease }}
              className={`group flex items-center gap-2 px-2 sm:px-3 py-2.5 text-xs border-r border-white/5 cursor-pointer transition-colors relative ${
                tab.active
                  ? 'bg-background text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.03]'
              }`}
              onClick={() => onTabChange(tab.id)}
            >
              <FileCode2 className="h-3.5 w-3.5 text-sky-400 shrink-0" />
              <span className="whitespace-nowrap">{tab.name}</span>
              {tab.modified ? (
                <Circle className="h-2 w-2 fill-current text-primary shrink-0 group-hover:hidden" />
              ) : null}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTabClose(tab.id);
                }}
                className="h-4 w-4 flex items-center justify-center rounded hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              >
                <X className="h-3 w-3" />
              </button>
              {tab.active && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute top-0 left-0 right-0 h-0.5 bg-primary"
                  transition={{ duration: 0.3, ease }}
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <div className="flex items-center pr-1 sm:pr-2 gap-0.5 sm:gap-1 shrink-0">
        {onNewTab && (
          <button
            onClick={onNewTab}
            className="h-7 w-7 flex items-center justify-center rounded hover:bg-white/5"
          >
            <Plus className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        )}
        {onToggleLeftPanel && (
          <button
            onClick={onToggleLeftPanel}
            className="h-7 w-7 flex items-center justify-center rounded hover:bg-white/5"
          >
            <PanelLeft className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        )}
        {onToggleRightPanel && (
          <button
            onClick={onToggleRightPanel}
            className="h-7 w-7 flex items-center justify-center rounded hover:bg-white/5"
          >
            <PanelRight className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="h-7 w-7 flex items-center justify-center rounded hover:bg-white/5">
              <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Split Right</DropdownMenuItem>
            <DropdownMenuItem>Split Down</DropdownMenuItem>
            <DropdownMenuItem>Close All</DropdownMenuItem>
            <DropdownMenuItem>Close Others</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
