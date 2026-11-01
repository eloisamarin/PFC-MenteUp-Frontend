import {useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {ArrowLeft, Check, Hourglass, X} from "lucide-react";
import LayoutPainel from "../../components/LayoutPainel";
import {BarraTempo, TabelaRanking} from "../../components/ComponentesDesafio";
import {useEstadoDesafio} from "../../hooks/useEstadoDesafio";
import {apiFetch, lerErro} from "../../services/api";
import {CORES_ALTERNATIVA, LETRAS_ALTERNATIVA, contagem, usuarioLogado} from "../../services/turmaDesafio";

interface Escolha {
    perguntaId: number;
    alternativaId: number;
}

function JogarDesafio() {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();

    const {estado, ranking, erro, setErro, carregando, atualizar} = useEstadoDesafio(id);
    const [escolha, setEscolha] = useState<Escolha | null>(null);
    const [enviando, setEnviando] = useState(false);

    const meuId = usuarioLogado().id;
    const minhaPosicao = ranking.find((linha) => linha.usuarioId === meuId);

    async function responder(perguntaId: number, alternativaId: number) {
        try {
            setEnviando(true);
            setErro("");
            setEscolha({perguntaId, alternativaId});

            const resposta = await apiFetch(`/desafios/${id}/respostas`, {
                method: "POST",
                body: JSON.stringify({perguntaId, alternativaId}),
            });

            if (!resposta.ok) {
                const erroApi = await lerErro(resposta, "Não foi possível enviar sua resposta.");
                setErro(erroApi.mensagem);
                setEscolha(null);
                return;
            }

            await atualizar();
        } catch (error) {
            console.error("Erro ao responder o desafio:", error);
            setErro("Não foi possível enviar sua resposta.");
            setEscolha(null);
        } finally {
            setEnviando(false);
        }
    }

    const voltar = (
        <button onClick={() => navigate("/aluno/desafios")} className="mb-4 flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800">
            <ArrowLeft size={16}/> Voltar para desafios
        </button>
    );

    if (carregando) {
        return (
            <LayoutPainel perfil="ALUNO">
                <p className="py-12 text-center text-sm text-slate-400">Carregando desafio...</p>
            </LayoutPainel>
        );
    }

    if (!estado) {
        return (
            <LayoutPainel perfil="ALUNO">
                {voltar}
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                    {erro || "Desafio não encontrado."}
                </div>
            </LayoutPainel>
        );
    }

    const {pergunta, status} = estado;
    const encerrada = estado.perguntaEncerrada === true;
    const escolhidaAgora = escolha && escolha.perguntaId === pergunta?.id ? escolha.alternativaId : null;
    const minhaAlternativa = estado.minhaAlternativaId ?? escolhidaAgora;
    const respondeu = minhaAlternativa !== null;
    const acertou = respondeu && minhaAlternativa === estado.alternativaCorretaId;

    return (
        <LayoutPainel perfil="ALUNO">
            {voltar}

            <h1 className="mb-6 text-2xl font-semibold">{estado.titulo}</h1>

            {erro && (
                <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">{erro}</div>
            )}

            {status === "AGUARDANDO" && (
                <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                    <Hourglass size={36} className="mx-auto mb-3 animate-pulse text-indigo-400"/>
                    <h2 className="text-lg font-semibold">Aguardando o professor iniciar</h2>
                    <p className="mt-1 text-sm text-slate-400">
                        Total: {contagem(estado.totalPerguntas, "pergunta", "perguntas")}. Fique nesta tela: o desafio começa sozinho.
                    </p>
                </div>
            )}

            {status === "EM_ANDAMENTO" && pergunta && (
                <div className="mx-auto max-w-3xl space-y-6">
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="mb-4 text-sm text-slate-500">
                            Pergunta {estado.numeroPergunta} de {estado.totalPerguntas}
                        </p>

                        {!encerrada && (
                            <BarraTempo restantes={estado.segundosRestantes ?? 0} total={pergunta.tempoSegundos}/>
                        )}

                        <h2 className="mt-5 mb-5 text-xl font-semibold">{pergunta.enunciado}</h2>

                        <div className="grid gap-3 sm:grid-cols-2">
                            {pergunta.alternativas.map((alternativa, indice) => {
                                const escolhida = alternativa.id === minhaAlternativa;
                                const correta = alternativa.id === estado.alternativaCorretaId;
                                const apagada = encerrada ? !correta && !escolhida : respondeu && !escolhida;

                                return (
                                    <button
                                        key={alternativa.id}
                                        type="button"
                                        onClick={() => responder(pergunta.id, alternativa.id)}
                                        disabled={respondeu || encerrada || enviando}
                                        aria-pressed={escolhida}
                                        className={`flex min-h-16 items-center gap-3 rounded-lg p-4 text-left font-medium text-white transition enabled:hover:brightness-110 ${CORES_ALTERNATIVA[indice]} ${
                                            apagada ? "opacity-40" : ""
                                        } ${escolhida ? "ring-4 ring-slate-800 ring-offset-2" : ""}`}
                                    >
                                        <span className="font-bold">{LETRAS_ALTERNATIVA[indice]}</span>
                                        <span className="min-w-0 flex-1 break-words">{alternativa.texto}</span>
                                        {encerrada && correta && <Check size={20} aria-label="Alternativa correta"/>}
                                        {encerrada && escolhida && !correta && <X size={20} aria-label="Sua resposta incorreta"/>}
                                    </button>
                                );
                            })}
                        </div>

                        {!encerrada && respondeu && (
                            <p className="mt-5 text-center text-sm text-slate-500">
                                Resposta enviada! Aguarde o fim da pergunta.
                            </p>
                        )}

                        {encerrada && (
                            <div className={`mt-5 rounded-lg p-4 text-center font-semibold ${
                                acertou ? "bg-green-50 text-green-800" : "bg-slate-100 text-slate-700"
                            }`}>
                                {!respondeu
                                    ? "O tempo acabou e você não respondeu."
                                    : acertou
                                        ? `Você acertou e ganhou ${estado.meusPontos ?? 0} pontos!`
                                        : "Não foi desta vez."}
                                <p className="mt-1 text-sm font-normal">Aguarde o professor avançar.</p>
                            </div>
                        )}
                    </div>

                    {encerrada && (
                        <TabelaRanking ranking={ranking} destaqueUsuarioId={meuId} titulo="Ranking parcial"/>
                    )}
                </div>
            )}

            {status === "ENCERRADO" && (
                <div className="mx-auto max-w-3xl space-y-6">
                    <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                        <h2 className="text-xl font-semibold">Desafio encerrado</h2>
                        <p className="mt-2 text-sm text-slate-500">
                            {minhaPosicao
                                ? `Você ficou em ${minhaPosicao.posicao}º lugar, com ${minhaPosicao.pontos} pontos.`
                                : "Você não respondeu a este desafio."}
                        </p>
                    </div>

                    <TabelaRanking ranking={ranking} destaqueUsuarioId={meuId} titulo="Ranking final"/>
                </div>
            )}
        </LayoutPainel>
    );
}

export default JogarDesafio;
