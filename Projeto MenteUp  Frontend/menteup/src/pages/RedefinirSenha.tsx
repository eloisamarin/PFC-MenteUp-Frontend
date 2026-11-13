import { useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CircleCheck } from "lucide-react";

import CampoSenha from "../components/CampoSenha";
import { API_URL, lerErro } from "../services/api";
import { problemaSenha } from "../services/senha";
import styles from "./login.module.css";
import { LogoMarca, LogoNome } from "../components/Logo";

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
    const [erro, setErro] = useState("");
    const [linkInvalido, setLinkInvalido] = useState(token === "");
    const [concluido, setConcluido] = useState(false);
    const [carregando, setCarregando] = useState(false);

    async function salvar(evento: FormEvent) {
        evento.preventDefault();
        setErro("");

        const problema = problemaSenha(novaSenha);
        if (problema) {
            setErro(problema);
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
                <CampoSenha
                    id="nova-senha"
                    rotulo="Nova senha"
                    valor={novaSenha}
                    aoMudar={setNovaSenha}
                    autoComplete="new-password"
                    placeholder="Crie uma senha forte"
                    mostrarRequisitos
                />

                <CampoSenha
                    id="confirmar-senha"
                    rotulo="Confirme a nova senha"
                    valor={confirmacao}
                    aoMudar={setConfirmacao}
                    autoComplete="new-password"
                />

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
                    <LogoMarca tamanho={44} />
                    <span>
                        <LogoNome className={styles.brandName} />
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