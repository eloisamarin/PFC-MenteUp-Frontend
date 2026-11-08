import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {ArrowLeft, Check, Hourglass, Trophy, X} from "lucide-react";
import AlunoLayout from "../../components/aluno/AlunoLayout";
import {useConquistas} from "../../hooks/useConquistas";
import {BadgeStatusDesafio, BarraTempo, IconeDesafio, TabelaRanking} from "../../components/ComponentesDesafio";
import {useEstadoDesafio} from "../../hooks/useEstadoDesafio";
import {apiFetch, lerErro} from "../../services/api";
import {LETRAS_ALTERNATIVA, contagem, usuarioLogado} from "../../services/turmaDesafio";
import base from "./TurmasGestao.module.css";
import styles from "./Desafios.module.css";

const COR_ALTERNATIVA = [styles.altCoral, styles.altIndigo, styles.altGold, styles.altMint];

interface Escolha {
    perguntaId: number;
    alternativaId: number;
}

function JogarDesafio() {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();

    const {estado, ranking, erro, setErro, carregando, atualizar} = useEstadoDesafio(id);
    const [escolha, setEscolha] = useState<Escolha | null>(null);
    const [enviando, setEnviando] = useState(false);

    const {verificarNovas} = useConquistas();
    const desafioEncerrado = estado?.status === "ENCERRADO";

    // Quando o desafio termina, os pontos viram XP e podem liberar conquistas
    useEffect(() => {
        if (desafioEncerrado) {
            void verificarNovas();
        }
    }, [desafioEncerrado, verificarNovas]);

    const meuId = usuarioLogado().id;
    const minhaPosicao = ranking.find((linha) => linha.usuarioId === meuId);

    async function responder(perguntaId: number, alternativaId: number) {
        try {
            setEnviando(true);
            setErro("");
            setEscolha({perguntaId, alternativaId});

            const resposta = await apiFetch(`/desafios/${id}/respostas`, {
                method: "POST",
                body: JSON.stringify({perguntaId, alternativaId}),
            });

            if (!resposta.ok) {
                const erroApi = await lerErro(resposta, "Não foi possível enviar sua resposta.");
                setErro(erroApi.mensagem);
                setEscolha(null);
                return;
            }

            await atualizar();
        } catch (error) {
            console.error("Erro ao responder o desafio:", error);
            setErro("Não foi possível enviar sua resposta.");
            setEscolha(null);
        } finally {
            setEnviando(false);
        }
    }

    const voltar = (
        <button type="button" onClick={() => navigate("/aluno/desafios")} className={base.back}>
            <ArrowLeft size={16}/> Voltar para desafios
        </button>
    );

    if (carregando) {
        return (
            <AlunoLayout>
                <p className={base.empty}>Carregando desafio...</p>
            </AlunoLayout>
        );
    }

    if (!estado) {
        return (
            <AlunoLayout>
                {voltar}
                <div className={base.error} role="alert">{erro || "Desafio não encontrado."}</div>
            </AlunoLayout>
        );
    }

    const {pergunta, status} = estado;
    const encerrada = estado.perguntaEncerrada === true;
    const escolhidaAgora = escolha && escolha.perguntaId === pergunta?.id ? escolha.alternativaId : null;
    const minhaAlternativa = estado.minhaAlternativaId ?? escolhidaAgora;
    const respondeu = minhaAlternativa !== null;
    const acertou = respondeu && minhaAlternativa === estado.alternativaCorretaId;
    const progresso = estado.totalPerguntas ? Math.round(((estado.numeroPergunta ?? 0) / estado.totalPerguntas) * 100) : 0;

    return (
        <AlunoLayout>
            {voltar}

            <header className={base.header}>
                <span className={base.eyebrow}>Desafio ao vivo</span>
                <div className={styles.titleLine}>
                    <h1 className={`${base.title} ${styles.titleWithIcon}`}>
                        {estado.titulo} <IconeDesafio tamanho={32}/>
                    </h1>
                    <BadgeStatusDesafio status={status}/>
                </div>
                <p className={base.subtitle}>{contagem(estado.totalPerguntas, "pergunta", "perguntas")}</p>
            </header>

            {erro && <div className={base.error} role="alert">{erro}</div>}

            {status === "AGUARDANDO" && (
                <section className={`${base.card} ${styles.startCard}`}>
                    <span className={`${styles.startIcon} ${styles.pulse}`}>
                        <Hourglass size={32}/>
                    </span>
                    <h2 className={styles.startTitle}>Aguardando o professor iniciar</h2>
                    <p className={styles.startText}>
                        Total: {contagem(estado.totalPerguntas, "pergunta", "perguntas")}. Fique nesta tela: o desafio começa sozinho.
                    </p>
                </section>
            )}

            {status === "EM_ANDAMENTO" && pergunta && (
                <div className={encerrada ? styles.liveGrid : styles.solo}>
                    <section className={`${base.card} ${styles.questionCard}`}>
                        <div className={styles.questionTop}>
                            <span className={styles.questionCount}>
                                Pergunta {estado.numeroPergunta} de {estado.totalPerguntas}
                            </span>
                        </div>
                        <div className={styles.progressTrack}>
                            <div className={styles.progressFill} style={{width: `${progresso}%`}}/>
                        </div>

                        {!encerrada && (
                            <div className={styles.timer}>
                                <BarraTempo restantes={estado.segundosRestantes ?? 0} total={pergunta.tempoSegundos}/>
                            </div>
                        )}

                        <h2 className={styles.question}>{pergunta.enunciado}</h2>

                        <div className={styles.options}>
                            {pergunta.alternativas.map((alternativa, indice) => {
                                const escolhida = alternativa.id === minhaAlternativa;
                                const correta = alternativa.id === estado.alternativaCorretaId;
                                const apagada = encerrada ? !correta && !escolhida : respondeu && !escolhida;

                                return (
                                    <button
                                        key={alternativa.id}
                                        type="button"
                                        onClick={() => responder(pergunta.id, alternativa.id)}
                                        disabled={respondeu || encerrada || enviando}
                                        aria-pressed={escolhida}
                                        className={`${styles.option} ${styles.optionButton} ${COR_ALTERNATIVA[indice]} ${apagada ? styles.optionFaded : ""} ${escolhida ? styles.optionChosen : ""}`}
                                    >
                                        <span className={styles.letter}>{LETRAS_ALTERNATIVA[indice]}</span>
                                        <span className={styles.optionText}>{alternativa.texto}</span>
                                        {encerrada && correta && <Check size={20} aria-label="Alternativa correta"/>}
                                        {encerrada && escolhida && !correta && <X size={20} aria-label="Sua resposta incorreta"/>}
                                    </button>
                                );
                            })}
                        </div>

                        {!encerrada && respondeu && (
                            <p className={styles.sentNote}>Resposta enviada! Aguarde o fim da pergunta.</p>
                        )}

                        {encerrada && (
                            <div className={`${styles.feedback} ${acertou ? styles.feedbackRight : ""}`}>
                                <strong>
                                    {!respondeu
                                        ? "O tempo acabou e você não respondeu."
                                        : acertou
                                            ? `Você acertou e ganhou ${estado.meusPontos ?? 0} pontos!`
                                            : "Não foi desta vez."}
                                </strong>
                                <span>Aguarde o professor avançar.</span>
                            </div>
                        )}
                    </section>

                    {encerrada && (
                        <TabelaRanking ranking={ranking} destaqueUsuarioId={meuId} titulo="Ranking parcial"/>
                    )}
                </div>
            )}

            {status === "ENCERRADO" && (
                <div className={styles.finalGrid}>
                    <TabelaRanking ranking={ranking} destaqueUsuarioId={meuId} titulo="Ranking final"/>

                    <aside className={`${base.card} ${styles.endCard}`}>
                        <Trophy size={36} className={styles.gold}/>
                        <h2 className={styles.endTitle}>Desafio encerrado</h2>
                        <p className={styles.endText}>
                            {minhaPosicao
                                ? `Você ficou em ${minhaPosicao.posicao}º lugar, com ${minhaPosicao.pontos} pontos.`
                                : "Você não respondeu a este desafio."}
                        </p>
                        <button type="button" onClick={() => navigate("/aluno/desafios")} className={base.ghostButton}>
                            <ArrowLeft size={16}/> Voltar para desafios
                        </button>
                    </aside>
                </div>
            )}
        </AlunoLayout>
    );
}

export default JogarDesafio;
