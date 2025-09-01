import React, { useEffect, useState, useRef } from 'react';
import { Diagnosis } from '../types';
import InfoIcon from './icons/InfoIcon';
import CausesIcon from './icons/CausesIcon';
import SymptomsIcon from './icons/SymptomsIcon';
import MedicationIcon from './icons/MedicationIcon';
import PlayIcon from './icons/PlayIcon';
import StopIcon from './icons/StopIcon';

interface DiagnosisResultProps {
  diagnosis: Diagnosis | null;
  isLoading: boolean;
  error: string | null;
}

interface SectionCardProps {
  title: string;
  icon: React.ReactNode;
  isCurrent: boolean;
  children: React.ReactNode;
  onTitleClick?: () => void;
}

const SectionCard: React.ForwardRefRenderFunction<HTMLDivElement, SectionCardProps> = ({ title, icon, isCurrent, children, onTitleClick }, ref) => (
  <div 
    ref={ref} 
    className={`p-5 rounded-2xl transition-all duration-500 transform-gpu ${isCurrent ? 'bg-cyan-50 dark:bg-cyan-900/50 ring-2 ring-cyan-500 shadow-lg scale-105' : 'bg-slate-100/80 dark:bg-slate-800/80'}`}
  >
    <h3 className="flex items-center gap-3 text-xl font-bold text-slate-800 dark:text-slate-100 mb-3">
      {icon}
      {onTitleClick ? (
        <button
          onClick={onTitleClick}
          className="text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400 transition-colors text-left focus:outline-none focus:underline"
          aria-label={`Leer sección ${title}`}
        >
          {title}
        </button>
      ) : (
        <span>{title}</span>
      )}
    </h3>
    <div className="text-slate-600 dark:text-slate-300 leading-relaxed">
      {children}
    </div>
  </div>
);

const ForwardedSectionCard = React.forwardRef(SectionCard);

