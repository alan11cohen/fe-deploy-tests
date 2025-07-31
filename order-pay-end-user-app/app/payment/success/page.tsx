'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Box, Typography } from "@mui/material";

export default function PaymentSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.push("/restaurants/1"); //TODO: Change to the restaurant you are logged in
    }, 4000);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <Box textAlign="center" mt={10}>
      <CheckCircleIcon sx={{ fontSize: 80, color: "green" }} />
      <Typography variant="h4" mt={2}>¡Pago exitoso!</Typography>
      <Typography variant="subtitle1" mt={1}>
        Gracias por tu compra. Serás redirigido en unos segundos...
      </Typography>
    </Box>
  );
}
