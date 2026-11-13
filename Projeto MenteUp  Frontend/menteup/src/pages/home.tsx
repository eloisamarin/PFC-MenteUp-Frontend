import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Award,
    Check,
    ChartColumn,
    ChevronRight,
    Flame,
    GraduationCap,
    Target,
    Trophy,
    Users,
    Zap,
} from "lucide-react";

import styles from "./home.module.css";
import { LogoMarca, LogoNome } from "../components/Logo";

type Perfil = "estudante" | "professor";

interface Recurso {
    icone: ReactNode;
    cor: string;
    titulo: string;
    descricao: string;
}

const RECURSOS: Recurso[] = [
    {
        icone: <Zap size={20} />,
        cor: styles.gold,
        titulo: "XP em cada atividade",
        descricao: "Cada exercício concluído rende pontos que fazem você subir de nível.",
    },
    {
        icone: <Target size={20} />,
        cor: styles.indigo,
        titulo: "Desafios",
        descricao: "Metas diárias e semanais com recompensas extras.",
    },
    {
        icone: <Award size={20} />,
        cor: styles.coral,
        titulo: "Conquistas",
        descricao: "Desbloqueie selos e avatares exclusivos conforme evolui.",
    },
    {
        icone: <ChartColumn size={20} />,
        cor: styles.mint,
        titulo: "Ranking da turma",
        descricao: "Acompanhe sua evolução junto com os colegas, em tempo real.",
    },
];

const PASSOS = [
    { numero: "01", titulo: "Crie sua conta", descricao: "Cadastre-se como estudante ou professor." },
    { numero: "02", titulo: "Complete missões", descricao: "Resolva quizzes e desafios das suas disciplinas." },
    { numero: "03", titulo: "Evolua e conquiste", descricao: "Ganhe XP, suba de nível e desbloqueie recompensas." },
];

const VANTAGENS_PROFESSOR = [
    "Criação rápida com templates de atividades",
    "Alertas automáticos de baixa participação",
    "Ranking e relatórios por turma",
];

const PARTICIPACAO = [38, 52, 46, 68, 62, 76, 64];

