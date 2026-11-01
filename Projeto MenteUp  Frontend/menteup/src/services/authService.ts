export async function validar2FA(
    usuario: string,
    codigo: string
) {
    const response = await fetch(
        "http://localhost:8080/usuarios/validar-2fa",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                usuario,
                codigo
            })
        }
    );

    if (!response.ok) {
        throw new Error("Código inválido ou expirado.");
    }

    return await response.json();
}