/**
 * Lê o usuário salvo no localStorage pelo login.
 * O formato vem da resposta de /usuarios/logar, por isso
 * todos os campos são tratados como opcionais.
 */
export interface UsuarioLogado {
    id?: number;
    usuarioId?: number;
    nome?: string;
    usuario?: string;
    tipoUsuario?: string;
}

export function obterUsuarioLogado(): UsuarioLogado | null {
    try {
        const salvo = localStorage.getItem("usuario");
        return salvo ? (JSON.parse(salvo) as UsuarioLogado) : null;
    } catch {
        return null;
    }
}

export function idDoUsuario(usuario: UsuarioLogado | null): number | null {
    const id = usuario?.id ?? usuario?.usuarioId ?? Number(localStorage.getItem("usuarioId"));
    return id ? Number(id) : null;
}

/** "Lívia Vieira" -> "Lívia" (cai para o e-mail se não houver nome) */
export function primeiroNome(usuario: UsuarioLogado | null): string {
    const base = usuario?.nome?.trim() || usuario?.usuario?.split("@")[0] || "aluno";
    return base.split(/\s+/)[0];
}

/** "Lívia Vieira" -> "LV" */
export function iniciais(nome?: string): string {
    if (!nome) return "?";
    const partes = nome.trim().split(/\s+/);
    const primeira = partes[0]?.[0] ?? "";
    const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
    return (primeira + ultima).toUpperCase() || "?";
}

/** "Lívia Vieira" -> "Lívia V." */
export function nomeCurto(nome?: string): string {
    if (!nome) return "";
    const partes = nome.trim().split(/\s+/);
    return partes.length > 1 ? `${partes[0]} ${partes[partes.length - 1][0]}.` : partes[0];
}

export function sair() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    localStorage.removeItem("usuarioId");
}
