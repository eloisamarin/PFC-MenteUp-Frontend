import { useState, type DragEvent } from "react";
import { ArrowDown, ArrowUp, Check, X } from "lucide-react";

import type { TipoAtividade } from "../../types/aluno";
import styles from "./Players.module.css";

export interface AlternativaPlayer {
    id: number;
    texto: string;
    correta?: boolean;
    ordem?: number;
}

export interface PerguntaPlayer {
    id: number;
    texto: string;
    alternativas: AlternativaPlayer[];
}

export type Valor = (number | null)[];

export interface CorpoResposta {
    perguntaId: number;
    alternativaId?: number;
    alternativasIds?: number[];
}

const LETRAS = "ABCDEFGH";
const CORES = ["#00a99e", "#edbe24", "#615fff", "#eb6456", "#c27aff", "#3ba3ff", "#ff9f43", "#2ed47a"];
const LACUNA = /\{\{(\d{1,3})\}\}/g;

type Parte = { tipo: "texto"; valor: string } | { tipo: "lacuna"; numero: number };

export function partesDoTexto(texto: string): Parte[] {
    const partes: Parte[] = [];
    let ultimo = 0;
    for (const m of texto.matchAll(LACUNA)) {
        const inicio = m.index ?? 0;
        if (inicio > ultimo) partes.push({ tipo: "texto", valor: texto.slice(ultimo, inicio) });
        partes.push({ tipo: "lacuna", numero: Number(m[1]) });
        ultimo = inicio + m[0].length;
    }
    if (ultimo < texto.length) partes.push({ tipo: "texto", valor: texto.slice(ultimo) });
    return partes;
}

export const contarLacunas = (texto: string) => [...texto.matchAll(LACUNA)].length;

export function usaLista(tipo: TipoAtividade) {
    return tipo === "ORDENACAO" || tipo === "LACUNAS";
}

export function valorInicial(tipo: TipoAtividade, pergunta: PerguntaPlayer): Valor {
    if (tipo === "ORDENACAO") return pergunta.alternativas.map((a) => a.id);
    if (tipo === "LACUNAS") return Array(contarLacunas(pergunta.texto)).fill(null);
    return [null];
}

export function respostaCompleta(valor: Valor | undefined) {
    return !!valor && valor.length > 0 && valor.every((v) => v !== null);
}

export function corpoResposta(tipo: TipoAtividade, perguntaId: number, valor: Valor): CorpoResposta {
    if (usaLista(tipo)) return { perguntaId, alternativasIds: valor as number[] };
    return { perguntaId, alternativaId: valor[0] as number };
}

interface PlayerProps {
    pergunta: PerguntaPlayer;
    valor: Valor;
    onChange?: (valor: Valor) => void;
    gabarito?: boolean;
}

