import { useEffect, useMemo, useState } from "react";
import { Crown, RotateCw, Trophy } from "lucide-react";

import AlunoLayout from "../../components/aluno/AlunoLayout";
import { apiFetch } from "../../services/api";
import { calcularNivel, proximaLiga, XP_POR_NIVEL } from "../../services/nivel";
import { idDoUsuario, iniciais, nomeCurto, obterUsuarioLogado } from "../../services/usuarioLogado";
import type { RankingAluno } from "../../types/aluno";
import styles from "./Ranking.module.css";

const fmt = (n: number) => n.toLocaleString("pt-BR");

export default function Ranking() {
    const [ranking, setRanking] = useState<RankingAluno[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    const meuId = idDoUsuario(obterUsuarioLogado());

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

    const nivelMeu = calcularNivel(meu?.dados.pontuacaoTotal ?? 0);
    const liga = proximaLiga(nivelMeu.nivel);

    function textoPosicao() {
        if (!meu) return "Conclua uma atividade para entrar no ranking e começar a subir!";
        if (meu.posicao === 1) return "Você está no topo! Continue no seu ritmo para manter a liderança.";
        const falta = (meu.acima?.pontuacaoTotal ?? 0) - meu.dados.pontuacaoTotal;
        return `Faltam ${fmt(Math.max(falta, 1))} XP para alcançar ${nomeCurto(meu.acima?.nomeUsuario)} no ${meu.posicao - 1}º lugar.`;
    }

    function textoLiga() {
        if (!liga) return "Você chegou à liga mais alta. Parabéns!";
        const xpNecessario = (liga.aPartirDe - 1) * XP_POR_NIVEL;
        return `Chegue ao nível ${liga.aPartirDe} (${fmt(xpNecessario)} XP) para avançar à liga ${liga.titulo}.`;
    }

    return (
        <AlunoLayout xp={carregando ? null : (meu?.dados.pontuacaoTotal ?? null)}>
            <header className={styles.header}>
                <span className={styles.eyebrow}>Evolução em equipe</span>
                <h1 className={styles.title}>Ranking geral</h1>
                <p className={styles.subtitle}>
                    Compare seu progresso de forma saudável e celebre cada avanço da turma.
                </p>
            </header>

            <div className={styles.layout}>
                <section className={styles.card} aria-label="Classificação">
                    {carregando ? (
                        <div className={styles.list}>
                            {[0, 1, 2, 3, 4].map((i) => (
                                <div key={i} className={`${styles.row} ${styles.skeleton}`} />
                            ))}
                        </div>
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
                        <ol className={styles.list}>
                            {ranking.map((aluno, index) => {
                                const posicao = index + 1;
                                const souEu = aluno.usuarioId === meuId;
                                const { nivel } = calcularNivel(aluno.pontuacaoTotal);

                                return (
                                    <li
                                        key={aluno.usuarioId}
                                        className={`${styles.row} ${souEu ? styles.rowMe : ""}`}
                                        aria-current={souEu ? "true" : undefined}
                                    >
                                        <span
                                            className={`${styles.position} ${posicao === 1 ? styles.positionFirst : ""}`}
                                        >
                                            {posicao}º
                                        </span>
                                        <span className={styles.avatar}>
                                            {iniciais(aluno.nomeUsuario)}
                                        </span>
                                        <span className={styles.info}>
                                            <span className={styles.name}>
                                                {nomeCurto(aluno.nomeUsuario)}
                                                {souEu && " (você)"}
                                            </span>
                                            <span className={styles.meta}>
                                                Nível {nivel} · {aluno.atividadesConcluidas}{" "}
                                                {aluno.atividadesConcluidas === 1
                                                    ? "atividade concluída"
                                                    : "atividades concluídas"}
                                            </span>
                                        </span>
                                        <span className={styles.xp}>
                                            {fmt(aluno.pontuacaoTotal)} XP
                                        </span>
                                    </li>
                                );
                            })}
                        </ol>
                    )}
                </section>

                <aside className={styles.aside}>
                    <section className={styles.card}>
                        <Crown size={36} className={styles.gold} />
                        <h2 className={styles.sideTitle}>
                            {meu ? `Você está em ${meu.posicao}º lugar` : "Sua posição"}
                        </h2>
                        <p className={styles.sideText}>{carregando ? "Carregando..." : textoPosicao()}</p>
                    </section>

                    <section className={styles.card}>
                        <h2 className={styles.sideLabel}>Liga atual</h2>
                        <strong className={styles.league}>{nivelMeu.titulo}</strong>
                        <p className={styles.sideText}>{carregando ? "Carregando..." : textoLiga()}</p>
                    </section>
                </aside>
            </div>
        </AlunoLayout>
    );
}
