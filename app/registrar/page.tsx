"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { supabase } from "@/src/lib/supabase";

const setores = [
  "Capas",
  "Películas",
  "Fones",
  "Carregadores",
  "Cabos",
  "Outros",
];

const fieldClassName =
  "w-full rounded-lg border border-slate-400 bg-white px-4 text-lg text-slate-950 placeholder:text-slate-500 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100";

const initialForm = {
  setor: "",
  produto: "",
  cor: "",
  quantidade: "1",
  observacao: "",
};

function formatSupabaseError(error: {
  message?: string;
  code?: string;
  details?: string | null;
  hint?: string | null;
}) {
  return [
    error.message,
    error.code ? `Codigo: ${error.code}` : "",
    error.details ? `Detalhes: ${error.details}` : "",
    error.hint ? `Dica: ${error.hint}` : "",
  ]
    .filter(Boolean)
    .join(" | ");
}

export default function RegistrarPage() {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(name: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
    setError("");
    setSuccess("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.setor || !form.produto.trim()) {
      setError("Informe o setor e o produto para registrar a falta.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    const quantidade = Number(form.quantidade);

    try {
      const { error: insertError } = await supabase
        .from("produtos_faltantes")
        .insert({
          setor: form.setor,
          produto: form.produto.trim(),
          cor: form.cor.trim() || null,
          quantidade:
            Number.isFinite(quantidade) && quantidade > 0 ? quantidade : 1,
          observacao: form.observacao.trim() || null,
        });

      if (insertError) {
        const formattedError = formatSupabaseError(insertError);
        console.warn("Erro ao registrar produto faltante:", formattedError);
        setError(`Erro ao registrar: ${formattedError}`);
        return;
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "erro inesperado";
      console.warn("Erro inesperado ao registrar produto faltante:", message);
      setError(`Erro ao registrar: ${message}`);
      return;
    } finally {
      setIsSubmitting(false);
    }

    setForm(initialForm);
    setSuccess("Produto registrado com sucesso.");
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
              Novo registro
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Registrar produto faltante
            </h1>
          </div>
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center rounded-lg border border-slate-200 bg-white px-5 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
          >
            Voltar
          </Link>
        </header>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-medium text-red-700">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 font-medium text-emerald-800">
              {success}
            </div>
          ) : null}

          <label className="block">
            <span className="mb-2 block text-base font-semibold text-slate-800">
              Setor *
            </span>
            <select
              value={form.setor}
              onChange={(event) => updateField("setor", event.target.value)}
              className={`h-14 ${fieldClassName}`}
            >
              <option value="">Selecione um setor</option>
              {setores.map((setor) => (
                <option key={setor} value={setor}>
                  {setor}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-base font-semibold text-slate-800">
              Produto *
            </span>
            <input
              value={form.produto}
              onChange={(event) => updateField("produto", event.target.value)}
              placeholder="Ex: Capa iPhone 15"
              className={`h-14 ${fieldClassName}`}
            />
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-base font-semibold text-slate-800">
                Cor
              </span>
              <input
                value={form.cor}
                onChange={(event) => updateField("cor", event.target.value)}
                placeholder="Ex: Preto"
                className={`h-14 ${fieldClassName}`}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-base font-semibold text-slate-800">
                Quantidade
              </span>
              <input
                type="number"
                min="1"
                value={form.quantidade}
                onChange={(event) =>
                  updateField("quantidade", event.target.value)
                }
                className={`h-14 ${fieldClassName}`}
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-base font-semibold text-slate-800">
              Observacao
            </span>
            <textarea
              value={form.observacao}
              onChange={(event) =>
                updateField("observacao", event.target.value)
              }
              rows={4}
              placeholder="Detalhes do modelo, urgencia ou pedido do cliente"
              className={`${fieldClassName} py-3`}
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="h-16 w-full rounded-lg bg-emerald-600 px-6 text-xl font-bold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isSubmitting ? "Registrando..." : "Registrar Produto"}
          </button>
        </form>
      </div>
    </main>
  );
}
