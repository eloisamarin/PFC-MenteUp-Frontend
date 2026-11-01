import type { ReactNode } from "react";
import { BookOpen, LayoutGrid, Plus, Users } from "lucide-react";

import AppLayout, { type ItemMenu } from "../layout/AppLayout";
import EngajamentoCard from "./EngajamentoCard";
import type { RankingAluno } from "../../types/aluno";

const MENU: ItemMenu[] = [
    { rotulo: "Visão geral", icone: <LayoutGrid size={20} />, para: "/professor/dashboard" },
    { rotulo: "Criar atividade", icone: <Plus size={20} />, para: "/professor/atividades/criar" },
    // "exato" evita que Atividades fique ativo junto com "Criar atividade"
    { rotulo: "Atividades", icone: <BookOpen size={20} />, para: "/professor/atividades", exato: true },
    { rotulo: "Turmas", icone: <Users size={20} />, para: "/professor/turmas" },
];

interface ProfessorLayoutProps {
    children: ReactNode;
    /** Alunos já carregados pela página (repassados ao card "Alunos engajados") */
    alunos?: RankingAluno[] | null;
    /** Substitui o card lateral padrão */
    sidebarExtra?: ReactNode;
    compacto?: boolean;
}

/** Layout da área do professor (usa o AppLayout compartilhado) */
export default function ProfessorLayout({ children, alunos, sidebarExtra, compacto }: ProfessorLayoutProps) {
    return (
        <AppLayout
            menu={MENU}
            subtitulo="Espaço do professor"
            inicio="/professor/dashboard"
            rotuloMenu="Menu do professor"
            xp={null}
            sidebarExtra={sidebarExtra ?? <EngajamentoCard alunos={alunos} />}
            compacto={compacto}
        >
            {children}
        </AppLayout>
    );
}
