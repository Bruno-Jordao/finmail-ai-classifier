
import React from 'react';
import { EmailRecord, EmailCategory } from '../types';

interface HistoryListProps {
  records: EmailRecord[];
  onSelect: (record: EmailRecord) => void;
}

const HistoryList: React.FC<HistoryListProps> = ({ records, onSelect }) => {
  if (records.length === 0) return (
    <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-200">
      <p className="text-gray-400">Nenhum email processado ainda.</p>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Resumo</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Prioridade</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Horário</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {records.map((record) => (
              <tr 
                key={record.id} 
                className="hover:bg-blue-50 cursor-pointer transition-colors"
                onClick={() => onSelect(record)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    record.classification.category === EmailCategory.PRODUTIVO 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-800'
                  }`}>
                    {record.classification.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs truncate">
                  {record.classification.summary}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {record.classification.priority}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistoryList;
