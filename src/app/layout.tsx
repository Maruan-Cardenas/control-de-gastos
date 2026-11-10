import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Control de Gastos & Finanzas Familiares | Marwan",
  description: "Gestión integral de gastos del hogar, control de horas diarias (Puente Sur & Sergio), matriz cruzada y auditoría inteligente de ahorro.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark h-full antialiased bg-slate-950 text-slate-100">
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
        {children}
      </body>
    </html>
  );
}
