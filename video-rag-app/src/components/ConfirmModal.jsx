import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirm Action",
    message = "Are you sure you want to proceed?",
    confirmText = "Delete",
    cancelText = "Cancel",
    isDanger = true,
    isLoading = false
}) {
    if (!isOpen) return null

    return createPortal(
        <AnimatePresence>
            <div
                className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={isLoading ? undefined : onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Modal Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden"
                >
                    <div className="p-6 text-center">
                        <div className={`mx-auto mb-4 flex size-12 items-center justify-center rounded-full ${isDanger ? 'bg-red-100 dark:bg-red-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                            <span className={`material-symbols-outlined text-2xl ${isDanger ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>
                                {isDanger ? 'delete' : 'info'}
                            </span>
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                            {title}
                        </h3>

                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                            {message}
                        </p>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={onClose}
                                disabled={isLoading}
                                className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={onConfirm}
                                disabled={isLoading}
                                className={`px-4 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg shadow-red-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 ${isDanger
                                    ? 'bg-red-500 hover:bg-red-600'
                                    : 'bg-primary hover:bg-primary/90'
                                    }`}
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Processing...</span>
                                    </div>
                                ) : (
                                    confirmText
                                )}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>,
        document.body
    )
}
