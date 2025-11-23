export interface User {
  id: string;
  zona: string;
  area: string;
  telefone: string;
  senha: string;
}

export interface SystemParameters {
  produtividade: number;
  efetividade: number;
  mesAtual: string;
  semanaAtual: string;
  ultimaAtualizacao: string;
}

export interface ProductivityData {
  id: string;
  mes: string;
  semana: string;
  area: string;
  zona: string;
  dvv: string;
  resultado: string;
  ab: string; // (A/B)
}

export interface EffectivenessData {
  id: string;
  mes: string;
  semana: string;
  area: string;
  zona: string;
  dvv: string;
  resultado: string;
  ab: string; // (A/B)
}

export enum View {
  LOGIN = 'LOGIN',
  CHANGE_PASSWORD = 'CHANGE_PASSWORD',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD',
  USER_MANAGEMENT = 'USER_MANAGEMENT',
  SYSTEM_PARAMETERS = 'SYSTEM_PARAMETERS',
  DATA_LOADING_SELECTION = 'DATA_LOADING_SELECTION',
  DATA_LOADING = 'DATA_LOADING',
  DATA_LOADING_EFFECTIVENESS = 'DATA_LOADING_EFFECTIVENESS',
  COCKPIT = 'COCKPIT',
  PE_RESULTS = 'PE_RESULTS',
}