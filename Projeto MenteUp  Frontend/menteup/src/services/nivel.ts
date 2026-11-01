/**
 * Regra de níveis calculada no frontend a partir do XP total.
 * O backend ainda não tem o conceito de nível; quando tiver,
 * basta trocar esta função pela resposta da API.
 */
export const XP_POR_NIVEL = 500;

const TITULOS: { aPartirDe: number; titulo: string }[] = [
    { aPartirDe: 1, titulo: "Iniciante" },
    { aPartirDe: 3, titulo: "Aprendiz" },
    { aPartirDe: 6, titulo: "Explorador" },
    { aPartirDe: 10, titulo: "Desbravador" },
    { aPartirDe: 15, titulo: "Mestre" },
];

export interface InfoNivel {
    nivel: number;
    titulo: string;
    xpProximoNivel: number;
    percentual: number;
}

export function calcularNivel(xp: number): InfoNivel {
    const seguro = Math.max(0, xp || 0);
    const nivel = Math.floor(seguro / XP_POR_NIVEL) + 1;
    const inicio = (nivel - 1) * XP_POR_NIVEL;
    const xpProximoNivel = nivel * XP_POR_NIVEL;
    const percentual = Math.round(((seguro - inicio) / XP_POR_NIVEL) * 100);

    const titulo =
        [...TITULOS].reverse().find((t) => nivel >= t.aPartirDe)?.titulo ?? "Iniciante";

    return { nivel, titulo, xpProximoNivel, percentual };
}

/** Próximo título (liga) e o nível em que ele começa; null se já está no topo */
export function proximaLiga(nivelAtual: number): { titulo: string; aPartirDe: number } | null {
    return TITULOS.find((t) => t.aPartirDe > nivelAtual) ?? null;
}
