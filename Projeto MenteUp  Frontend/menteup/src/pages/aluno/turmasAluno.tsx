import {useEffect, useState} from "react";
import {apiFetch, lerErro} from "../../services/api.ts";
import {Users} from "lucide-react";
import LayoutPainel from "../../components/LayoutPainel";

interface Turma {
    id: number;
    nome: string;
}

function TurmasAluno() {
    const [turmas, setTurmas] = useState<Turma[]>([]);
    const [minhasIds, setMinhaIds] = useState<number[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [processando, setProcessando] = useState<number | null>(null);
    const [erro, setErro] = useState("");

    useEffect(() => {
        async function carregar() {
            try {
                const [respostaTurmas, respostaMinhas] = await Promise.all([
                    apiFetch("/turmas/all"),
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
                `/alunos/me/turmas/${turma.id}`,
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
        <LayoutPainel perfil="ALUNO">

            <div className="mb-7">

                <h1 className="text-2xl font-bold text-gray-800">
                    Turmas
                </h1>

                <p className="text-sm text-gray-500 mt-1">
                    Entre nas turmas das suas aulas para participar das atividades e dos desafios delas.
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

        </LayoutPainel>
    );
}

export default TurmasAluno;