import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { AES, enc } from 'crypto-js';

const firebaseConfig = {
  apiKey: "AIzaSyCj1UECmadmUopoqOs9kpUJyPApyzePvew",
  authDomain: "tvde-plus.firebaseapp.com",
  projectId: "tvde-plus",
  storageBucket: "tvde-plus.firebasestorage.app",
  messagingSenderId: "231236473290",
  appId: "1:231236473290:web:2062155c40f6697b917f33",
  measurementId: "G-5MRBPS3KV1"
};

const ENCRYPTION_KEY = 'asc-tool-secure-key-2024';

export const encryptPassword = (password: string): string => {
  return AES.encrypt(password, ENCRYPTION_KEY).toString();
};

export const decryptPassword = (encryptedPassword: string): string => {
  const bytes = AES.decrypt(encryptedPassword, ENCRYPTION_KEY);
  return bytes.toString(enc.Utf8);
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);