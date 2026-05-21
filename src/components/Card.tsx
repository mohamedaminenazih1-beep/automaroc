// src/components/Card.tsx
import React, { ReactNode } from "react";

export default function Card({ children }: { children: ReactNode }) {
  return (
    <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-lg border border-white/30 p-6 transition-transform duration-300 hover:translate-y-[-4px]">
      {children}
    </div>
  );
}
