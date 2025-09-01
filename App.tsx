
import React, { useState, useEffect, useCallback } from 'react';
import { Diagnosis } from './types';
import { getDiseaseInfo } from './services/geminiService';
import DiseaseInput from './components/DiseaseInput';
import DiagnosisResult from './components/DiagnosisResult';
import HistoryList from './components/HistoryList';
import StethoscopeIcon from './components/icons/StethoscopeIcon';
import ChatAssistant from './components/ChatAssistant';

const App: React.FC = () => {
  const [currentDiagnosis, setCurrentDiagnosis] = useState<Diagnosis | null>(null);
  const [diagnosisHistory, setDiagnosisHistory] = useState<Diagnosis[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'checker' | 'chat'>('checker');

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('diagnosisHistory');
      if (storedHistory) {
        setDiagnosisHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error("Failed to parse history from localStorage", e);
      setDiagnosisHistory([]);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('diagnosisHistory', JSON.stringify(diagnosisHistory));
    } catch (e) {
      console.error("Failed to save history to localStorage", e);
    }
  }, [diagnosisHistory]);

  const handleDiagnose = useCallback(async (diseaseName: string) => {
    if (!diseaseName.trim()) return;

    setIsLoading(true);
    setError(null);
    setCurrentDiagnosis(null);

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    try {
      const result = await getDiseaseInfo(diseaseName);
      setCurrentDiagnosis(result);

      setDiagnosisHistory(prevHistory => {
        const isAlreadyInHistory = prevHistory.some(
          item => item.name.toLowerCase() === result.name.toLowerCase()
        );
        if (!isAlreadyInHistory) {
          return [result, ...prevHistory];
        }
        return prevHistory;
      });
    } catch (err) {
      setError('No se pudo obtener la información. Por favor, inténtalo de nuevo.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSelectFromHistory = useCallback((diagnosis: Diagnosis) => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    setCurrentDiagnosis(diagnosis);
  }, []);
  
  const activeTabClasses = 'border-cyan-500 text-cyan-600 dark:text-cyan-400';
  const inactiveTabClasses = 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:border-slate-600';

  const renderView = () => {
    switch (view) {
      case 'checker':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            <aside className="lg:col-span-1 space-y-8">
              <div className="bg-white/60 dark:bg-slate-800/60 p-6 rounded-2xl shadow-lg backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
                <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">Nuevo Diagnóstico</h2>
                <DiseaseInput onSubmit={handleDiagnose} isLoading={isLoading} />
              </div>
              <div className="bg-white/60 dark:bg-slate-800/60 p-6 rounded-2xl shadow-lg backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
                <HistoryList history={diagnosisHistory} onSelect={handleSelectFromHistory} />
              </div>
            </aside>
            <section className="lg:col-span-2 bg-white/60 dark:bg-slate-800/60 p-6 md:p-8 rounded-2xl shadow-lg backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
              <DiagnosisResult diagnosis={currentDiagnosis} isLoading={isLoading} error={error} />
            </section>
          </div>
        );
      case 'chat':
        return <ChatAssistant />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen text-slate-800 dark:text-slate-200 font-sans">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <header className="text-center mb-10">
          <div className="flex items-center justify-center gap-4 mb-2">
            <StethoscopeIcon className="h-10 w-10 text-cyan-500" />
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
              Asistente Médico IA
            </h1>
          </div>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Tu herramienta inteligente para información médica.
          </p>
        </header>

        <main>
          <div className="mb-8 flex justify-center border-b border-slate-200/80 dark:border-slate-700/80">
            <button
              onClick={() => setView('checker')}
              className={`px-4 py-3 font-semibold text-lg border-b-2 transition-colors duration-200 ${view === 'checker' ? activeTabClasses : inactiveTabClasses}`}
              aria-current={view === 'checker' ? 'page' : undefined}
            >
              Verificador de Síntomas
            </button>
            <button
              onClick={() => setView('chat')}
              className={`px-4 py-3 font-semibold text-lg border-b-2 transition-colors duration-200 ${view === 'chat' ? activeTabClasses : inactiveTabClasses}`}
              aria-current={view === 'chat' ? 'page' : undefined}
            >
              Asistente de Chat
            </button>
          </div>
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default App;
