import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    optimizePackageImports: [
      "@mui/material",
      "@mui/icons-material",
      "lucide-react",
    ],
  },
  images: {
    domains: ["firebasestorage.googleapis.com"],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

export default nextConfig;
