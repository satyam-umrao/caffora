export type NotificationType = "booking" | "reminder" | "promo" | "account";

export type AppNotification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  data?: Record<string, any>;
  createdAt?: any;
};

export type SupportTicket = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  category: "booking" | "account" | "cafe" | "technical" | "other";
  message: string;
  status: "open" | "in_progress" | "resolved";
  createdAt?: any;
};
