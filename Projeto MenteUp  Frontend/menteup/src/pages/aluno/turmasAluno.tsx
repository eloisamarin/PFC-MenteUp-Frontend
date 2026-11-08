import {useEffect, useMemo, useState} from "react";
import {Check, LogOut, Plus, Search, Users} from "lucide-react";

import AlunoLayout from "../../components/aluno/AlunoLayout";
import {apiFetch, lerErro} from "../../services/api.ts";
import styles from "./turmasAluno.module.css";

interface Turma {
    id: number;
    nome: string;
}

type Filtro = "TODAS" | "MINHAS" | "DISPONIVEIS";

const FILTROS: { id: Filtro; rotulo: string }[] = [
    {id: "TODAS", rotulo: "Todas"},
    {id: "MINHAS", rotulo: "Minhas turmas"},
    {id: "DISPONIVEIS", rotulo: "Disponíveis"},
];

function TurmasAluno() {
    const [turmas, setTurmas] = useState<Turma[]>([]);
    const [minhasIds, setMinhaIds] = useState<number[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [processando, setProcessando] = useState<number | null>(null);
    const [erro, setErro] = useState("");
    const [filtro, setFiltro] = useState<Filtro>("TODAS");
    const [busca, setBusca] = useState("");

    useEffect(() => {
        async function carregar() {
            try {
                const [respostaTurmas, respostaMinhas] = await Promise.all([
                    apiFetch("/turmas/all"),
                    apiFetch("/alunos/me/turmas"),
                ]);
                if (!respostaTurmas.ok || !respostaMinhas.ok) {
                    throw new Error("Falha ao consultar as turmas.");
                }

                const todas: Turma[] = await respostaTurmas.json();
                const minhas: Turma[] = await respostaMinhas.json();

                setTurmas(todas);
                setMinhaIds(minhas.map((turma) => turma.id));
            } catch (error) {
                console.error("Erro ao buscar as turmas:", error);
                setErro("Não foi possivel carregar as turmas.");
            } finally {
                setCarregando(false);
            }
        }

        carregar();
    }, []);

    const contagem = useMemo(() => {
        const minhas = turmas.filter((turma) => minhasIds.includes(turma.id)).length;
        return {TODAS: turmas.length, MINHAS: minhas, DISPONIVEIS: turmas.length - minhas};
    }, [turmas, minhasIds]);

    const turmasFiltradas = useMemo(() => {
        const termo = busca.trim().toLowerCase();
        return turmas.filter((turma) => {
            const matriculado = minhasIds.includes(turma.id);
            const passaFiltro =
                filtro === "TODAS" ||
                (filtro === "MINHAS" && matriculado) ||
                (filtro === "DISPONIVEIS" && !matriculado);
            return passaFiltro && (!termo || turma.nome.toLowerCase().includes(termo));
        });
    }, [turmas, minhasIds, filtro, busca]);

    async function alterarMatricula(turma: Turma) {
        const matriculado = minhasIds.includes(turma.id);

        try {
            setProcessando(turma.id);
            setErro("");

            const resposta = await apiFetch(
                `/alunos/me/turmas/${turma.id}`,
                {method: matriculado ? "DELETE" : "POST"}
            );
            if (!resposta.ok) {
                const erroApi = await lerErro(resposta, "Não foi possivel atualizar a matricula.");
                setErro(erroApi.mensagem);
                return;
            }
            setMinhaIds((atuais) =>
                matriculado
                    ? atuais.filter((id) => id !== turma.id)
                    : [...atuais, turma.id]);
        } catch (error) {
            console.error("Erro ao atualizar matricula:", error);
            setErro("Não foi possivel atualizar a matricula.");
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
                    Entre nas turmas das suas aulas para participar das atividades e dos desafios delas.
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
                    {turmasFiltradas.map((turma) => {
                        const matriculado = minhasIds.includes(turma.id);
                        const ocupado = processando === turma.id;

                        return (
                            <article
                                key={turma.id}
                                className={`${styles.card} ${matriculado ? styles.cardMatriculado : ""}`}
                            >
                                <div className={styles.cardTop}>
                                    <span className={styles.icon}>
                                        <Users size={22}/>
                                    </span>
                                    {matriculado ? (
                                        <span className={`${styles.badge} ${styles.badgeOn}`}>
                                            <Check size={14}/> Matriculado
                                        </span>
                                    ) : (
                                        <span className={`${styles.badge} ${styles.badgeOff}`}>Disponível</span>
                                    )}
                                </div>

                                <div className={styles.cardBody}>
                                    <h2 className={styles.cardTitle} title={turma.nome}>
                                        {turma.nome}
                                    </h2>
                                    <p className={styles.cardHint}>
                                        {matriculado
                                            ? "Você vê as atividades e desafios desta turma."
                                            : "Entre para ver as atividades e desafios desta turma."}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => alterarMatricula(turma)}
                                    disabled={ocupado}
                                    className={matriculado ? styles.secondaryButton : styles.primaryButton}
                                >
                                    {matriculado ? <LogOut size={16}/> : <Plus size={16}/>}
                                    {ocupado ? "Aguarde..." : matriculado ? "Sair da turma" : "Entrar na turma"}
                                </button>
                            </article>
                        );
                    })}
                </div>
            )}
        </AlunoLayout>
    );
}

export default TurmasAluno;
