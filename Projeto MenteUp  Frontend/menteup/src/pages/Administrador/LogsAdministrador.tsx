import {useNavigate} from "react-router-dom";
import {type FormEvent, useCallback, useEffect, useState} from "react";
import {apiFetch, lerErro} from "../../services/api.ts";
import {BookOpen, RefreshCw, ScrollText, Search, X} from "lucide-react";

const ACOES = [
    "CRIAR_ATIVIDADE",
    "EDITAR_ATIVIDADE",
    "EXCLUIR_ATIVIDADE",
    "PUBLICAR_ATIVIDADE",
    "CRIAR_QUESTAO",
    "EDITAR_QUESTAO",
    "EXCLUIR_QUESTAO",
    "CRIAR_TURMA",
    "ADICIONAR_ALUNO_TURMA",
    "REMOVER_ALUNO_TURMA",
    "LOGIN",
    "INICIAR_ATIVIDADE",
    "CONCLUIR_ATIVIDADE",
    "RESPONDER_QUESTAO",
    "DESBLOQUEAR_CONQUISTA",
    "FALHA_LOGIN",
    "ERRO_SISTEMA",
    "ALTERACAO_PERMISSAO",
] as const;

const ENTIDADES = [
    "ATIVIDADE",
    "QUESTIONARIO",
    "QUESTAO",
    "TURMA",
    "USUARIO",
    "CONQUISTA",
] as const;

const TAMANHO_PAGINA = 20;

interface LogSistema {
    id: number;
    usuarioId: number | null;
    nomeUsuario: string | null;
    acao: string;
    entidade: string | null;
    entidadeId: number | null;
    dataHora: string;
    resultado: "SUCESSO" | "FALHA";
    descricao: string | null;
    ip: string | null;
    dados: string | null;
}

