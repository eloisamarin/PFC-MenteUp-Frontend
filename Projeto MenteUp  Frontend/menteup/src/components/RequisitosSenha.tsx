import { Circle, CircleCheck } from "lucide-react";

import { requisitosSenha } from "../services/senha";

/*
 * Lista das regras da senha, que vai ficando verde enquanto a pessoa digita.
 * Usada no cadastro, no primeiro acesso, no "Esqueci minha senha" e no "Meu perfil".
 */
function RequisitosSenha({ senha }: { senha: string }) {
    const requisitos = requisitosSenha(senha);

    return (
        <ul
            aria-label="Requisitos da senha"
            style={{ listStyle: "none", margin: "6px 0 0", padding: 0, display: "grid", gap: 4, fontSize: 13 }}
        >
            {requisitos.map((requisito) => (
                <li
                    key={requisito.rotulo}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        color: requisito.atendido ? "var(--mu-teal)" : "inherit",
                        opacity: requisito.atendido ? 1 : 0.75,
                    }}
                >
                    {requisito.atendido
                        ? <CircleCheck size={14} aria-hidden="true" />
                        : <Circle size={14} aria-hidden="true" />}
                    <span>
                        {requisito.rotulo}
                        <span className="sr-only">{requisito.atendido ? " (atendido)" : " (pendente)"}</span>
                    </span>
                </li>
            ))}
        </ul>
    );
}

export default RequisitosSenha;
