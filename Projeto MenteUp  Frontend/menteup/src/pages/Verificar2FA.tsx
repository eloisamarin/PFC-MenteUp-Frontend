import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { validar2FA } from "../services/authService";
import { registrarTokenFCM } from "../firebase/fcmService";

function Verificar2FA() {
    const navigate = useNavigate();

    const [codigo, setCodigo] = useState("");
    const [erro, setErro] = useState("");
    const [carregando, setCarregando] = useState(false);

    const email = sessionStorage.getItem("email2FA");

    async function handleValidar(e: FormEvent) {
        e.preventDefault();

        setErro("");

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
        } finally {
            setCarregando(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950">

            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">

                <div className="text-center">

                    <h1 className="text-2xl font-bold">
                        Verificação de segurança
                    </h1>

                    <p className="mt-3 text-gray-600">
                        Digite o código de 6 dígitos enviado para seu e-mail.
                    </p>

                    {email && (
                        <p className="mt-2 text-sm text-gray-500">
                            Código enviado para: {email}
                        </p>
                    )}

                </div>

                <form
                    onSubmit={handleValidar}
                    className="mt-6"
                >

                    <input
                        type="text"
                        maxLength={6}
                        inputMode="numeric"
                        placeholder="000000"
                        value={codigo}
                        onChange={(e) =>
                            setCodigo(
                                e.target.value.replace(/\D/g, "")
                            )
                        }
                        className="w-full rounded-xl border p-4 text-center text-2xl tracking-[0.5em]"
                    />

                    {erro && (
                        <p className="mt-3 text-center text-red-500">
                            {erro}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={
                            codigo.length !== 6 ||
                            carregando
                        }
                        className="mt-5 w-full rounded-xl bg-purple-600 p-3 text-white disabled:opacity-50"
                    >
                        {carregando
                            ? "Verificando..."
                            : "Verificar código"}
                    </button>

                </form>

                <p className="mt-5 text-center text-sm text-gray-500">
                    O código é válido por 5 minutos.
                </p>

            </div>

        </div>
    );
}

export default Verificar2FA;