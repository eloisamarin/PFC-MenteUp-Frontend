import { useEffect, type ReactNode } from "react";
import { BookOpen, CircleUser, House, Medal, Trophy } from "lucide-react";

import AppLayout, { type ItemMenu } from "../layout/AppLayout";
import { IconeDesafio } from "../ComponentesDesafio";
import { useConquistas } from "../../hooks/useConquistas";

const MENU: ItemMenu[] = [
    { rotulo: "Jornada", icone: <House size={20} />, para: "/aluno/dashboard" },
    { rotulo: "Atividades", icone: <BookOpen size={20} />, para: "/aluno/atividades" },
    { rotulo: "Desafios", icone: <IconeDesafio tamanho={20} />, para: "/aluno/desafios" },
    { rotulo: "Ranking", icone: <Trophy size={20} />, para: "/aluno/ranking" },
    { rotulo: "Conquistas", icone: <Medal size={20} />, para: "/aluno/conquistas" },
    { rotulo: "Perfil", icone: <CircleUser size={20} /> },
];

interface AlunoLayoutProps {
    children: ReactNode;
    sidebarExtra?: ReactNode;
    compacto?: boolean;
}

export default function AlunoLayout({ children, sidebarExtra, compacto }: AlunoLayoutProps) {
    const { resumo, carregarResumo, verificarAoEntrar } = useConquistas();

    // O XP do topo vem das conquistas; na primeira tela após o login, confere se há algo para comemorar
    useEffect(() => {
        void carregarResumo();
        verificarAoEntrar();
    }, [carregarResumo, verificarAoEntrar]);

    return (
        <AppLayout
            menu={MENU}
            subtitulo="Jornada do aluno"
            inicio="/aluno/dashboard"
            rotuloMenu="Menu do aluno"
            xp={resumo?.xpTotal ?? null}
            sidebarExtra={sidebarExtra}
            compacto={compacto}
        >
            {children}
        </AppLayout>
    );
}
