import {useEffect, useMemo, useState} from "react";
import {ChevronLeft, ChevronRight, Ellipsis, GraduationCap, Search, ShieldCheck, User, Users, X} from "lucide-react";
import AdminLayout from "../../components/administrador/AdminLayout";
import {apiFetch} from "../../services/api";
import {iniciais} from "../../services/usuarioLogado";
import styles from "./Administrador.module.css";

const POR_PAGINA = 8;

type Tipo = "ALUNO" | "PROFESSOR" | "ADMINISTRADOR";

interface UsuarioApi {
    id: number;
    nomeUsuario: string;
    usuario: string;
    tipoUsuario?: string;
    dataCadastro?: string;
    dataCriacao?: string;
    criadoEm?: string;
}

interface TurmaApi {
    id: number;
    nome: string;
    alunos?: { id: number }[];
    professor?: { id: number } | null;
}

interface LogLogin {
    usuarioId: number | null;
    dataHora: string;
}

interface Usuario {
    id: number;
    nome: string;
    email: string;
    tipo: Tipo;
    cadastro: string | null;
    ultimoAcesso: string | null;
    turmas: string[];
}

const TIPO: Record<Tipo, { rotulo: string; classe: string; icone: typeof User }> = {
    ALUNO: {rotulo: "Aluno", classe: styles.badgeNeutro, icone: User},
    PROFESSOR: {rotulo: "Professor", classe: styles.badgeMint, icone: GraduationCap},
    ADMINISTRADOR: {rotulo: "Administrador", classe: styles.badgeOuro, icone: ShieldCheck},
};

function tipoDe(valor?: string): Tipo {
    const v = valor?.toUpperCase();
    return v === "PROFESSOR" || v === "ADMINISTRADOR" ? v : "ALUNO";
}

function identificador(id: number) {
    return `USR-${String(id).padStart(3, "0")}`;
}

function formatar(iso: string | null, comHora = true) {
    if (!iso) return "—";
    const data = new Date(iso);
    if (Number.isNaN(data.getTime())) return "—";
    const dia = data.toLocaleDateString("pt-BR");
    return comHora ? `${dia}, ${data.toLocaleTimeString("pt-BR", {hour: "2-digit", minute: "2-digit"})}` : dia;
}

function BadgeTipo({tipo}: { tipo: Tipo }) {
    const {rotulo, classe, icone: Icone} = TIPO[tipo];
    return (
        <span className={`${styles.badge} ${classe}`}>
            <Icone size={13}/> {rotulo}
        </span>
    );
}

