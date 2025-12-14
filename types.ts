export interface Tag {
  id: string;
  label: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  tagId: string;
  completed: boolean;
  dueDate?: string;
}

export type Screen = 'LOGIN' | 'WELCOME' | 'HOME' | 'NEW_NOTE' | 'NEW_TAG';