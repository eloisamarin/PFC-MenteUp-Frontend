import {useEffect, useState} from "react";
import {Link, useParams} from "react-router-dom";
import {ArrowLeft, BookOpen, Check, MessageSquare, Target, X, Zap, type LucideIcon} from "lucide-react";
import LayoutPainel from "../../components/LayoutPainel";
import {apiFetch, lerErro} from "../../services/api";
import {ROTA_BASE, type PerfilGestao} from "../../services/turmaDesafio";
import type {AtividadeDoAluno, ComentarioSalvo, DesempenhoIndividual, QuestaoAluno} from "../../types/desempenho";



const NOME_TIPO: Record<string, string> = {
    QUIZ: "Quiz",
    VERDADEIRO_FALSO: "Verdadeiro ou falso",
    ASSOCIACAO: "Associação",
    ORDENACAO: "Ordenação",
    LACUNAS: "Lacunas",
};

// Uma barra do gráfico: atividade ou desafio, com o percentual de acerto
interface Barra {
    chave: string;
    rotulo: string;
    percentual: number;
    origem: "atividade" | "desafio";
}

function percentual(acertos: number, total: number): number {
    return total === 0 ? 0 : Math.round((acertos * 100) / total);
}

function formatarData(data: string | null): string {
    if (!data) {
        return "";
    }
    const convertida = new Date(data);
    return Number.isNaN(convertida.getTime()) ? "" : convertida.toLocaleDateString("pt-BR");
}

function DesempenhoAluno({perfil}: { perfil: PerfilGestao }) {
    const {turmaId, alunoId} = useParams<{ turmaId: string; alunoId: string }>();
    const base = ROTA_BASE[perfil];

    const [dados, setDados] = useState<DesempenhoIndividual | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<string | null>(null);

    useEffect(() => {
        async function carregar() {
            try {
                const resposta = await apiFetch(`/turmas/${turmaId}/alunos/${alunoId}/desempenho`);

                if (!resposta.ok) {
                    setErro((await lerErro(resposta, "Não foi possível carregar o desempenho do aluno.")).mensagem);
                    return;
                }

                setDados(await resposta.json());
            } catch {
                setErro("Não foi possível conectar ao servidor.");
            } finally {
                setCarregando(false);
            }
        }

        carregar();
    }, [turmaId, alunoId]);

    // Atualiza o comentário na tela depois de salvar, sem recarregar tudo
    function aoSalvarComentario(salvo: ComentarioSalvo) {
        setDados((atual) => atual && {
            ...atual,
            atividades: atual.atividades.map((atividade) =>
                atividade.resultadoId === salvo.resultadoId
                    ? {...atividade, comentario: salvo.comentario, comentadoPor: salvo.comentadoPor}
                    : atividade),
        });
    }

    const barras: Barra[] = dados ? [
        ...dados.atividades.map((a) => ({
            chave: `a-${a.resultadoId}`,
            rotulo: a.titulo,
            percentual: percentual(a.acertos, a.totalQuestoes),
            origem: "atividade" as const,
        })),
        ...dados.desafios.map((d) => ({
            chave: `d-${d.desafioId}`,
            rotulo: d.titulo,
            percentual: percentual(d.acertos, d.totalPerguntas),
            origem: "desafio" as const,
        })),
    ] : [];

    const totalAcertos = dados
        ? dados.atividades.reduce((soma, a) => soma + a.acertos, 0) + dados.desafios.reduce((soma, d) => soma + d.acertos, 0)
        : 0;
    const totalPerguntas = dados
        ? dados.atividades.reduce((soma, a) => soma + a.totalQuestoes, 0) + dados.desafios.reduce((soma, d) => soma + d.totalPerguntas, 0)
        : 0;

    return (
        <LayoutPainel perfil={perfil}>
            <Link to={`${base}/desempenho`} className="mb-4 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600">
                <ArrowLeft size={16}/> Voltar para a turma
            </Link>

            {carregando && <p className="py-12 text-center text-sm text-slate-400">Carregando desempenho...</p>}

            {erro && (
                <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">{erro}</div>
            )}

            {dados && (
                <>
                    <div className="mb-6">
                        <h1 className="text-2xl font-semibold">{dados.nomeAluno}</h1>
                        <p className="mt-1 text-sm text-slate-400">{dados.nomeTurma}</p>
                    </div>

                    <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                        <Cartao icone={BookOpen} valor={dados.atividades.length} rotulo="Atividades concluídas"/>
                        <Cartao icone={Zap} valor={dados.desafios.length} rotulo="Desafios respondidos"/>
                        <Cartao icone={Check} valor={`${totalAcertos} / ${totalPerguntas}`} rotulo="Perguntas acertadas"/>
                        <Cartao icone={Target} valor={`${percentual(totalAcertos, totalPerguntas)}%`} rotulo="Aproveitamento geral"/>
                    </div>

                    <GraficoAproveitamento barras={barras}/>

                    <h2 className="mb-3 mt-8 text-lg font-semibold">Atividades</h2>
                    {dados.atividades.length === 0 ? (
                        <p className="text-sm text-slate-400">O aluno ainda não concluiu atividades nesta turma.</p>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {dados.atividades.map((atividade) => (
                                <CartaoAtividade
                                    key={atividade.resultadoId}
                                    atividade={atividade}
                                    turmaId={dados.turmaId}
                                    aoSalvarComentario={aoSalvarComentario}
                                />
                            ))}
                        </div>
                    )}

                    <h2 className="mb-3 mt-8 text-lg font-semibold">Desafios</h2>
                    {dados.desafios.length === 0 ? (
                        <p className="text-sm text-slate-400">O aluno ainda não respondeu desafios nesta turma.</p>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {dados.desafios.map((desafio) => (
                                <section key={desafio.desafioId} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                        <h3 className="font-semibold">{desafio.titulo}</h3>
                                        <span className="text-sm text-slate-500">
                                            {desafio.acertos} de {desafio.totalPerguntas} acertos · {desafio.pontos} pontos
                                        </span>
                                    </div>
                                    <ListaQuestoes questoes={desafio.questoes}/>
                                </section>
                            ))}
                        </div>
                    )}
                </>
            )}
        </LayoutPainel>
    );
}

