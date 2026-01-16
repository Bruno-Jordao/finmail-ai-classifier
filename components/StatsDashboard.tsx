
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { EmailRecord, EmailCategory } from '../types';

interface StatsDashboardProps {
  records: EmailRecord[];
}

const StatsDashboard: React.FC<StatsDashboardProps> = ({ records }) => {
  const produtivoCount = records.filter(r => r.classification.category === EmailCategory.PRODUTIVO).length;
  const improdutivoCount = records.length - produtivoCount;

  const pieData = [
    { name: 'Produtivo', value: produtivoCount },
    { name: 'Improdutivo', value: improdutivoCount },
  ];

  const COLORS = ['#2563eb', '#94a3b8'];

  const priorityData = [
    { name: 'Alta', value: records.filter(r => r.classification.priority === 'Alta').length },
    { name: 'Média', value: records.filter(r => r.classification.priority === 'Média').length },
    { name: 'Baixa', value: records.filter(r => r.classification.priority === 'Baixa').length },
  ];

  if (records.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-sm font-bold text-gray-600 uppercase mb-4">Volume por Categoria</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center space-x-6 text-sm font-medium">
          <div className="flex items-center"><span className="w-3 h-3 bg-blue-600 rounded-full mr-2"></span> Produtivo</div>
          <div className="flex items-center"><span className="w-3 h-3 bg-slate-400 rounded-full mr-2"></span> Improdutivo</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-sm font-bold text-gray-600 uppercase mb-4">Prioridades Identificadas</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={priorityData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
              <YAxis hide />
              <Tooltip cursor={{fill: '#f8fafc'}} />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="text-center text-xs text-gray-400 mt-2">Distribuição de urgência por volume</div>
      </div>
    </div>
  );
};

export default StatsDashboard;
