"use client";
import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import { Snackbar, Alert } from "@mui/material";

type ToastSeverity = "success" | "error" | "warning" | "info";

interface ToastContextValue {
  showToast: (message: string, severity?: ToastSeverity) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast debe usarse dentro de ToastProvider");
  }
  return context;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<ToastSeverity>("info");
  const [progress, setProgress] = useState(100);
  const duration = 5000;

  useEffect(() => {
    if (open) {
      setProgress(100);
      const interval = 100;
      const decrement = 100 / (duration / interval);

      const timer = setInterval(() => {
        setProgress(prev => {
          const next = prev - decrement;
          if (next <= 0) {
            clearInterval(timer);
            return 0;
          }
          return next;
        });
      }, interval);

      return () => clearInterval(timer);
    }
  }, [open]);


  const showToast = useCallback((msg: string, sev: ToastSeverity = "info") => {
    setMessage(msg);
    setSeverity(sev);
    setOpen(true);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{
          bottom: {
            xs: 50, // para pantallas pequeñas
            sm: 80  // para pantallas más grandes
          },
        }}
      >
        <Alert
          severity={severity}
          onClose={() => setOpen(false)}
          sx={{
            width: "100%",
            fontSize: "1rem", 
            paddingY: 2,  
            paddingX: 3, 
            borderRadius: 2,
          }}
        >
          {message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
};