import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    BookOpen,
    Sparkles,
    Trophy,
} from "lucide-react";

import CampoSenha from "../components/CampoSenha";
import styles from "./login.module.css";
import { API_URL, lerErro } from "../services/api";
import { LogoMarca, LogoNome } from "../components/Logo";

function Login() {
    const navigate = useNavigate();

    // Vindo do cadastro: mostra o aviso de conta criada e já preenche o e-mail.
    // Não há escolha de perfil no login: o backend descobre se é aluno, professor ou admin pelo e-mail.
    const vindoDoCadastro = useLocation().state as
        | { contaCriada?: boolean; email?: string }
        | null;
    const [contaCriada, setContaCriada] = useState(vindoDoCadastro?.contaCriada === true);

    const [email, setEmail] = useState(vindoDoCadastro?.email ?? "");
    const [senha, setSenha] = useState("");
    const [erro, setErro] = useState("");

    const [carregando, setCarregando] = useState(false);
    // Senhas erradas seguidas para o mesmo e-mail nesta tela (o backend bloqueia na 3ª)
    const [falhas, setFalhas] = useState({ email: "", total: 0 });

    async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setErro("");
        setContaCriada(false);

        // Aceita o e-mail com espaços sobrando (copiado e colado, teclado do celular)
        const emailLimpo = email.trim();

        if (!emailLimpo || !senha) {
            setErro("Preencha todos os campos.");
            return;
        }

        setCarregando(true);

        try {
            const resposta = await fetch(
                `${API_URL}/usuarios/logar`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        usuario: emailLimpo,
                        senha: senha,
                    }),
                }
            );

             if (!resposta.ok) {
                // conta bloqueada depois de 3 senhas erradas
                if (resposta.status === 403) {
                    setErro((await lerErro(resposta, "Sua conta está bloqueada.")).mensagem);
                } else {
                    const total = falhas.email === emailLimpo ? falhas.total + 1 : 1;
                    setFalhas({ email: emailLimpo, total });
                    setErro(
                        total >= 2
                            ? "E-mail ou senha inválidos. Atenção: mais uma senha errada pode bloquear a conta. Se não lembrar, use “Esqueceu a senha?”."
                            : "E-mail ou senha inválidos. Após 3 tentativas erradas a conta é bloqueada."
                    );
                }
                return;
            }
            const dados = await resposta.json();


            if (!dados.token) {
                localStorage.removeItem("token");
                localStorage.removeItem("usuario");
                sessionStorage.setItem("email2FA", emailLimpo);
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
                        <span className={styles.brandTagline}>
                            Sua jornada de aprendizado
                        </span>
                    </span>
                </button>

                <main className={styles.main}>
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

                    <section className={styles.card} aria-labelledby="login-title">
                        <header className={styles.cardHeader}>
                            <span className={styles.eyebrow}>Acesso MenteUp</span>
                            <h2 id="login-title" className={styles.cardTitle}>
                                Que bom ter você de volta!
                            </h2>
                            <p className={styles.cardSubtitle}>
                                Entre com o seu e-mail e senha.
                            </p>
                        </header>


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

                            <CampoSenha
                                id="senha"
                                rotulo="Senha"
                                valor={senha}
                                aoMudar={setSenha}
                                autoComplete="current-password"
                                placeholder="Digite sua senha"
                            />

                            <button
                                type="button"
                                className={styles.forgot}
                                onClick={() => navigate("/esqueci-senha", { state: { email } })}
                            >
                                Esqueci minha senha
                            </button>

                            {contaCriada && !erro && (
                                <div className={styles.success} role="status">
                                    Conta criada com sucesso! Entre com o seu e-mail e a senha que você cadastrou.
                                </div>
                            )}

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
                                {carregando ? "Entrando..." : "Entrar"}
                            </button>
                        </form>

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
