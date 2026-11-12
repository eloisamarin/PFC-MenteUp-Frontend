import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import {
    ArrowDown,
    ArrowUp,
    Check,
    CircleCheck,
    Gamepad2,
    Link2,
    ListOrdered,
    Plus,
    Target,
    TextCursorInput,
    Trash2,
    X,
} from "lucide-react";

import type { TipoAtividade } from "../../types/aluno";
import { contarLacunas, partesDoTexto } from "./Players";
import styles from "./Editores.module.css";

// Mesmo limite do backend (enunciado e alternativas: 255 caracteres)
const LIMITE_TEXTO = 255;

export interface AlternativaRequest {
    texto: string;
    correta: boolean;
    ordem?: number | null;
}

export interface PerguntaRequest {
    enunciado: string;
    alternativas: AlternativaRequest[];
}

const LETRAS = "ABCDEFGH";
const LIMITE_LACUNAS = 255;
const LACUNA = /\{\{(\d{1,3})\}\}/g;

interface OpcaoTemplate {
    tipo: TipoAtividade | "DESAFIO_RAPIDO";
    nome: string;
    descricao: string;
    icone: ReactNode;
    emBreve?: boolean;
}

const TEMPLATES: OpcaoTemplate[] = [
    { tipo: "QUIZ", nome: "Quiz clássico", descricao: "Múltipla escolha com feedback", icone: <Target size={20} /> },
    { tipo: "DESAFIO_RAPIDO", nome: "Desafio rápido", descricao: "Perguntas com tempo", icone: <Gamepad2 size={20} />, emBreve: true },
    { tipo: "VERDADEIRO_FALSO", nome: "Verdadeiro ou falso", descricao: "Decisão simples e ágil", icone: <CircleCheck size={20} /> },
    { tipo: "ASSOCIACAO", nome: "Associação de colunas", descricao: "Ligar itens correspondentes", icone: <Link2 size={20} /> },
    { tipo: "ORDENACAO", nome: "Ordenação", descricao: "Colocar itens na sequência correta", icone: <ListOrdered size={20} /> },
    { tipo: "LACUNAS", nome: "Preencher lacunas", descricao: "Completar frases com palavras", icone: <TextCursorInput size={20} /> },
];

export function perguntaVazia(tipo: TipoAtividade): PerguntaRequest {
    if (tipo === "VERDADEIRO_FALSO") {
        return {
            enunciado: "",
            alternativas: [
                { texto: "Verdadeiro", correta: true },
                { texto: "Falso", correta: false },
            ],
        };
    }
    if (tipo === "ORDENACAO") {
        return { enunciado: "", alternativas: [1, 2, 3].map(() => ({ texto: "", correta: true })) };
    }
    if (tipo === "LACUNAS") return { enunciado: "", alternativas: [] };
    if (tipo === "ASSOCIACAO") return { enunciado: "", alternativas: [{ texto: "", correta: true }] };
    return { enunciado: "", alternativas: [1, 2, 3, 4].map(() => ({ texto: "", correta: false })) };
}

export function perguntasIniciais(tipo: TipoAtividade): PerguntaRequest[] {
    return tipo === "ASSOCIACAO" ? [perguntaVazia(tipo), perguntaVazia(tipo)] : [perguntaVazia(tipo)];
}

