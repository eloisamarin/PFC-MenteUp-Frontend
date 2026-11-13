import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { apiFetch, lerErro } from "../../services/api";
import { ROTA_BASE, type PerfilGestao } from "../../services/turmaDesafio";
import type { DesempenhoDaTurma, TurmaResumo } from "../../types/desempenho";
import { LayoutGestao } from "../Desafio/TurmasGestao";
import dash from "../professor/dashboardProfessor.module.css";
import styles from "./Desempenho.module.css";

function primeiroNome(nome: string) {
    return nome.trim().split(/\s+/)[0] ?? nome;
}

function Desempenho({ perfil }: { perfil: PerfilGestao }) {
    const navigate = useNavigate();
    const [turmas, setTurmas] = useState<TurmaResumo[]>([]);
    const [turmaId, setTurmaId] = useState<number | null>(null);
    const [desempenho, setDesempenho] = useState<DesempenhoDaTurma | null>(null);
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);

    useEffect(() => {
        async function carregarTurmas() {
            try {
                const resposta = await apiFetch("/turmas/minhas");

                if (!resposta.ok) {
                    setErro((await lerErro(resposta, "Não foi possível carregar as turmas.")).mensagem);
                    return;
                }

                const lista: TurmaResumo[] = await resposta.json();
                setTurmas(lista);

                if (lista.length > 0) {
                    setTurmaId(lista[0].id);
                }
            } catch {
                setErro("Não foi possível conectar ao servidor.");
            }
        }

        carregarTurmas();
    }, []);

    useEffect(() => {
        if (turmaId == null) {
            return;
        }

        async function carregarDesempenho(id: number) {
            setCarregando(true);
            setErro(null);

            try {
                const resposta = await apiFetch(`/turmas/${id}/desempenho`);

                if (!resposta.ok) {
                    setDesempenho(null);
                    setErro((await lerErro(resposta, "Não foi possível carregar o desempenho.")).mensagem);
                    return;
                }

                setDesempenho(await resposta.json());
            } catch {
                setErro("Não foi possível conectar ao servidor.");
            } finally {
                setCarregando(false);
            }
        }

        carregarDesempenho(turmaId);
    }, [turmaId]);

    const linkAluno = (alunoId: number) =>
        `${ROTA_BASE[perfil]}/desempenho/${desempenho?.turmaId}/alunos/${alunoId}`;

    const alunos = desempenho?.alunos ?? [];
    const grafico = [...alunos].sort((a, b) => b.pontuacao - a.pontuacao).slice(0, 8);
    const maxPontuacao = Math.max(1, ...grafico.map((a) => a.pontuacao));
    const semAtividades = alunos.filter((a) => a.atividadesConcluidas === 0);

    return (
        <LayoutGestao perfil={perfil}>
            <header className={dash.hero}>
                <div>
                    <span className={dash.eyebrow}>Desempenho</span>
                    <h1 className={dash.title}>Desempenho da turma</h1>
                    <p className={dash.subtitle}>
                        {perfil === "ADMINISTRADOR"
                            ? "Acompanhe o desempenho de qualquer turma."
                            : "Pontuação, acertos e atividades concluídas dos seus alunos."}
                    </p>
                </div>

                {turmas.length > 0 && (
                    <label className={styles.selectLabel}>
                        Turma
                        <select
                            value={turmaId ?? ""}
                            onChange={(evento) => setTurmaId(Number(evento.target.value))}
                            className={styles.select}
                        >
                            {turmas.map((turma) => (
                                <option key={turma.id} value={turma.id}>{turma.nome}</option>
                            ))}
                        </select>
                    </label>
                )}
            </header>

            {erro && <div className={dash.error} role="alert">{erro}</div>}

            {!erro && turmas.length === 0 && (
                <section className={dash.card}>
                    <p className={dash.empty}>
                        {perfil === "ADMINISTRADOR"
                            ? "Nenhuma turma cadastrada."
                            : "Você ainda não está vinculado a nenhuma turma."}
                    </p>
                </section>
            )}

            {carregando && (
                <section className={dash.card}>
                    <p className={dash.empty}>Carregando desempenho...</p>
                </section>
            )}

            {desempenho && !carregando && (
                <>
                    <div className={dash.stats}>
                        <div className={dash.stat}>
                            <strong className={dash.indigo}>{desempenho.totalAlunos}</strong>
                            <span>Alunos</span>
                        </div>
                        <div className={dash.stat}>
                            <strong className={dash.gold}>{desempenho.totalAtividades}</strong>
                            <span>Atividades publicadas</span>
                        </div>
                        <div className={dash.stat}>
                            <strong className={dash.coral}>{desempenho.mediaPontuacao.toLocaleString("pt-BR")}</strong>
                            <span>Média de pontuação</span>
                        </div>
                        <div className={dash.stat}>
                            <strong className={styles.mint}>{desempenho.taxaParticipacao}%</strong>
                            <span>Participação</span>
                        </div>
                    </div>

                    <div className={dash.grid}>
                        <section className={dash.card}>
                            <header className={dash.cardHeader}>
                                <h2 className={dash.cardTitle}>Pontuação dos alunos</h2>
                                <span className={dash.cardNote}>{desempenho.nomeTurma} · top {grafico.length}</span>
                            </header>

                            {grafico.length === 0 ? (
                                <p className={dash.empty}>Esta turma ainda não tem alunos.</p>
                            ) : (
                                <div className={dash.chart} role="img" aria-label="Pontuação por aluno">
                                    {grafico.map((aluno) => (
                                        <div key={aluno.alunoId} className={dash.barCol}>
                                            <span className={dash.barValue}>{aluno.pontuacao}</span>
                                            <div className={dash.barTrack}>
                                                <div
                                                    className={dash.bar}
                                                    style={{ height: `${Math.max((aluno.pontuacao / maxPontuacao) * 100, 4)}%` }}
                                                    title={`${aluno.nomeAluno}: ${aluno.pontuacao} pontos`}
                                                />
                                            </div>
                                            <span className={dash.barLabel}>{primeiroNome(aluno.nomeAluno)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        <section className={dash.card}>
                            <h2 className={dash.cardTitle}>Atenção recomendada</h2>

                            {semAtividades.length === 0 ? (
                                <p className={dash.empty}>Todos os alunos já concluíram ao menos uma atividade.</p>
                            ) : (
                                <ul className={dash.attention}>
                                    {semAtividades.slice(0, 6).map((aluno) => (
                                        <li key={aluno.alunoId}>
                                            <button
                                                type="button"
                                                className={dash.attentionItem}
                                                onClick={() => navigate(linkAluno(aluno.alunoId))}
                                            >
                                                <span className={`${dash.dot} ${dash.coralBg}`} />
                                                <span className={dash.attentionText}>
                                                    <strong>{aluno.nomeAluno}</strong>
                                                    <span>Nenhuma atividade concluída</span>
                                                </span>
                                                <ChevronRight size={16} className={dash.attentionArrow} />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>

                        <section className={`${dash.card} ${dash.full}`}>
                            <header className={dash.cardHeader}>
                                <h2 className={dash.cardTitle}>Alunos da turma</h2>
                                <span className={dash.cardNote}>Clique em um aluno para ver o detalhe</span>
                            </header>

                            {alunos.length === 0 ? (
                                <p className={dash.empty}>Esta turma ainda não tem alunos.</p>
                            ) : (
                                <table className={`${dash.table} ${styles.table}`}>
                                    <thead>
                                        <tr>
                                            <th>Aluno</th>
                                            <th>Pontuação</th>
                                            <th>Acertos</th>
                                            <th>Atividades concluídas</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {alunos.map((aluno) => (
                                            <tr
                                                key={aluno.alunoId}
                                                tabIndex={0}
                                                onClick={() => navigate(linkAluno(aluno.alunoId))}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") navigate(linkAluno(aluno.alunoId));
                                                }}
                                            >
                                                <td className={dash.strong}>{aluno.nomeAluno}</td>
                                                <td>{aluno.pontuacao}</td>
                                                <td>{aluno.acertos}</td>
                                                <td>
                                                    <span className={aluno.atividadesConcluidas === 0 ? styles.zero : ""}>
                                                        {aluno.atividadesConcluidas} / {desempenho.totalAtividades}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </section>
                    </div>
                </>
            )}
        </LayoutGestao>
    );
}

export default Desempenho;
