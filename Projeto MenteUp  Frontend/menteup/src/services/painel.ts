import { apiFetch, lerErro } from "./api";

// GET /dashboard/painel: o backend recorta os dados pelo perfil de quem está logado
// (aluno: os próprios; professor: as turmas dele e os alunos delas; administrador: tudo).

export type DiasPainel = 7 | 30 | 90 | 365;

export const PERIODOS: { dias: DiasPainel; rotulo: string }[] = [
    { dias: 7, rotulo: "Últimos 7 dias" },
    { dias: 30, rotulo: "Últimos 30 dias" },
    { dias: 90, rotulo: "Últimos 90 dias" },
    { dias: 365, rotulo: "Último ano" },
];

export interface OpcaoPainel {
    id: number;
    nome: string;
}

export interface ResumoPainel {
    turmas: number;
    alunos: number;
    atividadesPublicadas: number;
    atividadesConcluidas: number;
    acertoAtividades: number | null;
    pontosAtividades: number;
    respostasDesafios: number;
    acertoDesafios: number | null;
    pontosDesafios: number;
}

export interface AlunoPainel {
    id: number;
    nome: string;
    atividadesConcluidas: number;
    acerto: number | null;
    pontosAtividades: number;
    respostasDesafios: number;
    pontosDesafios: number;
}

export interface Painel {
    perfil: "ALUNO" | "PROFESSOR" | "ADMINISTRADOR";
    dias: DiasPainel;
    turmaId: number | null;
    alunoId: number | null;
    turmas: OpcaoPainel[];
    alunos: OpcaoPainel[];
    resumo: ResumoPainel;
    conclusoesPorDia: { dia: string; concluidas: number }[];
    acertoPorTurma: { turma: string; acerto: number | null }[];
    desempenhoAlunos: AlunoPainel[];
}

export interface FiltrosPainel {
    dias: DiasPainel;
    turmaId: number | null;
    alunoId: number | null;
}

export async function carregarPainel(filtros: FiltrosPainel): Promise<Painel> {
    const parametros = new URLSearchParams({ dias: String(filtros.dias) });
    if (filtros.turmaId !== null) parametros.set("turmaId", String(filtros.turmaId));
    if (filtros.alunoId !== null) parametros.set("alunoId", String(filtros.alunoId));

    const resposta = await apiFetch(`/dashboard/painel?${parametros}`);
    if (!resposta.ok) {
        throw new Error((await lerErro(resposta, "Não foi possível carregar o painel.")).mensagem);
    }
    return resposta.json();
}

export function formatarPercentual(valor: number | null): string {
    return valor === null ? "–" : `${valor.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
}
