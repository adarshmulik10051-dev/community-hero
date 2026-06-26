import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDSNpiYLkY20a88dX07Uw0bH1Pp1x_jAE4",
  authDomain: "community-hero-8c000.firebaseapp.com",
  projectId: "community-hero-8c000",
  storageBucket: "community-hero-8c000.firebasestorage.app",
  messagingSenderId: "729174041897",
  appId: "1:729174041897:web:97579e3b221b871c2d4338"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;