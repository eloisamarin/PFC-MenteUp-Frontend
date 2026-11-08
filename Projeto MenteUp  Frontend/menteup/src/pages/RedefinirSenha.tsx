import { useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CircleCheck, Eye, EyeOff } from "lucide-react";

import { API_URL, lerErro } from "../services/api";
import styles from "./login.module.css";

/*
 * Aberta pelo link do e-mail (/redefinir-senha?token=...).
 * Cria a nova senha e desbloqueia a conta, se ela estava bloqueada.
 */
function RedefinirSenha() {
    const navigate = useNavigate();
    const [parametros] = useSearchParams();
    const token = parametros.get("token") ?? "";

    const [novaSenha, setNovaSenha] = useState("");
    const [confirmacao, setConfirmacao] = useState("");
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [erro, setErro] = useState("");
    const [linkInvalido, setLinkInvalido] = useState(token === "");
    const [concluido, setConcluido] = useState(false);
    const [carregando, setCarregando] = useState(false);

    async function salvar(evento: FormEvent) {
        evento.preventDefault();
        setErro("");

        if (novaSenha.length < 8) {
            setErro("A nova senha deve ter no mínimo 8 caracteres.");
            return;
        }

        if (novaSenha !== confirmacao) {
            setErro("As senhas não conferem.");
            return;
        }

        setCarregando(true);

        try {
            const resposta = await fetch(`${API_URL}/usuarios/senha/redefinir`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, novaSenha }),
            });

            if (!resposta.ok) {
                const falha = await lerErro(resposta, "Não foi possível redefinir a senha.");

                if (falha.codigo === "LINK_INVALIDO") {
                    setLinkInvalido(true);
                } else {
                    setErro(falha.mensagem);
                }
                return;
            }

            setConcluido(true);
        } catch {
            setErro("Não foi possível conectar ao servidor.");
        } finally {
            setCarregando(false);
        }
    }

    function conteudo() {
        if (concluido) {
            return (
                <>
                    <CircleCheck size={48} style={{ alignSelf: "center", color: "var(--mu-teal)" }} />
                    <button type="button" className={styles.primaryButton} onClick={() => navigate("/login")}>
                        Ir para o login
                    </button>
                </>
            );
        }

        if (linkInvalido) {
            return (
                <button type="button" className={styles.primaryButton} onClick={() => navigate("/esqueci-senha")}>
                    Pedir um novo link
                </button>
            );
        }

        return (
            <form className={styles.form} onSubmit={salvar} noValidate>
                <div className={styles.field}>
                    <label htmlFor="nova-senha" className={styles.label}>
                        Nova senha
                    </label>
                    <div className={styles.inputWrap}>
                        <input
                            type={mostrarSenha ? "text" : "password"}
                            id="nova-senha"
                            autoComplete="new-password"
                            className={styles.input}
                            placeholder="Mínimo de 8 caracteres"
                            value={novaSenha}
                            onChange={(evento) => setNovaSenha(evento.target.value)}
                        />
                        <button
                            type="button"
                            className={styles.eyeButton}
                            onClick={() => setMostrarSenha((valor) => !valor)}
                            aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                        >
                            {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>

                <div className={styles.field}>
                    <label htmlFor="confirmar-senha" className={styles.label}>
                        Confirme a nova senha
                    </label>
                    <input
                        type={mostrarSenha ? "text" : "password"}
                        id="confirmar-senha"
                        autoComplete="new-password"
                        className={styles.input}
                        value={confirmacao}
                        onChange={(evento) => setConfirmacao(evento.target.value)}
                    />
                </div>

                {erro && (
                    <div className={styles.error} role="alert">
                        {erro}
                    </div>
                )}

                <button type="submit" className={styles.primaryButton} disabled={carregando}>
                    {carregando ? "Salvando..." : "Salvar nova senha"}
                </button>
            </form>
        );
    }

    const titulo = concluido ? "Senha alterada!" : linkInvalido ? "Link inválido" : "Crie uma nova senha";
    const subtitulo = concluido
        ? "Pronto! Agora é só entrar com a nova senha."
        : linkInvalido
            ? "Este link expirou ou já foi usado. Peça um novo: ele vale por 30 minutos."
            : "Escolha uma senha que você não usa em outros sites.";

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
                    <section className={styles.card} aria-labelledby="redefinir-titulo">
                        <header className={styles.cardHeader}>
                            <span className={styles.eyebrow}>Recuperar acesso</span>
                            <h2 id="redefinir-titulo" className={styles.cardTitle}>
                                {titulo}
                            </h2>
                            <p className={styles.cardSubtitle}>{subtitulo}</p>
                        </header>

                        {conteudo()}
                    </section>
                </main>
            </div>
        </div>
    );
}

export default RedefinirSenha;