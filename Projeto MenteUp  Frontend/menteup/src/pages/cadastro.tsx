import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    BookOpen,
    Eye,
    EyeOff,
    GraduationCap,
    Sparkles,
    Trophy,
    User,
} from "lucide-react";

import styles from "./login.module.css";

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
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState("");

    async function handleCadastro(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setErro("");

        if (!nome.trim() || !email.trim() || !senha || !confirmarSenha) {
            setErro("Preencha todos os campos.");
            return;
        }

        if (senha.length < 8) {
            setErro("A senha deve ter no mínimo 8 caracteres.");
            return;
        }

        if (senha !== confirmarSenha) {
            setErro("As senhas não coincidem.");
            return;
        }

        setCarregando(true);

        try {
            const resposta = await fetch("http://localhost:8080/usuarios/cadastrar", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    nomeUsuario: nome.trim(),
                    usuario: email.trim(),
                    senha,
                    tipoUsuario: perfil,
                }),
            });

            if (resposta.status === 400) {
                setErro("Este e-mail já está cadastrado.");
                return;
            }

            if (!resposta.ok) {
                setErro("Não foi possível criar a conta.");
                return;
            }

            sessionStorage.setItem("email2FA", email.trim());
            navigate("/verificar-2fa");
        } catch (error) {
            console.error("Erro ao cadastrar:", error);
            setErro("Não foi possível conectar ao servidor.");
        } finally {
            setCarregando(false);
        }
    }

    const textoBotao = perfil === "ALUNO" ? "Criar conta de aluno" : "Criar conta de professor";
    const iconeSenha = mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />;
    const rotuloSenha = mostrarSenha ? "Ocultar senha" : "Mostrar senha";

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <button
                    type="button"
                    className={styles.brand}
                    onClick={() => navigate("/")}
                    aria-label="Voltar para a página inicial"
                >
                    <span className={styles.brandMark}>M</span>
                    <span>
                        <span className={styles.brandName}>MenteUp</span>
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

                            <div className={styles.field}>
                                <label htmlFor="senha" className={styles.label}>
                                    Senha
                                </label>
                                <div className={styles.inputWrap}>
                                    <input
                                        type={mostrarSenha ? "text" : "password"}
                                        id="senha"
                                        autoComplete="new-password"
                                        className={styles.input}
                                        placeholder="Mínimo de 8 caracteres"
                                        value={senha}
                                        onChange={(event) => setSenha(event.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className={styles.eyeButton}
                                        onClick={() => setMostrarSenha((v) => !v)}
                                        aria-label={rotuloSenha}
                                    >
                                        {iconeSenha}
                                    </button>
                                </div>
                            </div>

                            <div className={styles.field}>
                                <label htmlFor="confirmarSenha" className={styles.label}>
                                    Confirmar senha
                                </label>
                                <div className={styles.inputWrap}>
                                    <input
                                        type={mostrarSenha ? "text" : "password"}
                                        id="confirmarSenha"
                                        autoComplete="new-password"
                                        className={styles.input}
                                        placeholder="Digite a senha novamente"
                                        value={confirmarSenha}
                                        onChange={(event) => setConfirmarSenha(event.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className={styles.eyeButton}
                                        onClick={() => setMostrarSenha((v) => !v)}
                                        aria-label={rotuloSenha}
                                    >
                                        {iconeSenha}
                                    </button>
                                </div>
                            </div>

                            {erro && (
                                <div className={styles.error} role="alert">
                                    {erro}
                                </div>
                            )}

                            <button type="submit" className={styles.primaryButton} disabled={carregando}>
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
