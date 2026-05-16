import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-10">
      <section className="w-full max-w-3xl">
        <div className="mb-10 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
            I LIKE MOBIS - P15 - WALLIG
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Sistema de Registro de Faltas
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-600">
            Registre rapidamente o que o cliente procurou e acompanhe os itens
            mais pedidos por setor.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/registrar"
            className="flex min-h-40 items-center justify-center rounded-lg bg-emerald-600 px-8 text-center text-2xl font-bold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200"
          >
            Registrar Produto
          </Link>
          <Link
            href="/painel"
            className="flex min-h-40 items-center justify-center rounded-lg border border-slate-200 bg-white px-8 text-center text-2xl font-bold text-slate-950 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 focus:outline-none focus:ring-4 focus:ring-emerald-100"
          >
            Ver Produtos Registrados
          </Link>
        </div>
      </section>
    </main>
  );
}
