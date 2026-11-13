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

// Uma pergunta respondida pelo aluno (atividade ou desafio)
export interface QuestaoAluno {
    enunciado: string;
    correta: boolean | null;          // null: atividade concluída antes de guardarmos o acerto
    respostaAluno: string | null;
    respostaCorreta: string | null;   // só em Quiz, V/F e desafio
}

// Uma atividade concluída pelo aluno
export interface AtividadeDoAluno {
    resultadoId: number;
    atividadeId: number;
    titulo: string;
    tipo: string;                     // QUIZ, VERDADEIRO_FALSO, ASSOCIACAO, ORDENACAO, LACUNAS
    pontuacao: number;
    pontuacaoMaxima: number;
    acertos: number;
    totalQuestoes: number;
    concluidaEm: string;
    comentario: string | null;
    comentadoPor: string | null;
    questoes: QuestaoAluno[];
}

// Um desafio respondido pelo aluno
export interface DesafioDoAluno {
    desafioId: number;
    titulo: string;
    pontos: number;
    acertos: number;
    totalPerguntas: number;
    questoes: QuestaoAluno[];
}

// Resposta de GET /turmas/{turmaId}/alunos/{alunoId}/desempenho
export interface DesempenhoIndividual {
    alunoId: number;
    nomeAluno: string;
    turmaId: number;
    nomeTurma: string;
    atividades: AtividadeDoAluno[];
    desafios: DesafioDoAluno[];
}

// Resposta de PUT /turmas/{turmaId}/resultados/{resultadoId}/comentario
export interface ComentarioSalvo {
    resultadoId: number;
    comentario: string;
    comentadoPor: string;
    comentadoEm: string;
}