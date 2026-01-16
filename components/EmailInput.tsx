import React, { useState, useRef } from 'react';

interface EmailInputProps {
  onProcess: (text: string) => Promise<void>;
  onBatchProcess: (texts: string[]) => Promise<void>;
  isLoading: boolean;
  batchState: { isProcessing: boolean; total: number; current: number };
}

const EmailInput: React.FC<EmailInputProps> = ({ onProcess, onBatchProcess, isLoading, batchState }) => {
  const [inputText, setInputText] = useState('');
  const [activeTab, setActiveTab] = useState<'single' | 'batch'>('single');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;

      const emails = content
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line.length > 10);

      onBatchProcess(emails);
    };

    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onProcess(inputText);
    }
  };

  const progressPercentage =
    batchState.total > 0 ? (batchState.current / batchState.total) * 100 : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setActiveTab('single')}
          className={`flex-1 py-3 px-4 text-sm font-semibold ${
            activeTab === 'single'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
              : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          Entrada Individual
        </button>
        <button
          onClick={() => setActiveTab('batch')}
          className={`flex-1 py-3 px-4 text-sm font-semibold ${
            activeTab === 'batch'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
              : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          Processamento em Lote (TXT)
        </button>
      </div>

      <div className="p-6">
        {activeTab === 'single' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              className="w-full h-40 p-4 border border-gray-300 rounded-lg"
              placeholder="Cole aqui o conteúdo do email financeiro..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isLoading || batchState.isProcessing}
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim() || batchState.isProcessing}
              className="w-full px-8 py-2.5 rounded-lg text-white bg-blue-600 disabled:bg-gray-400"
            >
              {isLoading ? 'Analisando...' : 'Classificar Email'}
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="border-2 border-dashed rounded-xl p-8 text-center">
              <input
                type="file"
                accept=".txt"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileUpload}
                disabled={batchState.isProcessing}
              />
              <h3 className="text-lg font-medium">Upload de Arquivo</h3>
              <p className="text-sm text-gray-500">
                Selecione um arquivo TXT com um email por linha
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 px-6 py-2 border rounded-lg"
              >
                Escolher Arquivo
              </button>
            </div>

            {batchState.isProcessing && (
              <div>
                <p>{batchState.current} / {batchState.total}</p>
                <div className="w-full bg-gray-200 h-2.5">
                  <div
                    className="bg-blue-600 h-2.5"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailInput;

