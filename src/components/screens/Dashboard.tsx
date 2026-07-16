import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
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
  Zap,
  ArrowUpRight,
  ChevronRight,
  CheckCircle2,
  Circle,
  FileCode2,
  Activity,
  Globe,
  Moon,
  LogOut,
  Trash2,
  Edit2,
  Play,
  Terminal,
  GitFork,
  TrendingUp,
  Loader2,
  ExternalLink,
  Code2,
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
import { CreateProjectModal } from '@/components/shared/CreateProjectModal';
import { notifications, collaborators, type Screen } from '@/lib/data';
import { firestoreService, type Project } from '@/services/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { githubService, type GithubRepo, LANGUAGE_COLORS } from '@/services/github';
import { pistonService, PISTON_LANGUAGE_MAP } from '@/services/piston';
import { geminiService } from '@/services/gemini';


const ease = [0.16, 1, 0.3, 1] as const;

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'projects', label: 'Projects', icon: FolderGit2 },
  { id: 'activity', label: 'Activity', icon: Activity },
  { id: 'starred', label: 'Starred', icon: Star },
  { id: 'settings', label: 'Settings', icon: Settings },
];

function Sidebar({ active, setActive, onCreateProject, onSignOut, projects }: { active: string; setActive: (s: string) => void; onCreateProject: () => void; onSignOut: () => void; projects: Project[] }) {
  return (
    <aside className="hidden lg:flex w-60 shrink-0 flex-col border-r border-white/5 bg-background-soft/50 backdrop-blur-xl">
      <div className="h-14 flex items-center px-5 border-b border-white/5">
        <Logo size={24} />
      </div>
      <div className="p-3">
        <Button
          className="w-full justify-start gap-2 h-9 bg-foreground text-background hover:bg-foreground/90"
          onClick={onCreateProject}
        >
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
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors ${active === item.id
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
          {projects.slice(0, 4).map((p: Project) => (
            <button
              key={p.id}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-white/[0.03] transition-colors"
            >
              <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
              <span className="truncate">{p.name}</span>
            </button>
          ))}
        </nav>

        <div className="px-2 py-2 mt-6 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">
          Account
        </div>
        <nav className="space-y-0.5">
          <button
            onClick={onSignOut}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-white/[0.03] transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
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

function TopBar({ onCommand, onSignOut }: { onCommand: () => void; onSignOut: () => void }) {
  return (
    <div className="h-14 flex items-center gap-3 px-4 sm:px-6 lg:px-8 border-b border-white/5 bg-background/60 backdrop-blur-xl">
      <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <span>Workspace</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium">Overview</span>
      </button>

      <button
        onClick={onCommand}
        className="ml-auto hidden sm:flex items-center gap-2 h-9 px-3 rounded-lg glass text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors w-48 sm:w-64"
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
      <ProfileButton onSignOut={onSignOut} />
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
      <PopoverContent className="w-72 sm:w-80 p-0 glass-strong border-white/10" align="end">
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
                  className={`flex gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer ${n.unread ? 'bg-primary/[0.03]' : ''
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

function ProfileButton({ onSignOut }: { onSignOut: () => void }) {
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
      <DropdownMenuContent className="w-48 sm:w-56 glass-strong border-white/10" align="end">
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
        <DropdownMenuItem className="text-sm cursor-pointer text-muted-foreground" onClick={onSignOut}>
          <LogOut className="mr-2 h-3.5 w-3.5" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function WelcomeHeader({ onCreateProject }: { onCreateProject: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease }}
      className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
    >
      <div>
        <div className="text-xs text-primary uppercase tracking-widest mb-2">Your workspace</div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight">Your workspace</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage your projects and collaborate with your team
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="glass border-white/10">
          <GitBranch className="mr-1.5 h-3.5 w-3.5" />
          New branch
        </Button>
        <Button
          size="sm"
          className="bg-foreground text-background hover:bg-foreground/90"
          onClick={onCreateProject}
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          New project
        </Button>
      </div>
    </motion.div>
  );
}

function QuickActions({ onNavigate }: { onNavigate: (projectId: string) => void }) {
  const actions = [
    { icon: Sparkles, label: 'Ask AI', desc: 'Refactor with an agent', color: '#38bdf8' },
    { icon: GitBranch, label: 'Open PR', desc: 'Review a pull request', color: '#5eead4' },
    { icon: Users, label: 'Invite team', desc: 'Add a collaborator', color: '#fbbf24' },
    { icon: Zap, label: 'Deploy', desc: 'Ship to edge', color: '#a78bfa' },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {actions.map((a, i) => (
        <motion.button
          key={a.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 + i * 0.06, ease }}
          onClick={() => onNavigate('new')}
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

function ProjectCard({ project, onNavigate, onDelete, onRename, index }: { project: Project; onNavigate: (projectId: string) => void; onDelete: (projectId: string, e: React.MouseEvent) => void; onRename: (projectId: string, name: string, e: React.MouseEvent) => void; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05, ease }}
      onClick={() => onNavigate(project.id)}
      className="border border-white/5 bg-[#0d0e12]/60 rounded-2xl p-4 sm:p-5 hover:border-white/15 transition-all group relative cursor-pointer flex flex-col justify-between min-h-[160px]"
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: project.color }} />
          {project.branch}
        </span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => onRename(project.id, project.name, e)}
            className="h-6 w-6 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-foreground transition-all"
            title="Rename"
          >
            <Edit2 className="h-3 w-3" />
          </button>
          <button
            onClick={(e) => onDelete(project.id, e)}
            className="h-6 w-6 rounded bg-white/5 hover:bg-red-500/20 flex items-center justify-center text-zinc-400 hover:text-red-400 transition-all"
            title="Delete"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      <div className="space-y-1 py-3">
        <h3 className="text-sm font-semibold tracking-tight text-zinc-200 group-hover:text-primary transition-colors">
          {project.name}
        </h3>
        <p className="text-[11px] text-zinc-500 line-clamp-1 leading-relaxed">
          {project.description || 'No project description provided.'}
        </p>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <span className="text-[9px] font-mono text-zinc-500 flex items-center gap-1">
          <Clock className="h-2.5 w-2.5" />
          {project.updatedAt?.toDate ? new Date(project.updatedAt.toDate()).toLocaleDateString() : 'Just now'}
        </span>
        <div className="flex -space-x-1.5">
          {Array.from({ length: Math.min(project.collaborators, 3) }).map((_, i) => (
            <Avatar key={i} className="h-5 w-5 border border-[#0d0e12]">
              <AvatarFallback className="text-[8px] font-mono" style={{ background: `${collaborators[i].color}30` }}>
                {collaborators[i].initials}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function AIUsageWidget() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3, ease }}
      className="border border-white/5 bg-[#0d0e12]/60 rounded-2xl p-4 sm:p-5 flex flex-col justify-between min-h-[220px]"
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">// AI Diagnostics</span>
        <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
      </div>
      <div className="py-3">
        <div className="text-3xl font-light tracking-tight text-zinc-200 font-mono">1,284</div>
        <p className="text-[10px] font-mono text-zinc-500 mt-1">successful cycles processed</p>
      </div>
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/5 text-center">
        {[
          { label: 'COMP', val: '62%' },
          { label: 'REFC', val: '28%' },
          { label: 'REVW', val: '10%' },
        ].map((item) => (
          <div key={item.label} className="font-mono space-y-0.5">
            <div className="text-[9px] text-zinc-500">{item.label}</div>
            <div className="text-xs font-semibold text-primary">{item.val}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function RecentProjects({
  projects,
  loading,
  onNavigate,
  onDelete,
  onRename,
}: {
  projects: Project[];
  loading: boolean;
  onNavigate: (projectId: string) => void;
  onDelete: (projectId: string, e: React.MouseEvent) => void;
  onRename: (projectId: string, name: string, e: React.MouseEvent) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold tracking-wider uppercase text-zinc-400 font-mono">// Active Repositories</h2>
        <button className="text-[11px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 font-mono">
          view_all() <ChevronRight className="h-3 w-3" />
        </button>
      </div>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="border border-white/5 bg-[#0d0e12]/60 rounded-2xl p-5 space-y-4 relative overflow-hidden min-h-[160px]">
              <div className="shimmer absolute inset-0" />
              <div className="h-3.5 w-16 bg-white/5 rounded" />
              <div className="space-y-2">
                <div className="h-4 w-2/3 bg-white/5 rounded" />
                <div className="h-3 w-full bg-white/5 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="border border-white/5 bg-[#0d0e12]/60 rounded-2xl p-8 text-center flex flex-col items-center justify-center max-w-md mx-auto my-6 hover:border-white/10 transition-all font-mono">
          <FolderGit2 className="h-6 w-6 text-zinc-500 mb-3" />
          <h3 className="text-xs font-semibold text-zinc-300">No active repositories</h3>
          <p className="text-[10px] text-zinc-500 mt-1 max-w-xs leading-relaxed">
            Create your first workspace using the repository selector options.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {projects.map((p, i) => (
            <ProjectCard key={p.id} project={p} onNavigate={onNavigate} onDelete={onDelete} onRename={onRename} index={i} />
          ))}
        </div>
      )}
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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35, ease }}
      className="border border-white/5 bg-[#0d0e12]/60 rounded-2xl p-4 sm:p-5 flex flex-col justify-between min-h-[220px]"
    >
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">// Task Engine</span>
        <Badge variant="secondary" className="text-[9px] font-mono bg-white/5 border-transparent text-zinc-400">
          {tasks.filter((t) => !t.done).length} open
        </Badge>
      </div>
      <div className="space-y-1.5 py-3">
        {tasks.slice(0, 3).map((t, i) => (
          <div key={i} className="flex items-center gap-2.5 text-[11px] font-mono text-zinc-400">
            {t.done ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
            ) : (
              <Circle className="h-3.5 w-3.5 text-zinc-600 shrink-0" />
            )}
            <span className={`truncate ${t.done ? 'line-through text-zinc-600' : 'text-zinc-300'}`}>{t.label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function MobileNav({ active, setActive }: { active: string; setActive: (s: string) => void }) {
  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-zinc-950/90 backdrop-blur-md border-t border-white/10 px-4 py-2 flex items-center justify-around">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActive(item.id)}
          className={`flex flex-col items-center gap-0.5 p-2 transition-colors ${
            active === item.id ? 'text-primary font-bold' : 'text-muted-foreground'
          }`}
        >
          <item.icon className="h-5 w-5" />
          <span className="text-[9px] font-mono tracking-tight">{item.label}</span>
        </button>
      ))}
    </div>
  );
}

// ─── GitHub Trending Widget ───────────────────────────────────────────────────
function GitHubTrendingWidget() {
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [langFilter, setLangFilter] = useState('');
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  const langs = ['', 'JavaScript', 'TypeScript', 'Python', 'Go', 'Rust'];

  useEffect(() => {
    setLoading(true);
    setRepos([]);
    githubService.getTrendingRepos(langFilter || undefined, period).then((data) => {
      setRepos(data);
      setLoading(false);
    });
  }, [langFilter, period]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2, ease }}
      className="border border-white/5 bg-[#0d0e12]/60 rounded-2xl p-4 sm:p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold tracking-tight">GitHub Trending</span>
          <span className="text-[9px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">LIVE</span>
        </div>
        <div className="flex items-center gap-1.5">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="text-[10px] font-mono bg-white/5 border border-white/10 text-zinc-300 rounded-lg px-2 py-1 outline-none cursor-pointer"
          >
            <option value="daily">Today</option>
            <option value="weekly">This week</option>
            <option value="monthly">This month</option>
          </select>
        </div>
      </div>

      {/* Language filter pills */}
      <div className="flex items-center gap-1.5 mb-4 flex-wrap">
        {langs.map((l) => (
          <button
            key={l}
            onClick={() => setLangFilter(l)}
            className={`text-[10px] font-mono px-2.5 py-1 rounded-full border transition-all ${
              langFilter === l
                ? 'bg-primary/20 border-primary/40 text-primary'
                : 'bg-white/[0.03] border-white/10 text-zinc-500 hover:text-zinc-300 hover:border-white/20'
            }`}
          >
            {l || 'All'}
            {l && (
              <span
                className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: LANGUAGE_COLORS[l] || '#888' }}
              />
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-14 rounded-xl bg-white/[0.03] border border-white/5 animate-pulse" />
          ))}
        </div>
      ) : repos.length === 0 ? (
        <div className="text-center py-8 text-zinc-500 text-xs font-mono">No trending repos found</div>
      ) : (
        <div className="space-y-2">
          {repos.map((repo, i) => (
            <motion.a
              key={repo.id}
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/15 hover:bg-white/[0.04] transition-all group"
            >
              <img
                src={repo.owner.avatar_url}
                alt={repo.owner.login}
                className="h-8 w-8 rounded-lg shrink-0 border border-white/10"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-zinc-200 truncate group-hover:text-primary transition-colors">
                    {repo.owner.login}/{repo.name}
                  </span>
                  <ExternalLink className="h-2.5 w-2.5 text-zinc-600 group-hover:text-primary shrink-0 transition-colors" />
                </div>
                {repo.description && (
                  <p className="text-[10px] text-zinc-500 mt-0.5 line-clamp-1">{repo.description}</p>
                )}
                <div className="flex items-center gap-3 mt-1.5">
                  {repo.language && (
                    <span className="flex items-center gap-1 text-[9px] font-mono text-zinc-500">
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: LANGUAGE_COLORS[repo.language] || '#888' }}
                      />
                      {repo.language}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-[9px] font-mono text-zinc-500">
                    <Star className="h-2.5 w-2.5" />
                    {githubService.formatStars(repo.stargazers_count)}
                  </span>
                  <span className="flex items-center gap-1 text-[9px] font-mono text-zinc-500">
                    <GitFork className="h-2.5 w-2.5" />
                    {githubService.formatStars(repo.forks_count)}
                  </span>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ─── Live Code Runner Widget ──────────────────────────────────────────────────
const DEFAULT_SNIPPETS: Record<string, string> = {
  python: `# Python — try me!\ndef fibonacci(n):\n    a, b = 0, 1\n    for _ in range(n):\n        print(a, end=' ')\n        a, b = b, a + b\n\nfibonacci(10)`,
  javascript: `// JavaScript — try me!\nconst primes = (n) => {\n  const sieve = Array(n + 1).fill(true);\n  sieve[0] = sieve[1] = false;\n  for (let i = 2; i <= Math.sqrt(n); i++)\n    if (sieve[i]) for (let j = i*i; j <= n; j+=i) sieve[j] = false;\n  return sieve.reduce((acc, v, i) => v ? [...acc, i] : acc, []);\n};\nconsole.log(primes(50));`,
  typescript: `// TypeScript — try me!\ntype Shape = { kind: 'circle'; radius: number } | { kind: 'rect'; w: number; h: number };\n\nconst area = (s: Shape): number =>\n  s.kind === 'circle' ? Math.PI * s.radius ** 2 : s.w * s.h;\n\nconsole.log(area({ kind: 'circle', radius: 5 }).toFixed(2));\nconsole.log(area({ kind: 'rect', w: 4, h: 6 }));`,
  go: `// Go — try me!\npackage main\nimport "fmt"\n\nfunc isPrime(n int) bool {\n  if n < 2 { return false }\n  for i := 2; i*i <= n; i++ {\n    if n%i == 0 { return false }\n  }\n  return true\n}\n\nfunc main() {\n  for i := 2; i <= 20; i++ {\n    if isPrime(i) { fmt.Printf("%d ", i) }\n  }\n}`,
};

function LiveCodeRunner() {
  const [lang, setLang] = useState('python');
  const [code, setCode] = useState(DEFAULT_SNIPPETS['python']);
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);
  const [aiExplain, setAiExplain] = useState('');
  const [explaining, setExplaining] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleRun = async () => {
    setRunning(true);
    setOutput('');
    const result = await pistonService.executeCode(lang, code);
    const out = result.stdout || result.stderr || '(no output)';
    setOutput(out);
    setRunning(false);
  };

  const handleExplain = async () => {
    setAiExplain('');
    setExplaining(true);
    await geminiService.streamExplainCode(
      code,
      lang,
      (chunk) => setAiExplain((prev) => prev + chunk),
      () => setExplaining(false),
      (err) => { setAiExplain(`Error: ${err}`); setExplaining(false); }
    );
  };

  const handleLangChange = (newLang: string) => {
    setLang(newLang);
    setCode(DEFAULT_SNIPPETS[newLang] || `// ${newLang} code here`);
    setOutput('');
    setAiExplain('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25, ease }}
      className="border border-white/5 bg-[#0d0e12]/60 rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-black/20">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">Live Code Runner</span>
          <span className="text-[9px] font-mono bg-sky-500/15 text-sky-400 border border-sky-500/20 px-1.5 py-0.5 rounded-full">Piston API</span>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={lang}
            onChange={(e) => handleLangChange(e.target.value)}
            className="text-[10px] font-mono bg-white/5 border border-white/10 text-zinc-300 rounded-lg px-2 py-1 outline-none cursor-pointer"
          >
            {Object.keys(PISTON_LANGUAGE_MAP).map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
          <button
            onClick={handleRun}
            disabled={running}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 rounded-lg text-[11px] font-mono font-bold transition-all disabled:opacity-50"
          >
            {running ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
            {running ? 'Running...' : 'Run ▶'}
          </button>
          <button
            onClick={handleExplain}
            disabled={explaining}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary rounded-lg text-[11px] font-mono font-bold transition-all disabled:opacity-50"
          >
            {explaining ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
            AI Explain
          </button>
        </div>
      </div>

      {/* Code Area */}
      <textarea
        ref={textareaRef}
        value={code}
        onChange={(e) => setCode(e.target.value)}
        spellCheck={false}
        className="w-full bg-[#0a0b0e] text-zinc-200 font-mono text-xs p-4 resize-none outline-none border-b border-white/5 leading-relaxed"
        rows={10}
        style={{ fontFamily: 'JetBrains Mono, Fira Code, monospace' }}
      />

      {/* Output */}
      {(output || running) && (
        <div className="border-t border-white/5">
          <div className="px-4 py-2 bg-black/30 text-[9px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2">
            <Code2 className="h-3 w-3" />
            Output
            {output && <span className="ml-auto text-emerald-400">✓ Done</span>}
          </div>
          <pre className="px-4 py-3 text-xs font-mono text-emerald-300 whitespace-pre-wrap leading-relaxed bg-black/20 max-h-32 overflow-auto">
            {running ? '⏳ Executing...' : output}
          </pre>
        </div>
      )}

      {/* AI Explanation */}
      {(aiExplain || explaining) && (
        <div className="border-t border-white/5">
          <div className="px-4 py-2 bg-primary/5 text-[9px] font-mono text-primary uppercase tracking-widest flex items-center gap-2">
            <Sparkles className="h-3 w-3" />
            AI Explanation
            {explaining && <Loader2 className="h-3 w-3 animate-spin ml-auto" />}
          </div>
          <div className="px-4 py-3 text-xs text-zinc-300 leading-relaxed bg-black/10 max-h-40 overflow-auto whitespace-pre-wrap">
            {aiExplain}
            {explaining && <span className="animate-pulse text-primary">▋</span>}
          </div>
        </div>
      )}
    </motion.div>
  );
}

export function Dashboard({ onNavigate, onCommand }: { onNavigate: (screen: Screen, projectId?: string) => void; onCommand: () => void }) {

  const [active, setActive] = useState('overview');
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, signOut } = useAuth();

  const [editorTheme, setEditorTheme] = useState(() => localStorage.getItem('lumen_editor_theme') || 'Lumen Dark (Default)');
  const [editorFont, setEditorFont] = useState(() => localStorage.getItem('lumen_editor_font') || 'JetBrains Mono');
  const [editorKeybindings, setEditorKeybindings] = useState(() => localStorage.getItem('lumen_editor_keybindings') || 'Standard VS Code');
  const [settingsSaved, setSettingsSaved] = useState(false);

  const handleSaveSettings = () => {
    localStorage.setItem('lumen_editor_theme', editorTheme);
    localStorage.setItem('lumen_editor_font', editorFont);
    localStorage.setItem('lumen_editor_keybindings', editorKeybindings);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2000);
  };

  useEffect(() => {
    const userId = user?.uid || 'guest-user';
    setLoading(true);
    const unsubscribe = firestoreService.subscribeToProjects(userId, (userProjects) => {
      setProjects(userProjects);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const handleProjectCreated = (project: Project) => {
    // Don't manually update state — subscribeToProjects will auto-update the list.
    // Just navigate to the editor with the new project.
    onNavigate('editor', project.id);
  };

  const handleProjectClick = (projectId: string) => {
    onNavigate('editor', projectId);
  };

  const handleDeleteProject = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this project? This will permanently delete the project and all its files.')) {
      try {
        await firestoreService.deleteProject(projectId);
        
        const files = await firestoreService.getProjectFiles(projectId);
        await Promise.all(files.map((file) => firestoreService.deleteFile(file.id)));
      } catch (error) {
        console.error('Failed to delete project:', error);
      }
    }
  };

  const handleRenameProject = async (projectId: string, currentName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newName = prompt('Rename Project:', currentName);
    if (newName && newName.trim() && newName !== currentName) {
      try {
        await firestoreService.updateProject(projectId, { name: newName.trim() });
      } catch (error) {
        console.error('Failed to rename project:', error);
      }
    }
  };

  const handleSignOut = async () => {
    await signOut();
    onNavigate('landing');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Sidebar
        active={active}
        setActive={setActive}
        onCreateProject={() => setCreateProjectOpen(true)}
        onSignOut={handleSignOut}
        projects={projects}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar onCommand={onCommand} onSignOut={handleSignOut} />
        <ScrollArea className="flex-1 thin-scrollbar">
          <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto pb-24 lg:pb-8">
            {active === 'overview' && (
              <>
                <WelcomeHeader onCreateProject={() => setCreateProjectOpen(true)} />
                <div className="mt-8">
                  <QuickActions onNavigate={handleProjectClick} />
                </div>
                <Separator className="my-8 bg-white/5" />
                <RecentProjects projects={projects} loading={loading} onNavigate={handleProjectClick} onDelete={handleDeleteProject} onRename={handleRenameProject} />
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="md:col-span-1">
                    <AIUsageWidget />
                  </div>
                  <div className="md:col-span-2">
                    <TasksWidget />
                  </div>
                </div>
                {/* New: GitHub Trending + Live Code Runner */}
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <GitHubTrendingWidget />
                  <LiveCodeRunner />
                </div>

              </>
            )}

            {active === 'projects' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-serif text-primary">All Repositories</h1>
                    <p className="text-xs text-muted-foreground mt-1 font-mono">Manage all your active project directories</p>
                  </div>
                  <Button
                    size="sm"
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => setCreateProjectOpen(true)}
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" /> New project
                  </Button>
                </div>
                <Separator className="my-8 bg-white/5" />
                <RecentProjects projects={projects} loading={loading} onNavigate={handleProjectClick} onDelete={handleDeleteProject} onRename={handleRenameProject} />
              </div>
            )}

            {active === 'activity' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-serif text-primary">Activity Log</h1>
                  <p className="text-xs text-muted-foreground mt-1 font-mono">Track compiler issues, PR reviews and deploy events</p>
                </div>
                <Separator className="my-8 bg-white/5" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-xs uppercase font-mono tracking-widest text-muted-foreground">// Notifications</h3>
                    <div className="border border-white/5 rounded-xl bg-black/40 p-4 space-y-4">
                      {notifications.map((n) => (
                        <div key={n.id} className="flex gap-4 p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
                          <div className="h-8 w-8 rounded-lg bg-primary/15 flex items-center justify-center text-primary shrink-0">
                            <span className="text-xs">✦</span>
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-zinc-200">{n.title}</div>
                            <div className="text-[11px] text-muted-foreground mt-0.5">{n.body}</div>
                            <div className="text-[9px] text-muted-foreground/60 mt-1 font-mono">{n.time} ago</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xs uppercase font-mono tracking-widest text-muted-foreground">// Tasks queue</h3>
                    <TasksWidget />
                  </div>
                </div>
              </div>
            )}

            {active === 'starred' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-serif text-primary">Starred Projects</h1>
                  <p className="text-xs text-muted-foreground mt-1 font-mono">Quick access to favorited repositories</p>
                </div>
                <Separator className="my-8 bg-white/5" />
                {projects.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground font-mono text-xs">No starred projects yet. Click star on any repository.</div>
                ) : (
                  <RecentProjects projects={projects.slice(0, 2)} loading={loading} onNavigate={handleProjectClick} onDelete={handleDeleteProject} onRename={handleRenameProject} />
                )}
              </div>
            )}

            {active === 'settings' && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-serif text-primary">Workspace Settings</h1>
                  <p className="text-xs text-muted-foreground mt-1 font-mono">Configure theme, font size, and key bindings</p>
                </div>
                <Separator className="my-8 bg-white/5" />
                <div className="border border-white/5 rounded-2xl bg-black/40 p-4 sm:p-6 space-y-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold font-mono text-zinc-300">Editor Theme</label>
                    <select 
                      value={editorTheme} 
                      onChange={(e) => setEditorTheme(e.target.value)} 
                      className="w-full h-10 px-3 rounded-lg bg-zinc-900 border border-white/10 text-sm text-zinc-200 focus:ring-1 focus:ring-primary outline-none"
                    >
                      <option value="Lumen Dark">Lumen Dark (Default)</option>
                      <option value="VS-Dark">VS-Dark</option>
                      <option value="Light Neo-Brutalist">Light Neo-Brutalist</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold font-mono text-zinc-300">Font Family</label>
                    <select 
                      value={editorFont} 
                      onChange={(e) => setEditorFont(e.target.value)} 
                      className="w-full h-10 px-3 rounded-lg bg-zinc-900 border border-white/10 text-sm text-zinc-200 focus:ring-1 focus:ring-primary outline-none"
                    >
                      <option value="JetBrains Mono">JetBrains Mono</option>
                      <option value="Fira Code">Fira Code</option>
                      <option value="Courier New">Courier New</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold font-mono text-zinc-300">Key Bindings</label>
                    <select 
                      value={editorKeybindings} 
                      onChange={(e) => setEditorKeybindings(e.target.value)} 
                      className="w-full h-10 px-3 rounded-lg bg-zinc-900 border border-white/10 text-sm text-zinc-200 focus:ring-1 focus:ring-primary outline-none"
                    >
                      <option value="Standard VS Code">Standard VS Code</option>
                      <option value="Vim Mode">Vim Mode</option>
                      <option value="Emacs Mode">Emacs Mode</option>
                    </select>
                  </div>
                  <div className="pt-2">
                    <Button 
                      onClick={handleSaveSettings}
                      className={`w-full font-mono text-xs uppercase tracking-wider font-bold transition-all duration-300 ${
                        settingsSaved ? 'bg-emerald-500 text-white' : 'bg-primary text-primary-foreground hover:bg-primary/90'
                      }`}
                    >
                      {settingsSaved ? 'Saved Successfully! ✅' : 'Save configurations'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
      <MobileNav active={active} setActive={setActive} />
      <CreateProjectModal
        open={createProjectOpen}
        onOpenChange={setCreateProjectOpen}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
}
