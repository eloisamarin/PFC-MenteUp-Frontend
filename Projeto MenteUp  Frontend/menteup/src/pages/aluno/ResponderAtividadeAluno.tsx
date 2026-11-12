import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Lock,
    PartyPopper,
    Trophy,
    TriangleAlert,
    Zap,
} from "lucide-react";

import AlunoLayout from "../../components/aluno/AlunoLayout";
import ConfirmarExclusao from "../../components/ConfirmarExclusao";
import { useConquistas } from "../../hooks/useConquistas";
import { apiFetch, lerErro } from "../../services/api";
import {
    PlayerAssociacao,
    PlayerPergunta,
    corpoResposta,
    respostaCompleta,
    valorInicial,
    type Valor,
} from "../../components/atividades/Players";
import { NOME_TIPO, estaAberta, type AtividadeAluno, type TipoAtividade } from "../../types/aluno";
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
    tipo?: TipoAtividade;
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
    alternativaId: number | null;
    alternativasIds?: number[] | null;
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
    const { verificarNovas } = useConquistas();

    const [questionario, setQuestionario] = useState<QuestionarioResponse | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    const [respostas, setRespostas] = useState<Record<number, Valor>>({});
    const [indice, setIndice] = useState(0);
    const [rascunho, setRascunho] = useState<Valor>([]);
    const [ligacoes, setLigacoes] = useState<Record<number, number | null>>({});
    const [enviando, setEnviando] = useState(false);
    // Respostas prontas para envio, aguardando o aluno confirmar a finalização
    const [paraFinalizar, setParaFinalizar] = useState<Record<number, Valor> | null>(null);
    // Próxima atividade aberta, oferecida ao terminar esta
    const [proximaId, setProximaId] = useState<number | null>(null);

    const atividade = questionario?.atividade;
    const perguntas = questionario?.perguntas ?? [];
    const tipo: TipoAtividade = atividade?.tipo ?? "QUIZ";
    const associacao = tipo === "ASSOCIACAO";
    const meuResultado = questionario?.meuResultado ?? null;

    const enviada = meuResultado !== null;
    const encerrada = atividade?.status === "CONCLUIDO";
    const podeResponder = atividade?.status === "EM_ANDAMENTO" && !enviada;

    const pergunta = perguntas[indice];
    const ultima = associacao || indice === perguntas.length - 1;
    const respondidas = associacao
        ? perguntas.filter((p) => ligacoes[p.id] != null).length
        : perguntas.filter((p) => respostas[p.id] !== undefined).length;
    const completa = associacao ? respondidas === perguntas.length : respostaCompleta(rascunho);
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

                const salvas: Record<number, Valor> = {};
                dados.meuProgresso?.respostas.forEach((r) => {
                    salvas[r.perguntaId] = r.alternativasIds ?? [r.alternativaId];
                });
                setRespostas(salvas);
                setLigacoes(
                    Object.fromEntries(dados.perguntas.map((p) => [p.id, salvas[p.id]?.[0] ?? null]))
                );

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
        if (pergunta) setRascunho(respostas[pergunta.id] ?? valorInicial(tipo, pergunta));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [indice, pergunta?.id]);

    async function salvarResposta(perguntaId: number, valor: Valor) {
        const resposta = await apiFetch(`/atividades/${id}/progresso`, {
            method: "PUT",
            body: JSON.stringify(corpoResposta(tipo, perguntaId, valor)),
        });

        if (!resposta.ok) {
            const erroApi = await lerErro(resposta, "Não foi possível salvar sua resposta.");
            throw new Error(erroApi.mensagem);
        }

        setRespostas((atuais) => ({ ...atuais, [perguntaId]: valor }));
    }

    // Antes de finalizar (ação sem volta), pede confirmação ao aluno
    function pedirFinalizacao(todas: Record<number, Valor>) {
        const faltando = perguntas.findIndex((p) => todas[p.id] === undefined);
        if (faltando !== -1) {
            setIndice(faltando);
            setErro("Responda todas as perguntas antes de finalizar.");
            return;
        }
        setParaFinalizar(todas);
    }

    async function finalizarConfirmado() {
        if (!paraFinalizar || enviando) return;
        try {
            setEnviando(true);
            setErro("");
            await finalizarAtividade();
            setParaFinalizar(null);
        } catch (error) {
            console.error("Erro ao finalizar:", error);
            setParaFinalizar(null);
            setErro(error instanceof Error ? error.message : "Não foi possível concluir a atividade.");
        } finally {
            setEnviando(false);
        }
    }

    async function finalizarAtividade() {
        const resposta = await apiFetch(`/atividades/${id}/respostas`, { method: "POST" });

        if (!resposta.ok) {
            const erroApi = await lerErro(resposta, "Não foi possível concluir a atividade.");
            throw new Error(erroApi.mensagem);
        }

        const resultadoApi: ResultadoAtividadeResponse = await resposta.json();
        setQuestionario((atual) =>
            atual ? { ...atual, meuResultado: resultadoApi, meuProgresso: null } : atual
        );

        // Atividade concluída: confere se ela liberou alguma conquista
        void verificarNovas();
    }

    const confirmar = useCallback(async () => {
        if (!podeResponder || !pergunta || !completa || enviando) return;

        try {
            setEnviando(true);
            setErro("");

            if (associacao) {
                const todas: Record<number, Valor> = { ...respostas };
                for (const p of perguntas) {
                    const valor: Valor = [ligacoes[p.id]];
                    if (JSON.stringify(respostas[p.id]) !== JSON.stringify(valor)) {
                        await salvarResposta(p.id, valor);
                    }
                    todas[p.id] = valor;
                }
                pedirFinalizacao(todas);
                return;
            }

            if (JSON.stringify(respostas[pergunta.id]) !== JSON.stringify(rascunho)) {
                await salvarResposta(pergunta.id, rascunho);
            }

            if (ultima) {
                pedirFinalizacao({ ...respostas, [pergunta.id]: rascunho });
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
    }, [podeResponder, pergunta, rascunho, ligacoes, completa, enviando, respostas, ultima]);

    useEffect(() => {
        if (!podeResponder || !pergunta || paraFinalizar) return;
        const alternativas = pergunta.alternativas;

        function onKey(e: KeyboardEvent) {
            if (e.ctrlKey || e.metaKey || e.altKey) return;
            const pos = LETRAS.indexOf(e.key.toUpperCase());
            const escolhaPorLetra = tipo === "QUIZ" || tipo === "VERDADEIRO_FALSO";
            if (escolhaPorLetra && e.key.length === 1 && pos !== -1 && pos < alternativas.length) {
                setRascunho([alternativas[pos].id]);
            } else if (e.key === "Enter") {
                confirmar();
            }
        }

        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [podeResponder, pergunta, confirmar, tipo, paraFinalizar]);

    const voltar = () => navigate("/aluno/atividades");

    // Com o resultado na tela, procura a próxima atividade aberta (em andamento primeiro)
    const concluiu = meuResultado !== null;
    useEffect(() => {
        if (!concluiu) return;
        let ativo = true;
        apiFetch("/alunos/me/atividades")
            .then((r) => (r.ok ? r.json() : []))
            .then((lista: AtividadeAluno[]) => {
                const abertas = lista
                    .filter((item) => estaAberta(item) && item.atividade.id !== Number(id))
                    .sort((a, b) => Number(b.status === "EM_ANDAMENTO") - Number(a.status === "EM_ANDAMENTO"));
                if (ativo) setProximaId(abertas[0]?.atividade.id ?? null);
            })
            .catch(() => undefined);
        return () => {
            ativo = false;
        };
    }, [concluiu, id]);

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
        // O final é o que fica na memória: a mensagem acompanha o desempenho, sempre positiva
        const [tituloFinal, textoFinal] =
            pctAcerto === 100
                ? ["Gabaritou!", "Você acertou todas as perguntas. Que fase!"]
                : pctAcerto >= 70
                  ? ["Mandou bem!", "Ótimo resultado. Seu XP já foi somado."]
                  : pctAcerto >= 40
                    ? ["Bom trabalho!", "Você está no caminho. Cada atividade conta para o seu nível."]
                    : ["Atividade concluída!", "Todo começo conta. Revise o conteúdo e siga para a próxima."];

        return (
            <AlunoLayout compacto>
                {topo}
                <section className={`${styles.card} ${styles.center}`}>
                    <span className={styles.subject}>{assunto}</span>
                    {pctAcerto >= 70 ? (
                        <PartyPopper size={56} className={styles.gold} aria-hidden />
                    ) : (
                        <CheckCircle2 size={56} className={styles.mint} aria-hidden />
                    )}
                    <h2 className={styles.stateTitle}>{tituloFinal}</h2>
                    <p className={styles.muted}>{textoFinal}</p>

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

                    <div className={styles.resultActions}>
                        {proximaId !== null ? (
                            <button
                                type="button"
                                className={styles.primary}
                                onClick={() => navigate(`/aluno/atividades/responder/${proximaId}`)}
                            >
                                Próxima atividade <ChevronRight size={16} />
                            </button>
                        ) : (
                            <button type="button" className={styles.primary} onClick={voltar}>
                                Voltar para atividades <ChevronRight size={16} />
                            </button>
                        )}
                        <button type="button" className={styles.ghost} onClick={() => navigate("/aluno/ranking")}>
                            <Trophy size={16} /> Ver ranking
                        </button>
                    </div>
                    <p className={styles.note}>Suas respostas foram registradas.</p>
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

    return (
        <AlunoLayout compacto>
            {topo}

            <section className={styles.card}>
                <header className={styles.cardHeader}>
                    <span className={styles.subject}>{assunto}</span>
                    <span className={styles.typeBadge}>{NOME_TIPO[tipo]}</span>
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
                <span className={styles.counter}>
                    {associacao
                        ? `${respondidas} de ${perguntas.length} ligações`
                        : `Questão ${indice + 1} de ${perguntas.length}`}
                </span>

                {associacao ? (
                    <PlayerAssociacao
                        titulo={atividade.descricao || "Ligue cada item ao seu correspondente"}
                        perguntas={perguntas}
                        ligacoes={ligacoes}
                        onChange={setLigacoes}
                    />
                ) : (
                    <PlayerPergunta
                        key={pergunta.id}
                        tipo={tipo}
                        pergunta={pergunta}
                        valor={rascunho}
                        onChange={setRascunho}
                    />
                )}

                <footer className={styles.footer}>
                    <div className={styles.footerLeft}>
                        {indice > 0 && !associacao && (
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
                        disabled={!completa || enviando}
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

            {paraFinalizar && (
                <ConfirmarExclusao
                    variante="confirmar"
                    titulo="Finalizar atividade?"
                    mensagem={
                        <>
                            Você respondeu <strong>{perguntas.length} de {perguntas.length}</strong> perguntas.
                            Depois de finalizar, não dá para alterar as respostas.
                        </>
                    }
                    processando={enviando}
                    rotuloCancelar="Revisar respostas"
                    rotuloConfirmar="Finalizar"
                    rotuloProcessando="Finalizando..."
                    onConfirmar={finalizarConfirmado}
                    onCancelar={() => setParaFinalizar(null)}
                />
            )}
        </AlunoLayout>
    );
}

export default ResponderAtividadeAluno;
