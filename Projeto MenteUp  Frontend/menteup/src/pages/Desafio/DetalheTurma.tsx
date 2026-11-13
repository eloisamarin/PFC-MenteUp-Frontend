import {useEffect, useState, type FormEvent} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {ArrowLeft, BookOpen, Check, Inbox, Plus, UserMinus, UserPlus, Users, X, Zap} from "lucide-react";
import ConfirmarExclusao from "../../components/ConfirmarExclusao";
import {BadgeStatusDesafio} from "../../components/ComponentesDesafio";
import {apiFetch, lerErro} from "../../services/api";
import {
    contagem,
    ROTA_BASE,
    type AlunoTurma,
    type Desafio,
    type PerfilGestao,
    type TurmaDetalhe,
} from "../../services/turmaDesafio";
import {LayoutGestao} from "./TurmasGestao";
import styles from "./TurmasGestao.module.css";

// Pedido de um aluno para entrar ou sair da turma (GET /turmas/{id}/solicitacoes)
interface Solicitacao {
    id: number;
    alunoId: number;
    alunoNome: string;
    tipo: "ENTRADA" | "SAIDA";
    criadaEm: string;
}

function DetalheTurma({perfil}: { perfil: PerfilGestao }) {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();
    const base = ROTA_BASE[perfil];

    const [turma, setTurma] = useState<TurmaDetalhe | null>(null);
    const [desafios, setDesafios] = useState<Desafio[]>([]);
    const [usuarios, setUsuarios] = useState<AlunoTurma[]>([]);
    const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
    const [respondendo, setRespondendo] = useState<number | null>(null);
    const [buscaAluno, setBuscaAluno] = useState("");
    const [nomeDesafio, setNomeDesafio] = useState("");
    const [vinculando, setVinculando] = useState<number | null>(null);
    const [paraRemover, setParaRemover] = useState<AlunoTurma | null>(null);
    const [removendo, setRemovendo] = useState(false);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [versao, setVersao] = useState(0);

    useEffect(() => {
        async function carregar() {
            try {
                const [respostaTurma, respostaDesafios, respostaUsuarios, respostaSolicitacoes] = await Promise.all([
                    apiFetch(`/turmas/${id}`),
                    apiFetch("/desafios"),
                    apiFetch("/usuarios/all"),
                    apiFetch(`/turmas/${id}/solicitacoes`),
                ]);

                if (!respostaTurma.ok) {
                    setErro("Turma não encontrada.");
                    return;
                }

                setTurma(await respostaTurma.json());

                if (respostaDesafios.ok) {
                    const todos: Desafio[] = await respostaDesafios.json();
                    setDesafios(todos.filter((desafio) => desafio.turma.id === Number(id)));
                }

                if (respostaUsuarios.ok) {
                    setUsuarios(await respostaUsuarios.json());
                }

                // Pedidos pendentes: só o professor da turma ou um administrador recebe (senão, 403)
                setSolicitacoes(respostaSolicitacoes.ok ? await respostaSolicitacoes.json() : []);
            } catch (error) {
                console.error("Erro ao carregar a turma:", error);
                setErro("Não foi possível carregar a turma.");
            } finally {
                setCarregando(false);
            }
        }

        carregar();
    }, [id, versao]);

    async function vincularAluno(aluno: AlunoTurma) {
        try {
            setVinculando(aluno.id);
            setErro("");

            const resposta = await apiFetch(`/turmas/${id}/alunos/${aluno.id}`, {method: "POST"});

            if (!resposta.ok) {
                const erroApi = await lerErro(resposta, "Não foi possível adicionar o aluno.");
                setErro(erroApi.mensagem);
                return;
            }

            setBuscaAluno("");
            setVersao((atual) => atual + 1);
        } catch (error) {
            console.error("Erro ao adicionar aluno:", error);
            setErro("Não foi possível adicionar o aluno.");
        } finally {
            setVinculando(null);
        }
    }

    // Aprova ou recusa o pedido de um aluno
    async function responderSolicitacao(solicitacao: Solicitacao, acao: "aprovar" | "recusar") {
        try {
            setRespondendo(solicitacao.id);
            setErro("");

            const resposta = await apiFetch(`/turmas/${id}/solicitacoes/${solicitacao.id}/${acao}`, {method: "PUT"});

            if (!resposta.ok) {
                const erroApi = await lerErro(resposta, "Não foi possível responder ao pedido.");
                setErro(erroApi.mensagem);
                return;
            }

            setVersao((atual) => atual + 1);
        } catch (error) {
            console.error("Erro ao responder ao pedido:", error);
            setErro("Não foi possível responder ao pedido.");
        } finally {
            setRespondendo(null);
        }
    }

    async function removerAluno() {
        if (!paraRemover) return;

        try {
            setRemovendo(true);
            setErro("");

            const resposta = await apiFetch(`/turmas/${id}/alunos/${paraRemover.id}`, {method: "DELETE"});

            if (!resposta.ok) {
                const erroApi = await lerErro(resposta, "Não foi possível remover o aluno.");
                setErro(erroApi.mensagem);
                return;
            }

            setVersao((atual) => atual + 1);
        } catch (error) {
            console.error("Erro ao remover aluno:", error);
            setErro("Não foi possível remover o aluno.");
        } finally {
            setRemovendo(false);
            setParaRemover(null);
        }
    }

    const voltar = (
        <button type="button" onClick={() => navigate(`${base}/turmas`)} className={styles.back}>
            <ArrowLeft size={16}/> Voltar para turmas
        </button>
    );

    if (carregando) {
        return (
            <LayoutGestao perfil={perfil}>
                <p className={styles.empty}>Carregando turma...</p>
            </LayoutGestao>
        );
    }

    if (!turma) {
        return (
            <LayoutGestao perfil={perfil}>
                {voltar}
                <div className={styles.error} role="alert">{erro}</div>
            </LayoutGestao>
        );
    }

    const idsMatriculados = new Set(turma.alunos.map((aluno) => aluno.id));
    // A turma não traz o e-mail dos alunos (LGPD); professor e administrador o recebem na lista de usuários
    const emailPorId = new Map(usuarios.map((usuario) => [usuario.id, usuario.usuario]));
    const termo = buscaAluno.trim().toLowerCase();
    const candidatos = !termo ? [] : usuarios
        .filter((usuario) => usuario.tipoUsuario?.toUpperCase() === "ALUNO" && !idsMatriculados.has(usuario.id))
        .filter((usuario) =>
            usuario.nomeUsuario.toLowerCase().includes(termo) || (usuario.usuario ?? "").toLowerCase().includes(termo)
        )
        .slice(0, 6);

    function adicionarPrimeiro(event: FormEvent) {
        event.preventDefault();
        if (candidatos.length > 0) vincularAluno(candidatos[0]);
    }

    function novoDesafio(event: FormEvent) {
        event.preventDefault();
        const titulo = nomeDesafio.trim();
        const parametros = new URLSearchParams({turma: String(turma!.id)});
        if (titulo) parametros.set("titulo", titulo);
        navigate(`${base}/desafios/criar?${parametros.toString()}`);
    }

    return (
        <LayoutGestao perfil={perfil}>
            {voltar}

            <header className={styles.header}>
                <h1 className={styles.title}>Turma {turma.nome}</h1>
                <p className={styles.subtitle}>
                    {contagem(turma.alunos.length, "aluno", "alunos")} · {contagem(turma.atividade.length, "atividade", "atividades")} · {contagem(desafios.length, "desafio", "desafios")}
                </p>
            </header>

            {erro && <div className={styles.error} role="alert">{erro}</div>}

            <div className={styles.detailGrid}>
                <section className={`${styles.card} ${styles.panel} ${styles.panelTall}`}>
                    <h2 className={styles.panelTitle}>
                        <Users size={20} className={styles.indigo}/> Alunos
                    </h2>

                    <form onSubmit={adicionarPrimeiro} className={styles.inlineForm}>
                        <input
                            value={buscaAluno}
                            onChange={(event) => setBuscaAluno(event.target.value)}
                            placeholder="Adicionar aluno por nome ou e-mail"
                            aria-label="Adicionar aluno por nome ou e-mail"
                            className={styles.input}
                        />
                        <button
                            type="submit"
                            title="Adicionar o primeiro aluno encontrado"
                            aria-label="Adicionar o primeiro aluno encontrado"
                            disabled={candidatos.length === 0 || vinculando !== null}
                            className={styles.squareButton}
                        >
                            <UserPlus size={18}/>
                        </button>
                    </form>

                    {termo && (
                        <ul className={styles.suggestions}>
                            {candidatos.length === 0 && (
                                <li className={styles.muted}>Nenhum aluno disponível com esse termo.</li>
                            )}
                            {candidatos.map((aluno) => (
                                <li key={aluno.id} className={styles.person}>
                                    <span className={styles.personInfo}>
                                        <strong>{aluno.nomeUsuario}</strong>
                                        {aluno.usuario && <small>{aluno.usuario}</small>}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => vincularAluno(aluno)}
                                        disabled={vinculando === aluno.id}
                                        className={styles.smallButton}
                                    >
                                        <UserPlus size={14}/> Adicionar
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}

                    {solicitacoes.length > 0 && (
                        <div className={styles.suggestions}>
                            <p className={styles.muted}>
                                <Inbox size={14}/> {contagem(solicitacoes.length, "pedido aguardando resposta", "pedidos aguardando resposta")}
                            </p>
                            <ul className={styles.people}>
                                {solicitacoes.map((solicitacao) => (
                                    <li key={solicitacao.id} className={styles.person}>
                                        <span className={styles.personInfo}>
                                            <strong>{solicitacao.alunoNome}</strong>
                                            <small>{solicitacao.tipo === "ENTRADA" ? "Quer entrar na turma" : "Quer sair da turma"}</small>
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => responderSolicitacao(solicitacao, "aprovar")}
                                            disabled={respondendo === solicitacao.id}
                                            className={styles.smallButton}
                                        >
                                            <Check size={14}/> Aprovar
                                        </button>
                                        <button
                                            type="button"
                                            title={`Recusar o pedido de ${solicitacao.alunoNome}`}
                                            aria-label={`Recusar o pedido de ${solicitacao.alunoNome}`}
                                            onClick={() => responderSolicitacao(solicitacao, "recusar")}
                                            disabled={respondendo === solicitacao.id}
                                            className={`${styles.iconButton} ${styles.iconDanger}`}
                                        >
                                            <X size={17}/>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {turma.alunos.length === 0 ? (
                        <p className={styles.muted}>Nenhum aluno nesta turma ainda.</p>
                    ) : (
                        <ul className={styles.people}>
                            {turma.alunos.map((aluno) => (
                                <li key={aluno.id} className={styles.person}>
                                    <span className={styles.personAvatar}>{aluno.nomeUsuario.charAt(0).toUpperCase()}</span>
                                    <span className={styles.personInfo}>
                                        <strong>{aluno.nomeUsuario}</strong>
                                        {emailPorId.get(aluno.id) && <small>{emailPorId.get(aluno.id)}</small>}
                                    </span>
                                    <button
                                        type="button"
                                        title={`Remover ${aluno.nomeUsuario} da turma`}
                                        aria-label={`Remover ${aluno.nomeUsuario} da turma`}
                                        onClick={() => setParaRemover(aluno)}
                                        className={`${styles.iconButton} ${styles.iconDanger}`}
                                    >
                                        <UserMinus size={17}/>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section className={`${styles.card} ${styles.panel}`}>
                    <h2 className={styles.panelTitle}>
                        <Zap size={20} className={styles.gold}/> Desafios
                    </h2>

                    <form onSubmit={novoDesafio} className={styles.inlineForm}>
                        <input
                            value={nomeDesafio}
                            onChange={(event) => setNomeDesafio(event.target.value)}
                            maxLength={100}
                            placeholder="Nome do novo desafio"
                            aria-label="Nome do novo desafio"
                            className={styles.input}
                        />
                        <button type="submit" className={styles.ghostButton}>
                            <Plus size={16}/> Novo desafio
                        </button>
                    </form>

                    {desafios.length === 0 ? (
                        <p className={styles.muted}>Nenhum desafio nesta turma.</p>
                    ) : (
                        <ul className={styles.items}>
                            {desafios.map((desafio) => (
                                <li key={desafio.id}>
                                    <button type="button" onClick={() => navigate(`${base}/desafios/${desafio.id}`)} className={styles.item}>
                                        <Zap size={16}/>
                                        <span>{desafio.titulo}</span>
                                        <BadgeStatusDesafio status={desafio.status}/>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section className={`${styles.card} ${styles.panel}`}>
                    <h2 className={styles.panelTitle}>
                        <BookOpen size={20} className={styles.mint}/> Atividades
                    </h2>

                    {turma.atividade.length === 0 ? (
                        <p className={styles.muted}>Nenhuma atividade nesta turma.</p>
                    ) : (
                        <ul className={styles.items}>
                            {turma.atividade.map((atividade) => (
                                <li key={atividade.id}>
                                    <button type="button" onClick={() => navigate(`${base}/atividades/${atividade.id}`)} className={styles.item}>
                                        <BookOpen size={16}/>
                                        <span>{atividade.titulo}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>

            {paraRemover && (
                <ConfirmarExclusao
                    titulo={`Remover ${paraRemover.nomeUsuario} da turma?`}
                    mensagem="As atividades e os desafios desta turma deixam de aparecer para esta pessoa. A conta continua no sistema, e é possível adicioná-la de novo."
                    processando={removendo}
                    rotuloConfirmar="Remover"
                    rotuloProcessando="Removendo..."
                    onConfirmar={removerAluno}
                    onCancelar={() => setParaRemover(null)}
                />
            )}
        </LayoutGestao>
    );
}

export default DetalheTurma;
