import { useEffect, useMemo, useState } from "react";
import PainelIndicadores from "../../components/PainelIndicadores";
import { useNavigate } from "react-router-dom";
import {
    BookOpen,
    ChevronRight,
    Flame,
    FlaskConical,
    Hourglass,
    Ruler,
} from "lucide-react";

import AlunoLayout from "../../components/aluno/AlunoLayout";
import { apiFetch } from "../../services/api";
import {
    idDoUsuario,
    nomeCurto,
    obterUsuarioLogado,
    primeiroNome,
} from "../../services/usuarioLogado";
import { useConquistas } from "../../hooks/useConquistas";
import { infoNivel } from "../../services/conquistasInfo";
import ProgressoCard from "../../components/aluno/ProgressoCard";
import { BadgeStatusDesafio } from "../../components/ComponentesDesafio";
import { contagem, type Desafio } from "../../services/turmaDesafio";
import { estaAberta, type AtividadeAluno, type RankingAluno } from "../../types/aluno";
import styles from "./dashboardAluno.module.css";
import { RostoUsuario } from "../../components/Avatar";

function saudacao(data = new Date()) {
    const h = data.getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
}

// Desafio do dia: o que está ao vivo agora ou, se não houver, o mais recente que ainda vai acontecer
function escolherDesafioDoDia(desafios: Desafio[]): Desafio | null {
    const pendentes = desafios.filter((d) => d.status !== "ENCERRADO");
    pendentes.sort((a, b) => {
        const aoVivo = Number(b.status === "EM_ANDAMENTO") - Number(a.status === "EM_ANDAMENTO");
        return aoVivo || (b.dataCriacao ?? "").localeCompare(a.dataCriacao ?? "");
    });
    return pendentes[0] ?? null;
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
    const [desafios, setDesafios] = useState<Desafio[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [agora, setAgora] = useState(() => new Date());
    const { resumo } = useConquistas();
    const nivel = infoNivel(resumo);

    useEffect(() => {
        async function carregar() {
            try {
                setCarregando(true);
                setErro("");

                const [respAtividades, respRanking, respDesafios] = await Promise.all([
                    apiFetch("/alunos/me/atividades"),
                    apiFetch("/ranking"),
                    apiFetch("/desafios"),
                ]);

                if (respAtividades.ok) {
                    setAtividades(await respAtividades.json());
                } else {
                    setErro("Não foi possível carregar suas atividades.");
                }

                if (respRanking.ok) {
                    setRanking(await respRanking.json());
                }

                if (respDesafios.ok) {
                    setDesafios(await respDesafios.json());
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
        const id = window.setInterval(() => setAgora(new Date()), 60000);
        return () => window.clearInterval(id);
    }, []);

    const dados = useMemo(() => {
        const abertas = atividades.filter(estaAberta);
        const concluidas = atividades.filter((a) => a.status === "CONCLUIDA");
        const emAndamento = atividades.filter((a) => a.status === "EM_ANDAMENTO");

        const posicaoIndice = meuId ? ranking.findIndex((r) => r.usuarioId === meuId) : -1;

        const acertos = concluidas.reduce((soma, a) => soma + (a.acertos ?? 0), 0);

        const fila = [...abertas].sort((a, b) => {
            if (a.status === "EM_ANDAMENTO" && b.status !== "EM_ANDAMENTO") return -1;
            if (b.status === "EM_ANDAMENTO" && a.status !== "EM_ANDAMENTO") return 1;
            return (b.atividade.dataCriacao ?? "").localeCompare(a.atividade.dataCriacao ?? "");
        });

        return {
            abertas,
            concluidas,
            emAndamento,
            fila,
            acertos,
            posicao: posicaoIndice >= 0 ? posicaoIndice + 1 : null,
        };
    }, [atividades, ranking, meuId]);

    const desafioDoDia = useMemo(() => escolherDesafioDoDia(desafios), [desafios]);

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
        <AlunoLayout sidebarExtra={<ProgressoCard concluidas={dados.concluidas.length} total={total} />}>
            <section className={styles.hero}>
                <div>
                    <span className={styles.eyebrowIndigo}>
                        {nivel.atual
                            ? `Nível ${nivel.numeroAtual} · ${nivel.atual.nome}`
                            : "Início da jornada"}
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
                            <h2 className={styles.cardTitleSm}>
                                {nivel.proximo ? `Próximo nível: ${nivel.proximo.nome}` : "Nível máximo"}
                            </h2>
                            <span className={styles.muted}>{nivel.proximo?.percentual ?? 100}%</span>
                        </header>

                        <div className={`${styles.track} ${styles.trackLg}`}>
                            <div
                                className={`${styles.fill} ${styles.fillIndigo}`}
                                style={{ width: `${nivel.proximo?.percentual ?? 100}%` }}
                            />
                        </div>
                        <div className={styles.trackLabels}>
                            <span>{fmt(resumo?.xpTotal ?? 0)} XP</span>
                            {nivel.proximo && <span>{fmt(nivel.proximo.meta)} XP</span>}
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
                        {desafioDoDia ? (
                            <button
                                type="button"
                                className={styles.challenge}
                                onClick={() => navigate(`/aluno/desafios/${desafioDoDia.id}`)}
                            >
                                <span className={styles.challengeTitle}>{desafioDoDia.titulo}</span>
                                <span className={styles.challengeText}>
                                    {desafioDoDia.descricao || `Desafio da turma ${desafioDoDia.turma.nome}.`}
                                </span>
                                <span className={styles.challengeFooter}>
                                    <span className={styles.timer}>
                                        <BadgeStatusDesafio status={desafioDoDia.status} />
                                        {contagem(desafioDoDia.totalPerguntas, "pergunta", "perguntas")}
                                    </span>
                                    <span className={styles.challengeXp}>
                                        {desafioDoDia.status === "EM_ANDAMENTO" ? "Entrar agora" : "Entrar na sala"}
                                    </span>
                                </span>
                            </button>
                        ) : carregando ? (
                            <p className={styles.challengeText}>Carregando...</p>
                        ) : (
                            <div className={styles.semDesafio}>
                                <strong>Sem desafio do dia</strong>
                                <span>Aguarde pelo próximo desafio</span>
                            </div>
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
                                    <RostoUsuario avatar={r.avatar} nome={r.nomeUsuario} className={styles.podiumAvatar} />
                                    <span className={styles.rowText}>
                                        <span className={styles.podiumName}>
                                            {nomeCurto(r.nomeUsuario)}
                                            {souEu && " (você)"}
                                        </span>
                                        <span className={styles.rowMeta}>
                                            {fmt(r.pontuacaoTotal)} pts
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

            <PainelIndicadores titulo="Meus indicadores" />
        </AlunoLayout>
    );
}

export default DashboardAluno;
