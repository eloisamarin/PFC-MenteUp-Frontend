import type { ReactNode } from "react";
import { Activity, BookOpen, CircleUser, LayoutDashboard, TrendingUp, Trophy, Users, UserCog, Zap } from "lucide-react";

import AppLayout, { type ItemMenu } from "../layout/AppLayout";

const MENU: ItemMenu[] = [
    { rotulo: "Dashboard", icone: <LayoutDashboard size={20} />, para: "/administrador/dashboard" },
    { rotulo: "Logs do sistema", icone: <Activity size={20} />, para: "/administrador/logs" },
    { rotulo: "Usuários", icone: <UserCog size={20} />, para: "/administrador/usuarios" },
    { rotulo: "Turmas", icone: <Users size={20} />, para: "/administrador/turmas" },
    { rotulo: "Atividades", icone: <BookOpen size={20} />, para: "/administrador/atividades" },
    { rotulo: "Desafios", icone: <Zap size={20} />, para: "/administrador/desafios" },
    { rotulo: "Desempenho", icone: <TrendingUp size={20} />, para: "/administrador/desempenho" },
    { rotulo: "Ranking", icone: <Trophy size={20} />, para: "/administrador/ranking" },
    { rotulo: "Meu perfil", icone: <CircleUser size={20} />, para: "/administrador/perfil" },
];

interface AdminLayoutProps {
    children: ReactNode;
    compacto?: boolean;
}

export default function AdminLayout({ children, compacto }: AdminLayoutProps) {
    return (
        <AppLayout
            menu={MENU}
            subtitulo="Central administrativa"
            inicio="/administrador/dashboard"
            rotuloMenu="Menu do administrador"
            xp={null}
            compacto={compacto}
        >
            {children}
        </AppLayout>
    );
}
