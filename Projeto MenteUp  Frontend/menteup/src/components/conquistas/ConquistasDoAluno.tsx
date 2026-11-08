import { useEffect, useState } from "react";
import { Medal } from "lucide-react";

import IconeConquista from "./IconeConquista";
import { buscarConquistasDoAluno } from "../../services/conquistas";
import { TITULO_CATEGORIA, daCategoria, fmt, formatarData, infoNivel } from "../../services/conquistasInfo";
import type { Categoria, ResumoConquistas } from "../../types/conquista";
import dash from "../../pages/professor/dashboardProfessor.module.css";
import styles from "./ConquistasDoAluno.module.css";

const ORDEM: Categoria[] = ["NIVEL", "ATIVIDADE", "RANKING", "INTENSIVAO"];

// Visão do professor/administrador: resumo das conquistas de um aluno
export default function ConquistasDoAluno({ alunoId }: { alunoId: string | number }) {
    const [resumo, setResumo] = useState<ResumoConquistas | null>(null);
    const [erro, setErro] = useState("");
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        let ativo = true;

        buscarConquistasDoAluno(alunoId)
            .then((dados) => ativo && setResumo(dados))
            .catch((e) => ativo && setErro(e?.mensagem ?? "Não foi possível carregar as conquistas."))
            .finally(() => ativo && setCarregando(false));

        return () => {
            ativo = false;
        };
    }, [alunoId]);

    const nivel = infoNivel(resumo);

    return (
        <section className={dash.card}>
            <header className={dash.cardHeader}>
                <h2 className={`${dash.cardTitle} ${styles.titulo}`}>
                    <Medal size={20} className={styles.dourado} /> Conquistas
                </h2>
                {resumo && (
                    <span className={dash.cardNote}>
                        {resumo.conquistasDesbloqueadas} de {resumo.totalConquistas} desbloqueadas
                    </span>
                )}
            </header>

            {carregando && <p className={dash.empty}>Carregando conquistas...</p>}
            {!carregando && erro && <p className={dash.empty}>{erro}</p>}

            {resumo && !erro && (
                <>
                    <div className={styles.numeros}>
                        <div className={styles.numero}>
                            <strong className={styles.dourado}>{fmt(resumo.xpTotal)}</strong>
                            <span>XP total</span>
                        </div>
                        <div className={styles.numero}>
                            <strong>{nivel.atual?.nome ?? "Início"}</strong>
                            <span>Nível atual</span>
                        </div>
                        <div className={styles.numero}>
                            <strong className={styles.coral}>{resumo.diasConsecutivos} dias</strong>
                            <span>Sequência · recorde {resumo.maiorSequencia}</span>
                        </div>
                    </div>

                    {ORDEM.map((categoria) => {
                        const lista = daCategoria(resumo, categoria);
                        if (lista.length === 0) return null;
                        return (
                            <div key={categoria} className={styles.grupo}>
                                <h3 className={styles.grupoTitulo}>{TITULO_CATEGORIA[categoria]}</h3>
                                <ul className={styles.selos}>
                                    {lista.map((c) => {
                                        const data = formatarData(c.dataDesbloqueio);
                                        const detalhe = c.desbloqueada
                                            ? `Conquistada${data ? ` em ${data}` : ""}`
                                            : `${c.percentual}% · ${fmt(c.progressoAtual)}/${fmt(c.meta)}`;
                                        return (
                                            <li
                                                key={c.id}
                                                className={`${styles.selo} ${c.desbloqueada ? "" : styles.pendente}`}
                                                title={`${c.descricao} · ${detalhe}`}
                                            >
                                                <IconeConquista conquista={c} tamanho="sm" />
                                                <span className={styles.seloTexto}>
                                                    <strong>{c.nome}</strong>
                                                    <span>{detalhe}</span>
                                                </span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        );
                    })}
                </>
            )}
        </section>
    );
}
