import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { firestoreService, type Project } from '@/services/firestore';
import { demoStorage } from '@/services/demoStorage';
import { useAuth } from '@/contexts/AuthContext';
import { Timestamp } from 'firebase/firestore';

interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectCreated?: (project: Project) => void;
}

const colors = ['#38bdf8', '#5eead4', '#fbbf24', '#f472b6', '#a78bfa', '#fb7185'];
const languages = ['TypeScript', 'JavaScript', 'Python', 'Go', 'Rust', 'Java'];

const DEFAULT_CONTENT: Record<string, { fileName: string; lang: string; content: string }> = {
  typescript: { fileName: 'index.ts',  lang: 'typescript', content: '// Welcome to your new TypeScript project!\nconsole.log("Hello, World!");\n' },
  javascript: { fileName: 'index.js',  lang: 'javascript', content: '// Welcome to your new JavaScript project!\nconsole.log("Hello, World!");\n' },
  python:     { fileName: 'main.py',   lang: 'python',     content: '# Welcome to your new Python project!\nprint("Hello, World!")\n' },
  go:         { fileName: 'main.go',   lang: 'go',         content: 'package main\n\nimport "fmt"\n\nfunc main() {\n\tfmt.Println("Hello, World!")\n}\n' },
  rust:       { fileName: 'main.rs',   lang: 'rust',       content: '// Welcome to your new Rust project!\nfn main() {\n    println!("Hello, World!");\n}\n' },
  java:       { fileName: 'Main.java', lang: 'java',       content: '// Welcome to your new Java project!\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}\n' },
};

export function CreateProjectModal({ open, onOpenChange, onProjectCreated }: CreateProjectModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('TypeScript');
  const [color, setColor] = useState(colors[0]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { fileName, lang, content } = DEFAULT_CONTENT[language.toLowerCase()] ?? DEFAULT_CONTENT.typescript;
    const nowTs = Timestamp.fromDate(new Date());

    try {
      // Demo mode: no Firebase Auth required.
      // Authenticated mode: keep using Firestore.
      const userId = user?.uid ?? 'demo-user';
      const userName = user?.displayName || user?.email || 'Demo User';

      let projectId: string;

      if (user?.uid) {
        projectId = await firestoreService.createProject({
          name, description, language, color, userId,
          branch: 'main', collaborators: 1, progress: 0,
        });

        await firestoreService.createFile({
          projectId, name: fileName, content, language: lang,
          path: `/${fileName}`, modified: false,
        });

        try {
          await firestoreService.logActivity({
            userId,
            userName,
            action: 'project_created',
            message: `Created project: ${name}`,
            projectName: name,
          });
        } catch {
          // Activity logging must not block project creation.
        }
      } else {
        projectId = demoStorage.createProject({
          name,
          description,
          language,
          color,
          userId,
          branch: 'main',
          collaborators: 1,
          progress: 0,
        });

        demoStorage.createFile({
          projectId,
          name: fileName,
          content,
          language: lang,
          path: `/${fileName}`,
          modified: false,
        });

        demoStorage.logActivity({
          userId,
          userName,
          action: 'project_created',
          message: `Created project: ${name}`,
          projectName: name,
        });
      }

      const localProject: Project = {
        id: projectId,
        name,
        description,
        language,
        color,
        userId,
        branch: 'main',
        collaborators: 1,
        progress: 0,
        createdAt: nowTs,
        updatedAt: nowTs,
      };

      onProjectCreated?.(localProject);
      onOpenChange(false);
      setName('');
      setDescription('');
      setLanguage('TypeScript');
      setColor(colors[0]);
    } catch (error) {
      console.error('[CreateProject] Failed to create project:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/30 backdrop-blur-sm"
          onClick={() => onOpenChange(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-2xl border border-border/40 bg-card overflow-hidden shadow-lg"
          >
            {/* Accent color bar at top */}
            <motion.div
              className="h-[3px] w-full"
              animate={{ backgroundColor: color }}
              transition={{ duration: 0.3 }}
              style={{ backgroundColor: color }}
            />

            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5">
                  {/* Colored dot beside title */}
                  <motion.span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    animate={{ backgroundColor: color, boxShadow: `0 0 8px ${color}80` }}
                    transition={{ duration: 0.3 }}
                    style={{ backgroundColor: color }}
                  />
                  <h2 className="text-[15px] font-medium tracking-tight">New project</h2>
                </div>
                <button
                  onClick={() => onOpenChange(false)}
                  className="h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-border/20 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-normal text-muted-foreground uppercase tracking-wider">Project name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="my-awesome-project"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-background-soft border-border/40 focus:border-primary/50 focus-visible:ring-0 focus-visible:ring-offset-0 h-9 text-sm placeholder:text-muted-foreground"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[11px] font-normal text-muted-foreground uppercase tracking-wider">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="What is this project about?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="bg-background-soft border-border/40 focus:border-primary/50 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm placeholder:text-muted-foreground resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[11px] font-normal text-muted-foreground uppercase tracking-wider">Language</Label>
                  <select
                    id="language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-background-soft border border-border/40 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                  >
                    {languages.map((lang) => (
                      <option key={lang} value={lang} className="bg-background">{lang}</option>
                    ))}
                  </select>
                </div>

                {/* Color picker */}
                <div className="space-y-2">
                  <Label className="text-[11px] font-normal text-muted-foreground uppercase tracking-wider">Accent color</Label>
                  <div className="flex items-center gap-2">
                    {colors.map((c) => {
                      const isSelected = color === c;
                      return (
                        <motion.button
                          key={c}
                          type="button"
                          onClick={() => setColor(c)}
                          whileHover={{ scale: 1.12 }}
                          whileTap={{ scale: 0.95 }}
                          animate={isSelected ? { scale: 1.15 } : { scale: 1 }}
                          transition={{ duration: 0.15 }}
                          className="relative h-7 w-7 rounded-full flex items-center justify-center focus:outline-none"
                          style={{
                            backgroundColor: c,
                            boxShadow: isSelected ? `0 0 0 2px #faf8f5, 0 0 0 3.5px ${c}, 0 0 12px ${c}60` : 'none',
                          }}
                        >
                          <AnimatePresence>
                            {isSelected && (
                              <motion.span
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ duration: 0.15 }}
                                className="h-2 w-2 rounded-full bg-white/90 shadow-sm"
                              />
                            )}
                          </AnimatePresence>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full h-9 rounded-lg text-sm font-medium transition-opacity disabled:opacity-50 mt-2 shadow-sm"
                  animate={{ backgroundColor: color }}
                  transition={{ duration: 0.3 }}
                  style={{
                    backgroundColor: color,
                    color: '#1a1a1d',
                  }}
                >
                  {loading ? 'Creating…' : 'Create project'}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}