import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, CalendarDays, ChevronRight, Lock, Search } from "lucide-react";

import AlunoLayout from "../../components/aluno/AlunoLayout";
import ProgressoCard from "../../components/aluno/ProgressoCard";
import { apiFetch } from "../../services/api";
import { visaoStatus, type AtividadeAluno, type VisaoStatus } from "../../types/aluno";
import styles from "./atividadesAluno.module.css";

type Filtro = "TODAS" | VisaoStatus;

const FILTROS: { id: Filtro; rotulo: string }[] = [
    { id: "TODAS", rotulo: "Todas" },
    { id: "EM_ANDAMENTO", rotulo: "Em andamento" },
    { id: "PENDENTE", rotulo: "Disponíveis" },
    { id: "CONCLUIDA", rotulo: "Concluídas" },
    { id: "ENCERRADA", rotulo: "Encerradas" },
];

const ROTULO_STATUS: Record<VisaoStatus, string> = {
    PENDENTE: "Disponível",
    EM_ANDAMENTO: "Em progresso",
    CONCLUIDA: "Concluída",
    ENCERRADA: "Encerrada",
};

function formatarData(data?: string) {
    if (!data) return null;
    const d = new Date(data);
    return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString("pt-BR");
}

function percentual(item: AtividadeAluno, visao: VisaoStatus) {
    if (visao === "CONCLUIDA") return 100;
    return Math.max(0, Math.min(100, Math.round(item.percentualConclusao ?? 0)));
}

