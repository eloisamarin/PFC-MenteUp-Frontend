import { Link } from "react-router-dom";

import styles from "./Footer.module.css";
import { LogoMarca, LogoNome } from "./components/Logo";

function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.inner}>
                <Link to="/" className={styles.brand}>
                    <LogoMarca tamanho={28} />
                    <LogoNome className={styles.brandName} />
                </Link>
                <p className={styles.links}>
                    © {new Date().getFullYear()} MenteUp · <Link to="/termo-de-aceite">Termo de Aceite</Link> ·{" "}
                    <Link to="/politica-privacidade">Política de Privacidade</Link>
                </p>
            </div>
        </footer>
    );
}

export default Footer;
