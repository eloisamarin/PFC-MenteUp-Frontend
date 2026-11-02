import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Search,
    Eye,
    Users,
    BookOpen,
    Clock,
    CheckCircle,
} from "lucide-react";
import { apiFetch } from "../../services/api";

interface Turma {
    id: number;
    nome: string;
}

type StatusAtividade = "PENDENTE" | "EM_ANDAMENTO" | "CONCLUIDO";

interface Atividade {
    id: number;
    titulo: string;
    descricao: string;
    pontuacao: number;
    status: StatusAtividade;
    dataCriacao: string;
    turma?: Turma;
}

interface AtividadeAluno {
    atividade: Atividade;
    status: "PENDENTE" | "EM_ANDAMENTO" | "CONCLUIDA";
    acertos: number | null;
    pontuacao: number | null;
    percentualConclusao: number | null;
}

type VisaoStatus = "PENDENTE" | "EM_ANDAMENTO" | "CONCLUIDA" | "ENCERRADA";

function visaoStatus(item: AtividadeAluno): VisaoStatus {
    if (item.status === "CONCLUIDA") {
        return "CONCLUIDA";
    }
    if (item.status === "EM_ANDAMENTO") {
        return "EM_ANDAMENTO";
    }
    return item.atividade.status === "CONCLUIDO" ? "ENCERRADA" : "PENDENTE";
}

