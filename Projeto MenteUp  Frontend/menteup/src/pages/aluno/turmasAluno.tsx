import {useEffect, useMemo, useState} from "react";
import {Check, Clock, LogOut, Plus, Search, Users, X} from "lucide-react";

import AlunoLayout from "../../components/aluno/AlunoLayout";
import {apiFetch, lerErro} from "../../services/api.ts";
import styles from "./turmasAluno.module.css";

// Resposta de GET /alunos/me/turmas/disponiveis
interface TurmaDoAluno {
    id: number;
    nome: string;
    professor: string | null;
    matriculado: boolean;
    solicitacaoPendenteId: number | null;
    solicitacaoPendenteTipo: "ENTRADA" | "SAIDA" | null;
}

type Filtro = "TODAS" | "MINHAS" | "DISPONIVEIS";

const FILTROS: { id: Filtro; rotulo: string }[] = [
    {id: "TODAS", rotulo: "Todas"},
    {id: "MINHAS", rotulo: "Minhas turmas"},
    {id: "DISPONIVEIS", rotulo: "Disponíveis"},
];

/*
 * O aluno não entra nem sai da turma sozinho: ele envia um PEDIDO,
 * e o professor da turma (ou um administrador) aprova ou recusa.
 */
function TurmasAluno() {
    const [turmas, setTurmas] = useState<TurmaDoAluno[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [processando, setProcessando] = useState<number | null>(null);
    const [erro, setErro] = useState("");
    const [aviso, setAviso] = useState("");
    const [filtro, setFiltro] = useState<Filtro>("TODAS");
    const [busca, setBusca] = useState("");
    const [versao, setVersao] = useState(0);

    useEffect(() => {
        async function carregar() {
            try {
                const resposta = await apiFetch("/alunos/me/turmas/disponiveis");

                if (!resposta.ok) {
                    throw new Error("Falha ao consultar as turmas.");
                }

                setTurmas(await resposta.json());
            } catch (error) {
                console.error("Erro ao buscar as turmas:", error);
                setErro("Não foi possível carregar as turmas.");
            } finally {
                setCarregando(false);
            }
        }

        carregar();
    }, [versao]);

    const contagem = useMemo(() => {
        const minhas = turmas.filter((turma) => turma.matriculado).length;
        return {TODAS: turmas.length, MINHAS: minhas, DISPONIVEIS: turmas.length - minhas};
    }, [turmas]);

    const turmasFiltradas = useMemo(() => {
        const termo = busca.trim().toLowerCase();
        return turmas.filter((turma) => {
            const passaFiltro =
                filtro === "TODAS" ||
                (filtro === "MINHAS" && turma.matriculado) ||
                (filtro === "DISPONIVEIS" && !turma.matriculado);
            return passaFiltro && (!termo || turma.nome.toLowerCase().includes(termo));
        });
    }, [turmas, filtro, busca]);

    // Envia o pedido de entrada ou de saída
    async function solicitar(turma: TurmaDoAluno) {
        const tipo = turma.matriculado ? "SAIDA" : "ENTRADA";

        await executar(turma, () => apiFetch("/alunos/me/solicitacoes", {
            method: "POST",
            body: JSON.stringify({turmaId: turma.id, tipo}),
        }), tipo === "ENTRADA"
            ? `Pedido para entrar em "${turma.nome}" enviado. Aguarde a aprovação do professor.`
            : `Pedido para sair de "${turma.nome}" enviado. Aguarde a aprovação do professor.`);
    }

    // Desiste de um pedido que ainda não foi respondido
    async function cancelar(turma: TurmaDoAluno) {
        await executar(turma, () => apiFetch(`/alunos/me/solicitacoes/${turma.solicitacaoPendenteId}`, {
            method: "DELETE",
        }), `Pedido da turma "${turma.nome}" cancelado.`);
    }

    async function executar(turma: TurmaDoAluno, chamada: () => Promise<Response>, mensagemSucesso: string) {
        try {
            setProcessando(turma.id);
            setErro("");
            setAviso("");

            const resposta = await chamada();

            if (!resposta.ok) {
                setErro((await lerErro(resposta, "Não foi possível enviar o pedido.")).mensagem);
                return;
            }

            setAviso(mensagemSucesso);
            setVersao((atual) => atual + 1);
        } catch (error) {
            console.error("Erro ao enviar o pedido:", error);
            setErro("Não foi possível enviar o pedido.");
        } finally {
            setProcessando(null);
        }
    }

    return (
        <AlunoLayout>
            <header className={styles.header}>
                <span className={styles.eyebrow}>Sua jornada</span>
                <h1 className={styles.title}>Turmas</h1>
                <p className={styles.subtitle}>
                    Peça para entrar nas turmas das suas aulas. O professor da turma aprova o seu pedido.
                </p>
            </header>

            <div className={styles.toolbar}>
                <div className={styles.tabs} role="tablist" aria-label="Filtrar turmas">
                    {FILTROS.map((f) => (
                        <button
                            key={f.id}
                            type="button"
                            role="tab"
                            aria-selected={filtro === f.id}
                            className={`${styles.tab} ${filtro === f.id ? styles.tabActive : ""}`}
                            onClick={() => setFiltro(f.id)}
                        >
                            {f.rotulo}
                            {!carregando && <span className={styles.tabCount}>{contagem[f.id]}</span>}
                        </button>
                    ))}
                </div>

                <label className={styles.search}>
                    <Search size={16}/>
                    <input
                        type="search"
                        placeholder="Buscar turma..."
                        value={busca}
                        onChange={(event) => setBusca(event.target.value)}
                    />
                </label>
            </div>

            {erro && (
                <div className={styles.error} role="alert">
                    {erro}
                </div>
            )}

            {aviso && (
                <div className={styles.aviso} role="status">
                    {aviso}
                </div>
            )}

            {carregando ? (
                <div className={styles.grid}>
                    {[0, 1, 2].map((i) => (
                        <div key={i} className={`${styles.card} ${styles.skeleton}`}/>
                    ))}
                </div>
            ) : turmasFiltradas.length === 0 ? (
                <div className={styles.empty}>
                    <Users size={40}/>
                    {turmas.length === 0 ? (
                        <>
                            <strong>Nenhuma turma disponível</strong>
                            <span>Quando um professor criar uma turma, ela aparecerá aqui.</span>
                        </>
                    ) : (
                        <>
                            <strong>Nenhuma turma encontrada</strong>
                            <span>Tente outro filtro ou outro termo de busca.</span>
                        </>
                    )}
                </div>
            ) : (
                <div className={styles.grid}>
                    {turmasFiltradas.map((turma) => (
                        <CartaoTurma
                            key={turma.id}
                            turma={turma}
                            ocupado={processando === turma.id}
                            onSolicitar={() => solicitar(turma)}
                            onCancelar={() => cancelar(turma)}
                        />
                    ))}
                </div>
            )}
        </AlunoLayout>
    );
}

function CartaoTurma({turma, ocupado, onSolicitar, onCancelar}: {
    turma: TurmaDoAluno;
    ocupado: boolean;
    onSolicitar: () => void;
    onCancelar: () => void;
}) {
    const pendente = turma.solicitacaoPendenteTipo;

    // Selo do canto: situação do aluno nesta turma
    const selo = pendente ? (
        <span className={`${styles.badge} ${styles.badgeWait}`}>
            <Clock size={14}/> {pendente === "ENTRADA" ? "Aguardando aprovação" : "Saída solicitada"}
        </span>
    ) : turma.matriculado ? (
        <span className={`${styles.badge} ${styles.badgeOn}`}>
            <Check size={14}/> Matriculado
        </span>
    ) : (
        <span className={`${styles.badge} ${styles.badgeOff}`}>Disponível</span>
    );

    const dica = pendente === "ENTRADA"
        ? "Seu pedido foi enviado. Assim que o professor aprovar, a turma aparece para você."
        : pendente === "SAIDA"
            ? "Você continua na turma até o professor aprovar a saída."
            : turma.matriculado
                ? "Você vê as atividades e desafios desta turma."
                : "Peça para entrar e ver as atividades e desafios desta turma.";

    return (
        <article className={`${styles.card} ${turma.matriculado ? styles.cardMatriculado : ""}`}>
            <div className={styles.cardTop}>
                <span className={styles.icon}>
                    <Users size={22}/>
                </span>
                {selo}
            </div>

            <div className={styles.cardBody}>
                <h2 className={styles.cardTitle} title={turma.nome}>
                    {turma.nome}
                </h2>
                {turma.professor && <p className={styles.cardHint}>Professor(a): {turma.professor}</p>}
                <p className={styles.cardHint}>{dica}</p>
            </div>

            {pendente ? (
                <button type="button" onClick={onCancelar} disabled={ocupado} className={styles.secondaryButton}>
                    <X size={16}/> {ocupado ? "Aguarde..." : "Cancelar pedido"}
                </button>
            ) : (
                <button
                    type="button"
                    onClick={onSolicitar}
                    disabled={ocupado}
                    className={turma.matriculado ? styles.secondaryButton : styles.primaryButton}
                >
                    {turma.matriculado ? <LogOut size={16}/> : <Plus size={16}/>}
                    {ocupado ? "Aguarde..." : turma.matriculado ? "Pedir para sair" : "Pedir para entrar"}
                </button>
            )}
        </article>
    );
}

export default TurmasAluno;
