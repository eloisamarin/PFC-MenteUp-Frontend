import {apiFetch} from "./api";

export type Perfil = "ALUNO" | "PROFESSOR" | "ADMINISTRADOR";
export type PerfilGestao = Exclude<Perfil, "ALUNO">;
export type StatusDesafio = "AGUARDANDO" | "EM_ANDAMENTO" | "ENCERRADO";

export const ROTA_BASE: Record<Perfil, string> = {
    ALUNO: "/aluno",
    PROFESSOR: "/professor",
    ADMINISTRADOR: "/administrador",
};

export const LETRAS_ALTERNATIVA = ["A", "B", "C", "D"];

export interface ProfessorResponsavel {
    id: number;
    nome: string;
}

export interface TurmaResumo {
    id: number;
    nome: string;
    // Professor que tem acesso às atividades e desafios da turma (null = só o administrador)
    professorResponsavel?: ProfessorResponsavel | null;
    // Arquivada: sai das listas e não recebe nada novo, mas mantém o histórico
    arquivada?: boolean;
}

/** GET /turmas/{id}/exclusao: se a turma pode ser excluída e, se não, o motivo. */
export interface ExclusaoTurma {
    podeExcluir: boolean;
    alunos: number;
    desafios: number;
    resultados: number;
    atividadesEmAndamento: number;
    motivo: string | null;
}

export interface AlunoTurma {
    id: number;
    nomeUsuario: string;
    // E-mail: só vem para o administrador (LGPD). Na turma e para o professor, não vem.
    usuario?: string;
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
    avatar?: string | null;
}

export function contagem(quantidade: number, singular: string, plural: string) {
    return `${quantidade} ${quantidade === 1 ? singular : plural}`;
}


export function usuarioLogado(): { id?: number; nome?: string; avatar?: string | null } {
    try {
        return JSON.parse(localStorage.getItem("usuario") ?? "{}");
    } catch {
        return {};
    }
}

/** Professores que o administrador pode vincular a uma turma. */
export async function carregarProfessores(): Promise<ProfessorResponsavel[]> {
    const resposta = await apiFetch("/usuarios/all");
    if (!resposta.ok) throw new Error("Falha ao consultar os professores.");

    const usuarios: { id: number; nomeUsuario: string; tipoUsuario?: string }[] = await resposta.json();
    return usuarios
        .filter((usuario) => usuario.tipoUsuario?.toUpperCase() === "PROFESSOR")
        .map((usuario) => ({id: usuario.id, nome: usuario.nomeUsuario}))
        .sort((a, b) => a.nome.localeCompare(b.nome));
}

/** O professor só altera as turmas dele; o administrador, todas. */
export function podeAlterarTurma(turma: TurmaResumo, perfil: PerfilGestao): boolean {
    if (perfil === "ADMINISTRADOR") return true;
    const id = usuarioLogado().id;
    return id !== undefined && turma.professorResponsavel?.id === id;
}
