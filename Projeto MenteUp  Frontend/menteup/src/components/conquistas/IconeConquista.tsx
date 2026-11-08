import type { ComponentType } from "react";
import {
    Award,
    BookOpen,
    Crown,
    Flame,
    Footprints,
    GraduationCap,
    Library,
    Lightbulb,
    Lock,
    Medal,
    Network,
    NotebookPen,
    Rocket,
    Sprout,
    Target,
    TrendingUp,
} from "lucide-react";

import type { Conquista } from "../../types/conquista";
import styles from "./IconeConquista.module.css";

type Icone = ComponentType<{ size?: number; strokeWidth?: number }>;

// Cada nome que vem da API ganha um desenho; nomes novos usam a medalha padrão
const ICONES: Record<string, Icone> = {
    "nivel-iniciante": Sprout,
    "nivel-intermediario": TrendingUp,
    "nivel-avancado": Network,
    "nivel-mestre": GraduationCap,
    "nivel-genio": Lightbulb,
    "primeira-atividade": Footprints,
    "atividade-perfeita": Target,
    "dez-atividades": BookOpen,
    "vinte-cinco-atividades": NotebookPen,
    "cinquenta-atividades": Library,
    "setenta-cinco-atividades": Award,
    "subiu-cinco-posicoes": Rocket,
    "primeiro-lugar": Crown,
    "intensivao-5": Flame,
    "intensivao-15": Flame,
    "intensivao-30": Flame,
    "intensivao-60": Flame,
    "intensivao-90": Flame,
};

const CLASSE_RARIDADE = {
    BRONZE: styles.bronze,
    PRATA: styles.prata,
    OURO: styles.ouro,
    ESPECIAL: styles.especial,
};

interface Props {
    conquista: Conquista;
    tamanho?: "sm" | "md" | "lg";
}

export default function IconeConquista({ conquista, tamanho = "md" }: Props) {
    const escondida = conquista.secreta && !conquista.desbloqueada;
    const Desenho = escondida ? Lock : (conquista.icone && ICONES[conquista.icone]) || Medal;
    const px = tamanho === "lg" ? 44 : tamanho === "sm" ? 16 : 18;

    return (
        <span
            className={[
                styles.icone,
                styles[tamanho],
                CLASSE_RARIDADE[conquista.raridade],
                conquista.desbloqueada ? styles.ganha : styles.pendente,
            ].join(" ")}
            aria-hidden
        >
            <Desenho size={px} strokeWidth={2} />
        </span>
    );
}
