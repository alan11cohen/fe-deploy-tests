import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAsEBOt6-KtOnDWrcrHapw35tXn6Mb5cyg",
  authDomain: "order-and-pay-b193c.firebaseapp.com",
  projectId: "order-and-pay-b193c",
  storageBucket: "order-and-pay-b193c.firebasestorage.app",
  messagingSenderId: "788186353663",
  appId: "1:788186353663:web:75a1d7255ccf19d44a21ca",
  measurementId: "G-YZZ41H4WML",
};

let app;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  console.log("Firebase App inicializada por primera vez.");
} else {
  app = getApp();
  console.log(
    "Firebase App ya estaba inicializada, reutilizando la instancia existente."
  );
}

export const auth = getAuth(app);
export { app };
