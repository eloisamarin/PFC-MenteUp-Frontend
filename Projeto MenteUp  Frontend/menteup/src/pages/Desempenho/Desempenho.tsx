import {useEffect, useState} from "react";
import {BookOpen, Percent, TrendingUp, Users, type LucideIcon} from "lucide-react";
import LayoutPainel from "../../components/LayoutPainel";
import {apiFetch, lerErro} from "../../services/api";
import type {PerfilGestao} from "../../services/turmaDesafio";
import type {DesempenhoDaTurma, TurmaResumo} from "../../types/desempenho";

/*
 * - Professor: o seletor mostra só as turmas dele (a API filtra em /turmas/minhas).
 * - Administrador: o seletor mostra todas as turmas.
 */
function Desempenho({perfil}: { perfil: PerfilGestao }) {
    const [turmas, setTurmas] = useState<TurmaResumo[]>([]);
    const [turmaId, setTurmaId] = useState<number | null>(null);
    const [desempenho, setDesempenho] = useState<DesempenhoDaTurma | null>(null);
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);

    // Ao abrir: busca as turmas e já seleciona a primeira
    useEffect(() => {
        async function carregarTurmas() {
            try {
                const resposta = await apiFetch("/turmas/minhas");

                if (!resposta.ok) {
                    setErro((await lerErro(resposta, "Não foi possível carregar as turmas.")).mensagem);
                    return;
                }

                const lista: TurmaResumo[] = await resposta.json();
                setTurmas(lista);

                if (lista.length > 0) {
                    setTurmaId(lista[0].id);
                }
            } catch {
                setErro("Não foi possível conectar ao servidor.");
            }
        }

        carregarTurmas();
    }, []);

    // Sempre que a turma escolhida muda, busca o desempenho dela
    useEffect(() => {
        if (turmaId == null) {
            return;
        }

        async function carregarDesempenho(id: number) {
            setCarregando(true);
            setErro(null);

            try {
                const resposta = await apiFetch(`/turmas/${id}/desempenho`);

                if (!resposta.ok) {
                    setDesempenho(null);
                    setErro((await lerErro(resposta, "Não foi possível carregar o desempenho.")).mensagem);
                    return;
                }

                setDesempenho(await resposta.json());
            } catch {
                setErro("Não foi possível conectar ao servidor.");
            } finally {
                setCarregando(false);
            }
        }

        carregarDesempenho(turmaId);
    }, [turmaId]);

    return (
        <LayoutPainel perfil={perfil}>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold">Desempenho da turma</h1>
                    <p className="mt-1 text-sm text-slate-400">
                        {perfil === "ADMINISTRADOR"
                            ? "Acompanhe o desempenho de qualquer turma."
                            : "Pontuação, acertos e atividades concluídas dos seus alunos."}
                    </p>
                </div>

                {turmas.length > 0 && (
                    <label className="flex flex-col gap-1 text-sm text-slate-400">
                        Turma
                        <select
                            value={turmaId ?? ""}
                            onChange={(evento) => setTurmaId(Number(evento.target.value))}
                            className="min-w-56 rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-700"
                        >
                            {turmas.map((turma) => (
                                <option key={turma.id} value={turma.id}>{turma.nome}</option>
                            ))}
                        </select>
                    </label>
                )}
            </div>

            {erro && (
                <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">{erro}</div>
            )}

            {!erro && turmas.length === 0 && (
                <p className="py-12 text-center text-sm text-slate-400">
                    {perfil === "ADMINISTRADOR"
                        ? "Nenhuma turma cadastrada."
                        : "Você ainda não está vinculado a nenhuma turma."}
                </p>
            )}

            {carregando && <p className="py-12 text-center text-sm text-slate-400">Carregando desempenho...</p>}

            {desempenho && !carregando && (
                <>
                    <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                        <Cartao icone={Users} valor={desempenho.totalAlunos} rotulo="Alunos"/>
                        <Cartao icone={BookOpen} valor={desempenho.totalAtividades} rotulo="Atividades publicadas"/>
                        <Cartao icone={TrendingUp} valor={desempenho.mediaPontuacao.toLocaleString("pt-BR")} rotulo="Média de pontuação"/>
                        <Cartao icone={Percent} valor={`${desempenho.taxaParticipacao}%`} rotulo="Participação"/>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                        {desempenho.alunos.length === 0 ? (
                            <p className="py-12 text-center text-sm text-slate-400">Esta turma ainda não tem alunos.</p>
                        ) : (
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-xs uppercase text-slate-400">
                                        <th className="px-5 py-3 font-semibold">Aluno</th>
                                        <th className="px-5 py-3 text-right font-semibold">Pontuação</th>
                                        <th className="px-5 py-3 text-right font-semibold">Acertos</th>
                                        <th className="px-5 py-3 text-right font-semibold">Atividades concluídas</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {desempenho.alunos.map((aluno) => (
                                        <tr key={aluno.alunoId} className="border-t hover:bg-slate-50">
                                            <td className="px-5 py-4 font-semibold">{aluno.nomeAluno}</td>
                                            <td className="px-5 py-4 text-right">{aluno.pontuacao}</td>
                                            <td className="px-5 py-4 text-right">{aluno.acertos}</td>
                                            <td className={`px-5 py-4 text-right ${aluno.atividadesConcluidas === 0 ? "font-semibold text-red-500" : ""}`}>
                                                {aluno.atividadesConcluidas} / {desempenho.totalAtividades}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </>
            )}
        </LayoutPainel>
    );
}

// Cartão de resumo da turma (alunos, atividades, média, participação)
function Cartao({icone: Icone, valor, rotulo}: { icone: LucideIcon; valor: number | string; rotulo: string }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Icone size={22} className="mb-2 text-indigo-500"/>
            <p className="text-2xl font-semibold">{valor}</p>
            <p className="text-sm text-slate-400">{rotulo}</p>
        </div>
    );
}

export default Desempenho;