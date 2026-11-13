import type { CSSProperties } from "react";

import styles from "./Logo.module.css";

interface LogoMarcaProps {
    /** Lado do quadrado em pixels */
    tamanho?: number;
}

// Quadrado com o "M": o texto ao lado já diz "MenteUp", então o ícone é decorativo
export function LogoMarca({ tamanho = 40 }: LogoMarcaProps) {
    return (
        <span className={styles.marca} style={{ "--tam": `${tamanho}px` } as CSSProperties} aria-hidden="true">
            M
        </span>
    );
}

// Nome "MenteUp" com o "Up" em destaque; o tamanho da fonte vem da classe de cada tela
export function LogoNome({ className = "" }: { className?: string }) {
    return (
        <span className={`${styles.nome} ${className}`}>
            Mente<span className={styles.up}>Up</span>
        </span>
    );
}
