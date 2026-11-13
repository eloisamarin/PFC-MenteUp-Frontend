import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {Play, Trophy} from "lucide-react";
import AlunoLayout from "../../components/aluno/AlunoLayout";
import {BadgeStatusDesafio, IconeDesafio} from "../../components/ComponentesDesafio";
import {apiFetch} from "../../services/api";
import {contagem, type Desafio, type StatusDesafio} from "../../services/turmaDesafio";
import base from "./TurmasGestao.module.css";
import styles from "./Desafios.module.css";

const INTERVALO_LISTA_MS = 5000;

const ORDEM_STATUS: Record<StatusDesafio, number> = {
    EM_ANDAMENTO: 0,
    AGUARDANDO: 1,
    ENCERRADO: 2,
};

const ACAO_STATUS: Record<StatusDesafio, string> = {
    EM_ANDAMENTO: "Entrar agora",
    AGUARDANDO: "Entrar na sala",
    ENCERRADO: "Ver resultado",
};

function DesafiosAluno() {
    const navigate = useNavigate();

    const [desafios, setDesafios] = useState<Desafio[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    useEffect(() => {
        async function carregar() {
            try {
                const resposta = await apiFetch("/desafios");
                if (!resposta.ok) throw new Error("Falha ao consultar os desafios.");
                setDesafios(await resposta.json());
                setErro("");
            } catch (error) {
                console.error("Erro ao carregar desafios:", error);
                setErro("Não foi possível carregar os desafios.");
            } finally {
                setCarregando(false);
            }
        }

        carregar();
        const intervalo = setInterval(carregar, INTERVALO_LISTA_MS);

        return () => clearInterval(intervalo);
    }, []);

    const ordenados = [...desafios].sort((a, b) => ORDEM_STATUS[a.status] - ORDEM_STATUS[b.status]);

    return (
        <AlunoLayout>
            <header className={base.header}>
                <span className={base.eyebrow}>Quizzes ao vivo</span>
                <h1 className={`${base.title} ${styles.titleWithIcon}`}>
                    Desafios <IconeDesafio tamanho={36}/>
                </h1>
                <p className={base.subtitle}>Responda rápido: acertos mais velozes valem mais pontos.</p>
            </header>

            {erro && <div className={base.error} role="alert">{erro}</div>}

            {carregando ? (
                <p className={base.empty}>Carregando desafios...</p>
            ) : ordenados.length === 0 ? (
                <div className={base.empty}>
                    <IconeDesafio tamanho={36}/>
                    <p><strong>Nenhum desafio por aqui</strong></p>
                    <p>Os desafios aparecem quando o professor adicionar você a uma turma.</p>
                </div>
            ) : (
                <ul className={base.list}>
                    {ordenados.map((desafio) => {
                        const encerrado = desafio.status === "ENCERRADO";
                        const abrir = () => navigate(`/aluno/desafios/${desafio.id}`);
                        return (
                            <li key={desafio.id} className={`${base.card} ${base.row}`}>
                                <span className={`${base.avatar} ${styles.avatarDesafio}`}>
                                    <IconeDesafio tamanho={26}/>
                                </span>
                                <button type="button" onClick={abrir} className={base.rowMain}>
                                    <span className={styles.rowTitle}>
                                        <strong>{desafio.titulo}</strong>
                                        <BadgeStatusDesafio status={desafio.status}/>
                                    </span>
                                    <small>
                                        {desafio.turma.nome} · {contagem(desafio.totalPerguntas, "pergunta", "perguntas")}
                                        {desafio.descricao && ` · ${desafio.descricao}`}
                                    </small>
                                </button>
                                <div className={base.actions}>
                                    <button
                                        type="button"
                                        onClick={abrir}
                                        className={`${encerrado ? base.ghostButton : base.primaryButton} ${styles.rowAction}`}
                                    >
                                        {encerrado ? <Trophy size={16}/> : <Play size={16}/>}
                                        {ACAO_STATUS[desafio.status]}
                                    </button>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </AlunoLayout>
    );
}

export default DesafiosAluno;
