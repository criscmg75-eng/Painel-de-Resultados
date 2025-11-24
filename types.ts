export interface User {
  id: string;
  zona: string;
  area: string;
  telefone: string;
  senha: string;
  tipoacesso: string;
}

export interface SystemParameters {
  produtividade: number;
  efetividade: number;
  mesAtual: string;
  semanaAtual: string;
  ultimaAtualizacao: string;
  ponderacaoProdutividade: number;
  ponderacaoEfetividade: number;
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

export interface ProductTotalZvSemData {
  id: string;
  mes: string;
  semana: string;
  area: string;
  zona: string;
  resultado: string;
  ab: string; // (A/B)
}

export interface ProductTotalTvDiaData {
  id: string;
  mes: string;
  semana: string;
  area: string;
  dvv: string;
  resultado: string;
  ab: string; // (A/B)
}

export interface ProductTotalTvSemData {
  id: string;
  mes: string;
  semana: string;
  area: string;
  resultado: string;
  ab: string; // (A/B)
}

export interface EffectTotalZvSemData {
  id: string;
  mes: string;
  semana: string;
  area: string;
  zona: string;
  resultado: string;
  ab: string; // (A/B)
}

export interface EffectTotalTvDiaData {
  id: string;
  mes: string;
  semana: string;
  area: string;
  dvv: string;
  resultado: string;
  ab: string; // (A/B)
}

export interface EffectTotalTvSemData {
  id: string;
  mes: string;
  semana: string;
  area: string;
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
  DATA_LOADING_PRODUCTIVITY_SELECTION = 'DATA_LOADING_PRODUCTIVITY_SELECTION',
  DATA_LOADING_EFFECTIVENESS_SELECTION = 'DATA_LOADING_EFFECTIVENESS_SELECTION',
  DATA_LOADING = 'DATA_LOADING',
  DATA_LOADING_EFFECTIVENESS = 'DATA_LOADING_EFFECTIVENESS',
  DATA_LOADING_PRODUCTIVITY_WEEKLY_ZONE = 'DATA_LOADING_PRODUCTIVITY_WEEKLY_ZONE',
  DATA_LOADING_PRODUCTIVITY_DAILY_AREA = 'DATA_LOADING_PRODUCTIVITY_DAILY_AREA',
  DATA_LOADING_PRODUCTIVITY_WEEKLY_AREA = 'DATA_LOADING_PRODUCTIVITY_WEEKLY_AREA',
  DATA_LOADING_EFFECTIVENESS_WEEKLY_ZONE = 'DATA_LOADING_EFFECTIVENESS_WEEKLY_ZONE',
  DATA_LOADING_EFFECTIVENESS_DAILY_AREA = 'DATA_LOADING_EFFECTIVENESS_DAILY_AREA',
  DATA_LOADING_EFFECTIVENESS_WEEKLY_AREA = 'DATA_LOADING_EFFECTIVENESS_WEEKLY_AREA',
  COCKPIT = 'COCKPIT',
  PE_SELECTION = 'PE_SELECTION',
  PE_RESULTS = 'PE_RESULTS',
  RANKING_PE = 'RANKING_PE',
}