export function validarPerguntas(tipo: TipoAtividade, perguntas: PerguntaRequest[]): string | null {
    if (perguntas.length === 0) return "Adicione pelo menos uma pergunta.";

    if (tipo === "ASSOCIACAO") {
        if (perguntas.length < 2) return "Cadastre pelo menos 2 pares.";
        const vistos = new Set<string>();
        for (let i = 0; i < perguntas.length; i++) {
            const a = perguntas[i].enunciado.trim();
            const b = perguntas[i].alternativas[0]?.texto.trim() ?? "";
            if (!a || !b) return `Preencha os dois lados do par ${i + 1}.`;
            const chave = b.toLowerCase().replace(/\s+/g, " ");
            if (vistos.has(chave)) return `O texto "${b}" se repete na coluna da direita.`;
            vistos.add(chave);
        }
        return null;
    }

    for (let i = 0; i < perguntas.length; i++) {
        const p = perguntas[i];
        const n = i + 1;

        if (tipo === "LACUNAS") {
            if (!p.enunciado.trim()) return `Escreva o texto da pergunta ${n}.`;
            if (p.enunciado.length > LIMITE_LACUNAS) return `O texto da pergunta ${n} passa de ${LIMITE_LACUNAS} caracteres.`;
            const lacunas = contarLacunas(p.enunciado);
            if (lacunas === 0) return `Insira pelo menos uma lacuna na pergunta ${n}.`;
            for (let l = 1; l <= lacunas; l++) {
                const resposta = p.alternativas.find((a) => a.correta && a.ordem === l);
                if (!resposta?.texto.trim()) return `Informe a resposta da lacuna ${l} na pergunta ${n}.`;
            }
            if (p.alternativas.some((a) => !a.correta && !a.texto.trim())) {
                return `Preencha ou remova as palavras extras vazias da pergunta ${n}.`;
            }
            continue;
        }

        if (!p.enunciado.trim()) {
            return tipo === "VERDADEIRO_FALSO"
                ? `Escreva a afirmação ${n}.`
                : tipo === "ORDENACAO"
                  ? `Escreva a instrução da pergunta ${n}.`
                  : `Informe o enunciado da pergunta ${n}.`;
        }
        if (tipo === "VERDADEIRO_FALSO") continue;

        if (p.alternativas.length < 2) {
            return tipo === "ORDENACAO"
                ? `A pergunta ${n} precisa de pelo menos 2 itens.`
                : `A pergunta ${n} precisa ter pelo menos 2 alternativas.`;
        }
        const vazia = p.alternativas.findIndex((a) => !a.texto.trim());
        if (vazia !== -1) {
            return tipo === "ORDENACAO"
                ? `Preencha o item ${vazia + 1} da pergunta ${n}.`
                : `Preencha a alternativa ${LETRAS[vazia] ?? vazia + 1} da pergunta ${n}.`;
        }
        if (tipo === "QUIZ" && !p.alternativas.some((a) => a.correta)) {
            return `Marque a resposta correta da pergunta ${n}.`;
        }
    }
    return null;
}

export function prepararEnvio(tipo: TipoAtividade, perguntas: PerguntaRequest[]): PerguntaRequest[] {
    return perguntas.map((p) => {
        const enunciado = p.enunciado.trim();
        if (tipo === "VERDADEIRO_FALSO") {
            const verdadeiro = p.alternativas[0]?.correta ?? true;
            return {
                enunciado,
                alternativas: [
                    { texto: "Verdadeiro", correta: verdadeiro },
                    { texto: "Falso", correta: !verdadeiro },
                ],
            };
        }
        if (tipo === "ORDENACAO") {
            return {
                enunciado,
                alternativas: p.alternativas.map((a, i) => ({ texto: a.texto.trim(), correta: true, ordem: i + 1 })),
            };
        }
        if (tipo === "LACUNAS") {
            return {
                enunciado,
                alternativas: [
                    ...p.alternativas
                        .filter((a) => a.correta)
                        .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
                        .map((a) => ({ texto: a.texto.trim(), correta: true, ordem: a.ordem })),
                    ...p.alternativas.filter((a) => !a.correta).map((a) => ({ texto: a.texto.trim(), correta: false })),
                ],
            };
        }
        if (tipo === "ASSOCIACAO") {
            return { enunciado, alternativas: [{ texto: p.alternativas[0]?.texto.trim() ?? "", correta: true }] };
        }
        return { enunciado, alternativas: p.alternativas.map((a) => ({ texto: a.texto.trim(), correta: a.correta })) };
    });
}

interface SeletorTemplateProps {
    valor: TipoAtividade;
    onChange: (tipo: TipoAtividade) => void;
    bloqueado?: boolean;
}

