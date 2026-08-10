import { motion, AnimatePresence } from 'framer-motion';
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
  LogOut,
  Trash2,
  Edit2,
  Play,
  Terminal,
  Loader2,
  Code2,
  X,
  Menu,
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
import { type Screen } from '@/lib/data';
import { firestoreService, type Project, type Task, type StarredProject, type Activity as ActivityType } from '@/services/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { pistonService, PISTON_LANGUAGE_MAP } from '@/services/piston';
import { geminiService } from '@/services/gemini';
import { demoStorage } from '@/services/demoStorage';


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
    <aside className="hidden lg:flex w-60 shrink-0 flex-col border-r border-border/40 bg-background-soft/80 backdrop-blur-xl">
      <div className="h-14 flex items-center px-5 border-b border-border/40">
        <Logo size={24} />
      </div>
      <div className="p-3">
        <Button
          className="w-full justify-start gap-2 h-9 bg-primary text-foreground hover:bg-primary/90 shadow-sm"
          onClick={onCreateProject}
        >
          <Plus className="h-4 w-4" />
          New project
        </Button>
      </div>
      <ScrollArea className="flex-1 px-2">
        <div className="px-2 py-2 text-[10px] font-semibold uppercase tracking-wider text-foreground">
          Workspace
        </div>
        <nav className="space-y-0.5">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors ${active === item.id
                  ? 'bg-primary/40 text-foreground font-semibold'
                  : 'text-foreground hover:text-foreground hover:bg-primary/20 font-medium'
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

        <div className="px-2 py-2 mt-6 text-[10px] font-semibold uppercase tracking-wider text-foreground">
          Recent projects
        </div>
        <nav className="space-y-0.5">
          {projects.slice(0, 4).map((p: Project) => (
            <button
              key={p.id}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-foreground hover:text-foreground hover:bg-primary/20 transition-colors group/item font-medium"
            >
              <span
                className="h-2 w-2 rounded-full shrink-0 transition-all duration-200 group-hover/item:shadow-[0_0_6px_currentColor]"
                style={{ backgroundColor: p.color }}
              />
              <span className="truncate">{p.name}</span>
            </button>
          ))}
        </nav>

        <div className="px-2 py-2 mt-6 text-[10px] font-semibold uppercase tracking-wider text-foreground">
          Account
        </div>
        <nav className="space-y-0.5">
          <button
            onClick={onSignOut}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-foreground hover:text-foreground hover:bg-primary/20 transition-colors font-medium"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </nav>
      </ScrollArea>

      <div className="p-3 border-t border-border/40">
        <div className="bg-card rounded-xl p-3 border border-border/40 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold text-foreground">Pro tip</span>
          </div>
          <p className="text-[11px] text-foreground leading-relaxed">
            Press <kbd className="font-mono text-[10px] px-1 py-0.5 rounded bg-border/40 font-semibold">⌘K</kbd> to summon the command palette from anywhere.
          </p>
        </div>
      </div>
    </aside>
  );
}