function Usuarios() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [busca, setBusca] = useState("");
    const [perfil, setPerfil] = useState("");
    const [pagina, setPagina] = useState(0);
    const [detalhe, setDetalhe] = useState<Usuario | null>(null);

    useEffect(() => {
        async function carregar() {
            try {
                const [respUsuarios, respTurmas, respLogs] = await Promise.all([
                    apiFetch("/usuarios/all"),
                    apiFetch("/turmas/all"),
                    apiFetch("/logs?acao=LOGIN&resultado=SUCESSO&page=0&size=1000"),
                ]);

                if (!respUsuarios.ok) throw new Error("Falha ao consultar os usuários.");

                const lista: UsuarioApi[] = await respUsuarios.json();
                const turmas: TurmaApi[] = respTurmas.ok ? await respTurmas.json() : [];
                const logs: LogLogin[] = respLogs.ok ? ((await respLogs.json()).content ?? []) : [];

                const ultimo = new Map<number, string>();
                logs.forEach((log) => {
                    if (log.usuarioId == null) return;
                    const atual = ultimo.get(log.usuarioId);
                    if (!atual || new Date(log.dataHora) > new Date(atual)) ultimo.set(log.usuarioId, log.dataHora);
                });

                setUsuarios(lista.map((u) => ({
                    id: u.id,
                    nome: u.nomeUsuario,
                    email: u.usuario,
                    tipo: tipoDe(u.tipoUsuario),
                    cadastro: u.dataCadastro ?? u.dataCriacao ?? u.criadoEm ?? null,
                    ultimoAcesso: ultimo.get(u.id) ?? null,
                    turmas: turmas
                        .filter((t) => t.alunos?.some((a) => a.id === u.id) || t.professor?.id === u.id)
                        .map((t) => t.nome),
                })));
            } catch (error) {
                console.error("Erro ao carregar usuários:", error);
                setErro("Não foi possível carregar os usuários.");
            } finally {
                setCarregando(false);
            }
        }

        carregar();
    }, []);

    useEffect(() => {
        if (!detalhe) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setDetalhe(null);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [detalhe]);

    const filtrados = useMemo(() => {
        const termo = busca.trim().toLowerCase();
        return usuarios.filter((u) =>
            (!termo || u.nome.toLowerCase().includes(termo) || u.email.toLowerCase().includes(termo))
            && (!perfil || u.tipo === perfil)
        );
    }, [usuarios, busca, perfil]);

    const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
    const paginaAtual = Math.min(pagina, totalPaginas - 1);
    const visiveis = filtrados.slice(paginaAtual * POR_PAGINA, (paginaAtual + 1) * POR_PAGINA);
    const inicio = filtrados.length ? paginaAtual * POR_PAGINA + 1 : 0;
    const fim = paginaAtual * POR_PAGINA + visiveis.length;

    const contar = (tipo: Tipo) => usuarios.filter((u) => u.tipo === tipo).length;
    const resumo = [
        {valor: usuarios.length, rotulo: "Usuários cadastrados", icone: <Users size={22}/>, cor: styles.corLilas},
        {valor: contar("ALUNO"), rotulo: "Alunos", icone: <User size={22}/>, cor: styles.corMint},
        {valor: contar("PROFESSOR"), rotulo: "Professores", icone: <GraduationCap size={22}/>, cor: styles.corOuro},
        {valor: contar("ADMINISTRADOR"), rotulo: "Administradores", icone: <ShieldCheck size={22}/>, cor: styles.corCoral},
    ];

    function filtrar(acao: () => void) {
        acao();
        setPagina(0);
    }

    return (
        <AdminLayout>
            <header className={styles.header}>
                <div>
                    <span className={styles.eyebrow}>Administração</span>
                    <h1 className={styles.title}>Gestão de usuários</h1>
                    <p className={styles.subtitle}>Contas e perfis dos usuários do MenteUp.</p>
                </div>
            </header>

            <div className={styles.summary}>
                {resumo.map((item) => (
                    <div key={item.rotulo} className={`${styles.card} ${styles.summaryCard}`}>
                        <span className={item.cor}>{item.icone}</span>
                        <span>
                            <strong>{carregando ? "–" : item.valor}</strong>
                            <small>{item.rotulo}</small>
                        </span>
                    </div>
                ))}
            </div>

            <h2 className={styles.sectionTitle}>Todos os usuários</h2>

            <div className={styles.userFilters}>
                <label className={`${styles.search} ${styles.searchWide}`}>
                    <Search size={16}/>
                    <input
                        value={busca}
                        onChange={(e) => filtrar(() => setBusca(e.target.value))}
                        placeholder="Buscar por nome ou e-mail"
                        aria-label="Buscar por nome ou e-mail"
                    />
                </label>
                <select value={perfil} onChange={(e) => filtrar(() => setPerfil(e.target.value))} className={styles.select} aria-label="Perfil">
                    <option value="">Todos os perfis</option>
                    <option value="ALUNO">Aluno</option>
                    <option value="PROFESSOR">Professor</option>
                    <option value="ADMINISTRADOR">Administrador</option>
                </select>
            </div>

            {erro && <div className={styles.error} role="alert">{erro}</div>}

            <div className={`${styles.card} ${styles.tableCard}`}>
                <div className={styles.tableWrap}>
                    <table className={`${styles.table} ${styles.userTable}`}>
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>E-mail</th>
                                <th>Tipo de usuário</th>
                                <th>Último acesso</th>
                                <th aria-label="Mais informações"/>
                            </tr>
                        </thead>
                        <tbody>
                            {(carregando || visiveis.length === 0) && (
                                <tr>
                                    <td colSpan={5} className={styles.emptyCell}>
                                        {carregando ? "Carregando usuários..." : "Nenhum usuário encontrado."}
                                    </td>
                                </tr>
                            )}
                            {!carregando && visiveis.map((u) => (
                                <tr key={u.id}>
                                    <td>
                                        <span className={styles.person}>
                                            <span className={styles.avatar}>{iniciais(u.nome)}</span>
                                            <span>
                                                <strong>{u.nome}</strong>
                                                <small>{identificador(u.id)}</small>
                                            </span>
                                        </span>
                                    </td>
                                    <td className={styles.muted}>{u.email}</td>
                                    <td><BadgeTipo tipo={u.tipo}/></td>
                                    <td className={`${styles.muted} ${styles.nowrap}`}>{formatar(u.ultimoAcesso)}</td>
                                    <td>
                                        <button
                                            type="button"
                                            title="Mais informações"
                                            onClick={() => setDetalhe(u)}
                                            className={styles.iconButton}
                                        >
                                            <Ellipsis size={18}/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <footer className={styles.pager}>
                <span>{inicio}-{fim} de {filtrados.length} usuários</span>
                <div className={styles.pagerButtons}>
                    <button
                        type="button"
                        aria-label="Página anterior"
                        disabled={paginaAtual === 0}
                        onClick={() => setPagina(paginaAtual - 1)}
                        className={styles.roundButton}
                    >
                        <ChevronLeft size={18}/>
                    </button>
                    <span className={styles.pageCount}>{paginaAtual + 1} / {totalPaginas}</span>
                    <button
                        type="button"
                        aria-label="Próxima página"
                        disabled={paginaAtual + 1 >= totalPaginas}
                        onClick={() => setPagina(paginaAtual + 1)}
                        className={styles.roundButton}
                    >
                        <ChevronRight size={18}/>
                    </button>
                </div>
            </footer>

            {detalhe && (
                <div className={styles.overlay} onClick={() => setDetalhe(null)}>
                    <div
                        className={styles.modal}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="usuario-titulo"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button type="button" className={styles.modalClose} onClick={() => setDetalhe(null)} aria-label="Fechar">
                            <X size={18}/>
                        </button>
                        <h2 id="usuario-titulo" className={styles.modalTitle}>Detalhes do usuário</h2>
                        <p className={styles.modalSubtitle}>Informações cadastrais da conta selecionada.</p>
                        <div className={styles.modalHead}>
                            <strong>{detalhe.nome}</strong>
                        </div>
                        <dl className={styles.details}>
                            <div><dt>Identificador</dt><dd>{identificador(detalhe.id)}</dd></div>
                            <div><dt>E-mail</dt><dd>{detalhe.email}</dd></div>
                            <div><dt>Tipo de usuário</dt><dd>{TIPO[detalhe.tipo].rotulo}</dd></div>
                            <div><dt>Turmas</dt><dd>{detalhe.turmas.length ? detalhe.turmas.join(", ") : "—"}</dd></div>
                            <div><dt>Data de cadastro</dt><dd>{formatar(detalhe.cadastro, false)}</dd></div>
                            <div><dt>Último acesso</dt><dd>{formatar(detalhe.ultimoAcesso)}</dd></div>
                        </dl>
                        <button type="button" className={styles.closeButton} onClick={() => setDetalhe(null)}>
                            Fechar
                        </button>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

export default Usuarios;
