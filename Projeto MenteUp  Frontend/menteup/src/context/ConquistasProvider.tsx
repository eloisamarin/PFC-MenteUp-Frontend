import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";

import ComemoracaoConquistas from "../components/conquistas/ComemoracaoConquistas";
import { buscarConquistasNovas, buscarMinhasConquistas } from "../services/conquistas";
import { obterUsuarioLogado } from "../services/usuarioLogado";
import type { Conquista, ResumoConquistas } from "../types/conquista";
import { ConquistasContexto, type ValorConquistas } from "./conquistasContexto";

// Identifica a sessão atual: muda a cada novo login
function sessaoAtual(): string | null {
    const usuario = obterUsuarioLogado();
    if (usuario?.tipoUsuario !== "ALUNO") return null;
    return localStorage.getItem("token");
}

// Guarda as conquistas do aluno para todas as telas e mostra a comemoração
export default function ConquistasProvider({ children }: { children: ReactNode }) {
    const [dados, setDados] = useState<{ sessao: string; resumo: ResumoConquistas } | null>(null);
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState("");
    const [paraComemorar, setParaComemorar] = useState<Conquista[]>([]);

    const buscandoResumo = useRef<Promise<void> | null>(null);
    const buscandoNovas = useRef<Promise<void> | null>(null);
    const sessaoVerificada = useRef<string | null>(null);
    const sessaoDosDados = useRef<string | null>(null);

    const carregarResumo = useCallback(async (forcar = false) => {
        const sessao = sessaoAtual();
        if (!sessao) return;
        if (!forcar && sessaoDosDados.current === sessao) return;
        // Evita pedir a mesma coisa duas vezes ao mesmo tempo
        if (buscandoResumo.current) return buscandoResumo.current;

        buscandoResumo.current = (async () => {
            try {
                setCarregando(true);
                setErro("");
                const resumo = await buscarMinhasConquistas();
                sessaoDosDados.current = sessao;
                setDados({ sessao, resumo });
            } catch (e) {
                const mensagem = (e as { mensagem?: string })?.mensagem;
                setErro(mensagem ?? "Não foi possível carregar suas conquistas.");
            } finally {
                setCarregando(false);
                buscandoResumo.current = null;
            }
        })();

        return buscandoResumo.current;
    }, []);

    const verificarNovas = useCallback(async () => {
        if (!sessaoAtual()) return;
        // A segunda chamada ao mesmo tempo voltaria vazia, então reaproveitamos a primeira
        if (buscandoNovas.current) return buscandoNovas.current;

        buscandoNovas.current = (async () => {
            try {
                const novas = await buscarConquistasNovas();
                if (novas.length > 0) {
                    setParaComemorar((fila) => [
                        ...fila,
                        ...novas.filter((n) => !fila.some((f) => f.id === n.id)),
                    ]);
                }
                // XP e progresso podem ter mudado mesmo sem conquista nova
                await carregarResumo(true);
            } finally {
                buscandoNovas.current = null;
            }
        })();

        return buscandoNovas.current;
    }, [carregarResumo]);

    // Uma vez por login: o login conta o dia do Intensivão e pode liberar conquistas
    const verificarAoEntrar = useCallback(() => {
        const sessao = sessaoAtual();
        if (!sessao || sessaoVerificada.current === sessao) return;
        sessaoVerificada.current = sessao;
        void verificarNovas();
    }, [verificarNovas]);

    const fecharComemoracao = useCallback(() => {
        setParaComemorar([]);
        void carregarResumo(true);
    }, [carregarResumo]);

    const sessao = sessaoAtual();
    const resumo = dados && dados.sessao === sessao ? dados.resumo : null;

    const valor = useMemo<ValorConquistas>(
        () => ({ resumo, carregando, erro, carregarResumo, verificarNovas, verificarAoEntrar }),
        [resumo, carregando, erro, carregarResumo, verificarNovas, verificarAoEntrar]
    );

    return (
        <ConquistasContexto.Provider value={valor}>
            {children}
            {paraComemorar.length > 0 && (
                <ComemoracaoConquistas conquistas={paraComemorar} aoFechar={fecharComemoracao} />
            )}
        </ConquistasContexto.Provider>
    );
}
