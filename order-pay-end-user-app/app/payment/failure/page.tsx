'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import CancelIcon from '@mui/icons-material/Cancel';
import { Box, Typography } from "@mui/material";

export default function PaymentFailurePage() {
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.push("/restaurants/1"); //TODO: Change to the restaurant you are logged in
    }, 4000);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <Box textAlign="center" mt={10}>
      <CancelIcon sx={{ fontSize: 80, color: "red" }} />
      <Typography variant="h4" mt={2}>Pago rechazado</Typography>
      <Typography variant="subtitle1" mt={1}>
        Hubo un problema al procesar tu pago. Intentá nuevamente.
      </Typography>
    </Box>
  );
}
