import {useEffect, useState} from "react";
import {GraduationCap, Link2} from "lucide-react";

import {apiFetch, lerErro} from "../services/api";
import {carregarProfessores, type ProfessorResponsavel, type TurmaResumo} from "../services/turmaDesafio";
import styles from "../pages/professor/CriarAtividadeProfessor.module.css";

interface ProfessorDaTurmaProps {
    turma?: TurmaResumo;
    /** Chamado com a turma já vinculada, para a tela atualizar a lista de turmas. */
    onVinculado: (turma: TurmaResumo) => void;
}

/*
 * Só para o administrador, nas telas de criar atividade e desafio:
 * mostra o professor responsável pela turma escolhida e, se ela ainda não tiver,
 * permite vincular um. O vínculo é gravado na turma: é ele que dá acesso ao professor.
 */
function ProfessorDaTurma({turma, onVinculado}: ProfessorDaTurmaProps) {
    const [professores, setProfessores] = useState<ProfessorResponsavel[]>([]);
    const [professorId, setProfessorId] = useState("");
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState("");

    useEffect(() => {
        carregarProfessores()
            .then(setProfessores)
            .catch(() => setErro("Não foi possível carregar os professores."));
    }, []);

    useEffect(() => {
        setProfessorId("");
        setErro("");
    }, [turma?.id]);

    if (!turma) return null;

    if (turma.professorResponsavel) {
        return (
            <p style={{display: "flex", alignItems: "center", gap: 6, fontSize: 13, margin: "4px 0 0"}}>
                <GraduationCap size={15}/>
                Professor responsável: <strong>{turma.professorResponsavel.nome}</strong>
            </p>
        );
    }

    async function vincular() {
        if (!turma || !professorId) return;

        try {
            setSalvando(true);
            setErro("");

            const resposta = await apiFetch("/turmas", {
                method: "PUT",
                body: JSON.stringify({id: turma.id, nome: turma.nome, professorId: Number(professorId)}),
            });

            if (!resposta.ok) {
                setErro((await lerErro(resposta, "Não foi possível vincular o professor.")).mensagem);
                return;
            }

            const atualizada: TurmaResumo = await resposta.json();
            onVinculado(atualizada);
        } catch {
            setErro("Não foi possível vincular o professor.");
        } finally {
            setSalvando(false);
        }
    }

    return (
        <div style={{display: "flex", flexDirection: "column", gap: 6, marginTop: 6}}>
            <span style={{fontSize: 13}}>
                Esta turma ainda não tem professor responsável. Vincule um para que ele tenha acesso:
            </span>
            <div style={{display: "flex", gap: 8, flexWrap: "wrap"}}>
                <select
                    aria-label="Professor responsável"
                    className={styles.input}
                    style={{flex: "1 1 180px"}}
                    value={professorId}
                    onChange={(e) => setProfessorId(e.target.value)}
                >
                    <option value="">Sem professor (só administradores)</option>
                    {professores.map((professor) => (
                        <option key={professor.id} value={professor.id}>{professor.nome}</option>
                    ))}
                </select>
                <button
                    type="button"
                    className={styles.ghostButton}
                    onClick={vincular}
                    disabled={!professorId || salvando}
                >
                    <Link2 size={15}/>
                    {salvando ? "Vinculando..." : "Vincular professor"}
                </button>
            </div>
            {erro && <span role="alert" style={{fontSize: 13, color: "var(--mu-danger)"}}>{erro}</span>}
        </div>
    );
}

export default ProfessorDaTurma;
