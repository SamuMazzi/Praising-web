import { initializeApp } from 'firebase/app';
// import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

// Pass your reCAPTCHA v3 site key (public key) to activate(). Make sure this
// key is the counterpart to the secret key you set in the Firebase console.

const firebaseConfig = {
  apiKey: 'AIzaSyBzIaHkq8wdu5Kwbr-e6ka9LZELyMQlekM',
  authDomain: 'praising-web.firebaseapp.com',
  projectId: 'praising-web',
  storageBucket: 'praising-web.appspot.com',
  messagingSenderId: '921166733078',
  appId: '1:921166733078:web:731818e47c5447529a3a37',
  measurementId: 'G-G599KP9HRV'
};

const app = initializeApp(firebaseConfig);
/* const env = process.env.NODE_ENV
if(env == "development"){
  self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
} */
// const appCheck =
/* initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider(
    '6LeQJl0pAAAAACbI7G1iJSbZb2G1mBUsiSJOmS_v'
  ),
  isTokenAutoRefreshEnabled: true
}); */

export default app;
