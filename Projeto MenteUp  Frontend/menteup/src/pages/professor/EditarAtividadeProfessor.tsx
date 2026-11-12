import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Eye, Lock, Plus, Save, X } from "lucide-react";

import ProfessorLayout, { useAreaBase } from "../../components/layout/AreaLayout";
import {
    EditorPerguntas,
    SeletorTemplate,
    perguntaVazia,
    perguntasIniciais,
    prepararEnvio,
    validarPerguntas,
    type PerguntaRequest,
} from "../../components/atividades/Editores";
import ProfessorDaTurma from "../../components/ProfessorDaTurma";
import { apiFetch, lerErro } from "../../services/api";
import { podeAlterarTurma, type TurmaResumo } from "../../services/turmaDesafio";
import { NOME_TIPO, type TipoAtividade } from "../../types/aluno";
import styles from "./CriarAtividadeProfessor.module.css";

type Turma = TurmaResumo;

interface Alternativa {
    id: number;
    texto?: string;
    correta?: boolean;
    ordem?: number | null;
}

interface Pergunta {
    id: number;
    texto?: string;
    enunciado?: string;
    alternativas?: Alternativa[];
}

interface Atividade {
    id: number;
    titulo: string;
    descricao: string;
    pontuacao: number;
    status: string;
    tipo?: TipoAtividade;
    turma?: Turma;
    perguntas?: Pergunta[];
}

interface QuestionarioResponse {
    atividade?: Atividade;
    perguntas?: Pergunta[];
}

const STATUS = [
    { valor: "PENDENTE", rotulo: "Rascunho" },
    { valor: "EM_ANDAMENTO", rotulo: "Ativa" },
    { valor: "CONCLUIDO", rotulo: "Encerrada" },
];

function paraRequest(tipo: TipoAtividade, pergunta: Pergunta): PerguntaRequest {
    const alternativas = (pergunta.alternativas ?? []).map((a) => ({
        texto: a.texto ?? "",
        correta: a.correta === true,
        ordem: a.ordem ?? null,
    }));
    const enunciado = pergunta.texto ?? pergunta.enunciado ?? "";

    if (tipo === "VERDADEIRO_FALSO") {
        const verdadeiro = alternativas.find((a) => a.texto.trim().toLowerCase() === "verdadeiro");
        const correta = verdadeiro ? verdadeiro.correta : alternativas[0]?.correta ?? true;
        return {
            enunciado,
            alternativas: [
                { texto: "Verdadeiro", correta },
                { texto: "Falso", correta: !correta },
            ],
        };
    }
    if (tipo === "ORDENACAO") {
        return {
            enunciado,
            alternativas: [...alternativas]
                .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
                .map((a) => ({ texto: a.texto, correta: true })),
        };
    }
    if (tipo === "LACUNAS") {
        return {
            enunciado,
            alternativas: alternativas.map((a) =>
                a.correta ? { texto: a.texto, correta: true, ordem: a.ordem } : { texto: a.texto, correta: false }
            ),
        };
    }
    if (tipo === "ASSOCIACAO") {
        return { enunciado, alternativas: alternativas.slice(0, 1).map((a) => ({ texto: a.texto, correta: true })) };
    }
    return { enunciado, alternativas: alternativas.map((a) => ({ texto: a.texto, correta: a.correta })) };
}

