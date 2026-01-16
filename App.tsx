
import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import EmailInput from './components/EmailInput';
import ResultCard from './components/ResultCard';
import StatsDashboard from './components/StatsDashboard';
import HistoryList from './components/HistoryList';
import { EmailRecord, EmailClassification, BatchState, EmailCategory } from './types';
import { classifyEmail } from './services/emailClassifierService';

const App: React.FC = () => {
  const [records, setRecords] = useState<EmailRecord[]>([]);
  const [currentResult, setCurrentResult] = useState<EmailClassification | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('Todos');
  const [batchState, setBatchState] = useState<BatchState>({
    isProcessing: false,
    total: 0,
    current: 0,
    errors: 0
  });

  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      const matchesSearch = record.classification.summary.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           record.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'Todos' || record.classification.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [records, searchTerm, filterCategory]);

  const handleProcessEmail = async (text: string) => {
    setLoading(true);
    setError(null);
    try {
      const classification = await classifyEmail(text);
      const newRecord: EmailRecord = {
        id: crypto.randomUUID(),
        content: text,
        timestamp: Date.now(),
        classification
      };
      setCurrentResult(classification);
      setRecords(prev => [newRecord, ...prev]);
    } catch (err: any) {
      const errorMessage = err?.message || "Erro na classificação. Verifique sua conexão.";
      setError(errorMessage);
      console.error("Erro ao classificar email:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchProcess = async (texts: string[]) => {
    setBatchState({ isProcessing: true, total: texts.length, current: 0, errors: 0 });
    
    for (let i = 0; i < texts.length; i++) {
      try {
        const classification = await classifyEmail(texts[i]);
        const newRecord: EmailRecord = {
          id: crypto.randomUUID(),
          content: texts[i],
          timestamp: Date.now(),
          classification
        };
        setRecords(prev => [newRecord, ...prev]);
        setBatchState(prev => ({ ...prev, current: i + 1 }));
      } catch (err: any) {
        setBatchState(prev => ({ ...prev, errors: prev.errors + 1, current: i + 1 }));
        // Se for erro de rate limit, aumentar delay
        if (err?.message?.includes("429") || err?.message?.toLowerCase().includes("quota") || err?.message?.toLowerCase().includes("limite")) {
          await new Promise(resolve => setTimeout(resolve, 5000)); // 5 segundos para rate limit
        }
      }
      // Delay entre requisições para evitar rate limits (aumentado para free tier)
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 segundos entre requisições
    }
    setBatchState(prev => ({ ...prev, isProcessing: false }));
  };

  const exportToCSV = () => {
    const headers = ["Data", "Categoria", "Resumo", "Prioridade", "Sentimento", "Resposta Sugerida"];
    const rows = records.map(r => [
      new Date(r.timestamp).toLocaleString(),
      r.classification.category,
      r.classification.summary.replace(/,/g, ';'),
      r.classification.priority,
      r.classification.sentiment,
      r.classification.suggestedResponse.replace(/(\r\n|\n|\r)/gm, " ").replace(/,/g, ';')
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `finmail_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-7 space-y-8">
            <section>
              <EmailInput 
                onProcess={handleProcessEmail} 
                onBatchProcess={handleBatchProcess}
                isLoading={loading} 
                batchState={batchState}
              />
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}
            </section>

            <section className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900">Analytics de Fluxo</h2>
                <div className="flex space-x-2">
                   <button 
                    onClick={exportToCSV}
                    disabled={records.length === 0}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M16 8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Exportar Relatório
                  </button>
                </div>
              </div>
              <StatsDashboard records={records} />
            </section>
          </div>

          <div className="lg:col-span-5 space-y-8">
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Análise Detalhada</h2>
              {currentResult ? (
                <ResultCard data={currentResult} onCopy={(t) => navigator.clipboard.writeText(t)} />
              ) : (
                <div className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-12 text-center text-gray-400">
                  Selecione um email abaixo para ver detalhes.
                </div>
              )}
            </section>

            <section className="space-y-4">
              <div className="flex flex-col space-y-4">
                <h2 className="text-lg font-bold text-gray-900">Histórico e Auditoria</h2>
                <div className="flex space-x-2">
                  <div className="relative flex-grow">
                    <input 
                      type="text"
                      placeholder="Buscar conteúdo..."
                      className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <select 
                    className="text-sm border border-gray-300 rounded-lg px-2 outline-none focus:ring-1 focus:ring-blue-500"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                  >
                    <option value="Todos">Todos</option>
                    <option value={EmailCategory.PRODUTIVO}>Produtivos</option>
                    <option value={EmailCategory.IMPRODUTIVO}>Improdutivos</option>
                  </select>
                </div>
              </div>
              <HistoryList records={filteredRecords} onSelect={(r) => setCurrentResult(r.classification)} />
            </section>
          </div>
        </div>
      </main>
      
      <footer className="bg-white border-t border-gray-200 py-6 mt-12 text-center">
        <p className="text-xs text-gray-400">FinMail Enterprise - v2.0 Batch Support Enabled</p>
      </footer>
    </div>
  );
};

export default App;
