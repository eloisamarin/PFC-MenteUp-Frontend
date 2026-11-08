import { createContext } from "react";
import type { ResumoConquistas } from "../types/conquista";

export interface ValorConquistas {
    resumo: ResumoConquistas | null;
    carregando: boolean;
    erro: string;
    carregarResumo: (forcar?: boolean) => Promise<void>;
    verificarNovas: () => Promise<void>;
    verificarAoEntrar: () => void;
}

export const ConquistasContexto = createContext<ValorConquistas | null>(null);
