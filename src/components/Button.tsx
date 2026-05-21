// src/components/Button.tsx
import React, { ButtonHTMLAttributes, ReactNode } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  children: ReactNode;
}

export default function Button({ variant = "primary", className = "", children, ...rest }: Props) {
  const base = "px-4 py-2 rounded-full font-semibold transition-colors duration-200 focus:outline-none";
  const styles = {
    primary: "bg-green-500 text-white hover:bg-green-600 focus:ring-2 focus:ring-green-100",
    secondary: "bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-2 focus:ring-gray-100",
  }[variant];
  return (
    <button className={`${base} ${styles} ${className}`} {...rest}>
      {children}
    </button>
  );
}
