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
  Timestamp
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

const PROJECTS_COLLECTION = 'projects';
const FILES_COLLECTION = 'files';

export const firestoreService = {
  
  async createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = doc(collection(db, PROJECTS_COLLECTION));
    const newProject: Project = {
      ...project,
      id: docRef.id,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };
    await setDoc(docRef, newProject);
    return docRef.id;
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
      const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
      callback(projects);
    });
  },

  
  async createFile(file: Omit<File, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = doc(collection(db, FILES_COLLECTION));
    const newFile: File = {
      ...file,
      id: docRef.id,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };
    await setDoc(docRef, newFile);
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
  }
};
