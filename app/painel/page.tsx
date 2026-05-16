"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ProdutoFaltante, supabase } from "@/src/lib/supabase";

const setores = [
  "Todos",
  "Capas",
  "Películas",
  "Fones",
  "Carregadores",
  "Cabos",
  "Outros",
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function PainelPage() {
  const [produtos, setProdutos] = useState<ProdutoFaltante[]>([]);
  const [setorAtivo, setSetorAtivo] = useState("Todos");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProdutos() {
      setIsLoading(true);
      setError("");

      const { data, error: selectError } = await supabase
        .from("produtos_faltantes")
        .select("id,setor,produto,cor,quantidade,observacao,created_at")
        .order("created_at", { ascending: false });

      if (selectError) {
        setError("Nao foi possivel carregar os registros.");
        setProdutos([]);
      } else {
        setProdutos((data ?? []) as ProdutoFaltante[]);
      }

      setIsLoading(false);
    }

    loadProdutos();
  }, []);

  const produtosFiltrados = useMemo(() => {
    if (setorAtivo === "Todos") {
      return produtos;
    }

    return produtos.filter((produto) => produto.setor === setorAtivo);
  }, [produtos, setorAtivo]);

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
              Painel
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Produtos registrados
            </h1>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/registrar"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-emerald-600 px-5 font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              Registrar Produto
            </Link>
            <Link
              href="/"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-slate-200 bg-white px-5 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
            >
              Voltar
            </Link>
          </div>
        </header>

        <section className="mb-5">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {setores.map((setor) => {
              const isActive = setorAtivo === setor;

              return (
                <button
                  key={setor}
                  type="button"
                  onClick={() => setSetorAtivo(setor)}
                  className={`h-12 shrink-0 rounded-lg px-5 text-base font-semibold transition ${
                    isActive
                      ? "bg-slate-950 text-white"
                      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {setor}
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <p className="font-semibold text-slate-800">
              {produtosFiltrados.length} registro
              {produtosFiltrados.length === 1 ? "" : "s"} encontrado
              {produtosFiltrados.length === 1 ? "" : "s"}
            </p>
          </div>

          {isLoading ? (
            <div className="px-5 py-12 text-center text-lg font-medium text-slate-500">
              Carregando registros...
            </div>
          ) : error ? (
            <div className="px-5 py-12 text-center text-lg font-medium text-red-600">
              {error}
            </div>
          ) : produtosFiltrados.length === 0 ? (
            <div className="px-5 py-12 text-center text-lg font-medium text-slate-500">
              Nenhum produto registrado para este filtro.
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {produtosFiltrados.map((item) => (
                <article
                  key={item.id}
                  className="grid gap-3 px-5 py-4 md:grid-cols-[1fr_auto] md:items-center"
                >
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700">
                        {item.setor}
                      </span>
                      <span className="text-sm font-medium text-slate-500">
                        {formatDate(item.created_at)}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-950">
                      {item.produto}
                    </h2>
                    <p className="mt-1 text-base text-slate-600">
                      {item.cor ? `Cor: ${item.cor}` : "Cor nao informada"}
                      {item.observacao ? ` - ${item.observacao}` : ""}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-100 px-4 py-3 text-center">
                    <p className="text-sm font-semibold text-slate-500">
                      Quantidade
                    </p>
                    <p className="text-2xl font-bold text-slate-950">
                      {item.quantidade ?? 1}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
