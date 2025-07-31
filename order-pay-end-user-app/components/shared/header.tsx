"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, UtensilsIcon, X } from "lucide-react";
import { Logo } from "../logo";

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-[#c2c1c0] shadow-md sticky top-0 z-50 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link href="/" className="text-2xl font-bold tracking-wide">
            <Logo />
          </Link>
        </div>

        <button
          className="md:hidden text-white"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {isOpen && (
        <nav className="md:hidden px-4 pb-4">
          <ul className="space-y-3 text-lg">
            <li>
              <Link
                href="/login"
                className="block hover:underline"
                onClick={() => setIsOpen(false)}
              >
                Option 1
              </Link>
            </li>
            <li>
              <Link
                href="/restaurants/123"
                className="block hover:underline"
                onClick={() => setIsOpen(false)}
              >
                Option
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
};
