import React from 'react';
import { Diagnosis } from '../types';
import BookMarkIcon from './icons/BookMarkIcon';

interface HistoryListProps {
  history: Diagnosis[];
  onSelect: (diagnosis: Diagnosis) => void;
}

const HistoryList: React.FC<HistoryListProps> = ({ history, onSelect }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <BookMarkIcon className="h-6 w-6 text-cyan-500" />
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Historial de Búsqueda</h2>
      </div>
      {history.length === 0 ? (
        <p className="text-slate-500 dark:text-slate-400">Tus búsquedas anteriores se guardarán aquí.</p>
      ) : (
        <ul className="space-y-2 max-h-96 overflow-y-auto pr-2">
          {history.map((item) => (
            <li key={item.name}>
              <button
                onClick={() => onSelect(item)}
                className="w-full text-left px-4 py-2 rounded-lg bg-slate-100/80 dark:bg-slate-700/80 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors duration-200"
              >
                {item.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default HistoryList;