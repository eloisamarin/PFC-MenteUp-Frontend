import {Trophy} from "lucide-react";
import {contagem, type LinhaRanking, type StatusDesafio} from "../services/turmaDesafio";

const ROTULO_STATUS: Record<StatusDesafio, string> = {
    AGUARDANDO: "Aguardando",
    EM_ANDAMENTO: "Ao vivo",
    ENCERRADO: "Encerrado",
};

const COR_STATUS: Record<StatusDesafio, string> = {
    AGUARDANDO: "bg-amber-100 text-amber-800",
    EM_ANDAMENTO: "bg-green-100 text-green-800",
    ENCERRADO: "bg-slate-100 text-slate-600",
};

export function BadgeStatusDesafio({status}: { status: StatusDesafio }) {
    return (
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${COR_STATUS[status]}`}>
            {ROTULO_STATUS[status]}
        </span>
    );
}

export function BarraTempo({restantes, total}: { restantes: number; total: number }) {
    const percentual = total > 0 ? Math.min(100, (restantes / total) * 100) : 0;
    const acabando = restantes <= 5;

    return (
        <div>
            <div className="mb-1 flex justify-between text-sm">
                <span className="text-slate-500">Tempo restante</span>
                <span className={`font-bold tabular-nums ${acabando ? "text-rose-600" : "text-slate-700"}`}>
                    {restantes}s
                </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                    className={`h-full transition-all duration-1000 ease-linear ${acabando ? "bg-rose-500" : "bg-indigo-500"}`}
                    style={{width: `${percentual}%`}}
                />
            </div>
        </div>
    );
}

interface TabelaRankingProps {
    ranking: LinhaRanking[];
    destaqueUsuarioId?: number;
    titulo: string;
}

export function TabelaRanking({ranking, destaqueUsuarioId, titulo}: TabelaRankingProps) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 flex items-center gap-2 font-semibold">
                <Trophy size={18} className="text-amber-500"/>
                {titulo}
            </h2>

            {ranking.length === 0 ? (
                <p className="py-4 text-center text-sm text-slate-400">
                    Ainda não há pontuação para mostrar.
                </p>
            ) : (
                <ol className="space-y-2">
                    {ranking.map((linha) => (
                        <li
                            key={linha.usuarioId}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
                                linha.usuarioId === destaqueUsuarioId
                                    ? "bg-indigo-50 ring-1 ring-indigo-200"
                                    : "bg-slate-50"
                            }`}
                        >
                            <span className="w-6 text-center font-bold text-slate-500">{linha.posicao}</span>
                            <span className="min-w-0 flex-1 truncate font-medium">{linha.nomeUsuario}</span>
                            <span className="text-xs text-slate-400">
                                {contagem(linha.acertos, "acerto", "acertos")}
                            </span>
                            <span className="font-bold tabular-nums text-indigo-600">{linha.pontos}</span>
                        </li>
                    ))}
                </ol>
            )}
        </div>
    );
}
