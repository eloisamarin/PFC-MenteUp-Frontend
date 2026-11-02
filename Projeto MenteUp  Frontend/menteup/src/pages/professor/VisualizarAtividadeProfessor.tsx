import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    BookOpen,
    ChevronLeft,
    ChevronRight,
    FileQuestion,
    Gamepad2,
    Pencil,
    TriangleAlert,
    Trophy,
    Users,
    Zap,
} from "lucide-react";

import ProfessorLayout from "../../components/professor/ProfessorLayout";
import { PlayerAssociacao, PlayerPergunta } from "../../components/atividades/Players";
import { apiFetch, lerErro } from "../../services/api";
import { NOME_TIPO, type TipoAtividade } from "../../types/aluno";
import styles from "./VisualizarAtividadeProfessor.module.css";

interface Alternativa {
    id: number;
    texto: string;
    correta?: boolean;
    ordem?: number;
}

interface Pergunta {
    id: number;
    texto?: string;
    enunciado?: string;
    alternativas: Alternativa[];
}

interface Atividade {
    id: number;
    titulo: string;
    descricao: string;
    pontuacao: number;
    status: string;
    tipo?: TipoAtividade;
    turma?: {
        id: number;
        nome: string;
    };
    perguntas: Pergunta[];
}

interface QuestionarioResponse {
    atividade?: Atividade;
    perguntas?: Pergunta[];
}

const STATUS: Record<string, { rotulo: string; classe: string }> = {
    PENDENTE: { rotulo: "Rascunho", classe: "statusDraft" },
    EM_ANDAMENTO: { rotulo: "Ativa", classe: "statusActive" },
    CONCLUIDO: { rotulo: "Encerrada", classe: "statusClosed" },
};

