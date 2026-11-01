import {useEffect, useState, type FormEvent} from "react";
import {useNavigate, useParams, useSearchParams} from "react-router-dom";
import {ArrowLeft, Plus, Trash2} from "lucide-react";
import LayoutPainel from "../../components/LayoutPainel";
import {apiFetch, lerErro} from "../../services/api";
import {ROTA_BASE, type PerfilGestao, type TurmaResumo} from "../../services/turmaDesafio";

const TEMPO_PADRAO = 30;
const TEMPO_MINIMO = 5;
const TEMPO_MAXIMO = 300;
const MAXIMO_ALTERNATIVAS = 4;
const MINIMO_ALTERNATIVAS = 2;

interface PerguntaForm {
    enunciado: string;
    tempoSegundos: number;
    alternativas: string[];
    indiceCorreta: number | null;
}

interface PerguntaEdicao {
    enunciado: string;
    tempoSegundos: number;
    alternativas: { texto: string; correta: boolean }[];
}

function novaPergunta(): PerguntaForm {
    return {enunciado: "", tempoSegundos: TEMPO_PADRAO, alternativas: ["", ""], indiceCorreta: null};
}

function paraFormulario(pergunta: PerguntaEdicao): PerguntaForm {
    const indiceCorreta = pergunta.alternativas.findIndex((alternativa) => alternativa.correta);

    return {
        enunciado: pergunta.enunciado,
        tempoSegundos: pergunta.tempoSegundos,
        alternativas: pergunta.alternativas.map((alternativa) => alternativa.texto),
        indiceCorreta: indiceCorreta === -1 ? null : indiceCorreta,
    };
}

function validar(titulo: string, descricao: string, turmaId: string, perguntas: PerguntaForm[]): string | null {
    if (titulo.trim().length < 5) return "O título deve ter no mínimo 5 caracteres.";
    if (descricao.trim().length < 10) return "A descrição deve ter no mínimo 10 caracteres.";
    if (!turmaId) return "Selecione a turma do desafio.";

    for (const [indice, pergunta] of perguntas.entries()) {
        const numero = indice + 1;

        if (!pergunta.enunciado.trim()) return `Escreva o enunciado da pergunta ${numero}.`;
        if (!(pergunta.tempoSegundos >= TEMPO_MINIMO && pergunta.tempoSegundos <= TEMPO_MAXIMO)) {
            return `O tempo da pergunta ${numero} deve ficar entre ${TEMPO_MINIMO} e ${TEMPO_MAXIMO} segundos.`;
        }
        if (pergunta.alternativas.some((alternativa) => !alternativa.trim())) {
            return `Preencha todas as alternativas da pergunta ${numero}.`;
        }
        if (pergunta.indiceCorreta === null) return `Marque a alternativa correta da pergunta ${numero}.`;
    }

    return null;
}