const DiagnosisResult: React.FC<DiagnosisResultProps> = ({ diagnosis, isLoading, error }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSection, setCurrentSection] = useState<string | null>(null);

  const descriptionRef = useRef<HTMLDivElement>(null);
  const causesRef = useRef<HTMLDivElement>(null);
  const symptomsRef = useRef<HTMLDivElement>(null);
  const medicationsRef = useRef<HTMLDivElement>(null);

  const handleSectionSpeak = (textToSpeak: string, sectionKey: string) => {
    if (!diagnosis) return;

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'es-ES';

    utterance.onstart = () => {
      setIsSpeaking(true);
      setCurrentSection(sectionKey);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentSection(null);
    };

    utterance.onerror = (event) => {
      console.error("SpeechSynthesisUtterance.onerror", event);
      setIsSpeaking(false);
      setCurrentSection(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const startNarration = () => {
    if (!diagnosis) return;

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    
    const sections = [
      { key: 'description', text: `Descripción: ${diagnosis.description}`, ref: descriptionRef },
      { key: 'causes', text: `Las causas comunes incluyen: ${diagnosis.causes.join(', ')}`, ref: causesRef },
      { key: 'symptoms', text: `Los síntomas comunes son: ${diagnosis.symptoms.join(', ')}`, ref: symptomsRef },
      { key: 'medications', text: `Tratamientos y medicamentos comunes: ${diagnosis.medications.join(', ')}. Recuerda, esta información es generada por inteligencia artificial y no reemplaza la consulta con un profesional médico.`, ref: medicationsRef }
    ];

    let currentIndex = 0;

    const speakNext = () => {
      if (currentIndex >= sections.length) {
        setIsSpeaking(false);
        setCurrentSection(null);
        return;
      }

      const section = sections[currentIndex];
      
      const utterance = new SpeechSynthesisUtterance(section.text);
      utterance.lang = 'es-ES';
      
      utterance.onstart = () => {
        setIsSpeaking(true);
        setCurrentSection(section.key);
        section.ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      };

      utterance.onend = () => {
        currentIndex++;
        speakNext();
      };

      utterance.onerror = (event) => {
        console.error("SpeechSynthesisUtterance.onerror", event);
        setIsSpeaking(false);
        setCurrentSection(null);
      };
      
      window.speechSynthesis.speak(utterance);
    };

    speakNext();
  };

  useEffect(() => {
    // Stop speaking when component unmounts or diagnosis changes
    return () => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      setCurrentSection(null);
    };
  }, [diagnosis]);

  const handleSpeechToggle = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setCurrentSection(null);
    } else if (diagnosis) {
      startNarration();
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
        <div className="w-16 h-16 border-4 border-t-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">La IA está pensando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-red-50 dark:bg-red-900/20 p-6 rounded-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <p className="mt-4 text-lg font-semibold text-red-700 dark:text-red-300">Ocurrió un Error</p>
        <p className="text-red-600 dark:text-red-400 text-center">{error}</p>
      </div>
    );
  }

  if (!diagnosis) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <p className="mt-4 text-xl text-slate-500 dark:text-slate-400">Los resultados de tu diagnóstico aparecerán aquí.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white pb-2">{diagnosis.name}</h2>

      {diagnosis && (
        <div className="flex justify-center">
          <button 
            onClick={handleSpeechToggle} 
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-cyan-600 text-white font-semibold hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 dark:focus:ring-offset-slate-800 transition-all duration-200 shadow-lg hover:shadow-cyan-500/50"
            aria-label={isSpeaking ? 'Detener lectura' : 'Leer en voz alta el diagnóstico completo'}
          >
            {isSpeaking ? <StopIcon className="h-6 w-6" /> : <PlayIcon className="h-6 w-6" />}
            <span>{isSpeaking ? 'Detener Lectura' : 'Leer Diagnóstico'}</span>
          </button>
        </div>
      )}
      
      <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-500/50 flex items-start gap-3">
        <span className="text-xl mt-1 text-amber-600 dark:text-amber-400">⚠️</span>
        <div>
          <p className="font-bold text-amber-800 dark:text-amber-200">Descargo de responsabilidad:</p>
          <p className="text-amber-700 dark:text-amber-300">Esta información es generada por IA y es solo para fines educativos. No sustituye el consejo, diagnóstico o tratamiento de un médico profesional. Siempre consulte a su médico.</p>
        </div>
      </div>

      <div className="space-y-4">
        <ForwardedSectionCard 
            ref={descriptionRef} 
            title="Descripción" 
            icon={<InfoIcon />} 
            isCurrent={currentSection === 'description'}
            onTitleClick={() => handleSectionSpeak(diagnosis.description, 'description')}
        >
            <p>{diagnosis.description}</p>
        </ForwardedSectionCard>
        
        <ForwardedSectionCard 
            ref={causesRef} 
            title="Causas" 
            icon={<CausesIcon />} 
            isCurrent={currentSection === 'causes'}
            onTitleClick={() => handleSectionSpeak(`Las causas comunes incluyen: ${diagnosis.causes.join(', ')}`, 'causes')}
        >
          <ul className="list-disc list-inside space-y-2">
            {diagnosis.causes.map((cause, index) => <li key={index}>{cause}</li>)}
          </ul>
        </ForwardedSectionCard>
        
        <ForwardedSectionCard 
            ref={symptomsRef} 
            title="Síntomas" 
            icon={<SymptomsIcon />} 
            isCurrent={currentSection === 'symptoms'}
            onTitleClick={() => handleSectionSpeak(`Los síntomas comunes son: ${diagnosis.symptoms.join(', ')}`, 'symptoms')}
        >
          <ul className="list-disc list-inside space-y-2">
            {diagnosis.symptoms.map((symptom, index) => <li key={index}>{symptom}</li>)}
          </ul>
        </ForwardedSectionCard>

        <ForwardedSectionCard 
            ref={medicationsRef} 
            title="Tratamientos y Medicamentos Comunes" 
            icon={<MedicationIcon />} 
            isCurrent={currentSection === 'medications'}
            onTitleClick={() => handleSectionSpeak(`Tratamientos y medicamentos comunes: ${diagnosis.medications.join(', ')}. Recuerda, esta información es generada por inteligencia artificial y no reemplaza la consulta con un profesional médico.`, 'medications')}
        >
          <ul className="list-disc list-inside space-y-2">
            {diagnosis.medications.map((med, index) => <li key={index}>{med}</li>)}
          </ul>
        </ForwardedSectionCard>
      </div>
    </div>
  );
};

export default DiagnosisResult;