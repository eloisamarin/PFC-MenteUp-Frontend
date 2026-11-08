import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";

import AdminLayout from "../administrador/AdminLayout";
import ProfessorLayout from "../professor/ProfessorLayout";
import type { RankingAluno } from "../../types/aluno";

interface AreaLayoutProps {
    children: ReactNode;
    alunos?: RankingAluno[] | null;
    sidebarExtra?: ReactNode;
    compacto?: boolean;
}

export function useAreaBase() {
    const { pathname } = useLocation();
    return pathname.startsWith("/administrador") ? "/administrador" : "/professor";
}

export default function AreaLayout({ children, ...props }: AreaLayoutProps) {
    const area = useAreaBase();
    if (area === "/administrador") return <AdminLayout compacto={props.compacto}>{children}</AdminLayout>;
    return <ProfessorLayout {...props}>{children}</ProfessorLayout>;
}
