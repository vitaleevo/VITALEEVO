import FeatureLayout from '@/shared/components/FeatureLayout';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Política de Privacidade',
    description: 'Conheça como a VitalEvo trata seus dados pessoais com transparência e segurança.',
};

export default function PrivacyPage() {
    return (
        <FeatureLayout>
            <div className="pt-32 pb-24 bg-white dark:bg-[#0b1120] min-h-screen">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="font-display font-black text-4xl text-gray-900 dark:text-white mb-8">Política de Privacidade</h1>
                    <div className="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-400">
                        <p>Última atualização: 25 de Outubro de 2023</p>

                        <p>A sua privacidade é importante para nós. É política da VitalEvo respeitar a sua privacidade em relação a qualquer informação que possamos coletar no site VitalEvo, e outros sites que possuímos e operamos.</p>

                        <h3>1. Informações que coletamos</h3>
                        <p>Solicitamos informações pessoais apenas quando realmente precisamos delas para lhe fornecer um serviço. Fazemo-lo por meios justos e legais, com o seu conhecimento e consentimento. Também informamos por que estamos coletando e como será usado.</p>

                        <h3>2. Retenção de dados</h3>
                        <p>Apenas retemos as informações coletadas pelo tempo necessário para fornecer o serviço solicitado. Quando armazenamos dados, protegemos dentro de meios comercialmente aceitáveis ​​para evitar perdas e roubos, bem como acesso, divulgação, cópia, uso ou modificação não autorizados.</p>

                        <h3>3. Compartilhamento de dados</h3>
                        <p>Não compartilhamos informações de identificação pessoal publicamente ou com terceiros, exceto quando exigido por lei.</p>

                        <h3>4. Cookies</h3>
                        <p>O nosso site usa cookies para melhorar a experiência do usuário. Você é livre para recusar a nossa solicitação de informações pessoais, entendendo que talvez não possamos fornecer alguns dos serviços desejados.</p>

                        <h3>5. Compromisso do Usuário</h3>
                        <p>O usuário se compromete a fazer uso adequado dos conteúdos e da informação que a VitalEvo oferece no site e com caráter enunciativo, mas não limitativo:</p>
                        <ul>
                            <li>A) Não se envolver em atividades que sejam ilegais ou contrárias à boa fé a à ordem pública;</li>
                            <li>B) Não difundir propaganda ou conteúdo de natureza racista, xenofóbica, ou azar, qualquer tipo de pornografia ilegal, de apologia ao terrorismo ou contra os direitos humanos.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </FeatureLayout>
    );
}
