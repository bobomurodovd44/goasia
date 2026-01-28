import feathersClient from './feathersClient';
import { getFirebaseAuth } from '../config/firebase';
import { Address } from '../types/address';
import { UserTypes } from '../types/userTypes';

interface CompanyData {
  companyName: string;
  companyType: 'llc' | 'individual';
  location: { latitude: number; longitude: number };
  address: Address;
}

export const signupApi = {
  async submitRegistration(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    companyData: CompanyData;
  }): Promise<{ user: any; accessToken: string }> {
    const firebaseAuth = getFirebaseAuth();
    
    try {
      const { createUserWithEmailAndPassword } = await import('firebase/auth');
      const firebaseUserCredential = await createUserWithEmailAndPassword(
        firebaseAuth,
        data.email,
        data.password
      );
      
      const firebaseIdToken = await firebaseUserCredential.user.getIdToken();
      
      const authResponse = await feathersClient.authenticate({
        accessToken: firebaseIdToken,
        userData: {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          type: UserTypes.legalEntity,
          role: 'company' as const,
        },
        companyData: {
          companyName: data.companyData.companyName,
          type: data.companyData.companyType,
          location: {
            type: 'Point' as const,
            coordinates: [
              data.companyData.location.longitude,
              data.companyData.location.latitude,
            ],
          },
          address: data.companyData.address,
        },
        strategy: 'firebase',
      });
      
      return {
        user: authResponse.user,
        accessToken: authResponse.accessToken,
      };
    } catch (error: any) {
      console.error('Registration failed:', error);
      
      const errorMessage = error.message?.toLowerCase() || '';
      
      if (errorMessage.includes('company') && (errorMessage.includes('already exists') || errorMessage.includes('already exist'))) {
        throw new Error('A company with this name already exists. Please use a different company name.');
      }
      
      if (errorMessage.includes('email') && (errorMessage.includes('duplicate') || errorMessage.includes('already exist') || errorMessage.includes('unique') || errorMessage.includes('already used'))) {
        throw new Error('This email is already registered. Please use a different email or log in.');
      }
      
      if (errorMessage.includes('firebase')) {
        throw new Error('Unable to create account. Please try again.');
      }
      
      throw new Error(error.message || 'Registration failed. Please try again.');
    }
  }
};

export default signupApi;