interface PaginaLogs {
    content: LogSistema[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

function formatarData(iso: string) {
    try {
        return new Date(iso).toLocaleString("pt-BR");
    } catch {
        return iso;
    }
}

function formatarDados(dados: string | null) {
    if (!dados) return "-";
    try {
        return JSON.stringify(JSON.parse(dados), null, 2);
    } catch {
        return dados;
    }
}

function LogsAdministrador() {
    const navigate = useNavigate();

    const [pagina, setPagina] = useState<PaginaLogs | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("")
    const [detalhe, setDetalhe] = useState<LogSistema | null>(null);

    const [filtroAcao, setFiltroAcao] = useState("");
    const [filtroEntidade, setFiltroEntidade] = useState("");
    const [filtroResultado, setFiltroResultado] = useState("");
    const [filtroUsuarioId, setFiltroUsuarioId] = useState("");
    const [numeroPagina, setNumeroPagina] = useState(0);

    const carregarLogs = useCallback(async () => {
        try {
            setCarregando(true);
            setErro("");

            const params = new URLSearchParams();
            params.set("page", String(numeroPagina));
            params.set("size", String(TAMANHO_PAGINA));
            if (filtroAcao) params.set("acao", filtroAcao);
            if (filtroEntidade) params.set("entidade", filtroEntidade);
            if (filtroResultado) params.set("resultado", filtroResultado);
            if (filtroUsuarioId) params.set("usuarioId", filtroUsuarioId);

            const resposta = await apiFetch(`/logs?${params.toString()}`);

            if (!resposta.ok) {
                const erroApi = await lerErro(resposta, "Não foi possivel carregar os logs");
                throw new Error(erroApi.mensagem);
            }

            const dados: PaginaLogs = await resposta.json();
            setPagina(dados);
        } catch (error) {
            console.error("Erro ao carregar logs:", error);
            setErro(
                error instanceof Error ? error.message : "Não foi possivel carregar os logs"
            );
        } finally {
            setCarregando(false);
        }
    }, [numeroPagina, filtroAcao, filtroEntidade, filtroResultado, filtroUsuarioId]);

    useEffect(() => {
        carregarLogs();
    }, [carregarLogs]);

    function aplicarFiltros(event: FormEvent) {
        event.preventDefault();

        if (numeroPagina === 0) {
            carregarLogs();
        } else {
            setNumeroPagina(0);
        }
    }

    function limparFiltros() {
        setFiltroAcao("");
        setFiltroEntidade("");
        setFiltroResultado("");
        setFiltroUsuarioId("");
        setNumeroPagina(0);
    }

    const logs = pagina?.content ?? [];

    return (
        <div className="min-h-screen bg-[#f5f6fc] text-slate-800">
            <aside className="fixed left-0 top-0 h-screen w-56 bg-[#121329] text-white">
                <div className="flex items-center gap-3 px-6 py-6">
                    <div
                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 font-bold">
                        M
                    </div>
                    <span className="text-lg font-bold">
            Mente<span className="text-purple-400">Up</span>
          </span>
                </div>
                <nav className="mt-6 space-y-2 px-3">
                    <button
                        onClick={() => navigate("/administrador/dashboard")}
                        className="w-full rounded-lg px-4 py-3 text-left text-sm text-slate-300 hover:bg-white/10"
                    >
                        Dashboard
                    </button>
                    <button
                        onClick={() => navigate("/administrador/usuarios")}
                        className="w-full rounded-lg px-4 py-3 text-left text-sm text-slate-300 hover:bg-white/10"
                    >
                        Usuários
                    </button>
                    <button
                        onClick={() => navigate("/administrador/atividades")}
                        className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm text-slate-300 hover:bg-white/10"
                    >
                        <BookOpen size={17}/> Atividades
                    </button>
                    <button
                        onClick={() => navigate("/administrador/logs")}
                        className="flex w-full items-center gap-3 rounded-lg bg-white/10 px-4 py-3 text-left text-sm font-medium text-white"
                    >
                        <ScrollText size={17}/> Logs
                    </button>
                </nav>
            </aside>

            <main className="ml-56 min-h-screen">
                <header className="flex h-20 items-center justify-between border-b bg-white px-8">
                    <h1 className="text-lg font-semibold">Logs do sistema</h1>
                    <span className="text-sm font-semibold text-slate-600">Administrador</span>
                </header>

                <section className="p-8">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-semibold">Auditoria</h2>
                            <p className="mt-1 text-sm text-slate-400">
                                {pagina ? `${pagina.totalElements} registro(s)` : "Carregando..."}
                            </p>
                        </div>
                        <button
                            onClick={carregarLogs}
                            disabled={carregando}
                            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                        >
                            <RefreshCw size={15} className={carregando ? "animate-spin" : ""}/>
                            {carregando ? "Atualizando..." : "Atualizar"}
                        </button>
                    </div>

                    <form
                        onSubmit={aplicarFiltros}
                        className="mb-6 grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-5"
                    >
                        <select
                            value={filtroAcao}
                            onChange={(event) => setFiltroAcao(event.target.value)}
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
                        >
                            <option value="">Todas as ações</option>
                            {ACOES.map((acao) => (
                                <option key={acao} value={acao}>
                                    {acao}
                                </option>
                            ))}
                        </select>

                        <select
                            value={filtroEntidade}
                            onChange={(event) => setFiltroEntidade(event.target.value)}
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
                        >
                            <option value="">Todas as entidades</option>
                            {ENTIDADES.map((entidade) => (
                                <option key={entidade} value={entidade}>
                                    {entidade}
                                </option>
                            ))}
                        </select>

                        <select
                            value={filtroResultado}
                            onChange={(event) => setFiltroResultado(event.target.value)}
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
                        >
                            <option value="">Sucesso e falha</option>
                            <option value="SUCESSO">Sucesso</option>
                            <option value="FALHA">Falha</option>
                        </select>

                        <input
                            value={filtroUsuarioId}
                            onChange={(event) => setFiltroUsuarioId(event.target.value.replace(/\D/g, ""))}
                            placeholder="ID do usuário"
                            inputMode="numeric"
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
                        />

                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-sm font-semibold text-white"
                            >
                                <Search size={15}/> Filtrar
                            </button>
                            <button
                                type="button"
                                onClick={limparFiltros}
                                className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-500 hover:bg-slate-50"
                            >
                                Limpar
                            </button>
                        </div>
                    </form>

                    {erro && (
                        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                            {erro}
                        </div>
                    )}

                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b bg-slate-50">
                                <tr className="text-left text-xs uppercase text-slate-400">
                                    <th className="px-5 py-4">Data/hora</th>
                                    <th className="px-5 py-4">Ação</th>
                                    <th className="px-5 py-4">Entidade</th>
                                    <th className="px-5 py-4">Usuário</th>
                                    <th className="px-5 py-4">Resultado</th>
                                    <th className="px-5 py-4">Descrição</th>
                                    <th className="px-5 py-4 text-center">Detalhes</th>
                                </tr>
                                </thead>
                                <tbody>
                                {!carregando && logs.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-5 py-12 text-center text-sm text-slate-400">
                                            Nenhum log encontrado para os filtros selecionados.
                                        </td>
                                    </tr>
                                )}
                                {logs.map((log) => (
                                    <tr key={log.id} className="border-b last:border-b-0 hover:bg-slate-50">
                                        <td className="whitespace-nowrap px-5 py-4 text-sm">
                                            {formatarData(log.dataHora)}
                                        </td>
                                        <td className="px-5 py-4 text-sm font-medium">{log.acao}</td>
                                        <td className="px-5 py-4 text-sm text-slate-500">
                                            {log.entidade
                                                ? `${log.entidade}${log.entidadeId != null ? ` #${log.entidadeId}` : ""}`
                                                : "—"}
                                        </td>
                                        <td className="px-5 py-4 text-sm">
                                            {log.nomeUsuario ?? <span className="text-slate-400">—</span>}
                                        </td>
                                        <td className="px-5 py-4">
                        <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                log.resultado === "SUCESSO"
                                    ? "bg-emerald-50 text-emerald-600"
                                    : "bg-red-50 text-red-600"
                            }`}
                        >
                          {log.resultado}
                        </span>
                                        </td>
                                        <td
                                            className="max-w-xs truncate px-5 py-4 text-sm text-slate-500"
                                            title={log.descricao ?? ""}
                                        >
                                            {log.descricao ?? "—"}
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <button
                                                title="Ver detalhes"
                                                onClick={() => setDetalhe(log)}
                                                className="rounded p-2 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
                                            >
                                                <Search size={15}/>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {pagina && pagina.totalPages > 1 && (
                        <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
              <span>
                Página {pagina.number + 1} de {pagina.totalPages}
              </span>
                            <div className="flex gap-2">
                                <button
                                    disabled={pagina.number <= 0}
                                    onClick={() => setNumeroPagina((atual) => Math.max(0, atual - 1))}
                                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 disabled:opacity-40"
                                >
                                    Anterior
                                </button>
                                <button
                                    disabled={pagina.number + 1 >= pagina.totalPages}
                                    onClick={() => setNumeroPagina((atual) => atual + 1)}
                                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 disabled:opacity-40"
                                >
                                    Próxima
                                </button>
                            </div>
                        </div>
                    )}
                </section>
            </main>

            {detalhe && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
                    onClick={() => setDetalhe(null)}
                >
                    <div
                        className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Log #{detalhe.id}</h3>
                            <button
                                onClick={() => setDetalhe(null)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <X size={18}/>
                            </button>
                        </div>
                        <dl className="space-y-3 text-sm">
                            <div>
                                <dt className="font-medium text-slate-500">Ação</dt>
                                <dd>{detalhe.acao}</dd>
                            </div>
                            <div>
                                <dt className="font-medium text-slate-500">Entidade</dt>
                                <dd>
                                    {detalhe.entidade
                                        ? `${detalhe.entidade}${
                                            detalhe.entidadeId != null ? ` #${detalhe.entidadeId}` : ""
                                        }`
                                        : "—"}
                                </dd>
                            </div>
                            <div>
                                <dt className="font-medium text-slate-500">Usuário</dt>
                                <dd>
                                    {detalhe.nomeUsuario
                                        ? `${detalhe.nomeUsuario} (#${detalhe.usuarioId})`
                                        : "—"}
                                </dd>
                            </div>
                            <div>
                                <dt className="font-medium text-slate-500">Resultado</dt>
                                <dd>{detalhe.resultado}</dd>
                            </div>
                            <div>
                                <dt className="font-medium text-slate-500">Data/hora</dt>
                                <dd>{formatarData(detalhe.dataHora)}</dd>
                            </div>
                            <div>
                                <dt className="font-medium text-slate-500">IP</dt>
                                <dd>{detalhe.ip ?? "—"}</dd>
                            </div>
                            <div>
                                <dt className="font-medium text-slate-500">Descrição</dt>
                                <dd>{detalhe.descricao ?? "—"}</dd>
                            </div>
                            <div>
                                <dt className="font-medium text-slate-500">Dados</dt>
                                <dd>
                  <pre className="mt-1 max-h-52 overflow-auto rounded-lg bg-slate-50 p-3 text-xs">
                    {formatarDados(detalhe.dados)}
                  </pre>
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>
            )}
        </div>
    );
}

export default LogsAdministrador;