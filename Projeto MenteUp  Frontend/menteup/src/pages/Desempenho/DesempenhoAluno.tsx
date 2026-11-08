import {useEffect, useState} from "react";
import {Link, useParams} from "react-router-dom";
import {ArrowLeft, BookOpen, Check, MessageSquare, X} from "lucide-react";
import {IconeDesafio} from "../../components/ComponentesDesafio";
import {apiFetch, lerErro} from "../../services/api";
import {ROTA_BASE, type PerfilGestao} from "../../services/turmaDesafio";
import type {AtividadeDoAluno, ComentarioSalvo, DesempenhoIndividual, QuestaoAluno} from "../../types/desempenho";
import {LayoutGestao} from "../Desafio/TurmasGestao";
import dash from "../professor/dashboardProfessor.module.css";
import styles from "./Desempenho.module.css";

const NOME_TIPO: Record<string, string> = {
    QUIZ: "Quiz",
    VERDADEIRO_FALSO: "Verdadeiro ou falso",
    ASSOCIACAO: "Associação",
    ORDENACAO: "Ordenação",
    LACUNAS: "Lacunas",
};

interface Barra {
    chave: string;
    rotulo: string;
    percentual: number;
    origem: "atividade" | "desafio";
}

function percentual(acertos: number, total: number): number {
    return total === 0 ? 0 : Math.round((acertos * 100) / total);
}

function formatarData(data: string | null): string {
    if (!data) {
        return "";
    }
    const convertida = new Date(data);
    return Number.isNaN(convertida.getTime()) ? "" : convertida.toLocaleDateString("pt-BR");
}

