export interface Sport {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  active: boolean;
}

export interface ActiveSubscription {
  id: string;
  sportId: string;
  sportName: string;
  planType: string;
  status: string;
  startDate: string;
  endDate: string;
}

export interface Invoice {
  id: string;
  subscriptionId: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: string;
  dueDate: string;
  paidAt?: string;
  paymentMethod?: string;
  description?: string;
}

export interface SubscriptionMember {
  id: string;
  subscriptionId: string;
  userId: string;
  role: string;
  joinedAt: string;
  userName?: string; // Optional field for display
  userEmail?: string; // Optional field for display
}

export interface SubscribeRequest {
  userId: string;
  planType: string;
  amount: number;
  sportId: string;
}