function MobileSidebar({ active, setActive, onCreateProject, onSignOut, projects, isOpen, onClose }: { 
  active: string; 
  setActive: (s: string) => void; 
  onCreateProject: () => void; 
  onSignOut: () => void; 
  projects: Project[];
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          />
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-background-soft/95 backdrop-blur-xl border-r border-border/40 z-50 lg:hidden flex flex-col"
          >
            <div className="h-14 flex items-center justify-between px-4 border-b border-border/40">
              <Logo size={24} />
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-primary/20">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-3">
              <Button
                className="w-full justify-start gap-2 h-9 bg-primary text-foreground hover:bg-primary/90 shadow-sm"
                onClick={() => { onCreateProject(); onClose(); }}
              >
                <Plus className="h-4 w-4" />
                New project
              </Button>
            </div>
            <ScrollArea className="flex-1 px-2">
              <div className="px-2 py-2 text-[10px] font-semibold uppercase tracking-wider text-foreground">
                Workspace
              </div>
              <nav className="space-y-0.5">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setActive(item.id); onClose(); }}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors ${active === item.id
                        ? 'bg-primary/40 text-foreground font-semibold'
                        : 'text-foreground hover:text-foreground hover:bg-primary/20 font-medium'
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

              <div className="px-2 py-2 mt-6 text-[10px] font-semibold uppercase tracking-wider text-foreground">
                Recent projects
              </div>
              <nav className="space-y-0.5">
                {projects.slice(0, 4).map((p: Project) => (
                  <button
                    key={p.id}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-foreground hover:text-foreground hover:bg-primary/20 transition-colors group/item font-medium"
                  >
                    <span
                      className="h-2 w-2 rounded-full shrink-0 transition-all duration-200 group-hover/item:shadow-[0_0_6px_currentColor]"
                      style={{ backgroundColor: p.color }}
                    />
                    <span className="truncate">{p.name}</span>
                  </button>
                ))}
              </nav>

              <div className="px-2 py-2 mt-6 text-[10px] font-semibold uppercase tracking-wider text-foreground">
                Account
              </div>
              <nav className="space-y-0.5">
                <button
                  onClick={() => { onSignOut(); onClose(); }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-foreground hover:text-foreground hover:bg-primary/20 transition-colors font-medium"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </nav>
            </ScrollArea>

            <div className="p-3 border-t border-border/40">
              <div className="bg-card rounded-xl p-3 border border-border/40 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-semibold text-foreground">Pro tip</span>
                </div>
                <p className="text-[11px] text-foreground leading-relaxed">
                  Press <kbd className="font-mono text-[10px] px-1 py-0.5 rounded bg-border/40 font-semibold">⌘K</kbd> to summon the command palette from anywhere.
                </p>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function TopBar({ onCommand, onSignOut, activities, user, onMenuToggle }: { onCommand: () => void; onSignOut: () => void; activities: ActivityType[]; user: any; onMenuToggle: () => void }) {
  return (
    <div className="h-14 flex items-center gap-3 px-3 sm:px-4 md:px-6 lg:px-8 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <button 
        onClick={onMenuToggle}
        className="lg:hidden p-2 rounded-lg hover:bg-primary/20 mr-1"
        aria-label="Toggle menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      
      <button className="flex items-center gap-2 text-sm text-foreground hover:text-foreground transition-colors font-medium">
        <span className="hidden sm:inline">Workspace</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-semibold">Overview</span>
      </button>

      <button
        onClick={onCommand}
        className="ml-auto hidden sm:flex items-center gap-2 h-9 px-3 rounded-lg bg-card border border-border/40 text-sm text-muted-foreground hover:text-foreground hover:bg-primary/20 transition-colors w-40 sm:w-48 md:w-64 shadow-sm"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="hidden xs:inline">Search or run a command…</span>
        <span className="xs:hidden">Search…</span>
        <kbd className="ml-auto font-mono text-[10px] px-1.5 py-0.5 rounded bg-border/30 hidden sm:inline-block">⌘K</kbd>
      </button>

      <button
        onClick={onCommand}
        className="sm:hidden ml-auto h-9 w-9 flex items-center justify-center rounded-lg bg-card border border-border/40 shadow-sm"
      >
        <Search className="h-4 w-4" />
      </button>

      <NotificationsButton activities={activities} />
      <ProfileButton user={user} onSignOut={onSignOut} />
    </div>
  );
}

function NotificationsButton({ activities }: { activities: ActivityType[] }) {
  const iconMap: Record<string, React.ElementType> = {
    project_created: Plus,
    project_deleted: Trash2,
    file_created: FileCode2,
    file_updated: FileCode2,
    file_deleted: Trash2,
    ai_review_completed: Sparkles,
    ai_fix_applied: Zap,
    ai_refactor_applied: Sparkles,
    code_executed: Play,
    github_repo_connected: GitBranch,
    collaborator_joined: Users,
    collaborator_left: Users,
    task_created: CheckCircle2,
    task_completed: CheckCircle2,
    project_starred: Star,
    project_unstarred: Star,
  };

  const formatRelativeTime = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    const now = new Date();
    const time = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative h-9 w-9 flex items-center justify-center rounded-lg bg-card border border-border/40 hover:bg-primary/20 transition-colors shadow-sm">
          <Bell className="h-4 w-4" />
          {activities.length > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 sm:w-80 p-0 bg-card border border-border/40 shadow-lg" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
          <span className="text-sm font-medium">Activity</span>
          <Badge variant="secondary" className="text-[10px]">{activities.length} recent</Badge>
        </div>
        <ScrollArea className="max-h-80">
          <div className="p-1">
            {activities.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-foreground font-mono">
                No recent activity
              </div>
            ) : (
              activities.slice(0, 10).map((activity) => {
                const Icon = iconMap[activity.action] || Bell;
                return (
                  <div
                    key={activity.id}
                    className="flex gap-3 p-3 rounded-lg hover:bg-primary/10 transition-colors cursor-pointer"
                  >
                    <div className="h-8 w-8 shrink-0 rounded-lg bg-card border border-border/30 flex items-center justify-center">
                      <Icon className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium leading-snug">{activity.message}</div>
                      {activity.projectName && (
                        <div className="text-[10px] text-muted-foreground mt-0.5">{activity.projectName}</div>
                      )}
                      <div className="text-[10px] text-muted-foreground/60 mt-1">{formatRelativeTime(activity.timestamp)}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

function ProfileButton({ user, onSignOut }: { user: any; onSignOut: () => void }) {
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';
  const initials = displayName.slice(0, 2).toUpperCase();
  const email = user?.email || '';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 h-9 px-1.5 rounded-lg hover:bg-primary/10 transition-colors">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-gradient-to-br from-purple-400 to-indigo-400 text-white text-[11px]">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:block text-sm font-medium">{displayName}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48 sm:w-56 bg-card border border-border/40 shadow-lg" align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-0.5">
            <span>{displayName}</span>
            <span className="text-xs font-normal text-muted-foreground">{email}</span>
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
        <div className="text-[10px] xs:text-xs text-primary uppercase tracking-widest mb-1.5 sm:mb-2 font-semibold">Your workspace</div>
        <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground">Your workspace</h1>
        <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-foreground/80 font-medium">
          Manage your projects and collaborate with your team
        </p>
      </div>
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Button variant="outline" size="sm" className="bg-card border-border/40 text-foreground hover:bg-primary/20 flex-1 sm:flex-none">
          <GitBranch className="mr-1.5 h-3.5 w-3.5" />
          <span className="hidden xs:inline">New branch</span>
          <span className="xs:hidden">Branch</span>
        </Button>
        <Button
          size="sm"
          className="bg-foreground text-background hover:bg-foreground/90 font-semibold flex-1 sm:flex-none"
          onClick={onCreateProject}
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          <span className="hidden xs:inline">New project</span>
          <span className="xs:hidden">Project</span>
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
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
      {actions.map((a, i) => (
        <motion.button
          key={a.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 + i * 0.06, ease }}
          onClick={() => onNavigate('new')}
          className="bg-card border border-border/40 rounded-xl p-3 sm:p-4 text-left hover:bg-primary/10 transition-colors group shadow-sm"
        >
          <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg flex items-center justify-center mb-2 sm:mb-3" style={{ background: `${a.color}30` }}>
            <a.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: a.color }} />
          </div>
          <div className="text-xs sm:text-sm font-semibold text-foreground">{a.label}</div>
          <div className="text-[10px] sm:text-xs text-foreground/70 mt-0.5 font-medium">{a.desc}</div>
          <ArrowUpRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 mt-1.5 sm:mt-2 text-foreground/50 group-hover:text-foreground transition-colors" />
        </motion.button>
      ))}
    </div>
  );
}

function ProjectCard({ project, onNavigate, onDelete, onRename, index }: { project: Project; onNavigate: (projectId: string) => void; onDelete: (projectId: string, e: React.MouseEvent) => void; onRename: (projectId: string, name: string, e: React.MouseEvent) => void; index: number }) {
  const collaboratorColors = ['#38bdf8', '#5eead4', '#fbbf24'];
  const collaboratorInitials = ['AB', 'CD', 'EF'];
  const c = project.color || '#38bdf8';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05, ease }}
      onClick={() => onNavigate(project.id)}
      className="relative border border-border/40 bg-card rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 hover:border-border/60 transition-all duration-200 group cursor-pointer flex flex-col justify-between min-h-[140px] sm:min-h-[160px] overflow-hidden shadow-sm"
      style={{
        boxShadow: `inset 3px 0 0 0 ${c}40`,
      }}
    >
      {/* Subtle color wash on hover — purely decorative */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl sm:rounded-2xl"
        style={{ background: `radial-gradient(ellipse at 0% 50%, ${c}15 0%, transparent 65%)` }}
      />

      <div className="flex items-center justify-between relative">
        <span className="text-[9px] sm:text-[10px] font-mono text-foreground/70 uppercase tracking-wider flex items-center gap-1.5 font-semibold">
          <span
            className="h-1.5 w-1.5 rounded-full transition-all duration-300 group-hover:shadow-[0_0_6px_currentColor]"
            style={{ backgroundColor: c }}
          />
          {project.branch}
        </span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => onRename(project.id, project.name, e)}
            className="h-5 w-5 sm:h-6 sm:w-6 rounded bg-border/40 hover:bg-border/60 flex items-center justify-center text-foreground hover:text-foreground transition-all"
            title="Rename"
          >
            <Edit2 className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
          </button>
          <button
            onClick={(e) => onDelete(project.id, e)}
            className="h-5 w-5 sm:h-6 sm:w-6 rounded bg-border/40 hover:bg-red-100 flex items-center justify-center text-foreground hover:text-red-600 transition-all"
            title="Delete"
          >
            <Trash2 className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
          </button>
        </div>
      </div>

      <div className="space-y-1 py-2 sm:py-3 relative">
        <h3
          className="text-sm sm:text-base tracking-tight text-foreground transition-colors duration-200 font-semibold"
          style={{ color: undefined }}
        >
          <span className="group-hover:text-foreground transition-colors duration-200">{project.name}</span>
        </h3>
        <p className="text-[11px] sm:text-[12px] text-foreground/70 line-clamp-1 leading-relaxed font-medium">
          {project.description || 'No project description provided.'}
        </p>
      </div>

      <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-border/40 relative">
        <span className="text-[8px] sm:text-[9px] font-mono text-foreground/60 flex items-center gap-1 font-semibold">
          <Clock className="h-2 w-2 sm:h-2.5 sm:w-2.5" />
          {project.updatedAt?.toDate ? new Date(project.updatedAt.toDate()).toLocaleDateString() : 'Just now'}
        </span>
        <div className="flex -space-x-1.5">
          {project.collaborators > 0 ? Array.from({ length: Math.min(project.collaborators, 3) }).map((_, i) => (
            <Avatar key={i} className="h-4 w-4 sm:h-5 sm:w-5 border border-background">
              <AvatarFallback className="text-[7px] sm:text-[8px] font-mono" style={{ background: `${collaboratorColors[i]}40` }}>
                {collaboratorInitials[i]}
              </AvatarFallback>
            </Avatar>
          )) : null}
        </div>
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
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h2 className="text-xs sm:text-sm font-bold tracking-wider uppercase text-foreground font-mono">// Active Repositories</h2>
        <button className="text-[11px] text-foreground hover:text-foreground transition-colors flex items-center gap-1 font-mono font-semibold">
          view_all() <ChevronRight className="h-3 w-3" />
        </button>
      </div>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="border border-border/40 bg-card rounded-xl sm:rounded-2xl p-3 sm:p-5 space-y-3 sm:space-y-4 relative overflow-hidden min-h-[140px] sm:min-h-[160px] shadow-sm">
              <div className="shimmer absolute inset-0" />
              <div className="h-3 sm:h-3.5 w-12 sm:w-16 bg-border/40 rounded" />
              <div className="space-y-1.5 sm:space-y-2">
                <div className="h-3.5 sm:h-4 w-2/3 bg-border/40 rounded" />
                <div className="h-2.5 sm:h-3 w-full bg-border/40 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="border border-border/40 bg-card rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center flex flex-col items-center justify-center max-w-md mx-auto my-4 sm:my-6 hover:border-border/60 transition-all font-mono shadow-sm">
          <FolderGit2 className="h-5 w-5 sm:h-6 sm:w-6 text-foreground/60 mb-2 sm:mb-3" />
          <h3 className="text-[11px] sm:text-xs font-bold text-foreground">No active repositories</h3>
          <p className="text-[9px] sm:text-[10px] text-foreground/70 mt-1 max-w-xs leading-relaxed font-medium">
            Create your first workspace using the repository selector options.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
          {projects.map((p, i) => (
            <ProjectCard key={p.id} project={p} onNavigate={onNavigate} onDelete={onDelete} onRename={onRename} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

function TasksWidget({ tasks, onToggleTask, onDeleteTask, onCreateTask }: { tasks: Task[]; onToggleTask: (id: string) => void; onDeleteTask: (id: string) => void; onCreateTask: (title: string) => void }) {
  const [newTask, setNewTask] = useState('');
  const [showInput, setShowInput] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.trim()) {
      onCreateTask(newTask.trim());
      setNewTask('');
      setShowInput(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35, ease }}
      className="border border-border/40 bg-card rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 flex flex-col justify-between min-h-[180px] sm:min-h-[220px] shadow-sm"
    >
      <div className="flex items-center justify-between pb-2 sm:pb-3 border-b border-border/40">
        <span className="text-[9px] sm:text-[10px] font-mono text-foreground uppercase tracking-widest font-bold">// Task Engine</span>
        <Badge variant="secondary" className="text-[8px] sm:text-[9px] font-mono bg-primary/30 border-primary/50 text-foreground font-semibold">
          {tasks.filter((t) => !t.completed).length} open
        </Badge>
      </div>
      <div className="space-y-1 sm:space-y-1.5 py-2 sm:py-3 flex-1">
        {showInput && (
          <form onSubmit={handleSubmit} className="flex gap-2 mb-2">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="New task..."
              className="flex-1 bg-background-soft border border-border/40 rounded px-2 py-1 text-[10px] sm:text-[11px] font-mono text-foreground outline-none focus:border-primary/50 font-medium"
              autoFocus
            />
            <button
              type="submit"
              className="px-2 py-1 bg-primary hover:bg-primary/90 text-foreground rounded text-[9px] sm:text-[10px] font-mono font-semibold"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setShowInput(false)}
              className="px-2 py-1 hover:bg-border/40 text-foreground rounded text-[9px] sm:text-[10px] font-mono font-medium"
            >
              Cancel
            </button>
          </form>
        )}
        {tasks.length === 0 ? (
          <div className="text-[10px] sm:text-[11px] text-foreground/70 font-mono text-center py-3 sm:py-4 font-medium">No tasks yet</div>
        ) : (
          tasks.slice(0, 4).map((t) => (
            <div key={t.id} className="flex items-center gap-2 sm:gap-2.5 text-[10px] sm:text-[11px] font-mono text-foreground group">
              <button
                onClick={() => onToggleTask(t.id)}
                className="shrink-0 hover:text-foreground transition-colors"
              >
                {t.completed ? (
                  <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-green-600" />
                ) : (
                  <Circle className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-foreground/40" />
                )}
              </button>
              <span className={`truncate flex-1 font-medium ${t.completed ? 'line-through text-foreground/50' : 'text-foreground'}`}>{t.title}</span>
              <button
                onClick={() => onDeleteTask(t.id)}
                className="opacity-0 group-hover:opacity-100 shrink-0 hover:text-red-600 transition-all"
              >
                <X className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              </button>
            </div>
          ))
        )}
      </div>
      {!showInput && (
        <button
          onClick={() => setShowInput(true)}
          className="mt-1.5 sm:mt-2 text-[9px] sm:text-[10px] font-mono text-foreground hover:text-foreground transition-colors flex items-center gap-1 font-semibold"
        >
          <Plus className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> Add task
        </button>
      )}
    </motion.div>
  );
}

function MobileNav({ active, setActive }: { active: string; setActive: (s: string) => void }) {
  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur-md border-t border-border/40 px-2 sm:px-4 py-2 flex items-center justify-around shadow-lg">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActive(item.id)}
          className={`flex flex-col items-center gap-0.5 p-1.5 sm:p-2 transition-colors ${
            active === item.id ? 'text-primary font-bold' : 'text-muted-foreground'
          }`}
        >
          <item.icon className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="text-[8px] sm:text-[9px] font-mono tracking-tight">{item.label}</span>
        </button>
      ))}
    </div>
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
      className="border border-border/40 bg-card rounded-xl sm:rounded-2xl overflow-hidden shadow-sm"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 px-3 sm:px-4 py-2 sm:py-3 border-b border-border/40 bg-background-soft/60">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Terminal className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
          <span className="text-xs sm:text-sm font-semibold">Live Code Runner</span>
          <span className="text-[8px] sm:text-[9px] font-mono bg-sky-100 text-sky-700 border border-sky-200 px-1 sm:px-1.5 py-0.5 rounded-full hidden xs:inline-block">Piston API</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
          <select
            value={lang}
            onChange={(e) => handleLangChange(e.target.value)}
            className="text-[9px] sm:text-[10px] font-mono bg-border/20 border border-border/40 text-foreground rounded-lg px-2 py-1 outline-none cursor-pointer flex-1 sm:flex-none"
          >
            {Object.keys(PISTON_LANGUAGE_MAP).map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
          <button
            onClick={handleRun}
            disabled={running}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 bg-green-100 hover:bg-green-200 border border-green-300 text-green-700 rounded-lg text-[10px] sm:text-[11px] font-mono font-bold transition-all disabled:opacity-50 flex-1 sm:flex-none justify-center"
          >
            {running ? <Loader2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 animate-spin" /> : <Play className="h-2.5 w-2.5 sm:h-3 sm:w-3" />}
            <span className="hidden xs:inline">{running ? 'Running...' : 'Run ▶'}</span>
            <span className="xs:inline">{running ? '...' : '▶'}</span>
          </button>
          <button
            onClick={handleExplain}
            disabled={explaining}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 bg-primary hover:bg-primary/90 border border-primary/50 text-foreground rounded-lg text-[10px] sm:text-[11px] font-mono font-bold transition-all disabled:opacity-50 flex-1 sm:flex-none justify-center"
          >
            {explaining ? <Loader2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 animate-spin" /> : <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3" />}
            <span className="hidden xs:inline">AI Explain</span>
            <span className="xs:inline">AI</span>
          </button>
        </div>
      </div>

      {/* Code Area */}
      <textarea
        ref={textareaRef}
        value={code}
        onChange={(e) => setCode(e.target.value)}
        spellCheck={false}
        className="w-full bg-background-soft text-foreground font-mono text-[10px] sm:text-xs p-3 sm:p-4 resize-none outline-none border-b border-border/40 leading-relaxed"
        rows={8}
        style={{ fontFamily: 'JetBrains Mono, Fira Code, monospace' }}
      />

      {/* Output */}
      {(output || running) && (
        <div className="border-t border-border/40">
          <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-background-soft/80 text-[8px] sm:text-[9px] font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <Code2 className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            Output
            {output && <span className="ml-auto text-green-600">✓ Done</span>}
          </div>
          <pre className="px-3 sm:px-4 py-2 sm:py-3 text-[10px] sm:text-xs font-mono text-green-700 whitespace-pre-wrap leading-relaxed bg-background-soft/60 max-h-24 sm:max-h-32 overflow-auto">
            {running ? '⏳ Executing...' : output}
          </pre>
        </div>
      )}

      {/* AI Explanation */}
      {(aiExplain || explaining) && (
        <div className="border-t border-border/40">
          <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/20 text-[8px] sm:text-[9px] font-mono text-primary uppercase tracking-widest flex items-center gap-2">
            <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            AI Explanation
            {explaining && <Loader2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 animate-spin ml-auto" />}
          </div>
          <div className="px-3 sm:px-4 py-2 sm:py-3 text-[10px] sm:text-xs text-foreground leading-relaxed bg-background-soft/40 max-h-32 sm:max-h-40 overflow-auto whitespace-pre-wrap">
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
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [starredProjects, setStarredProjects] = useState<StarredProject[]>([]);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
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

  // Demo mode uses localStorage; authenticated mode uses Firestore.
  useEffect(() => {
    setLoading(true);

    if (user?.uid) {
      const unsubscribe = firestoreService.subscribeToProjects(user.uid, (userProjects) => {
        setProjects(userProjects);
        setLoading(false);
      });
      return () => unsubscribe();
    }

    const unsubscribe = demoStorage.subscribeToProjects((demoProjects) => {
      setProjects(demoProjects);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const userId = user?.uid || 'demo-user';

    if (user?.uid) {
      const unsubscribe = firestoreService.subscribeToUserActivities(user.uid, (userActivities) => {
        setActivities(userActivities);
      });
      return () => unsubscribe();
    }

    const unsubscribe = demoStorage.subscribeToUserActivities(userId, (demoActivities) => {
      setActivities(demoActivities);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const userId = user?.uid || 'demo-user';

    if (user?.uid) {
      const unsubscribe = firestoreService.subscribeToUserTasks(user.uid, (userTasks) => {
        setTasks(userTasks);
      });
      return () => unsubscribe();
    }

    const unsubscribe = demoStorage.subscribeToUserTasks(userId, (demoTasks) => {
      setTasks(demoTasks);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const userId = user?.uid || 'demo-user';

    if (user?.uid) {
      const unsubscribe = firestoreService.subscribeToStarredProjects(user.uid, (starred) => {
        setStarredProjects(starred);
      });
      return () => unsubscribe();
    }

    const unsubscribe = demoStorage.subscribeToStarredProjects(userId, (demoStarred) => {
      setStarredProjects(demoStarred);
    });
    return () => unsubscribe();
  }, [user]);

  const handleProjectCreated = (project: Project) => {
    onNavigate('editor', project.id);
  };

  const handleProjectClick = (projectId: string) => {
    onNavigate('editor', projectId);
  };

  const handleDeleteProject = async (projectId: string, e: React.MouseEvent) => {
  e.stopPropagation();

  const project = projects.find(p => p.id === projectId);

  if (!confirm('Delete this project and all its files?')) return;

  try {
    if (user?.uid) {
      // Authenticated mode
      await firestoreService.deleteProject(projectId);

      const files = await firestoreService.getProjectFiles(projectId);
      await Promise.all(files.map(file => firestoreService.deleteFile(file.id)));

      await firestoreService.logActivity({
        userId: user.uid,
        userName: user.displayName || user.email || 'User',
        action: 'project_deleted',
        message: `Deleted project: ${project?.name || 'Unknown'}`,
        projectName: project?.name,
      });
    } else {
      // Demo mode
      demoStorage.deleteProject(projectId);

      demoStorage.logActivity({
        userId: 'demo-user',
        userName: 'Demo User',
        action: 'project_deleted',
        message: `Deleted project: ${project?.name || 'Unknown'}`,
        projectName: project?.name,
      });
    }
  } catch (error) {
    console.error('Failed to delete project:', error);
  }
};
  const handleRenameProject = async (projectId: string, currentName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newName = prompt('Rename Project:', currentName);

    if (!newName?.trim() || newName.trim() === currentName) return;

    try {
      if (user?.uid) {
        await firestoreService.updateProject(projectId, { name: newName.trim() });
      } else {
        demoStorage.updateProject(projectId, { name: newName.trim() });
      }
    } catch (error) {
      console.error('Failed to rename project:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      if (user?.uid) {
        await signOut();
      }
    } catch (error) {
      console.error('Failed to sign out:', error);
    } finally {
      onNavigate('landing');
    }
  };

  const handleToggleTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      const userId = user?.uid || 'demo-user';
      const userName = user?.displayName || user?.email || 'Demo User';
      const completed = !task.completed;

      if (user?.uid) {
        await firestoreService.updateTask(taskId, { completed });
        await firestoreService.logActivity({
          userId,
          userName,
          action: completed ? 'task_completed' : 'task_created',
          message: completed ? `Completed task: ${task.title}` : `Reopened task: ${task.title}`,
        });
      } else {
        demoStorage.updateTask(taskId, { completed });
        demoStorage.logActivity({
          userId,
          userName,
          action: completed ? 'task_completed' : 'task_created',
          message: completed ? `Completed task: ${task.title}` : `Reopened task: ${task.title}`,
        });
      }
    } catch (error) {
      console.error('Failed to toggle task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Delete this task?')) return;

    try {
      if (user?.uid) {
        await firestoreService.deleteTask(taskId);
      } else {
        demoStorage.deleteTask(taskId);
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleCreateTask = async (title: string) => {
    const userId = user?.uid || 'demo-user';
    const userName = user?.displayName || user?.email || 'Demo User';

    try {
      if (user?.uid) {
        await firestoreService.createTask({
          userId,
          title,
          completed: false,
          urgent: false,
        });
        await firestoreService.logActivity({
          userId,
          userName,
          action: 'task_created',
          message: `Created task: ${title}`,
        });
      } else {
        demoStorage.createTask({
          userId,
          title,
          completed: false,
          urgent: false,
        });
        demoStorage.logActivity({
          userId,
          userName,
          action: 'task_created',
          message: `Created task: ${title}`,
        });
      }
    } catch (error) {
      console.error('Failed to create task:', error);
    }
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
      <MobileSidebar
        active={active}
        setActive={setActive}
        onCreateProject={() => setCreateProjectOpen(true)}
        onSignOut={handleSignOut}
        projects={projects}
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar 
          onCommand={onCommand} 
          onSignOut={handleSignOut} 
          activities={activities} 
          user={user} 
          onMenuToggle={() => setMobileSidebarOpen(true)}
        />
        <ScrollArea className="flex-1 thin-scrollbar">
          <div className="p-3 sm:p-4 md:p-6 lg:p-8 max-w-6xl mx-auto pb-24 lg:pb-8">
            {active === 'overview' && (
              <>
                <WelcomeHeader onCreateProject={() => setCreateProjectOpen(true)} />
                <div className="mt-8">
                  <QuickActions onNavigate={handleProjectClick} />
                </div>
                <Separator className="my-8 bg-border/40" />
                <RecentProjects projects={projects} loading={loading} onNavigate={handleProjectClick} onDelete={handleDeleteProject} onRename={handleRenameProject} />
                <div className="mt-8">
                  <TasksWidget tasks={tasks} onToggleTask={handleToggleTask} onDeleteTask={handleDeleteTask} onCreateTask={handleCreateTask} />
                </div>
                <div className="mt-8">
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
                <Separator className="my-8 bg-border/40" />
                <RecentProjects projects={projects} loading={loading} onNavigate={handleProjectClick} onDelete={handleDeleteProject} onRename={handleRenameProject} />
              </div>
            )}

            {active === 'activity' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-serif text-foreground">Activity Log</h1>
                  <p className="text-xs text-foreground/80 mt-1 font-mono font-medium">Track compiler issues, PR reviews and deploy events</p>
                </div>
                <Separator className="my-8 bg-border/40" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-xs uppercase font-mono tracking-widest text-foreground font-bold">// Notifications</h3>
                    <div className="border border-border/40 rounded-xl bg-card p-4 space-y-4 shadow-sm">
                      {activities.length === 0 ? (
                        <div className="text-center text-xs text-foreground/70 font-mono py-8 font-medium">
                          No recent activity
                        </div>
                      ) : (
                        activities.slice(0, 10).map((activity) => {
                          const iconMap: Record<string, React.ElementType> = {
                            project_created: Plus,
                            project_deleted: Trash2,
                            file_created: FileCode2,
                            file_updated: FileCode2,
                            file_deleted: Trash2,
                            ai_review_completed: Sparkles,
                            ai_fix_applied: Zap,
                            ai_refactor_applied: Sparkles,
                            code_executed: Play,
                            github_repo_connected: GitBranch,
                            collaborator_joined: Users,
                            collaborator_left: Users,
                            task_created: CheckCircle2,
                            task_completed: CheckCircle2,
                            project_starred: Star,
                            project_unstarred: Star,
                          };
                          const Icon = iconMap[activity.action] || Bell;
                          const formatRelativeTime = (timestamp: any) => {
                            if (!timestamp) return 'Just now';
                            const now = new Date();
                            const time = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
                            const diffMs = now.getTime() - time.getTime();
                            const diffMins = Math.floor(diffMs / 60000);
                            const diffHours = Math.floor(diffMs / 3600000);
                            const diffDays = Math.floor(diffMs / 86400000);

                            if (diffMins < 1) return 'Just now';
                            if (diffMins < 60) return `${diffMins}m ago`;
                            if (diffHours < 24) return `${diffHours}h ago`;
                            return `${diffDays}d ago`;
                          };
                          return (
                            <div key={activity.id} className="flex gap-4 p-3 rounded-lg bg-background-soft/60 border border-border/40 hover:border-primary/50 transition-colors">
                              <div className="h-8 w-8 rounded-lg bg-primary/30 flex items-center justify-center text-primary shrink-0">
                                <Icon className="h-3.5 w-3.5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-semibold text-foreground">{activity.message}</div>
                                {activity.projectName && (
                                  <div className="text-[11px] text-foreground/70 mt-0.5 font-medium">{activity.projectName}</div>
                                )}
                                <div className="text-[9px] text-foreground/50 mt-1 font-mono font-semibold">{formatRelativeTime(activity.timestamp)}</div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xs uppercase font-mono tracking-widest text-foreground font-bold">// Tasks queue</h3>
                    <TasksWidget tasks={tasks} onToggleTask={handleToggleTask} onDeleteTask={handleDeleteTask} onCreateTask={handleCreateTask} />
                  </div>
                </div>
              </div>
            )}

            {active === 'starred' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-serif text-foreground">Starred Projects</h1>
                  <p className="text-xs text-foreground/80 mt-1 font-mono font-medium">Quick access to favorited repositories</p>
                </div>
                <Separator className="my-8 bg-border/40" />
                {starredProjects.length === 0 ? (
                  <div className="text-center py-12 text-foreground/70 font-mono text-xs font-medium">No starred projects yet. Click star on any repository.</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {starredProjects.map((starred, index) => {
                      const project = projects.find(p => p.id === starred.projectId);
                      if (!project) return null;
                      return (
                        <ProjectCard
                          key={starred.id}
                          project={project}
                          onNavigate={handleProjectClick}
                          onDelete={handleDeleteProject}
                          onRename={handleRenameProject}
                          index={index}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {active === 'settings' && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-serif text-foreground">Workspace Settings</h1>
                  <p className="text-xs text-foreground/80 mt-1 font-mono font-medium">Configure theme, font size, and key bindings</p>
                </div>
                <Separator className="my-8 bg-border/40" />
                <div className="border border-border/40 rounded-2xl bg-card p-4 sm:p-6 space-y-6 shadow-sm">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold font-mono text-foreground">Editor Theme</label>
                    <select 
                      value={editorTheme} 
                      onChange={(e) => setEditorTheme(e.target.value)} 
                      className="w-full h-10 px-3 rounded-lg bg-background-soft border border-border/40 text-sm text-foreground focus:ring-1 focus:ring-primary outline-none font-medium"
                    >
                      <option value="Lumen Dark">Lumen Dark (Default)</option>
                      <option value="VS-Dark">VS-Dark</option>
                      <option value="Light Neo-Brutalist">Light Neo-Brutalist</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold font-mono text-foreground">Font Family</label>
                    <select 
                      value={editorFont} 
                      onChange={(e) => setEditorFont(e.target.value)} 
                      className="w-full h-10 px-3 rounded-lg bg-background-soft border border-border/40 text-sm text-foreground focus:ring-1 focus:ring-primary outline-none font-medium"
                    >
                      <option value="JetBrains Mono">JetBrains Mono</option>
                      <option value="Fira Code">Fira Code</option>
                      <option value="Courier New">Courier New</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold font-mono text-foreground">Key Bindings</label>
                    <select 
                      value={editorKeybindings} 
                      onChange={(e) => setEditorKeybindings(e.target.value)} 
                      className="w-full h-10 px-3 rounded-lg bg-background-soft border border-border/40 text-sm text-foreground focus:ring-1 focus:ring-primary outline-none font-medium"
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
                        settingsSaved ? 'bg-green-600 text-white' : 'bg-primary text-foreground hover:bg-primary/90'
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