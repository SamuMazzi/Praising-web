// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBzIaHkq8wdu5Kwbr-e6ka9LZELyMQlekM",
  authDomain: "praising-web.firebaseapp.com",
  projectId: "praising-web",
  storageBucket: "praising-web.appspot.com",
  messagingSenderId: "921166733078",
  appId: "1:921166733078:web:731818e47c5447529a3a37",
  measurementId: "G-G599KP9HRV"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export default app
