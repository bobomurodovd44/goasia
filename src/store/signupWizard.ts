import { create } from 'zustand';
import { Address } from '../types/address';

interface CompanyDataState {
  companyName: string;
  companyType: 'llc' | 'individual';
  companyLocation: { latitude: number; longitude: number } | null;
  companyAddress: Address | null;
}

interface SignupState extends CompanyDataState {
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
  setCompanyData: (data: CompanyDataState) => void;
  clearCompanyData: () => void;
  resetWizard: () => void;
}

export const useSignupWizard = create<SignupState>((set, get) => ({
  email: null,
  password: null,
  firstName: '',
  lastName: '',
  phone: '',

  isCheckingEmail: false,
  emailError: null,
  step1Completed: false,

  companyName: '',
  companyType: 'llc',
  companyLocation: null,
  companyAddress: null,

  setCredentials: (email, password) => set({ email, password }),

  setPersonalInfo: (firstName, lastName, phone) =>
    set({ firstName, lastName, phone }),

  setCheckingEmail: (loading) =>
    set({ isCheckingEmail: loading }),

  setEmailError: (error) =>
    set({ emailError: error }),

  completeStep1: () =>
    set({ step1Completed: true }),

  setCompanyData: (data) => set({
    companyName: data.companyName,
    companyType: data.companyType,
    companyLocation: data.companyLocation,
    companyAddress: data.companyAddress,
  }),

  clearCompanyData: () => set({
    companyName: '',
    companyType: 'llc',
    companyLocation: null,
    companyAddress: null,
  }),

  resetWizard: () => set({
    email: null,
    password: null,
    firstName: '',
    lastName: '',
    phone: '',
    isCheckingEmail: false,
    emailError: null,
    step1Completed: false,
    companyName: '',
    companyType: 'llc',
    companyLocation: null,
    companyAddress: null,
  }),
}));