function CriarDesafio({perfil}: { perfil: PerfilGestao }) {
    const navigate = useNavigate();
    const [parametros] = useSearchParams();
    const {id} = useParams();
    const editando = id !== undefined;
    const base = ROTA_BASE[perfil];

    const [turmas, setTurmas] = useState<TurmaResumo[]>([]);
    const [titulo, setTitulo] = useState("");
    const [descricao, setDescricao] = useState("");
    const [turmaId, setTurmaId] = useState(parametros.get("turma") ?? "");
    const [perguntas, setPerguntas] = useState<PerguntaForm[]>([novaPergunta()]);
    const [erro, setErro] = useState("");
    const [salvando, setSalvando] = useState(false);
    const [carregando, setCarregando] = useState(editando);
    const [erroCarregamento, setErroCarregamento] = useState("");

    useEffect(() => {
        if (!editando) return;

        async function carregarDesafio() {
            try {
                const resposta = await apiFetch(`/desafios/${id}/edicao`);

                if (!resposta.ok) {
                    const erroApi = await lerErro(resposta, "Não foi possível carregar o desafio.");
                    setErroCarregamento(erroApi.mensagem);
                    return;
                }

                const desafio = await resposta.json();
                setTitulo(desafio.titulo);
                setDescricao(desafio.descricao);
                setTurmaId(String(desafio.turmaId));
                setPerguntas(desafio.perguntas.map(paraFormulario));
            } catch (error) {
                console.error("Erro ao carregar desafio:", error);
                setErroCarregamento("Não foi possível carregar o desafio.");
            } finally {
                setCarregando(false);
            }
        }

        carregarDesafio();
    }, [editando, id]);

    useEffect(() => {
        async function carregarTurmas() {
            try {
                const resposta = await apiFetch("/turmas/all");
                if (!resposta.ok) throw new Error("Falha ao consultar as turmas.");
                setTurmas(await resposta.json());
            } catch (error) {
                console.error("Erro ao carregar turmas:", error);
                setErro("Não foi possível carregar as turmas.");
            }
        }

        carregarTurmas();
    }, []);

    function alterarPergunta(indice: number, alteracao: Partial<PerguntaForm>) {
        setPerguntas((atuais) => atuais.map((pergunta, i) =>
            i === indice ? {...pergunta, ...alteracao} : pergunta
        ));
    }

    function alterarAlternativa(indicePergunta: number, indiceAlternativa: number, texto: string) {
        const pergunta = perguntas[indicePergunta];

        alterarPergunta(indicePergunta, {
            alternativas: pergunta.alternativas.map((atual, i) => i === indiceAlternativa ? texto : atual),
        });
    }

    function removerAlternativa(indicePergunta: number, indiceAlternativa: number) {
        const pergunta = perguntas[indicePergunta];
        const correta = pergunta.indiceCorreta;

        alterarPergunta(indicePergunta, {
            alternativas: pergunta.alternativas.filter((_, i) => i !== indiceAlternativa),
            indiceCorreta: correta === null || correta === indiceAlternativa
                ? null
                : correta > indiceAlternativa ? correta - 1 : correta,
        });
    }

    async function salvar(event: FormEvent) {
        event.preventDefault();

        const mensagemFalha = `Não foi possível ${editando ? "salvar" : "criar"} o desafio.`;

        const problema = validar(titulo, descricao, turmaId, perguntas);

        if (problema) {
            setErro(problema);
            return;
        }

        try {
            setSalvando(true);
            setErro("");

            const resposta = await apiFetch(editando ? `/desafios/${id}` : "/desafios", {
                method: editando ? "PUT" : "POST",
                body: JSON.stringify({
                    titulo: titulo.trim(),
                    descricao: descricao.trim(),
                    turmaId: Number(turmaId),
                    perguntas: perguntas.map((pergunta) => ({
                        enunciado: pergunta.enunciado.trim(),
                        tempoSegundos: pergunta.tempoSegundos,
                        alternativas: pergunta.alternativas.map((texto, indice) => ({
                            texto: texto.trim(),
                            correta: indice === pergunta.indiceCorreta,
                        })),
                    })),
                }),
            });

            if (!resposta.ok) {
                const erroApi = await lerErro(resposta, mensagemFalha);
                const primeiroCampo = erroApi.campos && Object.values(erroApi.campos)[0];
                setErro(primeiroCampo ?? erroApi.mensagem);
                return;
            }

            navigate(`${base}/desafios`);
        } catch (error) {
            console.error("Erro ao salvar desafio:", error);
            setErro(mensagemFalha);
        } finally {
            setSalvando(false);
        }
    }

    const classeCampo = "w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-300";

    return (
        <LayoutPainel perfil={perfil}>
            <button onClick={() => navigate(`${base}/desafios`)} className="mb-4 flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800">
                <ArrowLeft size={16}/> Voltar para desafios
            </button>

            <h1 className="mb-6 text-2xl font-semibold">{editando ? "Editar desafio" : "Criar desafio"}</h1>

            {carregando ? (
                <p className="py-12 text-center text-sm text-slate-400">Carregando desafio...</p>
            ) : erroCarregamento ? (
                <div className="max-w-3xl rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">{erroCarregamento}</div>
            ) : (
            <form onSubmit={salvar} className="max-w-3xl space-y-6">

                <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <label className="block text-sm font-medium">
                        Título
                        <input value={titulo} onChange={(event) => setTitulo(event.target.value)} maxLength={100} className={`mt-1 ${classeCampo}`}/>
                    </label>

                    <label className="block text-sm font-medium">
                        Descrição
                        <textarea value={descricao} onChange={(event) => setDescricao(event.target.value)} maxLength={1000} rows={3} className={`mt-1 ${classeCampo}`}/>
                    </label>

                    <label className="block text-sm font-medium">
                        Turma
                        <select value={turmaId} onChange={(event) => setTurmaId(event.target.value)} className={`mt-1 bg-white ${classeCampo}`}>
                            <option value="">Selecione uma turma</option>
                            {turmas.map((turma) => (
                                <option key={turma.id} value={turma.id}>{turma.nome}</option>
                            ))}
                        </select>
                    </label>
                </div>

                {perguntas.map((pergunta, indice) => (
                    <fieldset key={indice} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="mb-3 flex items-center justify-between">
                            <legend className="font-semibold">Pergunta {indice + 1}</legend>
                            {perguntas.length > 1 && (
                                <button
                                    type="button"
                                    title="Remover pergunta"
                                    onClick={() => setPerguntas((atuais) => atuais.filter((_, i) => i !== indice))}
                                    className="rounded p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                                >
                                    <Trash2 size={17}/>
                                </button>
                            )}
                        </div>

                        <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
                            <label className="block text-sm font-medium">
                                Enunciado
                                <input
                                    value={pergunta.enunciado}
                                    onChange={(event) => alterarPergunta(indice, {enunciado: event.target.value})}
                                    maxLength={255}
                                    className={`mt-1 ${classeCampo}`}
                                />
                            </label>
                            <label className="block text-sm font-medium">
                                Tempo (s)
                                <input
                                    type="number"
                                    min={TEMPO_MINIMO}
                                    max={TEMPO_MAXIMO}
                                    value={pergunta.tempoSegundos}
                                    onChange={(event) => alterarPergunta(indice, {tempoSegundos: Number(event.target.value)})}
                                    className={`mt-1 ${classeCampo}`}
                                />
                            </label>
                        </div>

                        <p className="mt-4 mb-2 text-sm font-medium">Alternativas (marque a correta)</p>

                        <div className="space-y-2">
                            {pergunta.alternativas.map((alternativa, indiceAlternativa) => (
                                <div key={indiceAlternativa} className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name={`correta-${indice}`}
                                        checked={pergunta.indiceCorreta === indiceAlternativa}
                                        onChange={() => alterarPergunta(indice, {indiceCorreta: indiceAlternativa})}
                                        aria-label={`Alternativa ${indiceAlternativa + 1} é a correta`}
                                        className="h-4 w-4 accent-indigo-600"
                                    />
                                    <input
                                        value={alternativa}
                                        onChange={(event) => alterarAlternativa(indice, indiceAlternativa, event.target.value)}
                                        placeholder={`Alternativa ${indiceAlternativa + 1}`}
                                        aria-label={`Texto da alternativa ${indiceAlternativa + 1}`}
                                        className={classeCampo}
                                    />
                                    {pergunta.alternativas.length > MINIMO_ALTERNATIVAS && (
                                        <button
                                            type="button"
                                            title="Remover alternativa"
                                            onClick={() => removerAlternativa(indice, indiceAlternativa)}
                                            className="rounded p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                                        >
                                            <Trash2 size={16}/>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {pergunta.alternativas.length < MAXIMO_ALTERNATIVAS && (
                            <button
                                type="button"
                                onClick={() => alterarPergunta(indice, {alternativas: [...pergunta.alternativas, ""]})}
                                className="mt-3 flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:underline"
                            >
                                <Plus size={15}/> Adicionar alternativa
                            </button>
                        )}
                    </fieldset>
                ))}

                <button
                    type="button"
                    onClick={() => setPerguntas((atuais) => [...atuais, novaPergunta()])}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 py-3 text-sm font-semibold text-slate-500 hover:border-indigo-300 hover:text-indigo-600"
                >
                    <Plus size={17}/> Adicionar pergunta
                </button>

                {erro && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">{erro}</div>
                )}

                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => navigate(`${base}/desafios`)}
                        className="rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={salvando}
                        className="rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
                    >
                        {salvando ? "Salvando..." : editando ? "Salvar alterações" : "Salvar desafio"}
                    </button>
                </div>
            </form>
            )}
        </LayoutPainel>
    );
}

export default CriarDesafio;
