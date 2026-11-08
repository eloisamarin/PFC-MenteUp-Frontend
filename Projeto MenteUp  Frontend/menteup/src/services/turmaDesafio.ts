export type Perfil = "ALUNO" | "PROFESSOR" | "ADMINISTRADOR";
export type PerfilGestao = Exclude<Perfil, "ALUNO">;
export type StatusDesafio = "AGUARDANDO" | "EM_ANDAMENTO" | "ENCERRADO";

export const ROTA_BASE: Record<Perfil, string> = {
    ALUNO: "/aluno",
    PROFESSOR: "/professor",
    ADMINISTRADOR: "/administrador",
};

export const LETRAS_ALTERNATIVA = ["A", "B", "C", "D"];

export interface TurmaResumo {
    id: number;
    nome: string;
}

export interface AlunoTurma {
    id: number;
    nomeUsuario: string;
    usuario: string;
    tipoUsuario?: string;
}

export interface AtividadeTurma {
    id: number;
    titulo: string;
    status?: string;
}

export interface TurmaDetalhe extends TurmaResumo {
    alunos: AlunoTurma[];
    atividade: AtividadeTurma[];
}

export interface Desafio {
    id: number;
    titulo: string;
    descricao: string;
    status: StatusDesafio;
    turma: TurmaResumo;
    totalPerguntas: number;
    dataCriacao: string;
}

export interface AlternativaDesafio {
    id: number;
    texto: string;
}

export interface PerguntaDesafio {
    id: number;
    enunciado: string;
    tempoSegundos: number;
    alternativas: AlternativaDesafio[];
}

export interface EstadoDesafio {
    desafioId: number;
    titulo: string;
    status: StatusDesafio;
    numeroPergunta: number | null;
    totalPerguntas: number;
    pergunta: PerguntaDesafio | null;
    segundosRestantes: number | null;
    perguntaEncerrada: boolean | null;
    respostasRecebidas: number | null;
    minhaAlternativaId: number | null;
    alternativaCorretaId: number | null;
    meusPontos: number | null;
}

export interface LinhaRanking {
    posicao: number;
    usuarioId: number;
    nomeUsuario: string;
    pontos: number;
    acertos: number;
}

export function contagem(quantidade: number, singular: string, plural: string) {
    return `${quantidade} ${quantidade === 1 ? singular : plural}`;
}

export function usuarioLogado(): { id?: number; nome?: string } {
    try {
        return JSON.parse(localStorage.getItem("usuario") ?? "{}");
    } catch {
        return {};
    }
}
