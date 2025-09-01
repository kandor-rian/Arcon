import React, { useState, useRef, useEffect } from 'react';
import { analyzeAudio } from '../services/geminiService';
import { SymptomAnalysis } from '../types';
import StethoscopeIcon from './icons/StethoscopeIcon';
import SymptomInfoCard from './SymptomInfoCard';
import MicrophoneIcon from './icons/MicrophoneIcon';
import StopIcon from './icons/StopIcon';

type Status = 'idle' | 'listening' | 'processing' | 'speaking';

const ChatAssistant: React.FC = () => {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [symptomInfo, setSymptomInfo] = useState<SymptomAnalysis | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      // Cleanup: stop speech synthesis and media recorder on unmount
      window.speechSynthesis.cancel();
      mediaRecorderRef.current?.stop();
    };
  }, []);

  const speakText = (text: string) => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.onstart = () => setStatus('speaking');
    utterance.onend = () => setStatus('idle');
    utterance.onerror = (event) => {
      console.error("SpeechSynthesisUtterance.onerror", event);
      setError('Hubo un error al reproducir la respuesta.');
      setStatus('idle');
    };
    window.speechSynthesis.speak(utterance);
  };

  const handleStartRecording = async () => {
    if (status !== 'idle') return;
    setSymptomInfo(null);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      
      recorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      recorder.onstop = async () => {
        setStatus('processing');
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          try {
            const result = await analyzeAudio(base64Audio, audioBlob.type);
            if (result.symptomAnalysis) {
              setSymptomInfo(result.symptomAnalysis);
              // Also speak a short confirmation
              speakText(`He detectado un síntoma: ${result.symptomAnalysis.name}. Aquí tienes más información.`);
            } else if (result.conversationalResponse) {
              speakText(result.conversationalResponse);
            } else {
               speakText("No pude entender eso. ¿Podrías intentarlo de nuevo?");
            }
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Ocurrió un error desconocido.';
            setError(errorMessage);
            setStatus('idle');
          }
        };
        // Stop all tracks on the stream to turn off the mic indicator
        stream.getTracks().forEach(track => track.stop());
      };
      
      recorder.start();
      setStatus('listening');
    } catch (err) {
      setError('No se pudo acceder al micrófono. Por favor, comprueba los permisos.');
      console.error('Error accessing microphone:', err);
    }
  };

  const handleStopRecording = () => {
    mediaRecorderRef.current?.stop();
  };

  const handleInterrupt = () => {
    window.speechSynthesis.cancel();
    setStatus('idle');
  };

  const renderControls = () => {
    switch (status) {
      case 'listening':
        return (
          <button
            onClick={handleStopRecording}
            className="px-8 py-4 rounded-full bg-red-600 text-white font-semibold text-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-slate-800 transition-all duration-200 flex items-center gap-3"
          >
            <StopIcon className="h-6 w-6" />
            Terminar de hablar
          </button>
        );
      case 'speaking':
        return (
          <button
            onClick={handleInterrupt}
            className="px-8 py-4 rounded-full bg-amber-500 text-white font-semibold text-lg hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 dark:focus:ring-offset-slate-800 transition-all duration-200"
          >
            Interrumpir
          </button>
        );
      case 'idle':
      default:
        return (
          <button
            onClick={handleStartRecording}
            className="px-8 py-4 rounded-full bg-cyan-600 text-white font-semibold text-lg hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 dark:focus:ring-offset-slate-800 transition-all duration-200 flex items-center gap-3"
          >
            <MicrophoneIcon className="h-6 w-6" />
            Hablar con Gema
          </button>
        );
       case 'processing':
        return (
          <button
            disabled
            className="px-8 py-4 rounded-full bg-slate-400 text-white font-semibold text-lg transition-all duration-200 flex items-center gap-3 cursor-wait"
          >
            <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Procesando...
          </button>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in space-y-4">
      <div className="bg-white/60 dark:bg-slate-800/60 p-4 md:p-6 rounded-2xl shadow-lg backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 flex flex-col h-[60vh] justify-center items-center text-center">
        <StethoscopeIcon className="h-24 w-24 text-slate-400 dark:text-slate-500 mb-6" />
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2">Asistente de Voz Gema</h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-md mb-8 h-12">
            {status === 'listening' && 'Estoy escuchando... Habla o haz un sonido para que lo analice.'}
            {status === 'speaking' && 'Gema está hablando...'}
            {status === 'processing' && 'Analizando el audio, un momento por favor...'}
            {status === 'idle' && 'Presiona el botón para hablar, hacer una pregunta o para que analice un sonido como tos o un estornudo.'}
        </p>

        <div className="h-16 flex items-center justify-center">
            {renderControls()}
        </div>

        {error && (
            <div className="mt-4 text-center text-red-600 dark:text-red-400 font-medium">
                {error}
            </div>
        )}
      </div>
      {symptomInfo && <SymptomInfoCard symptom={symptomInfo} onClose={() => setSymptomInfo(null)} />}
    </div>
  );
};

export default ChatAssistant;