function VisualizarAtividadeProfessor() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [atividade, setAtividade] = useState<Atividade | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [indice, setIndice] = useState(0);

    useEffect(() => {
        const buscarAtividade = async () => {
            try {
                const usuarioSalvo = localStorage.getItem("usuario");

                if (!usuarioSalvo) {
                    navigate("/login");
                    return;
                }

                if (!id) {
                    setErro("ID da atividade não informado.");
                    return;
                }

                const response = await apiFetch(`/atividades/${id}`);

                if (!response.ok) {
                    const erroApi = await lerErro(response, "Atividade não encontrada.");
                    setErro(erroApi.mensagem);
                    return;
                }

                const dados: QuestionarioResponse & Atividade = await response.json();
                const base: Atividade = dados.atividade ?? dados;

                setErro("");
                setAtividade({
                    ...base,
                    perguntas: dados.perguntas ?? base.perguntas ?? [],
                });
            } catch (error) {
                console.error("Erro ao buscar atividade:", error);
                setErro("Não foi possível carregar a atividade.");
            } finally {
                setCarregando(false);
            }
        };

        buscarAtividade();
    }, [id, navigate]);

    const perguntas = atividade?.perguntas ?? [];
    const total = perguntas.length;

    useEffect(() => {
        if (total === 0) return;

        function onKey(e: KeyboardEvent) {
            if (e.key === "ArrowRight") setIndice((i) => Math.min(i + 1, total - 1));
            if (e.key === "ArrowLeft") setIndice((i) => Math.max(i - 1, 0));
        }

        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [total]);

    const voltar = () => navigate("/professor/atividades");

    const topo = (
        <div className={styles.topRow}>
            <button type="button" className={styles.back} onClick={voltar}>
                <ChevronLeft size={18} /> Voltar
            </button>
            {atividade && (
                <div className={styles.topActions}>
                    <button
                        type="button"
                        className={styles.editButton}
                        onClick={() => navigate(`/professor/atividades/editar/${atividade.id}`)}
                    >
                        <Pencil size={16} /> Editar
                    </button>
                    <span className={styles.xpChip}>
                        <Zap size={26} />+{atividade.pontuacao} XP
                    </span>
                </div>
            )}
        </div>
    );

    if (carregando) {
        return (
            <ProfessorLayout compacto>
                {topo}
                <section className={`${styles.card} ${styles.center}`}>
                    <div className={styles.spinner} aria-hidden />
                    <h2 className={styles.stateTitle}>Carregando atividade...</h2>
                    <p className={styles.muted}>Aguarde enquanto buscamos os dados.</p>
                </section>
            </ProfessorLayout>
        );
    }

    if (!atividade) {
        return (
            <ProfessorLayout compacto>
                {topo}
                <section className={`${styles.card} ${styles.center}`}>
                    <TriangleAlert size={40} className={styles.coral} />
                    <h2 className={styles.stateTitle}>Atividade não encontrada</h2>
                    <p className={styles.muted}>
                        {erro || "Não foi possível encontrar esta atividade."}
                    </p>
                    <button type="button" className={styles.primary} onClick={voltar}>
                        <ChevronLeft size={16} /> Voltar para atividades
                    </button>
                </section>
            </ProfessorLayout>
        );
    }

    const status = STATUS[atividade.status] ?? { rotulo: atividade.status, classe: "statusClosed" };
    const tipo = atividade.tipo ?? "QUIZ";
    const associacao = tipo === "ASSOCIACAO";
    const pergunta = perguntas[indice];
    const percentual = associacao ? 100 : total ? Math.round(((indice + 1) / total) * 100) : 0;
    const paraPlayer = (p: Pergunta) => ({ ...p, texto: p.texto ?? p.enunciado ?? "" });

    return (
        <ProfessorLayout compacto>
            {topo}

            <header className={styles.info}>
                <div className={styles.infoMain}>
                    <div className={styles.infoTitleRow}>
                        <span className={styles.eyebrow}>Atividade</span>
                        <span className={`${styles.status} ${styles[status.classe]}`}>
                            {status.rotulo}
                        </span>
                    </div>
                    <h1 className={styles.title}>{atividade.titulo}</h1>
                    {atividade.descricao && <p className={styles.description}>{atividade.descricao}</p>}
                </div>

                <div className={styles.infoStats}>
                    <div className={styles.infoStat}>
                        <Trophy size={18} className={styles.gold} />
                        <span>
                            <small>Pontuação</small>
                            <strong>{atividade.pontuacao} pontos</strong>
                        </span>
                    </div>
                    <div className={styles.infoStat}>
                        <Users size={18} className={styles.mint} />
                        <span>
                            <small>Turma</small>
                            <strong>{atividade.turma?.nome || "Não informada"}</strong>
                        </span>
                    </div>
                    <div className={styles.infoStat}>
                        <BookOpen size={18} className={styles.indigo} />
                        <span>
                            <small>Perguntas</small>
                            <strong>{total}</strong>
                        </span>
                    </div>
                    <div className={styles.infoStat}>
                        <Gamepad2 size={18} className={styles.indigo} />
                        <span>
                            <small>Template</small>
                            <strong>{NOME_TIPO[tipo] ?? tipo}</strong>
                        </span>
                    </div>
                </div>
            </header>

            {total === 0 || !pergunta ? (
                <section className={`${styles.card} ${styles.center}`}>
                    <FileQuestion size={40} className={styles.muted} />
                    <h2 className={styles.stateTitle}>Nenhuma pergunta cadastrada</h2>
                    <p className={styles.muted}>Esta atividade ainda não possui perguntas.</p>
                    <button
                        type="button"
                        className={styles.primary}
                        onClick={() => navigate(`/professor/atividades/editar/${atividade.id}`)}
                    >
                        <Pencil size={16} /> Adicionar perguntas
                    </button>
                </section>
            ) : (
                <section className={styles.card}>
                    <header className={styles.cardHeader}>
                        <span className={styles.subject}>Perguntas da atividade</span>
                        <span className={styles.counter}>
                            {associacao ? `${total} pares` : `Questão ${indice + 1} de ${total}`}
                        </span>
                    </header>

                    <div
                        className={styles.track}
                        role="progressbar"
                        aria-valuenow={percentual}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label="Posição na lista de perguntas"
                    >
                        <div className={styles.fill} style={{ width: `${percentual}%` }} />
                    </div>

                    {associacao ? (
                        <PlayerAssociacao
                            titulo="Ligações corretas"
                            perguntas={perguntas.map(paraPlayer)}
                            ligacoes={{}}
                            gabarito
                        />
                    ) : (
                        <PlayerPergunta tipo={tipo} pergunta={paraPlayer(pergunta)} valor={[]} gabarito />
                    )}

                    {!associacao && (
                        <footer className={styles.footer}>
                            <button
                                type="button"
                                className={styles.navButton}
                                onClick={() => setIndice((i) => i - 1)}
                                disabled={indice === 0}
                            >
                                <ChevronLeft size={16} /> Anterior
                            </button>

                            <nav className={styles.dots} aria-label="Ir para a pergunta">
                                {perguntas.map((p, i) => (
                                    <button
                                        key={p.id ?? i}
                                        type="button"
                                        className={`${styles.dot} ${i === indice ? styles.dotActive : ""}`}
                                        onClick={() => setIndice(i)}
                                        aria-label={`Pergunta ${i + 1}`}
                                        aria-current={i === indice ? "step" : undefined}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </nav>

                            <button
                                type="button"
                                className={styles.navButton}
                                onClick={() => setIndice((i) => i + 1)}
                                disabled={indice === total - 1}
                            >
                                Próxima <ChevronRight size={16} />
                            </button>
                        </footer>
                    )}
                </section>
            )}
        </ProfessorLayout>
    );
}

export default VisualizarAtividadeProfessor;