function AtividadesAluno() {
    const navigate = useNavigate();

    const [itens, setItens] = useState<AtividadeAluno[]>([]);
    const [busca, setBusca] = useState("");
    const [filtro, setFiltro] = useState<Filtro>("TODAS");
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    useEffect(() => {
        async function buscarAtividades() {
            try {
                setCarregando(true);
                setErro("");

                const resposta = await apiFetch("/alunos/me/atividades");

                if (!resposta.ok) {
                    throw new Error("Não foi possível carregar as atividades.");
                }

                const dados: AtividadeAluno[] = await resposta.json();
                setItens(dados);
            } catch (error) {
                console.error("Erro ao buscar atividades:", error);
                setErro("Não foi possível carregar as atividades.");
            } finally {
                setCarregando(false);
            }
        }
        buscarAtividades();
    }, []);

    const contagem = useMemo(() => {
        const c: Record<Filtro, number> = {
            TODAS: itens.length,
            PENDENTE: 0,
            EM_ANDAMENTO: 0,
            CONCLUIDA: 0,
            ENCERRADA: 0,
        };
        itens.forEach((item) => c[visaoStatus(item)]++);
        return c;
    }, [itens]);

    const itensFiltrados = useMemo(() => {
        const termo = busca.trim().toLowerCase();
        return itens.filter((item) => {
            const passaFiltro = filtro === "TODAS" || visaoStatus(item) === filtro;
            const passaBusca =
                !termo ||
                item.atividade.titulo.toLowerCase().includes(termo) ||
                (item.atividade.turma?.nome ?? "").toLowerCase().includes(termo);
            return passaFiltro && passaBusca;
        });
    }, [itens, filtro, busca]);

    const filtrosVisiveis = FILTROS.filter((f) => f.id !== "ENCERRADA" || contagem.ENCERRADA > 0);

    function abrir(id: number) {
        navigate(`/aluno/atividades/responder/${id}`);
    }

    return (
        <AlunoLayout
            sidebarExtra={
                !carregando && itens.length > 0 ? (
                    <ProgressoCard concluidas={contagem.CONCLUIDA} total={itens.length} />
                ) : undefined
            }
        >
            <header className={styles.header}>
                <span className={styles.eyebrow}>Sua jornada</span>
                <h1 className={styles.title}>Atividades</h1>
                <p className={styles.subtitle}>
                    Escolha a próxima missão e avance no seu mapa de aprendizagem.
                </p>
            </header>

            <div className={styles.toolbar}>
                <div className={styles.tabs} role="tablist" aria-label="Filtrar atividades">
                    {filtrosVisiveis.map((f) => (
                        <button
                            key={f.id}
                            type="button"
                            role="tab"
                            aria-selected={filtro === f.id}
                            className={`${styles.tab} ${filtro === f.id ? styles.tabActive : ""}`}
                            onClick={() => setFiltro(f.id)}
                        >
                            {f.rotulo}
                            {!carregando && <span className={styles.tabCount}>{contagem[f.id]}</span>}
                        </button>
                    ))}
                </div>

                <label className={styles.search}>
                    <Search size={16} />
                    <input
                        type="search"
                        placeholder="Buscar atividade ou turma..."
                        value={busca}
                        onChange={(event) => setBusca(event.target.value)}
                    />
                </label>
            </div>

            {erro && (
                <div className={styles.error} role="alert">
                    {erro}
                </div>
            )}

            {carregando ? (
                <div className={styles.grid}>
                    {[0, 1, 2].map((i) => (
                        <div key={i} className={`${styles.card} ${styles.skeleton}`} />
                    ))}
                </div>
            ) : itensFiltrados.length === 0 ? (
                <div className={styles.empty}>
                    <BookOpen size={40} />
                    {itens.length === 0 ? (
                        <>
                            <strong>Nenhuma atividade por aqui ainda</strong>
                            <span>Entre em uma turma para ver as atividades dela.</span>
                            <button
                                type="button"
                                className={styles.primaryButton}
                                onClick={() => navigate("/aluno/turmas")}
                            >
                                Ver turmas <ChevronRight size={16} />
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
                <div className={styles.grid}>
                    {itensFiltrados.map((item) => {
                        const { atividade } = item;
                        const visao = visaoStatus(item);
                        const pct = percentual(item, visao);
                        const data = formatarData(atividade.dataCriacao);

                        const xp =
                            visao === "CONCLUIDA" && item.pontuacao !== null
                                ? `${item.pontuacao}/${atividade.pontuacao} XP`
                                : `+${atividade.pontuacao} XP`;

                        return (
                            <article key={atividade.id} className={styles.card}>
                                <div className={styles.cardTop}>
                                    <span className={styles.chip} title="Turma">
                                        {atividade.turma?.nome ?? "Sem turma"}
                                    </span>
                                    <span className={styles.xp}>{xp}</span>
                                </div>

                                <div className={styles.cardBody}>
                                    <h2 className={styles.cardTitle} title={atividade.titulo}>
                                        {atividade.titulo}
                                    </h2>
                                    {data && (
                                        <span className={styles.date}>
                                            <CalendarDays size={14} />
                                            Publicada em {data}
                                        </span>
                                    )}
                                </div>

                                <div>
                                    <div
                                        className={styles.track}
                                        role="progressbar"
                                        aria-valuenow={pct}
                                        aria-valuemin={0}
                                        aria-valuemax={100}
                                    >
                                        <div className={styles.fill} style={{ width: `${pct}%` }} />
                                    </div>
                                    <div className={styles.trackLabels}>
                                        <span>{pct}% concluída</span>
                                        <span>{ROTULO_STATUS[visao]}</span>
                                    </div>
                                </div>

                                {visao === "ENCERRADA" ? (
                                    <button type="button" className={styles.secondaryButton} disabled>
                                        <Lock size={16} /> Encerrada
                                    </button>
                                ) : visao === "CONCLUIDA" ? (
                                    <button
                                        type="button"
                                        className={styles.secondaryButton}
                                        onClick={() => abrir(atividade.id)}
                                    >
                                        Ver resultado <ChevronRight size={16} />
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        className={styles.primaryButton}
                                        onClick={() => abrir(atividade.id)}
                                    >
                                        {visao === "EM_ANDAMENTO" ? "Continuar" : "Começar"}
                                        <ChevronRight size={16} />
                                    </button>
                                )}
                            </article>
                        );
                    })}
                </div>
            )}
        </AlunoLayout>
    );
}

export default AtividadesAluno;