function PlayerQuiz({ pergunta, valor, onChange, gabarito }: PlayerProps) {
    const linhas = Math.ceil(pergunta.alternativas.length / 2);
    return (
        <>
            <p className={styles.hint}>
                {gabarito ? "Confira as alternativas cadastradas:" : "Observe o que já aprendeu e escolha uma resposta:"}
            </p>
            <h1 className={styles.question}>{pergunta.texto}</h1>
            <div
                className={styles.options}
                role="radiogroup"
                style={{ gridTemplateRows: `repeat(${linhas}, auto)` }}
            >
                {pergunta.alternativas.map((alt, i) => {
                    const marcada = gabarito ? !!alt.correta : valor[0] === alt.id;
                    return (
                        <button
                            key={alt.id}
                            type="button"
                            role="radio"
                            aria-checked={marcada}
                            disabled={gabarito}
                            className={`${styles.option} ${marcada ? (gabarito ? styles.optionCorrect : styles.optionSelected) : ""}`}
                            onClick={() => onChange?.([alt.id])}
                        >
                            <span className={styles.letter}>{LETRAS[i] ?? i + 1}</span>
                            <span className={styles.optionText}>{alt.texto}</span>
                            {gabarito && alt.correta && (
                                <span className={styles.correctBadge}>
                                    <Check size={14} /> Correta
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </>
    );
}

function PlayerVerdadeiroFalso({ pergunta, valor, onChange, gabarito }: PlayerProps) {
    const ehVerdadeiro = (a: AlternativaPlayer) => a.texto.trim().toLowerCase().startsWith("v");
    const ordenadas = [...pergunta.alternativas].sort((a, b) => Number(ehVerdadeiro(b)) - Number(ehVerdadeiro(a)));

    return (
        <>
            <p className={styles.hint}>{gabarito ? "Afirmação cadastrada:" : "Leia a afirmação e decida:"}</p>
            <blockquote className={styles.statement}>“{pergunta.texto}”</blockquote>
            <div className={styles.vfOptions} role="radiogroup">
                {ordenadas.map((alt) => {
                    const verdadeiro = ehVerdadeiro(alt);
                    const marcada = gabarito ? !!alt.correta : valor[0] === alt.id;
                    return (
                        <button
                            key={alt.id}
                            type="button"
                            role="radio"
                            aria-checked={marcada}
                            disabled={gabarito}
                            className={`${styles.vfOption} ${marcada ? (verdadeiro ? styles.vfTrue : styles.vfFalse) : ""}`}
                            onClick={() => onChange?.([alt.id])}
                        >
                            <span className={`${styles.vfIcon} ${verdadeiro ? styles.vfIconTrue : styles.vfIconFalse}`}>
                                {verdadeiro ? <Check size={20} /> : <X size={20} />}
                            </span>
                            {verdadeiro ? "Verdadeiro" : "Falso"}
                            {gabarito && alt.correta && <span className={styles.correctBadge}>Resposta</span>}
                        </button>
                    );
                })}
            </div>
        </>
    );
}

function PlayerOrdenacao({ pergunta, valor, onChange, gabarito }: PlayerProps) {
    const [arrastando, setArrastando] = useState<number | null>(null);
    const porId = new Map(pergunta.alternativas.map((a) => [a.id, a]));
    const ids = gabarito
        ? [...pergunta.alternativas].sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0)).map((a) => a.id)
        : (valor as number[]);

    function mover(de: number, para: number) {
        if (para < 0 || para >= ids.length || de === para) return;
        const nova = [...ids];
        const [item] = nova.splice(de, 1);
        nova.splice(para, 0, item);
        onChange?.(nova);
    }

    function soltar(e: DragEvent, destino: number) {
        e.preventDefault();
        if (arrastando !== null) mover(arrastando, destino);
        setArrastando(null);
    }

    return (
        <>
            <h1 className={styles.title}>{pergunta.texto}</h1>
            <p className={styles.subtitle}>
                {gabarito ? "Sequência correta cadastrada." : "Use as setas ou arraste para mover cada cartão."}
            </p>
            <ol className={styles.sortList}>
                {ids.map((id, i) => (
                    <li
                        key={id}
                        className={`${styles.sortItem} ${arrastando === i ? styles.sortDragging : ""}`}
                        draggable={!gabarito}
                        onDragStart={() => setArrastando(i)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => soltar(e, i)}
                        onDragEnd={() => setArrastando(null)}
                    >
                        <span className={styles.sortNumber}>{i + 1}</span>
                        <span className={styles.sortText}>{porId.get(id)?.texto}</span>
                        {!gabarito && (
                            <span className={styles.sortArrows}>
                                <button
                                    type="button"
                                    className={styles.arrow}
                                    onClick={() => mover(i, i - 1)}
                                    disabled={i === 0}
                                    aria-label="Mover para cima"
                                >
                                    <ArrowUp size={16} />
                                </button>
                                <button
                                    type="button"
                                    className={styles.arrow}
                                    onClick={() => mover(i, i + 1)}
                                    disabled={i === ids.length - 1}
                                    aria-label="Mover para baixo"
                                >
                                    <ArrowDown size={16} />
                                </button>
                            </span>
                        )}
                    </li>
                ))}
            </ol>
        </>
    );
}

function PlayerLacunas({ pergunta, valor, onChange, gabarito }: PlayerProps) {
    const porId = new Map(pergunta.alternativas.map((a) => [a.id, a]));
    const preenchidas: Valor = gabarito
        ? Array.from({ length: contarLacunas(pergunta.texto) }, (_, i) =>
              pergunta.alternativas.find((a) => a.correta && a.ordem === i + 1)?.id ?? null
          )
        : valor;
    const banco = gabarito ? pergunta.alternativas.filter((a) => !a.correta) : pergunta.alternativas;

    function escolher(id: number) {
        const vazia = preenchidas.indexOf(null);
        if (vazia === -1) return;
        const novo = [...preenchidas];
        novo[vazia] = id;
        onChange?.(novo);
    }

    function limpar(posicao: number) {
        const novo = [...preenchidas];
        novo[posicao] = null;
        onChange?.(novo);
    }

    return (
        <>
            <h1 className={styles.title}>Complete a frase</h1>
            <p className={styles.subtitle}>
                {gabarito
                    ? "Lacunas preenchidas com as palavras corretas."
                    : "Toque nas palavras para preencher as lacunas. Toque numa lacuna para desfazer."}
            </p>
            <div className={styles.sentence}>
                {partesDoTexto(pergunta.texto).map((parte, i) => {
                    if (parte.tipo === "texto") return <span key={i}>{parte.valor}</span>;
                    const posicao = parte.numero - 1;
                    const palavra = preenchidas[posicao];
                    return palavra !== null && palavra !== undefined ? (
                        <button
                            key={i}
                            type="button"
                            className={`${styles.slot} ${styles.slotFilled} ${gabarito ? styles.slotCorrect : ""}`}
                            onClick={() => limpar(posicao)}
                            disabled={gabarito}
                        >
                            {porId.get(palavra)?.texto}
                        </button>
                    ) : (
                        <span key={i} className={styles.slot}>
                            {parte.numero}
                        </span>
                    );
                })}
            </div>
            {banco.length > 0 && (
                <>
                    {gabarito && <p className={styles.bankLabel}>Palavras extras</p>}
                    <div className={styles.bank}>
                        {banco.map((alt) => {
                            const usada = !gabarito && preenchidas.includes(alt.id);
                            return (
                                <button
                                    key={alt.id}
                                    type="button"
                                    className={`${styles.word} ${usada ? styles.wordUsed : ""}`}
                                    disabled={usada || gabarito}
                                    onClick={() => escolher(alt.id)}
                                >
                                    {alt.texto}
                                </button>
                            );
                        })}
                    </div>
                </>
            )}
        </>
    );
}

export function PlayerPergunta({ tipo, ...props }: PlayerProps & { tipo: TipoAtividade }) {
    if (tipo === "VERDADEIRO_FALSO") return <PlayerVerdadeiroFalso {...props} />;
    if (tipo === "ORDENACAO") return <PlayerOrdenacao {...props} />;
    if (tipo === "LACUNAS") return <PlayerLacunas {...props} />;
    return <PlayerQuiz {...props} />;
}

interface PlayerAssociacaoProps {
    titulo: string;
    perguntas: PerguntaPlayer[];
    ligacoes: Record<number, number | null>;
    onChange?: (ligacoes: Record<number, number | null>) => void;
    gabarito?: boolean;
}

export function PlayerAssociacao({ titulo, perguntas, ligacoes, onChange, gabarito }: PlayerAssociacaoProps) {
    const [selecionado, setSelecionado] = useState<number | null>(null);

    const pares = gabarito
        ? Object.fromEntries(perguntas.map((p) => [p.id, p.alternativas[0]?.id ?? null]))
        : ligacoes;
    const colunaB = gabarito
        ? perguntas.flatMap((p) => p.alternativas.slice(0, 1))
        : perguntas[0]?.alternativas ?? [];

    const numeroDe = new Map(perguntas.map((p, i) => [p.id, i]));
    const donoDe = new Map<number, number>();
    Object.entries(pares).forEach(([perguntaId, altId]) => {
        if (altId !== null) donoDe.set(altId, Number(perguntaId));
    });

    function clicarB(altId: number) {
        if (gabarito) return;
        const dono = donoDe.get(altId);
        if (selecionado === null) {
            if (dono !== undefined) onChange?.({ ...ligacoes, [dono]: null });
            return;
        }
        const novo = { ...ligacoes };
        if (dono !== undefined) novo[dono] = null;
        novo[selecionado] = altId;
        onChange?.(novo);
        setSelecionado(null);
    }

    return (
        <>
            <h1 className={styles.title}>{titulo}</h1>
            <p className={styles.subtitle}>
                {gabarito
                    ? "Pares cadastrados: cada item da esquerda com o seu correspondente."
                    : "Toque em um item da esquerda e depois no item correspondente da direita."}
            </p>
            <div className={styles.columns}>
                <div className={styles.column}>
                    {perguntas.map((p, i) => {
                        const ligado = pares[p.id] !== null && pares[p.id] !== undefined;
                        const cor = CORES[i % CORES.length];
                        return (
                            <button
                                key={p.id}
                                type="button"
                                disabled={gabarito}
                                className={`${styles.matchItem} ${selecionado === p.id ? styles.matchSelected : ""}`}
                                onClick={() => setSelecionado(selecionado === p.id ? null : p.id)}
                                aria-pressed={selecionado === p.id}
                            >
                                <span
                                    className={styles.matchBadge}
                                    style={ligado ? { background: cor, color: "#041b35" } : undefined}
                                >
                                    {i + 1}
                                </span>
                                <span className={styles.matchText}>{p.texto}</span>
                            </button>
                        );
                    })}
                </div>
                <div className={styles.column}>
                    {colunaB.map((alt) => {
                        const dono = donoDe.get(alt.id);
                        const indice = dono !== undefined ? numeroDe.get(dono) ?? 0 : null;
                        return (
                            <button
                                key={alt.id}
                                type="button"
                                disabled={gabarito}
                                className={`${styles.matchItem} ${indice === null ? styles.matchEmpty : styles.matchLinked}`}
                                onClick={() => clicarB(alt.id)}
                            >
                                <span
                                    className={styles.matchBadge}
                                    style={indice !== null ? { background: CORES[indice % CORES.length], color: "#041b35" } : undefined}
                                >
                                    {indice !== null ? indice + 1 : "?"}
                                </span>
                                <span className={styles.matchText}>{alt.texto}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </>
    );
}
