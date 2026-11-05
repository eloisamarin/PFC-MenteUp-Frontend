// Item do seletor: resposta de GET /turmas/minhas
export interface TurmaResumo {
    id: number;
    nome: string;
}

// Um aluno na tabela
export interface DesempenhoAluno {
    alunoId: number;
    nomeAluno: string;
    pontuacao: number;
    acertos: number;
    atividadesConcluidas: number;
}

// Resposta de GET /turmas/{id}/desempenho
export interface DesempenhoDaTurma {
    turmaId: number;
    nomeTurma: string;
    totalAlunos: number;
    totalAtividades: number;
    mediaPontuacao: number;
    taxaParticipacao: number;
    alunos: DesempenhoAluno[];
}