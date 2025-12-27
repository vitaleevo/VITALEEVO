"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useAuth } from "@/shared/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import FeatureLayout from "@/shared/components/FeatureLayout";
import Link from "next/link";
import {
    User,
    Package,
    Settings,
    LogOut,
    Edit,
    Save,
    X,
    ShoppingBag,
    Calendar,
    MapPin,
    Phone,
    Mail,
    Lock,
    Eye,
    EyeOff,
    Loader2,
    Check,
    ChevronRight,
    Plus,
    Trash2,
    Home,
    Briefcase,
    MoreVertical,
    Star,
    Heart,
    Bell,
    BellIcon,
} from "lucide-react";
import { formatDate, formatCurrency } from "@/shared/utils/format";

export default function ContaPage() {
    const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
    const router = useRouter();

    // Mutations & Queries
    const updateProfile = useMutation(api.auth.updateProfile);
    const changePassword = useMutation(api.auth.changePassword);
    const createAddress = useMutation(api.addresses.create);
    const removeAddress = useMutation(api.addresses.remove);
    const setDefaultAddress = useMutation(api.addresses.setDefault);
    const toggleWishlist = useMutation(api.wishlist.toggle);

    const orders = useQuery(api.orders.getByUser, user ? { userId: user._id } : "skip");
    const addresses = useQuery(api.addresses.getByUser, user ? { userId: user._id } : "skip");
    const wishlistItems = useQuery(api.wishlist.getByUser, user ? { userId: user._id } : "skip");
    const notifications = useQuery(api.notifications.getByUser, user ? { userId: user._id } : "skip");
    const unreadCount = useQuery(api.notifications.getUnreadCount, user ? { userId: user._id } : "skip");

    const [activeTab, setActiveTab] = useState<"profile" | "orders" | "addresses" | "wishlist" | "notifications" | "security">("profile");
    const [isEditing, setIsEditing] = useState(false);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [showPasswords, setShowPasswords] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const markAsRead = useMutation(api.notifications.markAsRead);
    const markAllAsRead = useMutation(api.notifications.markAllAsRead);
    const removeNotification = useMutation(api.notifications.remove);

    const [editForm, setEditForm] = useState({ name: "", phone: "" });
    const [passwordForm, setPasswordForm] = useState({ current: "", new: "", confirm: "" });
    const [addressForm, setAddressForm] = useState({
        label: "Casa",
        name: user?.name || "",
        phone: "",
        city: "Luanda",
        address: "",
        reference: "",
        isDefault: false
    });

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [authLoading, isAuthenticated, router]);

    // Set edit form when user loads
    useEffect(() => {
        if (user) {
            setEditForm({ name: user.name, phone: "" });
        }
    }, [user]);

    if (authLoading || !isAuthenticated) {
        return (
            <FeatureLayout>
                <div className="min-h-screen pt-32 pb-24 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            </FeatureLayout>
        );
    }

    const handleSaveProfile = async () => {
        if (!user) return;
        setSaving(true);
        setMessage(null);
        try {
            await updateProfile({
                userId: user._id,
                name: editForm.name || undefined,
                phone: editForm.phone || undefined,
            });
            setMessage({ type: "success", text: "Perfil atualizado com sucesso!" });
            setIsEditing(false);
        } catch (err: any) {
            setMessage({ type: "error", text: err.message || "Erro ao atualizar perfil" });
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (!user) return;

        if (passwordForm.new !== passwordForm.confirm) {
            setMessage({ type: "error", text: "As senhas não coincidem" });
            return;
        }

        if (passwordForm.new.length < 6) {
            setMessage({ type: "error", text: "A nova senha deve ter pelo menos 6 caracteres" });
            return;
        }

        setSaving(true);
        setMessage(null);
        try {
            await changePassword({
                userId: user._id,
                currentPassword: passwordForm.current,
                newPassword: passwordForm.new,
            });
            setMessage({ type: "success", text: "Senha alterada com sucesso!" });
            setPasswordForm({ current: "", new: "", confirm: "" });
        } catch (err: any) {
            setMessage({ type: "error", text: err.message || "Erro ao alterar senha" });
        } finally {
            setSaving(false);
        }
    };

    const tabs = [
        { id: "profile", label: "Meu Perfil", icon: User },
        { id: "orders", label: "Meus Pedidos", icon: Package },
        { id: "notifications", label: "Notificações", icon: Bell },
        { id: "wishlist", label: "Desejos", icon: Heart },
        { id: "addresses", label: "Endereços", icon: MapPin },
        { id: "security", label: "Segurança", icon: Lock },
    ];

    const handleAddAddress = async () => {
        if (!user) return;
        if (!addressForm.address || !addressForm.phone || !addressForm.name) {
            setMessage({ type: "error", text: "Preencha os campos obrigatórios" });
            return;
        }

        setSaving(true);
        try {
            await createAddress({
                userId: user._id,
                ...addressForm
            });
            setMessage({ type: "success", text: "Endereço adicionado!" });
            setShowAddressModal(false);
            setAddressForm({
                label: "Casa",
                name: user.name,
                phone: "",
                city: "Luanda",
                address: "",
                reference: "",
                isDefault: false
            });
        } catch (err: any) {
            setMessage({ type: "error", text: "Erro ao adicionar endereço" });
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAddress = async (id: any) => {
        if (!confirm("Tem certeza que deseja excluir este endereço?")) return;
        try {
            await removeAddress({ addressId: id });
            setMessage({ type: "success", text: "Endereço removido" });
        } catch (err) {
            setMessage({ type: "error", text: "Erro ao remover endereço" });
        }
    };

    const handleSetDefault = async (id: any) => {
        try {
            await setDefaultAddress({ addressId: id });
            setMessage({ type: "success", text: "Endereço padrão atualizado" });
        } catch (err) {
            setMessage({ type: "error", text: "Erro ao atualizar padrão" });
        }
    };

    return (
        <FeatureLayout>
            <div className="min-h-screen pt-32 pb-24 bg-gray-50 dark:bg-[#0b1120]">
                <div className="max-w-5xl mx-auto px-4 sm:px-6">

                    {/* Header */}
                    <div className="mb-10">
                        <h1 className="font-display font-black text-3xl md:text-4xl text-gray-900 dark:text-white mb-2">
                            Minha Conta
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            Gerencie suas informações e acompanhe seus pedidos
                        </p>
                    </div>

                    {/* Message */}
                    {message && (
                        <div className={`mb-6 p-4 rounded-xl text-sm font-medium flex items-center gap-2 ${message.type === "success"
                            ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-900/30"
                            : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30"
                            }`}>
                            {message.type === "success" ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                            {message.text}
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="bg-white dark:bg-[#151e32] rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-xl">
                                {/* User Info */}
                                <div className="text-center mb-6 pb-6 border-b border-gray-100 dark:border-white/5">
                                    <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold mx-auto mb-4">
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">{user?.name}</h3>
                                    <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                                </div>

                                {/* Tabs */}
                                <nav className="space-y-2">
                                    {tabs.map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => {
                                                setActiveTab(tab.id as any);
                                                setMessage(null);
                                            }}
                                            className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === tab.id
                                                ? "bg-primary/10 text-primary"
                                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <tab.icon className="w-5 h-5" />
                                                {tab.label}
                                            </div>
                                            {tab.id === "notifications" && unreadCount && unreadCount > 0 ? (
                                                <span className="bg-primary text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                                    {unreadCount}
                                                </span>
                                            ) : null}
                                        </button>
                                    ))}
                                </nav>

                                {/* Logout */}
                                <button
                                    onClick={logout}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all mt-4"
                                >
                                    <LogOut className="w-5 h-5" />
                                    Sair da Conta
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="lg:col-span-3">
                            {/* Profile Tab */}
                            {activeTab === "profile" && (
                                <div className="bg-white dark:bg-[#151e32] rounded-3xl p-8 border border-gray-100 dark:border-white/5 shadow-xl">
                                    <div className="flex items-center justify-between mb-8">
                                        <h2 className="font-bold text-xl text-gray-900 dark:text-white flex items-center gap-2">
                                            <User className="w-5 h-5 text-primary" />
                                            Informações Pessoais
                                        </h2>
                                        {!isEditing ? (
                                            <button
                                                onClick={() => setIsEditing(true)}
                                                className="flex items-center gap-2 text-primary font-bold hover:underline"
                                            >
                                                <Edit className="w-4 h-4" />
                                                Editar
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => setIsEditing(false)}
                                                className="flex items-center gap-2 text-gray-500 font-bold hover:underline"
                                            >
                                                <X className="w-4 h-4" />
                                                Cancelar
                                            </button>
                                        )}
                                    </div>

                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                                    Nome Completo
                                                </label>
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        value={editForm.name}
                                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                        className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:border-primary outline-none"
                                                    />
                                                ) : (
                                                    <p className="text-gray-900 dark:text-white font-medium">{user?.name}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                                    E-mail
                                                </label>
                                                <p className="text-gray-900 dark:text-white font-medium flex items-center gap-2">
                                                    <Mail className="w-4 h-4 text-gray-400" />
                                                    {user?.email}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                                    Telefone
                                                </label>
                                                {isEditing ? (
                                                    <input
                                                        type="tel"
                                                        value={editForm.phone}
                                                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                                        placeholder="+244 9XX XXX XXX"
                                                        className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:border-primary outline-none"
                                                    />
                                                ) : (
                                                    <p className="text-gray-500">Não informado</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                                    Membro desde
                                                </label>
                                                <p className="text-gray-900 dark:text-white font-medium flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    {formatDate(Date.now())}
                                                </p>
                                            </div>
                                        </div>

                                        {isEditing && (
                                            <button
                                                onClick={handleSaveProfile}
                                                disabled={saving}
                                                className="bg-primary hover:bg-primary-dark disabled:bg-primary/50 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2"
                                            >
                                                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                                Salvar Alterações
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Orders Tab */}
                            {activeTab === "orders" && (
                                <div className="bg-white dark:bg-[#151e32] rounded-3xl p-8 border border-gray-100 dark:border-white/5 shadow-xl">
                                    <h2 className="font-bold text-xl text-gray-900 dark:text-white flex items-center gap-2 mb-8">
                                        <Package className="w-5 h-5 text-primary" />
                                        Meus Pedidos
                                    </h2>

                                    {!orders || orders.length === 0 ? (
                                        <div className="text-center py-12">
                                            <ShoppingBag className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Nenhum pedido ainda</h3>
                                            <p className="text-gray-500 mb-6">Você ainda não fez nenhuma compra.</p>
                                            <Link
                                                href="/store"
                                                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-bold"
                                            >
                                                Ir para a Loja
                                                <ChevronRight className="w-5 h-5" />
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {orders.map((order: any) => (
                                                <Link
                                                    key={order._id}
                                                    href={`/conta/pedidos/${order._id}`}
                                                    className="block border border-gray-100 dark:border-white/5 rounded-2xl p-6 hover:border-primary/30 hover:bg-gray-50 dark:hover:bg-white/5 transition-all group"
                                                >
                                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <p className="font-bold text-gray-900 dark:text-white">
                                                                    Pedido #{order.orderNumber}
                                                                </p>
                                                                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
                                                            </div>
                                                            <p className="text-sm text-gray-500">
                                                                {formatDate(order.createdAt)} • {order.items?.length || 0} itens
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === "completed" || order.status === "delivered" ? "bg-green-100 text-green-600" :
                                                                order.status === "pending" ? "bg-yellow-100 text-yellow-600" :
                                                                    order.status === "cancelled" ? "bg-red-100 text-red-600" :
                                                                        "bg-blue-100 text-blue-600"
                                                                }`}>
                                                                {order.status === "completed" || order.status === "delivered" ? "Concluído" :
                                                                    order.status === "pending" ? "Pendente" :
                                                                        order.status === "cancelled" ? "Cancelado" :
                                                                            order.status === "processing" ? "Em processamento" : order.status}
                                                            </span>
                                                            <span className="font-bold text-primary">
                                                                {formatCurrency(order.total)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Addresses Tab */}
                            {activeTab === "addresses" && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h2 className="font-bold text-xl text-gray-900 dark:text-white flex items-center gap-2">
                                            <MapPin className="w-5 h-5 text-primary" />
                                            Meus Endereços
                                        </h2>
                                        <button
                                            onClick={() => setShowAddressModal(true)}
                                            className="bg-primary text-white p-2 md:px-4 md:py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
                                        >
                                            <Plus className="w-5 h-5" />
                                            <span className="hidden md:block">Adicionar</span>
                                        </button>
                                    </div>

                                    {!addresses || addresses.length === 0 ? (
                                        <div className="bg-white dark:bg-[#151e32] rounded-3xl p-12 text-center border border-gray-100 dark:border-white/5">
                                            <MapPin className="w-16 h-16 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
                                            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Nenhum endereço salvo</h3>
                                            <p className="text-gray-500 max-w-xs mx-auto mb-6">Cadastre seus endereços de entrega para facilitar suas próximas compras.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {addresses.map((addr: any) => (
                                                <div
                                                    key={addr._id}
                                                    className={`bg-white dark:bg-[#151e32] rounded-3xl p-6 border transition-all relative group ${addr.isDefault ? "border-primary shadow-lg ring-1 ring-primary/10" : "border-gray-100 dark:border-white/5"
                                                        }`}
                                                >
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`p-2 rounded-lg ${addr.isDefault ? "bg-primary/10 text-primary" : "bg-gray-50 dark:bg-white/5 text-gray-400"}`}>
                                                                {addr.label === "Casa" ? <Home className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
                                                            </div>
                                                            <span className="font-bold text-gray-900 dark:text-white">{addr.label}</span>
                                                            {addr.isDefault && (
                                                                <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-full font-black uppercase">Padrão</span>
                                                            )}
                                                        </div>
                                                        <div className="flex gap-2">
                                                            {!addr.isDefault && (
                                                                <button
                                                                    onClick={() => handleSetDefault(addr._id)}
                                                                    className="p-2 text-gray-400 hover:text-primary transition-colors"
                                                                    title="Definir como padrão"
                                                                >
                                                                    <Star className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleDeleteAddress(addr._id)}
                                                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1 text-sm">
                                                        <p className="font-bold text-gray-900 dark:text-white">{addr.name}</p>
                                                        <p className="text-gray-500">{addr.phone}</p>
                                                        <p className="text-gray-500 mt-2">{addr.address}</p>
                                                        <p className="text-gray-400 text-xs">{addr.city}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Modal Mockup - Quick implementation inline for speed, normally a separate component */}
                                    {showAddressModal && (
                                        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                                            <div className="bg-white dark:bg-[#151e32] w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                                                <div className="flex justify-between items-center mb-6">
                                                    <h3 className="font-bold text-xl text-gray-900 dark:text-white">Novo Endereço</h3>
                                                    <button onClick={() => setShowAddressModal(false)} className="text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 p-2 rounded-xl">
                                                        <X className="w-6 h-6" />
                                                    </button>
                                                </div>
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Etiqueta</label>
                                                        <div className="flex gap-2 mt-1">
                                                            {["Casa", "Trabalho", "Outro"].map(l => (
                                                                <button
                                                                    key={l}
                                                                    onClick={() => setAddressForm({ ...addressForm, label: l })}
                                                                    className={`flex-1 py-2 rounded-xl border text-sm font-bold transition-all ${addressForm.label === l ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" : "border-gray-100 dark:border-white/5 text-gray-500"
                                                                        }`}
                                                                >
                                                                    {l}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <input
                                                        placeholder="Nome do Recebedor"
                                                        value={addressForm.name}
                                                        onChange={e => setAddressForm({ ...addressForm, name: e.target.value })}
                                                        className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5 text-gray-900 dark:text-white outline-none focus:border-primary"
                                                    />
                                                    <input
                                                        placeholder="Telefone"
                                                        value={addressForm.phone}
                                                        onChange={e => setAddressForm({ ...addressForm, phone: e.target.value })}
                                                        className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5 text-gray-900 dark:text-white outline-none focus:border-primary"
                                                    />
                                                    <select
                                                        value={addressForm.city}
                                                        onChange={e => setAddressForm({ ...addressForm, city: e.target.value })}
                                                        className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5 text-gray-900 dark:text-white outline-none focus:border-primary"
                                                    >
                                                        <option value="Luanda">Luanda</option>
                                                        <option value="Benguela">Benguela</option>
                                                        <option value="Huambo">Huambo</option>
                                                        <option value="Cabinda">Cabinda</option>
                                                        <option value="Lubango">Lubango</option>
                                                    </select>
                                                    <textarea
                                                        placeholder="Endereço Completo (Rua, Bairro, Nº)"
                                                        value={addressForm.address}
                                                        onChange={e => setAddressForm({ ...addressForm, address: e.target.value })}
                                                        className="w-full h-24 p-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5 text-gray-900 dark:text-white outline-none focus:border-primary resize-none"
                                                    />
                                                    <label className="flex items-center gap-3 cursor-pointer p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${addressForm.isDefault ? "bg-primary border-primary text-white" : "border-gray-300 dark:border-white/10"}`}>
                                                            {addressForm.isDefault && <Check className="w-3 h-3" />}
                                                        </div>
                                                        <input
                                                            type="checkbox"
                                                            className="hidden"
                                                            checked={addressForm.isDefault}
                                                            onChange={e => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                                                        />
                                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Definir como endereço padrão</span>
                                                    </label>
                                                    <button
                                                        onClick={handleAddAddress}
                                                        disabled={saving}
                                                        className="w-full bg-primary hover:bg-primary-dark text-white py-4 rounded-2xl font-bold transition-all shadow-xl shadow-primary/30 flex items-center justify-center gap-2"
                                                    >
                                                        {saving && <Loader2 className="w-5 h-5 animate-spin" />}
                                                        Salvar Endereço
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Security Tab */}
                            {activeTab === "security" && (
                                <div className="bg-white dark:bg-[#151e32] rounded-3xl p-8 border border-gray-100 dark:border-white/5 shadow-xl">
                                    <h2 className="font-bold text-xl text-gray-900 dark:text-white flex items-center gap-2 mb-8">
                                        <Lock className="w-5 h-5 text-primary" />
                                        Alterar Senha
                                    </h2>

                                    <div className="max-w-md space-y-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                                Senha Atual
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showPasswords ? "text" : "password"}
                                                    value={passwordForm.current}
                                                    onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                                                    className="w-full h-12 px-4 pr-12 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:border-primary outline-none"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPasswords(!showPasswords)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                                                >
                                                    {showPasswords ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                                Nova Senha
                                            </label>
                                            <input
                                                type={showPasswords ? "text" : "password"}
                                                value={passwordForm.new}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                                                placeholder="Mínimo 6 caracteres"
                                                className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:border-primary outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                                Confirmar Nova Senha
                                            </label>
                                            <input
                                                type={showPasswords ? "text" : "password"}
                                                value={passwordForm.confirm}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                                                className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:border-primary outline-none"
                                            />
                                        </div>
                                        <button
                                            onClick={handleChangePassword}
                                            disabled={saving || !passwordForm.current || !passwordForm.new}
                                            className="bg-primary hover:bg-primary-dark disabled:bg-primary/50 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2"
                                        >
                                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
                                            Alterar Senha
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Wishlist Tab */}
                            {activeTab === "wishlist" && (
                                <div className="space-y-6">
                                    <h2 className="font-bold text-xl text-gray-900 dark:text-white flex items-center gap-2 mb-8">
                                        <Heart className="w-5 h-5 text-primary" />
                                        Lista de Desejos
                                    </h2>

                                    {!wishlistItems || wishlistItems.length === 0 ? (
                                        <div className="bg-white dark:bg-[#151e32] rounded-3xl p-12 text-center border border-gray-100 dark:border-white/5">
                                            <Heart className="w-16 h-16 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
                                            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Sua lista está vazia</h3>
                                            <p className="text-gray-500 max-w-xs mx-auto mb-8">Role nossa loja e salve os produtos que você mais gosta aqui.</p>
                                            <Link
                                                href="/store"
                                                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/20"
                                            >
                                                Explorar Loja
                                                <ChevronRight className="w-5 h-5" />
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            {wishlistItems.map((item: any) => item.product && (
                                                <div
                                                    key={item._id}
                                                    className="group relative bg-white dark:bg-[#151e32] rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden hover:shadow-xl transition-all"
                                                >
                                                    <Link href={`/store/${item.product._id}`} className="block aspect-video overflow-hidden">
                                                        <img
                                                            src={item.product.image}
                                                            alt={item.product.name}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                        />
                                                    </Link>
                                                    <div className="p-4">
                                                        <div className="flex justify-between items-start gap-2 mb-2">
                                                            <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1">
                                                                {item.product.name}
                                                            </h4>
                                                            <p className="font-black text-primary shrink-0">
                                                                {formatCurrency(item.product.price)}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
                                                            <Link
                                                                href={`/store/${item.product._id}`}
                                                                className="flex-1 bg-gray-50 dark:bg-white/5 hover:bg-primary hover:text-white text-gray-700 dark:text-gray-300 py-2 rounded-lg text-center text-xs font-bold transition-all"
                                                            >
                                                                Ver Produto
                                                            </Link>
                                                            <button
                                                                onClick={async () => {
                                                                    try {
                                                                        await toggleWishlist({ userId: user!._id, productId: item.product._id });
                                                                        setMessage({ type: "success", text: "Removido dos favoritos" });
                                                                    } catch (err) {
                                                                        setMessage({ type: "error", text: "Erro ao remover" });
                                                                    }
                                                                }}
                                                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                                title="Remover"
                                                            >
                                                                <Trash2 className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Notifications Tab */}
                            {activeTab === "notifications" && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between mb-8">
                                        <h2 className="font-bold text-xl text-gray-900 dark:text-white flex items-center gap-2">
                                            <Bell className="w-5 h-5 text-primary" />
                                            Notificações
                                        </h2>
                                        {notifications && notifications.length > 0 && (
                                            <button
                                                onClick={() => markAllAsRead({ userId: user!._id })}
                                                className="text-xs font-bold text-primary hover:underline uppercase tracking-wider"
                                            >
                                                Marcar todas como lidas
                                            </button>
                                        )}
                                    </div>

                                    {!notifications || notifications.length === 0 ? (
                                        <div className="bg-white dark:bg-[#151e32] rounded-3xl p-12 text-center border border-gray-100 dark:border-white/5">
                                            <Bell className="w-16 h-16 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
                                            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Tudo limpo por aqui</h3>
                                            <p className="text-gray-500 max-w-xs mx-auto">Você não tem nenhuma notificação no momento.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {notifications.map((note: any) => (
                                                <div
                                                    key={note._id}
                                                    className={`p-5 rounded-2xl border transition-all relative group ${note.status === "unread"
                                                        ? "bg-white dark:bg-[#151e32] border-primary/20 shadow-lg shadow-primary/5"
                                                        : "bg-gray-50/50 dark:bg-white/5 border-gray-100 dark:border-white/5"
                                                        }`}
                                                >
                                                    <div className="flex gap-4">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${note.type === "order" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600" :
                                                            note.type === "promo" ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600" :
                                                                "bg-gray-100 dark:bg-gray-800 text-gray-600"
                                                            }`}>
                                                            {note.type === "order" ? <Package className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <h4 className={`font-bold ${note.status === "unread" ? "text-gray-900 dark:text-white" : "text-gray-500"}`}>
                                                                    {note.title}
                                                                </h4>
                                                                <span className="text-[10px] text-gray-400 font-medium">
                                                                    {formatDate(note.createdAt)}
                                                                </span>
                                                            </div>
                                                            <p className={`text-sm mb-3 ${note.status === "unread" ? "text-gray-600 dark:text-gray-400" : "text-gray-500"}`}>
                                                                {note.message}
                                                            </p>
                                                            <div className="flex items-center gap-3">
                                                                {note.metadata?.link && (
                                                                    <Link
                                                                        href={note.metadata.link}
                                                                        onClick={() => markAsRead({ notificationId: note._id })}
                                                                        className="text-xs font-bold text-primary hover:underline"
                                                                    >
                                                                        Ver detalhes
                                                                    </Link>
                                                                )}
                                                                {note.status === "unread" && (
                                                                    <button
                                                                        onClick={() => markAsRead({ notificationId: note._id })}
                                                                        className="text-xs font-bold text-gray-400 hover:text-primary transition-colors"
                                                                    >
                                                                        Marcar como lida
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => removeNotification({ notificationId: note._id })}
                                                            className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 transition-all rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </FeatureLayout>
    );
}
