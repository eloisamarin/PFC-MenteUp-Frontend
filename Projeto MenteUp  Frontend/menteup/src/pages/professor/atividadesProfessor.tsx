import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    BookOpen,
    CalendarDays,
    Eye,
    Pencil,
    Plus,
    Rocket,
    Search,
    Trash2,
    TriangleAlert,
} from "lucide-react";

import ProfessorLayout from "../../components/professor/ProfessorLayout";
import { apiFetch, lerErro } from "../../services/api";
// Mesmo visual da lista de atividades do aluno
import base from "../aluno/atividadesAluno.module.css";
import styles from "./atividadesProfessor.module.css";

type StatusAtividade = "PENDENTE" | "EM_ANDAMENTO" | "CONCLUIDO";

type Atividade = {
    id: number | string;
    titulo: string;
    descricao?: string;
    pontuacao: number;
    status: StatusAtividade;
    dataCriacao?: string;
    turma?: {
        id: number | string;
        nome?: string;
    };
};

type Filtro = "TODAS" | StatusAtividade;

const FILTROS: { id: Filtro; rotulo: string }[] = [
    { id: "TODAS", rotulo: "Todas" },
    { id: "EM_ANDAMENTO", rotulo: "Ativas" },
    { id: "PENDENTE", rotulo: "Rascunhos" },
    { id: "CONCLUIDO", rotulo: "Encerradas" },
];

const STATUS: Record<StatusAtividade, { rotulo: string; classe: string }> = {
    PENDENTE: { rotulo: "Rascunho", classe: "statusDraft" },
    EM_ANDAMENTO: { rotulo: "Ativa", classe: "statusActive" },
    CONCLUIDO: { rotulo: "Encerrada", classe: "statusClosed" },
};

function formatarData(data?: string) {
    if (!data) return null;
    const d = new Date(data);
    return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString("pt-BR");
}

