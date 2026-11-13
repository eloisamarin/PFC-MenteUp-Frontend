import {useEffect, useState} from "react";
import {useNavigate, useParams, useSearchParams} from "react-router-dom";
import {Check, ChevronLeft, ChevronRight, Plus, Timer, Trash2, X} from "lucide-react";
import {IconeDesafio} from "../../components/ComponentesDesafio";
import {apiFetch, lerErro} from "../../services/api";
import {contagem, podeAlterarTurma, ROTA_BASE, type PerfilGestao, type TurmaResumo} from "../../services/turmaDesafio";
import ProfessorDaTurma from "../../components/ProfessorDaTurma";
import {LayoutGestao} from "./TurmasGestao";
import styles from "../professor/CriarAtividadeProfessor.module.css";
import editor from "../../components/atividades/Editores.module.css";
import desafioStyles from "./Desafios.module.css";

const TEMPO_PADRAO = 30;
const TEMPO_MINIMO = 5;
const TEMPO_MAXIMO = 300;
const MAXIMO_ALTERNATIVAS = 4;
const MINIMO_ALTERNATIVAS = 2;
const LETRAS = "ABCD";
const ETAPAS = ["Informações", "Perguntas", "Revisão"];

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

function validarInformacoes(titulo: string, descricao: string, turmaId: string): string | null {
    if (titulo.trim().length < 5) return "O título deve ter no mínimo 5 caracteres.";
    if (!turmaId) return "Selecione a turma do desafio.";
    if (descricao.trim().length < 10) return "A descrição deve ter no mínimo 10 caracteres.";
    return null;
}

