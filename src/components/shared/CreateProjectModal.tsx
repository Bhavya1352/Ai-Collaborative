import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { firestoreService, type Project } from '@/services/firestore';
import { useAuth } from '@/contexts/AuthContext';

interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectCreated?: (project: Project) => void;
}

const colors = ['#38bdf8', '#5eead4', '#fbbf24', '#f472b6', '#a78bfa', '#fb7185'];
const languages = ['TypeScript', 'JavaScript', 'Python', 'Go', 'Rust', 'Java'];

export function CreateProjectModal({ open, onOpenChange, onProjectCreated }: CreateProjectModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('TypeScript');
  const [color, setColor] = useState(colors[0]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = user?.uid || 'guest-user';

    setLoading(true);
    try {
      const projectId = await firestoreService.createProject({
        name,
        description,
        language,
        color,
        userId: userId,
        branch: 'main',
        collaborators: 1,
        progress: 0
      });

      
      let defaultFileName = 'index.ts';
      let defaultLang = 'typescript';
      let defaultContent = '// Welcome to your new project!';
      
      switch (language.toLowerCase()) {
        case 'typescript':
          defaultFileName = 'index.ts';
          defaultLang = 'typescript';
          defaultContent = '// Welcome to your new TypeScript project!\nconsole.log("Hello, World!");\n';
          break;
        case 'javascript':
          defaultFileName = 'index.js';
          defaultLang = 'javascript';
          defaultContent = '// Welcome to your new JavaScript project!\nconsole.log("Hello, World!");\n';
          break;
        case 'python':
          defaultFileName = 'main.py';
          defaultLang = 'python';
          defaultContent = '# Welcome to your new Python project!\nprint("Hello, World!")\n';
          break;
        case 'go':
          defaultFileName = 'main.go';
          defaultLang = 'go';
          defaultContent = 'package main\n\nimport "fmt"\n\nfunc main() {\n\tfmt.Println("Hello, World!")\n}\n';
          break;
        case 'rust':
          defaultFileName = 'main.rs';
          defaultLang = 'rust';
          defaultContent = '// Welcome to your new Rust project!\nfn main() {\n    println!("Hello, World!");\n}\n';
          break;
        case 'java':
          defaultFileName = 'Main.java';
          defaultLang = 'java';
          defaultContent = '// Welcome to your new Java project!\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}\n';
          break;
      }

      await firestoreService.createFile({
        projectId,
        name: defaultFileName,
        content: defaultContent,
        language: defaultLang,
        path: `/${defaultFileName}`,
        modified: false
      });

      const project = await firestoreService.getProject(projectId);
      if (project) {
        onProjectCreated?.(project);
        onOpenChange(false);
        
        setName('');
        setDescription('');
        setLanguage('TypeScript');
        setColor(colors[0]);
      }
    } catch (error) {
      console.error('Failed to create project:', error);
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => onOpenChange(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-strong rounded-2xl p-6 w-full max-w-md border border-white/10"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Create new project</h2>
              <button
                onClick={() => onOpenChange(false)}
                className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="my-awesome-project"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="What is this project about?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <select
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-background border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {languages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-2">
                  {colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`h-8 w-8 rounded-full transition-all ${
                        color === c ? 'ring-2 ring-offset-2 ring-offset-background ring-white' : ''
                      }`}
                      style={{ background: c }}
                    />
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-foreground text-background hover:bg-foreground/90"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create project'}
              </Button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
