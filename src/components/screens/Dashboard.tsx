import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  Search,
  Bell,
  Plus,
  GitBranch,
  Users,
  Clock,
  Star,
  Settings,
  LayoutGrid,
  FolderGit2,
  Sparkles,
  TrendingUp,
  Zap,
  ArrowUpRight,
  ChevronRight,
  CheckCircle2,
  Circle,
  FileCode2,
  Activity,
  Globe,
  Moon,
} from 'lucide-react';
import { Logo } from '@/components/shared/Logo';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { projects, notifications, collaborators, type Screen, type ProjectMeta } from '@/lib/data';

const ease = [0.16, 1, 0.3, 1] as const;

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'projects', label: 'Projects', icon: FolderGit2 },
  { id: 'activity', label: 'Activity', icon: Activity },
  { id: 'starred', label: 'Starred', icon: Star },
  { id: 'settings', label: 'Settings', icon: Settings },
];

function Sidebar({ active, setActive }: { active: string; setActive: (s: string) => void }) {
  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-white/5 bg-background-soft/50 backdrop-blur-xl">
      <div className="h-14 flex items-center px-5 border-b border-white/5">
        <Logo size={24} />
      </div>
      <div className="p-3">
        <Button className="w-full justify-start gap-2 h-9 bg-foreground text-background hover:bg-foreground/90">
          <Plus className="h-4 w-4" />
          New project
        </Button>
      </div>
      <ScrollArea className="flex-1 px-2">
        <div className="px-2 py-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">
          Workspace
        </div>
        <nav className="space-y-0.5">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors ${
                active === item.id
                  ? 'bg-white/[0.06] text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.03]'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
              {item.id === 'activity' && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </nav>

        <div className="px-2 py-2 mt-6 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">
          Recent projects
        </div>
        <nav className="space-y-0.5">
          {projects.slice(0, 4).map((p) => (
            <button
              key={p.id}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-white/[0.03] transition-colors"
            >
              <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
              <span className="truncate">{p.name}</span>
            </button>
          ))}
        </nav>
      </ScrollArea>

      <div className="p-3 border-t border-white/5">
        <div className="glass rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium">Pro tip</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Press <kbd className="font-mono text-[10px] px-1 py-0.5 rounded bg-white/10">⌘K</kbd> to summon the command palette from anywhere.
          </p>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Moon className="h-3.5 w-3.5" />
          Dark mode
          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400" />
        </div>
      </div>
    </aside>
  );
}

function TopBar({ onCommand }: { onCommand: () => void }) {
  return (
    <div className="h-14 flex items-center gap-3 px-4 sm:px-6 border-b border-white/5 bg-background/60 backdrop-blur-xl">
      <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <span>Workspace</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium">Overview</span>
      </button>

      <button
        onClick={onCommand}
        className="ml-auto hidden sm:flex items-center gap-2 h-9 px-3 rounded-lg glass text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors w-64"
      >
        <Search className="h-3.5 w-3.5" />
        <span>Search or run a command…</span>
        <kbd className="ml-auto font-mono text-[10px] px-1.5 py-0.5 rounded bg-white/10">⌘K</kbd>
      </button>

      <button
        onClick={onCommand}
        className="sm:hidden ml-auto h-9 w-9 flex items-center justify-center rounded-lg glass"
      >
        <Search className="h-4 w-4" />
      </button>

      <NotificationsButton />
      <ProfileButton />
    </div>
  );
}

function NotificationsButton() {
  const unread = notifications.filter((n) => n.unread).length;
  const iconMap: Record<string, React.ElementType> = {
    mention: Users,
    review: FileCode2,
    deploy: Globe,
    invite: Plus,
  };
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative h-9 w-9 flex items-center justify-center rounded-lg glass hover:bg-white/5 transition-colors">
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 glass-strong border-white/10" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <span className="text-sm font-medium">Notifications</span>
          <Badge variant="secondary" className="text-[10px]">{unread} new</Badge>
        </div>
        <ScrollArea className="max-h-80">
          <div className="p-1">
            {notifications.map((n) => {
              const Icon = iconMap[n.type] || Bell;
              return (
                <div
                  key={n.id}
                  className={`flex gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer ${
                    n.unread ? 'bg-primary/[0.03]' : ''
                  }`}
                >
                  <div className="h-8 w-8 shrink-0 rounded-lg glass flex items-center justify-center">
                    <Icon className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium leading-snug">{n.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 truncate">{n.body}</div>
                    <div className="text-[10px] text-muted-foreground/60 mt-1">{n.time} ago</div>
                  </div>
                  {n.unread && <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />}
                </div>
              );
            })}
          </div>
        </ScrollArea>
        <div className="p-2 border-t border-white/5">
          <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground">
            Mark all as read
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ProfileButton() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 h-9 px-1.5 rounded-lg hover:bg-white/5 transition-colors">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-gradient-to-br from-sky-500 to-indigo-500 text-white text-[11px]">
              AM
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:block text-sm font-medium">Alex</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 glass-strong border-white/10" align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-0.5">
            <span>Alex Morgan</span>
            <span className="text-xs font-normal text-muted-foreground">alex@lumen.dev</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-sm cursor-pointer">
          <Settings className="mr-2 h-3.5 w-3.5" /> Account settings
        </DropdownMenuItem>
        <DropdownMenuItem className="text-sm cursor-pointer">
          <Star className="mr-2 h-3.5 w-3.5" /> Starred projects
        </DropdownMenuItem>
        <DropdownMenuItem className="text-sm cursor-pointer">
          <Globe className="mr-2 h-3.5 w-3.5" /> Preferences
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-sm cursor-pointer text-muted-foreground">
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function WelcomeHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease }}
      className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
    >
      <div>
        <div className="text-xs text-primary uppercase tracking-widest mb-2">Good evening, Alex</div>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Your workspace</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          6 projects · 4 collaborators active · 2 PRs awaiting review
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="glass border-white/10">
          <GitBranch className="mr-1.5 h-3.5 w-3.5" />
          New branch
        </Button>
        <Button size="sm" className="bg-foreground text-background hover:bg-foreground/90">
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          New project
        </Button>
      </div>
    </motion.div>
  );
}

