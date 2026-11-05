import {useEffect, useState, type FormEvent} from "react";
import {useNavigate} from "react-router-dom";
import {Check, Eye, Pencil, Plus, Search, Trash2, Users, X} from "lucide-react";
import LayoutPainel from "../../components/LayoutPainel";
import ConfirmarExclusao from "../../components/ConfirmarExclusao";
import {apiFetch, lerErro} from "../../services/api";
import {contagem, ROTA_BASE, type PerfilGestao, type TurmaDetalhe} from "../../services/turmaDesafio";

function TurmasGestao({perfil}: { perfil: PerfilGestao }) {
    const navigate = useNavigate();
    const base = ROTA_BASE[perfil];

    const [turmas, setTurmas] = useState<TurmaDetalhe[]>([]);
    const [busca, setBusca] = useState("");
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    const [novoNome, setNovoNome] = useState("");
    const [criando, setCriando] = useState(false);

    const [editandoId, setEditandoId] = useState<number | null>(null);
    const [nomeEditado, setNomeEditado] = useState("");

    const [paraExcluir, setParaExcluir] = useState<TurmaDetalhe | null>(null);
    const [excluindo, setExcluindo] = useState(false);
    const [versao, setVersao] = useState(0);

    useEffect(() => {
        async function carregarTurmas() {
            try {
                const resposta = await apiFetch("/turmas/all");
                if (!resposta.ok) throw new Error("Falha ao consultar as turmas.");
                const dados: TurmaDetalhe[] = await resposta.json();
                setTurmas(dados.sort((a, b) => a.nome.localeCompare(b.nome)));
            } catch (error) {
                console.error("Erro ao carregar turmas:", error);
                setErro("Não foi possível carregar as turmas.");
            } finally {
                setCarregando(false);
            }
        }

        carregarTurmas();
    }, [versao]);

    async function criarTurma(event: FormEvent) {
        event.preventDefault();

        const nome = novoNome.trim();
        if (!nome) return;

        try {
            setCriando(true);
            setErro("");

            const resposta = await apiFetch("/turmas", {
                method: "POST",
                body: JSON.stringify({nome}),
            });

            if (!resposta.ok) {
                const erroApi = await lerErro(resposta, "Não foi possível criar a turma.");
                setErro(erroApi.campos?.nome ?? erroApi.mensagem);
                return;
            }

            setNovoNome("");
            setVersao((atual) => atual + 1);
        } catch (error) {
            console.error("Erro ao criar turma:", error);
            setErro("Não foi possível criar a turma.");
        } finally {
            setCriando(false);
        }
    }

    async function salvarNome(id: number) {
        const nome = nomeEditado.trim();
        if (!nome) return;

        try {
            setErro("");

            const resposta = await apiFetch("/turmas", {
                method: "PUT",
                body: JSON.stringify({id, nome}),
            });

            if (!resposta.ok) {
                const erroApi = await lerErro(resposta, "Não foi possível renomear a turma.");
                setErro(erroApi.campos?.nome ?? erroApi.mensagem);
                return;
            }

            setEditandoId(null);
            setVersao((atual) => atual + 1);
        } catch (error) {
            console.error("Erro ao renomear turma:", error);
            setErro("Não foi possível renomear a turma.");
        }
    }

    async function excluirTurma() {
        if (!paraExcluir) return;

        try {
            setExcluindo(true);
            setErro("");

            const resposta = await apiFetch(`/turmas/${paraExcluir.id}`, {method: "DELETE"});

            if (!resposta.ok) {
                const erroApi = await lerErro(resposta, "Não foi possível excluir a turma.");
                setErro(erroApi.codigo === "CONFLITO_DE_DADOS"
                    ? "Esta turma não pode ser excluída porque ainda tem desafios ou resultados de alunos vinculados."
                    : erroApi.mensagem);
                return;
            }

            setVersao((atual) => atual + 1);
        } catch (error) {
            console.error("Erro ao excluir turma:", error);
            setErro("Não foi possível excluir a turma.");
        } finally {
            setExcluindo(false);
            setParaExcluir(null);
        }
    }

    const filtradas = turmas.filter((turma) =>
        turma.nome.toLowerCase().includes(busca.toLowerCase())
    );

    return (
        <LayoutPainel perfil={perfil}>
            <div className="mb-6">
                <h1 className="text-2xl font-semibold">Turmas</h1>
                <p className="mt-1 text-sm text-slate-400">{contagem(turmas.length, "turma cadastrada", "turmas cadastradas")}</p>
            </div>

            <form onSubmit={criarTurma} className="mb-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
                <input
                    value={novoNome}
                    onChange={(event) => setNovoNome(event.target.value)}
                    maxLength={255}
                    placeholder="Nome da nova turma"
                    aria-label="Nome da nova turma"
                    className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
                />
                <button
                    type="submit"
                    disabled={criando || !novoNome.trim()}
                    className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                >
                    <Plus size={18}/>
                    {criando ? "Criando..." : "Criar turma"}
                </button>
            </form>

            {erro && (
                <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">{erro}</div>
            )}

            <div className="relative mb-4 max-w-sm">
                <Search size={17} className="absolute left-4 top-3 text-slate-400"/>
                <input
                    value={busca}
                    onChange={(event) => setBusca(event.target.value)}
                    placeholder="Buscar turma..."
                    aria-label="Buscar turma"
                    className="w-full rounded-full bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
                />
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                {carregando && turmas.length === 0 ? (
                    <p className="py-12 text-center text-sm text-slate-400">Carregando turmas...</p>
                ) : filtradas.length === 0 ? (
                    <div className="py-12 text-center">
                        <Users size={36} className="mx-auto mb-3 text-slate-300"/>
                        <p className="text-sm text-slate-400">
                            {busca ? "Nenhuma turma encontrada." : "Crie a primeira turma no campo acima."}
                        </p>
                    </div>
                ) : (
                    <ul>
                        {filtradas.map((turma) => (
                            <li key={turma.id} className="flex flex-wrap items-center gap-3 border-b px-5 py-4 last:border-b-0 hover:bg-slate-50">
                                {editandoId === turma.id ? (
                                    <div className="flex min-w-0 flex-1 items-center gap-2">
                                        <input
                                            autoFocus
                                            value={nomeEditado}
                                            onChange={(event) => setNomeEditado(event.target.value)}
                                            onKeyDown={(event) => {
                                                if (event.key === "Enter") salvarNome(turma.id);
                                                if (event.key === "Escape") setEditandoId(null);
                                            }}
                                            maxLength={255}
                                            aria-label="Novo nome da turma"
                                            className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
                                        />
                                        <button title="Salvar" onClick={() => salvarNome(turma.id)} className="rounded p-2 text-green-600 hover:bg-green-50">
                                            <Check size={17}/>
                                        </button>
                                        <button title="Cancelar" onClick={() => setEditandoId(null)} className="rounded p-2 text-slate-500 hover:bg-slate-100">
                                            <X size={17}/>
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => navigate(`${base}/turmas/${turma.id}`)}
                                            className="min-w-0 flex-1 text-left"
                                        >
                                            <p className="truncate font-semibold">{turma.nome}</p>
                                            <p className="text-xs text-slate-400">
                                                {contagem(turma.alunos?.length ?? 0, "aluno", "alunos")} · {contagem(turma.atividade?.length ?? 0, "atividade", "atividades")}
                                            </p>
                                        </button>
                                        <div className="flex gap-1">
                                            <button title="Ver turma" onClick={() => navigate(`${base}/turmas/${turma.id}`)} className="rounded p-2 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600">
                                                <Eye size={17}/>
                                            </button>
                                            <button
                                                title="Renomear"
                                                onClick={() => {
                                                    setEditandoId(turma.id);
                                                    setNomeEditado(turma.nome);
                                                }}
                                                className="rounded p-2 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
                                            >
                                                <Pencil size={17}/>
                                            </button>
                                            <button title="Excluir" onClick={() => setParaExcluir(turma)} className="rounded p-2 text-slate-500 hover:bg-red-50 hover:text-red-600">
                                                <Trash2 size={17}/>
                                            </button>
                                        </div>
                                    </>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {paraExcluir && (
                <ConfirmarExclusao
                    titulo={`Excluir a turma "${paraExcluir.nome}"?`}
                    mensagem="As atividades da turma também serão excluídas. Os alunos continuam cadastrados no sistema. Esta ação não pode ser desfeita."
                    processando={excluindo}
                    onConfirmar={excluirTurma}
                    onCancelar={() => setParaExcluir(null)}
                />
            )}
        </LayoutPainel>
    );
}

export default TurmasGestao;
