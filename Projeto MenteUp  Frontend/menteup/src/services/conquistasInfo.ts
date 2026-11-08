import type { Categoria, Conquista, Raridade, ResumoConquistas } from "../types/conquista";

export const NOME_RARIDADE: Record<Raridade, string> = {
    BRONZE: "Bronze",
    PRATA: "Prata",
    OURO: "Ouro",
    ESPECIAL: "Especial",
};

export const TITULO_CATEGORIA: Record<Categoria, string> = {
    NIVEL: "Níveis",
    ATIVIDADE: "Atividades",
    RANKING: "Ranking",
    INTENSIVAO: "Intensivão",
};

export const fmt = (n: number) => n.toLocaleString("pt-BR");

// A data já vem no horário de Brasília; lemos dia, mês e ano direto do texto
export function formatarData(data: string | null): string | null {
    if (!data) return null;
    const partes = /^(\d{4})-(\d{2})-(\d{2})/.exec(data);
    return partes ? `${partes[3]}/${partes[2]}/${partes[1]}` : null;
}

export function daCategoria(resumo: ResumoConquistas | null, categoria: Categoria): Conquista[] {
    return resumo ? resumo.conquistas.filter((c) => c.categoria === categoria) : [];
}

export interface InfoNivel {
    niveis: Conquista[];
    atual: Conquista | null;
    proximo: Conquista | null;
    numeroAtual: number;
    faltamXp: number;
}

// Nível atual = último nível ganho; próximo = primeiro ainda não ganho
export function infoNivel(resumo: ResumoConquistas | null): InfoNivel {
    const niveis = daCategoria(resumo, "NIVEL");
    const atual = [...niveis].reverse().find((c) => c.desbloqueada) ?? null;
    const proximo = niveis.find((c) => !c.desbloqueada) ?? null;
    const xp = resumo?.xpTotal ?? 0;

    return {
        niveis,
        atual,
        proximo,
        numeroAtual: atual ? niveis.indexOf(atual) + 1 : 0,
        faltamXp: proximo ? Math.max(0, proximo.meta - xp) : 0,
    };
}

const LETRAS_SEMANA = ["D", "S", "T", "Q", "Q", "S", "S"];

// Últimos 7 dias até hoje; os dias da sequência atual aparecem marcados
export function semanaDaSequencia(diasConsecutivos: number, hoje = new Date()) {
    const marcados = Math.min(Math.max(diasConsecutivos, 0), 7);

    return Array.from({ length: 7 }, (_, i) => {
        const dia = new Date(hoje);
        dia.setDate(hoje.getDate() - (6 - i));
        return {
            letra: LETRAS_SEMANA[dia.getDay()],
            marcado: i >= 7 - marcados,
            hoje: i === 6,
        };
    });
}

// Conquistas que só têm "sim ou não" não mostram barra de progresso
export function mostraBarra(c: Conquista): boolean {
    return !c.desbloqueada && !c.secreta && c.codigo !== "PRIMEIRO_LUGAR" && c.meta > 1;
}

export function textoProgresso(c: Conquista): string {
    if (c.codigo === "SUBIU_CINCO_POSICOES") {
        return `${fmt(c.progressoAtual)}/${fmt(c.meta)} posições`;
    }
    return `${fmt(c.progressoAtual)}/${fmt(c.meta)}`;
}
