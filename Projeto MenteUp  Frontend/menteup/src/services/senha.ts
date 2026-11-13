// Regras de senha nova: as mesmas do backend (RegraSenha.java).
// A tela usa para mostrar a lista e travar o envio; o backend confere de novo.

export interface RequisitoSenha {
    rotulo: string;
    atendido: boolean;
}

// Qualquer símbolo conta: não é letra, número nem espaço
const CARACTERE_ESPECIAL = /[^\p{L}\p{N}\s]/u;

export function requisitosSenha(senha: string): RequisitoSenha[] {
    return [
        { rotulo: "Mínimo de 8 caracteres", atendido: senha.length >= 8 },
        { rotulo: "Uma letra maiúscula", atendido: /\p{Lu}/u.test(senha) },
        { rotulo: "Uma letra minúscula", atendido: /\p{Ll}/u.test(senha) },
        { rotulo: "Um número", atendido: /\p{N}/u.test(senha) },
        { rotulo: "Um caractere especial (@ # $ % !)", atendido: CARACTERE_ESPECIAL.test(senha) },
        { rotulo: "Sem espaço no início ou no fim", atendido: senha === "" || senha === senha.trim() },
    ];
}

/** Devolve a mensagem do primeiro problema, ou null se a senha atende a todas as regras. */
export function problemaSenha(senha: string): string | null {
    if (!senha) return "Informe a senha.";
    if (new TextEncoder().encode(senha).length > 72) {
        return "A senha é longa demais. Use até 72 caracteres (letras com acento contam como 2).";
    }
    const faltando = requisitosSenha(senha).filter((r) => !r.atendido);
    if (faltando.length === 0) return null;
    return "A senha ainda não atende: " + faltando.map((r) => r.rotulo.toLowerCase()).join(", ") + ".";
}

export function senhaForte(senha: string): boolean {
    return problemaSenha(senha) === null;
}
