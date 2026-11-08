import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Sparkles, X } from "lucide-react";

import IconeConquista from "./IconeConquista";
import { NOME_RARIDADE, fmt } from "../../services/conquistasInfo";
import type { Conquista } from "../../types/conquista";
import styles from "./ComemoracaoConquistas.module.css";

interface Props {
    conquistas: Conquista[];
    aoFechar: () => void;
}

// Janela que comemora uma ou várias conquistas de uma vez, em formato de carrossel
export default function ComemoracaoConquistas({ conquistas, aoFechar }: Props) {
    const [indice, setIndice] = useState(0);
    const botaoPrincipal = useRef<HTMLButtonElement>(null);

    const total = conquistas.length;
    const atual = conquistas[Math.min(indice, total - 1)];
    const ultima = indice >= total - 1;
    const xpGanho = conquistas.reduce((soma, c) => soma + c.recompensaXp, 0);

    useEffect(() => {
        botaoPrincipal.current?.focus();
    }, [indice]);

    useEffect(() => {
        function teclado(e: KeyboardEvent) {
            if (e.key === "Escape") aoFechar();
            if (e.key === "ArrowRight") setIndice((i) => Math.min(i + 1, total - 1));
            if (e.key === "ArrowLeft") setIndice((i) => Math.max(i - 1, 0));
        }
        window.addEventListener("keydown", teclado);
        return () => window.removeEventListener("keydown", teclado);
    }, [aoFechar, total]);

    if (!atual) return null;

    return (
        <div className={styles.fundo} onClick={aoFechar}>
            <div
                className={styles.janela}
                role="dialog"
                aria-modal="true"
                aria-labelledby="titulo-comemoracao"
                onClick={(e) => e.stopPropagation()}
            >
                <button type="button" className={styles.fechar} onClick={aoFechar} aria-label="Fechar">
                    <X size={18} />
                </button>

                <span className={styles.selo}>
                    <Sparkles size={14} />
                    {total > 1 ? `Você ganhou ${total} conquistas!` : "Conquista desbloqueada!"}
                </span>

                <div className={styles.palco} key={atual.id}>
                    <div className={styles.brilho} aria-hidden />
                    <IconeConquista conquista={{ ...atual, desbloqueada: true }} tamanho="lg" />

                    <span className={`${styles.raridade} ${styles[atual.raridade.toLowerCase()]}`}>
                        {NOME_RARIDADE[atual.raridade]}
                    </span>
                    <h2 id="titulo-comemoracao" className={styles.nome}>{atual.nome}</h2>
                    <p className={styles.descricao}>{atual.descricao}</p>
                    <strong className={styles.xp}>+{fmt(atual.recompensaXp)} XP</strong>
                </div>

                {total > 1 && (
                    <div className={styles.navegacao}>
                        <button
                            type="button"
                            className={styles.seta}
                            onClick={() => setIndice((i) => Math.max(i - 1, 0))}
                            disabled={indice === 0}
                            aria-label="Conquista anterior"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <div className={styles.pontos}>
                            {conquistas.map((c, i) => (
                                <button
                                    key={c.id}
                                    type="button"
                                    className={`${styles.ponto} ${i === indice ? styles.pontoAtivo : ""}`}
                                    onClick={() => setIndice(i)}
                                    aria-label={`Ver ${c.nome}`}
                                />
                            ))}
                        </div>
                        <button
                            type="button"
                            className={styles.seta}
                            onClick={() => setIndice((i) => Math.min(i + 1, total - 1))}
                            disabled={ultima}
                            aria-label="Próxima conquista"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                )}

                {total > 1 && (
                    <p className={styles.totalXp}>Total recebido: +{fmt(xpGanho)} XP</p>
                )}

                <button
                    ref={botaoPrincipal}
                    type="button"
                    className={styles.botao}
                    onClick={ultima ? aoFechar : () => setIndice((i) => i + 1)}
                >
                    {ultima ? "Continuar" : "Próxima conquista"}
                </button>
            </div>
        </div>
    );
}
