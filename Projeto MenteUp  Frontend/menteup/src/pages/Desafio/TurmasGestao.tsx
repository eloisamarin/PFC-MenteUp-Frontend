import {useEffect, useState, type FormEvent, type ReactNode} from "react";
import {useNavigate} from "react-router-dom";
import {Check, Eye, Pencil, Plus, Search, Trash2, Users, X} from "lucide-react";
import AdminLayout from "../../components/administrador/AdminLayout";
import ProfessorLayout from "../../components/professor/ProfessorLayout";
import ConfirmarExclusao from "../../components/ConfirmarExclusao";
import {apiFetch, lerErro} from "../../services/api";
import {contagem, ROTA_BASE, type Desafio, type PerfilGestao, type TurmaDetalhe} from "../../services/turmaDesafio";
import styles from "./TurmasGestao.module.css";

export function LayoutGestao({perfil, children}: { perfil: PerfilGestao; children: ReactNode }) {
    if (perfil === "PROFESSOR") return <ProfessorLayout>{children}</ProfessorLayout>;
    return <AdminLayout>{children}</AdminLayout>;
}

function sigla(nome: string) {
    return nome.trim().split(/\s+/)[0]?.slice(0, 2) || "?";
}

function TurmasGestao({perfil}: { perfil: PerfilGestao }) {
    const navigate = useNavigate();
    const base = ROTA_BASE[perfil];

    const [turmas, setTurmas] = useState<TurmaDetalhe[]>([]);
    const [desafiosPorTurma, setDesafiosPorTurma] = useState<Record<number, number>>({});
    const [busca, setBusca] = useState("");
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    const [novoNome, setNovoNome] = useState("");
    const [criando, setCriando] = useState(false);

    const [editandoId, setEditandoId] = useState<number | null>(null);
    const [nomeEditado, setNomeEditado] = useState("");

    const [paraExcluir, setParaExcluir] = useState<TurmaDetalhe | null>(null);
    const [excluindo, setExcluindo] = useState(false);
    const [versao, setVersao] = useState(0);

    useEffect(() => {
        async function carregarTurmas() {
            try {
                const [resposta, respostaDesafios] = await Promise.all([
                    apiFetch("/turmas/all"),
                    apiFetch("/desafios"),
                ]);
                if (!resposta.ok) throw new Error("Falha ao consultar as turmas.");
                const dados: TurmaDetalhe[] = await resposta.json();
                setTurmas(dados.sort((a, b) => a.nome.localeCompare(b.nome)));

                if (respostaDesafios.ok) {
                    const desafios: Desafio[] = await respostaDesafios.json();
                    const contagemDesafios: Record<number, number> = {};
                    desafios.forEach((desafio) => {
                        const turmaId = desafio.turma?.id;
                        if (turmaId !== undefined) contagemDesafios[turmaId] = (contagemDesafios[turmaId] ?? 0) + 1;
                    });
                    setDesafiosPorTurma(contagemDesafios);
                }
            } catch (error) {
                console.error("Erro ao carregar turmas:", error);
                setErro("Não foi possível carregar as turmas.");
            } finally {
                setCarregando(false);
            }
        }

        carregarTurmas();
    }, [versao]);

    async function criarTurma(event: FormEvent) {
        event.preventDefault();

        const nome = novoNome.trim();
        if (!nome) return;

        try {
            setCriando(true);
            setErro("");

            const resposta = await apiFetch("/turmas", {
                method: "POST",
                body: JSON.stringify({nome}),
            });

            if (!resposta.ok) {
                const erroApi = await lerErro(resposta, "Não foi possível criar a turma.");
                setErro(erroApi.campos?.nome ?? erroApi.mensagem);
                return;
            }

            setNovoNome("");
            setVersao((atual) => atual + 1);
        } catch (error) {
            console.error("Erro ao criar turma:", error);
            setErro("Não foi possível criar a turma.");
        } finally {
            setCriando(false);
        }
    }

    async function salvarNome(id: number) {
        const nome = nomeEditado.trim();
        if (!nome) return;

        try {
            setErro("");

            const resposta = await apiFetch("/turmas", {
                method: "PUT",
                body: JSON.stringify({id, nome}),
            });

            if (!resposta.ok) {
                const erroApi = await lerErro(resposta, "Não foi possível renomear a turma.");
                setErro(erroApi.campos?.nome ?? erroApi.mensagem);
                return;
            }

            setEditandoId(null);
            setVersao((atual) => atual + 1);
        } catch (error) {
            console.error("Erro ao renomear turma:", error);
            setErro("Não foi possível renomear a turma.");
        }
    }

    async function excluirTurma() {
        if (!paraExcluir) return;

        try {
            setExcluindo(true);
            setErro("");

            const resposta = await apiFetch(`/turmas/${paraExcluir.id}`, {method: "DELETE"});

            if (!resposta.ok) {
                const erroApi = await lerErro(resposta, "Não foi possível excluir a turma.");
                setErro(erroApi.codigo === "CONFLITO_DE_DADOS"
                    ? "Esta turma não pode ser excluída porque ainda tem desafios ou resultados de alunos vinculados."
                    : erroApi.mensagem);
                return;
            }

            setVersao((atual) => atual + 1);
        } catch (error) {
            console.error("Erro ao excluir turma:", error);
            setErro("Não foi possível excluir a turma.");
        } finally {
            setExcluindo(false);
            setParaExcluir(null);
        }
    }

    const filtradas = turmas.filter((turma) =>
        turma.nome.toLowerCase().includes(busca.toLowerCase())
    );

    return (
        <LayoutGestao perfil={perfil}>
            <header className={styles.header}>
                <span className={styles.eyebrow}>Gestão</span>
                <h1 className={styles.title}>Turmas</h1>
                <p className={styles.subtitle}>{contagem(turmas.length, "turma cadastrada", "turmas cadastradas")}</p>
            </header>

            <form onSubmit={criarTurma} className={`${styles.card} ${styles.createForm}`}>
                <input
                    value={novoNome}
                    onChange={(event) => setNovoNome(event.target.value)}
                    maxLength={255}
                    placeholder="Nome da nova turma"
                    aria-label="Nome da nova turma"
                    className={styles.input}
                />
                <button type="submit" disabled={criando || !novoNome.trim()} className={styles.primaryButton}>
                    <Plus size={18}/>
                    {criando ? "Criando..." : "Criar turma"}
                </button>
            </form>

            {erro && <div className={styles.error} role="alert">{erro}</div>}

            <label className={styles.search}>
                <Search size={17}/>
                <input
                    value={busca}
                    onChange={(event) => setBusca(event.target.value)}
                    placeholder="Buscar turma..."
                    aria-label="Buscar turma"
                />
            </label>

            {carregando && turmas.length === 0 ? (
                <p className={styles.empty}>Carregando turmas...</p>
            ) : filtradas.length === 0 ? (
                <div className={styles.empty}>
                    <Users size={36}/>
                    <p>{busca ? "Nenhuma turma encontrada." : "Crie a primeira turma no campo acima."}</p>
                </div>
            ) : (
                <ul className={styles.list}>
                    {filtradas.map((turma) => (
                        <li key={turma.id} className={`${styles.card} ${styles.row}`}>
                            <span className={styles.avatar}>{sigla(turma.nome)}</span>
                            {editandoId === turma.id ? (
                                <div className={styles.editRow}>
                                    <input
                                        autoFocus
                                        value={nomeEditado}
                                        onChange={(event) => setNomeEditado(event.target.value)}
                                        onKeyDown={(event) => {
                                            if (event.key === "Enter") salvarNome(turma.id);
                                            if (event.key === "Escape") setEditandoId(null);
                                        }}
                                        maxLength={255}
                                        aria-label="Novo nome da turma"
                                        className={styles.input}
                                    />
                                    <button type="button" title="Salvar" onClick={() => salvarNome(turma.id)} className={`${styles.iconButton} ${styles.iconSave}`}>
                                        <Check size={17}/>
                                    </button>
                                    <button type="button" title="Cancelar" onClick={() => setEditandoId(null)} className={styles.iconButton}>
                                        <X size={17}/>
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => navigate(`${base}/turmas/${turma.id}`)}
                                        className={styles.rowMain}
                                    >
                                        <strong>{turma.nome}</strong>
                                        <small>
                                            {contagem(turma.alunos?.length ?? 0, "aluno", "alunos")} · {contagem(turma.atividade?.length ?? 0, "atividade", "atividades")} · {contagem(desafiosPorTurma[turma.id] ?? 0, "desafio", "desafios")}
                                        </small>
                                    </button>
                                    <div className={styles.actions}>
                                        <button type="button" title="Ver turma" onClick={() => navigate(`${base}/turmas/${turma.id}`)} className={styles.iconButton}>
                                            <Eye size={17}/>
                                        </button>
                                        <button
                                            type="button"
                                            title="Renomear"
                                            onClick={() => {
                                                setEditandoId(turma.id);
                                                setNomeEditado(turma.nome);
                                            }}
                                            className={styles.iconButton}
                                        >
                                            <Pencil size={17}/>
                                        </button>
                                        <button type="button" title="Excluir" onClick={() => setParaExcluir(turma)} className={`${styles.iconButton} ${styles.iconDanger}`}>
                                            <Trash2 size={17}/>
                                        </button>
                                    </div>
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            )}

            {paraExcluir && (
                <ConfirmarExclusao
                    titulo={`Excluir a turma "${paraExcluir.nome}"?`}
                    mensagem="As atividades da turma também serão excluídas. Os alunos continuam cadastrados no sistema. Esta ação não pode ser desfeita."
                    processando={excluindo}
                    onConfirmar={excluirTurma}
                    onCancelar={() => setParaExcluir(null)}
                />
            )}
        </LayoutGestao>
    );
}

export default TurmasGestao;
