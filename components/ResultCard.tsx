
import React from 'react';
import { EmailClassification, EmailCategory } from '../types';

interface ResultCardProps {
  data: EmailClassification;
  onCopy: (text: string) => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ data, onCopy }) => {
  const isProdutivo = data.category === EmailCategory.PRODUTIVO;
  
  const priorityColors = {
    'Baixa': 'bg-blue-100 text-blue-800',
    'Média': 'bg-yellow-100 text-yellow-800',
    'Alta': 'bg-red-100 text-red-800',
  };

  const sentimentColors = {
    'Positivo': 'text-green-600',
    'Neutro': 'text-gray-500',
    'Negativo': 'text-red-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className={`px-6 py-4 border-b ${isProdutivo ? 'bg-indigo-50 border-indigo-100' : 'bg-gray-50 border-gray-200'}`}>
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold tracking-wide uppercase ${isProdutivo ? 'bg-indigo-600 text-white' : 'bg-gray-400 text-white'}`}>
              {data.category}
            </span>
            <h3 className="text-xl font-bold text-gray-900 mt-2">{data.summary}</h3>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <span className={`px-2.5 py-0.5 rounded text-xs font-semibold ${priorityColors[data.priority]}`}>
              Prioridade {data.priority}
            </span>
            <span className={`text-xs font-medium flex items-center ${sentimentColors[data.sentiment]}`}>
              <span className="mr-1">Tom:</span> {data.sentiment}
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div>
          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Justificativa da IA</h4>
          <p className="text-gray-700 italic border-l-4 border-blue-400 pl-4 py-1">{data.reason}</p>
        </div>

        <div className="relative group">
          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Sugestão de Resposta</h4>
          <div className="bg-gray-900 text-gray-100 p-5 rounded-lg font-mono text-sm relative">
            <button 
              onClick={() => onCopy(data.suggestedResponse)}
              className="absolute top-4 right-4 p-2 bg-gray-800 rounded hover:bg-gray-700 transition-colors text-gray-400 hover:text-white"
              title="Copiar resposta"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            <pre className="whitespace-pre-wrap leading-relaxed">{data.suggestedResponse}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
