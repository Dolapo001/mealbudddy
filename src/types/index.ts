export type Role = "user" | "admin" | "super_admin";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  studentId: string;
  department: string;
  role: Role;
  isEmailVerified: boolean;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}
