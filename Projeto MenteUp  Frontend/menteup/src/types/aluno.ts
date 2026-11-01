/* Tipos compartilhados pelas telas do aluno (mesmo formato da API) */

export interface Turma {
    id: number;
    nome: string;
}

export interface Atividade {
    id: number;
    titulo: string;
    descricao: string;
    pontuacao: number;
    status: "PENDENTE" | "EM_ANDAMENTO" | "CONCLUIDO";
    dataCriacao: string;
    turma?: Turma;
}

export interface AtividadeAluno {
    atividade: Atividade;
    status: "PENDENTE" | "EM_ANDAMENTO" | "CONCLUIDA";
    acertos: number | null;
    pontuacao: number | null;
    percentualConclusao: number | null;
}

export interface RankingAluno {
    usuarioId: number;
    nomeUsuario: string;
    pontuacaoTotal: number;
    atividadesConcluidas: number;
}

/** Como o aluno enxerga a atividade */
export type VisaoStatus = "PENDENTE" | "EM_ANDAMENTO" | "CONCLUIDA" | "ENCERRADA";

export function visaoStatus(item: AtividadeAluno): VisaoStatus {
    if (item.status === "CONCLUIDA") return "CONCLUIDA";
    if (item.status === "EM_ANDAMENTO") return "EM_ANDAMENTO";
    return item.atividade.status === "CONCLUIDO" ? "ENCERRADA" : "PENDENTE";
}

/** Atividade que o aluno ainda pode fazer */
export function estaAberta(item: AtividadeAluno) {
    const v = visaoStatus(item);
    return v === "PENDENTE" || v === "EM_ANDAMENTO";
}