function AtividadesAluno() {
    const navigate = useNavigate();

    const [itens, setItens] = useState<AtividadeAluno[]>([]);
    const [busca, setBusca] = useState("");
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    useEffect(() => {
        async function buscarAtividades() {
            try {
                setCarregando(true);
                setErro("");

                const resposta = await apiFetch("/alunos/me/atividades");

                if (!resposta.ok) {
                    throw new Error("Não foi possível carregar as atividades.");
                }

                const dados: AtividadeAluno[] = await resposta.json();

                setItens(dados);

            } catch (error) {
                console.error("Erro ao buscar atividades:", error);
                setErro("Não foi possível carregar as atividades.");
            } finally {
                setCarregando(false);
            }
        }
        buscarAtividades();
    }, []);

    function formatarData(data?: string) {
        if (!data) {
            return "-";
        }

        return new Date(data).toLocaleDateString("pt-BR");
    }

    function obterStatus(status: VisaoStatus) {
        switch (status) {
            case "CONCLUIDA":
                return { texto: "Concluída", classe: "bg-green-100 text-green-700" };
            case "ENCERRADA":
                return { texto: "Encerrada", classe: "bg-blue-100 text-slate-600" };
            case "PENDENTE":
            default:
                return { texto: "Pendente", classe: "bg-yellow-100 text-yellow-700" };
        }
    }

    const itensFiltrados = itens.filter((item) =>
        item.atividade.titulo.toLowerCase().includes(busca.toLowerCase())
    );

    const totalAtividades = itens.length;
    const atividadesPendentes = itens.filter((item) => visaoStatus(item) === "PENDENTE").length;
    const atividadesEncerradas = itens.filter((item) => visaoStatus(item) === "ENCERRADA").length;
    const atividadesConcluidas = itens.filter((item) => visaoStatus(item) === "CONCLUIDA").length;

    return (
        <div className="min-h-screen bg-[#f5f6fb] flex">

            <aside className="w-64 bg-[#111127] text-white fixed left-0 top-0 bottom-0">
                <div className="h-20 flex items-center px-6 border-b border-white/10">
                    <div className="w-8 h-8 rounded-lg bg-[#5b4cff] flex items-center justify-center font-bold mr-3">M</div>
                    <span className="text-lg font-bold">Mente<span className="text-[#7c6cff]">Up</span></span>
                </div>

                <nav className="p-4 space-y-2">
                    <button onClick={() => navigate("/aluno/dashboard")} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-white/10 transition">
                        <BookOpen size={18} /> Dashboard
                    </button>
                    <button onClick={() => navigate("/aluno/turmas")} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-white/10 transition">
                        <Users size={18} /> Turmas
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-[#282451] text-white">
                        <BookOpen size={18} /> Atividades
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-white/10 transition">
                        <CheckCircle size={18} /> Desempenho
                    </button>
                </nav>
            </aside>

            <main className="ml-64 flex-1">
                <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8">
                    <div className="relative w-80">
                        <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar atividade..."
                            value={busca}
                            onChange={(event) => setBusca(event.target.value)}
                            className="w-full bg-gray-100 border-0 rounded-full py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#5b4cff]/30"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-full bg-[#5b4cff] text-white flex items-center justify-center text-sm font-bold">P</div>
                        <span className="text-sm font-semibold text-gray-700">Aluno</span>
                    </div>
                </header>

                <div className="p-8">
                    <div className="flex items-center justify-between mb-7">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Atividades</h1>
                            <p className="text-sm text-gray-500 mt-1">{totalAtividades} atividades disponíveis</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 gap-5 mb-7">
                        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Total</p>
                                    <p className="text-2xl font-bold text-gray-800 mt-1">{totalAtividades}</p>
                                </div>
                                <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center"><BookOpen size={20} /></div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Pendentes</p>
                                    <p className="text-2xl font-bold text-gray-800 mt-1">{atividadesPendentes}</p>
                                </div>
                                <div className="w-10 h-10 rounded-lg bg-yellow-100 text-yellow-600 flex items-center justify-center"><Clock size={20} /></div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Encerradas</p>
                                    <p className="text-2xl font-bold text-gray-800 mt-1">{atividadesEncerradas}</p>
                                </div>
                                <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center"><Clock size={20} /></div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Concluídas</p>
                                    <p className="text-2xl font-bold text-gray-800 mt-1">{atividadesConcluidas}</p>
                                </div>
                                <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center"><CheckCircle size={20} /></div>
                            </div>
                        </div>
                    </div>

                    {erro && (
                        <div className="mb-5 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{erro}</div>
                    )}

                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                        {carregando ? (
                            <div className="py-16 text-center text-gray-500">Carregando atividades...</div>
                        ) : itensFiltrados.length === 0 ? (
                            <div className="py-16 text-center">
                                <BookOpen size={40} className="mx-auto text-gray-300 mb-3" />
                                <p className="font-semibold text-gray-600">Nenhuma atividade encontrada</p>
                                <p className="text-sm text-gray-400 mt-1">Entre em uma turma para ver as atividades dela.</p>
                                <button onClick={() => navigate("/aluno/turmas")} className="mt-4 px-4 py-2 rounded-lg bg-[#5b4cff] text-white text-sm font-semibold hover:bg-[#4a3de0] transition">
                                    Ver turmas
                                </button>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Atividade</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Turma</th>
                                    <th className="text-center px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Pontuação</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Data</th>
                                    <th className="text-center px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                    <th className="text-center px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Ações</th>
                                </tr>
                                </thead>
                                <tbody>
                                {itensFiltrados.map((item) => {
                                    const atividade = item.atividade;
                                    const visao = visaoStatus(item);
                                    const podeAbrir = visao === "PENDENTE" || visao === "EM_ANDAMENTO" || visao === "CONCLUIDA";
                                    const status = obterStatus(visao);

                                    return (
                                        <tr key={atividade.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-semibold text-gray-800">{atividade.titulo}</p>
                                                    <p className="text-xs text-gray-400 mt-1 max-w-xs truncate">{atividade.descricao}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                                                        <Users size={15} />
                                                    </div>
                                                    <span className="text-sm text-gray-700">{atividade.turma?.nome || "Sem turma"}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                    <span className="text-sm font-semibold text-gray-700">
                                                        {item.pontuacao !== null
                                                            ? `${item.pontuacao} / ${atividade.pontuacao} XP`
                                                            : `${atividade.pontuacao} XP`}
                                                    </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-600">{formatarData(atividade.dataCriacao)}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${status.classe}`}>
                                                        {status.texto}
                                                    </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        title="Visualizar"
                                                        onClick={() => {
                                                            if (podeAbrir) {
                                                                navigate(`/aluno/atividades/responder/${atividade.id}`);
                                                            }
                                                        }}
                                                        disabled={!podeAbrir}
                                                        className={`w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 ${
                                                            !podeAbrir ? "cursor-not-allowed bg-gray-100 opacity-50" : "hover:bg-gray-100 hover:text-[#5b4cff]"
                                                        }`}
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default AtividadesAluno;