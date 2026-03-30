import React from 'react';

interface LoadingOverlayProps {
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message = "Analisando boletim..." }) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 space-y-6">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-primary-red rounded-full border-t-transparent animate-spin"></div>
        <i className="fas fa-robot absolute inset-0 flex items-center justify-center text-primary-red text-2xl"></i>
      </div>
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{message}</h3>
        <p className="text-gray-500 text-sm">A Inteligência Artificial está lendo suas notas.</p>
      </div>
    </div>
  );
};