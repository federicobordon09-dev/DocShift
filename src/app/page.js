import Link from "next/link";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-white dark:bg-slate-950 px-6">
      
      {/* SECCIÓN PRINCIPAL (HERO) */}
      <section className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
        {/* Elementos decorativos de fondo */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

        <div className="max-w-4xl text-center z-10 animate-fade-in">
          <div className="inline-flex items-center space-x-2 mb-8 px-3 py-1 rounded-full border border-indigo-100 bg-indigo-50/50 dark:bg-indigo-900/20 dark:border-indigo-800">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 tracking-wide uppercase">
              DocShift v1.0
            </span>
          </div>

          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-8">
            Tus documentos, <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              perfectos en segundos
            </span>
          </h1>

          <p className="text-slate-500 dark:text-slate-400 text-xl md:text-2xl max-w-2xl mx-auto mb-12 leading-relaxed">
            La forma más rápida y elegante de convertir Word a PDF. 
            Sin marcas de agua, sin esperas, solo calidad profesional.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/upload"
              className="group relative inline-flex items-center justify-center bg-indigo-600 text-white px-10 py-5 rounded-2xl text-lg font-bold shadow-xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all hover:-translate-y-1 active:scale-95 overflow-hidden"
            >
              Empezar ahora — Es gratis
            </Link>
            
            <a
              href="#how-it-works"
              className="text-slate-600 dark:text-slate-300 font-semibold px-6 py-3 hover:text-indigo-600 transition-colors"
            >
              ¿Cómo funciona?
            </a>
          </div>
        </div>
      </section>

      {/* SECCIÓN: ¿CÓMO FUNCIONA? */}
      <section id="how-it-works" className="py-24 max-w-6xl mx-auto scroll-mt-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Proceso simple, resultados impecables
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            Hemos optimizado cada paso para que no pierdas tiempo en configuraciones innecesarias.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 transition-colors">
            <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mb-6 font-bold text-xl">1</div>
            <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Sube tu archivo</h3>
            <p className="text-slate-500 dark:text-slate-400">Arrastra tu documento .docx o .doc a nuestra plataforma segura.</p>
          </div>
          <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 transition-colors">
            <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mb-6 font-bold text-xl">2</div>
            <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Conversión inteligente</h3>
            <p className="text-slate-500 dark:text-slate-400">Nuestro motor procesa el archivo manteniendo el formato original.</p>
          </div>
          <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 transition-colors">
            <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mb-6 font-bold text-xl">3</div>
            <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Descarga inmediata</h3>
            <p className="text-slate-500 dark:text-slate-400">Obtén tu PDF limpio en segundos. Sin registros.</p>
          </div>
        </div>


        <footer className="mt-32 pt-8 border-t border-slate-100 dark:border-slate-800 text-center text-slate-400 text-sm">
          <p>© {new Date().getFullYear()} DocShift. Tu privacidad es nuestra prioridad.</p>
        </footer>
      </section>
    </main>
  );
}