import { useEffect, useState } from "react";

import { apiFetch } from "../../services/api";
import type { RankingAluno } from "../../types/aluno";
import styles from "./EngajamentoCard.module.css";

interface EngajamentoCardProps {
    /**
     * Lista de alunos já carregada pela página (evita outra requisição).
     * Se não for informada, o card busca /ranking sozinho.
     */
    alunos?: RankingAluno[] | null;
}

/** Card lateral "Alunos engajados" do professor */
export default function EngajamentoCard({ alunos }: EngajamentoCardProps) {
    const [buscados, setBuscados] = useState<RankingAluno[] | null>(null);
    const precisaBuscar = alunos === undefined;

    useEffect(() => {
        if (!precisaBuscar) return;
        let ativo = true;
        apiFetch("/ranking")
            .then((r) => (r.ok ? r.json() : null))
            .then((lista: RankingAluno[] | null) => {
                if (ativo) setBuscados(lista);
            })
            .catch(() => undefined);
        return () => {
            ativo = false;
        };
    }, [precisaBuscar]);

    const lista = precisaBuscar ? buscados : alunos;
    if (!lista || lista.length === 0) return null;

    const engajados = lista.filter((a) => a.atividadesConcluidas > 0).length;
    const pct = Math.round((engajados / lista.length) * 100);

    return (
        <section className={styles.card}>
            <span className={styles.eyebrow}>Alunos engajados</span>
            <strong className={styles.value}>{pct}%</strong>
            <div className={styles.track}>
                <div className={styles.fill} style={{ width: `${pct}%` }} />
            </div>
            <span className={styles.hint}>já concluíram ao menos uma atividade</span>
        </section>
    );
}
