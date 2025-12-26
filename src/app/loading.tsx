export default function Loading() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0b1120] flex items-center justify-center">
            <div className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-6">
                    <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin"></div>
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">Carregando...</p>
            </div>
        </div>
    );
}
