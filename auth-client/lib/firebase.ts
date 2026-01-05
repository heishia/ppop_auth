import { initializeApp, getApps } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);

let recaptchaVerifier: RecaptchaVerifier | null = null;
let confirmationResult: ConfirmationResult | null = null;

export function setupRecaptcha(containerId: string): RecaptchaVerifier {
  if (recaptchaVerifier) {
    recaptchaVerifier.clear();
  }
  
  recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {},
    'expired-callback': () => {
      recaptchaVerifier = null;
    },
  });
  
  return recaptchaVerifier;
}

export async function sendPhoneVerification(phoneNumber: string): Promise<void> {
  if (!recaptchaVerifier) {
    throw new Error('reCAPTCHA not initialized');
  }
  
  const formattedPhone = phoneNumber.startsWith('+') 
    ? phoneNumber 
    : `+82${phoneNumber.startsWith('0') ? phoneNumber.slice(1) : phoneNumber}`;
  
  confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
}

export async function verifyPhoneCode(code: string): Promise<string> {
  if (!confirmationResult) {
    throw new Error('No verification in progress');
  }
  
  const result = await confirmationResult.confirm(code);
  const idToken = await result.user.getIdToken();
  
  await auth.signOut();
  
  return idToken;
}

export function clearRecaptcha(): void {
  if (recaptchaVerifier) {
    recaptchaVerifier.clear();
    recaptchaVerifier = null;
  }
  confirmationResult = null;
}

