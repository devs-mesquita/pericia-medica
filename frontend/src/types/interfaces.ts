export interface User {
  name: string;
  cpf: string;
  email: string;
  role: "Guest" | "User" | "Admin" | "Super-Admin";
}

export type AppNotification = {
  message: string;
  type: "error" | "success" | "warning" | "";
};
