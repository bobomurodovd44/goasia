import { create } from 'zustand';

interface SignupState {
  email: string | null;
  password: string | null;
  firstName: string;
  lastName: string;
  phone: string;
  
  isCheckingEmail: boolean;
  emailError: string | null;
  step1Completed: boolean;
  
  setCredentials: (email: string, password: string) => void;
  setPersonalInfo: (firstName: string, lastName: string, phone: string) => void;
  setCheckingEmail: (loading: boolean) => void;
  setEmailError: (error: string | null) => void;
  completeStep1: () => void;
  resetWizard: () => void;
}

export const useSignupWizard = create<SignupState>((set) => ({
  email: null,
  password: null,
  firstName: '',
  lastName: '',
  phone: '',
  
  isCheckingEmail: false,
  emailError: null,
  step1Completed: false,
  
  setCredentials: (email, password) => set({ email, password }),
  
  setPersonalInfo: (firstName, lastName, phone) => 
    set({ firstName, lastName, phone }),
  
  setCheckingEmail: (loading) => 
    set({ isCheckingEmail: loading }),
  
  setEmailError: (error) => 
    set({ emailError: error }),
  
  completeStep1: () => 
    set({ step1Completed: true }),
  
  resetWizard: () => set({
    email: null,
    password: null,
    firstName: '',
    lastName: '',
    phone: '',
    isCheckingEmail: false,
    emailError: null,
    step1Completed: false,
  }),
}));
