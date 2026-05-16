"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
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

const setoresEditaveis = setores.filter((setor) => setor !== "Todos");

const fieldClassName =
  "w-full rounded-lg border border-slate-400 bg-white px-3 text-base text-slate-950 placeholder:text-slate-500 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100";

type EditForm = {
  setor: string;
  produto: string;
  cor: string;
  quantidade: string;
  observacao: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getFriendlyError(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }

  return "Tente novamente em alguns instantes.";
}

function getInitialEditForm(item: ProdutoFaltante): EditForm {
  return {
    setor: item.setor,
    produto: item.produto,
    cor: item.cor ?? "",
    quantidade: String(item.quantidade ?? 1),
    observacao: item.observacao ?? "",
  };
}

export default function PainelPage() {
  const [produtos, setProdutos] = useState<ProdutoFaltante[]>([]);
  const [setorAtivo, setSetorAtivo] = useState("Todos");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    async function loadProdutos() {
      setIsLoading(true);
      setError("");

      const { data, error: selectError } = await supabase
        .from("produtos_faltantes")
        .select("id,setor,produto,cor,quantidade,observacao,created_at")
        .order("created_at", { ascending: false });

      if (selectError) {
        console.error(selectError);
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

  function clearMessages() {
    setError("");
    setFeedback("");
  }

  function startEditing(item: ProdutoFaltante) {
    clearMessages();
    setEditingId(item.id);
    setEditForm(getInitialEditForm(item));
  }

  function cancelEditing() {
    setEditingId(null);
    setEditForm(null);
  }

  function updateEditField(name: keyof EditForm, value: string) {
    setEditForm((current) =>
      current ? { ...current, [name]: value } : current,
    );
    clearMessages();
  }

  async function handleDelete(item: ProdutoFaltante) {
    const confirmed = window.confirm(
      "Tem certeza que deseja excluir este registro?",
    );

    if (!confirmed) {
      return;
    }

    clearMessages();
    setBusyId(item.id);

    const { error: deleteError } = await supabase
      .from("produtos_faltantes")
      .delete()
      .eq("id", item.id);

    setBusyId(null);

    if (deleteError) {
      console.error(deleteError);
      setError(`Nao foi possivel excluir o registro. ${getFriendlyError(deleteError)}`);
      return;
    }

    setProdutos((current) => current.filter((produto) => produto.id !== item.id));

    if (editingId === item.id) {
      cancelEditing();
    }

    setFeedback("Registro excluído com sucesso");
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingId || !editForm) {
      return;
    }

    if (!editForm.setor || !editForm.produto.trim()) {
      setError("Informe o setor e o produto antes de salvar.");
      return;
    }

    clearMessages();
    setBusyId(editingId);

    const quantidade = Number(editForm.quantidade);
    const payload = {
      setor: editForm.setor,
      produto: editForm.produto.trim(),
      cor: editForm.cor.trim() || null,
      quantidade: Number.isFinite(quantidade) && quantidade > 0 ? quantidade : 1,
      observacao: editForm.observacao.trim() || null,
    };

    const { error: updateError } = await supabase
      .from("produtos_faltantes")
      .update(payload)
      .eq("id", editingId);

    setBusyId(null);

    if (updateError) {
      console.error(updateError);
      setError(`Nao foi possivel salvar as alteracoes. ${getFriendlyError(updateError)}`);
      return;
    }

    setProdutos((current) =>
      current.map((produto) =>
        produto.id === editingId ? { ...produto, ...payload } : produto,
      ),
    );
    cancelEditing();
    setFeedback("Registro atualizado com sucesso");
  }

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

        {feedback ? (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 font-medium text-emerald-800">
            {feedback}
          </div>
        ) : null}

        {error ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-medium text-red-700">
            {error}
          </div>
        ) : null}

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
          ) : produtosFiltrados.length === 0 ? (
            <div className="px-5 py-12 text-center text-lg font-medium text-slate-500">
              Nenhum produto registrado para este filtro.
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {produtosFiltrados.map((item) => {
                const isEditing = editingId === item.id && editForm;
                const isBusy = busyId === item.id;

                return (
                  <article key={item.id} className="px-5 py-4">
                    {isEditing ? (
                      <form onSubmit={handleSave} className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <label className="block">
                            <span className="mb-2 block text-sm font-semibold text-slate-800">
                              Setor
                            </span>
                            <select
                              value={editForm.setor}
                              onChange={(event) =>
                                updateEditField("setor", event.target.value)
                              }
                              className={`h-12 ${fieldClassName}`}
                            >
                              {setoresEditaveis.map((setor) => (
                                <option key={setor} value={setor}>
                                  {setor}
                                </option>
                              ))}
                            </select>
                          </label>

                          <label className="block">
                            <span className="mb-2 block text-sm font-semibold text-slate-800">
                              Produto
                            </span>
                            <input
                              value={editForm.produto}
                              onChange={(event) =>
                                updateEditField("produto", event.target.value)
                              }
                              className={`h-12 ${fieldClassName}`}
                            />
                          </label>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <label className="block">
                            <span className="mb-2 block text-sm font-semibold text-slate-800">
                              Cor
                            </span>
                            <input
                              value={editForm.cor}
                              onChange={(event) =>
                                updateEditField("cor", event.target.value)
                              }
                              placeholder="Cor nao informada"
                              className={`h-12 ${fieldClassName}`}
                            />
                          </label>

                          <label className="block">
                            <span className="mb-2 block text-sm font-semibold text-slate-800">
                              Quantidade
                            </span>
                            <input
                              type="number"
                              min="1"
                              value={editForm.quantidade}
                              onChange={(event) =>
                                updateEditField(
                                  "quantidade",
                                  event.target.value,
                                )
                              }
                              className={`h-12 ${fieldClassName}`}
                            />
                          </label>
                        </div>

                        <label className="block">
                          <span className="mb-2 block text-sm font-semibold text-slate-800">
                            Observacao
                          </span>
                          <textarea
                            value={editForm.observacao}
                            onChange={(event) =>
                              updateEditField("observacao", event.target.value)
                            }
                            rows={3}
                            placeholder="Sem observacao"
                            className={`${fieldClassName} py-3`}
                          />
                        </label>

                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                          <button
                            type="button"
                            onClick={cancelEditing}
                            disabled={isBusy}
                            className="h-11 rounded-lg border border-slate-300 bg-white px-5 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            disabled={isBusy}
                            className="h-11 rounded-lg bg-emerald-600 px-5 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                          >
                            {isBusy ? "Salvando..." : "Salvar alterações"}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="grid gap-4 lg:grid-cols-[1fr_auto_auto] lg:items-center">
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
                            {item.cor
                              ? `Cor: ${item.cor}`
                              : "Cor nao informada"}
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

                        <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
                          <button
                            type="button"
                            onClick={() => startEditing(item)}
                            disabled={Boolean(busyId)}
                            className="h-11 rounded-lg border border-slate-300 bg-white px-5 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            disabled={Boolean(busyId)}
                            className="h-11 rounded-lg border border-red-200 bg-red-50 px-5 font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isBusy ? "Excluindo..." : "Excluir"}
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
