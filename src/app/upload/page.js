"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState("idle");
  const [progress, setProgress] = useState(0);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [showToast, setShowToast] = useState(false);

  // --- Lógica de Archivos ---
  function handleFile(selectedFile) {
    if (!selectedFile) return;
    if (!selectedFile.name.endsWith(".docx") && !selectedFile.name.endsWith(".doc")) {
      setError("Solo se permiten archivos Word (.docx, .doc)");
      setFile(null);
      return;
    }
    setError("");
    setFile(selectedFile);
  }

  function onDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }

  // --- Progreso Visual ---
  useEffect(() => {
    let interval;
    if (step === "uploading") {
      setProgress(0);
      interval = setInterval(() => setProgress((p) => (p < 30 ? p + 2 : p)), 100);
    }
    if (step === "converting") {
      setProgress(30);
      interval = setInterval(() => setProgress((p) => (p < 90 ? p + 1 : p)), 150);
    }
    if (step === "done") setProgress(100);
    return () => clearInterval(interval);
  }, [step]);

  // --- Conversión ---
  async function handleConvert() {
    if (!file) return;
    setError("");
    setStep("uploading");

    try {
      const formData = new FormData();
      formData.append("file", file);
      
      await new Promise((r) => setTimeout(r, 600)); 
      setStep("converting");

      const response = await fetch("/api/convert", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Error en el servidor");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setPdfUrl(url);
      setStep("done");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    } catch (err) {
      setError("No se pudo convertir el archivo. Revisa que sea un Word válido.");
      setStep("idle");
    }
  }

  function handleDownload() {
    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = `DocShift-${file.name.replace(/\.[^/.]+$/, "")}.pdf`;
    a.click();
  }

  function handleReset() {
    setFile(null);
    setStep("idle");
    setProgress(0);
    setPdfUrl(null);
    setError("");
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-12">
      
      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {showToast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed top-24 right-6 z-[60] bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 dark:border-slate-200">
            <span className="bg-green-500 w-2 h-2 rounded-full animate-ping"></span>
            <p className="font-bold text-sm">¡Documento convertido con éxito!</p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/20 dark:border-slate-800 shadow-2xl rounded-3xl p-8 md:p-12 relative overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {step !== "done" ? (
            <motion.div key="upload" exit={{ opacity: 0, scale: 0.95 }}>
              <div className="text-center mb-10">
                <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Prepara tu Word</h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Formatos soportados: .docx y .doc</p>
              </div>

              {/* DROPZONE CORREGIDO */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
                onClick={() => document.getElementById("fileInput").click()}
                className={`relative group border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all
                  ${isDragging ? "border-indigo-500 bg-indigo-50/50" : "border-slate-200 dark:border-slate-800 hover:border-indigo-400 bg-slate-50/50 dark:bg-slate-800/50"}`}
              >
                <input id="fileInput" type="file" accept=".docx,.doc" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
                
                <div className="flex flex-col items-center">
                  <div className={`w-16 h-16 mb-4 rounded-full flex items-center justify-center transition-all ${file ? "bg-green-100 text-green-600" : "bg-indigo-100 text-indigo-600"}`}>
                    {file ? (
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    ) : (
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                    )}
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 font-bold">{file ? file.name : "Suelta tu archivo aquí"}</p>
                  {!file && <p className="text-sm text-slate-400 mt-1 italic">o haz clic para buscarlo</p>}
                </div>
              </div>

              {/* ERRORES */}
              {error && <p className="mt-4 text-center text-red-500 text-sm font-semibold">{error}</p>}

              {/* PROGRESS BAR */}
              {(step === "uploading" || step === "converting") && (
                <div className="mt-8">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-2">
                    <span>{step}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-indigo-600" animate={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}

              <button
                onClick={handleConvert}
                disabled={!file || step !== "idle"}
                className={`w-full mt-10 py-4 rounded-2xl text-lg font-bold transition-all shadow-xl flex items-center justify-center gap-3
                  ${file && step === "idle" ? "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95" : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"}`}
              >
                {step !== "idle" && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                {step === "idle" ? "Convertir a PDF" : "Procesando..."}
              </button>
            </motion.div>
          ) : (
            /* VISTA FINAL */
            <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
              </div>
              <h2 className="text-3xl font-black mb-6">¡PDF Generado!</h2>
              <iframe src={pdfUrl} className="w-full h-80 rounded-2xl border border-slate-200 mb-8" title="Preview" />
              <div className="grid grid-cols-2 gap-4">
                <button onClick={handleDownload} className="py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all">Descargar</button>
                <button onClick={handleReset} className="py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold">Nuevo</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </main>
  );
}