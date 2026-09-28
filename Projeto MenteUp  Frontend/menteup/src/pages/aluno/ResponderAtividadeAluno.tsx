import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {apiFetch, lerErro} from "../../services/api";

interface AlternativaResponse {
    id: number;
    texto: string;
}

interface PerguntaResponse {
    id: number;
    texto: string;
    alternativas: AlternativaResponse[];
}

interface UsuarioResponse {
    id: number;
    nome: string;
}

interface TurmaResponse {
    id: number;
    nome: string;
}

interface AtividadeResponse {
    id: number;
    titulo: string;
    descricao: string;
    turma: TurmaResponse;
    pontuacao: number;
    status: "PENDENTE" | "EM_ANDAMENTO" | "CONCLUIDO";
    usuario: UsuarioResponse | null;
    dataCriacao?: string;
}

interface ResultadoAtividadeResponse {
    atividadeId: number;
    titulo: string;
    totalQuestoes: number;
    acertos: number;
    pontuacao: number;
}

interface RespostaProgressoResponse {
    perguntaId: number;
    alternativaId: number;
}

interface ProgressoAtividadeResponse {
    percentualConclusao: number;
    respondidas: number;
    totalQuestoes: number;
    respostas: RespostaProgressoResponse[];
}

interface QuestionarioResponse {
    atividade: AtividadeResponse;
    perguntas: PerguntaResponse[];
    meuResultado: ResultadoAtividadeResponse | null;
    meuProgresso: ProgressoAtividadeResponse | null;
}

