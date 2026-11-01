import type {ReactNode} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {
    BookOpen,
    LayoutDashboard,
    ScrollText,
    Trophy,
    UserCog,
    Users,
    Zap,
    type LucideIcon,
} from "lucide-react";
import {ROTA_BASE, usuarioLogado, type Perfil} from "../services/turmaDesafio";

interface ItemMenu {
    rotulo: string;
    rota: string;
    icone: LucideIcon;
}

const ROTULO_PERFIL: Record<Perfil, string> = {
    ALUNO: "Aluno",
    PROFESSOR: "Professor",
    ADMINISTRADOR: "Administrador",
};

function itensDoPerfil(perfil: Perfil): ItemMenu[] {
    const base = ROTA_BASE[perfil];

    const comuns: ItemMenu[] = [
        {rotulo: "Turmas", rota: `${base}/turmas`, icone: Users},
        {rotulo: "Atividades", rota: `${base}/atividades`, icone: BookOpen},
        {rotulo: "Desafios", rota: `${base}/desafios`, icone: Zap},
    ];

    const inicio: ItemMenu = {rotulo: "Dashboard", rota: `${base}/dashboard`, icone: LayoutDashboard};

    if (perfil === "ALUNO") {
        return [inicio, ...comuns, {rotulo: "Ranking", rota: `${base}/ranking`, icone: Trophy}];
    }

    if (perfil === "ADMINISTRADOR") {
        return [
            inicio,
            {rotulo: "Usuários", rota: `${base}/usuarios`, icone: UserCog},
            ...comuns,
            {rotulo: "Logs", rota: `${base}/logs`, icone: ScrollText},
        ];
    }

    return [inicio, ...comuns];
}

interface LayoutPainelProps {
    perfil: Perfil;
    children: ReactNode;
}

function LayoutPainel({perfil, children}: LayoutPainelProps) {
    const navigate = useNavigate();
    const {pathname} = useLocation();

    const itens = itensDoPerfil(perfil);
    const nome = usuarioLogado().nome || ROTULO_PERFIL[perfil];

    function renderizarItem(item: ItemMenu) {
        const ativo = pathname === item.rota || pathname.startsWith(`${item.rota}/`);
        const Icone = item.icone;

        return (
            <button
                key={item.rota}
                type="button"
                onClick={() => navigate(item.rota)}
                aria-current={ativo ? "page" : undefined}
                className={`flex shrink-0 items-center gap-3 rounded-lg px-4 py-3 text-sm md:w-full ${
                    ativo
                        ? "bg-white/10 font-medium text-white"
                        : "text-slate-300 hover:bg-white/10"
                }`}
            >
                <Icone size={17}/>
                {item.rotulo}
            </button>
        );
    }

    return (
        <div className="min-h-screen bg-[#f5f6fc] text-slate-800">

            <aside className="fixed left-0 top-0 hidden h-screen w-56 bg-[#121329] text-white md:block">
                <div className="flex items-center gap-3 px-6 py-6">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 font-bold">
                        M
                    </div>
                    <span className="text-lg font-bold">
                        Mente<span className="text-purple-400">Up</span>
                    </span>
                </div>

                <nav className="mt-6 space-y-2 px-3">
                    {itens.map(renderizarItem)}
                </nav>
            </aside>

            {/* No celular o menu lateral vira uma faixa rolável */}
            <nav className="flex gap-1 overflow-x-auto bg-[#121329] p-2 text-white md:hidden">
                {itens.map(renderizarItem)}
            </nav>

            <main className="min-h-screen min-w-0 md:ml-56">
                <header className="flex h-16 items-center justify-end gap-3 border-b bg-white px-4 md:h-20 md:px-8">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white">
                        {nome.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-semibold text-slate-700">{nome}</p>
                        <p className="text-xs text-slate-400">{ROTULO_PERFIL[perfil]}</p>
                    </div>
                </header>

                <section className="p-4 md:p-8">
                    {children}
                </section>
            </main>

        </div>
    );
}

export default LayoutPainel;
