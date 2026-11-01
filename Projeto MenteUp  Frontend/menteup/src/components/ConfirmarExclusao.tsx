interface ConfirmarExclusaoProps {
    titulo: string;
    mensagem: string;
    processando: boolean;
    rotuloConfirmar?: string;
    rotuloProcessando?: string;
    onConfirmar: () => void;
    onCancelar: () => void;
}

function ConfirmarExclusao({
    titulo,
    mensagem,
    processando,
    rotuloConfirmar = "Excluir",
    rotuloProcessando = "Excluindo...",
    onConfirmar,
    onCancelar,
}: ConfirmarExclusaoProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                <h2 className="text-lg font-semibold text-slate-800">{titulo}</h2>
                <p className="mt-2 text-sm text-slate-500">{mensagem}</p>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onCancelar}
                        disabled={processando}
                        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={onConfirmar}
                        disabled={processando}
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                    >
                        {processando ? rotuloProcessando : rotuloConfirmar}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmarExclusao;