export function SeletorTemplate({ valor, onChange, bloqueado }: SeletorTemplateProps) {
    return (
        <div className={styles.templates} role="radiogroup" aria-label="Tipo de atividade">
            {TEMPLATES.map((t) => {
                const ativo = t.tipo === valor;
                const desabilitado = t.emBreve || (bloqueado && !ativo);
                return (
                    <button
                        key={t.tipo}
                        type="button"
                        role="radio"
                        aria-checked={ativo}
                        disabled={desabilitado}
                        className={`${styles.template} ${ativo ? styles.templateActive : ""}`}
                        onClick={() => t.tipo !== "DESAFIO_RAPIDO" && onChange(t.tipo)}
                    >
                        <span className={styles.templateIcon}>{t.icone}</span>
                        <strong>{t.nome}</strong>
                        <span>{t.descricao}</span>
                        {t.emBreve && <span className={styles.soon}>Em breve</span>}
                    </button>
                );
            })}
        </div>
    );
}

interface EditorProps {
    pergunta: PerguntaRequest;
    onChange: (pergunta: PerguntaRequest) => void;
}

function EditorQuiz({ pergunta, onChange }: EditorProps) {
    const alterar = (i: number, mudanca: Partial<AlternativaRequest>) =>
        onChange({
            ...pergunta,
            alternativas: pergunta.alternativas.map((a, j) => (j === i ? { ...a, ...mudanca } : a)),
        });
    const marcarCorreta = (i: number) =>
        onChange({ ...pergunta, alternativas: pergunta.alternativas.map((a, j) => ({ ...a, correta: j === i })) });

    return (
        <>
            <label className={styles.label} htmlFor="enunciado">
                Enunciado
            </label>
            <input
                maxLength={LIMITE_TEXTO}
                id="enunciado"
                className={styles.input}
                placeholder="Digite a pergunta..."
                value={pergunta.enunciado}
                onChange={(e) => onChange({ ...pergunta, enunciado: e.target.value })}
            />
            <span className={styles.helper}>Marque a bolinha da alternativa correta.</span>
            <div className={styles.alternatives}>
                {pergunta.alternativas.map((a, i) => (
                    <div key={i} className={`${styles.alternative} ${a.correta ? styles.alternativeCorrect : ""}`}>
                        <button
                            type="button"
                            className={styles.radio}
                            onClick={() => marcarCorreta(i)}
                            aria-label={`Marcar alternativa ${LETRAS[i]} como correta`}
                            aria-pressed={a.correta}
                        >
                            {a.correta && <Check size={12} />}
                        </button>
                        <input
                            maxLength={LIMITE_TEXTO}
                            className={styles.inlineInput}
                            placeholder={`Alternativa ${LETRAS[i] ?? i + 1}`}
                            value={a.texto}
                            onChange={(e) => alterar(i, { texto: e.target.value })}
                        />
                        {pergunta.alternativas.length > 2 && (
                            <button
                                type="button"
                                className={styles.iconButton}
                                onClick={() => onChange({ ...pergunta, alternativas: pergunta.alternativas.filter((_, j) => j !== i) })}
                                aria-label={`Remover alternativa ${LETRAS[i]}`}
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                ))}
            </div>
            {pergunta.alternativas.length < LETRAS.length && (
                <button
                    type="button"
                    className={styles.addLink}
                    onClick={() => onChange({ ...pergunta, alternativas: [...pergunta.alternativas, { texto: "", correta: false }] })}
                >
                    <Plus size={14} /> Adicionar alternativa
                </button>
            )}
        </>
    );
}

function EditorVerdadeiroFalso({ pergunta, onChange }: EditorProps) {
    const verdadeiro = pergunta.alternativas[0]?.correta ?? true;
    const definir = (v: boolean) =>
        onChange({
            ...pergunta,
            alternativas: [
                { texto: "Verdadeiro", correta: v },
                { texto: "Falso", correta: !v },
            ],
        });

    return (
        <>
            <label className={styles.label} htmlFor="afirmacao">
                Afirmação
            </label>
            <textarea
                maxLength={LIMITE_TEXTO}
                id="afirmacao"
                className={`${styles.input} ${styles.statement}`}
                placeholder="Ex.: O Sol é uma estrela."
                rows={2}
                value={pergunta.enunciado}
                onChange={(e) => onChange({ ...pergunta, enunciado: e.target.value })}
            />
            <span className={styles.helper}>Qual é a resposta correta?</span>
            <div className={styles.vfOptions} role="radiogroup">
                <button
                    type="button"
                    role="radio"
                    aria-checked={verdadeiro}
                    className={`${styles.vfOption} ${verdadeiro ? styles.vfTrue : ""}`}
                    onClick={() => definir(true)}
                >
                    <span className={`${styles.vfIcon} ${styles.vfIconTrue}`}>
                        <Check size={18} />
                    </span>
                    Verdadeiro
                </button>
                <button
                    type="button"
                    role="radio"
                    aria-checked={!verdadeiro}
                    className={`${styles.vfOption} ${!verdadeiro ? styles.vfFalse : ""}`}
                    onClick={() => definir(false)}
                >
                    <span className={`${styles.vfIcon} ${styles.vfIconFalse}`}>
                        <X size={18} />
                    </span>
                    Falso
                </button>
            </div>
        </>
    );
}

function EditorOrdenacao({ pergunta, onChange }: EditorProps) {
    const itens = pergunta.alternativas;
    const setItens = (novos: AlternativaRequest[]) => onChange({ ...pergunta, alternativas: novos });
    const mover = (de: number, para: number) => {
        if (para < 0 || para >= itens.length) return;
        const novos = [...itens];
        const [item] = novos.splice(de, 1);
        novos.splice(para, 0, item);
        setItens(novos);
    };

    return (
        <>
            <label className={styles.label} htmlFor="instrucao">
                Instrução
            </label>
            <input
                maxLength={LIMITE_TEXTO}
                id="instrucao"
                className={styles.input}
                placeholder="Ex.: Ordene os eventos do mais antigo para o mais recente"
                value={pergunta.enunciado}
                onChange={(e) => onChange({ ...pergunta, enunciado: e.target.value })}
            />
            <span className={styles.helper}>Digite os itens já na ordem correta. O aluno os receberá embaralhados.</span>
            <ol className={styles.sortList}>
                {itens.map((item, i) => (
                    <li key={i} className={styles.sortItem}>
                        <span className={styles.sortNumber}>{i + 1}</span>
                        <input
                            maxLength={LIMITE_TEXTO}
                            className={styles.inlineInput}
                            placeholder={`Item ${i + 1}`}
                            value={item.texto}
                            onChange={(e) => setItens(itens.map((a, j) => (j === i ? { ...a, texto: e.target.value } : a)))}
                        />
                        <button type="button" className={styles.iconButton} onClick={() => mover(i, i - 1)} disabled={i === 0} aria-label="Mover para cima">
                            <ArrowUp size={14} />
                        </button>
                        <button
                            type="button"
                            className={styles.iconButton}
                            onClick={() => mover(i, i + 1)}
                            disabled={i === itens.length - 1}
                            aria-label="Mover para baixo"
                        >
                            <ArrowDown size={14} />
                        </button>
                        <button
                            type="button"
                            className={styles.iconButton}
                            onClick={() => setItens(itens.filter((_, j) => j !== i))}
                            disabled={itens.length <= 2}
                            aria-label={`Remover item ${i + 1}`}
                        >
                            <Trash2 size={14} />
                        </button>
                    </li>
                ))}
            </ol>
            <button type="button" className={styles.addLink} onClick={() => setItens([...itens, { texto: "", correta: true }])}>
                <Plus size={14} /> Adicionar item
            </button>
        </>
    );
}

function EditorLacunas({ pergunta, onChange }: EditorProps) {
    const campo = useRef<HTMLTextAreaElement>(null);
    const cursor = useRef<number | null>(null);
    const [extra, setExtra] = useState("");

    useLayoutEffect(() => {
        if (cursor.current === null || !campo.current) return;
        campo.current.focus();
        campo.current.setSelectionRange(cursor.current, cursor.current);
        cursor.current = null;
    }, [pergunta.enunciado]);

    const corretas = pergunta.alternativas.filter((a) => a.correta);
    const distratores = pergunta.alternativas.filter((a) => !a.correta);
    const total = contarLacunas(pergunta.enunciado);

    function atualizarTexto(texto: string) {
        const antigos = [...texto.matchAll(LACUNA)].map((m) => Number(m[1]));
        let n = 0;
        const normalizado = texto.replace(LACUNA, () => `{{${++n}}}`);
        const novasCorretas = antigos.map((numero, i) => ({
            texto: corretas.find((a) => a.ordem === numero)?.texto ?? "",
            correta: true,
            ordem: i + 1,
        }));
        onChange({ enunciado: normalizado, alternativas: [...novasCorretas, ...distratores] });
    }

    function inserirLacuna() {
        const el = campo.current;
        const inicio = el?.selectionStart ?? pergunta.enunciado.length;
        const fim = el?.selectionEnd ?? inicio;
        const texto = pergunta.enunciado;
        const antes = texto.slice(0, inicio);
        const espacoAntes = antes && !antes.endsWith(" ") ? " " : "";
        const marcador = `${espacoAntes}{{${total + 1}}} `;
        cursor.current = inicio + marcador.length;
        atualizarTexto(antes + marcador + texto.slice(fim));
    }

    function alterarResposta(ordem: number, texto: string) {
        onChange({
            ...pergunta,
            alternativas: [
                ...corretas.map((a) => (a.ordem === ordem ? { ...a, texto } : a)),
                ...distratores,
            ],
        });
    }

    function adicionarExtra() {
        const palavra = extra.trim();
        if (!palavra) return;
        onChange({ ...pergunta, alternativas: [...pergunta.alternativas, { texto: palavra, correta: false }] });
        setExtra("");
    }

    return (
        <>
            <div className={styles.labelRow}>
                <label className={styles.label} htmlFor="texto-lacunas">
                    Texto com lacunas
                </label>
                <button
                    type="button"
                    className={styles.smallButton}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={inserirLacuna}
                >
                    <Plus size={14} /> Inserir lacuna
                </button>
            </div>
            <textarea
                id="texto-lacunas"
                ref={campo}
                className={styles.input}
                rows={3}
                maxLength={LIMITE_LACUNAS}
                placeholder="Ex.: A capital do Brasil é {{1}} e a da França é {{2}}."
                value={pergunta.enunciado}
                onChange={(e) => atualizarTexto(e.target.value)}
            />
            <span className={styles.helper}>
                Posicione o cursor e clique em "Inserir lacuna". {pergunta.enunciado.length}/{LIMITE_LACUNAS} caracteres.
            </span>

            {total > 0 && (
                <>
                    <div className={styles.preview}>
                        {partesDoTexto(pergunta.enunciado).map((parte, i) =>
                            parte.tipo === "texto" ? (
                                <span key={i}>{parte.valor}</span>
                            ) : (
                                <span key={i} className={styles.previewSlot}>
                                    {corretas.find((a) => a.ordem === parte.numero)?.texto || parte.numero}
                                </span>
                            )
                        )}
                    </div>
                    <div className={styles.gapAnswers}>
                        {Array.from({ length: total }, (_, i) => (
                            <label key={i} className={styles.gapAnswer}>
                                <span className={styles.sortNumber}>{i + 1}</span>
                                <input
                                    maxLength={LIMITE_TEXTO}
                                    className={styles.inlineInput}
                                    placeholder={`Resposta da lacuna ${i + 1}`}
                                    value={corretas.find((a) => a.ordem === i + 1)?.texto ?? ""}
                                    onChange={(e) => alterarResposta(i + 1, e.target.value)}
                                />
                            </label>
                        ))}
                    </div>
                </>
            )}

            <span className={styles.label}>Palavras extras (opcional)</span>
            <div className={styles.chips}>
                {distratores.map((d, i) => (
                    <span key={i} className={styles.chip}>
                        {d.texto}
                        <button
                            type="button"
                            onClick={() =>
                                onChange({
                                    ...pergunta,
                                    alternativas: [...corretas, ...distratores.filter((_, j) => j !== i)],
                                })
                            }
                            aria-label={`Remover ${d.texto}`}
                        >
                            <X size={12} />
                        </button>
                    </span>
                ))}
                <input
                    maxLength={LIMITE_TEXTO}
                    className={styles.chipInput}
                    placeholder="Digite e tecle Enter"
                    value={extra}
                    onChange={(e) => setExtra(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            adicionarExtra();
                        }
                    }}
                    onBlur={adicionarExtra}
                />
            </div>
        </>
    );
}

interface EditorAssociacaoProps {
    perguntas: PerguntaRequest[];
    onChange: (perguntas: PerguntaRequest[]) => void;
}

function EditorAssociacao({ perguntas, onChange }: EditorAssociacaoProps) {
    const alterar = (i: number, lado: "a" | "b", texto: string) =>
        onChange(
            perguntas.map((p, j) =>
                j !== i ? p : lado === "a" ? { ...p, enunciado: texto } : { ...p, alternativas: [{ texto, correta: true }] }
            )
        );

    return (
        <>
            <span className={styles.helper}>
                Cada linha é um par. O aluno verá a coluna da direita embaralhada e precisará ligar os itens.
            </span>
            <div className={styles.pairsHeader}>
                <span>Coluna A</span>
                <span />
                <span>Coluna B (resposta)</span>
            </div>
            <div className={styles.pairs}>
                {perguntas.map((p, i) => (
                    <div key={i} className={styles.pair}>
                        <div className={styles.pairSide}>
                            <span className={styles.sortNumber}>{i + 1}</span>
                            <input
                                maxLength={LIMITE_TEXTO}
                                className={styles.inlineInput}
                                placeholder="Ex.: Brasil"
                                value={p.enunciado}
                                onChange={(e) => alterar(i, "a", e.target.value)}
                            />
                        </div>
                        <Link2 size={18} className={styles.pairLink} />
                        <div className={styles.pairSide}>
                            <input
                                maxLength={LIMITE_TEXTO}
                                className={styles.inlineInput}
                                placeholder="Ex.: Brasília"
                                value={p.alternativas[0]?.texto ?? ""}
                                onChange={(e) => alterar(i, "b", e.target.value)}
                            />
                        </div>
                        <button
                            type="button"
                            className={styles.iconButton}
                            onClick={() => onChange(perguntas.filter((_, j) => j !== i))}
                            disabled={perguntas.length <= 2}
                            aria-label={`Remover par ${i + 1}`}
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}
            </div>
            <button type="button" className={styles.addLink} onClick={() => onChange([...perguntas, perguntaVazia("ASSOCIACAO")])}>
                <Plus size={14} /> Adicionar par
            </button>
        </>
    );
}

interface EditorPerguntasProps {
    tipo: TipoAtividade;
    perguntas: PerguntaRequest[];
    onChange: (perguntas: PerguntaRequest[]) => void;
    indice: number;
    onIndice: (indice: number) => void;
}

export function EditorPerguntas({ tipo, perguntas, onChange, indice, onIndice }: EditorPerguntasProps) {
    if (tipo === "ASSOCIACAO") return <EditorAssociacao perguntas={perguntas} onChange={onChange} />;

    const atual = perguntas[indice] ?? perguntas[0];
    const alterar = (p: PerguntaRequest) => onChange(perguntas.map((q, j) => (j === indice ? p : q)));
    const remover = () => {
        onChange(perguntas.filter((_, j) => j !== indice));
        onIndice(Math.max(0, indice - 1));
    };

    const Editor =
        tipo === "VERDADEIRO_FALSO"
            ? EditorVerdadeiroFalso
            : tipo === "ORDENACAO"
              ? EditorOrdenacao
              : tipo === "LACUNAS"
                ? EditorLacunas
                : EditorQuiz;

    return (
        <>
            <div className={styles.questionNav}>
                <nav className={styles.dots} aria-label="Perguntas">
                    {perguntas.map((_, i) => (
                        <button
                            key={i}
                            type="button"
                            className={`${styles.dot} ${i === indice ? styles.dotActive : ""}`}
                            onClick={() => onIndice(i)}
                            aria-current={i === indice ? "step" : undefined}
                            aria-label={`Pergunta ${i + 1}`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </nav>
                {perguntas.length > 1 && (
                    <button type="button" className={styles.removeQuestion} onClick={remover}>
                        <Trash2 size={14} /> Remover pergunta
                    </button>
                )}
            </div>
            {atual && <Editor key={indice} pergunta={atual} onChange={alterar} />}
        </>
    );
}
