import { Timestamp } from 'firebase/firestore';
import type {
  Project,
  File as ProjectFile,
  Task,
  Activity,
  StarredProject,
} from './firestore';

const DEMO_PROJECTS_KEY = 'lumen_demo_projects';
const DEMO_FILES_KEY = 'lumen_demo_files';
const DEMO_TASKS_KEY = 'lumen_demo_tasks';
const DEMO_ACTIVITIES_KEY = 'lumen_demo_activities';
const DEMO_STARRED_KEY = 'lumen_demo_starred';

function randomId(): string {
  return (
    Math.random().toString(36).slice(2) +
    Date.now().toString(36)
  );
}

function now(): Timestamp {
  return Timestamp.fromDate(new Date());
}

/* ---------------- PROJECTS ---------------- */

function loadProjects(): Project[] {
  try {
    return JSON.parse(
      localStorage.getItem(DEMO_PROJECTS_KEY) || '[]'
    );
  } catch {
    return [];
  }
}

function saveProjects(projects: Project[]): void {
  localStorage.setItem(
    DEMO_PROJECTS_KEY,
    JSON.stringify(projects)
  );
}

/* ---------------- FILES ---------------- */

function loadFiles(): ProjectFile[] {
  try {
    return JSON.parse(
      localStorage.getItem(DEMO_FILES_KEY) || '[]'
    );
  } catch {
    return [];
  }
}

function saveFiles(files: ProjectFile[]): void {
  localStorage.setItem(
    DEMO_FILES_KEY,
    JSON.stringify(files)
  );
}

/* ---------------- TASKS ---------------- */

function loadTasks(): Task[] {
  try {
    return JSON.parse(
      localStorage.getItem(DEMO_TASKS_KEY) || '[]'
    );
  } catch {
    return [];
  }
}

function saveTasks(tasks: Task[]): void {
  localStorage.setItem(
    DEMO_TASKS_KEY,
    JSON.stringify(tasks)
  );
}

/* ---------------- ACTIVITIES ---------------- */

function loadActivities(): Activity[] {
  try {
    return JSON.parse(
      localStorage.getItem(DEMO_ACTIVITIES_KEY) || '[]'
    );
  } catch {
    return [];
  }
}

function saveActivities(
  activities: Activity[]
): void {
  localStorage.setItem(
    DEMO_ACTIVITIES_KEY,
    JSON.stringify(activities)
  );
}

/* ---------------- STARRED ---------------- */

function loadStarred(): StarredProject[] {
  try {
    return JSON.parse(
      localStorage.getItem(DEMO_STARRED_KEY) || '[]'
    );
  } catch {
    return [];
  }
}

function saveStarred(
  starred: StarredProject[]
): void {
  localStorage.setItem(
    DEMO_STARRED_KEY,
    JSON.stringify(starred)
  );
}

type Unsubscribe = () => void;

/* =====================================================
   DEMO STORAGE
===================================================== */

