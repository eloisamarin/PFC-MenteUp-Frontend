import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    BookOpen,
    CircleCheck,
    FileText,
    GraduationCap,
    Sparkles,
    Trophy,
    User,
} from "lucide-react";

import CampoSenha from "../components/CampoSenha";
import { API_URL, lerErro } from "../services/api";
import { problemaSenha } from "../services/senha";
import styles from "./login.module.css";
import { LogoMarca, LogoNome } from "../components/Logo";

type Perfil = "ALUNO" | "PROFESSOR";

function Cadastro() {
    const navigate = useNavigate();
    const location = useLocation();
    const perfilInicial: Perfil =
        (location.state as { perfil?: string } | null)?.perfil === "professor" ? "PROFESSOR" : "ALUNO";

    const [perfil, setPerfil] = useState<Perfil>(perfilInicial);
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState("");

    // O "Li e aceito" só é liberado depois que a pessoa abre os dois documentos
    const [abriuTermo, setAbriuTermo] = useState(false);
    const [abriuPolitica, setAbriuPolitica] = useState(false);
    const leuDocumentos = abriuTermo && abriuPolitica;
    const [aceitou, setAceitou] = useState(false);

    async function handleCadastro(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setErro("");

        if (!nome.trim() || !email.trim() || !senha || !confirmarSenha) {
            setErro("Preencha todos os campos.");
            return;
        }

        const problema = problemaSenha(senha);
        if (problema) {
            setErro(problema);
            return;
        }

        if (senha !== confirmarSenha) {
            setErro("As senhas não coincidem.");
            return;
        }

        if (!leuDocumentos) {
            setErro("Abra e leia o Termo de Aceite e a Política de Privacidade antes de aceitar.");
            return;
        }

        if (!aceitou) {
            setErro("Para criar a conta, leia e aceite o Termo de Aceite e a Política de Privacidade.");
            return;
        }

        setCarregando(true);

        try {
            const resposta = await fetch(`${API_URL}/usuarios/cadastrar`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    nomeUsuario: nome.trim(),
                    usuario: email.trim(),
                    senha,
                    tipoUsuario: perfil,
                    aceitouTermos: aceitou,
                }),
            });

            if (!resposta.ok) {
                const falha = await lerErro(resposta, "Não foi possível criar a conta.");

                // Sem corpo de erro, o 400 do cadastro é o e-mail repetido
                if (resposta.status === 400 && falha.codigo === "ERRO-DESCONHECIDO") {
                    setErro("Este e-mail já está cadastrado.");
                } else {
                    setErro(falha.mensagem);
                }
                return;
            }

            // O cadastro não envia código: a pessoa entra pelo login (o código de 2 etapas chega ali)
            navigate("/login", { state: { contaCriada: true, email: email.trim() } });
        } catch (error) {
            console.error("Erro ao cadastrar:", error);
            setErro("Não foi possível conectar ao servidor.");
        } finally {
            setCarregando(false);
        }
    }

    const textoBotao = perfil === "ALUNO" ? "Criar conta de aluno" : "Criar conta de professor";

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <button
                    type="button"
                    className={styles.brand}
                    onClick={() => navigate("/")}
                    aria-label="Voltar para a página inicial"
                >
                    <LogoMarca tamanho={44} />
                    <span>
                        <LogoNome className={styles.brandName} />
                        <span className={styles.brandTagline}>Sua jornada de aprendizado</span>
                    </span>
                </button>

                <main className={styles.main}>
                    <section className={styles.hero}>
                        <span className={styles.pill}>
                            <Sparkles size={16} />
                            Aprenda. Evolua. Conquiste.
                        </span>

                        <h1 className={styles.heroTitle}>
                            Sua jornada
                            <br />
                            começa aqui.
                        </h1>

                        <p className={styles.heroText}>
                            Crie sua conta, complete missões e transforme cada aula em uma nova conquista.
                        </p>

                        <div className={styles.features}>
                            <div className={styles.feature}>
                                <Trophy size={24} className={styles.iconTeal} />
                                <div>
                                    <span className={styles.featureTitle}>Missões diárias</span>
                                    <span className={styles.featureText}>Aprenda no seu ritmo</span>
                                </div>
                            </div>

                            <div className={styles.feature}>
                                <BookOpen size={24} className={styles.iconPurple} />
                                <div>
                                    <span className={styles.featureTitle}>Conteúdo que engaja</span>
                                    <span className={styles.featureText}>Ensino que evolui</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className={styles.card} aria-labelledby="cadastro-title">
                        <header className={styles.cardHeader}>
                            <span className={styles.eyebrow}>Cadastro MenteUp</span>
                            <h2 id="cadastro-title" className={styles.cardTitle}>
                                Crie sua conta
                            </h2>
                            <p className={styles.cardSubtitle}>Escolha seu perfil para começar.</p>
                        </header>

                        <div className={styles.segmented} role="radiogroup" aria-label="Perfil da conta">
                            <button
                                type="button"
                                role="radio"
                                aria-checked={perfil === "ALUNO"}
                                className={`${styles.segment} ${perfil === "ALUNO" ? styles.segmentActive : ""}`}
                                onClick={() => setPerfil("ALUNO")}
                            >
                                <User size={16} />
                                Sou aluno
                            </button>

                            <button
                                type="button"
                                role="radio"
                                aria-checked={perfil === "PROFESSOR"}
                                className={`${styles.segment} ${perfil === "PROFESSOR" ? styles.segmentActive : ""}`}
                                onClick={() => setPerfil("PROFESSOR")}
                            >
                                <GraduationCap size={16} />
                                Sou professor
                            </button>
                        </div>

                        <form className={styles.form} onSubmit={handleCadastro} noValidate>
                            <div className={styles.field}>
                                <label htmlFor="nome" className={styles.label}>
                                    Nome completo
                                </label>
                                <input
                                    type="text"
                                    id="nome"
                                    autoComplete="name"
                                    className={styles.input}
                                    placeholder="Digite seu nome completo"
                                    value={nome}
                                    onChange={(event) => setNome(event.target.value)}
                                />
                            </div>

                            <div className={styles.field}>
                                <label htmlFor="email" className={styles.label}>
                                    E-mail
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    autoComplete="email"
                                    className={styles.input}
                                    placeholder="voce@exemplo.com"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                />
                            </div>

                            <CampoSenha
                                id="senha"
                                rotulo="Senha"
                                valor={senha}
                                aoMudar={setSenha}
                                autoComplete="new-password"
                                placeholder="Crie uma senha forte"
                                mostrarRequisitos
                            />

                            <CampoSenha
                                id="confirmarSenha"
                                rotulo="Confirmar senha"
                                valor={confirmarSenha}
                                aoMudar={setConfirmarSenha}
                                autoComplete="new-password"
                                placeholder="Digite a senha novamente"
                            />

                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                <span style={{ fontSize: 13, lineHeight: "18px" }}>
                                    Antes de aceitar, abra e leia os dois documentos:
                                </span>
                                <a
                                    href="/termo-de-aceite"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.link}
                                    onClick={() => setAbriuTermo(true)}
                                    onAuxClick={() => setAbriuTermo(true)}
                                    style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14 }}
                                >
                                    {abriuTermo ? <CircleCheck size={16} /> : <FileText size={16} />}
                                    Termo de Aceite {abriuTermo && "(aberto)"}
                                </a>
                                <a
                                    href="/politica-privacidade"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.link}
                                    onClick={() => setAbriuPolitica(true)}
                                    onAuxClick={() => setAbriuPolitica(true)}
                                    style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14 }}
                                >
                                    {abriuPolitica ? <CircleCheck size={16} /> : <FileText size={16} />}
                                    Política de Privacidade {abriuPolitica && "(aberta)"}
                                </a>
                            </div>

                            <label
                                title={leuDocumentos ? undefined : "Abra o Termo de Aceite e a Política de Privacidade para liberar"}
                                style={{
                                    display: "flex",
                                    gap: 10,
                                    alignItems: "flex-start",
                                    fontSize: 14,
                                    lineHeight: "20px",
                                    cursor: leuDocumentos ? "pointer" : "not-allowed",
                                    opacity: leuDocumentos ? 1 : 0.55,
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={aceitou}
                                    disabled={!leuDocumentos}
                                    onChange={(event) => setAceitou(event.target.checked)}
                                    style={{ marginTop: 3, width: 18, height: 18, accentColor: "var(--mu-teal)" }}
                                />
                                <span>
                                    Li e aceito o Termo de Aceite e a Política de Privacidade do MenteUp.
                                    {!leuDocumentos && (
                                        <span style={{ display: "block", fontSize: 12 }}>
                                            Disponível depois de abrir os dois documentos acima.
                                        </span>
                                    )}
                                </span>
                            </label>

                            {erro && (
                                <div className={styles.error} role="alert">
                                    {erro}
                                </div>
                            )}

                            <button type="submit" className={styles.primaryButton} disabled={carregando || !aceitou}>
                                {carregando ? "Criando conta..." : textoBotao}
                            </button>
                        </form>

                        <p className={styles.footer}>
                            Já possui uma conta?{" "}
                            <button type="button" className={styles.link} onClick={() => navigate("/login")}>
                                Entrar
                            </button>
                        </p>
                    </section>
                </main>
            </div>
        </div>
    );
}

export default Cadastro;
