import {Timer, Trophy, Zap} from "lucide-react";
import {contagem, type LinhaRanking, type StatusDesafio} from "../services/turmaDesafio";
import styles from "./ComponentesDesafio.module.css";
import {RostoUsuario} from "./Avatar";

const ROTULO_STATUS: Record<StatusDesafio, string> = {
    AGUARDANDO: "Aguardando",
    EM_ANDAMENTO: "Ao vivo",
    ENCERRADO: "Encerrado",
};

const COR_STATUS: Record<StatusDesafio, string> = {
    AGUARDANDO: styles.statusAguardando,
    EM_ANDAMENTO: styles.statusAoVivo,
    ENCERRADO: styles.statusEncerrado,
};

export function BadgeStatusDesafio({status}: { status: StatusDesafio }) {
    return <span className={`${styles.badge} ${COR_STATUS[status]}`}>{ROTULO_STATUS[status]}</span>;
}

export function IconeDesafio({tamanho = 24}: { tamanho?: number }) {
    return (
        <span className={styles.iconeDesafio} style={{width: tamanho, height: tamanho}} aria-hidden="true">
            <Timer size={tamanho}/>
            <Zap size={Math.round(tamanho * 0.5)} className={styles.iconeRaio}/>
        </span>
    );
}

export function BarraTempo({restantes, total}: { restantes: number; total: number }) {
    const percentual = total > 0 ? Math.min(100, (restantes / total) * 100) : 0;
    const acabando = restantes <= 5;

    return (
        <div>
            <div className={styles.tempoTopo}>
                <span className={styles.tempoRotulo}>
                    <Timer size={15}/> Tempo restante
                </span>
                <span className={`${styles.tempoValor} ${acabando ? styles.tempoAcabando : ""}`}>{restantes}s</span>
            </div>
            <div className={styles.tempoTrilha}>
                <div
                    className={`${styles.tempoBarra} ${acabando ? styles.tempoBarraAcabando : ""}`}
                    style={{width: `${percentual}%`}}
                />
            </div>
        </div>
    );
}


interface TabelaRankingProps {
    ranking: LinhaRanking[];
    destaqueUsuarioId?: number;
    titulo: string;
}

export function TabelaRanking({ranking, destaqueUsuarioId, titulo}: TabelaRankingProps) {
    return (
        <section className={styles.ranking}>
            <h2 className={styles.rankingTitulo}>
                <Trophy size={20} className={styles.ouro}/>
                {titulo}
            </h2>

            {ranking.length === 0 ? (
                <p className={styles.rankingVazio}>Ainda não há pontuação para mostrar.</p>
            ) : (
                <ol className={styles.lista}>
                    {ranking.map((linha) => {
                        const destaque = linha.usuarioId === destaqueUsuarioId;
                        return (
                            <li
                                key={linha.usuarioId}
                                className={`${styles.linha} ${destaque ? styles.linhaDestaque : ""}`}
                                aria-current={destaque ? "true" : undefined}
                            >
                                <span className={`${styles.posicao} ${linha.posicao === 1 ? styles.posicaoPrimeiro : ""}`}>
                                    {linha.posicao}º
                                </span>
                                <RostoUsuario avatar={linha.avatar} nome={linha.nomeUsuario} className={styles.avatar}/>
                                <span className={styles.info}>
                                    <span className={styles.nome}>
                                        {linha.nomeUsuario}
                                        {destaque && " (você)"}
                                    </span>
                                    <span className={styles.meta}>{contagem(linha.acertos, "acerto", "acertos")}</span>
                                </span>
                                <span className={styles.pontos}>{linha.pontos} pts</span>
                            </li>
                        );
                    })}
                </ol>
            )}
        </section>
    );
}
