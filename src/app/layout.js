import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({ subsets: ["latin"] });

export const metadata = {
  title: "DocShift | Convertidor Word a PDF Gratis y Seguro",
  description: "Convierte archivos .docx a PDF en segundos. Sin registros, sin marcas de agua y con borrado automático de archivos para tu total privacidad.",
  keywords: ["convertir word a pdf", "docx a pdf gratis", "convertidor pdf seguro", "docshift"],
  authors: [{ name: "DocShift Team" }],
  openGraph: {
    title: "DocShift - Word a PDF al instante",
    description: "La forma más rápida y privada de gestionar tus documentos.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className={`${geistSans.className} antialiased bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100`}>
        <Navbar />
        {/* Fondo decorativo */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-0 -left-10 w-96 h-96 bg-indigo-200/20 dark:bg-indigo-900/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 -right-10 w-96 h-96 bg-purple-200/20 dark:bg-purple-900/10 rounded-full blur-3xl"></div>
        </div>
        {children}
      </body>
    </html>
  );
}