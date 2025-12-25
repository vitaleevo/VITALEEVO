import FeatureLayout from '@/shared/components/FeatureLayout';

export default function TermsPage() {
    return (
        <FeatureLayout>
            <div className="pt-32 pb-24 bg-white dark:bg-[#0b1120] min-h-screen">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="font-display font-black text-4xl text-gray-900 dark:text-white mb-8">Termos de Uso</h1>
                    <div className="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-400">
                        <p>Última atualização: 25 de Outubro de 2023</p>

                        <h3>1. Aceitação dos Termos</h3>
                        <p>Ao acessar e usar o site da VitalEvo, você aceita e concorda em estar vinculado aos termos e disposições deste acordo.</p>

                        <h3>2. Uso de Licença</h3>
                        <p>É concedida permissão para baixar temporariamente uma cópia dos materiais (informações ou software) no site da VitalEvo, apenas para visualização transitória pessoal e não comercial.</p>

                        <h3>3. Isenção de Responsabilidade</h3>
                        <p>Os materiais no site da VitalEvo são fornecidos "como estão". A VitalEvo não oferece garantias, expressas ou implícitas, e, por este meio, isenta e nega todas as outras garantias, incluindo, sem limitação, garantias implícitas ou condições de comercialização.</p>

                        <h3>4. Limitações</h3>
                        <p>Em nenhum caso a VitalEvo ou seus fornecedores serão responsáveis por quaisquer danos (incluindo, sem limitação, danos por perda de dados ou lucro ou devido a interrupção dos negócios) decorrentes do uso ou da incapacidade de usar os materiais da VitalEvo.</p>

                        <h3>5. Modificações</h3>
                        <p>A VitalEvo pode revisar estes termos de serviço do site a qualquer momento, sem aviso prévio. Ao usar este site, você concorda em ficar vinculado à versão atual desses termos de serviço.</p>
                    </div>
                </div>
            </div>
        </FeatureLayout>
    );
}
