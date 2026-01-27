export interface User {
  id: string;
  email: string;
  username: string;
}

export interface Participant {
  id: string;
  name: string;
  sessionId: string;
}

export interface ItemAssignment {
  id: string;
  lineItemId: string;
  participantId: string;
  participant: Participant;
}

export interface LineItem {
  id: string;
  sessionId: string;
  name: string;
  quantity: number;
  price: number;
  taxable: boolean;
  orderIndex: number;
  assignments: ItemAssignment[];
}

export interface Settlement {
  id: string;
  sessionId: string;
  participantId: string;
  participantName: string;
  amountOwed: number;
  amountPaid: number;
  settled: boolean;
  settledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BillSplitSession {
  id: string;
  name: string;
  userId: string;
  receiptUrl?: string;
  totalAmount: number;
  taxAmount: number;
  archived: boolean;
  archivedAt?: string;
  createdAt: string;
  updatedAt: string;
  participants: Participant[];
  lineItems: LineItem[];
  settlements?: Settlement[];
}

export interface ParticipantTotal {
  participantId: string;
  name: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  items: Array<{
    name: string;
    price: number;
    splitCount: number;
    share: number;
  }>;
}

export interface SplitCalculation {
  participants: ParticipantTotal[];
  summary: {
    subtotal: number;
    tax: number;
    total: number;
    roundingError: number;
  };
}