function QuickActions({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const actions = [
    { icon: Sparkles, label: 'Ask AI', desc: 'Refactor with an agent', color: '#38bdf8' },
    { icon: GitBranch, label: 'Open PR', desc: 'Review a pull request', color: '#5eead4' },
    { icon: Users, label: 'Invite team', desc: 'Add a collaborator', color: '#fbbf24' },
    { icon: Zap, label: 'Deploy', desc: 'Ship to edge', color: '#a78bfa' },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {actions.map((a, i) => (
        <motion.button
          key={a.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 + i * 0.06, ease }}
          onClick={() => onNavigate('editor')}
          className="glass rounded-xl p-4 text-left hover:bg-white/[0.05] transition-colors group"
        >
          <div className="h-9 w-9 rounded-lg flex items-center justify-center mb-3" style={{ background: `${a.color}15` }}>
            <a.icon className="h-4 w-4" style={{ color: a.color }} />
          </div>
          <div className="text-sm font-medium">{a.label}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{a.desc}</div>
          <ArrowUpRight className="h-3.5 w-3.5 mt-2 text-muted-foreground/40 group-hover:text-foreground transition-colors" />
        </motion.button>
      ))}
    </div>
  );
}

function ProjectCard({ project, onNavigate, index }: { project: ProjectMeta; onNavigate: (s: Screen) => void; index: number }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.06, ease }}
      onClick={() => onNavigate('editor')}
      className="glass rounded-2xl p-5 text-left hover:bg-white/[0.05] transition-colors group relative overflow-hidden"
    >
      <div
        className="absolute -top-16 -right-16 h-32 w-32 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"
        style={{ background: project.color }}
      />
      <div className="relative">
        <div className="flex items-start justify-between">
          <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: `${project.color}20` }}>
            <FolderGit2 className="h-5 w-5" style={{ color: project.color }} />
          </div>
          <div className="flex -space-x-1.5">
            {Array.from({ length: Math.min(project.collaborators, 3) }).map((_, i) => (
              <Avatar key={i} className="h-6 w-6 border-2 border-background">
                <AvatarFallback className="text-[9px]" style={{ background: `${collaborators[i].color}30` }}>
                  {collaborators[i].initials}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
        </div>
        <h3 className="mt-4 font-medium tracking-tight">{project.name}</h3>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{project.description}</p>
        <div className="mt-4 flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <GitBranch className="h-3 w-3" />
            {project.branch}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {project.updated}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {project.collaborators}
          </span>
        </div>
        <div className="mt-3 h-1 rounded-full bg-white/5 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${project.progress}%` }}
            transition={{ duration: 0.8, delay: 0.2 + index * 0.06, ease }}
            className="h-full rounded-full"
            style={{ background: project.color }}
          />
        </div>
      </div>
    </motion.button>
  );
}

function BentoCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {/* Activity chart */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease }}
        className="glass rounded-2xl p-5 md:col-span-2"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm font-medium">Commit activity</div>
            <div className="text-xs text-muted-foreground">Last 14 days</div>
          </div>
          <Badge variant="secondary" className="text-[10px] gap-1">
            <TrendingUp className="h-3 w-3 text-emerald-400" />
            +24%
          </Badge>
        </div>
        <ActivityChart />
      </motion.div>

      {/* AI usage */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35, ease }}
        className="glass rounded-2xl p-5"
      >
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">AI usage</span>
        </div>
        <div className="text-3xl font-semibold tracking-tight mt-2">1,284</div>
        <div className="text-xs text-muted-foreground">suggestions accepted this week</div>
        <div className="mt-4 space-y-2.5">
          {[
            { label: 'Completions', pct: 62, color: '#38bdf8' },
            { label: 'Refactors', pct: 28, color: '#5eead4' },
            { label: 'Reviews', pct: 10, color: '#fbbf24' },
          ].map((r) => (
            <div key={r.label}>
              <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                <span>{r.label}</span>
                <span>{r.pct}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${r.pct}%` }}
                  transition={{ duration: 0.8, delay: 0.4, ease }}
                  className="h-full rounded-full"
                  style={{ background: r.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function ActivityChart() {
  const bars = [40, 55, 30, 70, 45, 80, 60, 90, 50, 75, 65, 95, 70, 85];
  return (
    <div className="flex items-end gap-1.5 h-32">
      {bars.map((h, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: `${h}%` }}
          transition={{ duration: 0.6, delay: 0.4 + i * 0.03, ease }}
          className="flex-1 rounded-t-sm bg-gradient-to-t from-primary/20 to-primary/60 hover:to-primary transition-colors"
        />
      ))}
    </div>
  );
}

function RecentProjects({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold tracking-tight">Recent projects</h2>
        <button className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
          View all <ChevronRight className="h-3 w-3" />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {projects.map((p, i) => (
          <ProjectCard key={p.id} project={p} onNavigate={onNavigate} index={i} />
        ))}
      </div>
    </div>
  );
}

function TasksWidget() {
  const tasks = [
    { label: 'Review PR #842 — incremental re-indexing', done: false, urgent: true },
    { label: 'Merge feat/anim-system into main', done: false, urgent: false },
    { label: 'Update atlas-engine README', done: true, urgent: false },
    { label: 'Rotate deploy keys for orbit-deploy', done: false, urgent: false },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4, ease }}
      className="glass rounded-2xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-medium">Your tasks</div>
        <Badge variant="secondary" className="text-[10px]">{tasks.filter((t) => !t.done).length} open</Badge>
      </div>
      <div className="space-y-1">
        {tasks.map((t, i) => (
          <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
            {t.done ? (
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
            ) : (
              <Circle className="h-4 w-4 text-muted-foreground/50 shrink-0" />
            )}
            <span className={`text-sm ${t.done ? 'text-muted-foreground line-through' : 'text-foreground/90'}`}>
              {t.label}
            </span>
            {t.urgent && !t.done && (
              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-red-400" />
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function MobileNav() {
  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 glass-strong border-t border-white/10 px-4 py-2 flex items-center justify-around">
      {navItems.map((item) => (
        <button key={item.id} className="flex flex-col items-center gap-0.5 p-2 text-muted-foreground">
          <item.icon className="h-5 w-5" />
          <span className="text-[10px]">{item.label}</span>
        </button>
      ))}
    </div>
  );
}

export function Dashboard({ onNavigate, onCommand }: { onNavigate: (s: Screen) => void; onCommand: () => void }) {
  const [active, setActive] = useState('overview');
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar active={active} setActive={setActive} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar onCommand={onCommand} />
        <ScrollArea className="flex-1 thin-scrollbar">
          <div className="p-6 sm:p-8 max-w-6xl mx-auto pb-24 md:pb-8">
            <WelcomeHeader />
            <div className="mt-8">
              <QuickActions onNavigate={onNavigate} />
            </div>
            <Separator className="my-8 bg-white/5" />
            <RecentProjects onNavigate={onNavigate} />
            <div className="mt-8">
              <BentoCards />
            </div>
            <div className="mt-3">
              <TasksWidget />
            </div>
          </div>
        </ScrollArea>
      </div>
      <MobileNav />
    </div>
  );
}