function Home() {
    const navigate = useNavigate();
    const [perfil, setPerfil] = useState<Perfil>("estudante");

    const entrar = () => navigate("/login");
    const cadastrar = () => navigate("/cadastro", { state: { perfil } });

    const marca = (
        <Link to="/" className={styles.brand}>
            <LogoMarca tamanho={36} />
            <LogoNome className={styles.brandName} />
        </Link>
    );

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className={`${styles.container} ${styles.headerInner}`}>
                    {marca}
                    <nav className={styles.nav} aria-label="Seções da página">
                        <a href="#recursos">Recursos</a>
                        <a href="#como-funciona">Como funciona</a>
                        <a href="#professores">Para professores</a>
                    </nav>
                    <div className={styles.headerActions}>
                        <button type="button" className={styles.textButton} onClick={entrar}>
                            Entrar
                        </button>
                        <button type="button" className={styles.pillButton} onClick={cadastrar}>
                            Criar conta
                        </button>
                    </div>
                </div>
            </header>

            <div>
                <section className={`${styles.container} ${styles.hero}`}>
                    <div className={styles.heroCopy}>
                        <span className={styles.badge}>
                            <Flame size={14} /> Gamificação educacional
                        </span>
                        <h1 className={styles.heroTitle}>
                            Aprenda.
                            <span className={styles.mintText}>Conquiste.</span>
                            <span className={styles.goldText}>Evolua.</span>
                        </h1>
                        <p className={styles.heroText}>
                            O MenteUp transforma o estudo em uma jornada com XP, missões e conquistas — e dá aos
                            professores uma visão clara de cada turma.
                        </p>

                        <div className={styles.toggle} role="tablist" aria-label="Escolha seu perfil">
                            <button
                                type="button"
                                role="tab"
                                aria-selected={perfil === "estudante"}
                                className={`${styles.toggleOption} ${perfil === "estudante" ? styles.toggleActive : ""}`}
                                onClick={() => setPerfil("estudante")}
                            >
                                <GraduationCap size={16} /> Sou estudante
                            </button>
                            <button
                                type="button"
                                role="tab"
                                aria-selected={perfil === "professor"}
                                className={`${styles.toggleOption} ${perfil === "professor" ? styles.toggleActive : ""}`}
                                onClick={() => setPerfil("professor")}
                            >
                                <Users size={16} /> Sou professor
                            </button>
                        </div>

                        <div className={styles.heroActions}>
                            <button type="button" className={styles.primaryButton} onClick={cadastrar}>
                                Começar minha jornada <ChevronRight size={16} />
                            </button>
                            <button type="button" className={styles.outlineButton} onClick={entrar}>
                                Já tenho conta
                            </button>
                        </div>
                    </div>

                    <div className={styles.heroPanel} aria-hidden="true">
                        <div className={`${styles.glassCard} ${styles.levelCard}`}>
                            <div className={styles.levelTop}>
                                <div className={styles.ring}>
                                    <svg width="64" height="64" viewBox="0 0 64 64">
                                        <circle cx="32" cy="32" r="27" className={styles.ringTrack} />
                                        <circle
                                            cx="32"
                                            cy="32"
                                            r="27"
                                            className={styles.ringFill}
                                            strokeDasharray="169.6"
                                            strokeDashoffset="30.5"
                                            transform="rotate(-90 32 32)"
                                        />
                                    </svg>
                                    <span className={styles.ringCenter}>
                                        <b>Nv. 8</b>
                                        <small>82%</small>
                                    </span>
                                </div>
                                <div>
                                    <span className={styles.levelLabel}>Nível atual</span>
                                    <p className={styles.levelXp}>
                                        1.240 <span>/ 1.500 XP</span>
                                    </p>
                                </div>
                            </div>
                            <div className={styles.levelTrack}>
                                <div className={styles.levelFill} />
                            </div>
                        </div>

                        <div className={`${styles.glassCard} ${styles.miniCard} ${styles.streakCard}`}>
                            <span className={`${styles.miniIcon} ${styles.coral}`}>
                                <Flame size={18} />
                            </span>
                            <div>
                                <strong>12 dias</strong>
                                <small>de sequência de estudos</small>
                            </div>
                        </div>

                        <div className={`${styles.glassCard} ${styles.miniCard} ${styles.trophyCard}`}>
                            <span className={`${styles.miniIcon} ${styles.goldSolid}`}>
                                <Trophy size={18} />
                            </span>
                            <div>
                                <strong>Mestre do Quiz</strong>
                                <small>Nova conquista desbloqueada · +50 XP</small>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="recursos" className={`${styles.container} ${styles.section}`}>
                    <span className={`${styles.eyebrow} ${styles.center}`}>Recursos</span>
                    <h2 className={`${styles.sectionTitle} ${styles.center}`}>Feito para engajar de verdade</h2>
                    <p className={`${styles.sectionText} ${styles.center}`}>
                        Cada elemento transforma tarefas escolares em progresso visível.
                    </p>
                    <div className={styles.features}>
                        {RECURSOS.map((recurso) => (
                            <article key={recurso.titulo} className={`${styles.glassCard} ${styles.featureCard}`}>
                                <span className={`${styles.featureIcon} ${recurso.cor}`}>{recurso.icone}</span>
                                <h3>{recurso.titulo}</h3>
                                <p>{recurso.descricao}</p>
                            </article>
                        ))}
                    </div>
                </section>

                <section id="como-funciona" className={`${styles.container} ${styles.section}`}>
                    <span className={`${styles.eyebrow} ${styles.center}`}>Como funciona</span>
                    <h2 className={`${styles.sectionTitle} ${styles.center}`}>Três passos até sua primeira conquista</h2>
                    <div className={styles.steps}>
                        {PASSOS.map((passo) => (
                            <article key={passo.numero} className={`${styles.glassCard} ${styles.stepCard}`}>
                                <span className={styles.stepNumber}>{passo.numero}</span>
                                <h3>{passo.titulo}</h3>
                                <p>{passo.descricao}</p>
                            </article>
                        ))}
                    </div>
                </section>

                <section id="professores" className={`${styles.container} ${styles.section} ${styles.teacher}`}>
                    <div>
                        <span className={styles.eyebrow}>Para professores</span>
                        <h2 className={styles.sectionTitle}>Acompanhe o desempenho sem esforço</h2>
                        <p className={styles.sectionText}>
                            Crie atividades, veja quem precisa de apoio e acompanhe a evolução de cada turma em um
                            painel único.
                        </p>
                        <ul className={styles.checklist}>
                            {VANTAGENS_PROFESSOR.map((item) => (
                                <li key={item}>
                                    <span className={styles.check}>
                                        <Check size={12} />
                                    </span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <button type="button" className={styles.primaryButton} onClick={entrar}>
                            Acessar painel do professor <ChevronRight size={16} />
                        </button>
                    </div>

                    <div className={styles.teacherVisual} aria-hidden="true">
                        <div className={`${styles.glassCard} ${styles.statCard}`}>
                            <Users size={20} />
                            <strong>118</strong>
                            <small>estudantes ativos</small>
                        </div>
                        <div className={`${styles.glassCard} ${styles.statCard} ${styles.statMint}`}>
                            <Check size={20} />
                            <strong>86%</strong>
                            <small>taxa média de conclusão</small>
                        </div>
                        <div className={`${styles.glassCard} ${styles.chartCard}`}>
                            <span>Participação semanal · 8º B</span>
                            <div className={styles.bars}>
                                {PARTICIPACAO.map((valor, i) => (
                                    <div key={i} className={styles.bar} style={{ height: `${valor}%` }} />
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section className={styles.container}>
                    <div className={styles.cta}>
                        <h2>Pronto para começar sua jornada?</h2>
                        <p>Crie sua conta gratuita e dê o primeiro passo hoje mesmo.</p>
                        <button type="button" className={styles.ctaButton} onClick={cadastrar}>
                            Criar minha conta <ChevronRight size={16} />
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default Home;
