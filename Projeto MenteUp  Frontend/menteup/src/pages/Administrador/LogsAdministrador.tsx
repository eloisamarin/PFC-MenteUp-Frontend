import {type FormEvent, type ReactNode, useCallback, useEffect, useState} from "react";
import {
    Activity,
    ChevronLeft,
    ChevronRight,
    Ellipsis,
    LogIn,
    RefreshCw,
    Search,
    Settings,
    ShieldAlert,
    ShieldCheck,
    UserPlus,
    X,
} from "lucide-react";
import AdminLayout from "../../components/administrador/AdminLayout";
import {apiFetch, lerErro} from "../../services/api";
import {obterUsuarioLogado} from "../../services/usuarioLogado";
import styles from "./Administrador.module.css";

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

interface Categoria {
    rotulo: string;
    icone: ReactNode;
    cor: string;
}

function categoria(acao: string): Categoria {
    if (acao === "LOGIN") return {rotulo: "Login", icone: <LogIn size={16}/>, cor: styles.corIndigo};
    if (acao === "FALHA_LOGIN" || acao === "ALTERACAO_PERMISSAO") {
        return {rotulo: "Segurança", icone: <ShieldAlert size={16}/>, cor: styles.corCoral};
    }
    if (acao === "ERRO_SISTEMA") return {rotulo: "Sistema", icone: <Settings size={16}/>, cor: styles.corCoral};
    if (acao.includes("TURMA")) return {rotulo: "Cadastro", icone: <UserPlus size={16}/>, cor: styles.corLilas};
    if (acao.includes("ATIVIDADE") || acao.includes("QUESTAO") || acao.includes("CONQUISTA")) {
        return {rotulo: "Atividade", icone: <Activity size={16}/>, cor: styles.corOuro};
    }
    return {rotulo: "Sistema", icone: <Settings size={16}/>, cor: styles.corIndigo};
}

