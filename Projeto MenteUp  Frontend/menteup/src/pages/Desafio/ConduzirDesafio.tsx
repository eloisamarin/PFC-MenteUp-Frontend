import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {ArrowLeft, Check, Play, SkipForward, Users} from "lucide-react";
import LayoutPainel from "../../components/LayoutPainel";
import {BadgeStatusDesafio, BarraTempo, TabelaRanking} from "../../components/ComponentesDesafio";
import {useEstadoDesafio} from "../../hooks/useEstadoDesafio";
import {apiFetch, lerErro} from "../../services/api";
import {CORES_ALTERNATIVA, LETRAS_ALTERNATIVA, contagem, ROTA_BASE, type Desafio, type PerfilGestao, type TurmaDetalhe} from "../../services/turmaDesafio";

function ConduzirDesafio({perfil}: { perfil: PerfilGestao }) {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();
    const base = ROTA_BASE[perfil];

    const {estado, ranking, erro, setErro, carregando, atualizar} = useEstadoDesafio(id);
    const [desafio, setDesafio] = useState<Desafio | null>(null);
    const [totalAlunos, setTotalAlunos] = useState<number | null>(null);
    const [processando, setProcessando] = useState(false);

    useEffect(() => {
        async function carregarTurma() {
            try {
                const respostaDesafios = await apiFetch("/desafios");
                if (!respostaDesafios.ok) return;

                const desafios: Desafio[] = await respostaDesafios.json();
                const encontrado = desafios.find((item) => item.id === Number(id)) ?? null;
                setDesafio(encontrado);

                if (!encontrado) return;

                const respostaTurma = await apiFetch(`/turmas/${encontrado.turma.id}`);

                if (respostaTurma.ok) {
                    const turma: TurmaDetalhe = await respostaTurma.json();
                    setTotalAlunos(turma.alunos.length);
                }
            } catch (error) {
                console.error("Erro ao carregar a turma do desafio:", error);
            }
        }

        carregarTurma();
    }, [id]);

    async function executar(acao: "iniciar" | "avancar") {
        try {
            setProcessando(true);
            setErro("");

            const resposta = await apiFetch(`/desafios/${id}/${acao}`, {method: "POST"});

            if (!resposta.ok) {
                const erroApi = await lerErro(resposta, "Não foi possível atualizar o desafio.");
                setErro(erroApi.mensagem);
                return;
            }

            await atualizar();
        } catch (error) {
            console.error("Erro ao atualizar o desafio:", error);
            setErro("Não foi possível atualizar o desafio.");
        } finally {
            setProcessando(false);
        }
    }

    const voltar = (
        <button onClick={() => navigate(`${base}/desafios`)} className="mb-4 flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800">
            <ArrowLeft size={16}/> Voltar para desafios
        </button>
    );

    if (carregando) {
        return (
            <LayoutPainel perfil={perfil}>
                <p className="py-12 text-center text-sm text-slate-400">Carregando desafio...</p>
            </LayoutPainel>
        );
    }

    if (!estado) {
        return (
            <LayoutPainel perfil={perfil}>
                {voltar}
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                    {erro || "Desafio não encontrado."}
                </div>
            </LayoutPainel>
        );
    }

    const {pergunta, status} = estado;
    const encerrada = estado.perguntaEncerrada === true;
    const ultimaPergunta = estado.numeroPergunta === estado.totalPerguntas;
    const emJogo = status === "EM_ANDAMENTO" && pergunta !== null;

    return (
        <LayoutPainel perfil={perfil}>
            {voltar}

            <div className="mb-6 flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-semibold">{estado.titulo}</h1>
                <BadgeStatusDesafio status={status}/>
            </div>

            {erro && (
                <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">{erro}</div>
            )}

            <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">

                <div className="min-w-0">
                    {status === "AGUARDANDO" && (
                        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                            <p className="text-slate-600">{desafio?.descricao}</p>
                            <p className="mt-2 text-sm text-slate-400">
                                {desafio?.turma.nome} · {contagem(estado.totalPerguntas, "pergunta", "perguntas")}
                            </p>

                            {totalAlunos === 0 && (
                                <p className="mx-auto mt-4 max-w-md rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                                    Esta turma ainda não tem alunos: ninguém poderá responder.
                                </p>
                            )}

                            <button
                                onClick={() => executar("iniciar")}
                                disabled={processando}
                                className="mx-auto mt-6 flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 font-semibold text-white disabled:opacity-60"
                            >
                                <Play size={18}/> Iniciar desafio
                            </button>
                        </div>
                    )}

                    {emJogo && (
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="mb-4 flex items-center justify-between text-sm text-slate-500">
                                <span>Pergunta {estado.numeroPergunta} de {estado.totalPerguntas}</span>
                                <span className="flex items-center gap-1">
                                    <Users size={15}/>
                                    {estado.respostasRecebidas ?? 0}
                                    {totalAlunos !== null && ` de ${totalAlunos}`} responderam
                                </span>
                            </div>

                            {!encerrada && (
                                <BarraTempo restantes={estado.segundosRestantes ?? 0} total={pergunta.tempoSegundos}/>
                            )}

                            <h2 className="mt-5 mb-5 text-xl font-semibold">{pergunta.enunciado}</h2>

                            <div className="grid gap-3 sm:grid-cols-2">
                                {pergunta.alternativas.map((alternativa, indice) => {
                                    const correta = alternativa.id === estado.alternativaCorretaId;

                                    return (
                                        <div
                                            key={alternativa.id}
                                            className={`flex items-center gap-3 rounded-lg p-4 font-medium text-white ${CORES_ALTERNATIVA[indice]} ${
                                                encerrada && !correta ? "opacity-40" : ""
                                            }`}
                                        >
                                            <span className="font-bold">{LETRAS_ALTERNATIVA[indice]}</span>
                                            <span className="min-w-0 flex-1 break-words">{alternativa.texto}</span>
                                            {encerrada && correta && <Check size={20} aria-label="Alternativa correta"/>}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-6 flex items-center justify-between gap-3">
                                <p className="text-sm text-slate-400">
                                    {encerrada
                                        ? "Pergunta encerrada."
                                        : "Aguarde o tempo acabar ou todos os alunos responderem."}
                                </p>
                                <button
                                    onClick={() => executar("avancar")}
                                    disabled={!encerrada || processando}
                                    className="flex shrink-0 items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-40"
                                >
                                    <SkipForward size={17}/>
                                    {ultimaPergunta ? "Encerrar desafio" : "Próxima pergunta"}
                                </button>
                            </div>
                        </div>
                    )}

                    {status === "ENCERRADO" && (
                        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                            <h2 className="text-xl font-semibold">Desafio encerrado</h2>
                            <p className="mt-2 text-sm text-slate-400">
                                {contagem(ranking.length, "aluno participou", "alunos participaram")}. Confira o resultado final no ranking.
                            </p>
                        </div>
                    )}
                </div>

                {status !== "AGUARDANDO" && (
                    <TabelaRanking
                        ranking={ranking}
                        titulo={status === "ENCERRADO" ? "Ranking final" : "Ranking parcial"}
                    />
                )}

            </div>
        </LayoutPainel>
    );
}

export default ConduzirDesafio;
