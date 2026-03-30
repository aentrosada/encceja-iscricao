import React, { useState, useRef } from 'react';
import { analyzeRegistration, fileToGenerativePart } from './services/geminiService';
import { LoadingOverlay } from './components/LoadingOverlay';
import { ReviewScreen } from './components/ReviewScreen';
import { AppStep, RegistrationData } from './types';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>('form');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<RegistrationData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      setErrorMsg(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMsg("Por favor, anexe o comprovante de inscrição.");
      return;
    }
    if (isFormSubmitting) return; // evita múltiplos cliques rápidos
    setIsFormSubmitting(true);
    setStep('analyzing');
    setErrorMsg(null);

    try {
      const base64Data = await fileToGenerativePart(file);
      const result = await analyzeRegistration(base64Data, file.type);
      setAnalysisResult(result);
      setStep('review');
    } catch (error) {
      console.error(error);
      setErrorMsg("Ocorreu um erro ao analisar o arquivo. Tente novamente.");
      setStep('form');
    } finally {
      setIsFormSubmitting(false);
    }
  };

  const handleConfirm = async () => {
    if (!analysisResult) return;
    if (isSending) return; // já enviando
    setIsSending(true);

    const payload = {
      data_hora: new Date().toLocaleString('pt-BR'),
      cpf: analysisResult.cpf,
      ano_encceja: analysisResult.year,
      numero_inscricao: analysisResult.registrationNumber,
      situacao: analysisResult.status,
      atendimento_especializado: analysisResult.specializedAssistance,
      nivel_ensino: analysisResult.certificationLevel,
      provas: analysisResult.exams.join(', '),
      local_provas: analysisResult.location,
      uf_instituicao: analysisResult.certifyingInstitutionState,
      instituicao: analysisResult.institution
    };

    console.log("Enviando dados para planilha:", payload);

    try {
      // URL do Google Script fornecida
      const WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbxPcX26lDdJ1pRPp6N--LYL5_gHHh_RQ3r3xs9gdREjLYdZrXCC1ePzpPzPG1Fy7gd9/exec";
      
      await fetch(WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      console.log("Envio disparado com sucesso.");
      
    } catch (error) {
      console.error("Erro ao enviar dados (mas prosseguindo para sucesso):", error);
    } finally {
      setStep('success');
      setIsSending(false);
    }
  };

  const resetForm = () => {
    setStep('form');
    setFile(null);
    setPreviewUrl(null);
    setAnalysisResult(null);
    setErrorMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const retakePhoto = () => {
    setStep('form');
    setFile(null);
    setPreviewUrl(null);
    setAnalysisResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-sans bg-gray-100">
      <div className="w-full max-w-[480px] bg-white rounded-2xl shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-primary-red text-white p-6 border-b-[5px] border-dark-red text-center">
          <h1 className="font-black text-3xl uppercase leading-tight mb-1">Encceja 2026</h1>
          <p className="text-sm font-normal opacity-90">Valide sua inscrição!</p>
        </div>

        {/* Content */}
        <div className="bg-white min-h-[400px]">
          
          {step === 'form' && (
            <div className="p-8">
              <p className="text-gray-900 font-bold mb-6 text-lg text-center">
                Envie seu comprovante para validar sua participação:
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block font-bold mb-2 text-gray-800 text-sm">COMPROVANTE DE INSCRIÇÃO (FOTO OU PDF):</label>
                  <label htmlFor="file-input" className="block border-3 border-dashed border-primary-red bg-red-50 rounded-xl p-6 cursor-pointer hover:bg-red-100 hover:scale-[1.02] transition-all duration-300 text-center relative group">
                    <i className="fas fa-file-upload text-4xl text-primary-red mb-3 group-hover:scale-110 transition-transform"></i>
                    <div className="text-primary-red font-bold text-lg">ENVIAR INSCRIÇÃO</div>
                    <div className="text-gray-500 text-xs mt-2">Formatos aceitos: JPG, PNG, PDF</div>
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="file-input"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  
                  {previewUrl && (
                    <div className="mt-4 text-center animate-fade-in">
                      <p className="mb-2 text-xs text-gray-500">Arquivo selecionado:</p>
                      {file?.type === 'application/pdf' ? (
                        <div className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg bg-gray-50">
                            <i className="fas fa-file-pdf text-4xl text-red-500 mb-2"></i>
                            <span className="text-sm font-medium text-gray-700">{file.name}</span>
                        </div>
                      ) : (
                        <img 
                            src={previewUrl} 
                            alt="Preview" 
                            className="max-w-full max-h-48 object-contain mx-auto rounded-lg shadow-md border border-gray-200"
                        />
                      )}
                    </div>
                  )}
                </div>

                {errorMsg && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm text-center">
                    {errorMsg}
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={!file || isFormSubmitting}
                  className="w-full bg-primary-red text-white border-none py-4 text-lg font-black uppercase rounded-full cursor-pointer mt-4 shadow-lg hover:bg-dark-red hover:-translate-y-1 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none"
                >
                  {isFormSubmitting ? 'Analisando...' : 'Validar Inscrição'}
                </button>
              </form>
            </div>
          )}

          {step === 'analyzing' && (
            <LoadingOverlay />
          )}

          {step === 'review' && analysisResult && (
            <ReviewScreen 
              data={analysisResult} 
              onConfirm={handleConfirm}
              onRetake={retakePhoto}
              isSending={isSending}
            />
          )}

          {step === 'success' && (
            <div className="p-8 pb-12 text-center animate-pop-in flex flex-col items-center">
              
              <div className="bg-[#25D366] rounded-full w-20 h-20 flex items-center justify-center mb-6 shadow-md">
                 <i className="fas fa-check text-white text-4xl"></i>
              </div>

              <h2 className="text-[#1e293b] text-2xl font-black mb-6 uppercase tracking-wide">
                INSCRIÇÃO SALVA!
              </h2>

              <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                Perfeito! Seus dados de inscrição foram registrados.
              </p>

              <p className="text-gray-600 text-base mb-8 leading-relaxed max-w-sm mx-auto">
                Caso tenha alguma dúvida, entre em contato pelo WhatsApp:
              </p>
              
              <a 
                href="https://bit.ly/Whatsdereações" 
                target="_blank" 
                rel="noreferrer"
                className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-4 rounded-full transition-transform hover:scale-[1.02] uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 text-lg no-underline mb-6"
              >
                <i className="fab fa-whatsapp text-2xl"></i> CHAMAR NO WHATS
              </a>
              
              <button 
                onClick={resetForm} 
                className="text-gray-400 hover:text-gray-600 text-sm underline decoration-1 underline-offset-4"
              >
                Enviar outra inscrição
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-100 p-4 text-xs text-gray-500 text-center border-t border-gray-200">
          &copy; 2025 Termine Seus Estudos. Todos os direitos reservados.
        </div>

      </div>
    </div>
  );
};

export default App;
