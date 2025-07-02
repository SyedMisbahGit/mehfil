export interface User {
  name: string;
  gender: string;
  id: string;
  joinDate: string;
}

export interface QissaLine {
  id: string;
  text: string;
  timestamp: number;
  authorId: string;
}

export interface Qissa {
  id: string;
  title: string;
  lines: QissaLine[];
  timestamp: number;
  completed: boolean;
}

export interface Tehqeeq {
  id: string;
  question: string;
  answers: {
    authorId: string;
    text: string;
    timestamp: number;
  }[];
  timestamp: number;
}

export interface Heartbeat {
  userId: string;
  timestamp: number;
}

export interface Prompt {
  id: string;
  text: string;
  used: boolean;
}

export interface QissaTurn {
  qissaId: string;
  userId: string;
  startTime: number;
}
