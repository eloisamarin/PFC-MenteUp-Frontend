import { useEffect, type ReactNode } from "react";
import { BookOpen, Check, Flame, Gift, Lock, RotateCw, Trophy, Zap } from "lucide-react";

import AlunoLayout from "../../components/aluno/AlunoLayout";
import ContadorConquistas from "../../components/conquistas/ContadorConquistas";
import IconeConquista from "../../components/conquistas/IconeConquista";
import { useConquistas } from "../../hooks/useConquistas";
import {
    daCategoria,
    fmt,
    formatarData,
    infoNivel,
    mostraBarra,
    semanaDaSequencia,
    textoProgresso,
} from "../../services/conquistasInfo";
import type { Conquista, ResumoConquistas } from "../../types/conquista";
import styles from "./Conquistas.module.css";

export default function Conquistas() {
    const { resumo, carregando, erro, carregarResumo, verificarNovas } = useConquistas();

    // Ao abrir a tela: carrega o mural e confere se há algo novo para comemorar
    useEffect(() => {
        void carregarResumo();
        void verificarNovas();
    }, [carregarResumo, verificarNovas]);

    let conteudo: ReactNode;

    if (!resumo && erro && !carregando) {
        conteudo = (
            <div className={`${styles.card} ${styles.estado}`} role="alert">
                <p>{erro}</p>
                <button type="button" className={styles.tentar} onClick={() => carregarResumo(true)}>
                    <RotateCw size={16} /> Tentar novamente
                </button>
            </div>
        );
    } else if (!resumo) {
        conteudo = (
            <div className={styles.grade}>
                <div className={styles.lateral}>
                    <div className={`${styles.card} ${styles.esqueleto}`} style={{ height: 200 }} />
                    <div className={`${styles.card} ${styles.esqueleto}`} style={{ height: 320 }} />
                </div>
                <div className={`${styles.card} ${styles.esqueleto} ${styles.rota}`} style={{ height: 560 }} />
            </div>
        );
    } else {
        conteudo = (
            <div className={styles.grade}>
                <div className={styles.lateral}>
                    <CardSequencia resumo={resumo} />
                    <CardLista
                        titulo="Atividades"
                        icone={<BookOpen size={18} className={styles.dourado} />}
                        conquistas={daCategoria(resumo, "ATIVIDADE")}
                    />
                    <CardLista
                        titulo="Ranking"
                        icone={<Trophy size={18} className={styles.menta} />}
                        conquistas={daCategoria(resumo, "RANKING")}
                    />
                </div>
                <RotaProgressao resumo={resumo} />
            </div>
        );
    }

    return (
        <AlunoLayout
            sidebarExtra={
                resumo && (
                    <ContadorConquistas
                        ganhas={resumo.conquistasDesbloqueadas}
                        total={resumo.totalConquistas}
                    />
                )
            }
        >
            <header className={styles.cabecalho}>
                <span className={styles.sobretitulo}>Seu mural</span>
                <h1 className={styles.titulo}>Conquistas</h1>
                <p className={styles.subtitulo}>Siga sua rota de níveis e colecione selos pelo caminho.</p>
            </header>
            {conteudo}
        </AlunoLayout>
    );
}

/* ---------- Intensivão: dias seguidos de login ---------- */

