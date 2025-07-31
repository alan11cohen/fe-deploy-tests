'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { Box, Typography } from "@mui/material";

export default function PaymentPendingPage() {
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.push("/restaurants/1"); //TODO: Change to the restaurant you are logged in
    }, 6000);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <Box textAlign="center" mt={10}>
      <HourglassEmptyIcon sx={{ fontSize: 80, color: "orange" }} />
      <Typography variant="h4" mt={2}>Pago pendiente</Typography>
      <Typography variant="subtitle1" mt={1}>
        Tu pago está en proceso. Recibirás una confirmación en breve.
      </Typography>
    </Box>
  );
}