function validarPerguntas(perguntas: PerguntaForm[]): string | null {
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

    const [etapa, setEtapa] = useState(0);
    const [turmas, setTurmas] = useState<TurmaResumo[]>([]);
    const [titulo, setTitulo] = useState(parametros.get("titulo") ?? "");
    const [descricao, setDescricao] = useState("");
    const [turmaId, setTurmaId] = useState(parametros.get("turma") ?? "");
    const [perguntas, setPerguntas] = useState<PerguntaForm[]>([novaPergunta()]);
    const [indice, setIndice] = useState(0);
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
                const resposta = await apiFetch("/turmas/all?incluirArquivadas=true");
                if (!resposta.ok) throw new Error("Falha ao consultar as turmas.");
                // O professor só cria desafio nas turmas dele
                const todas: TurmaResumo[] = await resposta.json();
                setTurmas(todas.filter((t) => podeAlterarTurma(t, perfil)));
            } catch (error) {
                console.error("Erro ao carregar turmas:", error);
                setErro("Não foi possível carregar as turmas.");
            }
        }

        carregarTurmas();
    }, [perfil]);

    const sair = () => navigate(`${base}/desafios`);
    const pergunta = perguntas[indice] ?? perguntas[0];
    const turma = turmas.find((t) => String(t.id) === turmaId);
    const tempoTotal = perguntas.reduce((soma, p) => soma + (Number(p.tempoSegundos) || 0), 0);

    function alterarPergunta(alteracao: Partial<PerguntaForm>) {
        setErro("");
        setPerguntas((atuais) => atuais.map((p, i) => (i === indice ? {...p, ...alteracao} : p)));
    }

    function alterarAlternativa(indiceAlternativa: number, texto: string) {
        alterarPergunta({
            alternativas: pergunta.alternativas.map((atual, i) => (i === indiceAlternativa ? texto : atual)),
        });
    }

    function removerAlternativa(indiceAlternativa: number) {
        const correta = pergunta.indiceCorreta;

        alterarPergunta({
            alternativas: pergunta.alternativas.filter((_, i) => i !== indiceAlternativa),
            indiceCorreta: correta === null || correta === indiceAlternativa
                ? null
                : correta > indiceAlternativa ? correta - 1 : correta,
        });
    }

    function adicionarPergunta() {
        setPerguntas((atuais) => [...atuais, novaPergunta()]);
        setIndice(perguntas.length);
        setErro("");
    }

    function removerPergunta() {
        setPerguntas((atuais) => atuais.filter((_, i) => i !== indice));
        setIndice((atual) => Math.max(0, atual - 1));
        setErro("");
    }

    function continuar() {
        const problema = etapa === 0
            ? validarInformacoes(titulo, descricao, turmaId)
            : etapa === 1 ? validarPerguntas(perguntas) : null;
        setErro(problema ?? "");
        if (!problema) setEtapa((atual) => Math.min(atual + 1, ETAPAS.length - 1));
    }

    function voltar() {
        setErro("");
        if (etapa === 0) sair();
        else setEtapa((atual) => atual - 1);
    }

    async function salvar() {
        const mensagemFalha = `Não foi possível ${editando ? "salvar" : "criar"} o desafio.`;
        const problema = validarInformacoes(titulo, descricao, turmaId) ?? validarPerguntas(perguntas);

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
                    perguntas: perguntas.map((p) => ({
                        enunciado: p.enunciado.trim(),
                        tempoSegundos: p.tempoSegundos,
                        alternativas: p.alternativas.map((texto, i) => ({
                            texto: texto.trim(),
                            correta: i === p.indiceCorreta,
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

            sair();
        } catch (error) {
            console.error("Erro ao salvar desafio:", error);
            setErro(mensagemFalha);
        } finally {
            setSalvando(false);
        }
    }

    const cabecalho = (
        <header className={styles.header}>
            <button type="button" className={styles.close} onClick={sair} aria-label="Cancelar">
                <X size={18}/>
            </button>
            <div>
                <span className={styles.eyebrow}>{editando ? "Editar desafio" : "Novo desafio"}</span>
                <h1 className={`${styles.title} ${desafioStyles.titleWithIcon}`}>
                    {editando ? "Ajuste o desafio" : "Crie um desafio ao vivo"} <IconeDesafio tamanho={32}/>
                </h1>
            </div>
        </header>
    );

    if (carregando || erroCarregamento) {
        return (
            <LayoutGestao perfil={perfil}>
                {cabecalho}
                <section className={styles.card}>
                    <h2 className={styles.cardTitle}>{carregando ? "Carregando desafio..." : "Não foi possível abrir"}</h2>
                    <p className={styles.cardSubtitle}>{carregando ? "Aguarde enquanto buscamos os dados." : erroCarregamento}</p>
                    {!carregando && (
                        <button type="button" className={styles.ghostButton} onClick={sair}>
                            <ChevronLeft size={16}/> Voltar para desafios
                        </button>
                    )}
                </section>
            </LayoutGestao>
        );
    }

    return (
        <LayoutGestao perfil={perfil}>
            {cabecalho}

            <ol className={styles.stepper}>
                {ETAPAS.map((nome, i) => (
                    <li
                        key={nome}
                        className={`${styles.step} ${i < etapa ? styles.stepDone : ""} ${i === etapa ? styles.stepCurrent : ""}`}
                        aria-current={i === etapa ? "step" : undefined}
                    >
                        <span className={styles.stepNumber}>{i < etapa ? <Check size={16}/> : i + 1}</span>
                        <span className={styles.stepName}>{nome}</span>
                    </li>
                ))}
            </ol>

            <section className={styles.card}>
                {etapa === 0 && (
                    <>
                        <h2 className={styles.cardTitle}>Informações básicas</h2>
                        <p className={styles.cardSubtitle}>Dê contexto para a turma entender o desafio.</p>

                        <label className={styles.label} htmlFor="titulo">Título do desafio</label>
                        <input
                            id="titulo"
                            className={styles.input}
                            maxLength={100}
                            placeholder="Ex.: Corrida das frações"
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                        />

                        <label className={styles.label} htmlFor="turma">Turma</label>
                        <select id="turma" className={styles.input} value={turmaId} onChange={(e) => setTurmaId(e.target.value)}>
                            <option value="">Selecione uma turma</option>
                            {turmas.filter((t) => !t.arquivada || String(t.id) === turmaId).map((t) => (
                                <option key={t.id} value={t.id}>{t.nome}</option>
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

                        <label className={styles.label} htmlFor="descricao">Descrição</label>
                        <textarea
                            id="descricao"
                            className={styles.input}
                            rows={3}
                            maxLength={1000}
                            placeholder="Explique o objetivo do desafio para os alunos."
                            value={descricao}
                            onChange={(e) => setDescricao(e.target.value)}
                        />
                    </>
                )}

                {etapa === 1 && pergunta && (
                    <>
                        <div className={styles.cardHeader}>
                            <div>
                                <h2 className={styles.cardTitle}>Monte as perguntas</h2>
                                <p className={styles.cardSubtitle}>
                                    Questão {indice + 1} de {perguntas.length} · cada pergunta tem o seu tempo
                                </p>
                            </div>
                            <button type="button" className={styles.ghostButton} onClick={adicionarPergunta}>
                                <Plus size={16}/> Adicionar
                            </button>
                        </div>

                        <div className={editor.questionNav}>
                            <nav className={editor.dots} aria-label="Perguntas">
                                {perguntas.map((_, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        className={`${editor.dot} ${i === indice ? editor.dotActive : ""}`}
                                        onClick={() => setIndice(i)}
                                        aria-current={i === indice ? "step" : undefined}
                                        aria-label={`Pergunta ${i + 1}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </nav>
                            {perguntas.length > 1 && (
                                <button type="button" className={editor.removeQuestion} onClick={removerPergunta}>
                                    <Trash2 size={14}/> Remover pergunta
                                </button>
                            )}
                        </div>

                        <div className={desafioStyles.enunciadoRow}>
                            <div>
                                <label className={editor.label} htmlFor="enunciado">Enunciado</label>
                                <input
                                    id="enunciado"
                                    className={editor.input}
                                    maxLength={255}
                                    placeholder="Digite a pergunta..."
                                    value={pergunta.enunciado}
                                    onChange={(e) => alterarPergunta({enunciado: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className={editor.label} htmlFor="tempo">Tempo</label>
                                <div className={desafioStyles.timeField}>
                                    <Timer size={18} className={desafioStyles.timeIcon}/>
                                    <input
                                        id="tempo"
                                        type="number"
                                        min={TEMPO_MINIMO}
                                        max={TEMPO_MAXIMO}
                                        value={pergunta.tempoSegundos}
                                        onChange={(e) => alterarPergunta({tempoSegundos: Number(e.target.value)})}
                                        aria-describedby="tempo-ajuda"
                                    />
                                    <span>seg</span>
                                </div>
                            </div>
                        </div>

                        <span id="tempo-ajuda" className={editor.helper}>
                            Marque a bolinha da alternativa correta. O tempo vale entre {TEMPO_MINIMO} e {TEMPO_MAXIMO} segundos.
                        </span>

                        <div className={editor.alternatives}>
                            {pergunta.alternativas.map((alternativa, i) => {
                                const correta = pergunta.indiceCorreta === i;
                                return (
                                    <div key={i} className={`${editor.alternative} ${correta ? editor.alternativeCorrect : ""}`}>
                                        <button
                                            type="button"
                                            className={editor.radio}
                                            onClick={() => alterarPergunta({indiceCorreta: i})}
                                            aria-label={`Marcar alternativa ${LETRAS[i]} como correta`}
                                            aria-pressed={correta}
                                        >
                                            {correta && <Check size={12}/>}
                                        </button>
                                        <input
                                            className={editor.inlineInput}
                                            placeholder={`Alternativa ${LETRAS[i]}`}
                                            value={alternativa}
                                            onChange={(e) => alterarAlternativa(i, e.target.value)}
                                        />
                                        {pergunta.alternativas.length > MINIMO_ALTERNATIVAS && (
                                            <button
                                                type="button"
                                                className={editor.iconButton}
                                                onClick={() => removerAlternativa(i)}
                                                aria-label={`Remover alternativa ${LETRAS[i]}`}
                                            >
                                                <X size={14}/>
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {pergunta.alternativas.length < MAXIMO_ALTERNATIVAS && (
                            <button
                                type="button"
                                className={editor.addLink}
                                onClick={() => alterarPergunta({alternativas: [...pergunta.alternativas, ""]})}
                            >
                                <Plus size={14}/> Adicionar alternativa
                            </button>
                        )}
                    </>
                )}

                {etapa === 2 && (
                    <div className={styles.review}>
                        <span className={styles.reviewIcon}>
                            <IconeDesafio tamanho={28}/>
                        </span>
                        <h2 className={styles.reviewTitle}>{editando ? "Pronto para salvar" : "Desafio pronto"}</h2>
                        <p className={styles.cardSubtitle}>
                            {[titulo.trim(), contagem(perguntas.length, "pergunta", "perguntas"), turma?.nome].filter(Boolean).join(" · ")}
                        </p>
                        <dl className={styles.reviewBox}>
                            <div>
                                <dt>Turma</dt>
                                <dd>{turma ? turma.nome : "-"}</dd>
                            </div>
                            <div>
                                <dt>Perguntas</dt>
                                <dd>{contagem(perguntas.length, "pergunta", "perguntas")}</dd>
                            </div>
                            <div>
                                <dt>Tempo total</dt>
                                <dd>{tempoTotal >= 60 ? `${Math.floor(tempoTotal / 60)} min ${tempoTotal % 60}s` : `${tempoTotal}s`}</dd>
                            </div>
                        </dl>
                    </div>
                )}

                {erro && <p className={styles.error} role="alert">{erro}</p>}

                <footer className={styles.footer}>
                    <button type="button" className={styles.ghostButton} onClick={voltar} disabled={salvando}>
                        <ChevronLeft size={16}/> Voltar
                    </button>
                    {etapa < ETAPAS.length - 1 ? (
                        <button type="button" className={styles.primaryButton} onClick={continuar}>
                            Continuar <ChevronRight size={16}/>
                        </button>
                    ) : (
                        <button type="button" className={styles.publishButton} onClick={salvar} disabled={salvando}>
                            {salvando ? "Salvando..." : editando ? "Salvar alterações" : "Salvar desafio"} <ChevronRight size={16}/>
                        </button>
                    )}
                </footer>
            </section>
        </LayoutGestao>
    );
}

export default CriarDesafio;
