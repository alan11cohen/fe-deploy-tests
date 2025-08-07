"use client";

import { Html5Qrcode } from "html5-qrcode";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useJoinTable } from "@/app/join-table/hooks/use-join-table";
import { useToast } from "./toast-context";

function getOrCreateGuestId(): string {
  const key = "guestUserId";
  let id = typeof window !== "undefined" ? localStorage.getItem(key) : null;
  if (!id) {
    id = crypto.randomUUID();
    if (typeof window !== "undefined") {
      localStorage.setItem(key, id);
    }
  }
  return id!;
}

export const QrScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState("");
  const [paused, setPaused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const cameraIdRef = useRef<string | null>(null);
  const isStartingRef = useRef(false);
  const router = useRouter();
  const { showToast } = useToast();

  const joinTableMutation = useJoinTable();

  const startScanner = async () => {
    if (isStartingRef.current || html5QrCodeRef.current) {
      return;
    }

    const readerElement = document.getElementById("reader");
    if (!readerElement) {
      return;
    }

    isStartingRef.current = true;
    setPaused(false);
    setError(null);
    setResult("");

    try {
      const cameras = await Html5Qrcode.getCameras();
      if (cameras.length === 0) {
        setError("No se encontraron cámaras.");
        isStartingRef.current = false;
        return;
      }

      const finalReaderElement = document.getElementById("reader");
      if (!finalReaderElement) {
        isStartingRef.current = false;
        return;
      }

      const qrCode = new Html5Qrcode("reader");
      const cameraId = cameras[0].id;
      html5QrCodeRef.current = qrCode;
      cameraIdRef.current = cameraId;

      await qrCode.start(
        cameraId,
        { fps: 10, qrbox: 250 },
        async (decodedText) => {
          try {
            await qrCode.stop();
            await qrCode.clear();
            html5QrCodeRef.current = null;
            setIsScanning(false);
            isStartingRef.current = false;
          } catch (e) {}

          setResult(decodedText);
          let url, code;

          try {
            url = new URL(decodedText);
            code = url.searchParams.get("code");
          } catch (e) {
            setError(
              "El código QR escaneado no es válido. Por favor, intenta con el QR de la mesa o comunicate con el personal del restaurante."
            );
            setPaused(true);
            return;
          }

          if (!code) {
            setError("El código QR no tiene el identificador de la mesa.");
            setPaused(true);
            return;
          }

          try {
            let userIdentifier: string;
            let userType: "guest" | "logged" = "guest";

            const firebaseToken = sessionStorage.getItem("firebaseToken");
            const sessionUserType = sessionStorage.getItem("userType");

            if (firebaseToken && sessionUserType === "logged") {
              userIdentifier = firebaseToken;
              userType = "logged";
            } else {
              const localUserType = localStorage.getItem("userType");
              if (localUserType === "guest") {
                userIdentifier =
                  localStorage.getItem("guestId") || getOrCreateGuestId();
              } else {
                userIdentifier = getOrCreateGuestId();
                localStorage.setItem("guestId", userIdentifier);
                localStorage.setItem("userType", "guest");
              }
              userType = "guest";
            }

            await joinTableMutation.mutateAsync({
              code,
              data: { userIdentifier, userType },
            });

            router.push(`/restaurants/${1}`);
          } catch (error) {
            setPaused(true);
            setError(
              "No se pudo unir a la mesa. Verifica el código QR o intenta nuevamente."
            );
          }
        },
        (error) => {
          // Error de escaneado (esto es normal)
        }
      );

      setIsScanning(true);
      setIsInitialized(true);
      isStartingRef.current = false;
    } catch (error) {
      setError("Error al iniciar la cámara.");
      isStartingRef.current = false;
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        await html5QrCodeRef.current.clear();
        html5QrCodeRef.current = null;
      } catch (e) {}
    }
    setIsScanning(false);
    setPaused(true);
    isStartingRef.current = false;
  };

  const handleRetry = async () => {
    setError(null);
    setResult("");
    setPaused(false);
    setIsInitialized(false);
    joinTableMutation.reset();

    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        await html5QrCodeRef.current.clear();
        html5QrCodeRef.current = null;
      } catch (e) {}
    }

    isStartingRef.current = false;

    setTimeout(() => {
      startScanner();
    }, 500);
  };

  useEffect(() => {
    const initTimeout = setTimeout(() => {
      const readerElement = document.getElementById("reader");
      if (readerElement && !isInitialized && !isStartingRef.current) {
        startScanner();
      }
    }, 100);

    return () => {
      clearTimeout(initTimeout);

      if (html5QrCodeRef.current) {
        try {
          html5QrCodeRef.current.stop();
        } catch (e) {}
        try {
          html5QrCodeRef.current.clear();
        } catch (e) {}
        html5QrCodeRef.current = null;
      }
      isStartingRef.current = false;
    };
  }, []);

  const isLoading = joinTableMutation.isPending;

  useEffect(() => {
    if (result && !error && !isLoading) {
      showToast("Te has unido a la mesa.", "success");
    }
  }, [result, error, isLoading]);

  return (
    <div className="text-center">
      {!paused && !error && (
        <>
          <div className="relative">
            <div id="reader" className="w-full mb-4 rounded overflow-hidden" />
            {isLoading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded">
                <div className="bg-white p-4 rounded-lg flex flex-col items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                  <p className="text-sm text-gray-700">
                    Uniéndose a la mesa...
                  </p>
                </div>
              </div>
            )}
          </div>
          {isScanning && !isLoading && (
            <button
              onClick={stopScanner}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded w-full"
            >
              Detener escaneo
            </button>
          )}
        </>
      )}

      {paused && !error && (
        <div className="flex flex-col items-center justify-center gap-4 py-8">
          <div className="text-4xl mb-2">🔒</div>
          <p className="text-lg text-gray-700 font-semibold">
            El escaneo está pausado
          </p>
          <p className="text-gray-500 mb-2">
            Puedes volver a intentar cuando quieras.
          </p>
          <button
            onClick={handleRetry}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold"
            disabled={isLoading}
          >
            {isLoading ? "Cargando..." : "Reanudar escaneo"}
          </button>
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center justify-center gap-4 py-8">
          <div className="text-4xl mb-2">❌</div>
          <p className="text-lg text-red-700 font-semibold">{error}</p>
          <button
            onClick={handleRetry}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold"
            disabled={isLoading}
          >
            {isLoading ? "Cargando..." : "Volver a intentar"}
          </button>
        </div>
      )}
    </div>
  );
};
