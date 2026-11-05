import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {ArrowLeft, BookOpen, Plus, UserMinus, UserPlus, Users, Zap} from "lucide-react";
import LayoutPainel from "../../components/LayoutPainel";
import ConfirmarExclusao from "../../components/ConfirmarExclusao";
import {BadgeStatusDesafio} from "../../components/ComponentesDesafio";
import {apiFetch, lerErro} from "../../services/api";
import {
    contagem,
    ROTA_BASE,
    type AlunoTurma,
    type Desafio,
    type PerfilGestao,
    type TurmaDetalhe,
} from "../../services/turmaDesafio";

function DetalheTurma({perfil}: { perfil: PerfilGestao }) {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();
    const base = ROTA_BASE[perfil];

    const [turma, setTurma] = useState<TurmaDetalhe | null>(null);
    const [desafios, setDesafios] = useState<Desafio[]>([]);
    const [usuarios, setUsuarios] = useState<AlunoTurma[]>([]);
    const [buscaAluno, setBuscaAluno] = useState("");
    const [vinculando, setVinculando] = useState<number | null>(null);
    const [paraRemover, setParaRemover] = useState<AlunoTurma | null>(null);
    const [removendo, setRemovendo] = useState(false);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [versao, setVersao] = useState(0);

    useEffect(() => {
        async function carregar() {
            try {
                const [respostaTurma, respostaDesafios, respostaUsuarios] = await Promise.all([
                    apiFetch(`/turmas/${id}`),
                    apiFetch("/desafios"),
                    apiFetch("/usuarios/all"),
                ]);

                if (!respostaTurma.ok) {
                    setErro("Turma não encontrada.");
                    return;
                }

                setTurma(await respostaTurma.json());

                if (respostaDesafios.ok) {
                    const todos: Desafio[] = await respostaDesafios.json();
                    setDesafios(todos.filter((desafio) => desafio.turma.id === Number(id)));
                }

                if (respostaUsuarios.ok) {
                    setUsuarios(await respostaUsuarios.json());
                }
            } catch (error) {
                console.error("Erro ao carregar a turma:", error);
                setErro("Não foi possível carregar a turma.");
            } finally {
                setCarregando(false);
            }
        }

        carregar();
    }, [id, versao]);

    async function vincularAluno(aluno: AlunoTurma) {
        try {
            setVinculando(aluno.id);
            setErro("");

            const resposta = await apiFetch(`/turmas/${id}/alunos/${aluno.id}`, {method: "POST"});

            if (!resposta.ok) {
                const erroApi = await lerErro(resposta, "Não foi possível adicionar o aluno.");
                setErro(erroApi.mensagem);
                return;
            }

            setBuscaAluno("");
            setVersao((atual) => atual + 1);
        } catch (error) {
            console.error("Erro ao adicionar aluno:", error);
            setErro("Não foi possível adicionar o aluno.");
        } finally {
            setVinculando(null);
        }
    }

    async function removerAluno() {
        if (!paraRemover) return;

        try {
            setRemovendo(true);
            setErro("");

            const resposta = await apiFetch(`/turmas/${id}/alunos/${paraRemover.id}`, {method: "DELETE"});

            if (!resposta.ok) {
                const erroApi = await lerErro(resposta, "Não foi possível remover o aluno.");
                setErro(erroApi.mensagem);
                return;
            }

            setVersao((atual) => atual + 1);
        } catch (error) {
            console.error("Erro ao remover aluno:", error);
            setErro("Não foi possível remover o aluno.");
        } finally {
            setRemovendo(false);
            setParaRemover(null);
        }
    }

    if (carregando) {
        return (
            <LayoutPainel perfil={perfil}>
                <p className="py-12 text-center text-sm text-slate-400">Carregando turma...</p>
            </LayoutPainel>
        );
    }

    if (!turma) {
        return (
            <LayoutPainel perfil={perfil}>
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">{erro}</div>
                <button onClick={() => navigate(`${base}/turmas`)} className="mt-4 text-sm font-semibold text-indigo-600 hover:underline">
                    Voltar para turmas
                </button>
            </LayoutPainel>
        );
    }

    const idsMatriculados = new Set(turma.alunos.map((aluno) => aluno.id));
    const termo = buscaAluno.trim().toLowerCase();
    const candidatos = !termo ? [] : usuarios
        .filter((usuario) => usuario.tipoUsuario?.toUpperCase() === "ALUNO" && !idsMatriculados.has(usuario.id))
        .filter((usuario) =>
            usuario.nomeUsuario.toLowerCase().includes(termo) || usuario.usuario.toLowerCase().includes(termo)
        )
        .slice(0, 6);

    return (
        <LayoutPainel perfil={perfil}>
            <button onClick={() => navigate(`${base}/turmas`)} className="mb-4 flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800">
                <ArrowLeft size={16}/> Voltar para turmas
            </button>

            <h1 className="text-2xl font-semibold">{turma.nome}</h1>
            <p className="mt-1 mb-6 text-sm text-slate-400">
                {contagem(turma.alunos.length, "aluno", "alunos")} · {contagem(turma.atividade.length, "atividade", "atividades")} · {contagem(desafios.length, "desafio", "desafios")}
            </p>

            {erro && (
                <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">{erro}</div>
            )}

            <div className="grid gap-6 lg:grid-cols-2">

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:row-span-2">
                    <h2 className="mb-3 flex items-center gap-2 font-semibold">
                        <Users size={18} className="text-indigo-500"/> Alunos
                    </h2>

                    <input
                        value={buscaAluno}
                        onChange={(event) => setBuscaAluno(event.target.value)}
                        placeholder="Adicionar aluno por nome ou e-mail"
                        aria-label="Adicionar aluno por nome ou e-mail"
                        className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
                    />

                    {termo && (
                        <ul className="mt-2 rounded-lg border border-slate-100">
                            {candidatos.length === 0 && (
                                <li className="px-4 py-3 text-sm text-slate-400">Nenhum aluno disponível com esse termo.</li>
                            )}
                            {candidatos.map((aluno) => (
                                <li key={aluno.id} className="flex items-center gap-3 border-b px-4 py-2 last:border-b-0">
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">{aluno.nomeUsuario}</p>
                                        <p className="truncate text-xs text-slate-400">{aluno.usuario}</p>
                                    </div>
                                    <button
                                        onClick={() => vincularAluno(aluno)}
                                        disabled={vinculando === aluno.id}
                                        className="flex items-center gap-1 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 disabled:opacity-50"
                                    >
                                        <UserPlus size={14}/> Adicionar
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}

                    {turma.alunos.length === 0 ? (
                        <p className="py-8 text-center text-sm text-slate-400">Nenhum aluno nesta turma ainda.</p>
                    ) : (
                        <ul className="mt-4">
                            {turma.alunos.map((aluno) => (
                                <li key={aluno.id} className="flex items-center gap-3 border-b py-2.5 last:border-b-0">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-semibold text-purple-700">
                                        {aluno.nomeUsuario.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">{aluno.nomeUsuario}</p>
                                        <p className="truncate text-xs text-slate-400">{aluno.usuario}</p>
                                    </div>
                                    <button
                                        title={`Remover ${aluno.nomeUsuario} da turma`}
                                        onClick={() => setParaRemover(aluno)}
                                        className="rounded p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                                    >
                                        <UserMinus size={17}/>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="flex items-center gap-2 font-semibold">
                            <Zap size={18} className="text-indigo-500"/> Desafios
                        </h2>
                        <button
                            onClick={() => navigate(`${base}/desafios/criar?turma=${turma.id}`)}
                            className="flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:underline"
                        >
                            <Plus size={15}/> Novo desafio
                        </button>
                    </div>

                    {desafios.length === 0 ? (
                        <p className="py-6 text-center text-sm text-slate-400">Nenhum desafio nesta turma.</p>
                    ) : (
                        <ul>
                            {desafios.map((desafio) => (
                                <li key={desafio.id} className="border-b last:border-b-0">
                                    <button
                                        onClick={() => navigate(`${base}/desafios/${desafio.id}`)}
                                        className="flex w-full items-center justify-between gap-3 py-2.5 text-left hover:text-indigo-600"
                                    >
                                        <span className="truncate text-sm font-medium">{desafio.titulo}</span>
                                        <BadgeStatusDesafio status={desafio.status}/>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="mb-3 flex items-center gap-2 font-semibold">
                        <BookOpen size={18} className="text-indigo-500"/> Atividades
                    </h2>

                    {turma.atividade.length === 0 ? (
                        <p className="py-6 text-center text-sm text-slate-400">Nenhuma atividade nesta turma.</p>
                    ) : (
                        <ul>
                            {turma.atividade.map((atividade) => (
                                <li key={atividade.id} className="border-b last:border-b-0">
                                    <button
                                        onClick={() => navigate(`${base}/atividades/${atividade.id}`)}
                                        className="w-full truncate py-2.5 text-left text-sm font-medium hover:text-indigo-600"
                                    >
                                        {atividade.titulo}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

            </div>

            {paraRemover && (
                <ConfirmarExclusao
                    titulo={`Remover ${paraRemover.nomeUsuario} da turma?`}
                    mensagem="As atividades e os desafios desta turma deixam de aparecer para esta pessoa. A conta continua no sistema, e é possível adicioná-la de novo."
                    processando={removendo}
                    rotuloConfirmar="Remover"
                    rotuloProcessando="Removendo..."
                    onConfirmar={removerAluno}
                    onCancelar={() => setParaRemover(null)}
                />
            )}
        </LayoutPainel>
    );
}

export default DetalheTurma;
