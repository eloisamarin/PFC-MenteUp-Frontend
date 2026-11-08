import { useEffect, useMemo, useState } from "react";
import { Crown, RotateCw, Trophy } from "lucide-react";

import AlunoLayout from "../../components/aluno/AlunoLayout";
import AdminLayout from "../../components/administrador/AdminLayout";
import { apiFetch } from "../../services/api";
import { useConquistas } from "../../hooks/useConquistas";
import { infoNivel } from "../../services/conquistasInfo";
import { idDoUsuario, iniciais, nomeCurto, obterUsuarioLogado } from "../../services/usuarioLogado";
import type { RankingAluno } from "../../types/aluno";
import styles from "./Ranking.module.css";

const fmt = (n: number) => n.toLocaleString("pt-BR");

const PODIO = [
    { rotulo: "Campeão", classe: styles.first },
    { rotulo: "Vice", classe: styles.second },
    { rotulo: "Terceiro", classe: styles.third },
];

export default function Ranking({ perfil = "ALUNO" }: { perfil?: "ALUNO" | "ADMINISTRADOR" }) {
    const admin = perfil === "ADMINISTRADOR";
    const [ranking, setRanking] = useState<RankingAluno[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    const meuId = idDoUsuario(obterUsuarioLogado());
    const { resumo } = useConquistas();

    useEffect(() => {
        carregarRanking();
    }, []);

    async function carregarRanking() {
        try {
            setCarregando(true);
            setErro("");

            const resposta = await apiFetch("/ranking");

            if (!resposta.ok) {
                throw new Error("Não foi possível carregar o ranking.");
            }

            const dados: RankingAluno[] = await resposta.json();
            setRanking(dados);
        } catch (error) {
            console.error("Erro ao carregar ranking:", error);
            setErro("Não foi possível carregar o ranking.");
        } finally {
            setCarregando(false);
        }
    }

    const meu = useMemo(() => {
        const indice = meuId ? ranking.findIndex((a) => a.usuarioId === meuId) : -1;
        if (indice === -1) return null;
        return { posicao: indice + 1, dados: ranking[indice], acima: ranking[indice - 1] ?? null };
    }, [ranking, meuId]);

    const nivelMeu = infoNivel(resumo);

    function textoPosicao() {
        if (!meu) return "Conclua uma atividade para entrar no ranking e começar a subir!";
        if (meu.posicao === 1) return "Você está no topo! Continue no seu ritmo para manter a liderança.";
        const falta = (meu.acima?.pontuacaoTotal ?? 0) - meu.dados.pontuacaoTotal;
        return `Faltam ${fmt(Math.max(falta, 1))} pontos para alcançar ${nomeCurto(meu.acima?.nomeUsuario)} no ${meu.posicao - 1}º lugar.`;
    }

    function textoNivel() {
        if (!resumo) return "Carregando...";
        if (!nivelMeu.proximo) return "Você chegou ao nível mais alto. Parabéns!";
        return `Faltam ${fmt(nivelMeu.faltamXp)} XP para chegar a ${nivelMeu.proximo.nome}.`;
    }

    const conteudo = (
        <>
            <header className={styles.header}>
                <span className={styles.eyebrow}>{admin ? "Administração" : "Evolução em equipe"}</span>
                <h1 className={styles.title}>Ranking geral</h1>
                <p className={styles.subtitle}>
                    {admin
                        ? "Classificação geral dos alunos por pontos e atividades concluídas."
                        : "Compare seu progresso de forma saudável e celebre cada avanço da turma."}
                </p>
            </header>

            <div className={styles.layout}>
                <div className={styles.main}>
                    <section className={`${styles.card} ${styles.podiumCard}`} aria-label="Pódio">
                        <header className={styles.cardHeader}>
                            <div>
                                <h2 className={styles.cardTitle}>
                                    <Trophy size={20} className={styles.gold} /> Pódio
                                </h2>
                                <p className={styles.cardNote}>As três maiores pontuações do ranking.</p>
                            </div>
                            <span className={styles.chip}>Top 3</span>
                        </header>

                        {carregando ? (
                            <div className={`${styles.podiumSkeleton} ${styles.skeleton}`} />
                        ) : erro ? (
                            <div className={styles.state}>
                                <p className={styles.errorText}>{erro}</p>
                                <button type="button" className={styles.retry} onClick={carregarRanking}>
                                    <RotateCw size={16} /> Tentar novamente
                                </button>
                            </div>
                        ) : ranking.length === 0 ? (
                            <div className={styles.state}>
                                <Trophy size={40} className={styles.stateIcon} />
                                <strong>Ainda não há participantes no ranking</strong>
                                <span>Conclua uma atividade para começar a acumular pontos.</span>
                            </div>
                        ) : (
                            <ol className={styles.podium}>
                                {[1, 0, 2].map((indice) => {
                                    const aluno = ranking[indice];
                                    if (!aluno) return <li key={indice} className={styles.podiumEmpty} aria-hidden />;
                                    const lugar = PODIO[indice];
                                    const souEu = aluno.usuarioId === meuId;
                                    return (
                                        <li key={aluno.usuarioId} className={`${styles.podiumSpot} ${lugar.classe}`}>
                                            <div className={styles.podiumPerson}>
                                                {indice === 0 && <Crown size={26} className={styles.crown} />}
                                                <span className={styles.podiumAvatar}>{iniciais(aluno.nomeUsuario)}</span>
                                                <strong className={styles.podiumName}>{nomeCurto(aluno.nomeUsuario)}</strong>
                                                <span className={styles.podiumLevel}>
                                                    {aluno.atividadesConcluidas}{" "}
                                                    {aluno.atividadesConcluidas === 1 ? "atividade" : "atividades"}
                                                </span>
                                                <span className={styles.podiumXp}>{fmt(aluno.pontuacaoTotal)} pts</span>
                                                {souEu && <span className={styles.youChip}>Você</span>}
                                            </div>
                                            <div className={styles.pedestal}>
                                                <span className={styles.pedestalBadge}>{indice + 1}º</span>
                                                <span className={styles.pedestalLabel}>{lugar.rotulo}</span>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ol>
                        )}
                    </section>

                    <section className={styles.card} aria-label="Classificação">
                        <header className={styles.cardHeader}>
                            <h2 className={styles.cardTitle}>Classificação completa</h2>
                            {!carregando && !erro && (
                                <span className={styles.cardNote}>
                                    {ranking.length} {ranking.length === 1 ? "aluno" : "alunos"}
                                </span>
                            )}
                        </header>

                        {carregando ? (
                            <div className={styles.list}>
                                {[0, 1, 2].map((i) => (
                                    <div key={i} className={`${styles.row} ${styles.skeleton}`} />
                                ))}
                            </div>
                        ) : ranking.length <= 3 ? (
                            <p className={styles.cardNote}>
                                {erro ? "Não foi possível carregar a classificação." : "Os demais colocados aparecem aqui a partir do 4º lugar."}
                            </p>
                        ) : (
                            <ol className={styles.list} start={4}>
                                {ranking.slice(3).map((aluno, index) => {
                                    const posicao = index + 4;
                                    const souEu = aluno.usuarioId === meuId;

                                    return (
                                        <li
                                            key={aluno.usuarioId}
                                            className={`${styles.row} ${souEu ? styles.rowMe : ""}`}
                                            aria-current={souEu ? "true" : undefined}
                                        >
                                            <span className={styles.position}>{posicao}º</span>
                                            <span className={styles.avatar}>{iniciais(aluno.nomeUsuario)}</span>
                                            <span className={styles.info}>
                                                <span className={styles.name}>
                                                    {nomeCurto(aluno.nomeUsuario)}
                                                    {souEu && " (você)"}
                                                </span>
                                                <span className={styles.meta}>
                                                    {aluno.atividadesConcluidas}{" "}
                                                    {aluno.atividadesConcluidas === 1
                                                        ? "atividade concluída"
                                                        : "atividades concluídas"}
                                                </span>
                                            </span>
                                            <span className={styles.xp}>{fmt(aluno.pontuacaoTotal)} pts</span>
                                        </li>
                                    );
                                })}
                            </ol>
                        )}
                    </section>
                </div>

                {!admin && (
                    <aside className={styles.aside}>
                        <section className={styles.card}>
                            <Crown size={36} className={styles.gold} />
                            <h2 className={styles.sideTitle}>
                                {meu ? `Você está em ${meu.posicao}º lugar` : "Sua posição"}
                            </h2>
                            <p className={styles.sideText}>{carregando ? "Carregando..." : textoPosicao()}</p>
                        </section>

                        <section className={styles.card}>
                            <h2 className={styles.sideLabel}>Seu nível</h2>
                            <strong className={styles.league}>{nivelMeu.atual?.nome ?? "Início da jornada"}</strong>
                            <p className={styles.sideText}>{textoNivel()}</p>
                        </section>
                    </aside>
                )}
            </div>
        </>
    );

    if (admin) return <AdminLayout>{conteudo}</AdminLayout>;

    return <AlunoLayout>{conteudo}</AlunoLayout>;
}
