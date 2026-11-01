import styles from "./ProgressoCard.module.css";

interface ProgressoCardProps {
    concluidas: number;
    total: number;
}

/** Card lateral "Progresso geral" (fica abaixo do menu do aluno) */
export default function ProgressoCard({ concluidas, total }: ProgressoCardProps) {
    const percentual = total ? Math.round((concluidas / total) * 100) : 0;
    const faltam = total - concluidas;

    return (
        <section className={styles.card}>
            <span className={styles.eyebrow}>Progresso geral</span>
            <strong className={styles.value}>
                {concluidas}/{total} atividades
            </strong>
            <div className={styles.track}>
                <div className={styles.fill} style={{ width: `${percentual}%` }} />
            </div>
            <span className={styles.hint}>
                {faltam <= 0 ? "Tudo em dia. Mandou bem!" : `Faltam ${faltam} para fechar tudo!`}
            </span>
        </section>
    );
}
