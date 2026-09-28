import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import {apiFetch, lerErro} from "../../services/api.ts";
import {BookOpen, CheckCircle, Users} from "lucide-react";

interface Turma {
    id: number;
    nome: string;
}

function TurmasAluno() {
    const navigate = useNavigate();

    const [turmas, setTurmas] = useState<Turma[]>([]);
    const [minhasIds, setMinhaIds] = useState<number[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [processando, setProcessando] = useState<number | null>(null);
    const [erro, setErro] = useState("");

    useEffect(() => {
        async function carregar() {
            try {
                const [respostaTurmas, respostaMinhas] = await Promise.all([
                    apiFetch("/turma/all"),
                    apiFetch("/alunos/me/turmas"),
                ]);
                if (!respostaTurmas.ok || !respostaMinhas.ok) {
                    throw new Error("Falha ao consultar as turmas.");
                }

                const todas: Turma[] = await respostaTurmas.json();
                const minhas: Turma[] = await respostaMinhas.json();

                setTurmas(todas);
                setMinhaIds(minhas.map((turma) => turma.id));
            } catch (error) {
                console.error("Erro ao buscar as turmas:", error);
                setErro("Não foi possivel carregar as turmas.");
            } finally {
                setCarregando(false);
            }
        }

        carregar();
    }, []);

    async function alterarMatricula(turma: Turma) {
        const matriculado = minhasIds.includes(turma.id);

        try {
            setProcessando(turma.id);
            setErro("");

            const resposta = await apiFetch(
                `/alunos/me/turma/${turma.id}`,
                {method: matriculado ? "DELETE" : "POST"}
            );
            if (!resposta.ok) {
                const erroApi = await lerErro(resposta, "Não foi possivel atualizar a matricula.");
                setErro(erroApi.mensagem);
                return;
            }
            setMinhaIds((atuais) =>
                matriculado
                    ? atuais.filter((id) => id !== turma.id)
                    : [...atuais, turma.id]);
        } catch (error) {
            console.error("Erro ao atualizar matricula:", error);
            setErro("Não foi possivel atualizar a matricula.");
        } finally {
            setProcessando(null);
        }
    }
    return (
        <div className="min-h-screen bg-[#f5f6fb] flex">

            {/* SIDEBAR */}
            <aside className="w-64 bg-[#111127] text-white fixed left-0 top-0 bottom-0">

                <div className="h-20 flex items-center px-6 border-b border-white/10">

                    <div className="w-8 h-8 rounded-lg bg-[#5b4cff] flex items-center justify-center font-bold mr-3">
                        M
                    </div>

                    <span className="text-lg font-bold">
                        Mente<span className="text-[#7c6cff]">Up</span>
                    </span>

                </div>

                <nav className="p-4 space-y-2">

                    <button
                        onClick={() => navigate("/aluno/dashboard")}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-white/10 transition"
                    >
                        <BookOpen size={18} />
                        Dashboard
                    </button>

                    <button
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-[#282451] text-white"
                    >
                        <Users size={18} />
                        Turmas
                    </button>

                    <button
                        onClick={() => navigate("/aluno/atividades")}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-white/10 transition"
                    >
                        <BookOpen size={18} />
                        Atividades
                    </button>

                    <button
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-white/10 transition"
                    >
                        <CheckCircle size={18} />
                        Desempenho
                    </button>

                </nav>

            </aside>

            {/* CONTEÚDO */}
            <main className="ml-64 flex-1">

                <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-end px-8">

                    <div className="flex items-center gap-4">

                        <div className="w-9 h-9 rounded-full bg-[#5b4cff] text-white flex items-center justify-center text-sm font-bold">
                            P
                        </div>

                        <span className="text-sm font-semibold text-gray-700">
                            Aluno
                        </span>

                    </div>

                </header>

                <div className="p-8">

                    <div className="mb-7">

                        <h1 className="text-2xl font-bold text-gray-800">
                            Turmas
                        </h1>

                        <p className="text-sm text-gray-500 mt-1">
                            Entre nas turmas das suas aulas para ver e responder as atividades delas.
                        </p>

                    </div>

                    {erro && (
                        <div className="mb-5 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                            {erro}
                        </div>
                    )}

                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">

                        {carregando ? (

                            <div className="py-16 text-center text-gray-500">
                                Carregando turmas...
                            </div>

                        ) : turmas.length === 0 ? (

                            <div className="py-16 text-center">

                                <Users
                                    size={40}
                                    className="mx-auto text-gray-300 mb-3"
                                />

                                <p className="font-semibold text-gray-600">
                                    Nenhuma turma disponível
                                </p>

                                <p className="text-sm text-gray-400 mt-1">
                                    Quando um professor criar uma turma, ela aparecerá aqui.
                                </p>

                            </div>

                        ) : (

                            <ul>

                                {turmas.map((turma) => {
                                    const matriculado = minhasIds.includes(turma.id);

                                    return (

                                        <li
                                            key={turma.id}
                                            className="flex items-center justify-between px-6 py-4 border-b border-gray-100 last:border-b-0"
                                        >

                                            <div className="flex items-center gap-3">

                                                <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                                                    <Users size={16} />
                                                </div>

                                                <div>

                                                    <p className="font-semibold text-gray-800">
                                                        {turma.nome}
                                                    </p>

                                                    {matriculado && (
                                                        <span className="inline-flex mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                                            Matriculado
                                                        </span>
                                                    )}

                                                </div>

                                            </div>

                                            <button
                                                onClick={() => alterarMatricula(turma)}
                                                disabled={processando === turma.id}
                                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed ${
                                                    matriculado
                                                        ? "border border-gray-200 text-gray-600 hover:bg-gray-100"
                                                        : "bg-[#5b4cff] text-white hover:bg-[#4a3de0]"
                                                }`}
                                            >
                                                {matriculado ? "Sair da turma" : "Entrar na turma"}
                                            </button>

                                        </li>

                                    );
                                })}

                            </ul>

                        )}

                    </div>

                </div>

            </main>

        </div>
    );
}

export default TurmasAluno;