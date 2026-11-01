import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {apiFetch, lerErro} from "../../services/api";

interface Turma {
    id: number;
    nome: string;
}

interface Alternativa {
    id?: number;
    texto: string;
    correta?: boolean;
}

interface Pergunta {
    id?: number;
    // O backend pode devolver "texto" (formato novo) ou "enunciado" (formato antigo)
    texto?: string;
    enunciado?: string;
    alternativas: Alternativa[];
}

interface Atividade {
    id: number;
    titulo: string;
    descricao: string;
    pontuacao: number;
    status: string;
    turma?: Turma;
    perguntas: Pergunta[];
}

// Modelo usado pelo editor de perguntas (sempre com "enunciado")
interface AlternativaEditavel {
    id?: number;
    texto: string;
    correta: boolean;
}

interface PerguntaEditavel {
    id?: number;
    enunciado: string;
    alternativas: AlternativaEditavel[];
}

// GET /atividades/{id} devolve { atividade, perguntas, ... }.
// Aceitamos também o formato antigo (atividade com perguntas dentro).
interface QuestionarioResponse {
    atividade?: Atividade;
    perguntas?: Pergunta[];
}

function EditarAtividadeProfessor() {
    const {id} = useParams();
    const navigate = useNavigate();

    const [atividade, setAtividade] = useState<Atividade | null>(null);
    const [turmas, setTurmas] = useState<Turma[]>([]);

    const [titulo, setTitulo] = useState("");
    const [descricao, setDescricao] = useState("");
    const [pontuacao, setPontuacao] = useState<number>(1);
    const [status, setStatus] = useState("PENDENTE");
    const [turmaId, setTurmaId] = useState<number | "">("");

    const [perguntas, setPerguntas] = useState<PerguntaEditavel[]>([]);
    const [perguntasAlteradas, setPerguntasAlteradas] = useState(false);

    const [loading, setLoading] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");

    /*
     * =====================================================
     * CARREGAR ATIVIDADE
     * =====================================================
     */

    useEffect(() => {
        const carregarAtividade = async () => {
            try {
                if (!id) {
                    setErro("ID da atividade não informado.");
                    return;
                }

                const response = await apiFetch(`/atividades/${id}`);

                if (!response.ok) {
                    const erroApi = await lerErro(
                        response,
                        "Não foi possível carregar a atividade."
                    );
                    throw new Error(erroApi.mensagem);
                }

                const dados: QuestionarioResponse & Atividade =
                    await response.json();

                const base: Atividade = dados.atividade ?? dados;
                const perguntas: Pergunta[] =
                    dados.perguntas ?? base.perguntas ?? [];

                const data: Atividade = {...base, perguntas};

                setAtividade(data);

                setPerguntas(
                    perguntas.map((pergunta) => ({
                        id: pergunta.id,
                        enunciado: pergunta.texto ?? pergunta.enunciado ?? "",
                        alternativas: (pergunta.alternativas ?? []).map(
                            (alternativa) => ({
                                id: alternativa.id,
                                texto: alternativa.texto ?? "",
                                correta: alternativa.correta === true,
                            })
                        ),
                    }))
                );
                setPerguntasAlteradas(false);

                setTitulo(data.titulo || "");
                setDescricao(data.descricao || "");
                setPontuacao(data.pontuacao || 1);
                setStatus(data.status || "PENDENTE");
                setTurmaId(data.turma?.id ?? "");
            } catch (error) {
                console.error(error);
                setErro(
                    error instanceof Error
                        ? error.message
                        : "Não foi possível carregar a atividade."
                );
            } finally {
                setLoading(false);
            }
        };

        carregarAtividade();
    }, [id, navigate]);

    /*
     * =====================================================
     * CARREGAR TURMAS
     * =====================================================
     */

    useEffect(() => {
        const carregarTurmas = async () => {
            try {
                const response = await apiFetch("/turmas/all");

                if (!response.ok) {
                    throw new Error("Erro ao carregar turmas.");
                }

                const data = await response.json();

                setTurmas(data);
            } catch (error) {
                console.error("Erro ao carregar turmas:", error);
            }
        };

        carregarTurmas();
    }, []);

    /*
     * =====================================================
     * EDITOR DE PERGUNTAS
     * =====================================================
     */

    const alterarPerguntas = (
        atualizar: (atuais: PerguntaEditavel[]) => PerguntaEditavel[]
    ) => {
        setPerguntas(atualizar);
        setPerguntasAlteradas(true);
    };

    const adicionarPergunta = () => {
        alterarPerguntas((atuais) => [
            ...atuais,
            {
                enunciado: "",
                alternativas: [
                    {texto: "", correta: false},
                    {texto: "", correta: false},
                ],
            },
        ]);
    };

    const removerPergunta = (perguntaIndex: number) => {
        alterarPerguntas((atuais) =>
            atuais.filter((_, index) => index !== perguntaIndex)
        );
    };

    const atualizarEnunciado = (perguntaIndex: number, valor: string) => {
        alterarPerguntas((atuais) =>
            atuais.map((pergunta, index) =>
                index === perguntaIndex
                    ? {...pergunta, enunciado: valor}
                    : pergunta
            )
        );
    };

    const adicionarAlternativa = (perguntaIndex: number) => {
        alterarPerguntas((atuais) =>
            atuais.map((pergunta, index) =>
                index === perguntaIndex
                    ? {
                        ...pergunta,
                        alternativas: [
                            ...pergunta.alternativas,
                            {texto: "", correta: false},
                        ],
                    }
                    : pergunta
            )
        );
    };

    const removerAlternativa = (
        perguntaIndex: number,
        alternativaIndex: number
    ) => {
        if (perguntas[perguntaIndex].alternativas.length <= 2) {
            setErro("Cada pergunta precisa ter pelo menos 2 alternativas.");
            return;
        }

        setErro("");

        alterarPerguntas((atuais) =>
            atuais.map((pergunta, index) =>
                index === perguntaIndex
                    ? {
                        ...pergunta,
                        alternativas: pergunta.alternativas.filter(
                            (_, i) => i !== alternativaIndex
                        ),
                    }
                    : pergunta
            )
        );
    };

    const atualizarAlternativa = (
        perguntaIndex: number,
        alternativaIndex: number,
        valor: string
    ) => {
        alterarPerguntas((atuais) =>
            atuais.map((pergunta, index) =>
                index === perguntaIndex
                    ? {
                        ...pergunta,
                        alternativas: pergunta.alternativas.map(
                            (alternativa, i) =>
                                i === alternativaIndex
                                    ? {...alternativa, texto: valor}
                                    : alternativa
                        ),
                    }
                    : pergunta
            )
        );
    };

    const marcarRespostaCorreta = (
        perguntaIndex: number,
        alternativaIndex: number
    ) => {
        alterarPerguntas((atuais) =>
            atuais.map((pergunta, index) =>
                index === perguntaIndex
                    ? {
                        ...pergunta,
                        alternativas: pergunta.alternativas.map(
                            (alternativa, i) => ({
                                ...alternativa,
                                correta: i === alternativaIndex,
                            })
                        ),
                    }
                    : pergunta
            )
        );
    };

    const validarPerguntas = (): string | null => {
        if (perguntas.length === 0) {
            return "A atividade precisa ter pelo menos uma pergunta.";
        }

        for (let i = 0; i < perguntas.length; i++) {
            const pergunta = perguntas[i];

            if (!pergunta.enunciado.trim()) {
                return `Informe o enunciado da pergunta ${i + 1}.`;
            }

            if (pergunta.alternativas.length < 2) {
                return `A pergunta ${i + 1} precisa ter pelo menos 2 alternativas.`;
            }

            if (!pergunta.alternativas.some((a) => a.correta)) {
                return `Marque a resposta correta da pergunta ${i + 1}.`;
            }

            for (let j = 0; j < pergunta.alternativas.length; j++) {
                if (!pergunta.alternativas[j].texto.trim()) {
                    return `Preencha a alternativa ${j + 1} da pergunta ${i + 1}.`;
                }
            }
        }

        return null;
    };

    /*
     * =====================================================
     * ATUALIZAR ATIVIDADE
     * =====================================================
     */

    const atualizarAtividade = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        setErro("");
        setSucesso("");

        if (!titulo.trim()) {
            setErro("Informe o título da atividade.");
            return;
        }

        if (titulo.trim().length < 5) {
            setErro("O título deve possuir pelo menos 5 caracteres.");
            return;
        }

        if (!descricao.trim()) {
            setErro("Informe a descrição da atividade.");
            return;
        }

        if (descricao.trim().length < 10) {
            setErro("A descrição deve possuir pelo menos 10 caracteres.");
            return;
        }

        if (pontuacao < 1) {
            setErro("A pontuação deve ser no mínimo 1.");
            return;
        }

        if (turmaId === "") {
            setErro("Selecione uma turma.");
            return;
        }

        if (perguntasAlteradas) {
            const erroPerguntas = validarPerguntas();

            if (erroPerguntas) {
                setErro(erroPerguntas);
                return;
            }
        }

        try {
            setSalvando(true);

            /*
             * Enviamos apenas os dados principais da atividade.
             * As perguntas são gerenciadas em /atividades/{id}/questionario
             * e não devem ir neste PUT (o backend novo não as recebe aqui).
             */

            const atividadeAtualizada = {
                id: Number(id),
                titulo: titulo.trim(),
                descricao: descricao.trim(),
                pontuacao: Number(pontuacao),
                status: status,
                turma: {
                    id: Number(turmaId),
                },
            };

            const response = await apiFetch("/atividades", {
                method: "PUT",
                body: JSON.stringify(atividadeAtualizada),
            });

            if (!response.ok) {
                const erroApi = await lerErro(
                    response,
                    "Não foi possível atualizar a atividade."
                );

                console.error("Erro do backend:", erroApi);

                throw new Error(erroApi.mensagem);
            }

            /*
             * As perguntas só são enviadas se o professor mexeu nelas.
             * Assim, editar apenas título/descrição/etc. nunca depende
             * do endpoint do questionário.
             */

            if (perguntasAlteradas) {
                const respostaQuestionario = await apiFetch(
                    `/atividades/${id}/questionario`,
                    {
                        method: "PUT",
                        body: JSON.stringify({
                            perguntas: perguntas.map((pergunta) => ({
                                id: pergunta.id,
                                enunciado: pergunta.enunciado.trim(),
                                alternativas: pergunta.alternativas.map(
                                    (alternativa) => ({
                                        id: alternativa.id,
                                        texto: alternativa.texto.trim(),
                                        correta: alternativa.correta,
                                    })
                                ),
                            })),
                        }),
                    }
                );

                if (!respostaQuestionario.ok) {
                    const erroApi = await lerErro(
                        respostaQuestionario,
                        "Não foi possível atualizar as perguntas."
                    );

                    console.error("Erro ao salvar perguntas:", erroApi);

                    throw new Error(
                        `Os dados da atividade foram salvos, mas as perguntas não: ${erroApi.mensagem}`
                    );
                }

                setPerguntasAlteradas(false);
            }

            setSucesso("Atividade atualizada com sucesso! 🎉");

            setTimeout(() => {
                navigate(`/professor/atividades/${id}`);
            }, 1000);
        } catch (error) {
            console.error(error);

            setErro(
                error instanceof Error
                    ? error.message
                    : "Erro ao atualizar atividade."
            );
        } finally {
            setSalvando(false);
        }
    };

    /*
     * =====================================================
     * LOADING
     * =====================================================
     */

    if (loading) {
        return (
            <div className="mu-dashboard">
                <main className="mu-main">
                    <div className="mu-content">
                        <div className="mu-card mu-empty">
                            <div className="mu-empty-icon">⏳</div>

                            <h3>Carregando atividade...</h3>

                            <p>
                                Aguarde enquanto buscamos os dados da atividade.
                            </p>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    /*
     * =====================================================
     * ERRO
     * =====================================================
     */

    if (!atividade) {
        return (
            <div className="mu-dashboard">
                <main className="mu-main">
                    <div className="mu-content">
                        <div className="mu-card mu-empty">
                            <div className="mu-empty-icon">⚠️</div>

                            <h3>Atividade não encontrada</h3>

                            <p>
                                {erro || "Não foi possível carregar os dados da atividade."}
                            </p>

                            <button
                                className="mu-btn mu-btn-primary"
                                onClick={() =>
                                    navigate("/professor/atividades")
                                }
                            >
                                Voltar para atividades
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    /*
     * =====================================================
     * TELA
     * =====================================================
     */

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
              Professora
            </span>

                    </div>

                </header>

                {/* CONTEÚDO */}

                <div className="mu-content">

                    {/* VOLTAR */}

                    <button
                        type="button"
                        className="mu-btn mu-btn-secondary"
                        onClick={() =>
                            navigate(`/professor/atividades/${id}`)
                        }
                        style={{marginBottom: "20px"}}
                    >
                        ← Voltar
                    </button>

                    {/* TÍTULO */}

                    <div className="mu-content-header">

                        <div className="mu-title">

                            <h1>
                                Editar atividade
                            </h1>

                            <p>
                                Atualize as informações da atividade.
                            </p>

                        </div>

                    </div>

                    {/* MENSAGEM DE ERRO */}

                    {erro && (
                        <div
                            style={{
                                background: "#fff0f0",
                                color: "#d64545",
                                border: "1px solid #ffd0d0",
                                borderRadius: "10px",
                                padding: "12px 15px",
                                marginBottom: "18px",
                                fontSize: "13px",
                            }}
                        >
                            ⚠️ {erro}
                        </div>
                    )}

                    {/* MENSAGEM DE SUCESSO */}

                    {sucesso && (
                        <div
                            style={{
                                background: "#e1f8ec",
                                color: "#209b62",
                                border: "1px solid #bdebd2",
                                borderRadius: "10px",
                                padding: "12px 15px",
                                marginBottom: "18px",
                                fontSize: "13px",
                            }}
                        >
                            ✅ {sucesso}
                        </div>
                    )}

                    {/* FORMULÁRIO */}

                    <form
                        className="mu-card"
                        onSubmit={atualizarAtividade}
                        style={{
                            padding: "25px",
                        }}
                    >

                        {/* TÍTULO */}

                        <div className="mu-form-group">

                            <label htmlFor="titulo">
                                Título da atividade
                            </label>

                            <input
                                id="titulo"
                                type="text"
                                value={titulo}
                                onChange={(event) =>
                                    setTitulo(event.target.value)
                                }
                                placeholder="Digite o título da atividade"
                                maxLength={100}
                            />

                        </div>

                        {/* DESCRIÇÃO */}

                        <div className="mu-form-group">

                            <label htmlFor="descricao">
                                Descrição
                            </label>

                            <textarea
                                id="descricao"
                                value={descricao}
                                onChange={(event) =>
                                    setDescricao(event.target.value)
                                }
                                placeholder="Digite a descrição da atividade"
                                maxLength={1000}
                            />

                        </div>

                        {/* PONTUAÇÃO + STATUS */}

                        <div className="mu-form-row">

                            <div className="mu-form-group">

                                <label htmlFor="pontuacao">
                                    Pontuação
                                </label>

                                <input
                                    id="pontuacao"
                                    type="number"
                                    min="1"
                                    value={pontuacao}
                                    onChange={(event) =>
                                        setPontuacao(
                                            Number(event.target.value)
                                        )
                                    }
                                />

                            </div>

                            <div className="mu-form-group">

                                <label htmlFor="status">
                                    Status
                                </label>

                                <select
                                    id="status"
                                    value={status}
                                    onChange={(event) =>
                                        setStatus(event.target.value)
                                    }
                                >

                                    <option value="PENDENTE">
                                        Pendente
                                    </option>

                                    <option value="EM_ANDAMENTO">
                                        Em andamento
                                    </option>

                                    <option value="CONCLUIDO">
                                        Concluído
                                    </option>

                                </select>

                            </div>

                        </div>

                        {/* TURMA */}

                        <div className="mu-form-group">

                            <label htmlFor="turma">
                                Turma
                            </label>

                            <select
                                id="turma"
                                value={turmaId}
                                onChange={(event) =>
                                    setTurmaId(
                                        event.target.value === ""
                                            ? ""
                                            : Number(event.target.value)
                                    )
                                }
                            >

                                <option value="">
                                    Selecione uma turma
                                </option>

                                {turmas.map((turma) => (
                                    <option
                                        key={turma.id}
                                        value={turma.id}
                                    >
                                        {turma.nome}
                                    </option>
                                ))}

                            </select>

                        </div>

                        {/* PERGUNTAS */}

                        <div
                            style={{
                                marginTop: "25px",
                                paddingTop: "20px",
                                borderTop: "1px solid #eeeef5",
                            }}
                        >

                            <h2
                                style={{
                                    fontSize: "16px",
                                    color: "#29293f",
                                    marginBottom: "6px",
                                }}
                            >
                                Perguntas
                            </h2>

                            <p
                                style={{
                                    color: "#9292a8",
                                    fontSize: "12px",
                                    marginBottom: "5px",
                                }}
                            >
                                Edite os enunciados e as alternativas e marque a
                                resposta correta de cada pergunta.
                            </p>

                            {perguntas.length === 0 && (
                                <p
                                    style={{
                                        color: "#9999ad",
                                        fontSize: "12px",
                                        marginTop: "12px",
                                    }}
                                >
                                    Nenhuma pergunta cadastrada.
                                </p>
                            )}

                            {perguntas.map((pergunta, perguntaIndex) => (

                                <div
                                    className="pergunta-card"
                                    key={pergunta.id ?? `nova-${perguntaIndex}`}
                                >

                                    <div className="pergunta-header">

                                        <h3>Pergunta {perguntaIndex + 1}</h3>

                                        <button
                                            type="button"
                                            title="Remover pergunta"
                                            onClick={() => removerPergunta(perguntaIndex)}
                                        >
                                            ✕
                                        </button>

                                    </div>

                                    <label htmlFor={`enunciado-${perguntaIndex}`}>
                                        Enunciado da pergunta
                                    </label>

                                    <textarea
                                        id={`enunciado-${perguntaIndex}`}
                                        value={pergunta.enunciado}
                                        onChange={(event) =>
                                            atualizarEnunciado(
                                                perguntaIndex,
                                                event.target.value
                                            )
                                        }
                                        placeholder="Digite a pergunta"
                                    />

                                    <h4>Alternativas</h4>

                                    <p>
                                        Marque a opção que representa a resposta correta.
                                    </p>

                                    {pergunta.alternativas.map(
                                        (alternativa, alternativaIndex) => (

                                            <div
                                                className="alternativa"
                                                key={alternativa.id ?? `nova-${alternativaIndex}`}
                                            >

                                                <input
                                                    type="radio"
                                                    name={`correta-${perguntaIndex}`}
                                                    checked={alternativa.correta}
                                                    onChange={() =>
                                                        marcarRespostaCorreta(
                                                            perguntaIndex,
                                                            alternativaIndex
                                                        )
                                                    }
                                                />

                                                <input
                                                    type="text"
                                                    value={alternativa.texto}
                                                    onChange={(event) =>
                                                        atualizarAlternativa(
                                                            perguntaIndex,
                                                            alternativaIndex,
                                                            event.target.value
                                                        )
                                                    }
                                                    placeholder={`Alternativa ${alternativaIndex + 1}`}
                                                />

                                                <button
                                                    type="button"
                                                    title="Remover alternativa"
                                                    onClick={() =>
                                                        removerAlternativa(
                                                            perguntaIndex,
                                                            alternativaIndex
                                                        )
                                                    }
                                                >
                                                    ✕
                                                </button>

                                            </div>
                                        )
                                    )}

                                    <button
                                        type="button"
                                        className="botao-secundario"
                                        onClick={() => adicionarAlternativa(perguntaIndex)}
                                    >
                                        + Adicionar alternativa
                                    </button>

                                </div>
                            ))}

                            <button
                                type="button"
                                className="botao-secundario"
                                onClick={adicionarPergunta}
                            >
                                + Adicionar pergunta
                            </button>

                        </div>

                        {/* BOTÕES */}

                        <div className="mu-modal-footer">

                            <button
                                type="button"
                                className="mu-btn mu-btn-secondary"
                                onClick={() =>
                                    navigate(
                                        `/professor/atividades/${id}`
                                    )
                                }
                            >
                                Cancelar
                            </button>

                            <button
                                type="submit"
                                className="mu-btn mu-btn-primary"
                                disabled={salvando}
                            >

                                {salvando
                                    ? "Salvando..."
                                    : "💾 Salvar alterações"}

                            </button>

                        </div>

                    </form>

                </div>

            </main>
        </div>
    );
}

export default EditarAtividadeProfessor;