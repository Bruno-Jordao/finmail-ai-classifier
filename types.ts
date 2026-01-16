
export enum EmailCategory {
  PRODUTIVO = 'Produtivo',
  IMPRODUTIVO = 'Improdutivo'
}

export interface EmailClassification {
  category: EmailCategory;
  reason: string;
  summary: string;
  suggestedResponse: string;
  priority: 'Baixa' | 'Média' | 'Alta';
  sentiment: 'Positivo' | 'Neutro' | 'Negativo';
}

export interface EmailRecord {
  id: string;
  content: string;
  timestamp: number;
  classification: EmailClassification;
}

export interface BatchState {
  isProcessing: boolean;
  total: number;
  current: number;
  errors: number;
}
