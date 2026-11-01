import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Lock,
    TriangleAlert,
    Zap,
} from "lucide-react";

import AlunoLayout from "../../components/aluno/AlunoLayout";
import { apiFetch, lerErro } from "../../services/api";
import styles from "./ResponderAtividadeAluno.module.css";

interface AlternativaResponse {
    id: number;
    texto: string;
}

interface PerguntaResponse {
    id: number;
    texto: string;
    alternativas: AlternativaResponse[];
}

interface UsuarioResponse {
    id: number;
    nome: string;
}

interface TurmaResponse {
    id: number;
    nome: string;
}

interface AtividadeResponse {
    id: number;
    titulo: string;
    descricao: string;
    turma: TurmaResponse;
    pontuacao: number;
    status: "PENDENTE" | "EM_ANDAMENTO" | "CONCLUIDO";
    usuario: UsuarioResponse | null;
    dataCriacao?: string;
}

interface ResultadoAtividadeResponse {
    atividadeId: number;
    titulo: string;
    totalQuestoes: number;
    acertos: number;
    pontuacao: number;
}

interface RespostaProgressoResponse {
    perguntaId: number;
    alternativaId: number;
}

interface ProgressoAtividadeResponse {
    percentualConclusao: number;
    respondidas: number;
    totalQuestoes: number;
    respostas: RespostaProgressoResponse[];
}

interface QuestionarioResponse {
    atividade: AtividadeResponse;
    perguntas: PerguntaResponse[];
    meuResultado: ResultadoAtividadeResponse | null;
    meuProgresso: ProgressoAtividadeResponse | null;
}

const LETRAS = "ABCDEFGH";

