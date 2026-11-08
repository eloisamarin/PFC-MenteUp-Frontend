import { useEffect, useState, type ReactNode } from "react";
import { BookOpen, CircleUser, House, Medal, Trophy, Users, Zap } from "lucide-react";

import AppLayout, { type ItemMenu } from "../layout/AppLayout";
import { apiFetch } from "../../services/api";
import { idDoUsuario, obterUsuarioLogado } from "../../services/usuarioLogado";
import type { RankingAluno } from "../../types/aluno";

const MENU: ItemMenu[] = [
    { rotulo: "Jornada", icone: <House size={20} />, para: "/aluno/dashboard" },
    { rotulo: "Atividades", icone: <BookOpen size={20} />, para: "/aluno/atividades" },
    { rotulo: "Desafios", icone: <Zap size={20} />, para: "/aluno/desafios" },
    { rotulo: "Turmas", icone: <Users size={20} />, para: "/aluno/turmas" },
    { rotulo: "Ranking", icone: <Trophy size={20} />, para: "/aluno/ranking" },
    { rotulo: "Conquistas", icone: <Medal size={20} /> },
    { rotulo: "Perfil", icone: <CircleUser size={20} />, para: "/aluno/perfil" },
];

interface AlunoLayoutProps {
    children: ReactNode;
    xp?: number | null;
    sidebarExtra?: ReactNode;
    compacto?: boolean;
}

export default function AlunoLayout({ children, xp, sidebarExtra, compacto }: AlunoLayoutProps) {
    const [xpBuscado, setXpBuscado] = useState<number | null>(null);
    const precisaBuscarXp = xp === undefined;

    useEffect(() => {
        if (!precisaBuscarXp) return;
        const meuId = idDoUsuario(obterUsuarioLogado());
        if (!meuId) return;

        let ativo = true;
        apiFetch("/ranking")
            .then((r) => (r.ok ? r.json() : []))
            .then((lista: RankingAluno[]) => {
                const eu = lista.find((r) => r.usuarioId === meuId);
                if (ativo && eu) setXpBuscado(eu.pontuacaoTotal);
            })
            .catch(() => undefined);

        return () => {
            ativo = false;
        };
    }, [precisaBuscarXp]);

    return (
        <AppLayout
            menu={MENU}
            subtitulo="Jornada do aluno"
            inicio="/aluno/dashboard"
            rotuloMenu="Menu do aluno"
            xp={precisaBuscarXp ? xpBuscado : xp}
            sidebarExtra={sidebarExtra}
            compacto={compacto}
        >
            {children}
        </AppLayout>
    );
}
