export interface User {
  id: number;
  name: string;
  email: string;
  deleted_at: string;
  role: "Guest" | "User" | "Admin" | "Super-Admin";
}

export type AppNotification = {
  message: string;
  type: "error" | "success" | "warning" | "";
};

export interface AppDialog {
  isOpen: boolean;
  isPending: boolean;
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

export type RequerimentoFile = {
  id: number;
  filename: string;
  extension: string;
  created_at: string;
  updated_at: string;
  requerimento_id: number;
};

export type Reagendamento = {
  id: number;
  requerimento_id: number;
  status:
    | "em-analise"
    | "aguardando-confirmacao"
    | "recusado"
    | "realocado"
    | "reagendamento-solicitado";
  justificativa_requerente?: string;
  direcionamento_id?: number;
  avaliador_id: number;
  realocador_id: number;
  envio_create?: boolean;
  avaliado_at?: string;
  agenda_datetime?: string;
  observacao_avaliador?: string;
  justificativa_recusa?: string;
  justificativa_realocacao?: string;
  realocado_at?: string;
  envio_avaliacao?: boolean;
  envio_realocacao?: boolean;
  confirmato_at?: string;
  presenca?: boolean;
  reagendamento_solicitado_at?: string;
  created_at: string;
  updated_at: string;
  requerimento: Requerimento;
  direcionamento?: Direcionamento;
  avaliador?: User;
  realocador?: User;
};

export type Requerimento = {
  id: number;
  nome: string;
  matricula: string;
  local_lotacao: string;
  inicio_expediente: string;
  fim_expediente: string;
  email: string;
  inicio_atestado_date: string;
  acumula_matricula: boolean;
  last_movement_at: string;
  protocolo: string;
  status:
    | "em-analise"
    | "aguardando-confirmacao"
    | "recusado"
    | "realocado"
    | "reagendamento-solicitado";
  atestado_files: RequerimentoFile[];
  afatastamento_files: RequerimentoFile[];
  avaliado_at?: string;
  agenda_datetime?: string;
  observacao_avaliador?: string;
  justificativa_recusa?: string;
  justificativa_realocacao?: string;
  realocado_at?: string;
  envio_create?: boolean;
  envio_avaliacao?: boolean;
  envio_realocacao?: boolean;
  confirmado_at?: string;
  presenca?: boolean;
  reagendamento_solicitado_at?: string;
  direcionamento_id?: number;
  direcionamento?: Direcionamento;
  reagendamentos: Reagendamento[];
  avaliador?: User;
  realocador?: User;
  avaliador_id?: number;
  realocador_id?: number;
  created_at: string;
  updated_at: string;
};
