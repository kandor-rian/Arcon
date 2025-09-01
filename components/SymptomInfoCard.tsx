import React from 'react';
import { SymptomAnalysis } from '../types';
import CausesIcon from './icons/CausesIcon';
import CloseIcon from './icons/CloseIcon';
import SymptomsIcon from './icons/SymptomsIcon';
import MedicationIcon from './icons/MedicationIcon';

const SymptomInfoCard: React.FC<{ symptom: SymptomAnalysis; onClose: () => void }> = ({ symptom, onClose }) => {
  return (
    <div className="bg-white/80 dark:bg-slate-800/80 p-6 rounded-2xl shadow-lg backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 animate-fade-in relative">
      <button 
        onClick={onClose} 
        className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
        aria-label="Cerrar información de síntoma"
      >
        <CloseIcon className="h-6 w-6" />
      </button>
      
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
        Análisis de Síntoma: <span className="text-cyan-600 dark:text-cyan-400">{symptom.name}</span>
      </h3>
      
      <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">{symptom.description}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="space-y-2">
           <h4 className="flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
             <CausesIcon className="h-5 w-5" />
             Causas Comunes
           </h4>
           <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1">
             {symptom.causes.map((cause, index) => <li key={index}>{cause}</li>)}
           </ul>
        </div>
        <div className="space-y-2">
           <h4 className="flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
             <SymptomsIcon className="h-5 w-5" />
             Síntomas Asociados
           </h4>
           <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1">
             {symptom.symptoms.map((s, index) => <li key={index}>{s}</li>)}
           </ul>
        </div>
        <div className="space-y-2 lg:col-span-1">
           <h4 className="flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
             <MedicationIcon className="h-5 w-5" />
             Prevención y Tratamiento
           </h4>
           <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1">
             {symptom.prevention.map((p, index) => <li key={index}>{p}</li>)}
           </ul>
        </div>
      </div>

       <div className="mt-6 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-500/50">
          <p className="text-sm text-amber-700 dark:text-amber-300">
            <span className="font-bold">Recuerda:</span> Esta información es solo una guía. Consulta siempre a un profesional médico para un diagnóstico preciso.
          </p>
        </div>
    </div>
  );
};

export default SymptomInfoCard;
