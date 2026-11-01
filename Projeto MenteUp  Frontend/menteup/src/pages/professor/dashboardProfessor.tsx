import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Plus, RotateCw } from "lucide-react";

import ProfessorLayout from "../../components/professor/ProfessorLayout";
import { apiFetch } from "../../services/api";
import { nomeCurto, obterUsuarioLogado, primeiroNome } from "../../services/usuarioLogado";
import type { RankingAluno } from "../../types/aluno";
import styles from "./dashboardProfessor.module.css";

type StatusAtividade = "PENDENTE" | "EM_ANDAMENTO" | "CONCLUIDO";

interface AtividadeProfessor {
    id: number | string;
    titulo: string;
    descricao?: string;
    pontuacao: number;
    status: StatusAtividade;
    dataCriacao?: string;
    turma?: { id: number | string; nome?: string };
}

const STATUS: Record<StatusAtividade, { rotulo: string; classe: string }> = {
    PENDENTE: { rotulo: "Rascunho", classe: "statusDraft" },
    EM_ANDAMENTO: { rotulo: "Ativa", classe: "statusActive" },
    CONCLUIDO: { rotulo: "Encerrada", classe: "statusClosed" },
};

interface ItemAtencao {
    cor: "coral" | "gold" | "indigo";
    titulo: string;
    detalhe: string;
    para?: string;
}

function saudacao(data = new Date()) {
    const h = data.getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
}

const fmt = (n: number) => n.toLocaleString("pt-BR");

