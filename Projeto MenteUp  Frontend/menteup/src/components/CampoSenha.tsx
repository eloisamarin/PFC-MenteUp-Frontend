import { useState, type CSSProperties } from "react";
import { Eye, EyeOff } from "lucide-react";

import RequisitosSenha from "./RequisitosSenha";
import login from "../pages/login.module.css";

/*
 * Campo de senha único do sistema: rótulo, input e o botão de mostrar/ocultar (RS08).
 * Com "mostrarRequisitos", exibe embaixo a lista das regras de senha forte.
 * Usado no login, cadastro, primeiro acesso, redefinir senha e "Meu perfil".
 *
 * As telas públicas usam o visual que já existia (login.module.css: field, inputWrap,
 * eyeButton...). Telas com outro tema, como o "Meu perfil", passam as próprias classes
 * em "estilo"; o que não for passado usa um estilo neutro.
 */
export interface EstiloCampoSenha {
    campo?: string;
    label?: string;
    envoltorio?: string;
    input?: string;
    botaoOlho?: string;
    ajuda?: string;
}

interface CampoSenhaProps {
    id: string;
    rotulo: string;
    valor: string;
    aoMudar: (valor: string) => void;
    autoComplete: "current-password" | "new-password";
    placeholder?: string;
    ajuda?: string;
    mostrarRequisitos?: boolean;
    estilo?: EstiloCampoSenha;
}

const ESTILO_PADRAO: EstiloCampoSenha = {
    campo: login.field,
    label: login.label,
    envoltorio: login.inputWrap,
    input: login.input,
    botaoOlho: login.eyeButton,
};

// Usado só quando a tela não tem classe própria para o botão
const BOTAO_OLHO_NEUTRO: CSSProperties = {
    position: "absolute",
    right: 8,
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    padding: 4,
    cursor: "pointer",
    color: "inherit",
    display: "flex",
};

function CampoSenha({
    id,
    rotulo,
    valor,
    aoMudar,
    autoComplete,
    placeholder,
    ajuda,
    mostrarRequisitos = false,
    estilo = ESTILO_PADRAO,
}: CampoSenhaProps) {
    const [visivel, setVisivel] = useState(false);
    const rotuloBotao = visivel ? "Ocultar senha" : "Mostrar senha";

    return (
        <div className={estilo.campo}>
            <label htmlFor={id} className={estilo.label}>
                {rotulo}
            </label>
            <div className={estilo.envoltorio} style={estilo.envoltorio ? undefined : { position: "relative" }}>
                <input
                    id={id}
                    type={visivel ? "text" : "password"}
                    autoComplete={autoComplete}
                    className={estilo.input}
                    style={estilo.botaoOlho ? undefined : { paddingRight: 40 }}
                    placeholder={placeholder}
                    value={valor}
                    onChange={(evento) => aoMudar(evento.target.value)}
                />
                <button
                    type="button"
                    className={estilo.botaoOlho}
                    style={estilo.botaoOlho ? undefined : BOTAO_OLHO_NEUTRO}
                    onClick={() => setVisivel((atual) => !atual)}
                    aria-label={rotuloBotao}
                    title={rotuloBotao}
                >
                    {visivel ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
            </div>
            {ajuda && <p className={estilo.ajuda}>{ajuda}</p>}
            {mostrarRequisitos && <RequisitosSenha senha={valor} />}
        </div>
    );
}

export default CampoSenha;
