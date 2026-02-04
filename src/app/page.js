import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex items-center justify-center px-6">
      <div className="max-w-3xl text-center">
        <span className="inline-block mb-4 px-4 py-1 text-sm font-medium bg-black text-white rounded-full">
          DocShift
        </span>

        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Convertí tus documentos
          <br />
          en segundos
        </h1>

        <p className="text-gray-600 text-lg mb-10">
          Subí archivos Word y obtené PDFs limpios, listos para enviar,
          imprimir o compartir. Sin registros. Sin vueltas.
        </p>

        <Link
          href="/upload"
          className="inline-flex items-center justify-center bg-black text-white px-8 py-4 rounded-xl text-lg font-medium hover:bg-gray-800 hover:scale-105 transition-transform"
        >
          Empezar ahora
        </Link>
      </div>
    </main>
  );
}
