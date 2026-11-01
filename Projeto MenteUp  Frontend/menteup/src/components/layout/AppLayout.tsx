import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LogOut, Zap } from "lucide-react";

import styles from "./AppLayout.module.css";
import { iniciais, obterUsuarioLogado, sair } from "../../services/usuarioLogado";

export interface ItemMenu {
    rotulo: string;
    icone: ReactNode;
    para?: string;
    exato?: boolean;
}

export interface AppLayoutProps {
    children: ReactNode;
    menu: ItemMenu[];
    subtitulo: string;
    inicio: string;
    rotuloMenu?: string;
    xp?: number | null;
    sidebarExtra?: ReactNode;
    compacto?: boolean;
}

export default function AppLayout({
    children,
    menu,
    subtitulo,
    inicio,
    rotuloMenu = "Menu principal",
    xp,
    sidebarExtra,
    compacto = false,
}: AppLayoutProps) {
    const navigate = useNavigate();
    const usuario = obterUsuarioLogado();

    function handleSair() {
        sair();
        navigate("/login");
    }

    return (
        <div className={styles.shell}>
            <div className={styles.glowTop} aria-hidden />
            <div className={styles.glowBottom} aria-hidden />

            <header className={styles.topbar}>
                <div className={styles.topbarInner}>
                    <button type="button" className={styles.brand} onClick={() => navigate(inicio)}>
                        <span className={styles.brandMark}>M</span>
                        <span>
                            <span className={styles.brandName}>
                                Mente<span>Up</span>
                            </span>
                            <span className={styles.brandTagline}>{subtitulo}</span>
                        </span>
                    </button>

                    <div className={styles.topActions}>
                        {xp != null && (
                            <span className={styles.xpChip}>
                                <Zap size={16} />
                                {xp.toLocaleString("pt-BR")} XP
                            </span>
                        )}

                        <button type="button" className={styles.ghostButton} onClick={handleSair}>
                            <LogOut size={16} />
                            Sair
                        </button>

                        <span className={styles.avatar} title={usuario?.nome}>
                            {iniciais(usuario?.nome ?? usuario?.usuario)}
                        </span>
                    </div>
                </div>
            </header>

            <div className={`${styles.body} ${compacto ? styles.bodyCompact : ""}`}>
                <aside className={styles.sidebar}>
                    <nav className={styles.nav} aria-label={rotuloMenu}>
                        {menu.map((item) =>
                            item.para ? (
                                <NavLink
                                    key={item.rotulo}
                                    to={item.para}
                                    end={item.exato}
                                    className={({ isActive }) =>
                                        `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
                                    }
                                >
                                    {item.icone}
                                    {item.rotulo}
                                </NavLink>
                            ) : (
                                <span
                                    key={item.rotulo}
                                    className={`${styles.navItem} ${styles.navItemDisabled}`}
                                    title="Em breve"
                                    aria-disabled
                                >
                                    {item.icone}
                                    {item.rotulo}
                                    <span className={styles.soon}>em breve</span>
                                </span>
                            )
                        )}
                    </nav>

                    {sidebarExtra && <div className={styles.sidebarExtra}>{sidebarExtra}</div>}
                </aside>

                <main className={styles.content}>{children}</main>
            </div>
        </div>
    );
}
