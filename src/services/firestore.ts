import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  limit
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Project {
  id: string;
  name: string;
  description: string;
  language: string;
  color: string;
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  branch: string;
  collaborators: number;
  progress: number;
}

export interface File {
  id: string;
  projectId: string;
  name: string;
  content: string;
  language: string;
  path: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  modified: boolean;
}

export interface Activity {
  id: string;
  userId: string;
  userName: string;
  action: ActivityAction;
  message: string;
  projectId?: string;
  projectName?: string;
  fileId?: string;
  fileName?: string;
  metadata?: Record<string, any>;
  timestamp: Timestamp;
}

export type ActivityAction = 
  | 'project_created'
  | 'project_deleted'
  | 'file_created'
  | 'file_updated'
  | 'file_deleted'
  | 'ai_review_completed'
  | 'ai_fix_applied'
  | 'ai_refactor_applied'
  | 'code_executed'
  | 'github_repo_connected'
  | 'collaborator_joined'
  | 'collaborator_left'
  | 'task_created'
  | 'task_completed'
  | 'project_starred'
  | 'project_unstarred';

export interface Task {
  id: string;
  userId: string;
  projectId?: string;
  title: string;
  description?: string;
  completed: boolean;
  urgent: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UserSettings {
  id: string;
  userId: string;
  editorTheme: string;
  fontFamily: string;
  keybindings: string;
  updatedAt: Timestamp;
}

export interface StarredProject {
  id: string;
  userId: string;
  projectId: string;
  projectName: string;
  projectColor: string;
  projectLanguage: string;
  starredAt: Timestamp;
}

const PROJECTS_COLLECTION = 'projects';
const FILES_COLLECTION = 'files';
const ACTIVITIES_COLLECTION = 'activities';
const TASKS_COLLECTION = 'tasks';
const USER_SETTINGS_COLLECTION = 'user_settings';
const STARRED_PROJECTS_COLLECTION = 'starred_projects';

export const firestoreService = {
  
  async createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    console.log('[Firestore] createProject called with:', project);
    try {
      const docRef = doc(collection(db, PROJECTS_COLLECTION));
      const newProject: Project = {
        ...project,
        id: docRef.id,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
      };
      console.log('[Firestore] Setting project document with ID:', docRef.id);
      await setDoc(docRef, newProject);
      console.log('[Firestore] Project document set successfully');
      return docRef.id;
    } catch (error: any) {
      console.error('[Firestore] createProject error:', error);
      console.error('[Firestore] Error code:', error.code);
      console.error('[Firestore] Error message:', error.message);
      throw error;
    }
  },

  async getProject(projectId: string): Promise<Project | null> {
    const docRef = doc(db, PROJECTS_COLLECTION, projectId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Project;
    }
    return null;
  },

