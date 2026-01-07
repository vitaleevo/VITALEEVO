import { AlertTriangle, Trash2, X } from "lucide-react";

interface DeleteDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
    isDeleting?: boolean;
}

export default function DeleteDialog({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirmar Exclusão",
    description = "Tem certeza que deseja remover este item? Esta ação não pode ser desfeita e os dados serão perdidos permanentemente.",
    isDeleting = false
}: DeleteDialogProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm transition-all duration-300">
            <div
                className="bg-white dark:bg-[#151e32] w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 dark:border-white/5 overflow-hidden transform transition-all scale-100 animate-in fade-in zoom-in-95 duration-200"
                role="dialog"
                aria-modal="true"
            >
                {/* Header with Icon */}
                <div className="p-6 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-red-50 dark:bg-red-900/10 rounded-full flex items-center justify-center mb-4 group ring-8 ring-red-50/50 dark:ring-red-900/5">
                        <Trash2 className="w-8 h-8 text-red-500 transition-transform group-hover:scale-110 duration-300" />
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {title}
                    </h3>

                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">
                        {description}
                    </p>
                </div>

                {/* Warning Box */}
                <div className="mx-6 px-4 py-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-xl flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                        Atenção: Esta ação é irreversível. Por favor, confirme se realmente deseja prosseguir.
                    </p>
                </div>

                {/* Actions */}
                <div className="p-6 flex items-center gap-3">
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="flex-1 px-4 py-2.5 rounded-xl font-bold text-gray-700 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
                    >
                        Cancelar
                    </button>

                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="flex-1 px-4 py-2.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 transition-all shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isDeleting ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Apagando...
                            </>
                        ) : (
                            <>
                                <Trash2 className="w-4 h-4" />
                                Apagar
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
