import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { ErroAutenticacao, reenviar2FA, validar2FA } from "../services/authService";
import styles from "./login.module.css";

// Mesma espera do backend entre um envio e outro
const ESPERA_REENVIO_SEGUNDOS = 60;
// Situações em que um novo código não resolve: a pessoa precisa entrar com a senha de novo
const PRECISA_LOGIN = ["SEM_LOGIN_RECENTE", "LIMITE_REENVIO_2FA"];
import { registrarTokenFCM } from "../firebase/fcmService";
import { LogoMarca, LogoNome } from "../components/Logo";

function Verificar2FA() {
    const navigate = useNavigate();

    const [codigo, setCodigo] = useState("");
    const [erro, setErro] = useState("");
    const [carregando, setCarregando] = useState(false);

    // "Reenviar código": contagem regressiva desde o último envio
    const [espera, setEspera] = useState(ESPERA_REENVIO_SEGUNDOS);
    const [reenviando, setReenviando] = useState(false);
    const [aviso, setAviso] = useState("");
    const [precisaLogin, setPrecisaLogin] = useState(false);

    const email = sessionStorage.getItem("email2FA");

    useEffect(() => {
        if (espera <= 0) return;
        const timer = setTimeout(() => setEspera((s) => s - 1), 1000);
        return () => clearTimeout(timer);
    }, [espera]);

    async function handleReenviar() {
        if (!email) return;

        setErro("");
        setAviso("");
        setReenviando(true);

        try {
            await reenviar2FA(email);
            setCodigo("");
            setAviso("Enviamos um novo código para o seu e-mail. O anterior não vale mais.");
            setEspera(ESPERA_REENVIO_SEGUNDOS);
        } catch (error: unknown) {
            if (error instanceof ErroAutenticacao) {
                setErro(error.message);
                if (PRECISA_LOGIN.includes(error.codigo)) setPrecisaLogin(true);
                // O backend diz quantos segundos faltam: recomeça a contagem
                const segundos = Number(error.message.match(/(\d+) segundos/)?.[1]);
                if (error.codigo === "AGUARDE_REENVIO_2FA" && segundos > 0) setEspera(segundos);
            } else {
                setErro("Não foi possível reenviar o código.");
            }
        } finally {
            setReenviando(false);
        }
    }

    // Aceita o código colado com espaços, hífen ou texto: fica só com os 6 primeiros dígitos
    function alterarCodigo(valor: string) {
        const limpo = valor.replace(/\D/g, "").slice(0, 6);
        setCodigo(limpo);
        // Ao completar os 6 dígitos, envia sozinho
        if (limpo.length === 6 && !carregando) {
            validar(limpo);
        }
    }

    async function handleValidar(e: FormEvent) {
        e.preventDefault();
        await validar(codigo);
    }

    async function validar(codigo: string) {
        setErro("");
        setAviso("");

        if (!email) {
            setErro("Sessão de verificação não encontrada. Faça login novamente.");
            return;
        }

        if (codigo.length !== 6) {
            setErro("Digite o código de 6 dígitos.");
            return;
        }

        setCarregando(true);

        try {
            const resposta = await validar2FA(email, codigo);

            localStorage.setItem("token", resposta.token);

            localStorage.setItem(
                "usuario",
                JSON.stringify(resposta)
            );
            await registrarTokenFCM();

            sessionStorage.removeItem("email2FA");

            switch (resposta.tipoUsuario) {
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
                    localStorage.removeItem("token");
                    localStorage.removeItem("usuario");
                    setErro("Tipo de usuário inválido.");
            }

        } catch (error: unknown) {
            setErro(
                error instanceof Error
                    ? error.message
                    : "Código inválido ou expirado."
            );
            // Depois de 5 erros o código deixa de valer: limpa o campo para digitar o novo
            if (error instanceof ErroAutenticacao && error.codigo === "CODIGO_2FA_BLOQUEADO") {
                setCodigo("");
            }
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
                    <LogoMarca tamanho={44} />
                    <span>
                        <LogoNome className={styles.brandName} />
                        <span className={styles.brandTagline}>Sua jornada de aprendizado</span>
                    </span>
                </button>

                <main className={`${styles.main} ${styles.mainCentered}`}>
                    <section className={styles.card} aria-labelledby="titulo-2fa">
                        <header className={styles.cardHeader}>
                            <span className={styles.eyebrow}>
                                <ShieldCheck size={14} aria-hidden /> Verificação de segurança
                            </span>
                            <h2 id="titulo-2fa" className={styles.cardTitle}>
                                Digite o código
                            </h2>
                            <p className={styles.cardSubtitle}>
                                Enviamos 6 dígitos para {email ? <strong>{email}</strong> : "o seu e-mail"}. O código vale 5 minutos.
                            </p>
                        </header>

                        <form className={styles.form} onSubmit={handleValidar} noValidate>
                            <div className={styles.field}>
                                <label htmlFor="codigo2fa" className={styles.label}>
                                    Código de verificação
                                </label>
                                <input
                                    id="codigo2fa"
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    autoFocus
                                    placeholder="000000"
                                    value={codigo}
                                    onChange={(e) => alterarCodigo(e.target.value)}
                                    aria-invalid={erro ? true : undefined}
                                    aria-describedby={erro ? "erro-2fa" : undefined}
                                    className={`${styles.input} ${styles.codeInput}`}
                                />
                            </div>

                            {erro && (
                                <div id="erro-2fa" className={styles.error} role="alert">
                                    {erro}
                                </div>
                            )}

                            {aviso && (
                                <div className={styles.success} role="status">
                                    {aviso}
                                </div>
                            )}

                            <button
                                type="submit"
                                className={styles.primaryButton}
                                disabled={codigo.length !== 6 || carregando}
                            >
                                {carregando ? "Verificando..." : "Verificar código"}
                            </button>
                        </form>

                        <p className={styles.footer}>
                            {precisaLogin ? (
                                <button type="button" className={styles.link} onClick={() => navigate("/login")}>
                                    Voltar para o login
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className={styles.link}
                                    onClick={handleReenviar}
                                    disabled={!email || espera > 0 || reenviando}
                                >
                                    {reenviando
                                        ? "Enviando..."
                                        : espera > 0
                                            ? `Não recebeu? Reenviar código em ${espera}s`
                                            : "Não recebeu? Reenviar código"}
                                </button>
                            )}
                        </p>
                    </section>
                </main>
            </div>
        </div>
    );
}

export default Verificar2FA;
