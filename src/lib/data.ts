export type Screen = 'landing' | 'dashboard' | 'editor';

export interface ProjectMeta {
  id: string;
  name: string;
  language: string;
  color: string;
  updated: string;
  collaborators: number;
  branch: string;
  progress: number;
  description: string;
}

export const projects: ProjectMeta[] = [
  {
    id: 'atlas',
    name: 'atlas-engine',
    language: 'TypeScript',
    color: '#38bdf8',
    updated: '2m ago',
    collaborators: 4,
    branch: 'main',
    progress: 78,
    description: 'Real-time spatial indexing engine for collaborative canvases.',
  },
  {
    id: 'nebula',
    name: 'nebula-ui',
    language: 'TypeScript',
    color: '#5eead4',
    updated: '1h ago',
    collaborators: 6,
    branch: 'feat/anim-system',
    progress: 92,
    description: 'Design system & component library powering Lumen surfaces.',
  },
  {
    id: 'pulse',
    name: 'pulse-analytics',
    language: 'Python',
    color: '#fbbf24',
    updated: '3h ago',
    collaborators: 3,
    branch: 'main',
    progress: 54,
    description: 'Event streaming pipeline with sub-second latency budgets.',
  },
  {
    id: 'vector',
    name: 'vector-store',
    language: 'Rust',
    color: '#f472b6',
    updated: 'Yesterday',
    collaborators: 2,
    branch: 'perf/hnsw',
    progress: 41,
    description: 'Approximate nearest neighbor search at billion-vector scale.',
  },
  {
    id: 'orbit',
    name: 'orbit-deploy',
    language: 'Go',
    color: '#a78bfa',
    updated: '2d ago',
    collaborators: 5,
    branch: 'main',
    progress: 88,
    description: 'Edge-first deployment orchestrator with zero-downtime rolls.',
  },
  {
    id: 'cipher',
    name: 'cipher-auth',
    language: 'TypeScript',
    color: '#fb7185',
    updated: '4d ago',
    collaborators: 3,
    branch: 'chore/keys',
    progress: 66,
    description: 'Passwordless auth with passkey + WebAuthn support.',
  },
];

export interface Collaborator {
  name: string;
  initials: string;
  color: string;
  status: 'active' | 'idle' | 'viewing';
}

export const collaborators: Collaborator[] = [
  { name: 'Maya Chen', initials: 'MC', color: '#38bdf8', status: 'active' },
  { name: 'Dev Patel', initials: 'DP', color: '#5eead4', status: 'active' },
  { name: 'Sora Kim', initials: 'SK', color: '#fbbf24', status: 'viewing' },
  { name: 'Lina Park', initials: 'LP', color: '#f472b6', status: 'idle' },
];

export interface FileNode {
  name: string;
  type: 'file' | 'folder';
  language?: string;
  children?: FileNode[];
  active?: boolean;
  modified?: boolean;
  path?: string;
  fileId?: string;
}

export const fileTree: FileNode[] = [
  {
    name: 'src',
    type: 'folder',
    children: [
      {
        name: 'engine',
        type: 'folder',
        children: [
          { name: 'index.ts', type: 'file', language: 'typescript', active: true, modified: true },
          { name: 'resolver.ts', type: 'file', language: 'typescript' },
          { name: 'scheduler.ts', type: 'file', language: 'typescript', modified: true },
        ],
      },
      {
        name: 'components',
        type: 'folder',
        children: [
          { name: 'Canvas.tsx', type: 'file', language: 'tsx' },
          { name: 'Toolbar.tsx', type: 'file', language: 'tsx' },
          { name: 'LayerPanel.tsx', type: 'file', language: 'tsx' },
        ],
      },
      { name: 'app.tsx', type: 'file', language: 'tsx' },
    ],
  },
  {
    name: 'tests',
    type: 'folder',
    children: [
      { name: 'engine.test.ts', type: 'file', language: 'typescript' },
      { name: 'resolver.test.ts', type: 'file', language: 'typescript' },
    ],
  },
  { name: 'package.json', type: 'file', language: 'json' },
  { name: 'tsconfig.json', type: 'file', language: 'json' },
  { name: 'README.md', type: 'file', language: 'markdown' },
];

export interface NotificationItem {
  id: string;
  type: 'mention' | 'review' | 'deploy' | 'invite';
  title: string;
  body: string;
  time: string;
  unread: boolean;
}

export const notifications: NotificationItem[] = [
  {
    id: 'n1',
    type: 'mention',
    title: 'Maya mentioned you in engine/index.ts',
    body: 'Should we batch these updates before flushing to the worker?',
    time: '2m',
    unread: true,
  },
  {
    id: 'n2',
    type: 'review',
    title: 'Review requested on PR #842',
    body: 'feat: incremental re-indexing with CRDT merge',
    time: '18m',
    unread: true,
  },
  {
    id: 'n3',
    type: 'deploy',
    title: 'Deployment succeeded',
    body: 'atlas-engine@main shipped to edge — 14 regions',
    time: '1h',
    unread: false,
  },
  {
    id: 'n4',
    type: 'invite',
    title: 'Sora Kim accepted your invite',
    body: 'Joined the nebula-ui workspace',
    time: '3h',
    unread: false,
  },
];

export const codeSample = `import { createEngine, type Doc } from './core';
import { CRDT } from './crdt';

// Initialize the collaborative engine with
// a shared document and presence channel.
export function init(doc: Doc) {
  const engine = createEngine({
    doc,
    presence: { throttle: 16 },
    awareness: true,
  });

  engine.on('update', (ops) => {
    CRDT.merge(doc, ops);
    engine.flush();
  });

  return engine;
}`;