// Gráfico de barras em CSS: uma barra por atividade (azul) ou desafio (amarela), com o % de acerto
function GraficoAproveitamento({barras}: { barras: Barra[] }) {
    return (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-semibold">Aproveitamento por atividade e desafio</h2>
                <div className="flex gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-indigo-500"/> Atividade</span>
                    <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-amber-400"/> Desafio</span>
                </div>
            </div>

            {barras.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-400">Sem dados para o gráfico ainda.</p>
            ) : (
                <div
                    className="flex h-56 items-end gap-3 overflow-x-auto"
                    role="img"
                    aria-label={barras.map((b) => `${b.rotulo}: ${b.percentual}%`).join("; ")}
                >
                    {barras.map((barra) => (
                        <div key={barra.chave} className="flex h-full min-w-14 flex-1 flex-col items-center justify-end gap-1">
                            <span className="text-xs font-semibold text-slate-600">{barra.percentual}%</span>
                            <div
                                className={`w-full max-w-12 rounded-t-md ${barra.origem === "atividade" ? "bg-indigo-500" : "bg-amber-400"}`}
                                style={{height: `${Math.max(barra.percentual, 2)}%`}}
                                title={`${barra.rotulo}: ${barra.percentual}%`}
                            />
                            <span className="w-full truncate text-center text-xs text-slate-500" title={barra.rotulo}>
                                {barra.rotulo}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

// Uma atividade concluída: nota, perguntas e o comentário do professor
function CartaoAtividade({atividade, turmaId, aoSalvarComentario}: {
    atividade: AtividadeDoAluno;
    turmaId: number;
    aoSalvarComentario: (salvo: ComentarioSalvo) => void;
}) {
    return (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{atividade.titulo}</h3>
                    <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-600">
                        {NOME_TIPO[atividade.tipo] ?? atividade.tipo}
                    </span>
                </div>
                <span className="text-sm text-slate-500">
                    {atividade.acertos} de {atividade.totalQuestoes} acertos
                    · {atividade.pontuacao} / {atividade.pontuacaoMaxima} pontos
                    {atividade.concluidaEm && ` · ${formatarData(atividade.concluidaEm)}`}
                </span>
            </div>

            {atividade.questoes.length === 0 ? (
                <p className="text-sm text-slate-400">
                    Detalhe por pergunta indisponível: esta atividade foi concluída antes dessa informação ser registrada.
                </p>
            ) : (
                <ListaQuestoes questoes={atividade.questoes}/>
            )}

            <ComentarioAtividade atividade={atividade} turmaId={turmaId} aoSalvar={aoSalvarComentario}/>
        </section>
    );
}

// Cada pergunta com ✓ ou ✗, a resposta do aluno e, quando houver, a correta
function ListaQuestoes({questoes}: { questoes: QuestaoAluno[] }) {
    return (
        <ul className="flex flex-col gap-2">
            {questoes.map((questao, indice) => (
                <li key={indice} className="flex gap-3 rounded-lg bg-slate-50 p-3 text-sm">
                    <span
                        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                            questao.correta === null ? "bg-slate-200 text-slate-500"
                                : questao.correta ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-500"}`}
                        aria-label={questao.correta === null ? "Sem correção" : questao.correta ? "Acertou" : "Errou"}
                    >
                        {questao.correta === false ? <X size={14}/> : <Check size={14}/>}
                    </span>
                    <div className="min-w-0">
                        <p className="font-medium">{questao.enunciado}</p>
                        {questao.respostaAluno && (
                            <p className="text-slate-500">Resposta do aluno: {questao.respostaAluno}</p>
                        )}
                        {questao.correta === false && questao.respostaCorreta && (
                            <p className="text-emerald-600">Correta: {questao.respostaCorreta}</p>
                        )}
                    </div>
                </li>
            ))}
        </ul>
    );
}

// Comentário opcional: o professor só escreve se quiser; pode editar depois
function ComentarioAtividade({atividade, turmaId, aoSalvar}: {
    atividade: AtividadeDoAluno;
    turmaId: number;
    aoSalvar: (salvo: ComentarioSalvo) => void;
}) {
    const [editando, setEditando] = useState(false);
    const [texto, setTexto] = useState(atividade.comentario ?? "");
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);

    async function salvar() {
        setSalvando(true);
        setErro(null);

        try {
            const resposta = await apiFetch(`/turmas/${turmaId}/resultados/${atividade.resultadoId}/comentario`, {
                method: "PUT",
                body: JSON.stringify({texto}),
            });

            if (!resposta.ok) {
                setErro((await lerErro(resposta, "Não foi possível salvar o comentário.")).mensagem);
                return;
            }

            aoSalvar(await resposta.json());
            setEditando(false);
        } catch {
            setErro("Não foi possível conectar ao servidor.");
        } finally {
            setSalvando(false);
        }
    }

    if (!editando) {
        return (
            <div className="mt-4 border-t pt-4">
                {atividade.comentario ? (
                    <div className="rounded-lg bg-indigo-50 p-3 text-sm">
                        <p className="mb-1 flex items-center gap-1 text-xs font-semibold text-indigo-600">
                            <MessageSquare size={14}/> Comentário de {atividade.comentadoPor}
                        </p>
                        <p className="whitespace-pre-line text-slate-700">{atividade.comentario}</p>
                    </div>
                ) : null}
                <button
                    type="button"
                    onClick={() => {
                        setTexto(atividade.comentario ?? "");
                        setEditando(true);
                    }}
                    className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline"
                >
                    <MessageSquare size={14}/> {atividade.comentario ? "Editar comentário" : "Adicionar comentário"}
                </button>
            </div>
        );
    }

    return (
        <div className="mt-4 border-t pt-4">
            <label className="mb-1 block text-sm font-medium" htmlFor={`comentario-${atividade.resultadoId}`}>
                Comentário para o aluno
            </label>
            <textarea
                id={`comentario-${atividade.resultadoId}`}
                value={texto}
                onChange={(evento) => setTexto(evento.target.value)}
                maxLength={1000}
                rows={3}
                className="w-full rounded-lg border border-slate-200 p-3 text-sm"
                placeholder="Ex.: Ótimo trabalho! Revise a questão 3."
            />
            <p className="text-right text-xs text-slate-400">{texto.length} / 1000</p>
            {erro && <p className="text-sm text-red-600">{erro}</p>}
            <div className="mt-2 flex gap-2">
                <button
                    type="button"
                    onClick={salvar}
                    disabled={salvando || texto.trim() === ""}
                    className="rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                    {salvando ? "Salvando..." : "Salvar"}
                </button>
                <button
                    type="button"
                    onClick={() => setEditando(false)}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                >
                    Cancelar
                </button>
            </div>
        </div>
    );
}

// Cartão de resumo, no mesmo estilo da tela da turma
function Cartao({icone: Icone, valor, rotulo}: { icone: LucideIcon; valor: number | string; rotulo: string }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Icone size={22} className="mb-2 text-indigo-500"/>
            <p className="text-2xl font-semibold">{valor}</p>
            <p className="text-sm text-slate-400">{rotulo}</p>
        </div>
    );
}

export default DesempenhoAluno;