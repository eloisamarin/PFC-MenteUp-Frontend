export type Categoria = "NIVEL" | "ATIVIDADE" | "RANKING" | "INTENSIVAO";
export type Raridade = "BRONZE" | "PRATA" | "OURO" | "ESPECIAL";

export interface Conquista {
    id: number;
    codigo: string;
    nome: string;
    descricao: string;
    categoria: Categoria;
    icone: string | null;
    raridade: Raridade;
    secreta: boolean;
    recompensaXp: number;
    desbloqueada: boolean;
    progressoAtual: number;
    meta: number;
    percentual: number;
    dataDesbloqueio: string | null;
}

export interface ResumoConquistas {
    usuarioId: number;
    xpTotal: number;
    conquistasDesbloqueadas: number;
    totalConquistas: number;
    diasConsecutivos: number;
    maiorSequencia: number;
    conquistas: Conquista[];
}
