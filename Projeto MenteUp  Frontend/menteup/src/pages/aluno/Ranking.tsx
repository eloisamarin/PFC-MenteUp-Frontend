import {useEffect, useMemo, useState} from "react";
import {apiFetch} from "../../services/api";

interface RankingAluno {
    usuarioId: number;
    nomeUsuario: string;
    pontuacaoTotal: number;
    atividadesConcluidas: number;
}

export default function Ranking() {
    const [ranking, setRanking] = useState<RankingAluno[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    useEffect(() => {
        carregarRanking();
    }, []);

    async function carregarRanking() {
        try {
            setCarregando(true);
            setErro("");

            const resposta = await apiFetch("/ranking");

            if (!resposta.ok) {
                throw new Error(
                    "Não foi possível carregar o ranking."
                );
            }

            const dados: RankingAluno[] =
                await resposta.json();

            setRanking(dados);

        } catch (error) {
            console.error(
                "Erro ao carregar ranking:",
                error
            );

            setErro(
                "Não foi possível carregar o ranking."
            );
        } finally {
            setCarregando(false);
        }
    }

    const primeiroLugar = ranking[0];
    const segundoLugar = ranking[1];
    const terceiroLugar = ranking[2];

    /*
     * Caso o usuário autenticado esteja armazenado
     * no localStorage, podemos recuperar o ID para
     * destacar a posição dele.
     *
     * Ajuste a chave conforme a autenticação atual
     * do seu projeto.
     */
    const usuarioLogadoId = Number(
        localStorage.getItem("usuarioId")
    );

    const posicaoUsuario = useMemo(() => {
        if (!usuarioLogadoId) {
            return null;
        }

        const indice = ranking.findIndex(
            aluno =>
                aluno.usuarioId === usuarioLogadoId
        );

        return indice === -1
            ? null
            : indice + 1;

    }, [ranking, usuarioLogadoId]);

    if (carregando) {
        return (
            <div className="min-h-screen p-6">

                <div className="max-w-5xl mx-auto">

                    <div className="animate-pulse">

                        <div className="h-8 w-48 bg-gray-200 rounded mb-3"/>

                        <div className="h-4 w-80 bg-gray-200 rounded mb-10"/>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="h-48 bg-gray-200 rounded-2xl"/>
                            <div className="h-56 bg-gray-200 rounded-2xl"/>
                            <div className="h-48 bg-gray-200 rounded-2xl"/>
                        </div>

                    </div>

                </div>

            </div>
        );
    }

    if (erro) {
        return (
            <div className="min-h-screen p-6">

                <div className="max-w-5xl mx-auto">

                    <div className="bg-red-50 border border-red-200 rounded-xl p-5">

                        <p className="text-red-700">
                            {erro}
                        </p>

                        <button
                            type="button"
                            onClick={carregarRanking}
                            className="mt-3 text-sm font-semibold text-red-700 hover:underline"
                        >
                            Tentar novamente
                        </button>

                    </div>

                </div>

            </div>
        );
    }

    return (
        <div className="min-h-screen p-6">

            <div className="max-w-5xl mx-auto">

                {/* Cabeçalho */}

                <div className="mb-8">

                    <h1 className="text-3xl font-bold text-gray-900">
                        Ranking
                    </h1>

                    <p className="text-gray-500 mt-2">
                        Veja sua posição e acompanhe seu desempenho
                        nos estudos.
                    </p>

                </div>


                {/* Posição do usuário */}

                {posicaoUsuario !== null && (
                    <div className="mb-8 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">

                        <div className="flex items-center justify-between">

                            <div>

                                <p className="text-sm text-gray-500">
                                    Sua posição
                                </p>

                                <p className="text-2xl font-bold text-gray-900">
                                    {posicaoUsuario}º lugar
                                </p>

                            </div>

                            <div className="text-right">

                                <p className="text-sm text-gray-500">
                                    Pontuação
                                </p>

                                <p className="text-xl font-bold text-[#5b4cff]">
                                    {ranking[posicaoUsuario - 1]?.pontuacaoTotal ?? 0} pts
                                </p>

                            </div>

                        </div>

                    </div>
                )}


                {/* Ranking vazio */}

                {ranking.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">

                        <h2 className="text-lg font-semibold text-gray-800">
                            Ainda não há participantes no ranking
                        </h2>

                        <p className="text-gray-500 mt-2">
                            Conclua uma atividade para começar
                            a acumular pontos.
                        </p>

                    </div>
                ) : (
                    <>

                        {/* Pódio */}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end mb-10">

                            <PodioCard
                                aluno={segundoLugar}
                                posicao={2}
                            />

                            <PodioCard
                                aluno={primeiroLugar}
                                posicao={1}
                                destaque
                            />

                            <PodioCard
                                aluno={terceiroLugar}
                                posicao={3}
                            />

                        </div>


                        {/* Lista completa */}

                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

                            <div className="px-6 py-5 border-b border-gray-100">

                                <h2 className="font-bold text-gray-900">
                                    Classificação
                                </h2>

                            </div>

                            <div>

                                {ranking.map(
                                    (aluno, index) => {

                                        const posicao =
                                            index + 1;

                                        const ehUsuario =
                                            aluno.usuarioId ===
                                            usuarioLogadoId;

                                        return (
                                            <div
                                                key={aluno.usuarioId}
                                                className={`
                                                    flex items-center gap-4
                                                    px-6 py-4
                                                    border-b border-gray-100
                                                    last:border-b-0
                                                    ${ehUsuario
                                                    ? "bg-[#f5f3ff]"
                                                    : "bg-white"
                                                }
                                                `}
                                            >

                                                {/* Posição */}

                                                <div className="w-10 text-center">

                                                    <span
                                                        className={`
                                                            font-bold
                                                            ${posicao <= 3
                                                            ? "text-[#5b4cff]"
                                                            : "text-gray-500"
                                                        }
                                                        `}
                                                    >
                                                        {posicao}º
                                                    </span>

                                                </div>


                                                {/* Avatar */}

                                                <div
                                                    className="w-10 h-10 rounded-full bg-[#eeeaff] flex items-center justify-center flex-shrink-0">

                                                    <span className="font-bold text-[#5b4cff]">
                                                        {aluno.nomeUsuario
                                                            ?.charAt(0)
                                                            ?.toUpperCase()}
                                                    </span>

                                                </div>


                                                {/* Nome */}

                                                <div className="flex-1 min-w-0">

                                                    <p className="font-semibold text-gray-900 truncate">

                                                        {aluno.nomeUsuario}

                                                        {ehUsuario && (
                                                            <span className="ml-2 text-xs font-medium text-[#5b4cff]">
                                                                Você
                                                            </span>
                                                        )}

                                                    </p>

                                                    <p className="text-sm text-gray-500">
                                                        {aluno.atividadesConcluidas}{" "}
                                                        {aluno.atividadesConcluidas === 1
                                                            ? "atividade concluída"
                                                            : "atividades concluídas"
                                                        }
                                                    </p>

                                                </div>


                                                {/* Pontuação */}

                                                <div className="text-right">

                                                    <p className="font-bold text-gray-900">
                                                        {aluno.pontuacaoTotal}
                                                    </p>

                                                    <p className="text-xs text-gray-500">
                                                        pontos
                                                    </p>

                                                </div>

                                            </div>
                                        );
                                    }
                                )}

                            </div>

                        </div>

                    </>
                )}

            </div>

        </div>
    );
}


