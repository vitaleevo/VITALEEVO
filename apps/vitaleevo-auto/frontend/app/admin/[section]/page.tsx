import {AdminSections} from "../../../components/AdminSections";
const allowed=new Set(["produtos","marcas","agendamentos","clientes","fornecedores","pedidos","utilizadores","definicoes"]);
export function generateStaticParams(){return [...allowed].map(section=>({section}));}
export default async function AdminSection({params}:{params:Promise<{section:string}>}){const {section}=await params;return <AdminSections section={allowed.has(section)?section:"unknown"}/>;}
