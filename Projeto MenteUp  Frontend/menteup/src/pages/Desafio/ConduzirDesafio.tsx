import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {ArrowLeft, Check, Play, SkipForward, TriangleAlert, Trophy, Users} from "lucide-react";
import {BadgeStatusDesafio, BarraTempo, IconeDesafio, TabelaRanking} from "../../components/ComponentesDesafio";
import {useEstadoDesafio} from "../../hooks/useEstadoDesafio";
import {apiFetch, lerErro} from "../../services/api";
import {LETRAS_ALTERNATIVA, contagem, ROTA_BASE, type Desafio, type PerfilGestao, type TurmaDetalhe} from "../../services/turmaDesafio";
import {LayoutGestao} from "./TurmasGestao";
import base from "./TurmasGestao.module.css";
import styles from "./Desafios.module.css";

const COR_ALTERNATIVA = [styles.altCoral, styles.altIndigo, styles.altGold, styles.altMint];

function ConduzirDesafio({perfil}: { perfil: PerfilGestao }) {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();
    const rota = ROTA_BASE[perfil];

    const {estado, ranking, erro, setErro, carregando, atualizar} = useEstadoDesafio(id);
    const [desafio, setDesafio] = useState<Desafio | null>(null);
    const [totalAlunos, setTotalAlunos] = useState<number | null>(null);
    const [processando, setProcessando] = useState(false);

    useEffect(() => {
        async function carregarTurma() {
            try {
                const respostaDesafios = await apiFetch("/desafios");
                if (!respostaDesafios.ok) return;

                const desafios: Desafio[] = await respostaDesafios.json();
                const encontrado = desafios.find((item) => item.id === Number(id)) ?? null;
                setDesafio(encontrado);

                if (!encontrado) return;

                const respostaTurma = await apiFetch(`/turmas/${encontrado.turma.id}`);

                if (respostaTurma.ok) {
                    const turma: TurmaDetalhe = await respostaTurma.json();
                    setTotalAlunos(turma.alunos.length);
                }
            } catch (error) {
                console.error("Erro ao carregar a turma do desafio:", error);
            }
        }

        carregarTurma();
    }, [id]);

    async function executar(acao: "iniciar" | "avancar") {
        try {
            setProcessando(true);
            setErro("");

            const resposta = await apiFetch(`/desafios/${id}/${acao}`, {method: "POST"});

            if (!resposta.ok) {
                const erroApi = await lerErro(resposta, "Não foi possível atualizar o desafio.");
                setErro(erroApi.mensagem);
                return;
            }

            await atualizar();
        } catch (error) {
            console.error("Erro ao atualizar o desafio:", error);
            setErro("Não foi possível atualizar o desafio.");
        } finally {
            setProcessando(false);
        }
    }

    const voltar = (
        <button type="button" onClick={() => navigate(`${rota}/desafios`)} className={base.back}>
            <ArrowLeft size={16}/> Voltar para desafios
        </button>
    );

    if (carregando) {
        return (
            <LayoutGestao perfil={perfil}>
                <p className={base.empty}>Carregando desafio...</p>
            </LayoutGestao>
        );
    }

    if (!estado) {
        return (
            <LayoutGestao perfil={perfil}>
                {voltar}
                <div className={base.error} role="alert">{erro || "Desafio não encontrado."}</div>
            </LayoutGestao>
        );
    }

    const {pergunta, status} = estado;
    const encerrada = estado.perguntaEncerrada === true;
    const ultimaPergunta = estado.numeroPergunta === estado.totalPerguntas;
    const emJogo = status === "EM_ANDAMENTO" && pergunta !== null;
    const finalizado = status === "ENCERRADO";
    const progresso = estado.totalPerguntas ? Math.round(((estado.numeroPergunta ?? 0) / estado.totalPerguntas) * 100) : 0;

    return (
        <LayoutGestao perfil={perfil}>
            {voltar}

            <header className={base.header}>
                <span className={base.eyebrow}>Desafio ao vivo</span>
                <div className={styles.titleLine}>
                    <h1 className={`${base.title} ${styles.titleWithIcon}`}>
                        {estado.titulo} <IconeDesafio tamanho={32}/>
                    </h1>
                    <BadgeStatusDesafio status={status}/>
                </div>
                {desafio && (
                    <p className={base.subtitle}>
                        {desafio.turma.nome} · {contagem(estado.totalPerguntas, "pergunta", "perguntas")}
                    </p>
                )}
            </header>

            {erro && <div className={base.error} role="alert">{erro}</div>}

            {status === "AGUARDANDO" && (
                <section className={`${base.card} ${styles.startCard}`}>
                    <span className={styles.startIcon}>
                        <IconeDesafio tamanho={34}/>
                    </span>
                    <h2 className={styles.startTitle}>Tudo pronto para começar</h2>
                    <p className={styles.startText}>{desafio?.descricao}</p>

                    {totalAlunos === 0 && (
                        <p className={styles.warning}>
                            <TriangleAlert size={16}/> Esta turma ainda não tem alunos: ninguém poderá responder.
                        </p>
                    )}

                    <button type="button" onClick={() => executar("iniciar")} disabled={processando} className={styles.startButton}>
                        <Play size={18}/> Iniciar desafio
                    </button>
                </section>
            )}

            {emJogo && (
                <div className={styles.liveGrid}>
                    <section className={`${base.card} ${styles.questionCard}`}>
                        <div className={styles.questionTop}>
                            <span className={styles.questionCount}>
                                Pergunta {estado.numeroPergunta} de {estado.totalPerguntas}
                            </span>
                            <span className={styles.answered}>
                                <Users size={15}/>
                                {estado.respostasRecebidas ?? 0}
                                {totalAlunos !== null && ` de ${totalAlunos}`} responderam
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
                                const correta = alternativa.id === estado.alternativaCorretaId;
                                return (
                                    <div
                                        key={alternativa.id}
                                        className={`${styles.option} ${COR_ALTERNATIVA[indice]} ${encerrada && !correta ? styles.optionFaded : ""} ${encerrada && correta ? styles.optionCorrect : ""}`}
                                    >
                                        <span className={styles.letter}>{LETRAS_ALTERNATIVA[indice]}</span>
                                        <span className={styles.optionText}>{alternativa.texto}</span>
                                        {encerrada && correta && <Check size={20} aria-label="Alternativa correta"/>}
                                    </div>
                                );
                            })}
                        </div>

                        <footer className={styles.questionFooter}>
                            <p>{encerrada ? "Pergunta encerrada." : "Aguarde o tempo acabar ou todos os alunos responderem."}</p>
                            <button
                                type="button"
                                onClick={() => executar("avancar")}
                                disabled={!encerrada || processando}
                                className={base.primaryButton}
                            >
                                <SkipForward size={17}/>
                                {ultimaPergunta ? "Encerrar desafio" : "Próxima pergunta"}
                            </button>
                        </footer>
                    </section>

                    <TabelaRanking ranking={ranking} titulo="Ranking parcial"/>
                </div>
            )}

            {finalizado && (
                <div className={styles.finalGrid}>
                    <TabelaRanking ranking={ranking} titulo="Ranking final"/>

                    <aside className={`${base.card} ${styles.endCard}`}>
                        <Trophy size={36} className={styles.gold}/>
                        <h2 className={styles.endTitle}>Desafio encerrado</h2>
                        <p className={styles.endText}>
                            {contagem(ranking.length, "aluno participou", "alunos participaram")}. Confira o resultado final no ranking.
                        </p>
                        <button type="button" onClick={() => navigate(`${rota}/desafios`)} className={base.ghostButton}>
                            <ArrowLeft size={16}/> Voltar para desafios
                        </button>
                    </aside>
                </div>
            )}
        </LayoutGestao>
    );
}

export default ConduzirDesafio;
