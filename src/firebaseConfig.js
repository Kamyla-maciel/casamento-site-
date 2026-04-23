import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD4GTZifg6T60JtiuaNf-PkWI6UI19EJ5g",
  authDomain: "casamento-rsvp-e2d36.firebaseapp.com",
  projectId: "casamento-rsvp-e2d36",
  storageBucket: "casamento-rsvp-e2d36.firebasestorage.app",
  messagingSenderId: "929465334271",
  appId: "1:929465334271:web:f898fac2a75de1180a8fca",
  measurementId: "G-TGB7DNDPNT"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
