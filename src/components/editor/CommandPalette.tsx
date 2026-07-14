import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
} from '@/components/ui/command';
import {
  ArrowLeft,
  Files,
  Code2,
  Sparkles,
  Lightbulb,
  Zap,
  FileCode2,
} from 'lucide-react';
import type { Screen } from '@/lib/data';

export function CommandPalette({
  open,
  onOpenChange,
  onNavigate,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onNavigate: (s: Screen) => void;
}) {
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search files, run commands, ask AI…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          <CommandItem
            onSelect={() => {
              onNavigate('landing');
              onOpenChange(false);
            }}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go to Landing Page
            <CommandShortcut>⌘1</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              onNavigate('dashboard');
              onOpenChange(false);
            }}
          >
            <Files className="mr-2 h-4 w-4" />
            Go to Dashboard
            <CommandShortcut>⌘2</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              onNavigate('editor');
              onOpenChange(false);
            }}
          >
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