function VisualizarAtividadeAluno() {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();

    //const [atividade, setAtividade] = useState<Atividade | null>(null);
    const [questionario, setQuestionario] = useState<QuestionarioResponse | null>(null);
    const atividade = questionario?.atividade;
    const meuResultado = questionario?.meuResultado ?? null;
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [respostas, setRespostas] = useState<Record<number, number>>({});
    //const [recarregar, setRecarregar] = useState(0);

    const enviada = meuResultado !== null;
    const encerrada = atividade?.status === "CONCLUIDO";
    const podeResponder = atividade?.status === "EM_ANDAMENTO" && !enviada;
    const percentualConclusao = questionario?.meuProgresso?.percentualConclusao ?? 0;

    useEffect(() => {
        const buscarAtividade = async () => {
            try {
                const usuarioSalvo = localStorage.getItem("usuario");

                if (!usuarioSalvo) {
                    navigate("/login");
                    return;
                }

                if (!id) {
                    setErro("ID da atividade não informado.");
                    return;
                }

                const response = await apiFetch(`/atividades/${id}`);

                if (!response.ok) {
                    const erroApi = await lerErro(response, "Atividade não encontrada.");
                    setErro(erroApi.mensagem);
                    return
                }

                const dados: QuestionarioResponse = await response.json();

                setErro("");
                setQuestionario(dados);

                if (dados.meuProgresso) {
                    const respostasSalvas: Record<number, number> = {};

                    dados.meuProgresso.respostas.forEach((resposta) => {
                        respostasSalvas[resposta.perguntaId] =
                            resposta.alternativaId;
                    });
                    setRespostas(respostasSalvas);
                } else {
                    setRespostas({});
                }

            } catch (error) {
                console.error("Error ao buscar atividade:", error);
                setErro("Não foi possivel carregar a atividade.");
            } finally {
                setCarregando(false);
            }
        };
        buscarAtividade();
    }, [id, navigate]);

    async function selecionarResposta(
        perguntaId: number,
        alternativaId: number
    ) {
        if (!podeResponder || !id) {
            return;
        }

        setRespostas((atuais) => ({
            ...atuais, [perguntaId]: alternativaId,
        }));

        try {
            const resposta = await apiFetch(`/atividades/${id}/progresso`, {
                    method: "PUT",
                    body: JSON.stringify({
                        perguntaId,
                        alternativaId,
                    }),
                }
            );

            if (!resposta.ok) {
                const erroApi = await lerErro(
                    resposta,
                    "Não foi possivel salvar sua resposta."
                );
                setErro(erroApi.mensagem);
            }
        } catch (error) {
            console.error(
                "Erro ao salvar o seu progresso",
                error
            );

            setErro(
                "Não foi possivel salvar sua resposta."
            );
        }
    }

    async function finalizarAtividade() {
        if (!questionario || !atividade || !id || !podeResponder) return;

        const faltando = questionario.perguntas.some(
            (pergunta) => respostas[pergunta.id] === undefined
        );

        if (faltando) {
            setErro("Responda todas as perguntas antes de finalizar.");
            return;
        }

        try {
            setErro("");

            const resposta = await apiFetch(`/atividades/${id}/respostas`, {
                method: "POST",

            });

            if (!resposta.ok) {
                const erroApi = await lerErro(resposta, "Não foi possivel concluir a atividade");

                setErro(erroApi.mensagem);
                return;
            }
            const resultadoApi: ResultadoAtividadeResponse = await resposta.json();

            setQuestionario((atual) =>
                atual ? {
                    ...atual,
                    meuResultado: resultadoApi,
                    meuProgresso: null,
                } : atual
            );

        } catch (error) {
            console.error("Erro ao concluir atividade:", error);
            setErro("Não foi possivel concluir a atividade.");
        }
    }

    /* ==============================
       CARREGANDO
    ============================== */
    if (carregando) {
        return (
            <div className="mu-dashboard">
                <main className="mu-main">
                    <div className="mu-content">
                        <div className="mu-card mu-empty">
                            <div className="mu-empty-icon">⏳</div>

                            <h3>Carregando atividade...</h3>

                            <p>Aguarde enquanto buscamos os dados.</p>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    /* ==============================
       ERRO
    ============================== */

    if (!atividade) {
        return (
            <div className="mu-dashboard">
                <main className="mu-main">
                    <div className="mu-content">
                        <div className="mu-card mu-empty">
                            <div className="mu-empty-icon">⚠️</div>

                            <h3>Atividade não encontrada</h3>

                            <p>
                                {erro || "Não foi possível encontrar esta atividade."}
                            </p>

                            <button
                                className="mu-btn mu-btn-primary"
                                onClick={() => navigate("/aluno/atividades")}
                            >
                                ← Voltar para atividades
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    /* ==============================
       TELA DE VISUALIZAÇÃO
    ============================== */

    return (
        <div className="mu-dashboard">
            <main className="mu-main">

                {/* HEADER */}

                <header className="mu-header">
                    <input
                        className="mu-search"
                        type="text"
                        placeholder="Pesquisar..."
                    />

                    <div className="mu-header-user">
                        <div className="mu-avatar">
                            PE
                        </div>

                        <span className="mu-user-name">
              Aluno
            </span>
                    </div>
                </header>

                {/* CONTEÚDO */}

                <div className="mu-content">

                    {/* VOLTAR */}

                    <button
                        className="mu-btn mu-btn-secondary"
                        onClick={() =>
                            navigate("/aluno/atividades")
                        }
                    >
                        ← Voltar
                    </button>

                    {/* CABEÇALHO */}

                    <div className="mu-view-header">

                        <div>
              <span className="mu-view-label">
                ATIVIDADE
              </span>

                            <h1>
                                {atividade.titulo}
                            </h1>

                            <p>
                                {atividade.descricao}
                            </p>
                        </div>

                        <div className="mu-view-status">

              <span
                  className={`mu-badge ${
                      enviada
                          ? "mu-status-concluida"
                          : encerrada
                              ? "mu-status-rascunho"
                              : "mu-status-andamento"
                  }`}
              >
                {enviada ? "CONCLUIDA"
                    : encerrada ? "ENCERRADA"
                        : percentualConclusao > 0 ? "EM_ANDAMENTO"
                            : "PENDENTE"}
              </span>

                        </div>

                    </div>

                    {/* INFORMAÇÕES */}

                    <div className="mu-info-grid">

                        <div className="mu-info-card">
                            <span>🏆</span>

                            <div>
                                <small>Pontuação</small>

                                <strong>
                                    {atividade.pontuacao} pontos
                                </strong>
                            </div>
                        </div>

                        <div className="mu-info-card">
                            <span>🏫</span>

                            <div>
                                <small>Turma</small>

                                <strong>
                                    {atividade.turma?.nome ||
                                        "Não informada"}
                                </strong>
                            </div>
                        </div>

                        <div className="mu-info-card">
                            <span>📝</span>

                            <div>
                                <small>Perguntas</small>

                                <strong>
                                    {questionario.perguntas?.length || 0}
                                </strong>
                            </div>
                        </div>

                    </div>

                    {podeResponder && (
                        <div className="mb-6 bg-white rounded-xl p-5 border border-gray-100 shadow-sm">

                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-semibold text-gray-700">
                                    Progresso da atividade
                                </span>

                                <span className="text-sm font-bold text-[#5b4cff]">
                                    {percentualConclusao}%
                                </span>
                            </div>

                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[#5b4cff] transition-all"
                                    style={{
                                        width: `${percentualConclusao}%`
                                    }}
                                />
                            </div>

                        </div>
                    )}

                    {/* PERGUNTAS */}

                    <div className="mu-card mu-questions-card">

                        <div className="mu-section-header">

                            <div>
                                <h2>
                                    Perguntas da atividade
                                </h2>

                                <p>
                                    Responda todas as perguntas e finalize para
                                    visualizar seu resultado.
                                </p>
                            </div>

                        </div>

                        {questionario.perguntas?.length === 0 ? (

                            <div className="mu-empty">

                                <div className="mu-empty-icon">
                                    📝
                                </div>

                                <h3>
                                    Nenhuma pergunta cadastrada
                                </h3>

                                <p>
                                    Esta atividade ainda não possui
                                    perguntas.
                                </p>

                            </div>

                        ) : (

                            <div className="mu-question-list">

                                {questionario.perguntas.map(
                                    (pergunta, index) => (

                                        <div

                                            className="mu-question"
                                            key={pergunta.id}
                                        >

                                            <div className="mu-question-number">
                                                {index + 1}
                                            </div>

                                            <div className="mu-question-content">

                                                <h3>
                                                    {pergunta.texto}
                                                </h3>

                                                <div className="mu-alternatives">

                                                    {pergunta.alternativas?.map(
                                                        (alternativa) => (

                                                            <button
                                                                type="button"
                                                                className={`mu-alternative ${
                                                                    respostas[pergunta.id] === alternativa.id
                                                                        ? "selected"
                                                                        : ""
                                                                }`}
                                                                key={alternativa.id}
                                                                onClick={() =>
                                                                    selecionarResposta(
                                                                        pergunta.id,
                                                                        alternativa.id
                                                                    )
                                                                }
                                                                disabled={!podeResponder}
                                                            >

                                <span className="mu-alternative-letter">
                                  •
                                </span>

                                                                <span>
                                  {alternativa.texto}
                                </span>

                                                            </button>

                                                        )
                                                    )}

                                                </div>

                                            </div>

                                        </div>

                                    )
                                )}

                            </div>

                        )}
                        {erro && (
                            <div className="mu-error">
                                {erro}
                            </div>
                        )}

                        {podeResponder && questionario.perguntas?.length > 0 && (
                            <button
                                type="button"
                                className="mu-finish-button"
                                onClick={finalizarAtividade}
                            >
                                Finalizar atividade
                            </button>
                        )}

                        {podeResponder && (
                            <button
                                type="button"
                                className="mu-btn mu-btn-secondary"
                                onClick={() =>
                                    navigate("/aluno/atividades")
                                }
                            >
                                Sair da atividade
                            </button>
                        )}

                        {meuResultado && (
                            <div className="mu-success">
                                Atividade concluída. Você acertou {meuResultado.acertos} de{" "}
                                {meuResultado.totalQuestoes} pergunta(s) e fez{" "}
                                {meuResultado.pontuacao} ponto(s). Não é possível responder
                                novamente.
                            </div>
                        )}

                        {encerrada && !enviada && (
                            <div className="mu-error">
                                Esta atividade foi encerrada pelo professor e não aceita mais
                                respostas.
                            </div>
                        )}

                    </div>

                </div>

            </main>
        </div>
    );
}

export default VisualizarAtividadeAluno;