import { apiFetch, lerErro, type ErroApi } from "./api";
import type { Conquista, ResumoConquistas } from "../types/conquista";

export async function buscarMinhasConquistas(): Promise<ResumoConquistas> {
    const resposta = await apiFetch("/alunos/me/conquistas");
    if (!resposta.ok) {
        throw await lerErro(resposta, "Não foi possível carregar suas conquistas.");
    }
    return resposta.json();
}

// Traz as conquistas que o aluno ainda não comemorou (cada uma vem só uma vez)
export async function buscarConquistasNovas(): Promise<Conquista[]> {
    try {
        const resposta = await apiFetch("/alunos/me/conquistas/novas", { method: "POST" });
        if (!resposta.ok) return [];
        const lista = await resposta.json();
        return Array.isArray(lista) ? lista : [];
    } catch {
        // A comemoração nunca deve travar a tela
        return [];
    }
}

export async function buscarConquistasDoAluno(alunoId: number | string): Promise<ResumoConquistas> {
    const resposta = await apiFetch(`/conquistas/usuario/${alunoId}`);
    if (!resposta.ok) {
        const erro: ErroApi = await lerErro(resposta, "Não foi possível carregar as conquistas do aluno.");
        if (resposta.status === 403) {
            erro.mensagem = "Você não tem acesso às conquistas deste aluno.";
        } else if (resposta.status === 404) {
            erro.mensagem = "Aluno não encontrado.";
        }
        throw erro;
    }
    return resposta.json();
}