function DesempenhoAluno({perfil}: { perfil: PerfilGestao }) {
    const {turmaId, alunoId} = useParams<{ turmaId: string; alunoId: string }>();
    const base = ROTA_BASE[perfil];

    const [dados, setDados] = useState<DesempenhoIndividual | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<string | null>(null);

    useEffect(() => {
        async function carregar() {
            try {
                const resposta = await apiFetch(`/turmas/${turmaId}/alunos/${alunoId}/desempenho`);

                if (!resposta.ok) {
                    setErro((await lerErro(resposta, "Não foi possível carregar o desempenho do aluno.")).mensagem);
                    return;
                }

                setDados(await resposta.json());
            } catch {
                setErro("Não foi possível conectar ao servidor.");
            } finally {
                setCarregando(false);
            }
        }

        carregar();
    }, [turmaId, alunoId]);

    function aoSalvarComentario(salvo: ComentarioSalvo) {
        setDados((atual) => atual && {
            ...atual,
            atividades: atual.atividades.map((atividade) =>
                atividade.resultadoId === salvo.resultadoId
                    ? {...atividade, comentario: salvo.comentario, comentadoPor: salvo.comentadoPor}
                    : atividade),
        });
    }

    const barras: Barra[] = dados ? [
        ...dados.atividades.map((a) => ({
            chave: `a-${a.resultadoId}`,
            rotulo: a.titulo,
            percentual: percentual(a.acertos, a.totalQuestoes),
            origem: "atividade" as const,
        })),
        ...dados.desafios.map((d) => ({
            chave: `d-${d.desafioId}`,
            rotulo: d.titulo,
            percentual: percentual(d.acertos, d.totalPerguntas),
            origem: "desafio" as const,
        })),
    ] : [];

    const totalAcertos = dados
        ? dados.atividades.reduce((soma, a) => soma + a.acertos, 0) + dados.desafios.reduce((soma, d) => soma + d.acertos, 0)
        : 0;
    const totalPerguntas = dados
        ? dados.atividades.reduce((soma, a) => soma + a.totalQuestoes, 0) + dados.desafios.reduce((soma, d) => soma + d.totalPerguntas, 0)
        : 0;

    return (
        <LayoutGestao perfil={perfil}>
            <Link to={`${base}/desempenho`} className={styles.back}>
                <ArrowLeft size={16}/> Voltar para a turma
            </Link>

            {carregando && (
                <section className={dash.card}>
                    <p className={dash.empty}>Carregando desempenho...</p>
                </section>
            )}

            {erro && <div className={dash.error} role="alert">{erro}</div>}

            {dados && (
                <>
                    <header className={dash.hero}>
                        <div>
                            <span className={dash.eyebrow}>{dados.nomeTurma}</span>
                            <h1 className={dash.title}>{dados.nomeAluno}</h1>
                            <p className={dash.subtitle}>Atividades, desafios e respostas deste aluno na turma.</p>
                        </div>
                    </header>

                    <div className={dash.stats}>
                        <div className={dash.stat}>
                            <strong className={dash.indigo}>{dados.atividades.length}</strong>
                            <span>Atividades concluídas</span>
                        </div>
                        <div className={dash.stat}>
                            <strong className={dash.gold}>{dados.desafios.length}</strong>
                            <span>Desafios respondidos</span>
                        </div>
                        <div className={dash.stat}>
                            <strong className={dash.coral}>{totalAcertos} / {totalPerguntas}</strong>
                            <span>Perguntas acertadas</span>
                        </div>
                        <div className={dash.stat}>
                            <strong className={styles.mint}>{percentual(totalAcertos, totalPerguntas)}%</strong>
                            <span>Aproveitamento geral</span>
                        </div>
                    </div>

                    <div className={styles.stack}>
                        <GraficoAproveitamento barras={barras}/>

                        <section className={dash.card}>
                            <header className={dash.cardHeader}>
                                <h2 className={`${dash.cardTitle} ${styles.titleIcon}`}>
                                    <BookOpen size={20} className={dash.indigo}/> Atividades
                                </h2>
                                <span className={dash.cardNote}>{dados.atividades.length} concluídas</span>
                            </header>
                            {dados.atividades.length === 0 ? (
                                <p className={dash.empty}>O aluno ainda não concluiu atividades nesta turma.</p>
                            ) : (
                                <div className={styles.items}>
                                    {dados.atividades.map((atividade) => (
                                        <CartaoAtividade
                                            key={atividade.resultadoId}
                                            atividade={atividade}
                                            turmaId={dados.turmaId}
                                            aoSalvarComentario={aoSalvarComentario}
                                        />
                                    ))}
                                </div>
                            )}
                        </section>

                        <section className={dash.card}>
                            <header className={dash.cardHeader}>
                                <h2 className={`${dash.cardTitle} ${styles.titleIcon}`}>
                                    <IconeDesafio tamanho={22}/> Desafios
                                </h2>
                                <span className={dash.cardNote}>{dados.desafios.length} respondidos</span>
                            </header>
                            {dados.desafios.length === 0 ? (
                                <p className={dash.empty}>O aluno ainda não respondeu desafios nesta turma.</p>
                            ) : (
                                <div className={styles.items}>
                                    {dados.desafios.map((desafio) => (
                                        <article key={desafio.desafioId} className={styles.item}>
                                            <div className={styles.itemHeader}>
                                                <h3 className={styles.itemTitle}>{desafio.titulo}</h3>
                                                <span className={styles.itemMeta}>
                                                    {desafio.acertos} de {desafio.totalPerguntas} acertos · {desafio.pontos} pontos
                                                </span>
                                            </div>
                                            <ListaQuestoes questoes={desafio.questoes}/>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                </>
            )}
        </LayoutGestao>
    );
}

function GraficoAproveitamento({barras}: { barras: Barra[] }) {
    return (
        <section className={dash.card}>
            <header className={dash.cardHeader}>
                <h2 className={dash.cardTitle}>Aproveitamento por atividade e desafio</h2>
                <div className={styles.legend}>
                    <span><i className={styles.legendAtividade}/> Atividade</span>
                    <span><i className={styles.legendDesafio}/> Desafio</span>
                </div>
            </header>

            {barras.length === 0 ? (
                <p className={dash.empty}>Sem dados para o gráfico ainda.</p>
            ) : (
                <div
                    className={`${dash.chart} ${styles.chart}`}
                    role="img"
                    aria-label={barras.map((b) => `${b.rotulo}: ${b.percentual}%`).join("; ")}
                >
                    {barras.map((barra) => (
                        <div key={barra.chave} className={`${dash.barCol} ${styles.barCol}`}>
                            <span className={dash.barValue}>{barra.percentual}%</span>
                            <div className={dash.barTrack}>
                                <div
                                    className={`${dash.bar} ${barra.origem === "desafio" ? styles.barDesafio : ""}`}
                                    style={{height: `${Math.max(barra.percentual, 2)}%`}}
                                    title={`${barra.rotulo}: ${barra.percentual}%`}
                                />
                            </div>
                            <span className={dash.barLabel} title={barra.rotulo}>{barra.rotulo}</span>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

function CartaoAtividade({atividade, turmaId, aoSalvarComentario}: {
    atividade: AtividadeDoAluno;
    turmaId: number;
    aoSalvarComentario: (salvo: ComentarioSalvo) => void;
}) {
    return (
        <article className={styles.item}>
            <div className={styles.itemHeader}>
                <div className={styles.itemTitleRow}>
                    <h3 className={styles.itemTitle}>{atividade.titulo}</h3>
                    <span className={styles.tipo}>{NOME_TIPO[atividade.tipo] ?? atividade.tipo}</span>
                </div>
                <span className={styles.itemMeta}>
                    {atividade.acertos} de {atividade.totalQuestoes} acertos
                    · {atividade.pontuacao} / {atividade.pontuacaoMaxima} pontos
                    {atividade.concluidaEm && ` · ${formatarData(atividade.concluidaEm)}`}
                </span>
            </div>

            {atividade.questoes.length === 0 ? (
                <p className={dash.empty}>
                    Detalhe por pergunta indisponível: esta atividade foi concluída antes dessa informação ser registrada.
                </p>
            ) : (
                <ListaQuestoes questoes={atividade.questoes}/>
            )}

            <ComentarioAtividade atividade={atividade} turmaId={turmaId} aoSalvar={aoSalvarComentario}/>
        </article>
    );
}

function ListaQuestoes({questoes}: { questoes: QuestaoAluno[] }) {
    return (
        <ul className={styles.questions}>
            {questoes.map((questao, indice) => (
                <li key={indice} className={styles.question}>
                    <span
                        className={`${styles.mark} ${
                            questao.correta === null ? styles.markNeutral
                                : questao.correta ? styles.markRight : styles.markWrong}`}
                        aria-label={questao.correta === null ? "Sem correção" : questao.correta ? "Acertou" : "Errou"}
                    >
                        {questao.correta === false ? <X size={14}/> : <Check size={14}/>}
                    </span>
                    <div className={styles.questionBody}>
                        <p className={styles.questionText}>{questao.enunciado}</p>
                        {questao.respostaAluno && (
                            <p className={styles.answer}>Resposta do aluno: {questao.respostaAluno}</p>
                        )}
                        {questao.correta === false && questao.respostaCorreta && (
                            <p className={styles.correct}>Correta: {questao.respostaCorreta}</p>
                        )}
                    </div>
                </li>
            ))}
        </ul>
    );
}

function ComentarioAtividade({atividade, turmaId, aoSalvar}: {
    atividade: AtividadeDoAluno;
    turmaId: number;
    aoSalvar: (salvo: ComentarioSalvo) => void;
}) {
    const [editando, setEditando] = useState(false);
    const [texto, setTexto] = useState(atividade.comentario ?? "");
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);

    async function salvar() {
        setSalvando(true);
        setErro(null);

        try {
            const resposta = await apiFetch(`/turmas/${turmaId}/resultados/${atividade.resultadoId}/comentario`, {
                method: "PUT",
                body: JSON.stringify({texto}),
            });

            if (!resposta.ok) {
                setErro((await lerErro(resposta, "Não foi possível salvar o comentário.")).mensagem);
                return;
            }

            aoSalvar(await resposta.json());
            setEditando(false);
        } catch {
            setErro("Não foi possível conectar ao servidor.");
        } finally {
            setSalvando(false);
        }
    }

    if (!editando) {
        return (
            <div className={styles.comment}>
                {atividade.comentario ? (
                    <div className={styles.commentBox}>
                        <p className={styles.commentAuthor}>
                            <MessageSquare size={14}/> Comentário de {atividade.comentadoPor}
                        </p>
                        <p className={styles.commentText}>{atividade.comentario}</p>
                    </div>
                ) : null}
                <button
                    type="button"
                    onClick={() => {
                        setTexto(atividade.comentario ?? "");
                        setEditando(true);
                    }}
                    className={styles.linkButton}
                >
                    <MessageSquare size={14}/> {atividade.comentario ? "Editar comentário" : "Adicionar comentário"}
                </button>
            </div>
        );
    }

    return (
        <div className={styles.comment}>
            <label className={styles.commentLabel} htmlFor={`comentario-${atividade.resultadoId}`}>
                Comentário para o aluno
            </label>
            <textarea
                id={`comentario-${atividade.resultadoId}`}
                value={texto}
                onChange={(evento) => setTexto(evento.target.value)}
                maxLength={1000}
                rows={3}
                className={styles.textarea}
                placeholder="Ex.: Ótimo trabalho! Revise a questão 3."
            />
            <p className={styles.counter}>{texto.length} / 1000</p>
            {erro && <p className={styles.commentError}>{erro}</p>}
            <div className={styles.commentActions}>
                <button
                    type="button"
                    onClick={salvar}
                    disabled={salvando || texto.trim() === ""}
                    className={styles.saveButton}
                >
                    {salvando ? "Salvando..." : "Salvar"}
                </button>
                <button type="button" onClick={() => setEditando(false)} className={styles.cancelButton}>
                    Cancelar
                </button>
            </div>
        </div>
    );
}

export default DesempenhoAluno;
