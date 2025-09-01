import React, { useState, useEffect } from 'react';
import { getDiseaseInfo } from '../services/geminiService';
import { Diagnosis } from '../types';

interface LabeledTextareaProps {
    id: string;
    label: string;
    value: string;
    rows?: number;
}

const LabeledTextarea: React.FC<LabeledTextareaProps> = ({ id, label, value, rows = 4 }) => (
  <div>
    <label htmlFor={id} className="block text-lg font-semibold mb-2 text-slate-800 dark:text-slate-200">
      {label}
    </label>
    <textarea
      id={id}
      rows={rows}
      className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-100/80 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-200"
      value={value}
      readOnly
      placeholder={`La IA generará la ${label.toLowerCase()} aquí...`}
    />
  </div>
);

interface DiseaseGeneratorProps {
    diagnosisHistory: Diagnosis[];
    setDiagnosisHistory: React.Dispatch<React.SetStateAction<Diagnosis[]>>;
}

const DiseaseGenerator: React.FC<DiseaseGeneratorProps> = ({ diagnosisHistory, setDiagnosisHistory }) => {
    const [diseaseName, setDiseaseName] = useState('');
    const [generatedData, setGeneratedData] = useState<Diagnosis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSaved, setIsSaved] = useState(false);
    
    useEffect(() => {
        if (generatedData) {
            const isAlreadyInHistory = diagnosisHistory.some(
                item => item.name.toLowerCase() === generatedData.name.toLowerCase()
            );
            setIsSaved(isAlreadyInHistory);
        } else {
            setIsSaved(false);
        }
    }, [generatedData, diagnosisHistory]);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!diseaseName.trim() || isLoading) return;
        
        setIsLoading(true);
        setError(null);
        setGeneratedData(null);
        setIsSaved(false);

        try {
            const result = await getDiseaseInfo(diseaseName);
            setGeneratedData(result);
        } catch (err) {
            setError('No se pudo generar el contenido. Puede que la enfermedad no se reconozca o que haya ocurrido un error de red.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = () => {
        if (!generatedData || isSaved) return;

        setDiagnosisHistory(prevHistory => {
            const isAlreadyInHistory = prevHistory.some(
                item => item.name.toLowerCase() === generatedData.name.toLowerCase()
            );
            if (!isAlreadyInHistory) {
                return [generatedData, ...prevHistory];
            }
            return prevHistory;
        });
        setIsSaved(true);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div className="bg-white/60 dark:bg-slate-800/60 p-6 rounded-2xl shadow-lg backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
                <h2 className="text-2xl font-semibold mb-2 text-slate-900 dark:text-white">Generador de Contenido sobre Enfermedades</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                    Introduce el nombre de una enfermedad y la IA rellenará automáticamente la descripción, las causas y los síntomas.
                </p>
                <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="text"
                        value={diseaseName}
                        onChange={(e) => setDiseaseName(e.target.value)}
                        placeholder="ej., Neumonía, Asma"
                        className="flex-grow w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-700/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-200"
                        disabled={isLoading}
                        aria-label="Nombre de la enfermedad para generar contenido"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !diseaseName.trim()}
                        className="px-6 py-3 rounded-lg bg-cyan-600 text-white font-semibold hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 dark:focus:ring-offset-slate-800 disabled:bg-slate-400 disabled:dark:bg-slate-600 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Generando...
                            </>
                        ) : 'Generar Contenido'}
                    </button>
                </form>
            </div>
            
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-red-700 dark:text-red-300 text-center font-semibold">
                    {error}
                </div>
            )}

            <div className="bg-white/60 dark:bg-slate-800/60 p-6 md:p-8 rounded-2xl shadow-lg backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
                <div className="space-y-6">
                    <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-500/50 flex items-start gap-3">
                         <span className="text-xl mt-1 text-amber-600 dark:text-amber-400">⚠️</span>
                        <div>
                            <p className="font-bold text-amber-800 dark:text-amber-200">Descargo de responsabilidad:</p>
                            <p className="text-amber-700 dark:text-amber-300">La información generada es solo para fines educativos y no sustituye el consejo de un médico profesional.</p>
                        </div>
                    </div>

                    <LabeledTextarea id="description" label="Descripción" value={generatedData?.description ?? ''} rows={5} />
                    <LabeledTextarea id="causes" label="Causas" value={generatedData?.causes.join('\n') ?? ''} />
                    <LabeledTextarea id="symptoms" label="Síntomas (Efectos)" value={generatedData?.symptoms.join('\n') ?? ''} />
                    <LabeledTextarea id="medications" label="Medicamentos y Tratamientos Comunes" value={generatedData?.medications.join('\n') ?? ''} />
                    
                    {generatedData && (
                        <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
                             <button
                                onClick={handleSave}
                                disabled={isSaved}
                                className="px-6 py-3 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 dark:focus:ring-offset-slate-800 disabled:bg-slate-400 disabled:dark:bg-slate-600 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center"
                            >
                                {isSaved ? 'Guardado' : 'Guardar Diagnóstico'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DiseaseGenerator;