function EditarAtividadeProfessor() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const area = useAreaBase();
    const perfil = area === "/administrador" ? "ADMINISTRADOR" : "PROFESSOR";

    const [titulo, setTitulo] = useState("");
    const [descricao, setDescricao] = useState("");
    const [pontuacao, setPontuacao] = useState(1);
    const [status, setStatus] = useState("PENDENTE");
    const [turmaId, setTurmaId] = useState("");
    const [turmas, setTurmas] = useState<Turma[]>([]);
    const [tituloOriginal, setTituloOriginal] = useState("");

    const [tipo, setTipo] = useState<TipoAtividade>("QUIZ");
    const [perguntas, setPerguntas] = useState<PerguntaRequest[]>([]);
    const [original, setOriginal] = useState<{ tipo: TipoAtividade; perguntas: PerguntaRequest[] }>({
        tipo: "QUIZ",
        perguntas: [],
    });
    const [indice, setIndice] = useState(0);
    const [perguntasAlteradas, setPerguntasAlteradas] = useState(false);
    const [bloqueado, setBloqueado] = useState(false);

    const [carregando, setCarregando] = useState(true);
    const [encontrada, setEncontrada] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");

    useEffect(() => {
        const carregar = async () => {
            try {
                if (!id) {
                    setErro("ID da atividade não informado.");
                    return;
                }
                const response = await apiFetch(`/atividades/${id}`);
                if (!response.ok) {
                    const erroApi = await lerErro(response, "Não foi possível carregar a atividade.");
                    throw new Error(erroApi.mensagem);
                }
                const dados: QuestionarioResponse & Atividade = await response.json();
                const base: Atividade = dados.atividade ?? dados;
                const tipoAtual = base.tipo ?? "QUIZ";
                const lista = (dados.perguntas ?? base.perguntas ?? []).map((p) => paraRequest(tipoAtual, p));

                setTitulo(base.titulo || "");
                setTituloOriginal(base.titulo || "");
                setDescricao(base.descricao || "");
                setPontuacao(base.pontuacao || 1);
                setStatus(base.status || "PENDENTE");
                setTurmaId(base.turma?.id ? String(base.turma.id) : "");
                setTipo(tipoAtual);
                setPerguntas(lista.length ? lista : perguntasIniciais(tipoAtual));
                setOriginal({ tipo: tipoAtual, perguntas: lista });
                setPerguntasAlteradas(lista.length === 0);
                setEncontrada(true);
            } catch (error) {
                console.error(error);
                setErro(error instanceof Error ? error.message : "Não foi possível carregar a atividade.");
            } finally {
                setCarregando(false);
            }
        };
        carregar();
    }, [id]);

    useEffect(() => {
        const carregarTurmas = async () => {
            try {
                const response = await apiFetch("/turmas/all");
                if (!response.ok) throw new Error("Erro ao buscar turmas");
                // O professor só move a atividade entre as turmas dele
                const todas: Turma[] = await response.json();
                setTurmas(todas.filter((t) => podeAlterarTurma(t, perfil)));
            } catch (error) {
                console.error("Erro ao carregar turmas:", error);
            }
        };
        carregarTurmas();
    }, [perfil]);

    const sair = () => navigate(`${area}/atividades`);

    function escolherTipo(novo: TipoAtividade) {
        if (novo === tipo) return;
        setTipo(novo);
        setPerguntas(novo === original.tipo && original.perguntas.length ? original.perguntas : perguntasIniciais(novo));
        setIndice(0);
        setPerguntasAlteradas(true);
        setErro("");
    }

    function alterarPerguntas(lista: PerguntaRequest[]) {
        setPerguntas(lista);
        setPerguntasAlteradas(true);
        setErro("");
    }

    function adicionarPergunta() {
        alterarPerguntas([...perguntas, perguntaVazia(tipo)]);
        setIndice(perguntas.length);
    }

    function validar(): string | null {
        if (!titulo.trim()) return "Informe o título da atividade.";
        if (!turmaId) return "Selecione uma turma.";
        if (!pontuacao || pontuacao <= 0) return "Informe uma pontuação maior que zero.";
        if (pontuacao > 1000) return "A pontuação deve ser no máximo 1000 XP.";
        if (!descricao.trim()) return "Informe a descrição da atividade.";
        if (perguntasAlteradas && !bloqueado) return validarPerguntas(tipo, perguntas);
        return null;
    }

    async function salvar() {
        const problema = validar();
        setErro(problema ?? "");
        setSucesso("");
        if (problema) return;

        try {
            setSalvando(true);

            const response = await apiFetch("/atividades", {
                method: "PUT",
                body: JSON.stringify({
                    id: Number(id),
                    titulo: titulo.trim(),
                    descricao: descricao.trim(),
                    pontuacao: Number(pontuacao),
                    status,
                    turma: { id: Number(turmaId) },
                }),
            });
            if (!response.ok) {
                const erroApi = await lerErro(response, "Não foi possível atualizar a atividade.");
                throw new Error(erroApi.mensagem);
            }

            if (perguntasAlteradas && !bloqueado) {
                const resposta = await apiFetch(`/atividades/${id}/questionario`, {
                    method: "PUT",
                    body: JSON.stringify({ tipo, perguntas: prepararEnvio(tipo, perguntas) }),
                });
                if (!resposta.ok) {
                    const erroApi = await lerErro(resposta, "Não foi possível atualizar as perguntas.");
                    if (resposta.status === 409 || erroApi.codigo === "ATIVIDADE_COM_RESPOSTAS") {
                        setBloqueado(true);
                        setTipo(original.tipo);
                        setPerguntas(original.perguntas);
                        setIndice(0);
                        setPerguntasAlteradas(false);
                        throw new Error(
                            "Os dados da atividade foram salvos, mas as perguntas não podem mais ser alteradas porque alunos já começaram a responder."
                        );
                    }
                    throw new Error(`Os dados da atividade foram salvos, mas as perguntas não: ${erroApi.mensagem}`);
                }
                setPerguntasAlteradas(false);
                setOriginal({ tipo, perguntas });
            }

            setSucesso("Atividade atualizada com sucesso!");
            setTimeout(() => navigate(`${area}/atividades/${id}`), 1000);
        } catch (error) {
            console.error(error);
            setErro(error instanceof Error ? error.message : "Erro ao atualizar atividade.");
        } finally {
            setSalvando(false);
        }
    }

    const cabecalho = (
        <header className={styles.header}>
            <button type="button" className={styles.close} onClick={sair} aria-label="Cancelar edição">
                <X size={18} />
            </button>
            <div>
                <span className={styles.eyebrow}>Editar atividade</span>
                <h1 className={styles.title}>{tituloOriginal || "Editar missão"}</h1>
            </div>
        </header>
    );

    if (carregando || !encontrada) {
        return (
            <ProfessorLayout>
                {cabecalho}
                <section className={styles.card}>
                    <h2 className={styles.cardTitle}>
                        {carregando ? "Carregando atividade..." : "Atividade não encontrada"}
                    </h2>
                    <p className={styles.cardSubtitle}>
                        {carregando ? "Aguarde enquanto buscamos os dados." : erro || "Não foi possível carregar a atividade."}
                    </p>
                    {!carregando && (
                        <button type="button" className={styles.ghostButton} onClick={sair}>
                            <ChevronLeft size={16} /> Voltar para atividades
                        </button>
                    )}
                </section>
            </ProfessorLayout>
        );
    }

    return (
        <ProfessorLayout>
            {cabecalho}

            <section className={styles.card}>
                <h2 className={styles.cardTitle}>Informações básicas</h2>
                <p className={styles.cardSubtitle}>Atualize os dados que os alunos veem na missão.</p>

                <label className={styles.label} htmlFor="titulo">
                    Título da atividade
                </label>
                <input id="titulo" className={styles.input} value={titulo} onChange={(e) => setTitulo(e.target.value)} />

                <div className={styles.row}>
                    <div>
                        <label className={styles.label} htmlFor="turma">
                            Turma
                        </label>
                        <select id="turma" className={styles.input} value={turmaId} onChange={(e) => setTurmaId(e.target.value)}>
                            <option value="">Selecione uma turma</option>
                            {turmas.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.nome}
                                </option>
                            ))}
                        </select>
                        {perfil === "ADMINISTRADOR" && (
                            <ProfessorDaTurma
                                turma={turmas.find((t) => String(t.id) === turmaId)}
                                onVinculado={(atualizada) =>
                                    setTurmas((lista) => lista.map((t) => (t.id === atualizada.id ? atualizada : t)))
                                }
                            />
                        )}
                    </div>
                    <div className={styles.row}>
                        <div>
                            <label className={styles.label} htmlFor="pontuacao">
                                Pontuação (XP)
                            </label>
                            <input
                                id="pontuacao"
                                type="number"
                                min={1}
                                max={1000}
                                className={styles.input}
                                value={pontuacao}
                                onChange={(e) => setPontuacao(Number(e.target.value))}
                            />
                        </div>
                        <div>
                            <label className={styles.label} htmlFor="status">
                                Status
                            </label>
                            <select id="status" className={styles.input} value={status} onChange={(e) => setStatus(e.target.value)}>
                                {STATUS.map((s) => (
                                    <option key={s.valor} value={s.valor}>
                                        {s.rotulo}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <label className={styles.label} htmlFor="descricao">
                    Descrição
                </label>
                <textarea
                    id="descricao"
                    className={styles.input}
                    rows={3}
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                />
            </section>

            <section className={styles.card}>
                <h2 className={styles.cardTitle}>Template</h2>
                <p className={styles.cardSubtitle}>
                    {bloqueado
                        ? "O template não pode ser trocado depois que os alunos começaram a responder."
                        : "Trocar de template substitui as perguntas atuais ao salvar."}
                </p>
                <SeletorTemplate valor={tipo} onChange={escolherTipo} bloqueado={bloqueado} />
            </section>

            <section className={styles.card}>
                <div className={styles.cardHeader}>
                    <div>
                        <h2 className={styles.cardTitle}>Perguntas</h2>
                        <p className={styles.cardSubtitle}>
                            {NOME_TIPO[tipo]} ·{" "}
                            {tipo === "ASSOCIACAO"
                                ? `${perguntas.length} ${perguntas.length === 1 ? "par" : "pares"}`
                                : `Questão ${Math.min(indice + 1, perguntas.length)} de ${perguntas.length}`}
                        </p>
                    </div>
                    {!bloqueado && tipo !== "ASSOCIACAO" && (
                        <button type="button" className={styles.ghostButton} onClick={adicionarPergunta}>
                            <Plus size={16} /> Adicionar
                        </button>
                    )}
                </div>

                {bloqueado ? (
                    <div className={styles.locked}>
                        <Lock size={22} />
                        <p>Alunos já começaram a responder esta atividade, então as perguntas ficaram bloqueadas para edição.</p>
                        <button type="button" className={styles.ghostButton} onClick={() => navigate(`${area}/atividades/${id}`)}>
                            <Eye size={16} /> Ver perguntas
                        </button>
                    </div>
                ) : (
                    <EditorPerguntas
                        tipo={tipo}
                        perguntas={perguntas}
                        onChange={alterarPerguntas}
                        indice={indice}
                        onIndice={setIndice}
                    />
                )}

                {erro && (
                    <p className={styles.error} role="alert">
                        {erro}
                    </p>
                )}
                {sucesso && (
                    <p className={styles.success} role="status">
                        {sucesso}
                    </p>
                )}

                <footer className={styles.footer}>
                    <button type="button" className={styles.ghostButton} onClick={sair} disabled={salvando}>
                        <ChevronLeft size={16} /> Cancelar
                    </button>
                    <button type="button" className={styles.primaryButton} onClick={salvar} disabled={salvando}>
                        <Save size={16} /> {salvando ? "Salvando..." : "Salvar alterações"}
                    </button>
                </footer>
            </section>
        </ProfessorLayout>
    );
}

export default EditarAtividadeProfessor;
