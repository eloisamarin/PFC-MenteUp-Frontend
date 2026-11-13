/*
 * Foto de perfil: um dos 10 animais. O back-end guarda só o código (ex.: "PANDA");
 * o desenho (emoji) e a cor de fundo ficam aqui.
 */
const AVATARES = [
    {codigo: "CACHORRO", emoji: "🐶", nome: "Cachorro", fundo: "bg-amber-100", cor: "#fef3c7"},
    {codigo: "GATO", emoji: "🐱", nome: "Gato", fundo: "bg-orange-100", cor: "#ffedd5"},
    {codigo: "RAPOSA", emoji: "🦊", nome: "Raposa", fundo: "bg-red-100", cor: "#fee2e2"},
    {codigo: "PANDA", emoji: "🐼", nome: "Panda", fundo: "bg-slate-200", cor: "#e2e8f0"},
    {codigo: "COALA", emoji: "🐨", nome: "Coala", fundo: "bg-sky-100", cor: "#e0f2fe"},
    {codigo: "TIGRE", emoji: "🐯", nome: "Tigre", fundo: "bg-yellow-100", cor: "#fef9c3"},
    {codigo: "LEAO", emoji: "🦁", nome: "Leão", fundo: "bg-amber-200", cor: "#fde68a"},
    {codigo: "SAPO", emoji: "🐸", nome: "Sapo", fundo: "bg-green-100", cor: "#dcfce7"},
    {codigo: "MACACO", emoji: "🐵", nome: "Macaco", fundo: "bg-stone-200", cor: "#e7e5e4"},
    {codigo: "COELHO", emoji: "🐰", nome: "Coelho", fundo: "bg-pink-100", cor: "#fce7f3"},
];

// Animal de um código salvo no back-end (ex.: "PANDA"); undefined se a pessoa não escolheu
function animalDoAvatar(avatar?: string | null) {
    return AVATARES.find((opcao) => opcao.codigo === avatar);
}

function iniciaisDoNome(nome?: string) {
    const partes = (nome ?? "").trim().split(/\s+/).filter(Boolean);
    const primeira = partes[0]?.[0] ?? "?";
    const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
    return (primeira + ultima).toUpperCase();
}

interface RostoUsuarioProps {
    avatar?: string | null;
    nome?: string;
    /** Classe da tela: define tamanho, formato e o fundo das iniciais */
    className?: string;
}

/*
 * Rosto da pessoa em listas, ranking e topo: o animal escolhido no perfil
 * ou, se ainda não escolheu, as iniciais do nome. O nome já aparece ao lado,
 * por isso o desenho fica escondido do leitor de tela.
 */
export function RostoUsuario({avatar, nome, className = ""}: RostoUsuarioProps) {
    const animal = animalDoAvatar(avatar);

    if (!animal) {
        return <span className={className} title={nome}>{iniciaisDoNome(nome)}</span>;
    }

    return (
        <span className={className} title={nome} style={{background: animal.cor}} aria-hidden="true">
            <span style={{fontSize: "1.5em", lineHeight: 1}}>{animal.emoji}</span>
        </span>
    );
}

const TAMANHOS = {
    pequeno: "h-9 w-9 text-xl",
    grande: "h-16 w-16 text-4xl",
};

interface AvatarProps {
    avatar?: string | null;
    nome: string;
    tamanho?: keyof typeof TAMANHOS;
}

// Mostra o animal escolhido; sem escolha, mostra a inicial do nome (como antes)
function Avatar({avatar, nome, tamanho = "pequeno"}: AvatarProps) {
    const animal = AVATARES.find((opcao) => opcao.codigo === avatar);
    const medida = TAMANHOS[tamanho];

    if (!animal) {
        return (
            <span className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 font-bold text-white ${medida}`}>
                <span className={tamanho === "grande" ? "text-2xl" : "text-sm"}>
                    {nome.charAt(0).toUpperCase()}
                </span>
            </span>
        );
    }

    return (
        <span
            role="img"
            aria-label={`Avatar: ${animal.nome}`}
            className={`flex shrink-0 items-center justify-center rounded-full ${animal.fundo} ${medida}`}
        >
            {animal.emoji}
        </span>
    );
}

interface EscolherAvatarProps {
    atual?: string | null;
    salvando: boolean;
    onEscolher: (codigo: string) => void;
    // Para fundos escuros (telas do aluno)
    escuro?: boolean;
}

// Grade com as 10 opções; a escolhida fica com contorno roxo
export function EscolherAvatar({atual, salvando, onEscolher, escuro = false}: EscolherAvatarProps) {
    const corOpcao = escuro ? "text-[#c3d4e0] hover:bg-white/10" : "text-slate-600 hover:bg-slate-50";

    return (
        <div className="grid grid-cols-5 gap-3">
            {AVATARES.map((opcao) => {
                const selecionado = opcao.codigo === atual;

                return (
                    <button
                        key={opcao.codigo}
                        type="button"
                        onClick={() => onEscolher(opcao.codigo)}
                        disabled={salvando}
                        aria-pressed={selecionado}
                        title={opcao.nome}
                        className={`flex flex-col items-center gap-1 rounded-xl p-2 text-xs ${corOpcao} transition disabled:opacity-50 ${
                            selecionado ? "ring-2 ring-purple-500" : ""
                        }`}
                    >
                        <span className={`flex h-12 w-12 items-center justify-center rounded-full text-3xl ${opcao.fundo}`}>
                            {opcao.emoji}
                        </span>
                        {opcao.nome}
                    </button>
                );
            })}
        </div>
    );
}

export default Avatar;