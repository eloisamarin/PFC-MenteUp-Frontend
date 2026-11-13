import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";

import styles from "./DocumentoLegal.module.css";
import { LogoMarca, LogoNome } from "./Logo";

interface DocumentoLegalProps {
    titulo: string;
    subtitulo: string;
    outroDocumento: { rotulo: string; para: string };
    children: ReactNode;
}

export default function DocumentoLegal({ titulo, subtitulo, outroDocumento, children }: DocumentoLegalProps) {
    const navigate = useNavigate();

    function voltar() {
        if (window.history.length > 1) navigate(-1);
        else navigate("/");
    }

    return (
        <div className={styles.page}>
            <header className={styles.topbar}>
                <div className={styles.inner}>
                    <Link to="/" className={styles.brand}>
                        <LogoMarca tamanho={36} />
                        <LogoNome className={styles.brandName} />
                    </Link>
                    <button type="button" className={styles.back} onClick={voltar}>
                        <ArrowLeft size={16} /> Voltar
                    </button>
                </div>
            </header>

            <main className={styles.inner}>
                <header className={styles.header}>
                    <span className={styles.icon}>
                        <FileText size={22} />
                    </span>
                    <div>
                        <span className={styles.eyebrow}>Documentos MenteUp</span>
                        <h1 className={styles.title}>{titulo}</h1>
                        <p className={styles.subtitle}>{subtitulo}</p>
                    </div>
                </header>

                <article className={styles.card}>{children}</article>

                <p className={styles.other}>
                    Veja também: <Link to={outroDocumento.para}>{outroDocumento.rotulo}</Link>
                </p>
            </main>
        </div>
    );
}
