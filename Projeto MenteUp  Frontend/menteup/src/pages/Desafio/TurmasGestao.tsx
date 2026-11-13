import {useEffect, useState, type FormEvent, type ReactNode} from "react";
import {useNavigate} from "react-router-dom";
import {Archive, ArchiveRestore, Check, ChevronDown, ChevronRight, Eye, Pencil, Plus, Search, Trash2, Users, X} from "lucide-react";
import AdminLayout from "../../components/administrador/AdminLayout";
import ProfessorLayout from "../../components/professor/ProfessorLayout";
import ConfirmarExclusao from "../../components/ConfirmarExclusao";
import {apiFetch, lerErro} from "../../services/api";
import {
    carregarProfessores,
    contagem,
    podeAlterarTurma,
    ROTA_BASE,
    type Desafio,
    type ExclusaoTurma,
    type PerfilGestao,
    type ProfessorResponsavel,
    type TurmaDetalhe,
} from "../../services/turmaDesafio";
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
    const administrador = perfil === "ADMINISTRADOR";

    const [turmas, setTurmas] = useState<TurmaDetalhe[]>([]);
    const [desafiosPorTurma, setDesafiosPorTurma] = useState<Record<number, number>>({});
    const [busca, setBusca] = useState("");
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    const [novoNome, setNovoNome] = useState("");
    const [criando, setCriando] = useState(false);

    // Só o administrador escolhe o professor responsável (quem cria como professor fica responsável)
    const [professores, setProfessores] = useState<ProfessorResponsavel[]>([]);
    const [novoProfessorId, setNovoProfessorId] = useState("");

    const [editandoId, setEditandoId] = useState<number | null>(null);
    const [nomeEditado, setNomeEditado] = useState("");
    const [professorEditado, setProfessorEditado] = useState("");

    // Lixeira: primeiro pergunta ao backend se a turma pode ser excluída (e o que a prende)
    const [paraExcluir, setParaExcluir] = useState<{ turma: TurmaDetalhe; analise: ExclusaoTurma } | null>(null);
    const [paraArquivar, setParaArquivar] = useState<TurmaDetalhe | null>(null);
    const [processando, setProcessando] = useState(false);
    const [mostrarArquivadas, setMostrarArquivadas] = useState(false);
    const [versao, setVersao] = useState(0);

    useEffect(() => {
        async function carregarTurmas() {
            try {
                const [resposta, respostaDesafios] = await Promise.all([
                    apiFetch("/turmas/all?incluirArquivadas=true"),
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

    useEffect(() => {
        if (!administrador) return;
        carregarProfessores()
            .then(setProfessores)
            .catch(() => setErro("Não foi possível carregar os professores."));
    }, [administrador]);

    async function criarTurma(event: FormEvent) {
        event.preventDefault();

        const nome = novoNome.trim();
        if (!nome) return;

        try {
            setCriando(true);
            setErro("");

            const resposta = await apiFetch("/turmas", {
                method: "POST",
                body: JSON.stringify({
                    nome,
                    ...(administrador && novoProfessorId ? {professorId: Number(novoProfessorId)} : {}),
                }),
            });

            if (!resposta.ok) {
                const erroApi = await lerErro(resposta, "Não foi possível criar a turma.");
                setErro(erroApi.campos?.nome ?? erroApi.mensagem);
                return;
            }

            setNovoNome("");
            setNovoProfessorId("");
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
                body: JSON.stringify({
                    id,
                    nome,
                    ...(administrador && professorEditado ? {professorId: Number(professorEditado)} : {}),
                }),
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

    // Antes de excluir: o backend diz se pode e, se não puder, o motivo (alunos ou histórico)
    async function pedirExclusao(turma: TurmaDetalhe) {
        try {
            setErro("");
            const resposta = await apiFetch(`/turmas/${turma.id}/exclusao`);
            if (!resposta.ok) {
                setErro((await lerErro(resposta, "Não foi possível verificar a turma.")).mensagem);
                return;
            }
            setParaExcluir({turma, analise: await resposta.json()});
        } catch (error) {
            console.error("Erro ao verificar exclusão:", error);
            setErro("Não foi possível verificar a turma.");
        }
    }

    // Executa uma ação na turma (excluir, arquivar ou desarquivar) e recarrega a lista
    async function executar(caminho: string, metodo: "DELETE" | "PUT", mensagemPadrao: string) {
        try {
            setProcessando(true);
            setErro("");

            const resposta = await apiFetch(caminho, {method: metodo});
            if (!resposta.ok) {
                setErro((await lerErro(resposta, mensagemPadrao)).mensagem);
                return;
            }

            setVersao((atual) => atual + 1);
        } catch (error) {
            console.error(mensagemPadrao, error);
            setErro(mensagemPadrao);
        } finally {
            setProcessando(false);
            setParaExcluir(null);
            setParaArquivar(null);
        }
    }

    const excluirTurma = (turma: TurmaDetalhe) =>
        executar(`/turmas/${turma.id}`, "DELETE", "Não foi possível excluir a turma.");
    const arquivarTurma = (turma: TurmaDetalhe) =>
        executar(`/turmas/${turma.id}/arquivar`, "PUT", "Não foi possível arquivar a turma.");
    const desarquivarTurma = (turma: TurmaDetalhe) =>
        executar(`/turmas/${turma.id}/desarquivar`, "PUT", "Não foi possível desarquivar a turma.");

    const filtradas = turmas.filter((turma) =>
        turma.nome.toLowerCase().includes(busca.toLowerCase())
    );
    const ativas = filtradas.filter((turma) => !turma.arquivada);
    const arquivadas = filtradas.filter((turma) => turma.arquivada);
    const totalAtivas = turmas.filter((turma) => !turma.arquivada).length;
    const totalArquivadas = turmas.length - totalAtivas;

    const textoArquivar =
        "Ao arquivar, a turma sai das listas e não recebe atividades, desafios nem alunos novos. "
        + "O histórico e os pontos dos alunos continuam valendo, e você pode desarquivá-la quando quiser.";

    // Uma linha da lista: a mesma para turmas ativas e arquivadas
    function linhaTurma(turma: TurmaDetalhe) {
        return (
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
                        {administrador && (
                            <select
                                value={professorEditado}
                                onChange={(event) => setProfessorEditado(event.target.value)}
                                aria-label="Professor responsável"
                                className={styles.input}
                            >
                                {!professorEditado && <option value="">Sem professor responsável</option>}
                                {professores.map((professor) => (
                                    <option key={professor.id} value={professor.id}>{professor.nome}</option>
                                ))}
                            </select>
                        )}
                        <button type="button" title="Salvar" aria-label={`Salvar alterações da turma ${turma.nome}`} onClick={() => salvarNome(turma.id)} className={`${styles.iconButton} ${styles.iconSave}`}>
                            <Check size={17}/>
                        </button>
                        <button type="button" title="Cancelar" aria-label="Cancelar edição" onClick={() => setEditandoId(null)} className={styles.iconButton}>
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
                            <small>
                                {turma.arquivada && "Arquivada · "}
                                {turma.professorResponsavel
                                    ? `Professor: ${turma.professorResponsavel.nome}`
                                    : "Sem professor responsável"}
                            </small>
                        </button>
                        <div className={styles.actions}>
                            <button type="button" title="Ver turma" aria-label={`Ver turma ${turma.nome}`} onClick={() => navigate(`${base}/turmas/${turma.id}`)} className={styles.iconButton}>
                                <Eye size={17}/>
                            </button>
                            {podeAlterarTurma(turma, perfil) && (
                                <>
                                    {!turma.arquivada && <button
                                        type="button"
                                        title={administrador ? "Editar nome e professor" : "Renomear"}
                                        aria-label={`${administrador ? "Editar nome e professor da turma" : "Renomear a turma"} ${turma.nome}`}
                                        onClick={() => {
                                            setEditandoId(turma.id);
                                            setNomeEditado(turma.nome);
                                            setProfessorEditado(turma.professorResponsavel ? String(turma.professorResponsavel.id) : "");
                                        }}
                                        className={styles.iconButton}
                                    >
                                        <Pencil size={17}/>
                                    </button>}
                                    <button
                                        type="button"
                                        title={turma.arquivada ? "Desarquivar" : "Arquivar"}
                                        aria-label={`${turma.arquivada ? "Desarquivar" : "Arquivar"} a turma ${turma.nome}`}
                                        onClick={() => (turma.arquivada ? desarquivarTurma(turma) : setParaArquivar(turma))}
                                        disabled={processando}
                                        className={styles.iconButton}
                                    >
                                        {turma.arquivada ? <ArchiveRestore size={17}/> : <Archive size={17}/>}
                                    </button>
                                    <button
                                        type="button"
                                        title="Excluir"
                                        aria-label={`Excluir turma ${turma.nome}`}
                                        onClick={() => pedirExclusao(turma)}
                                        className={`${styles.iconButton} ${styles.iconDanger}`}
                                    >
                                        <Trash2 size={17}/>
                                    </button>
                                </>
                            )}
                        </div>
                    </>
                )}
            </li>
        );
    }

    return (
        <LayoutGestao perfil={perfil}>
            <header className={styles.header}>
                <span className={styles.eyebrow}>Gestão</span>
                <h1 className={styles.title}>Turmas</h1>
                <p className={styles.subtitle}>
                    {contagem(totalAtivas, "turma ativa", "turmas ativas")}
                    {totalArquivadas > 0 && ` · ${contagem(totalArquivadas, "arquivada", "arquivadas")}`}
                </p>
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
                {administrador && (
                    <select
                        value={novoProfessorId}
                        onChange={(event) => setNovoProfessorId(event.target.value)}
                        aria-label="Professor responsável"
                        title="Professor responsável: terá acesso às atividades e desafios da turma"
                        className={styles.input}
                    >
                        <option value="">Sem professor responsável</option>
                        {professores.map((professor) => (
                            <option key={professor.id} value={professor.id}>{professor.nome}</option>
                        ))}
                    </select>
                )}
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
            ) : ativas.length === 0 ? (
                <div className={styles.empty}>
                    <Users size={36}/>
                    <p>{busca ? "Nenhuma turma ativa encontrada." : "Crie a primeira turma no campo acima."}</p>
                </div>
            ) : (
                <ul className={styles.list}>
                    {ativas.map(linhaTurma)}
                </ul>
            )}

            {totalArquivadas > 0 && (
                <section aria-label="Turmas arquivadas" style={{marginTop: 24}}>
                    <button
                        type="button"
                        onClick={() => setMostrarArquivadas((atual) => !atual)}
                        aria-expanded={mostrarArquivadas}
                        className={styles.ghostButton}
                    >
                        {mostrarArquivadas ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
                        Turmas arquivadas ({arquivadas.length})
                    </button>
                    {mostrarArquivadas && (arquivadas.length === 0 ? (
                        <p className={styles.empty}>Nenhuma turma arquivada encontrada.</p>
                    ) : (
                        <ul className={styles.list} style={{marginTop: 12}}>
                            {arquivadas.map(linhaTurma)}
                        </ul>
                    ))}
                </section>
            )}

            {paraExcluir && (paraExcluir.analise.podeExcluir ? (
                <ConfirmarExclusao
                    titulo={`Excluir a turma "${paraExcluir.turma.nome}"?`}
                    mensagem="A turma não tem alunos nem histórico. As atividades dela também serão excluídas. Esta ação não pode ser desfeita."
                    processando={processando}
                    onConfirmar={() => excluirTurma(paraExcluir.turma)}
                    onCancelar={() => setParaExcluir(null)}
                />
            ) : (
                <ConfirmarExclusao
                    variante="confirmar"
                    titulo={`Não é possível excluir a turma "${paraExcluir.turma.nome}"`}
                    mensagem={
                        <>
                            <span style={{display: "block"}}>{paraExcluir.analise.motivo}</span>
                            <span style={{display: "block", marginTop: 8}}>{textoArquivar}</span>
                        </>
                    }
                    rotuloConfirmar="Arquivar turma"
                    rotuloProcessando="Arquivando..."
                    rotuloCancelar="Fechar"
                    processando={processando}
                    onConfirmar={() => arquivarTurma(paraExcluir.turma)}
                    onCancelar={() => setParaExcluir(null)}
                />
            ))}

            {paraArquivar && (
                <ConfirmarExclusao
                    variante="confirmar"
                    titulo={`Arquivar a turma "${paraArquivar.nome}"?`}
                    mensagem={textoArquivar}
                    rotuloConfirmar="Arquivar turma"
                    rotuloProcessando="Arquivando..."
                    processando={processando}
                    onConfirmar={() => arquivarTurma(paraArquivar)}
                    onCancelar={() => setParaArquivar(null)}
                />
            )}
        </LayoutGestao>
    );
}

export default TurmasGestao;
