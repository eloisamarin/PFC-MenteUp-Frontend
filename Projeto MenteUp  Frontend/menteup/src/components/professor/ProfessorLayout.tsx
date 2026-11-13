import type { ReactNode } from "react";
import {BookOpen, CircleUser, LayoutGrid, Plus, TrendingUp, Users, Zap} from "lucide-react";

import AppLayout, { type ItemMenu } from "../layout/AppLayout";
import EngajamentoCard from "./EngajamentoCard";
import type { RankingAluno } from "../../types/aluno";



const MENU: ItemMenu[] = [
    { rotulo: "Visão geral", icone: <LayoutGrid size={20} />, para: "/professor/dashboard" },
    { rotulo: "Criar atividade", icone: <Plus size={20} />, para: "/professor/atividades/criar" },
    { rotulo: "Atividades", icone: <BookOpen size={20} />, para: "/professor/atividades", exato: true },
    { rotulo: "Desafios", icone: <Zap size={20} />, para: "/professor/desafios" },
    { rotulo: "Turmas", icone: <Users size={20} />, para: "/professor/turmas" },
    { rotulo: "Desempenho", icone: <TrendingUp size={20} />, para: "/professor/desempenho" },
    { rotulo: "Meu perfil", icone: <CircleUser size={20} />, para: "/professor/perfil" },
];

interface ProfessorLayoutProps {
    children: ReactNode;
    alunos?: RankingAluno[] | null;
    sidebarExtra?: ReactNode;
    compacto?: boolean;
}

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
