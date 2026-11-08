import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MailCheck } from "lucide-react";

import { API_URL, lerErro } from "../services/api";
import styles from "./login.module.css";

/*
 * Esqueci minha senha: pede o e-mail e o back-end envia um link que vale 30 minutos.
 * A resposta é sempre a mesma, exista o e-mail ou não, para não revelar quem tem conta.
 */
function EsqueciSenha() {
    const navigate = useNavigate();
    const location = useLocation();

    // A tela de login manda o e-mail digitado, para a pessoa não digitar de novo
    const emailDoLogin = (location.state as { email?: string } | null)?.email ?? "";

    const [email, setEmail] = useState(emailDoLogin);
    const [enviado, setEnviado] = useState(false);
    const [erro, setErro] = useState("");
    const [carregando, setCarregando] = useState(false);

    async function enviar(evento: FormEvent) {
        evento.preventDefault();
        setErro("");

        if (!email) {
            setErro("Informe o seu e-mail.");
            return;
        }

        setCarregando(true);

        try {
            const resposta = await fetch(`${API_URL}/usuarios/senha/esqueci`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (!resposta.ok) {
                setErro((await lerErro(resposta, "Não foi possível enviar o link.")).mensagem);
                return;
            }

            setEnviado(true);
        } catch {
            setErro("Não foi possível conectar ao servidor.");
        } finally {
            setCarregando(false);
        }
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
                    <span className={styles.brandMark}>M</span>
                    <span>
                        <span className={styles.brandName}>MenteUp</span>
                        <span className={styles.brandTagline}>Sua jornada de aprendizado</span>
                    </span>
                </button>

                <main className={styles.main} style={{ justifyContent: "center" }}>
                    <section className={styles.card} aria-labelledby="esqueci-titulo">
                        <header className={styles.cardHeader}>
                            <span className={styles.eyebrow}>Recuperar acesso</span>
                            <h2 id="esqueci-titulo" className={styles.cardTitle}>
                                {enviado ? "Confira seu e-mail" : "Esqueceu a senha?"}
                            </h2>
                            <p className={styles.cardSubtitle}>
                                {enviado
                                    ? "Se o e-mail estiver cadastrado, você vai receber um link para criar uma nova senha. O link vale por 30 minutos. Confira também a caixa de spam."
                                    : "Digite o e-mail da sua conta. Vamos enviar um link para você criar uma nova senha."}
                            </p>
                        </header>

                        {enviado ? (
                            <MailCheck size={48} style={{ alignSelf: "center", color: "var(--mu-teal)" }} />
                        ) : (
                            <form className={styles.form} onSubmit={enviar} noValidate>
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
                                        onChange={(evento) => setEmail(evento.target.value)}
                                    />
                                </div>

                                {erro && (
                                    <div className={styles.error} role="alert">
                                        {erro}
                                    </div>
                                )}

                                <button type="submit" className={styles.primaryButton} disabled={carregando}>
                                    {carregando ? "Enviando..." : "Enviar link"}
                                </button>
                            </form>
                        )}

                        <p className={styles.footer}>
                            Lembrou a senha?{" "}
                            <button type="button" className={styles.link} onClick={() => navigate("/login")}>
                                Voltar para o login
                            </button>
                        </p>
                    </section>
                </main>
            </div>
        </div>
    );
}

export default EsqueciSenha;