import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {Pencil, Play, Plus, Trash2, Trophy, Zap} from "lucide-react";
import LayoutPainel from "../../components/LayoutPainel";
import ConfirmarExclusao from "../../components/ConfirmarExclusao";
import {BadgeStatusDesafio} from "../../components/ComponentesDesafio";
import {apiFetch, lerErro} from "../../services/api";
import {contagem, ROTA_BASE, type Desafio, type PerfilGestao} from "../../services/turmaDesafio";

function DesafiosGestao({perfil}: { perfil: PerfilGestao }) {
    const navigate = useNavigate();
    const base = ROTA_BASE[perfil];

    const [desafios, setDesafios] = useState<Desafio[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [paraExcluir, setParaExcluir] = useState<Desafio | null>(null);
    const [excluindo, setExcluindo] = useState(false);
    const [versao, setVersao] = useState(0);

    useEffect(() => {
        async function carregarDesafios() {
            try {
                const resposta = await apiFetch("/desafios");
                if (!resposta.ok) throw new Error("Falha ao consultar os desafios.");
                setDesafios(await resposta.json());
            } catch (error) {
                console.error("Erro ao carregar desafios:", error);
                setErro("Não foi possível carregar os desafios.");
            } finally {
                setCarregando(false);
            }
        }

        carregarDesafios();
    }, [versao]);

    async function excluirDesafio() {
        if (!paraExcluir) return;

        try {
            setExcluindo(true);
            setErro("");

            const resposta = await apiFetch(`/desafios/${paraExcluir.id}`, {method: "DELETE"});

            if (!resposta.ok) {
                const erroApi = await lerErro(resposta, "Não foi possível excluir o desafio.");
                setErro(erroApi.mensagem);
                return;
            }

            setVersao((atual) => atual + 1);
        } catch (error) {
            console.error("Erro ao excluir desafio:", error);
            setErro("Não foi possível excluir o desafio.");
        } finally {
            setExcluindo(false);
            setParaExcluir(null);
        }
    }

    return (
        <LayoutPainel perfil={perfil}>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold">Desafios</h1>
                    <p className="mt-1 text-sm text-slate-400">Quizzes ao vivo: você conduz e a turma responde em tempo real.</p>
                </div>
                <button
                    onClick={() => navigate(`${base}/desafios/criar`)}
                    className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200"
                >
                    <Plus size={18}/> Criar desafio
                </button>
            </div>

            {erro && (
                <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">{erro}</div>
            )}

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                {carregando ? (
                    <p className="py-12 text-center text-sm text-slate-400">Carregando desafios...</p>
                ) : desafios.length === 0 ? (
                    <div className="py-12 text-center">
                        <Zap size={36} className="mx-auto mb-3 text-slate-300"/>
                        <p className="text-sm text-slate-400">Nenhum desafio criado ainda.</p>
                    </div>
                ) : (
                    <ul>
                        {desafios.map((desafio) => (
                            <li key={desafio.id} className="flex flex-wrap items-center gap-3 border-b px-5 py-4 last:border-b-0 hover:bg-slate-50">
                                <div className="min-w-0 flex-1 basis-56">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="truncate font-semibold">{desafio.titulo}</p>
                                        <BadgeStatusDesafio status={desafio.status}/>
                                    </div>
                                    <p className="mt-0.5 text-xs text-slate-400">
                                        {desafio.turma.nome} · {contagem(desafio.totalPerguntas, "pergunta", "perguntas")}
                                    </p>
                                </div>

                                <button
                                    onClick={() => navigate(`${base}/desafios/${desafio.id}`)}
                                    className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-white"
                                >
                                    {desafio.status === "ENCERRADO" ? <Trophy size={16}/> : <Play size={16}/>}
                                    {desafio.status === "ENCERRADO"
                                        ? "Ver ranking"
                                        : desafio.status === "EM_ANDAMENTO" ? "Conduzir" : "Abrir"}
                                </button>

                                {desafio.status === "AGUARDANDO" && (
                                    <button
                                        title="Editar"
                                        onClick={() => navigate(`${base}/desafios/${desafio.id}/editar`)}
                                        className="rounded p-2 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
                                    >
                                        <Pencil size={17}/>
                                    </button>
                                )}

                                <button
                                    title={desafio.status === "EM_ANDAMENTO" ? "Encerre o desafio para excluir" : "Excluir"}
                                    onClick={() => setParaExcluir(desafio)}
                                    disabled={desafio.status === "EM_ANDAMENTO"}
                                    className="rounded p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                                >
                                    <Trash2 size={17}/>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {paraExcluir && (
                <ConfirmarExclusao
                    titulo={`Excluir o desafio "${paraExcluir.titulo}"?`}
                    mensagem="As perguntas, as respostas e o ranking deste desafio serão apagados. Esta ação não pode ser desfeita."
                    processando={excluindo}
                    onConfirmar={excluirDesafio}
                    onCancelar={() => setParaExcluir(null)}
                />
            )}
        </LayoutPainel>
    );
}

export default DesafiosGestao;