function legivel(valor: string) {
    const texto = valor.toLowerCase().replace(/_/g, " ");
    return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function formatarData(iso: string) {
    const data = new Date(iso);
    if (Number.isNaN(data.getTime())) return iso;
    const hora = data.toLocaleTimeString("pt-BR", {hour: "2-digit", minute: "2-digit"});
    const hoje = new Date();
    const ontem = new Date();
    ontem.setDate(hoje.getDate() - 1);
    if (data.toDateString() === hoje.toDateString()) return `Hoje, ${hora}`;
    if (data.toDateString() === ontem.toDateString()) return `Ontem, ${hora}`;
    return `${data.toLocaleDateString("pt-BR")}, ${hora}`;
}

function formatarDados(dados: string | null) {
    if (!dados) return "-";
    try {
        return JSON.stringify(JSON.parse(dados), null, 2);
    } catch {
        return dados;
    }
}

function entidadeDe(log: LogSistema) {
    if (!log.entidade) return null;
    return `${legivel(log.entidade)}${log.entidadeId != null ? ` #${log.entidadeId}` : ""}`;
}

function LogsAdministrador() {
    const usuario = obterUsuarioLogado();

    const [pagina, setPagina] = useState<PaginaLogs | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [detalhe, setDetalhe] = useState<LogSistema | null>(null);
    const [atualizadoEm, setAtualizadoEm] = useState<Date | null>(null);

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
                const erroApi = await lerErro(resposta, "Não foi possível carregar os logs.");
                throw new Error(erroApi.mensagem);
            }

            setPagina(await resposta.json());
            setAtualizadoEm(new Date());
        } catch (error) {
            console.error("Erro ao carregar logs:", error);
            setErro(error instanceof Error ? error.message : "Não foi possível carregar os logs.");
        } finally {
            setCarregando(false);
        }
    }, [numeroPagina, filtroAcao, filtroEntidade, filtroResultado, filtroUsuarioId]);

    useEffect(() => {
        carregarLogs();
    }, [carregarLogs]);

    useEffect(() => {
        if (!detalhe) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setDetalhe(null);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [detalhe]);

    function aplicarFiltros(event: FormEvent) {
        event.preventDefault();
        if (numeroPagina === 0) carregarLogs();
        else setNumeroPagina(0);
    }

    function limparFiltros() {
        setFiltroAcao("");
        setFiltroEntidade("");
        setFiltroResultado("");
        setFiltroUsuarioId("");
        setNumeroPagina(0);
    }

    const logs = pagina?.content ?? [];
    const total = pagina?.totalElements ?? 0;

    return (
        <AdminLayout>
            <header className={styles.header}>
                <div>
                    <span className={styles.eyebrow}>Administração</span>
                    <h1 className={styles.title}>Logs do sistema</h1>
                    <p className={styles.subtitle}>Acompanhe acessos, atividades e eventos importantes da plataforma.</p>
                </div>
                <button type="button" onClick={carregarLogs} disabled={carregando} className={styles.ghostButton}>
                    <RefreshCw size={15} className={carregando ? styles.spin : ""}/>
                    {carregando ? "Atualizando..." : "Atualizar"}
                </button>
            </header>

            <div className={styles.identity}>
                <span className={styles.identityIcon}>
                    <ShieldCheck size={20}/>
                </span>
                <span>
                    <strong>{usuario?.nome ?? usuario?.usuario ?? "Administrador"}</strong>
                    <small>Administrador</small>
                </span>
            </div>

            <section className={`${styles.card} ${styles.panel}`}>
                <div className={styles.panelHeader}>
                    <div>
                        <h2 className={styles.panelTitle}>Histórico de eventos</h2>
                        <p className={styles.panelSubtitle}>
                            {atualizadoEm
                                ? `Atualizado às ${atualizadoEm.toLocaleTimeString("pt-BR", {hour: "2-digit", minute: "2-digit"})}`
                                : "Carregando..."}
                            {pagina && ` · ${total.toLocaleString("pt-BR")} registro(s)`}
                        </p>
                    </div>
                </div>

                <form onSubmit={aplicarFiltros} className={styles.filters}>
                    <select value={filtroAcao} onChange={(e) => setFiltroAcao(e.target.value)} className={styles.select} aria-label="Ação">
                        <option value="">Todas as ações</option>
                        {ACOES.map((acao) => (
                            <option key={acao} value={acao}>{legivel(acao)}</option>
                        ))}
                    </select>
                    <select value={filtroEntidade} onChange={(e) => setFiltroEntidade(e.target.value)} className={styles.select} aria-label="Entidade">
                        <option value="">Todas as entidades</option>
                        {ENTIDADES.map((entidade) => (
                            <option key={entidade} value={entidade}>{legivel(entidade)}</option>
                        ))}
                    </select>
                    <select value={filtroResultado} onChange={(e) => setFiltroResultado(e.target.value)} className={styles.select} aria-label="Resultado">
                        <option value="">Sucesso e falha</option>
                        <option value="SUCESSO">Sucesso</option>
                        <option value="FALHA">Falha</option>
                    </select>
                    <label className={styles.search}>
                        <Search size={16}/>
                        <input
                            value={filtroUsuarioId}
                            onChange={(e) => setFiltroUsuarioId(e.target.value.replace(/\D/g, ""))}
                            placeholder="ID do usuário"
                            inputMode="numeric"
                            aria-label="ID do usuário"
                        />
                    </label>
                    <div className={styles.filterActions}>
                        <button type="submit" className={styles.primaryButton}>Filtrar</button>
                        <button type="button" onClick={limparFiltros} className={styles.ghostButton}>Limpar</button>
                    </div>
                </form>

                {erro && <div className={styles.error} role="alert">{erro}</div>}

                <div className={styles.tableWrap}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Evento</th>
                                <th>Ação</th>
                                <th>Usuário</th>
                                <th>Data e hora</th>
                                <th>Status</th>
                                <th aria-label="Detalhes"/>
                            </tr>
                        </thead>
                        <tbody>
                            {!carregando && logs.length === 0 && (
                                <tr>
                                    <td colSpan={6} className={styles.emptyCell}>
                                        Nenhum log encontrado para os filtros selecionados.
                                    </td>
                                </tr>
                            )}
                            {logs.map((log) => {
                                const cat = categoria(log.acao);
                                const entidade = entidadeDe(log);
                                return (
                                    <tr key={log.id}>
                                        <td>
                                            <span className={`${styles.evento} ${cat.cor}`}>
                                                {cat.icone} {cat.rotulo}
                                            </span>
                                        </td>
                                        <td className={styles.acaoCell}>
                                            <strong title={log.descricao ?? ""}>{log.descricao ?? legivel(log.acao)}</strong>
                                            <small>{legivel(log.acao)}{entidade && ` · ${entidade}`}</small>
                                        </td>
                                        <td className={styles.muted}>{log.nomeUsuario ?? "—"}</td>
                                        <td className={`${styles.muted} ${styles.nowrap}`}>{formatarData(log.dataHora)}</td>
                                        <td>
                                            <span className={`${styles.badge} ${log.resultado === "SUCESSO" ? styles.badgeMint : styles.badgeCoral}`}>
                                                {log.resultado === "SUCESSO" ? "Sucesso" : "Falha"}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                type="button"
                                                title="Ver detalhes"
                                                aria-label="Ver detalhes do registro"
                                                onClick={() => setDetalhe(log)}
                                                className={styles.iconButton}
                                            >
                                                <Ellipsis size={18}/>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <footer className={styles.pager}>
                    <span>
                        Exibindo {logs.length} de {total.toLocaleString("pt-BR")} eventos
                        {pagina && pagina.totalPages > 1 && ` · página ${pagina.number + 1} de ${pagina.totalPages}`}
                    </span>
                    <div className={styles.pagerButtons}>
                        <button
                            type="button"
                            aria-label="Página anterior"
                            disabled={!pagina || pagina.number <= 0}
                            onClick={() => setNumeroPagina((atual) => Math.max(0, atual - 1))}
                            className={styles.roundButton}
                        >
                            <ChevronLeft size={18}/>
                        </button>
                        <button
                            type="button"
                            aria-label="Próxima página"
                            disabled={!pagina || pagina.number + 1 >= pagina.totalPages}
                            onClick={() => setNumeroPagina((atual) => atual + 1)}
                            className={`${styles.roundButton} ${styles.roundPrimary}`}
                        >
                            <ChevronRight size={18}/>
                        </button>
                    </div>
                </footer>
            </section>

            {detalhe && (
                <div className={styles.overlay} onClick={() => setDetalhe(null)}>
                    <div
                        className={styles.modal}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="log-titulo"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button type="button" className={styles.modalClose} onClick={() => setDetalhe(null)} aria-label="Fechar">
                            <X size={18}/>
                        </button>
                        <h2 id="log-titulo" className={styles.modalTitle}>Detalhes do evento</h2>
                        <p className={styles.modalSubtitle}>Registro completo do log selecionado.</p>
                        <div className={styles.modalHead}>
                            <strong>Log #{detalhe.id}</strong>
                            <span className={`${styles.badge} ${detalhe.resultado === "SUCESSO" ? styles.badgeMint : styles.badgeCoral}`}>
                                {detalhe.resultado === "SUCESSO" ? "Sucesso" : "Falha"}
                            </span>
                        </div>
                        <dl className={styles.details}>
                            <div><dt>Ação</dt><dd>{legivel(detalhe.acao)}</dd></div>
                            <div><dt>Entidade</dt><dd>{entidadeDe(detalhe) ?? "—"}</dd></div>
                            <div>
                                <dt>Usuário</dt>
                                <dd>{detalhe.nomeUsuario ? `${detalhe.nomeUsuario} (#${detalhe.usuarioId})` : "—"}</dd>
                            </div>
                            <div><dt>Data e hora</dt><dd>{new Date(detalhe.dataHora).toLocaleString("pt-BR")}</dd></div>
                            <div><dt>IP</dt><dd>{detalhe.ip ?? "—"}</dd></div>
                            <div><dt>Descrição</dt><dd>{detalhe.descricao ?? "—"}</dd></div>
                        </dl>
                        <span className={styles.dataLabel}>Dados</span>
                        <pre className={styles.data}>{formatarDados(detalhe.dados)}</pre>
                        <button type="button" className={styles.closeButton} onClick={() => setDetalhe(null)}>
                            Fechar
                        </button>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

export default LogsAdministrador;
