import styles from "../aluno/ProgressoCard.module.css";

interface Props {
    ganhas: number;
    total: number;
}

// Cartão do menu lateral: quantas conquistas o aluno já tem
export default function ContadorConquistas({ ganhas, total }: Props) {
    const percentual = total ? Math.round((ganhas / total) * 100) : 0;
    const faltam = Math.max(total - ganhas, 0);

    return (
        <section className={styles.card}>
            <span className={styles.eyebrow}>Sua coleção</span>
            <strong className={styles.value}>
                {ganhas}/{total} conquistas
            </strong>
            <div className={styles.track}>
                <div className={styles.fill} style={{ width: `${percentual}%` }} />
            </div>
            <span className={styles.hint}>
                {faltam === 0
                    ? "Coleção completa. Incrível!"
                    : `Faltam ${faltam} ${faltam === 1 ? "selo" : "selos"} para completar.`}
            </span>
        </section>
    );
}
