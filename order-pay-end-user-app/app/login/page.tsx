"use client";

import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import axios from "axios";
import { auth } from "../../firebase";
import { useState } from "react";
import { redirect } from "next/navigation";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [backendResponse, setBackendResponse] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const googleProvider = new GoogleAuthProvider();
  const router = useRouter();

  const sendTokenToBackend = async (
    firebaseIdToken: string,
    loggedInUserEmail: string | null
  ) => {
    try {
      setErrorMessage("");
      setBackendResponse(null);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const response = await axios.post(`${apiUrl}/auth/login`, {
        firebaseIdToken: firebaseIdToken,
      });

      setBackendResponse({
        ...response.data,
        email: loggedInUserEmail,
        firebaseIdToken: firebaseIdToken,
      });

      return true;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error al enviar token al backend:", error.message);
      } else {
        console.error("Error al enviar token al backend:", error);
      }

      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        error.response &&
        "data" in (error as any).response &&
        (error as any).response.data &&
        "message" in (error as any).response.data
      ) {
        setErrorMessage(
          `Error del backend: ${((error as any).response.data as any).message}`
        );
      } else {
        setErrorMessage(
          "Error al conectar con el backend o procesar la solicitud."
        );
      }

      setBackendResponse(null);
      return false;
    }
  };

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const handleEmailPasswordLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const token = await userCredential.user.getIdToken();
      const success = await sendTokenToBackend(
        token,
        userCredential.user.email
      );
      if (success) {
        await sleep(1000);
        router.push("/restaurants/1");
      }
    } catch (error: any) {
      let friendlyErrorMessage =
        "Error al iniciar sesión con email y contraseña.";
      switch (error.code) {
        case "auth/wrong-password":
          friendlyErrorMessage = "Contraseña incorrecta.";
          break;
        case "auth/user-not-found":
          friendlyErrorMessage = "No existe una cuenta con este email.";
          break;
        case "auth/invalid-email":
          friendlyErrorMessage = "El formato del email es inválido.";
          break;
        case "auth/user-disabled":
          friendlyErrorMessage = "Tu cuenta ha sido deshabilitada.";
          break;
        case "auth/network-request-failed":
          friendlyErrorMessage =
            "Problema de conexión. Por favor, revisa tu internet.";
          break;
        default:
          friendlyErrorMessage = `Error al intentar iniciar sesion`;
      }
      setErrorMessage(friendlyErrorMessage);
      console.error("Error Firebase (Email/Pass):", error.code, error.message);
      setBackendResponse(null);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const token = await user.getIdToken();
      const success = await sendTokenToBackend(token, user.email);
      if (success) {
        await sleep(1000);
        router.push("/restaurants/1");
      }
    } catch (error: any) {
      let friendlyErrorMessage = "Error al iniciar sesión con Google.";
      switch (error.code) {
        case "auth/popup-closed-by-user":
          friendlyErrorMessage =
            "La ventana de inicio de sesión de Google fue cerrada.";
          break;
        case "auth/cancelled-popup-request":
          friendlyErrorMessage =
            "Ya hay una ventana de inicio de sesión abierta. Por favor, inténtalo de nuevo.";
          break;
        case "auth/operation-not-allowed":
          friendlyErrorMessage =
            "El inicio de sesión con Google no está habilitado. Por favor, actívalo en la Consola de Firebase.";
          break;
        case "auth/network-request-failed":
          friendlyErrorMessage =
            "Problema de conexión. Por favor, revisa tu internet.";
          break;
        default:
          friendlyErrorMessage = `Error desconocido: ${error.message}`;
      }
      setErrorMessage(friendlyErrorMessage);
      console.error("Error Firebase (Google):", error.code, error.message);
      setBackendResponse(null);
    }
  };

  const handleContinueAsGuest = () => {
    router.push("/restaurants/1");
  };

  return (
    <div className="justify-center  text-center max-w-md mx-auto mt-16 p-8 border border-gray-200 rounded-lg shadow-md">
      <h1 className="text-2xl font-semibold text-center text-gray-800 mb-6">
        Iniciar Sesión
      </h1>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full mb-4 px-4 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
      />

      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full mb-6 px-4 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
      />

      <button
        onClick={handleEmailPasswordLogin}
        className="w-full mb-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold transition"
      >
        Iniciar sesión con Email
      </button>

      <button
        onClick={handleGoogleLogin}
        className="w-full mb-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-md font-semibold transition"
      >
        Iniciar sesión con Google
      </button>

      <button
        onClick={handleContinueAsGuest}
        className="w-full py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-semibold transition"
      >
        Continuar sin iniciar sesión
      </button>

      {backendResponse && (
        <div className="mt-6 p-4 border border-green-400 rounded-md bg-green-50 text-green-700">
          <h3 className="font-semibold mb-2">
            ✅ Sesión iniciada correctamente
          </h3>
          <p>
            <strong>Bienvenido</strong>
          </p>
        </div>
      )}

      {errorMessage && (
        <div className="mt-6 p-4 border border-red-400 rounded-md bg-red-50 text-red-700">
          <h3 className="font-semibold mb-2">⚠️ Error al iniciar sesión</h3>
          <p>{errorMessage}</p>
        </div>
      )}
    </div>
  );
}
