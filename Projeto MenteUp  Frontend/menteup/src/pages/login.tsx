import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [erro, setErro] = useState("");

    // Novo Design
    const [perfil, setPerfil] = useState<Perfil>("ALUNO");
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [carregando, setCarregando] = useState(false);

    async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setErro("");

        if (!email || !senha) {
            setErro("Preencha todos os campos.");
            return;
        }

        setCarregando(true);

        try {
            const resposta = await fetch(
                "http://localhost:8080/usuarios/logar",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        usuario: email,
                        senha: senha,
                    }),
                }
            );

            if (!resposta.ok) {
                setErro("E-mail ou senha inválidos.");
                return;
            }
            const dados = await resposta.json();

            console.log("Login realizado:", dados);

            if (!dados.token) {
                localStorage.removeItem("token");
                localStorage.removeItem("usuario");
                sessionStorage.setItem("email2FA", email);
                navigate("/verificar-2fa");
                return;
            }

            sessionStorage.removeItem("email2FA");

            localStorage.setItem("token", dados.token);

            localStorage.setItem("usuario", JSON.stringify(dados));

            switch (dados.tipoUsuario) {
                case "ALUNO":
                    navigate("/aluno/dashboard");
                    break;

                case "PROFESSOR":
                    navigate("/professor/dashboard");
                    break;

                case "ADMINISTRADOR":
                    navigate("/administrador/dashboard");
                    break;

                default:
                    setErro("Tipo de usuário inválido.");
            }
        } catch (error) {
            console.error("Erro ao realizar login:", error);

            setErro("Não foi possível conectar ao servidor.");
        } finally {
            setCarregando(false);
        }
    }

    function handleCadastro() {
        navigate("/cadastro");
    }

    const textoBotao = perfil === "ALUNO" ? "Entrar como aluno" : "Entrar como professor";

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                {/* MARCA */}
                <button
                    type="button"
                    className={styles.brand}
                    onClick={() => navigate("/")}
                    aria-label="Voltar para a página inicial"
                >
                    <span className={styles.brandMark}>M</span>
                    <span>
                        <span className={styles.brandName}>MenteUp</span>
                        <span className={styles.brandTagline}>
                            Sua jornada de aprendizado
                        </span>
                    </span>
                </button>

                <main className={styles.main}>
                    {/* HERO */}
                    <section className={styles.hero}>
                        <span className={styles.pill}>
                            <Sparkles size={16} />
                            Aprenda. Evolua. Conquiste.
                        </span>

                        <h1 className={styles.heroTitle}>
                            Seu próximo nível
                            <br />
                            começa agora.
                        </h1>

                        <p className={styles.heroText}>
                            Entre na sua jornada, complete desafios e transforme
                            cada aula em uma nova conquista.
                        </p>

                        <div className={styles.features}>
                            <div className={styles.feature}>
                                <Trophy size={24} className={styles.iconTeal} />
                                <div>
                                    <span className={styles.featureTitle}>
                                        Missões diárias
                                    </span>
                                    <span className={styles.featureText}>
                                        Aprenda no seu ritmo
                                    </span>
                                </div>
                            </div>

                            <div className={styles.feature}>
                                <BookOpen size={24} className={styles.iconPurple} />
                                <div>
                                    <span className={styles.featureTitle}>
                                        Conteúdo que engaja
                                    </span>
                                    <span className={styles.featureText}>
                                        Ensino que evolui
                                    </span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* CARD DE LOGIN */}
                    <section className={styles.card} aria-labelledby="login-title">
                        <header className={styles.cardHeader}>
                            <span className={styles.eyebrow}>Acesso MenteUp</span>
                            <h2 id="login-title" className={styles.cardTitle}>
                                Que bom ter você de volta!
                            </h2>
                            <p className={styles.cardSubtitle}>
                                Escolha seu perfil para continuar.
                            </p>
                        </header>

                        {/* PERFIL */}
                        <div
                            className={styles.segmented}
                            role="radiogroup"
                            aria-label="Perfil de acesso"
                        >
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

                        {/* FORMULÁRIO */}
                        <form className={styles.form} onSubmit={handleLogin} noValidate>
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
                                        autoComplete="current-password"
                                        className={styles.input}
                                        placeholder="Mínimo de 8 caracteres"
                                        value={senha}
                                        onChange={(event) => setSenha(event.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className={styles.eyeButton}
                                        onClick={() => setMostrarSenha((v) => !v)}
                                        aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                                    >
                                        {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <button type="button" className={styles.forgot}>
                                Esqueci minha senha
                            </button>

                            {erro && (
                                <div className={styles.error} role="alert">
                                    {erro}
                                </div>
                            )}

                            <button
                                type="submit"
                                className={styles.primaryButton}
                                disabled={carregando}
                            >
                                {carregando ? "Entrando..." : textoBotao}
                            </button>
                        </form>

                        <div className={styles.divider}>ou continue com</div>

                        <button type="button" className={styles.secondaryButton}>
                            <span className={styles.googleG}>G</span>
                            Google
                        </button>

                        <p className={styles.footer}>
                            Ainda não tem conta?{" "}
                            <button
                                type="button"
                                className={styles.link}
                                onClick={handleCadastro}
                            >
                                Cadastre-se
                            </button>
                        </p>
                    </section>
                </main>
            </div>
        </div>
    );
}

export default Login;
