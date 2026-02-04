"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState("idle");
  const [progress, setProgress] = useState(0);
  const [pdfBlob, setPdfBlob] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);

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

  // PROGRESO CONTROLADO
  useEffect(() => {
    let interval;

    if (step === "uploading") {
      setProgress(0);
      interval = setInterval(() => {
        setProgress((p) => (p < 30 ? p + 2 : p));
      }, 100);
    }

    if (step === "converting") {
      setProgress(30);
      interval = setInterval(() => {
        setProgress((p) => (p < 90 ? p + 1 : p));
      }, 150);
    }

    if (step === "done") {
      setProgress(100);
    }

    if (step === "error") {
      setProgress(0);
    }

    return () => clearInterval(interval);
  }, [step]);

  async function handleConvert() {
    if (!file) return;

    setError("");
    setStep("uploading");

    try {
      const formData = new FormData();
      formData.append("file", file);

      await new Promise((r) => setTimeout(r, 300));
      setStep("converting");

      const response = await fetch("/api/convert", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error desconocido");
      }

      const blob = await response.blob();
      setPdfBlob(blob);
      const url = window.URL.createObjectURL(blob);
      setPdfUrl(url);

      setStep("done");
    } catch (err) {
      setError(err.message);
      setStep("error");
    }
  }

  function handleDownload() {
    if (!pdfBlob) return;

    const url = window.URL.createObjectURL(pdfBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "docshift.pdf";
    a.click();
    window.URL.revokeObjectURL(url);
  }

  function handleReset() {
    setFile(null);
    setStep("idle");
    setProgress(0);
    setPdfBlob(null);
    if (pdfUrl) {
      window.URL.revokeObjectURL(pdfUrl);
    }
    setPdfUrl(null);
    setError("");
  }

  const isDisabled = step !== "idle" && step !== "done";

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-white shadow-xl rounded-2xl p-10 w-full max-w-lg"
      >
        <AnimatePresence mode="wait">
          {step !== "done" ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">
                Subí tu documento
              </h2>

              <p className="text-gray-500 text-center mb-8">
                Convertimos archivos Word (.docx, .doc) a PDF
              </p>

              <motion.div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
                animate={{
                  scale: isDragging ? 1.02 : 1,
                  backgroundColor: isDragging ? "#f3f4f6" : "#ffffff",
                  borderColor: isDragging ? "#000000" : "#d1d5db",
                }}
                transition={{ duration: 0.2 }}
                className="border-2 border-dashed rounded-xl p-10 text-center cursor-pointer"
                onClick={() => document.getElementById("fileInput").click()}
              >
                {!file ? (
                  <>
                    <p className="text-gray-600 mb-2">
                      Arrastrá tu archivo acá
                    </p>
                    <p className="text-sm text-gray-400">
                      o hacé click para seleccionarlo
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-gray-800 font-medium">
                      {file.name}
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                      Archivo listo para convertir
                    </p>
                  </>
                )}

                <input
                  id="fileInput"
                  type="file"
                  accept=".docx,.doc"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files[0])}
                />
              </motion.div>

              {/* PROGRESO */}
              <AnimatePresence>
                {step !== "idle" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mt-6"
                  >
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-black"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      />
                    </div>

                    <AnimatePresence mode="wait">
                      <motion.p
                        key={step}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.2 }}
                        className="mt-2 text-sm text-center text-gray-600"
                      >
                        {step === "uploading" && "Subiendo archivo..."}
                        {step === "converting" && "Convirtiendo documento..."}
                      </motion.p>
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ERROR */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.25 }}
                    className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm text-center"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={handleConvert}
                disabled={!file || isDisabled}
                className={`w-full mt-8 py-4 rounded-xl text-lg font-medium transition
                  ${
                    file && !isDisabled
                      ? "bg-black text-white hover:bg-gray-800"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }
                `}
              >
                {isDisabled ? "Procesando..." : "Convertir a PDF"}
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">
                PDF Listo
              </h2>

              <p className="text-gray-500 text-center mb-6">
                Tu documento se convirtió correctamente
              </p>

              {/* PDF PREVIEW */}
              <div className="mb-8 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                <iframe
                  src={pdfUrl}
                  className="w-full h-96"
                  title="PDF Preview"
                />
              </div>

              {/* BOTONES */}
              <div className="space-y-3">
                <button
                  onClick={handleDownload}
                  className="w-full py-4 rounded-xl text-lg font-medium bg-black text-white hover:bg-gray-800 transition"
                >
                  Descargar PDF
                </button>

                <button
                  onClick={handleReset}
                  className="w-full py-4 rounded-xl text-lg font-medium bg-gray-200 text-gray-900 hover:bg-gray-300 transition"
                >
                  Convertir otro
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </main>
  );
}
