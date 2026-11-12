import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ChevronLeft, ChevronRight, Plus, Sparkles, X } from "lucide-react";

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

const ETAPAS = ["Informações", "Template", "Perguntas", "Revisão"];

function CriarAtividadeProfessor() {
    const navigate = useNavigate();
    const area = useAreaBase();
    const perfil = area === "/administrador" ? "ADMINISTRADOR" : "PROFESSOR";

    const [etapa, setEtapa] = useState(0);
    const [titulo, setTitulo] = useState("");
    const [descricao, setDescricao] = useState("");
    const [pontuacao, setPontuacao] = useState(10);
    const [turmaId, setTurmaId] = useState("");
    const [turmas, setTurmas] = useState<Turma[]>([]);
    const [carregandoTurmas, setCarregandoTurmas] = useState(true);

    const [tipo, setTipo] = useState<TipoAtividade>("QUIZ");
    const [perguntas, setPerguntas] = useState<PerguntaRequest[]>(perguntasIniciais("QUIZ"));
    const [indice, setIndice] = useState(0);

    const [atividadeId, setAtividadeId] = useState<number | null>(null);
    const [perguntasSalvas, setPerguntasSalvas] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState("");

    useEffect(() => {
        const carregarTurmas = async () => {
            try {
                setCarregandoTurmas(true);
                const response = await apiFetch("/turmas/all");
                if (!response.ok) throw new Error("Erro ao buscar turmas");
                // O professor só cria atividade nas turmas dele
                const todas: Turma[] = await response.json();
                setTurmas(todas.filter((t) => podeAlterarTurma(t, perfil)));
            } catch (error) {
                console.error("Erro ao carregar turmas:", error);
                setErro("Erro ao carregar turmas. Tente novamente.");
            } finally {
                setCarregandoTurmas(false);
            }
        };
        carregarTurmas();
    }, [perfil]);

    const turma = turmas.find((t) => String(t.id) === turmaId);
    const sair = () => navigate(`${area}/atividades`);

    function validarEtapa(): string | null {
        if (etapa === 0) {
            if (!titulo.trim()) return "Informe o título da atividade.";
            if (!turmaId) return "Selecione uma turma.";
            if (!pontuacao || pontuacao <= 0) return "Informe uma pontuação maior que zero.";
        if (pontuacao > 1000) return "A pontuação deve ser no máximo 1000 XP.";
            if (!descricao.trim()) return "Informe a descrição da atividade.";
        }
        if (etapa === 2) return validarPerguntas(tipo, perguntas);
        return null;
    }

    function continuar() {
        const problema = validarEtapa();
        setErro(problema ?? "");
        if (!problema) setEtapa((e) => Math.min(e + 1, ETAPAS.length - 1));
    }

    function voltar() {
        setErro("");
        if (etapa === 0) sair();
        else setEtapa((e) => e - 1);
    }

    function escolherTipo(novo: TipoAtividade) {
        if (novo === tipo) return;
        setTipo(novo);
        setPerguntas(perguntasIniciais(novo));
        setIndice(0);
        setPerguntasSalvas(false);
    }

    function adicionarPergunta() {
        setPerguntas((lista) => [...lista, perguntaVazia(tipo)]);
        setIndice(perguntas.length);
    }

    function alterarPerguntas(lista: PerguntaRequest[]) {
        setPerguntas(lista);
        setPerguntasSalvas(false);
        setErro("");
    }

    async function salvar(publicar: boolean) {
        try {
            setSalvando(true);
            setErro("");

            const dadosAtividade = {
                titulo: titulo.trim(),
                descricao: descricao.trim(),
                pontuacao: Number(pontuacao),
                turma: { id: Number(turmaId) },
            };

            let id = atividadeId;
            if (id === null) {
                const resposta = await apiFetch("/atividades", {
                    method: "POST",
                    body: JSON.stringify({ ...dadosAtividade, status: "PENDENTE" }),
                });
                if (!resposta.ok) {
                    const erroApi = await lerErro(resposta, "Não foi possível criar a atividade.");
                    throw new Error(erroApi.mensagem);
                }
                const criada = await resposta.json();
                id = Number(criada.id);
                setAtividadeId(id);
            }

            if (!perguntasSalvas) {
                const resposta = await apiFetch(`/atividades/${id}/questionario`, {
                    method: atividadeId === null ? "POST" : "PUT",
                    body: JSON.stringify({ tipo, perguntas: prepararEnvio(tipo, perguntas) }),
                });
                if (!resposta.ok) {
                    const erroApi = await lerErro(
                        resposta,
                        "A atividade foi criada, mas houve um erro ao salvar as perguntas."
                    );
                    throw new Error(erroApi.mensagem);
                }
                setPerguntasSalvas(true);
            }

            if (publicar || atividadeId !== null) {
                const resposta = await apiFetch("/atividades", {
                    method: "PUT",
                    body: JSON.stringify({ id, ...dadosAtividade, status: publicar ? "EM_ANDAMENTO" : "PENDENTE" }),
                });
                if (!resposta.ok) {
                    const erroApi = await lerErro(
                        resposta,
                        "As perguntas foram salvas, mas não foi possível publicar a atividade."
                    );
                    throw new Error(erroApi.mensagem);
                }
            }

            navigate(`${area}/atividades`);
        } catch (error) {
            console.error("Erro ao salvar atividade:", error);
            setErro(error instanceof Error ? error.message : "Erro ao salvar a atividade.");
        } finally {
            setSalvando(false);
        }
    }

    const resumoPerguntas =
        tipo === "ASSOCIACAO"
            ? `${perguntas.length} ${perguntas.length === 1 ? "par" : "pares"}`
            : `${perguntas.length} ${perguntas.length === 1 ? "pergunta" : "perguntas"}`;

    return (
        <ProfessorLayout>
            <header className={styles.header}>
                <button type="button" className={styles.close} onClick={sair} aria-label="Cancelar criação">
                    <X size={18} />
                </button>
                <div>
                    <span className={styles.eyebrow}>Nova atividade</span>
                    <h1 className={styles.title}>Crie uma nova missão</h1>
                </div>
            </header>

            <ol className={styles.stepper}>
                {ETAPAS.map((nome, i) => (
                    <li
                        key={nome}
                        className={`${styles.step} ${i < etapa ? styles.stepDone : ""} ${i === etapa ? styles.stepCurrent : ""}`}
                        aria-current={i === etapa ? "step" : undefined}
                    >
                        <span className={styles.stepNumber}>{i < etapa ? <Check size={16} /> : i + 1}</span>
                        <span className={styles.stepName}>{nome}</span>
                    </li>
                ))}
            </ol>

            <section className={styles.card}>
                {etapa === 0 && (
                    <>
                        <h2 className={styles.cardTitle}>Informações básicas</h2>
                        <p className={styles.cardSubtitle}>Dê contexto para os alunos entenderem a missão.</p>

                        <label className={styles.label} htmlFor="titulo">
                            Título da atividade
                        </label>
                        <input
                            id="titulo"
                            className={styles.input}
                            placeholder="Ex.: Expedição pelo sistema solar"
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                        />

                        <div className={styles.row}>
                            <div>
                                <label className={styles.label} htmlFor="turma">
                                    Turma
                                </label>
                                <select
                                    id="turma"
                                    className={styles.input}
                                    value={turmaId}
                                    onChange={(e) => setTurmaId(e.target.value)}
                                    disabled={carregandoTurmas}
                                >
                                    <option value="">{carregandoTurmas ? "Carregando turmas..." : "Selecione uma turma"}</option>
                                    {turmas.map((t) => (
                                        <option key={t.id} value={t.id}>
                                            {t.nome}
                                        </option>
                                    ))}
                                </select>
                                {perfil === "ADMINISTRADOR" && (
                                    <ProfessorDaTurma
                                        turma={turma}
                                        onVinculado={(atualizada) =>
                                            setTurmas((lista) => lista.map((t) => (t.id === atualizada.id ? atualizada : t)))
                                        }
                                    />
                                )}
                                {perfil === "PROFESSOR" && !carregandoTurmas && turmas.length === 0 && (
                                    <p style={{ fontSize: 13, margin: "4px 0 0" }}>
                                        Você ainda não é professor responsável por nenhuma turma. Peça a um administrador para vincular você.
                                    </p>
                                )}
                            </div>
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
                        </div>

                        <label className={styles.label} htmlFor="descricao">
                            Descrição
                        </label>
                        <textarea
                            id="descricao"
                            className={styles.input}
                            rows={3}
                            placeholder="Explique o objetivo da missão para os alunos."
                            value={descricao}
                            onChange={(e) => setDescricao(e.target.value)}
                        />
                    </>
                )}

                {etapa === 1 && (
                    <>
                        <h2 className={styles.cardTitle}>Escolha um template</h2>
                        <p className={styles.cardSubtitle}>
                            Trocar de template depois de montar as perguntas apaga as perguntas já criadas.
                        </p>
                        <SeletorTemplate valor={tipo} onChange={escolherTipo} />
                    </>
                )}

                {etapa === 2 && (
                    <>
                        <div className={styles.cardHeader}>
                            <div>
                                <h2 className={styles.cardTitle}>Monte as perguntas</h2>
                                <p className={styles.cardSubtitle}>
                                    {NOME_TIPO[tipo]} ·{" "}
                                    {tipo === "ASSOCIACAO" ? resumoPerguntas : `Questão ${indice + 1} de ${perguntas.length}`}
                                </p>
                            </div>
                            {tipo !== "ASSOCIACAO" && (
                                <button type="button" className={styles.ghostButton} onClick={adicionarPergunta}>
                                    <Plus size={16} /> Adicionar
                                </button>
                            )}
                        </div>
                        <EditorPerguntas
                            tipo={tipo}
                            perguntas={perguntas}
                            onChange={alterarPerguntas}
                            indice={indice}
                            onIndice={setIndice}
                        />
                    </>
                )}

                {etapa === 3 && (
                    <div className={styles.review}>
                        <span className={styles.reviewIcon}>
                            <Sparkles size={26} />
                        </span>
                        <h2 className={styles.reviewTitle}>Pronta para publicar</h2>
                        <p className={styles.cardSubtitle}>
                            {[titulo.trim(), resumoPerguntas, `${pontuacao} XP`, turma?.nome].filter(Boolean).join(" · ")}
                        </p>
                        <dl className={styles.reviewBox}>
                            <div>
                                <dt>Template</dt>
                                <dd>{NOME_TIPO[tipo]}</dd>
                            </div>
                            <div>
                                <dt>Perguntas</dt>
                                <dd>{resumoPerguntas}</dd>
                            </div>
                            <div>
                                <dt>Visibilidade</dt>
                                <dd>{turma ? `Turma ${turma.nome}` : "-"}</dd>
                            </div>
                        </dl>
                    </div>
                )}

                {erro && (
                    <p className={styles.error} role="alert">
                        {erro}
                    </p>
                )}

                <footer className={styles.footer}>
                    <button type="button" className={styles.ghostButton} onClick={voltar} disabled={salvando}>
                        <ChevronLeft size={16} /> Voltar
                    </button>

                    {etapa < ETAPAS.length - 1 ? (
                        <button type="button" className={styles.primaryButton} onClick={continuar}>
                            Continuar <ChevronRight size={16} />
                        </button>
                    ) : (
                        <div className={styles.footerActions}>
                            <button type="button" className={styles.ghostButton} onClick={() => salvar(false)} disabled={salvando}>
                                Salvar rascunho
                            </button>
                            <button type="button" className={styles.publishButton} onClick={() => salvar(true)} disabled={salvando}>
                                {salvando ? "Salvando..." : "Publicar atividade"} <ChevronRight size={16} />
                            </button>
                        </div>
                    )}
                </footer>
            </section>
        </ProfessorLayout>
    );
}

export default CriarAtividadeProfessor;
