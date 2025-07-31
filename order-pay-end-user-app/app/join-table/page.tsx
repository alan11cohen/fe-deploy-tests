"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ScanIcon, PaymentIcon, SplitIcon } from "@/components/icons";
import { FeatureCard, Logo } from "@/components";
import { QrScanner } from "@/components/qr-scanner";

function JoinTableForm() {
  const [showScanner, setShowScanner] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const shouldShowScanner = searchParams.get("showScanner");
    if (shouldShowScanner === "true") {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setShowScanner(true);
      }, 300);
    }
  }, [searchParams]);

  const handleScanTable = () => {
    const firebaseToken = sessionStorage.getItem("firebaseToken");
    const guestId = localStorage.getItem("guestId");
    const userType =
      sessionStorage.getItem("userType") || localStorage.getItem("userType");

    if (
      (firebaseToken && userType === "logged") ||
      (guestId && userType === "guest")
    ) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setShowScanner(true);
      }, 300);
    } else {
      router.push("/login?returnTo=scanner");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <section className="flex-1 flex flex-col justify-center items-center p-6 text-center bg-gradient-to-b from-orange-50 to-white">
        <div className="max-w-lg mx-auto w-full">
          <h1 className="text-4xl font-bold tracking-tight mb-4 text-gray-900 mt-8">
            Simplifica tu experiencia gastronómica
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Ordena, paga y divide la cuenta sin esperar al mesero
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            {!showScanner && (
              <button
                onClick={handleScanTable}
                disabled={isLoading}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold px-8 py-3 rounded transition disabled:opacity-60"
              >
                {isLoading ? "Cargando..." : "Escanear mesa"}
              </button>
            )}
          </div>
          {showScanner && (
            <div className="bg-white border border-gray-200 shadow-lg rounded-xl p-4 mb-8">
              <QrScanner />
            </div>
          )}
        </div>
      </section>

      <section className="py-12 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8 text-black">
            Una mejor experiencia para todos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<ScanIcon className="h-10 w-10 text-blue-600" />}
              title="Escanea y ordena"
              description="Escanea el código QR de tu mesa y ordena directamente desde tu teléfono sin esperar al mesero."
            />
            <FeatureCard
              icon={<PaymentIcon className="h-10 w-10 text-blue-600" />}
              title="Paga rápidamente"
              description="Paga tu cuenta cuando estés listo, sin esperar que te traigan la cuenta o el punto de venta."
            />
            <FeatureCard
              icon={<SplitIcon className="h-10 w-10 text-blue-600" />}
              title="Divide la cuenta"
              description="Divide la cuenta fácilmente entre tus amigos, cada uno pagando lo que consumió."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

export default function JoinTablePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <JoinTableForm />
    </Suspense>
  );
}