function AtividadesProfessor() {
    const navigate = useNavigate();

    const [atividades, setAtividades] = useState<Atividade[]>([]);
    const [busca, setBusca] = useState("");
    const [filtro, setFiltro] = useState<Filtro>("TODAS");
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [aviso, setAviso] = useState("");

    const [paraExcluir, setParaExcluir] = useState<Atividade | null>(null);
    const [excluindo, setExcluindo] = useState(false);
    const [publicandoId, setPublicandoId] = useState<Atividade["id"] | null>(null);

    /* ---------- Carregar ---------- */

    async function carregarAtividades() {
        try {
            setCarregando(true);
            setErro("");

            const resposta = await apiFetch("/atividades");

            if (!resposta.ok) {
                throw new Error("Erro ao carregar atividades");
            }

            const dados: Atividade[] = await resposta.json();
            setAtividades([...dados].sort((a, b) => Number(b.id) - Number(a.id)));
        } catch (error) {
            console.error(error);
            setErro("Não foi possível carregar as atividades.");
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        carregarAtividades();
    }, []);

    // Aviso de sucesso some sozinho
    useEffect(() => {
        if (!aviso) return;
        const t = window.setTimeout(() => setAviso(""), 4000);
        return () => window.clearTimeout(t);
    }, [aviso]);

    /* ---------- Ações ---------- */

    const visualizar = (a: Atividade) => navigate(`/professor/atividades/${a.id}`);
    const editar = (a: Atividade) => navigate(`/professor/atividades/editar/${a.id}`);

    async function publicar(atividade: Atividade) {
        try {
            setPublicandoId(atividade.id);
            setErro("");

            const resposta = await apiFetch("/atividades", {
                method: "PUT",
                body: JSON.stringify({
                    id: atividade.id,
                    titulo: atividade.titulo,
                    descricao: atividade.descricao,
                    pontuacao: atividade.pontuacao,
                    status: "EM_ANDAMENTO",
                    turma: { id: atividade.turma?.id },
                }),
            });

            if (!resposta.ok) {
                const erroApi = await lerErro(resposta, "Não foi possível publicar a atividade.");
                setErro(erroApi.mensagem);
                return;
            }

            setAviso(`"${atividade.titulo}" foi publicada para os alunos.`);
            await carregarAtividades();
        } catch (error) {
            console.error(error);
            setErro("Erro ao publicar a atividade.");
        } finally {
            setPublicandoId(null);
        }
    }

    async function confirmarExclusao() {
        if (!paraExcluir) return;

        try {
            setExcluindo(true);
            setErro("");

            const resposta = await apiFetch(`/atividades/${paraExcluir.id}`, { method: "DELETE" });

            if (!resposta.ok) {
                const padrao =
                    resposta.status === 404
                        ? "Atividade não encontrada."
                        : resposta.status === 403
                          ? "Você não tem permissão para excluir esta atividade."
                          : "Não foi possível excluir a atividade.";
                const erroApi = await lerErro(resposta, padrao);
                setErro(erroApi.mensagem);
                setParaExcluir(null);
                return;
            }

            setAtividades((lista) => lista.filter((a) => a.id !== paraExcluir.id));
            setAviso(`"${paraExcluir.titulo}" foi excluída.`);
            setParaExcluir(null);
        } catch (error) {
            console.error(error);
            setErro("Erro ao excluir a atividade.");
            setParaExcluir(null);
        } finally {
            setExcluindo(false);
        }
    }

    // Esc fecha a confirmação
    useEffect(() => {
        if (!paraExcluir) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !excluindo) setParaExcluir(null);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [paraExcluir, excluindo]);

    /* ---------- Filtros ---------- */

    const contagem = useMemo(() => {
        const c: Record<Filtro, number> = {
            TODAS: atividades.length,
            PENDENTE: 0,
            EM_ANDAMENTO: 0,
            CONCLUIDO: 0,
        };
        atividades.forEach((a) => {
            if (a.status in c) c[a.status]++;
        });
        return c;
    }, [atividades]);

    const filtradas = useMemo(() => {
        const termo = busca.trim().toLowerCase();
        return atividades.filter((a) => {
            const passaFiltro = filtro === "TODAS" || a.status === filtro;
            const passaBusca =
                !termo ||
                a.titulo.toLowerCase().includes(termo) ||
                (a.turma?.nome ?? "").toLowerCase().includes(termo);
            return passaFiltro && passaBusca;
        });
    }, [atividades, filtro, busca]);

    /* ---------- Tela ---------- */

    return (
        <ProfessorLayout>
            {/* CABEÇALHO */}
            <header className={`${base.header} ${styles.headerRow}`}>
                <div>
                    <span className={base.eyebrow}>Gestão de conteúdo</span>
                    <h1 className={base.title}>Atividades</h1>
                    <p className={base.subtitle}>
                        Crie, publique e acompanhe as missões das suas turmas.
                    </p>
                </div>
                <button
                    type="button"
                    className={styles.createButton}
                    onClick={() => navigate("/professor/atividades/criar")}
                >
                    <Plus size={16} /> Criar atividade
                </button>
            </header>

            {/* FILTROS + BUSCA */}
            <div className={base.toolbar}>
                <div className={base.tabs} role="tablist" aria-label="Filtrar atividades">
                    {FILTROS.map((f) => (
                        <button
                            key={f.id}
                            type="button"
                            role="tab"
                            aria-selected={filtro === f.id}
                            className={`${base.tab} ${filtro === f.id ? base.tabActive : ""}`}
                            onClick={() => setFiltro(f.id)}
                        >
                            {f.rotulo}
                            {!carregando && <span className={base.tabCount}>{contagem[f.id]}</span>}
                        </button>
                    ))}
                </div>

                <label className={base.search}>
                    <Search size={16} />
                    <input
                        type="search"
                        placeholder="Buscar atividade ou turma..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                    />
                </label>
            </div>

            {erro && (
                <div className={base.error} role="alert">
                    {erro}
                </div>
            )}
            {aviso && (
                <div className={styles.success} role="status">
                    {aviso}
                </div>
            )}

            {/* LISTA */}
            {carregando ? (
                <div className={base.grid}>
                    {[0, 1, 2].map((i) => (
                        <div key={i} className={`${base.card} ${base.skeleton}`} />
                    ))}
                </div>
            ) : filtradas.length === 0 ? (
                <div className={base.empty}>
                    <BookOpen size={40} />
                    {atividades.length === 0 ? (
                        <>
                            <strong>Nenhuma atividade criada ainda</strong>
                            <span>Crie a primeira missão para as suas turmas.</span>
                            <button
                                type="button"
                                className={base.primaryButton}
                                onClick={() => navigate("/professor/atividades/criar")}
                            >
                                <Plus size={16} /> Criar atividade
                            </button>
                        </>
                    ) : (
                        <>
                            <strong>Nenhuma atividade encontrada</strong>
                            <span>Tente outro filtro ou outro termo de busca.</span>
                        </>
                    )}
                </div>
            ) : (
                <div className={base.grid}>
                    {filtradas.map((atividade) => {
                        const status = STATUS[atividade.status] ?? STATUS.PENDENTE;
                        const data = formatarData(atividade.dataCriacao);
                        const rascunho = atividade.status === "PENDENTE";

                        return (
                            <article key={atividade.id} className={base.card}>
                                <div className={base.cardTop}>
                                    <span className={base.chip} title="Turma">
                                        {atividade.turma?.nome ?? "Sem turma"}
                                    </span>
                                    <span className={base.xp}>+{atividade.pontuacao} XP</span>
                                </div>

                                <div className={base.cardBody}>
                                    <h2 className={base.cardTitle} title={atividade.titulo}>
                                        {atividade.titulo}
                                    </h2>
                                    {data && (
                                        <span className={base.date}>
                                            <CalendarDays size={14} />
                                            Criada em {data}
                                        </span>
                                    )}
                                    {atividade.descricao && (
                                        <p className={styles.description}>{atividade.descricao}</p>
                                    )}
                                </div>

                                <div className={styles.statusRow}>
                                    <span className={`${styles.status} ${styles[status.classe]}`}>
                                        {status.rotulo}
                                    </span>
                                    {rascunho && (
                                        <button
                                            type="button"
                                            className={styles.publish}
                                            onClick={() => publicar(atividade)}
                                            disabled={publicandoId === atividade.id}
                                        >
                                            <Rocket size={14} />
                                            {publicandoId === atividade.id ? "Publicando..." : "Publicar"}
                                        </button>
                                    )}
                                </div>

                                {/* AÇÕES */}
                                <div className={styles.actions}>
                                    <button
                                        type="button"
                                        className={`${base.primaryButton} ${styles.grow}`}
                                        onClick={() => visualizar(atividade)}
                                    >
                                        <Eye size={16} /> Visualizar
                                    </button>
                                    <button
                                        type="button"
                                        className={`${base.secondaryButton} ${styles.iconButton}`}
                                        onClick={() => editar(atividade)}
                                        title="Editar atividade"
                                        aria-label={`Editar ${atividade.titulo}`}
                                    >
                                        <Pencil size={18} />
                                    </button>
                                    <button
                                        type="button"
                                        className={`${base.secondaryButton} ${styles.iconButton} ${styles.danger}`}
                                        onClick={() => setParaExcluir(atividade)}
                                        title="Excluir atividade"
                                        aria-label={`Excluir ${atividade.titulo}`}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}

            {/* CONFIRMAÇÃO DE EXCLUSÃO */}
            {paraExcluir && (
                <div
                    className={styles.overlay}
                    onClick={() => !excluindo && setParaExcluir(null)}
                >
                    <div
                        className={styles.dialog}
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="excluir-titulo"
                        aria-describedby="excluir-texto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <span className={styles.dialogIcon}>
                            <TriangleAlert size={28} />
                        </span>
                        <h2 id="excluir-titulo" className={styles.dialogTitle}>
                            Excluir atividade?
                        </h2>
                        <p id="excluir-texto" className={styles.dialogText}>
                            <strong>{paraExcluir.titulo}</strong> será removida permanentemente,
                            junto com as perguntas e respostas dos alunos. Essa ação não pode ser
                            desfeita.
                        </p>
                        <div className={styles.dialogActions}>
                            <button
                                type="button"
                                className={base.secondaryButton}
                                onClick={() => setParaExcluir(null)}
                                disabled={excluindo}
                                autoFocus
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                className={styles.dangerButton}
                                onClick={confirmarExclusao}
                                disabled={excluindo}
                            >
                                <Trash2 size={16} />
                                {excluindo ? "Excluindo..." : "Excluir"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ProfessorLayout>
    );
}

export default AtividadesProfessor;
