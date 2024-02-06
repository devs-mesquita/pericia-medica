export interface User {
  id: number;
  name: string;
  email: string;
  deleted_at: string;
  role: "Guest" | "User" | "Admin" | "Super-Admin";
}

export type AuthUser = { user: User } | null;

export type AppNotification = {
  message: string;
  type: "error" | "success" | "warning" | "";
};

export type Direcionamento = {
  id: number;
  name: string;
  config: string;
  atendimento_presencial: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string;
};

export type DirecionamentoConfig = {
  end: string | null;
  start: string | null;
  weekday:
    | "Doming"
    | "Segunda"
    | "Terça"
    | "Quarta"
    | "Quinta"
    | "Sexta"
    | "Sábado";
  isEnabled: boolean;
  weekdayIndex: 0 | 1 | 2 | 3 | 4 | 5 | 6;
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
    | "confirmado"
    | "realocado"
    | "reagendamento-solicitado";
  justificativa_requerente?: string;
  direcionamento_id?: number;
  avaliador_id: number;
  realocador_id: number;
  avaliado_at?: string;
  agenda_datetime?: string;
  observacao_avaliador?: string;
  justificativa_recusa?: string;
  justificativa_realocacao?: string;
  realocado_at?: string;
  envio_create?: number;
  envio_avaliacao?: number;
  envio_realocacao?: number;
  confirmado_at?: string;
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
    | "confirmado"
    | "realocado"
    | "reagendamento-solicitado";
  atestado_files: RequerimentoFile[];
  afastamento_files: RequerimentoFile[];
  avaliado_at?: string;
  agenda_datetime?: string;
  observacao_avaliador?: string;
  justificativa_recusa?: string;
  justificativa_realocacao?: string;
  realocado_at?: string;
  envio_create?: number;
  envio_avaliacao?: number;
  envio_realocacao?: number;
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
