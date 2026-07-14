import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

export interface CursorPosition {
  line: number;
  column: number;
}

export interface RemoteCursor {
  userId: string;
  userName: string;
  color: string;
  position: CursorPosition;
  selection?: {
    start: CursorPosition;
    end: CursorPosition;
  };
  fileId?: string;
}

export interface FileUpdate {
  fileId: string;
  content: string;
  userId: string;
  timestamp: number;
}

class SocketService {
  private socket: Socket | null = null;
  private currentProject: string | null = null;
  private currentFile: string | null = null;

  connect(userId: string, userName: string): void {
    if (this.socket?.connected) return;

    this.socket = io(SOCKET_URL, {
      auth: { userId, userName },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.leaveRoom();
      this.socket.disconnect();
      this.socket = null;
      this.currentProject = null;
      this.currentFile = null;
    }
  }

  joinProject(projectId: string): void {
    if (!this.socket) return;
    this.currentProject = projectId;
    this.socket.emit('join-project', { projectId });
  }

  leaveProject(): void {
    if (!this.socket || !this.currentProject) return;
    this.socket.emit('leave-project', { projectId: this.currentProject });
    this.currentProject = null;
  }

  joinFile(fileId: string): void {
    if (!this.socket) return;
    this.currentFile = fileId;
    this.socket.emit('join-file', { fileId });
  }

  leaveFile(): void {
    if (!this.socket || !this.currentFile) return;
    this.socket.emit('leave-file', { fileId: this.currentFile });
    this.currentFile = null;
  }

  leaveRoom(): void {
    if (!this.socket) return;
    if (this.currentFile) {
      this.socket.emit('leave-file', { fileId: this.currentFile });
      this.currentFile = null;
    }
    if (this.currentProject) {
      this.socket.emit('leave-project', { projectId: this.currentProject });
      this.currentProject = null;
    }
  }

  
  broadcastCursor(position: CursorPosition, selection?: { start: CursorPosition; end: CursorPosition }): void {
    if (!this.socket || !this.currentFile) return;
    this.socket.emit('cursor-move', {
      fileId: this.currentFile,
      position,
      selection
    });
  }

  onCursorMove(callback: (cursor: RemoteCursor) => void): void {
    if (!this.socket) return;
    this.socket.on('cursor-move', callback);
  }

  offCursorMove(callback: (cursor: RemoteCursor) => void): void {
    if (!this.socket) return;
    this.socket.off('cursor-move', callback);
  }

  
  broadcastFileUpdate(content: string): void {
    if (!this.socket || !this.currentFile) return;
    this.socket.emit('file-update', {
      fileId: this.currentFile,
      content
    });
  }

  onFileUpdate(callback: (update: FileUpdate) => void): void {
    if (!this.socket) return;
    this.socket.on('file-update', callback);
  }

  offFileUpdate(callback: (update: FileUpdate) => void): void {
    if (!this.socket) return;
    this.socket.off('file-update', callback);
  }

  
  onUserJoined(callback: (user: { userId: string; userName: string }) => void): void {
    if (!this.socket) return;
    this.socket.on('user-joined', callback);
  }

  onUserLeft(callback: (userId: string) => void): void {
    if (!this.socket) return;
    this.socket.on('user-left', callback);
  }

  onUsersList(callback: (users: Array<{ userId: string; userName: string }>) => void): void {
    if (!this.socket) return;
    this.socket.on('users-list', callback);
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