interface PodioCardProps {
    aluno?: RankingAluno;
    posicao: number;
    destaque?: boolean;
}

function PodioCard({
                       aluno,
                       posicao,
                       destaque = false,
                   }: PodioCardProps) {

    if (!aluno) {
        return (
            <div className="hidden md:block"/>
        );
    }

    return (
        <div
            className={`
                bg-white
                rounded-2xl
                border
                border-gray-100
                shadow-sm
                p-6
                text-center
                ${destaque
                ? "md:py-9"
                : "md:py-6"
            }
            `}
        >

            <div className="text-3xl mb-3">
                {posicao === 1
                    ? "🥇"
                    : posicao === 2
                        ? "🥈"
                        : "🥉"
                }
            </div>

            <div className="w-14 h-14 mx-auto rounded-full bg-[#eeeaff] flex items-center justify-center mb-3">

                <span className="text-xl font-bold text-[#5b4cff]">
                    {aluno.nomeUsuario
                        ?.charAt(0)
                        ?.toUpperCase()}
                </span>

            </div>

            <h3 className="font-bold text-gray-900 truncate">
                {aluno.nomeUsuario}
            </h3>

            <p className="text-sm text-gray-500 mt-1">
                {aluno.atividadesConcluidas}{" "}
                {aluno.atividadesConcluidas === 1
                    ? "atividade"
                    : "atividades"
                }
            </p>

            <p className="text-xl font-bold text-[#5b4cff] mt-3">
                {aluno.pontuacaoTotal} pts
            </p>

        </div>
    );
}