export const demoStorage = {
  /* ---------------- PROJECTS ---------------- */

  createProject(
    project: Omit<
      Project,
      'id' | 'createdAt' | 'updatedAt'
    >
  ): string {
    const id = randomId();
    const ts = now();

    const newProject: Project = {
      ...project,
      id,
      createdAt: ts,
      updatedAt: ts,
    };

    const projects = loadProjects();

    projects.unshift(newProject);

    saveProjects(projects);

    window.dispatchEvent(
      new Event('lumen_demo_projects_changed')
    );

    return id;
  },

  getProject(
    projectId: string
  ): Project | null {
    return (
      loadProjects().find(
        (project) => project.id === projectId
      ) ?? null
    );
  },

  updateProject(
    projectId: string,
    updates: Partial<Project>
  ): void {
    const projects = loadProjects().map(
      (project) =>
        project.id === projectId
          ? {
              ...project,
              ...updates,
              updatedAt: now(),
            }
          : project
    );

    saveProjects(projects);

    window.dispatchEvent(
      new Event('lumen_demo_projects_changed')
    );
  },

  deleteProject(projectId: string): void {
    const projects = loadProjects().filter(
      (project) => project.id !== projectId
    );

    const files = loadFiles().filter(
      (file) => file.projectId !== projectId
    );

    saveProjects(projects);
    saveFiles(files);

    window.dispatchEvent(
      new Event('lumen_demo_projects_changed')
    );

    window.dispatchEvent(
      new Event('lumen_demo_files_changed')
    );
  },

  subscribeToProjects(
    callback: (projects: Project[]) => void
  ): Unsubscribe {
    const handler = () => {
      callback(loadProjects());
    };

    window.addEventListener(
      'lumen_demo_projects_changed',
      handler
    );

    callback(loadProjects());

    return () => {
      window.removeEventListener(
        'lumen_demo_projects_changed',
        handler
      );
    };
  },

  /* ---------------- FILES ---------------- */

  createFile(
    file: Omit<
      ProjectFile,
      'id' | 'createdAt' | 'updatedAt'
    >
  ): string {
    const id = randomId();
    const ts = now();

    const newFile: ProjectFile = {
      ...file,
      id,
      createdAt: ts,
      updatedAt: ts,
    };

    const files = loadFiles();

    files.push(newFile);

    saveFiles(files);

    window.dispatchEvent(
      new Event('lumen_demo_files_changed')
    );

    return id;
  },

  getFile(
    fileId: string
  ): ProjectFile | null {
    return (
      loadFiles().find(
        (file) => file.id === fileId
      ) ?? null
    );
  },

  getProjectFiles(
    projectId: string
  ): ProjectFile[] {
    return loadFiles().filter(
      (file) => file.projectId === projectId
    );
  },

  updateFile(
    fileId: string,
    updates: Partial<ProjectFile>
  ): void {
    const files = loadFiles().map(
      (file) =>
        file.id === fileId
          ? {
              ...file,
              ...updates,
              updatedAt: now(),
            }
          : file
    );

    saveFiles(files);

    window.dispatchEvent(
      new Event('lumen_demo_files_changed')
    );
  },

  deleteFile(fileId: string): void {
    const files = loadFiles().filter(
      (file) => file.id !== fileId
    );

    saveFiles(files);

    window.dispatchEvent(
      new Event('lumen_demo_files_changed')
    );
  },

  subscribeToFile(
    fileId: string,
    callback: (
      file: ProjectFile | null
    ) => void
  ): Unsubscribe {
    const handler = () => {
      const file =
        loadFiles().find(
          (item) => item.id === fileId
        ) ?? null;

      callback(file);
    };

    window.addEventListener(
      'lumen_demo_files_changed',
      handler
    );

    callback(
      loadFiles().find(
        (item) => item.id === fileId
      ) ?? null
    );

    return () => {
      window.removeEventListener(
        'lumen_demo_files_changed',
        handler
      );
    };
  },

  subscribeToProjectFiles(
    projectId: string,
    callback: (
      files: ProjectFile[]
    ) => void
  ): Unsubscribe {
    const getFiles = () =>
      loadFiles().filter(
        (file) => file.projectId === projectId
      );

    const handler = () => {
      callback(getFiles());
    };

    window.addEventListener(
      'lumen_demo_files_changed',
      handler
    );

    // Load immediately
    callback(getFiles());

    return () => {
      window.removeEventListener(
        'lumen_demo_files_changed',
        handler
      );
    };
  },

  /* ---------------- TASKS ---------------- */

  createTask(
    task: Omit<
      Task,
      'id' | 'createdAt' | 'updatedAt'
    >
  ): string {
    const id = randomId();
    const ts = now();

    const newTask: Task = {
      ...task,
      id,
      createdAt: ts,
      updatedAt: ts,
    };

    const tasks = loadTasks();

    tasks.unshift(newTask);

    saveTasks(tasks);

    window.dispatchEvent(
      new Event('lumen_demo_tasks_changed')
    );

    return id;
  },

  getTask(
    taskId: string
  ): Task | null {
    return (
      loadTasks().find(
        (task) => task.id === taskId
      ) ?? null
    );
  },

  getUserTasks(
    userId: string
  ): Task[] {
    return loadTasks().filter(
      (task) => task.userId === userId
    );
  },

  updateTask(
    taskId: string,
    updates: Partial<Task>
  ): void {
    const tasks = loadTasks().map(
      (task) =>
        task.id === taskId
          ? {
              ...task,
              ...updates,
              updatedAt: now(),
            }
          : task
    );

    saveTasks(tasks);

    window.dispatchEvent(
      new Event('lumen_demo_tasks_changed')
    );
  },

  deleteTask(taskId: string): void {
    saveTasks(
      loadTasks().filter(
        (task) => task.id !== taskId
      )
    );

    window.dispatchEvent(
      new Event('lumen_demo_tasks_changed')
    );
  },

  subscribeToUserTasks(
    userId: string,
    callback: (tasks: Task[]) => void
  ): Unsubscribe {
    const getTasks = () =>
      loadTasks().filter(
        (task) => task.userId === userId
      );

    const handler = () => {
      callback(getTasks());
    };

    window.addEventListener(
      'lumen_demo_tasks_changed',
      handler
    );

    callback(getTasks());

    return () => {
      window.removeEventListener(
        'lumen_demo_tasks_changed',
        handler
      );
    };
  },

  /* ---------------- ACTIVITIES ---------------- */

  logActivity(
    activity: Omit<
      Activity,
      'id' | 'timestamp'
    >
  ): string {
    const id = randomId();
    const ts = now();

    const newActivity: Activity = {
      ...activity,
      id,
      timestamp: ts,
    };

    const activities = loadActivities();

    activities.unshift(newActivity);

    if (activities.length > 50) {
      activities.length = 50;
    }

    saveActivities(activities);

    window.dispatchEvent(
      new Event('lumen_demo_activities_changed')
    );

    return id;
  },

  getUserActivities(
    userId: string,
    limitCount: number = 50
  ): Activity[] {
    return loadActivities()
      .filter(
        (activity) =>
          activity.userId === userId
      )
      .slice(0, limitCount);
  },

  subscribeToUserActivities(
    userId: string,
    callback: (
      activities: Activity[]
    ) => void
  ): Unsubscribe {
    const getActivities = () =>
      loadActivities()
        .filter(
          (activity) =>
            activity.userId === userId
        )
        .slice(0, 50);

    const handler = () => {
      callback(getActivities());
    };

    window.addEventListener(
      'lumen_demo_activities_changed',
      handler
    );

    callback(getActivities());

    return () => {
      window.removeEventListener(
        'lumen_demo_activities_changed',
        handler
      );
    };
  },

  /* ---------------- STARRED PROJECTS ---------------- */

  starProject(
    starred: Omit<
      StarredProject,
      'id' | 'starredAt'
    >
  ): string {
    const id = randomId();
    const ts = now();

    const newStarred: StarredProject = {
      ...starred,
      id,
      starredAt: ts,
    };

    const starredList = loadStarred();

    starredList.unshift(newStarred);

    saveStarred(starredList);

    window.dispatchEvent(
      new Event('lumen_demo_starred_changed')
    );

    return id;
  },

  unstarProject(
    userId: string,
    projectId: string
  ): void {
    const starred = loadStarred().filter(
      (item) =>
        !(
          item.userId === userId &&
          item.projectId === projectId
        )
    );

    saveStarred(starred);

    window.dispatchEvent(
      new Event('lumen_demo_starred_changed')
    );
  },

  getStarredProjects(
    userId: string
  ): StarredProject[] {
    return loadStarred().filter(
      (item) => item.userId === userId
    );
  },

  isProjectStarred(
    userId: string,
    projectId: string
  ): boolean {
    return loadStarred().some(
      (item) =>
        item.userId === userId &&
        item.projectId === projectId
    );
  },

  subscribeToStarredProjects(
    userId: string,
    callback: (
      starred: StarredProject[]
    ) => void
  ): Unsubscribe {
    const getStarred = () =>
      loadStarred().filter(
        (item) => item.userId === userId
      );

    const handler = () => {
      callback(getStarred());
    };

    window.addEventListener(
      'lumen_demo_starred_changed',
      handler
    );

    callback(getStarred());

    return () => {
      window.removeEventListener(
        'lumen_demo_starred_changed',
        handler
      );
    };
  },
};