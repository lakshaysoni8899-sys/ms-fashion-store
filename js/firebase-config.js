// Import Firebase core and Firestore database from the CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Your exact MS Fashion Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBuRZ-kLTULNbmQM3tn_38lffZKIFK58LY",
    authDomain: "ms-fashion-app.firebaseapp.com",
    projectId: "ms-fashion-app",
    storageBucket: "ms-fashion-app.firebasestorage.app",
    messagingSenderId: "301049195600",
    appId: "1:301049195600:web:2342715f144ac77bea3555",
    measurementId: "G-Q5BFNG5LVR"
};

// Initialize Firebase and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Export the database so your admin panel can save to it
export { db };