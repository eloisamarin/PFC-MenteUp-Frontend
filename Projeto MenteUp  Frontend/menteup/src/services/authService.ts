import { API_URL, lerErro, type ErroApi } from "./api";

/** Erro da API com o código (ex.: CODIGO_2FA_BLOQUEADO), para a tela decidir o que mostrar. */
export class ErroAutenticacao extends Error {
    readonly codigo: string;

    constructor(erro: ErroApi) {
        super(erro.mensagem);
        this.codigo = erro.codigo;
    }
}

export async function validar2FA(
    usuario: string,
    codigo: string
) {
    const response = await fetch(`${API_URL}/usuarios/validar-2fa`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            usuario,
            codigo
        })
    });

    if (!response.ok) {
        throw new ErroAutenticacao(await lerErro(response, "Código inválido ou expirado."));
    }

    return await response.json();
}

/** Pede um novo código 2FA (o anterior deixa de valer). */
export async function reenviar2FA(usuario: string): Promise<void> {
    const response = await fetch(`${API_URL}/usuarios/reenviar-2fa`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ usuario })
    });

    if (!response.ok) {
        throw new ErroAutenticacao(await lerErro(response, "Não foi possível reenviar o código."));
    }
}
