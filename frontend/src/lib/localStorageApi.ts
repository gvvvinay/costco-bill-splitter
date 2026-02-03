// Local Storage API - No backend required
// This enables the app to work entirely in the browser

interface User {
  id: string;
  username: string;
  email: string;
}

interface Session {
  id: number;
  name: string;
  userId: string;
  createdAt: string;
  participants: Participant[];
  items: Item[];
  settlements?: Settlement[];
}

interface Participant {
  id: number;
  name: string;
  sessionId: number;
}

interface Item {
  id: number;
  name: string;
  price: number;
  quantity: number;
  sessionId: number;
  participantIds: number[];
}

interface Settlement {
  id: number;
  fromParticipantId: number;
  toParticipantId: number;
  amount: number;
  sessionId: number;
}

// Initialize storage
const initStorage = () => {
  if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify([]));
  }
  if (!localStorage.getItem('sessions')) {
    localStorage.setItem('sessions', JSON.stringify([]));
  }
  if (!localStorage.getItem('currentUser')) {
    localStorage.setItem('currentUser', '');
  }
};

initStorage();

// User Management
export const register = async (username: string, email: string, _password: string) => {
  const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
  
  if (users.find(u => u.email === email)) {
    throw new Error('User already exists');
  }
  
  const newUser: User = {
    id: String(Date.now()),
    username,
    email
  };
  
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  localStorage.setItem('currentUser', JSON.stringify(newUser));
  
  return { token: 'local-token', user: newUser };
};

export const login = async (email: string, _password: string) => {
  const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
  const user = users.find(u => u.email === email);
  
  if (!user) {
    throw new Error('Invalid credentials');
  }
  
  localStorage.setItem('currentUser', JSON.stringify(user));
  return { token: 'local-token', user };
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('currentUser');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

// Session Management
export const getSessions = async (): Promise<Session[]> => {
  const sessions: Session[] = JSON.parse(localStorage.getItem('sessions') || '[]');
  const user = getCurrentUser();
  if (!user) return [];
  
  return sessions.filter(s => s.userId === user.id);
};

export const getSession = async (id: number): Promise<Session | null> => {
  const sessions: Session[] = JSON.parse(localStorage.getItem('sessions') || '[]');
  return sessions.find(s => s.id === id) || null;
};

export const createSession = async (name: string): Promise<Session> => {
  const user = getCurrentUser();
  if (!user) throw new Error('Not authenticated');
  
  const sessions: Session[] = JSON.parse(localStorage.getItem('sessions') || '[]');
  const newSession: Session = {
    id: Date.now(),
    name,
    userId: user.id,
    createdAt: new Date().toISOString(),
    participants: [],
    items: []
  };
  
  sessions.push(newSession);
  localStorage.setItem('sessions', JSON.stringify(sessions));
  return newSession;
};

export const deleteSession = async (id: number): Promise<void> => {
  const sessions: Session[] = JSON.parse(localStorage.getItem('sessions') || '[]');
  const filtered = sessions.filter(s => s.id !== id);
  localStorage.setItem('sessions', JSON.stringify(filtered));
};

// Participant Management
export const addParticipant = async (sessionId: number, name: string): Promise<Participant> => {
  const sessions: Session[] = JSON.parse(localStorage.getItem('sessions') || '[]');
  const session = sessions.find(s => s.id === sessionId);
  
  if (!session) throw new Error('Session not found');
  
  const newParticipant: Participant = {
    id: Date.now(),
    name,
    sessionId
  };
  
  if (!session.participants) session.participants = [];
  session.participants.push(newParticipant);
  localStorage.setItem('sessions', JSON.stringify(sessions));
  
  return newParticipant;
};

export const updateParticipant = async (id: number, name: string): Promise<Participant> => {
  const sessions: Session[] = JSON.parse(localStorage.getItem('sessions') || '[]');
  
  for (const session of sessions) {
    const participant = session.participants?.find(p => p.id === id);
    if (participant) {
      participant.name = name;
      localStorage.setItem('sessions', JSON.stringify(sessions));
      return participant;
    }
  }
  
  throw new Error('Participant not found');
};

export const deleteParticipant = async (id: number): Promise<void> => {
  const sessions: Session[] = JSON.parse(localStorage.getItem('sessions') || '[]');
  
  for (const session of sessions) {
    if (session.participants) {
      session.participants = session.participants.filter(p => p.id !== id);
    }
  }
  
  localStorage.setItem('sessions', JSON.stringify(sessions));
};

// Item Management
export const addItem = async (sessionId: number, item: Omit<Item, 'id' | 'sessionId'>): Promise<Item> => {
  const sessions: Session[] = JSON.parse(localStorage.getItem('sessions') || '[]');
  const session = sessions.find(s => s.id === sessionId);
  
  if (!session) throw new Error('Session not found');
  
  const newItem: Item = {
    ...item,
    id: Date.now(),
    sessionId
  };
  
  if (!session.items) session.items = [];
  session.items.push(newItem);
  localStorage.setItem('sessions', JSON.stringify(sessions));
  
  return newItem;
};

export const updateItem = async (id: number, updates: Partial<Item>): Promise<Item> => {
  const sessions: Session[] = JSON.parse(localStorage.getItem('sessions') || '[]');
  
  for (const session of sessions) {
    const item = session.items?.find(i => i.id === id);
    if (item) {
      Object.assign(item, updates);
      localStorage.setItem('sessions', JSON.stringify(sessions));
      return item;
    }
  }
  
  throw new Error('Item not found');
};

export const deleteItem = async (id: number): Promise<void> => {
  const sessions: Session[] = JSON.parse(localStorage.getItem('sessions') || '[]');
  
  for (const session of sessions) {
    if (session.items) {
      session.items = session.items.filter(i => i.id !== id);
    }
  }
  
  localStorage.setItem('sessions', JSON.stringify(sessions));
};

// Receipt Upload (mock)
export const uploadReceipt = async (_sessionId: number, _file: File): Promise<any> => {
  // In local mode, we'll just return a mock response
  return {
    message: 'Receipt processing not available in demo mode. Please add items manually.',
    items: []
  };
};

// Settlement Management
export const saveSettlements = async (sessionId: number, settlements: Settlement[]): Promise<void> => {
  const sessions: Session[] = JSON.parse(localStorage.getItem('sessions') || '[]');
  const session = sessions.find(s => s.id === sessionId);
  
  if (!session) throw new Error('Session not found');
  
  session.settlements = settlements;
  localStorage.setItem('sessions', JSON.stringify(sessions));
};

export default {
  register,
  login,
  getCurrentUser,
  getSessions,
  getSession,
  createSession,
  deleteSession,
  addParticipant,
  updateParticipant,
  deleteParticipant,
  addItem,
  updateItem,
  deleteItem,
  uploadReceipt,
  saveSettlements
};