  async getUserProjects(userId: string): Promise<Project[]> {
    const q = query(
      collection(db, PROJECTS_COLLECTION),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
  },

  async updateProject(projectId: string, updates: Partial<Project>): Promise<void> {
    const docRef = doc(db, PROJECTS_COLLECTION, projectId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  },

  async deleteProject(projectId: string): Promise<void> {
    await deleteDoc(doc(db, PROJECTS_COLLECTION, projectId));
  },

  subscribeToProjects(userId: string, callback: (projects: Project[]) => void) {
    const q = query(
      collection(db, PROJECTS_COLLECTION),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const projects = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Project))
        .filter(p => p.updatedAt != null); // Filter out docs with pending serverTimestamp
      callback(projects);
    });
  },

  
  async createFile(file: Omit<File, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    console.log('[Firestore] createFile called with:', file);
    const docRef = doc(collection(db, FILES_COLLECTION));
    const newFile: File = {
      ...file,
      id: docRef.id,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };
    console.log('[Firestore] Setting file document with ID:', docRef.id);
    await setDoc(docRef, newFile);
    console.log('[Firestore] File document set successfully');
    return docRef.id;
  },

  async getFile(fileId: string): Promise<File | null> {
    const docRef = doc(db, FILES_COLLECTION, fileId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as File;
    }
    return null;
  },

  async getProjectFiles(projectId: string): Promise<File[]> {
    const q = query(
      collection(db, FILES_COLLECTION),
      where('projectId', '==', projectId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as File));
  },

  async updateFile(fileId: string, updates: Partial<File>): Promise<void> {
    const docRef = doc(db, FILES_COLLECTION, fileId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  },

  async deleteFile(fileId: string): Promise<void> {
    await deleteDoc(doc(db, FILES_COLLECTION, fileId));
  },

  subscribeToFile(fileId: string, callback: (file: File | null) => void) {
    const docRef = doc(db, FILES_COLLECTION, fileId);
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() } as File);
      } else {
        callback(null);
      }
    });
  },

  subscribeToProjectFiles(projectId: string, callback: (files: File[]) => void) {
    const q = query(
      collection(db, FILES_COLLECTION),
      where('projectId', '==', projectId)
    );
    return onSnapshot(q, (snapshot) => {
      const files = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as File));
      callback(files);
    });
  },

  // Activity methods
  async logActivity(activity: Omit<Activity, 'id' | 'timestamp'>): Promise<string> {
    const docRef = doc(collection(db, ACTIVITIES_COLLECTION));
    const newActivity: Activity = {
      ...activity,
      id: docRef.id,
      timestamp: serverTimestamp() as Timestamp,
    };
    await setDoc(docRef, newActivity);
    return docRef.id;
  },

  async getUserActivities(userId: string, limitCount: number = 50): Promise<Activity[]> {
    const q = query(
      collection(db, ACTIVITIES_COLLECTION),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Activity));
  },

  subscribeToUserActivities(userId: string, callback: (activities: Activity[]) => void) {
    const q = query(
      collection(db, ACTIVITIES_COLLECTION),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(50)
    );
    return onSnapshot(q, (snapshot) => {
      const activities = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Activity));
      callback(activities);
    });
  },

  // Task methods
  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = doc(collection(db, TASKS_COLLECTION));
    const newTask: Task = {
      ...task,
      id: docRef.id,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };
    await setDoc(docRef, newTask);
    return docRef.id;
  },

  async getTask(taskId: string): Promise<Task | null> {
    const docRef = doc(db, TASKS_COLLECTION, taskId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Task;
    }
    return null;
  },

  async getUserTasks(userId: string): Promise<Task[]> {
    const q = query(
      collection(db, TASKS_COLLECTION),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
  },

  async updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
    const docRef = doc(db, TASKS_COLLECTION, taskId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  },

  async deleteTask(taskId: string): Promise<void> {
    await deleteDoc(doc(db, TASKS_COLLECTION, taskId));
  },

  subscribeToUserTasks(userId: string, callback: (tasks: Task[]) => void) {
    const q = query(
      collection(db, TASKS_COLLECTION),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      callback(tasks);
    });
  },

  // User Settings methods
  async getUserSettings(userId: string): Promise<UserSettings | null> {
    const q = query(
      collection(db, USER_SETTINGS_COLLECTION),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as UserSettings;
    }
    return null;
  },

  async saveUserSettings(settings: Omit<UserSettings, 'id' | 'updatedAt'>): Promise<string> {
    const existing = await this.getUserSettings(settings.userId);
    if (existing) {
      await updateDoc(doc(db, USER_SETTINGS_COLLECTION, existing.id), {
        ...settings,
        updatedAt: serverTimestamp()
      });
      return existing.id;
    } else {
      const docRef = doc(collection(db, USER_SETTINGS_COLLECTION));
      const newSettings: UserSettings = {
        ...settings,
        id: docRef.id,
        updatedAt: serverTimestamp() as Timestamp,
      };
      await setDoc(docRef, newSettings);
      return docRef.id;
    }
  },

  subscribeToUserSettings(userId: string, callback: (settings: UserSettings | null) => void) {
    const q = query(
      collection(db, USER_SETTINGS_COLLECTION),
      where('userId', '==', userId)
    );
    return onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        callback({ id: doc.id, ...doc.data() } as UserSettings);
      } else {
        callback(null);
      }
    });
  },

  // Starred Projects methods
  async starProject(starred: Omit<StarredProject, 'id' | 'starredAt'>): Promise<string> {
    const docRef = doc(collection(db, STARRED_PROJECTS_COLLECTION));
    const newStarred: StarredProject = {
      ...starred,
      id: docRef.id,
      starredAt: serverTimestamp() as Timestamp,
    };
    await setDoc(docRef, newStarred);
    return docRef.id;
  },

  async unstarProject(userId: string, projectId: string): Promise<void> {
    const q = query(
      collection(db, STARRED_PROJECTS_COLLECTION),
      where('userId', '==', userId),
      where('projectId', '==', projectId)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      await deleteDoc(doc(db, STARRED_PROJECTS_COLLECTION, querySnapshot.docs[0].id));
    }
  },

  async getStarredProjects(userId: string): Promise<StarredProject[]> {
    const q = query(
      collection(db, STARRED_PROJECTS_COLLECTION),
      where('userId', '==', userId),
      orderBy('starredAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StarredProject));
  },

  async isProjectStarred(userId: string, projectId: string): Promise<boolean> {
    const q = query(
      collection(db, STARRED_PROJECTS_COLLECTION),
      where('userId', '==', userId),
      where('projectId', '==', projectId)
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  },

  subscribeToStarredProjects(userId: string, callback: (starred: StarredProject[]) => void) {
    const q = query(
      collection(db, STARRED_PROJECTS_COLLECTION),
      where('userId', '==', userId),
      orderBy('starredAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const starred = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StarredProject));
      callback(starred);
    });
  },
};