function ResponderAtividadeAluno() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [questionario, setQuestionario] = useState<QuestionarioResponse | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    const [respostas, setRespostas] = useState<Record<number, number>>({});
    const [indice, setIndice] = useState(0);
    const [selecionada, setSelecionada] = useState<number | null>(null);
    const [enviando, setEnviando] = useState(false);

    const atividade = questionario?.atividade;
    const perguntas = questionario?.perguntas ?? [];
    const meuResultado = questionario?.meuResultado ?? null;

    const enviada = meuResultado !== null;
    const encerrada = atividade?.status === "CONCLUIDO";
    const podeResponder = atividade?.status === "EM_ANDAMENTO" && !enviada;

    const pergunta = perguntas[indice];
    const ultima = indice === perguntas.length - 1;
    const respondidas = perguntas.filter((p) => respostas[p.id] !== undefined).length;
    const percentual = perguntas.length ? Math.round((respondidas / perguntas.length) * 100) : 0;

    useEffect(() => {
        const buscarAtividade = async () => {
            try {
                if (!localStorage.getItem("usuario")) {
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

                const dados: QuestionarioResponse = await response.json();

                setErro("");
                setQuestionario(dados);

                const salvas: Record<number, number> = {};
                dados.meuProgresso?.respostas.forEach((r) => {
                    salvas[r.perguntaId] = r.alternativaId;
                });
                setRespostas(salvas);

                const primeiraAberta = dados.perguntas.findIndex((p) => salvas[p.id] === undefined);
                setIndice(primeiraAberta === -1 ? Math.max(0, dados.perguntas.length - 1) : primeiraAberta);
            } catch (error) {
                console.error("Erro ao buscar atividade:", error);
                setErro("Não foi possível carregar a atividade.");
            } finally {
                setCarregando(false);
            }
        };
        buscarAtividade();
    }, [id, navigate]);

    useEffect(() => {
        if (pergunta) setSelecionada(respostas[pergunta.id] ?? null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [indice, pergunta?.id]);

    async function salvarResposta(perguntaId: number, alternativaId: number) {
        const resposta = await apiFetch(`/atividades/${id}/progresso`, {
            method: "PUT",
            body: JSON.stringify({ perguntaId, alternativaId }),
        });

        if (!resposta.ok) {
            const erroApi = await lerErro(resposta, "Não foi possível salvar sua resposta.");
            throw new Error(erroApi.mensagem);
        }

        setRespostas((atuais) => ({ ...atuais, [perguntaId]: alternativaId }));
    }

    async function finalizarAtividade(todas: Record<number, number>) {
        const faltando = perguntas.findIndex((p) => todas[p.id] === undefined);
        if (faltando !== -1) {
            setIndice(faltando);
            setErro("Responda todas as perguntas antes de finalizar.");
            return;
        }

        const resposta = await apiFetch(`/atividades/${id}/respostas`, { method: "POST" });

        if (!resposta.ok) {
            const erroApi = await lerErro(resposta, "Não foi possível concluir a atividade.");
            throw new Error(erroApi.mensagem);
        }

        const resultadoApi: ResultadoAtividadeResponse = await resposta.json();
        setQuestionario((atual) =>
            atual ? { ...atual, meuResultado: resultadoApi, meuProgresso: null } : atual
        );
    }

    const confirmar = useCallback(async () => {
        if (!podeResponder || !pergunta || selecionada === null || enviando) return;

        try {
            setEnviando(true);
            setErro("");

            if (respostas[pergunta.id] !== selecionada) {
                await salvarResposta(pergunta.id, selecionada);
            }

            if (ultima) {
                await finalizarAtividade({ ...respostas, [pergunta.id]: selecionada });
            } else {
                setIndice((i) => i + 1);
            }
        } catch (error) {
            console.error("Erro ao responder:", error);
            setErro(error instanceof Error ? error.message : "Não foi possível salvar sua resposta.");
        } finally {
            setEnviando(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [podeResponder, pergunta, selecionada, enviando, respostas, ultima]);

    useEffect(() => {
        if (!podeResponder || !pergunta) return;
        const alternativas = pergunta.alternativas;

        function onKey(e: KeyboardEvent) {
            if (e.ctrlKey || e.metaKey || e.altKey) return;
            const pos = LETRAS.indexOf(e.key.toUpperCase());
            if (e.key.length === 1 && pos !== -1 && pos < alternativas.length) {
                setSelecionada(alternativas[pos].id);
            } else if (e.key === "Enter") {
                confirmar();
            }
        }

        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [podeResponder, pergunta, confirmar]);

    const voltar = () => navigate("/aluno/atividades");

    const topo = (
        <div className={styles.topRow}>
            <button type="button" className={styles.back} onClick={voltar}>
                <ChevronLeft size={18} /> Sair
            </button>
            {atividade && (
                <span className={styles.xpChip}>
                    <Zap size={26} />+{atividade.pontuacao} XP
                </span>
            )}
        </div>
    );

    if (carregando) {
        return (
            <AlunoLayout compacto>
                {topo}
                <section className={`${styles.card} ${styles.center}`}>
                    <div className={styles.spinner} aria-hidden />
                    <p className={styles.muted}>Carregando atividade...</p>
                </section>
            </AlunoLayout>
        );
    }

    if (!atividade) {
        return (
            <AlunoLayout compacto>
                {topo}
                <section className={`${styles.card} ${styles.center}`}>
                    <TriangleAlert size={40} className={styles.coral} />
                    <h2 className={styles.stateTitle}>Atividade não encontrada</h2>
                    <p className={styles.muted}>
                        {erro || "Não foi possível encontrar esta atividade."}
                    </p>
                    <button type="button" className={styles.primary} onClick={voltar}>
                        Voltar para atividades
                    </button>
                </section>
            </AlunoLayout>
        );
    }

    const assunto = [atividade.turma?.nome, atividade.titulo].filter(Boolean).join(" - ");

    if (meuResultado) {
        const pctAcerto = meuResultado.totalQuestoes
            ? Math.round((meuResultado.acertos / meuResultado.totalQuestoes) * 100)
            : 0;

        return (
            <AlunoLayout compacto>
                {topo}
                <section className={`${styles.card} ${styles.center}`}>
                    <span className={styles.subject}>{assunto}</span>
                    <CheckCircle2 size={56} className={styles.mint} />
                    <h2 className={styles.stateTitle}>Atividade concluída!</h2>
                    <p className={styles.muted}>Não é possível responder novamente.</p>

                    <div className={styles.resultGrid}>
                        <div className={styles.resultItem}>
                            <strong className={styles.mint}>
                                {meuResultado.acertos}/{meuResultado.totalQuestoes}
                            </strong>
                            <span>Acertos</span>
                        </div>
                        <div className={styles.resultItem}>
                            <strong className={styles.gold}>{pctAcerto}%</strong>
                            <span>Aproveitamento</span>
                        </div>
                        <div className={styles.resultItem}>
                            <strong className={styles.indigo}>+{meuResultado.pontuacao}</strong>
                            <span>XP ganho</span>
                        </div>
                    </div>

                    <button type="button" className={styles.primary} onClick={voltar}>
                        Voltar para atividades <ChevronRight size={16} />
                    </button>
                </section>
            </AlunoLayout>
        );
    }

    if (!podeResponder || perguntas.length === 0) {
        const titulo = encerrada
            ? "Atividade encerrada"
            : perguntas.length === 0
              ? "Nenhuma pergunta cadastrada"
              : "Atividade ainda não liberada";
        const texto = encerrada
            ? "Esta atividade foi encerrada pelo professor e não aceita mais respostas."
            : perguntas.length === 0
              ? "Esta atividade ainda não possui perguntas."
              : "O professor ainda não abriu esta atividade para respostas.";

        return (
            <AlunoLayout compacto>
                {topo}
                <section className={`${styles.card} ${styles.center}`}>
                    <span className={styles.subject}>{assunto}</span>
                    <Lock size={40} className={styles.muted} />
                    <h2 className={styles.stateTitle}>{titulo}</h2>
                    <p className={styles.muted}>{texto}</p>
                    <button type="button" className={styles.primary} onClick={voltar}>
                        Voltar para atividades
                    </button>
                </section>
            </AlunoLayout>
        );
    }

    const linhas = Math.ceil(pergunta.alternativas.length / 2);

    return (
        <AlunoLayout compacto>
            {topo}

            <section className={styles.card} aria-labelledby="pergunta-texto">
                <header className={styles.cardHeader}>
                    <span className={styles.subject}>{assunto}</span>
                    <span className={styles.counter}>
                        Questão {indice + 1} de {perguntas.length}
                    </span>
                </header>

                <div
                    className={styles.track}
                    role="progressbar"
                    aria-valuenow={percentual}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Progresso da atividade"
                >
                    <div className={styles.fill} style={{ width: `${percentual}%` }} />
                </div>

                <p className={styles.hint}>Observe o que já aprendeu e escolha uma resposta:</p>
                <h1 id="pergunta-texto" className={styles.question}>
                    {pergunta.texto}
                </h1>

                <div
                    className={styles.options}
                    role="radiogroup"
                    aria-labelledby="pergunta-texto"
                    style={{ gridTemplateRows: `repeat(${linhas}, auto)` }}
                >
                    {pergunta.alternativas.map((alt, i) => {
                        const marcada = selecionada === alt.id;
                        return (
                            <button
                                key={alt.id}
                                type="button"
                                role="radio"
                                aria-checked={marcada}
                                className={`${styles.option} ${marcada ? styles.optionSelected : ""}`}
                                onClick={() => setSelecionada(alt.id)}
                            >
                                <span className={styles.letter}>{LETRAS[i] ?? i + 1}</span>
                                <span className={styles.optionText}>{alt.texto}</span>
                            </button>
                        );
                    })}
                </div>

                <footer className={styles.footer}>
                    <div className={styles.footerLeft}>
                        {indice > 0 && (
                            <button
                                type="button"
                                className={styles.ghost}
                                onClick={() => {
                                    setErro("");
                                    setIndice((i) => i - 1);
                                }}
                            >
                                <ChevronLeft size={16} /> Questão anterior
                            </button>
                        )}
                        {erro && (
                            <span className={styles.error} role="alert">
                                {erro}
                            </span>
                        )}
                    </div>

                    <button
                        type="button"
                        className={styles.confirm}
                        onClick={confirmar}
                        disabled={selecionada === null || enviando}
                    >
                        {enviando
                            ? "Salvando..."
                            : ultima
                              ? "Finalizar atividade"
                              : "Confirmar resposta"}
                        <ChevronRight size={16} />
                    </button>
                </footer>
            </section>
        </AlunoLayout>
    );
}

export default ResponderAtividadeAluno;
