import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    BookOpen,
    ChevronRight,
    Clock,
    Flame,
    FlaskConical,
    Hourglass,
    Ruler,
} from "lucide-react";

import AlunoLayout from "../../components/aluno/AlunoLayout";
import { apiFetch } from "../../services/api";
import {
    iniciais,
    idDoUsuario,
    nomeCurto,
    obterUsuarioLogado,
    primeiroNome,
} from "../../services/usuarioLogado";
import { calcularNivel } from "../../services/nivel";
import ProgressoCard from "../../components/aluno/ProgressoCard";
import { estaAberta, type AtividadeAluno, type RankingAluno } from "../../types/aluno";
import styles from "./dashboardAluno.module.css";

function saudacao(data = new Date()) {
    const h = data.getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
}

function tempoAteMeiaNoite(agora: Date) {
    const fim = new Date(agora);
    fim.setHours(24, 0, 0, 0);
    const s = Math.max(0, Math.floor((fim.getTime() - agora.getTime()) / 1000));
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
}

const ICONES = [
    { icone: <FlaskConical size={20} />, cor: "mint" },
    { icone: <Ruler size={20} />, cor: "gold" },
    { icone: <BookOpen size={20} />, cor: "coral" },
] as const;

const fmt = (n: number) => n.toLocaleString("pt-BR");

