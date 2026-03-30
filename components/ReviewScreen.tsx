import React from 'react';
import { RegistrationData } from '../types';

interface ReviewScreenProps {
  data: RegistrationData;
  onConfirm: () => void;
  onRetake: () => void;
  isSending?: boolean;
}

export const ReviewScreen: React.FC<ReviewScreenProps> = ({ data, onConfirm, onRetake, isSending = false }) => {
  
  const DataRow = ({ label, value }: { label: string, value: string | string[] | null }) => {
    return (
      <div className="flex flex-col py-3 border-b border-gray-100 last:border-0">
        <span className="text-gray-500 font-bold text-xs uppercase tracking-wider mb-1">{label}</span>
        <div className="flex items-center gap-2">
          {value ? (
            <span className="font-bold text-gray-800 text-sm">
              {Array.isArray(value) ? value.join(', ') : value}
            </span>
          ) : (
            <span className="text-gray-400 text-sm italic">Não identificado</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r">
        <div className="flex">
          <div className="flex-shrink-0">
            <i className="fas fa-info-circle text-blue-500"></i>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700 leading-snug">
              A IA analisou seu documento. Verifique se as informações abaixo conferem com a sua inscrição.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6 p-5">
        <h3 className="text-center font-black text-gray-800 uppercase tracking-wide mb-4 border-b pb-4 text-base">
          Dados da Inscrição
        </h3>
        
        <DataRow label="Ano Encceja" value={data.year} />
        <DataRow label="CPF" value={data.cpf} />
        <DataRow label="Número de Inscrição" value={data.registrationNumber} />
        <DataRow label="Situação" value={data.status} />
        <DataRow label="Atendimento Especializado" value={data.specializedAssistance} />
        <DataRow label="Nível de Ensino" value={data.certificationLevel} />
        <DataRow label="Provas que fará" value={data.exams} />
        <DataRow label="Local (UF/Cidade)" value={data.location} />
        <DataRow label="UF da Instituição" value={data.certifyingInstitutionState} />
        <DataRow label="Instituição" value={data.institution} />
      </div>

      <div className="flex flex-col gap-3">
        <button 
          onClick={onConfirm}
          disabled={isSending}
          className="w-full bg-[#219653] hover:bg-[#1e874b] disabled:bg-gray-400 text-white font-black py-4 px-6 rounded-full shadow-md transition-all uppercase tracking-wider flex items-center justify-center gap-2 text-base"
        >
          {isSending ? (
            <>
              <i className="fas fa-spinner fa-spin"></i> ENVIANDO...
            </>
          ) : (
            <>
              <i className="fas fa-check"></i> CONFIRMAR E ENVIAR
            </>
          )}
        </button>
        
        <button 
          onClick={onRetake}
          disabled={isSending}
          className="w-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 text-gray-700 font-bold py-3 px-6 rounded-full transition-colors text-sm"
        >
          A imagem não ficou boa? Tentar novamente
        </button>
      </div>
    </div>
  );
};
