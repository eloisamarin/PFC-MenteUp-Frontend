import type { CSSProperties } from "react";

import logoMenteUp from "../assets/logo-menteup.png";
import styles from "./Logo.module.css";

interface LogoMarcaProps {
    /** Lado do quadrado em pixels */
    tamanho?: number;
}

// Ícone do app (cérebro com a seta): o texto ao lado já diz "MenteUp", então a imagem é decorativa
export function LogoMarca({ tamanho = 40 }: LogoMarcaProps) {
    return (
        <img
            src={logoMenteUp}
            alt=""
            aria-hidden="true"
            width={tamanho}
            height={tamanho}
            className={styles.marca}
            style={{ "--tam": `${tamanho}px` } as CSSProperties}
            draggable={false}
        />
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
