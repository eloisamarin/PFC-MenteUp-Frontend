import { ExternalLink } from "lucide-react";

import AdminLayout from "../../components/administrador/AdminLayout";
import PainelIndicadores from "../../components/PainelIndicadores";
import styles from "./Administrador.module.css";

// O Grafana continua como painel extra (indicadores gerais lidos pela API /dashboard)
const GRAFANA_URL = import.meta.env.VITE_GRAFANA_URL ?? "http://localhost:3000";

// Dashboard do administrador: visão geral de todas as turmas e alunos, com filtros
function DashboardAdministrador() {
    return (
        <AdminLayout>
            <header className={styles.header}>
                <div>
                    <span className={styles.eyebrow}>Administração</span>
                    <h1 className={styles.title}>Dashboard</h1>
                    <p className={styles.subtitle}>
                        Visão geral da plataforma. Filtre por período, turma ou aluno.
                    </p>
                </div>
                <a href={GRAFANA_URL} target="_blank" rel="noopener noreferrer" className={styles.ghostButton}>
                    <ExternalLink size={15} />
                    Abrir no Grafana
                </a>
            </header>

            <PainelIndicadores titulo="Indicadores gerais" />
        </AdminLayout>
    );
}

export default DashboardAdministrador;
