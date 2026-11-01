import {useCallback, useEffect, useRef, useState} from "react";
import {apiFetch, lerErro} from "../services/api";
import type {EstadoDesafio, LinhaRanking} from "../services/turmaDesafio";

const INTERVALO_ESTADO_MS = 1000;

// O estado do jogo vem sempre do servidor, consultado a cada segundo; o polling para quando o desafio encerra
export function useEstadoDesafio(id: string | undefined) {
    const [estado, setEstado] = useState<EstadoDesafio | null>(null);
    const [ranking, setRanking] = useState<LinhaRanking[]>([]);
    const [erro, setErro] = useState("");
    const [carregando, setCarregando] = useState(true);
    const montado = useRef(true);
    const semAcesso = useRef(false);

    const atualizar = useCallback(async () => {
        const resposta = await apiFetch(`/desafios/${id}/estado`);

        if (!resposta.ok) {
            // Desafio inexistente ou de outra turma: repetir a consulta não adianta
            semAcesso.current = resposta.status === 403 || resposta.status === 404;

            const erroApi = await lerErro(resposta, "Não foi possível carregar o desafio.");
            if (montado.current) {
                setErro(erroApi.mensagem);
            }
            return null;
        }

        const dados: EstadoDesafio = await resposta.json();

        if (montado.current) {
            setErro("");
            setEstado(dados);
        }

        return dados;
    }, [id]);

    const atualizarRanking = useCallback(async () => {
        const resposta = await apiFetch(`/desafios/${id}/ranking`);

        if (resposta.ok && montado.current) {
            setRanking(await resposta.json());
        }
    }, [id]);

    useEffect(() => {
        montado.current = true;
        let ativo = true;
        let temporizador: ReturnType<typeof setTimeout>;

        async function consultar() {
            let dados: EstadoDesafio | null = null;

            try {
                dados = await atualizar();
            } catch (error) {
                console.error("Erro ao consultar o desafio:", error);
                if (ativo) {
                    setErro("Sem conexão com o servidor. Tentando novamente...");
                }
            }

            if (!ativo) {
                return;
            }

            setCarregando(false);

            if (dados?.status !== "ENCERRADO" && !semAcesso.current) {
                temporizador = setTimeout(consultar, INTERVALO_ESTADO_MS);
            }
        }

        consultar();

        return () => {
            ativo = false;
            montado.current = false;
            clearTimeout(temporizador);
        };
    }, [atualizar]);

    const perguntaEncerrada = estado?.perguntaEncerrada ?? false;
    const encerrado = estado?.status === "ENCERRADO";
    const numeroPergunta = estado?.numeroPergunta ?? 0;

    // O ranking só muda quando uma pergunta fecha
    useEffect(() => {
        if (perguntaEncerrada || encerrado) {
            atualizarRanking().catch((error) => console.error("Erro ao carregar o ranking:", error));
        }
    }, [perguntaEncerrada, encerrado, numeroPergunta, atualizarRanking]);

    return {estado, ranking, erro, setErro, carregando, atualizar};
}
