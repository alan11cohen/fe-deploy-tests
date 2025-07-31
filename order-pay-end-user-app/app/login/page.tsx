"use client";

import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "../../firebase";
import { useState, useEffect, Suspense } from "react";
import { redirect } from "next/navigation";
import { useRouter, useSearchParams } from "next/navigation";
import { useLogin } from "@/app/login/hooks/use-auth";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [backendResponse, setBackendResponse] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const googleProvider = new GoogleAuthProvider();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo");

  const loginMutation = useLogin();

  const sendTokenToBackend = async (
    firebaseIdToken: string,
    loggedInUserEmail: string | null
  ) => {
    try {
      setErrorMessage("");
      setBackendResponse(null);

      const response = await loginMutation.mutateAsync({
        firebaseIdToken: firebaseIdToken,
      });

      setBackendResponse({
        ...response,
        email: loggedInUserEmail,
        firebaseIdToken: firebaseIdToken,
      });

      return true;
    } catch (error: any) {
      console.error("Error al enviar token al backend:", error);

      const errorMsg =
        error?.message ||
        "Error al conectar con el backend o procesar la solicitud.";
      setErrorMessage(`Error del backend: ${errorMsg}`);

      setBackendResponse(null);
      return false;
    }
  };

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const getRedirectPath = () => {
    if (returnTo === "scanner") {
      return "/join-table?showScanner=true";
    }
    return "/restaurants/1";
  };

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
        sessionStorage.setItem("firebaseToken", token);
        sessionStorage.setItem("userEmail", userCredential.user.email || "");
        sessionStorage.setItem("userId", userCredential.user.uid);
        sessionStorage.setItem("userType", "logged");

        await sleep(1000);
        router.push(getRedirectPath());
      }
    } catch (error: any) {
      let errorMessage = "Error al iniciar sesión con email y contraseña.";
      switch (error.code) {
        case "auth/wrong-password":
          errorMessage = "Contraseña incorrecta.";
          break;
        case "auth/user-not-found":
          errorMessage = "No existe una cuenta con este email.";
          break;
        case "auth/invalid-email":
          errorMessage = "El formato del email es inválido.";
          break;
        case "auth/user-disabled":
          errorMessage = "Tu cuenta ha sido deshabilitada.";
          break;
        case "auth/network-request-failed":
          errorMessage = "Problema de conexión. Por favor, revisa tu internet.";
          break;
        default:
          errorMessage = `Error al intentar iniciar sesion`;
      }
      setErrorMessage(errorMessage);
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
        sessionStorage.setItem("firebaseToken", token);
        sessionStorage.setItem("userEmail", user.email || "");
        sessionStorage.setItem("userId", user.uid);
        sessionStorage.setItem("userType", "logged");

        await sleep(1000);
        router.push(getRedirectPath());
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
      setBackendResponse(null);
    }
  };

  const handleContinueAsGuest = () => {
    const guestId = crypto.randomUUID();
    localStorage.setItem("guestId", guestId);
    localStorage.setItem("userType", "guest");

    router.push(getRedirectPath());
  };

  const isLoading = loginMutation.isPending;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Inicia sesión en tu cuenta
          </h2>
        </div>
        <div className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <button
              type="button"
              onClick={handleEmailPasswordLogin}
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? "Iniciando sesión..." : "Iniciar sesión con Email"}
            </button>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {isLoading ? "Cargando..." : "Continuar con Google"}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">O</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleContinueAsGuest}
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-500 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
            >
              Continuar como invitado
            </button>
          </div>

          {(errorMessage || loginMutation.error) && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">
                {errorMessage || loginMutation.error?.message}
              </div>
            </div>
          )}

          {backendResponse && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="text-sm text-green-700">
                Inicio de sesión exitoso
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
