import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar"; // Crearemos esto ahora

const geistSans = Geist({
  subsets: ["latin"],
});

export const metadata = {
  title: "DocShift - Convierte tus Documentos al Instante",
  description: "Transforma archivos Word a PDF en segundos.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className="scroll-smooth" data-scroll-behavior="smooth">
      <body className={`${geistSans.className} antialiased bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300`}>
        {/* Navbar Global */}
        <Navbar />
        
        {/* Fondo decorativo */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-0 -left-10 w-96 h-96 bg-indigo-200/30 dark:bg-indigo-900/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 -right-10 w-96 h-96 bg-purple-200/30 dark:bg-purple-900/20 rounded-full blur-3xl"></div>
        </div>

        {children}
      </body>
    </html>
  );
}