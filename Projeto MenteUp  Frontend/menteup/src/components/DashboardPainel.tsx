import {useNavigate} from "react-router-dom";
import {BookOpen, Users, Zap, type LucideIcon} from "lucide-react";
import LayoutPainel from "./LayoutPainel";
import {ROTA_BASE, usuarioLogado, type Perfil} from "../services/turmaDesafio";

interface Atalho {
    titulo: string;
    descricao: string;
    rota: string;
    icone: LucideIcon;
}

function atalhosDoPerfil(perfil: Perfil): Atalho[] {
    const base = ROTA_BASE[perfil];
    const aluno = perfil === "ALUNO";

    return [
        {
            titulo: "Turmas",
            descricao: aluno ? "Entre nas turmas das suas aulas." : "Crie turmas e organize os alunos.",
            rota: `${base}/turmas`,
            icone: Users,
        },
        {
            titulo: "Atividades",
            descricao: aluno ? "Responda as atividades das suas turmas." : "Gerenciamento de atividades.",
            rota: `${base}/atividades`,
            icone: BookOpen,
        },
        {
            titulo: "Desafios",
            descricao: aluno ? "Dispute quizzes ao vivo com a turma." : "Crie e conduza quizzes ao vivo.",
            rota: `${base}/desafios`,
            icone: Zap,
        },
    ];
}

function DashboardPainel({perfil}: { perfil: Perfil }) {
    const navigate = useNavigate();
    const nome = usuarioLogado().nome;

    return (
        <LayoutPainel perfil={perfil}>
            <h1 className="mb-6 text-2xl font-semibold">{nome ? `Olá, ${nome}!` : "Olá!"}</h1>

            <div className="grid gap-4 md:grid-cols-3">
                {atalhosDoPerfil(perfil).map(({titulo, descricao, rota, icone: Icone}) => (
                    <button
                        key={rota}
                        onClick={() => navigate(rota)}
                        className="rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-indigo-300"
                    >
                        <Icone size={22} className="mb-3 text-indigo-500"/>
                        <p className="font-semibold">{titulo}</p>
                        <p className="mt-1 text-sm text-slate-400">{descricao}</p>
                    </button>
                ))}
            </div>
        </LayoutPainel>
    );
}

export default DashboardPainel;
