import {useEffect, type ReactNode} from "react";
import {Trash2, TriangleAlert} from "lucide-react";

import styles from "./ConfirmarExclusao.module.css";

interface ConfirmarExclusaoProps {
    titulo: string;
    mensagem: ReactNode;
    processando: boolean;
    rotuloConfirmar?: string;
    rotuloProcessando?: string;
    onConfirmar: () => void;
    onCancelar: () => void;
}

function ConfirmarExclusao({
    titulo,
    mensagem,
    processando,
    rotuloConfirmar = "Excluir",
    rotuloProcessando = "Excluindo...",
    onConfirmar,
    onCancelar,
}: ConfirmarExclusaoProps) {
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !processando) onCancelar();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [processando, onCancelar]);

    return (
        <div className={styles.overlay} onClick={() => !processando && onCancelar()}>
            <div
                className={styles.dialog}
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="confirmar-exclusao-titulo"
                aria-describedby="confirmar-exclusao-texto"
                onClick={(e) => e.stopPropagation()}
            >
                <span className={styles.icon}>
                    <TriangleAlert size={28}/>
                </span>
                <h2 id="confirmar-exclusao-titulo" className={styles.title}>
                    {titulo}
                </h2>
                <p id="confirmar-exclusao-texto" className={styles.text}>
                    {mensagem}
                </p>
                <div className={styles.actions}>
                    <button
                        type="button"
                        className={styles.cancelButton}
                        onClick={onCancelar}
                        disabled={processando}
                        autoFocus
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        className={styles.dangerButton}
                        onClick={onConfirmar}
                        disabled={processando}
                    >
                        <Trash2 size={16}/>
                        {processando ? rotuloProcessando : rotuloConfirmar}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmarExclusao;
