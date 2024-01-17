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

export interface AppDialog {
  isOpen: boolean;
  message: string;
  accept: () => void;
  reject: () => void;
}

export type Direcionamento = {
  id: number;
  name: string;
  config: string;
  atendimento_presencial: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string;
};