function DashboardProfessor() {
    const navigate = useNavigate();
    const usuario = obterUsuarioLogado();

    const [atividades, setAtividades] = useState<AtividadeProfessor[]>([]);
    const [ranking, setRanking] = useState<RankingAluno[] | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    async function carregar() {
        try {
            setCarregando(true);
            setErro("");

            const [respAtividades, respRanking] = await Promise.all([
                apiFetch("/atividades"),
                apiFetch("/ranking").catch(() => null),
            ]);

            if (!respAtividades.ok) throw new Error("Erro ao carregar atividades");

            const dados: AtividadeProfessor[] = await respAtividades.json();
            setAtividades([...dados].sort((a, b) => Number(b.id) - Number(a.id)));

            setRanking(respRanking?.ok ? await respRanking.json() : null);
        } catch (error) {
            console.error("Erro ao carregar visão geral:", error);
            setErro("Não foi possível carregar os dados da visão geral.");
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        carregar();
    }, []);

    const dados = useMemo(() => {
        const ativas = atividades.filter((a) => a.status === "EM_ANDAMENTO");
        const rascunhos = atividades.filter((a) => a.status === "PENDENTE");
        const encerradas = atividades.filter((a) => a.status === "CONCLUIDO");

        const alunos = ranking ?? [];
        const engajados = alunos.filter((a) => a.atividadesConcluidas > 0);
        const semAtividade = alunos.length - engajados.length;

        const xpMedio = alunos.length
            ? Math.round(alunos.reduce((s, a) => s + a.pontuacaoTotal, 0) / alunos.length)
            : 0;

        const grafico = [...alunos]
            .sort((a, b) => b.atividadesConcluidas - a.atividadesConcluidas)
            .slice(0, 7);
        const maxGrafico = Math.max(1, ...grafico.map((a) => a.atividadesConcluidas));

        const atencao: ItemAtencao[] = [];
        rascunhos.slice(0, 2).forEach((a) =>
            atencao.push({
                cor: "coral",
                titulo: a.titulo,
                detalhe: "Rascunho · ainda não publicada para os alunos",
                para: `/professor/atividades/editar/${a.id}`,
            })
        );
        if (rascunhos.length > 2) {
            atencao.push({
                cor: "coral",
                titulo: `Mais ${rascunhos.length - 2} rascunhos`,
                detalhe: "Revise e publique quando estiverem prontos",
                para: "/professor/atividades",
            });
        }
        if (semAtividade > 0) {
            atencao.push({
                cor: "gold",
                titulo: "Alunos sem atividades concluídas",
                detalhe: `${semAtividade} ${semAtividade === 1 ? "aluno ainda não concluiu" : "alunos ainda não concluíram"} nenhuma atividade`,
            });
        }
        if (ativas.length === 0 && !carregando) {
            atencao.push({
                cor: "indigo",
                titulo: "Nenhuma atividade ativa",
                detalhe: "Publique uma atividade para engajar a turma",
                para: "/professor/atividades/criar",
            });
        }

        return {
            ativas,
            rascunhos,
            encerradas,
            alunos,
            engajados,
            xpMedio,
            grafico,
            maxGrafico,
            atencao,
        };
    }, [atividades, ranking, carregando]);

    const temRanking = ranking !== null;
    const valor = (n: number | string) => (carregando ? "…" : n);

    return (
        <ProfessorLayout alunos={carregando ? null : ranking}>
            <header className={styles.hero}>
                <div>
                    <span className={styles.eyebrow}>Visão da turma</span>
                    <h1 className={styles.title}>
                        {saudacao()}, prof. {primeiroNome(usuario)}
                    </h1>
                    <p className={styles.subtitle}>
                        Acompanhe participação, desempenho e os próximos passos da turma.
                    </p>
                </div>
                <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={() => navigate("/professor/atividades/criar")}
                >
                    <Plus size={16} /> Criar atividade
                </button>
            </header>

            {erro && (
                <div className={styles.error} role="alert">
                    {erro}
                    <button type="button" className={styles.retry} onClick={carregar}>
                        <RotateCw size={14} /> Tentar novamente
                    </button>
                </div>
            )}

            <div className={styles.stats}>
                <div className={styles.stat}>
                    <strong className={styles.indigo}>{valor(dados.ativas.length)}</strong>
                    <span>Atividades ativas</span>
                </div>
                <div className={styles.stat}>
                    <strong className={styles.gold}>{valor(dados.rascunhos.length)}</strong>
                    <span>Rascunhos</span>
                </div>
                <div className={styles.stat}>
                    <strong className={styles.coral}>
                        {temRanking ? valor(dados.engajados.length) : "–"}
                    </strong>
                    <span>Alunos ativos</span>
                </div>
                <div className={styles.stat}>
                    <strong className={styles.indigo}>
                        {temRanking ? valor(fmt(dados.xpMedio)) : "–"}
                    </strong>
                    <span>XP médio por aluno</span>
                </div>
            </div>

            <div className={styles.grid}>
                <section className={styles.card}>
                    <header className={styles.cardHeader}>
                        <h2 className={styles.cardTitle}>Engajamento dos alunos</h2>
                        <span className={styles.cardNote}>Atividades concluídas · top 7</span>
                    </header>

                    {!temRanking || dados.grafico.length === 0 ? (
                        <p className={styles.empty}>
                            {carregando
                                ? "Carregando..."
                                : "Ainda não há dados de alunos para exibir."}
                        </p>
                    ) : (
                        <div className={styles.chart} role="img" aria-label="Atividades concluídas por aluno">
                            {dados.grafico.map((a) => {
                                const altura = (a.atividadesConcluidas / dados.maxGrafico) * 100;
                                return (
                                    <div key={a.usuarioId} className={styles.barCol}>
                                        <span className={styles.barValue}>{a.atividadesConcluidas}</span>
                                        <div className={styles.barTrack}>
                                            <div
                                                className={styles.bar}
                                                style={{ height: `${Math.max(altura, 4)}%` }}
                                                title={`${a.nomeUsuario}: ${a.atividadesConcluidas} concluídas`}
                                            />
                                        </div>
                                        <span className={styles.barLabel}>{nomeCurto(a.nomeUsuario)}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                <section className={styles.card}>
                    <h2 className={styles.cardTitle}>Atenção recomendada</h2>

                    {carregando ? (
                        <p className={styles.empty}>Carregando...</p>
                    ) : dados.atencao.length === 0 ? (
                        <p className={styles.empty}>Tudo em dia por aqui. Bom trabalho!</p>
                    ) : (
                        <ul className={styles.attention}>
                            {dados.atencao.map((item, i) => {
                                const conteudo = (
                                    <>
                                        <span className={`${styles.dot} ${styles[`${item.cor}Bg`]}`} />
                                        <span className={styles.attentionText}>
                                            <strong>{item.titulo}</strong>
                                            <span>{item.detalhe}</span>
                                        </span>
                                    </>
                                );
                                return (
                                    <li key={i}>
                                        {item.para ? (
                                            <button
                                                type="button"
                                                className={styles.attentionItem}
                                                onClick={() => navigate(item.para!)}
                                            >
                                                {conteudo}
                                                <ChevronRight size={16} className={styles.attentionArrow} />
                                            </button>
                                        ) : (
                                            <div className={styles.attentionItem}>{conteudo}</div>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </section>

                <section className={`${styles.card} ${styles.full}`}>
                    <header className={styles.cardHeader}>
                        <h2 className={styles.cardTitle}>Atividades recentes</h2>
                        <button
                            type="button"
                            className={styles.linkButton}
                            onClick={() => navigate("/professor/atividades")}
                        >
                            Ver todas <ChevronRight size={16} />
                        </button>
                    </header>

                    {!carregando && atividades.length === 0 ? (
                        <p className={styles.empty}>
                            Você ainda não criou atividades. Que tal começar agora?
                        </p>
                    ) : (
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Atividade</th>
                                    <th>Turma</th>
                                    <th>Pontuação</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(carregando ? [] : atividades.slice(0, 5)).map((a) => {
                                    const status = STATUS[a.status] ?? STATUS.PENDENTE;
                                    return (
                                        <tr
                                            key={a.id}
                                            tabIndex={0}
                                            onClick={() => navigate(`/professor/atividades/${a.id}`)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") navigate(`/professor/atividades/${a.id}`);
                                            }}
                                        >
                                            <td className={styles.strong}>{a.titulo}</td>
                                            <td>{a.turma?.nome ?? "Sem turma"}</td>
                                            <td>{fmt(a.pontuacao)} XP</td>
                                            <td>
                                                <span className={`${styles.status} ${styles[status.classe]}`}>
                                                    {status.rotulo}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                    {carregando && <p className={styles.empty}>Carregando...</p>}
                </section>
            </div>
        </ProfessorLayout>
    );
}

export default DashboardProfessor;
