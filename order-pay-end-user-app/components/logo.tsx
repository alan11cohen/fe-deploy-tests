import { cn } from "@/utils/cn";
import { UtensilsIcon } from "lucide-react";
import { TabbieIcon } from "./icons";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <div
      className={cn(
        "flex items-center text-center font-bold text-xl text-white",
        className
      )}
    >
      <span className="mr-1 mb-2">Tabbie</span>
      <TabbieIcon className="h-12 w-16 -ml-5 align-middle" />
    </div>
  );
}

export default Logo;
