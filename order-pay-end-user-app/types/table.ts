// Table request/response types
export interface JoinTableRequest {
  userIdentifier: string;
  userType: "guest" | "logged";
}

export interface JoinTableResponse {
  session: TableSession;
  message: string;
}

export interface Table {
  id: string;
  name: string;
  qrCode: string;
}

export interface TableSession {
  id: string;
  table: Table;
  users: Array<{
    id: string;
    name: string;
    email: string;
    isGuest: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface TableUser {
  id: string;
  name: string;
  email: string;
  isGuest: boolean;
}