function CardSequencia({ resumo }: { resumo: ResumoConquistas }) {
    const selos = daCategoria(resumo, "INTENSIVAO");
    const proxima = selos.find((c) => !c.desbloqueada) ?? null;
    const dias = resumo.diasConsecutivos;
    const semana = semanaDaSequencia(dias);

    return (
        <section className={styles.card}>
            <div className={styles.sequenciaTopo}>
                <span className={styles.chama}>
                    <Flame size={22} />
                </span>
                <div>
                    <strong className={styles.sequenciaDias}>
                        {dias} {dias === 1 ? "dia" : "dias"}
                    </strong>
                    <span className={styles.sequenciaInfo}>
                        Dias seguidos na plataforma · recorde {resumo.maiorSequencia}
                    </span>
                </div>
            </div>

            <ol className={styles.semana} aria-label="Últimos 7 dias">
                {semana.map((dia, i) => (
                    <li key={i} className={styles.dia}>
                        <span
                            className={`${styles.bolinha} ${dia.marcado ? styles.bolinhaFeita : ""} ${dia.hoje ? styles.bolinhaHoje : ""}`}
                        >
                            {dia.marcado && <Check size={14} strokeWidth={3} />}
                        </span>
                        <span className={styles.letra}>{dia.hoje ? "Hoje" : dia.letra}</span>
                    </li>
                ))}
            </ol>

            <p className={styles.sequenciaTexto}>
                {proxima ? (
                    <>
                        Entre na plataforma todos os dias para chegar a {fmt(proxima.meta)} dias e ganhar{" "}
                        <strong>+{fmt(proxima.recompensaXp)} XP</strong>.
                    </>
                ) : (
                    "Você conquistou todos os selos do Intensivão. Imparável!"
                )}
            </p>

            {selos.length > 0 && (
                <ul className={styles.selos}>
                    {selos.map((c) => (
                        <li key={c.id} className={styles.selo} title={`${c.nome} · ${c.descricao}`}>
                            <IconeConquista conquista={c} tamanho="sm" />
                            <span>{fmt(c.meta)}d</span>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

/* ---------- Listas de Atividades e Ranking ---------- */

function CardLista({ titulo, icone, conquistas }: { titulo: string; icone: ReactNode; conquistas: Conquista[] }) {
    if (conquistas.length === 0) return null;
    const ganhas = conquistas.filter((c) => c.desbloqueada).length;

    return (
        <section className={styles.card}>
            <header className={styles.cardTopo}>
                <h2 className={styles.cardTitulo}>
                    {icone} {titulo}
                </h2>
                <span className={styles.nota}>
                    {ganhas}/{conquistas.length}
                </span>
            </header>
            <ul className={styles.lista}>
                {conquistas.map((c) => (
                    <ItemConquista key={c.id} conquista={c} />
                ))}
            </ul>
        </section>
    );
}

function ItemConquista({ conquista: c }: { conquista: Conquista }) {
    const data = formatarData(c.dataDesbloqueio);
    const barra = mostraBarra(c);

    return (
        <li className={`${styles.item} ${c.desbloqueada ? "" : styles.itemPendente}`}>
            <IconeConquista conquista={c} />
            <div className={styles.itemCorpo}>
                <div className={styles.itemLinha}>
                    <strong className={styles.itemNome}>{c.nome}</strong>
                    <span className={c.desbloqueada ? styles.itemFeito : styles.itemXp}>
                        {c.desbloqueada ? "Conquistado" : `+${fmt(c.recompensaXp)} XP`}
                    </span>
                </div>
                <span className={styles.itemDescricao}>
                    {c.desbloqueada && data ? `Conquistada em ${data}` : c.descricao}
                </span>
                {barra && (
                    <>
                        <div className={styles.trilho}>
                            <div className={styles.preenchido} style={{ width: `${c.percentual}%` }} />
                        </div>
                        <span className={styles.itemProgresso}>
                            {textoProgresso(c)} · {c.percentual}%
                        </span>
                    </>
                )}
            </div>
        </li>
    );
}

/* ---------- Rota de progressão (níveis por XP) ---------- */

function RotaProgressao({ resumo }: { resumo: ResumoConquistas }) {
    const { niveis, atual, proximo, numeroAtual, faltamXp } = infoNivel(resumo);
    const percentual = proximo ? proximo.percentual : 100;

    return (
        <section className={`${styles.card} ${styles.rota}`}>
            <header className={styles.rotaTopo}>
                <div>
                    <h2 className={styles.rotaTitulo}>Rota de progressão</h2>
                    <p className={styles.rotaSubtitulo}>Cada nível tem uma meta de XP e uma recompensa.</p>
                </div>
                <span className={styles.xpChip}>
                    <Zap size={16} /> {fmt(resumo.xpTotal)} XP
                </span>
            </header>

            <div className={styles.destaque}>
                <span className={styles.vocePill}>Você está aqui</span>

                <div className={styles.destaqueLinha}>
                    <div className={styles.marco}>
                        <span className={styles.circuloAtual}>{numeroAtual}</span>
                        <span className={styles.marcoNome}>{atual?.nome ?? "Início da jornada"}</span>
                    </div>

                    <div className={styles.destaqueMeio}>
                        <div className={styles.destaqueNumeros}>
                            <span className={styles.dourado}>{fmt(resumo.xpTotal)} XP</span>
                            <span>
                                {proximo ? `${percentual}% · faltam ${fmt(faltamXp)} XP` : "Nível máximo"}
                            </span>
                        </div>
                        <div className={`${styles.trilho} ${styles.trilhoGrande}`}>
                            <div
                                className={`${styles.preenchido} ${styles.preenchidoOuro}`}
                                style={{ width: `${percentual}%` }}
                            />
                        </div>
                        <p className={styles.missao}>
                            {proximo ? (
                                <>
                                    Próxima missão: <strong>{proximo.descricao}</strong>
                                </>
                            ) : (
                                <strong>Você chegou ao topo da rota. Parabéns!</strong>
                            )}
                        </p>
                    </div>

                    {proximo && (
                        <div className={styles.marco}>
                            <span className={styles.circuloProximo}>{numeroAtual + 1}</span>
                            <span className={styles.marcoNome}>{proximo.nome}</span>
                        </div>
                    )}
                </div>

                {proximo && (
                    <p className={styles.recompensa}>
                        <Gift size={14} /> Recompensa do nível {numeroAtual + 1}: +{fmt(proximo.recompensaXp)} XP
                    </p>
                )}
            </div>

            <ol className={styles.niveis}>
                {niveis.map((nivel, i) => {
                    const estado = nivel.desbloqueada ? "feito" : nivel === proximo ? "atual" : "bloqueado";
                    const data = formatarData(nivel.dataDesbloqueio);

                    return (
                        <li key={nivel.id} className={`${styles.nivel} ${styles[`nivel_${estado}`]}`}>
                            <span className={styles.nivelCirculo}>
                                {estado === "bloqueado" ? <Lock size={16} /> : i + 1}
                            </span>
                            <div className={styles.nivelTexto}>
                                <strong>{nivel.nome}</strong>
                                <span>
                                    {nivel.descricao} · +{fmt(nivel.recompensaXp)} XP
                                </span>
                            </div>
                            <span className={styles.nivelEstado}>
                                {estado === "feito"
                                    ? data ? `Concluído · ${data}` : "Concluído"
                                    : estado === "atual"
                                      ? `Em andamento · ${nivel.percentual}%`
                                      : "Bloqueado"}
                            </span>
                        </li>
                    );
                })}
            </ol>
        </section>
    );
}
