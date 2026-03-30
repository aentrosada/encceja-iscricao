export interface RegistrationData {
  year: string | null;
  cpf: string | null;
  registrationNumber: string | null;
  status: string | null;
  specializedAssistance: string | null;
  certificationLevel: string | null;
  exams: string[];
  location: string | null;
  certifyingInstitutionState: string | null;
  institution: string | null;
}

export type AppStep = 'form' | 'analyzing' | 'review' | 'success';
