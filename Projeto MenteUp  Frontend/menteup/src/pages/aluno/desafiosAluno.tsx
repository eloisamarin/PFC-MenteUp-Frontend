import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {Zap} from "lucide-react";
import LayoutPainel from "../../components/LayoutPainel";
import {BadgeStatusDesafio} from "../../components/ComponentesDesafio";
import {apiFetch} from "../../services/api";
import {contagem, type Desafio, type StatusDesafio} from "../../services/turmaDesafio";

const INTERVALO_LISTA_MS = 5000;

const ORDEM_STATUS: Record<StatusDesafio, number> = {
    EM_ANDAMENTO: 0,
    AGUARDANDO: 1,
    ENCERRADO: 2,
};

const ACAO_STATUS: Record<StatusDesafio, string> = {
    EM_ANDAMENTO: "Entrar agora",
    AGUARDANDO: "Entrar na sala",
    ENCERRADO: "Ver resultado",
};

function DesafiosAluno() {
    const navigate = useNavigate();

    const [desafios, setDesafios] = useState<Desafio[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    useEffect(() => {
        async function carregar() {
            try {
                const resposta = await apiFetch("/desafios");
                if (!resposta.ok) throw new Error("Falha ao consultar os desafios.");
                setDesafios(await resposta.json());
                setErro("");
            } catch (error) {
                console.error("Erro ao carregar desafios:", error);
                setErro("Não foi possível carregar os desafios.");
            } finally {
                setCarregando(false);
            }
        }

        carregar();

        // Um desafio pode começar enquanto o aluno está nesta tela
        const intervalo = setInterval(carregar, INTERVALO_LISTA_MS);

        return () => clearInterval(intervalo);
    }, []);

    const ordenados = [...desafios].sort((a, b) => ORDEM_STATUS[a.status] - ORDEM_STATUS[b.status]);

    return (
        <LayoutPainel perfil="ALUNO">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold">Desafios</h1>
                <p className="mt-1 text-sm text-slate-400">
                    Responda rápido: acertos mais velozes valem mais pontos.
                </p>
            </div>

            {erro && (
                <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">{erro}</div>
            )}

            {carregando ? (
                <p className="py-12 text-center text-sm text-slate-400">Carregando desafios...</p>
            ) : ordenados.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white py-12 text-center shadow-sm">
                    <Zap size={36} className="mx-auto mb-3 text-slate-300"/>
                    <p className="font-semibold text-slate-600">Nenhum desafio por aqui</p>
                    <p className="mt-1 text-sm text-slate-400">
                        Os desafios aparecem quando você entra em uma turma.
                    </p>
                    <button
                        onClick={() => navigate("/aluno/turmas")}
                        className="mt-4 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-sm font-semibold text-white"
                    >
                        Ver turmas
                    </button>
                </div>
            ) : (
                <ul className="grid gap-4 md:grid-cols-2">
                    {ordenados.map((desafio) => (
                        <li key={desafio.id} className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-start justify-between gap-3">
                                <h2 className="min-w-0 break-words font-semibold">{desafio.titulo}</h2>
                                <BadgeStatusDesafio status={desafio.status}/>
                            </div>
                            <p className="mt-1 text-sm text-slate-500">{desafio.descricao}</p>
                            <p className="mt-2 flex-1 text-xs text-slate-400">
                                {desafio.turma.nome} · {contagem(desafio.totalPerguntas, "pergunta", "perguntas")}
                            </p>
                            <button
                                onClick={() => navigate(`/aluno/desafios/${desafio.id}`)}
                                className={`mt-4 rounded-lg px-4 py-2.5 text-sm font-semibold ${
                                    desafio.status === "ENCERRADO"
                                        ? "border border-slate-200 text-slate-600 hover:bg-slate-50"
                                        : "bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                                }`}
                            >
                                {ACAO_STATUS[desafio.status]}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </LayoutPainel>
    );
}

export default DesafiosAluno;
