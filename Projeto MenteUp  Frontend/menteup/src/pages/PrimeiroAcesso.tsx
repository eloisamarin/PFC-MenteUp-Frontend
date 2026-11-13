import { useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CircleCheck, FileText } from "lucide-react";

import CampoSenha from "../components/CampoSenha";
import { API_URL, lerErro } from "../services/api";
import { problemaSenha } from "../services/senha";
import styles from "./login.module.css";
import { LogoMarca, LogoNome } from "../components/Logo";

/*
 * Aberta pelo convite do e-mail (/primeiro-acesso?token=...), para quem foi cadastrado
 * pelo administrador: aceita o Termo de Aceite e a Política de Privacidade e cria a senha.
 */
function PrimeiroAcesso() {
    const navigate = useNavigate();
    const [parametros] = useSearchParams();
    const token = parametros.get("token") ?? "";

    // O "Li e aceito" só é liberado depois que a pessoa abre os dois documentos
    const [abriuTermo, setAbriuTermo] = useState(false);
    const [abriuPolitica, setAbriuPolitica] = useState(false);
    const leuDocumentos = abriuTermo && abriuPolitica;
    const [aceitou, setAceitou] = useState(false);
    const [novaSenha, setNovaSenha] = useState("");
    const [confirmacao, setConfirmacao] = useState("");
    const [erro, setErro] = useState("");
    const [linkInvalido, setLinkInvalido] = useState(token === "");
    const [concluido, setConcluido] = useState(false);
    const [carregando, setCarregando] = useState(false);

    async function salvar(evento: FormEvent) {
        evento.preventDefault();
        setErro("");

        if (!leuDocumentos) {
            setErro("Abra e leia o Termo de Aceite e a Política de Privacidade antes de aceitar.");
            return;
        }
        if (!aceitou) {
            setErro("Para usar o MenteUp, leia e aceite o Termo de Aceite e a Política de Privacidade.");
            return;
        }
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
            const resposta = await fetch(`${API_URL}/usuarios/senha/primeiro-acesso`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, novaSenha, aceitouTermos: aceitou }),
            });

            if (!resposta.ok) {
                const falha = await lerErro(resposta, "Não foi possível concluir o primeiro acesso.");

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
                        onChange={(evento) => setAceitou(evento.target.checked)}
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

                <CampoSenha
                    id="nova-senha"
                    rotulo="Crie sua senha"
                    valor={novaSenha}
                    aoMudar={setNovaSenha}
                    autoComplete="new-password"
                    placeholder="Crie uma senha forte"
                    mostrarRequisitos
                />

                <CampoSenha
                    id="confirmar-senha"
                    rotulo="Confirme a senha"
                    valor={confirmacao}
                    aoMudar={setConfirmacao}
                    autoComplete="new-password"
                />

                {erro && (
                    <div className={styles.error} role="alert">
                        {erro}
                    </div>
                )}

                <button type="submit" className={styles.primaryButton} disabled={carregando || !aceitou}>
                    {carregando ? "Salvando..." : "Aceitar e criar senha"}
                </button>
            </form>
        );
    }

    const titulo = concluido ? "Tudo pronto!" : linkInvalido ? "Link inválido" : "Bem-vindo(a) ao MenteUp";
    const subtitulo = concluido
        ? "Sua senha foi criada. Agora é só entrar com o seu e-mail e a nova senha."
        : linkInvalido
            ? "Este convite expirou ou já foi usado. Peça um novo pelo \"Esqueci minha senha\": o link chega no seu e-mail."
            : "Um administrador criou a sua conta. Para começar, aceite os termos e crie a sua senha.";

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
                    <section className={styles.card} aria-labelledby="primeiro-acesso-titulo">
                        <header className={styles.cardHeader}>
                            <span className={styles.eyebrow}>Primeiro acesso</span>
                            <h2 id="primeiro-acesso-titulo" className={styles.cardTitle}>
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

export default PrimeiroAcesso;