function DashboardAluno() {
    const navigate = useNavigate();
    const usuario = obterUsuarioLogado();
    const meuId = idDoUsuario(usuario);

    const [atividades, setAtividades] = useState<AtividadeAluno[]>([]);
    const [ranking, setRanking] = useState<RankingAluno[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [agora, setAgora] = useState(() => new Date());

    useEffect(() => {
        async function carregar() {
            try {
                setCarregando(true);
                setErro("");

                const [respAtividades, respRanking] = await Promise.all([
                    apiFetch("/alunos/me/atividades"),
                    apiFetch("/ranking"),
                ]);

                if (respAtividades.ok) {
                    setAtividades(await respAtividades.json());
                } else {
                    setErro("Não foi possível carregar suas atividades.");
                }

                if (respRanking.ok) {
                    setRanking(await respRanking.json());
                }
            } catch (error) {
                console.error("Erro ao carregar dashboard:", error);
                setErro("Não foi possível conectar ao servidor.");
            } finally {
                setCarregando(false);
            }
        }

        carregar();
    }, []);

    useEffect(() => {
        const id = window.setInterval(() => setAgora(new Date()), 1000);
        return () => window.clearInterval(id);
    }, []);

    const dados = useMemo(() => {
        const abertas = atividades.filter(estaAberta);
        const concluidas = atividades.filter((a) => a.status === "CONCLUIDA");
        const emAndamento = atividades.filter((a) => a.status === "EM_ANDAMENTO");

        const posicaoIndice = meuId ? ranking.findIndex((r) => r.usuarioId === meuId) : -1;
        const minhaEntrada = posicaoIndice >= 0 ? ranking[posicaoIndice] : null;

        const xp =
            minhaEntrada?.pontuacaoTotal ??
            concluidas.reduce((soma, a) => soma + (a.pontuacao ?? 0), 0);

        const acertos = concluidas.reduce((soma, a) => soma + (a.acertos ?? 0), 0);

        const fila = [...abertas].sort((a, b) => {
            if (a.status === "EM_ANDAMENTO" && b.status !== "EM_ANDAMENTO") return -1;
            if (b.status === "EM_ANDAMENTO" && a.status !== "EM_ANDAMENTO") return 1;
            return (b.atividade.dataCriacao ?? "").localeCompare(a.atividade.dataCriacao ?? "");
        });

        const desafio =
            [...abertas].sort((a, b) => b.atividade.pontuacao - a.atividade.pontuacao)[0] ?? null;

        return {
            abertas,
            concluidas,
            emAndamento,
            fila,
            desafio,
            xp,
            acertos,
            posicao: posicaoIndice >= 0 ? posicaoIndice + 1 : null,
            nivel: calcularNivel(xp),
        };
    }, [atividades, ranking, meuId]);

    const total = atividades.length;

    function abrirAtividade(id: number) {
        navigate(`/aluno/atividades/responder/${id}`);
    }

    function continuarJornada() {
        const proxima = dados.fila[0];
        if (proxima) abrirAtividade(proxima.atividade.id);
        else navigate("/aluno/atividades");
    }

    return (
        <AlunoLayout xp={carregando ? null : dados.xp} sidebarExtra={<ProgressoCard concluidas={dados.concluidas.length} total={total} />}>
            <section className={styles.hero}>
                <div>
                    <span className={styles.eyebrowIndigo}>
                        Nível {dados.nivel.nivel} · {dados.nivel.titulo}
                    </span>
                    <h1 className={styles.heroTitle}>
                        {saudacao(agora)}, <span>{primeiroNome(usuario)}!</span>
                    </h1>
                    <p className={styles.heroText}>
                        {carregando
                            ? "Carregando sua jornada..."
                            : dados.abertas.length > 0
                              ? `Você tem ${dados.abertas.length} ${dados.abertas.length === 1 ? "atividade esperando" : "atividades esperando"} por você.`
                              : "Nenhuma atividade pendente. Aproveite para revisar o ranking!"}
                    </p>
                </div>

                <div className={styles.heroStats}>
                    <div className={styles.statCard}>
                        <Flame size={20} className={styles.gold} />
                        <strong>{dados.emAndamento.length}</strong>
                        <span>Em andamento</span>
                    </div>
                    <div className={styles.statCard}>
                        <Hourglass size={20} className={styles.gold} />
                        <strong>{dados.abertas.length}</strong>
                        <span>Pendentes</span>
                    </div>
                </div>
            </section>

            {erro && (
                <div className={styles.error} role="alert">
                    {erro}
                </div>
            )}

            <div className={styles.grid}>
                <section className={`${styles.card} ${styles.journey}`}>
                    <header className={styles.cardHeader}>
                        <h2 className={styles.cardTitle}>Jornada de hoje</h2>
                        <span className={styles.badge}>
                            {dados.concluidas.length} de {total} concluídas
                        </span>
                    </header>

                    <div className={styles.list}>
                        {carregando &&
                            [0, 1, 2].map((i) => <div key={i} className={styles.skeleton} />)}

                        {!carregando && dados.fila.length === 0 && (
                            <p className={styles.empty}>
                                Nenhuma atividade aberta no momento. Novas missões aparecem aqui
                                assim que o professor publicar.
                            </p>
                        )}

                        {!carregando &&
                            dados.fila.slice(0, 3).map((item, i) => {
                                const { icone, cor } = ICONES[i % ICONES.length];
                                return (
                                    <button
                                        key={item.atividade.id}
                                        type="button"
                                        className={styles.row}
                                        onClick={() => abrirAtividade(item.atividade.id)}
                                    >
                                        <span className={`${styles.rowIcon} ${styles[cor]}`}>
                                            {icone}
                                        </span>
                                        <span className={styles.rowText}>
                                            <span className={styles.rowTitle}>
                                                {item.atividade.titulo}
                                            </span>
                                            <span className={styles.rowMeta}>
                                                {item.atividade.turma?.nome ?? "Sem turma"}
                                                {item.status === "EM_ANDAMENTO" &&
                                                    item.percentualConclusao != null &&
                                                    ` · ${Math.round(item.percentualConclusao)}% feito`}
                                            </span>
                                        </span>
                                        <span className={styles.rowXp}>
                                            {item.status === "EM_ANDAMENTO"
                                                ? "Continuar"
                                                : `+${fmt(item.atividade.pontuacao)} XP`}
                                        </span>
                                    </button>
                                );
                            })}
                    </div>

                    <button type="button" className={styles.primaryButton} onClick={continuarJornada}>
                        {dados.fila.length > 0 ? "Continuar jornada" : "Ver todas as atividades"}
                        <ChevronRight size={16} />
                    </button>
                </section>

                <div className={styles.column}>
                    <section className={styles.card}>
                        <header className={styles.cardHeader}>
                            <h2 className={styles.cardTitleSm}>Próximo nível</h2>
                            <span className={styles.muted}>{dados.nivel.percentual}%</span>
                        </header>

                        <div className={`${styles.track} ${styles.trackLg}`}>
                            <div
                                className={`${styles.fill} ${styles.fillIndigo}`}
                                style={{ width: `${dados.nivel.percentual}%` }}
                            />
                        </div>
                        <div className={styles.trackLabels}>
                            <span>{fmt(dados.xp)} XP</span>
                            <span>{fmt(dados.nivel.xpProximoNivel)} XP</span>
                        </div>

                        <div className={styles.miniStats}>
                            <div className={styles.miniStat}>
                                <strong className={styles.mintText}>
                                    {dados.concluidas.length}
                                </strong>
                                <span>Concluídas</span>
                            </div>
                            <div className={styles.miniStat}>
                                <strong className={styles.goldText}>{fmt(dados.acertos)}</strong>
                                <span>Acertos</span>
                            </div>
                            <div className={styles.miniStat}>
                                <strong className={styles.coralText}>
                                    {dados.posicao ? `${dados.posicao}º` : "–"}
                                </strong>
                                <span>Ranking</span>
                            </div>
                        </div>
                    </section>

                    <section className={styles.card}>
                        <span className={styles.eyebrowCoral}>Desafio do dia</span>
                        {dados.desafio ? (
                            <button
                                type="button"
                                className={styles.challenge}
                                onClick={() => abrirAtividade(dados.desafio!.atividade.id)}
                            >
                                <span className={styles.challengeTitle}>
                                    {dados.desafio.atividade.titulo}
                                </span>
                                <span className={styles.challengeText}>
                                    {dados.desafio.atividade.descricao ||
                                        "A atividade que mais vale XP agora."}
                                </span>
                                <span className={styles.challengeFooter}>
                                    <span className={styles.timer}>
                                        <Clock size={16} />
                                        {tempoAteMeiaNoite(agora)}
                                    </span>
                                    <span className={styles.challengeXp}>
                                        +{fmt(dados.desafio.atividade.pontuacao)} XP
                                    </span>
                                </span>
                            </button>
                        ) : (
                            <p className={styles.challengeText}>
                                {carregando ? "Carregando..." : "Sem desafios abertos hoje."}
                            </p>
                        )}
                    </section>
                </div>

                <section className={`${styles.card} ${styles.podium}`}>
                    <header className={styles.cardHeader}>
                        <h2 className={styles.cardTitleSm}>
                            Pódio do ranking
                            {dados.posicao && dados.posicao > 3 && (
                                <span className={styles.muted}> · você está em {dados.posicao}º</span>
                            )}
                        </h2>
                        <button
                            type="button"
                            className={styles.linkButton}
                            onClick={() => navigate("/aluno/ranking")}
                        >
                            Ver ranking <ChevronRight size={16} />
                        </button>
                    </header>

                    <div className={styles.podiumGrid}>
                        {ranking.slice(0, 3).map((r, i) => {
                            const souEu = r.usuarioId === meuId;
                            return (
                                <div
                                    key={r.usuarioId}
                                    className={`${styles.podiumItem} ${souEu ? styles.podiumMe : ""}`}
                                >
                                    <span className={styles.podiumPos}>{i + 1}º</span>
                                    <span className={styles.podiumAvatar}>
                                        {iniciais(r.nomeUsuario)}
                                    </span>
                                    <span className={styles.rowText}>
                                        <span className={styles.podiumName}>
                                            {nomeCurto(r.nomeUsuario)}
                                            {souEu && " (você)"}
                                        </span>
                                        <span className={styles.rowMeta}>
                                            {fmt(r.pontuacaoTotal)} XP
                                        </span>
                                    </span>
                                </div>
                            );
                        })}

                        {!carregando && ranking.length === 0 && (
                            <p className={styles.empty}>O ranking ainda está vazio.</p>
                        )}
                    </div>
                </section>
            </div>
        </AlunoLayout>
    );
}

export default DashboardAluno;
