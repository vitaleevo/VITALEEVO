"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Hammer, Mail, Phone, Instagram, Facebook, Linkedin, Twitter } from "lucide-react";
import Logo from "@/shared/components/Logo";

export default function MaintenancePage() {
    const settings = useQuery(api.settings.get);

    if (settings && !settings.businessConfig.maintenanceMode) {
        // If someone hits this page but maintenance is off, redirect or show message
        window.location.href = "/";
        return null;
    }

    const config = settings || {
        siteName: "Vitaleevo",
        contactEmail: "info@vitaleevo.ao",
        contactPhone: "+244 9XX XXX XXX",
        socialLinks: { instagram: undefined, facebook: undefined, linkedin: undefined, twitter: undefined }
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col items-center justify-center p-6 text-center">
            <div className="max-w-2xl w-full space-y-12 animate-in fade-in zoom-in-95 duration-1000">
                <div className="flex justify-center">
                    <Logo className="w-48 h-12" />
                </div>

                <div className="space-y-6">
                    <div className="inline-flex p-6 rounded-[2.5rem] bg-primary/10 text-primary animate-bounce">
                        <Hammer className="w-12 h-12" />
                    </div>

                    <h1 className="text-4xl md:text-6xl font-display font-black text-gray-900 dark:text-white leading-tight">
                        Estamos a preparar <br />
                        <span className="text-primary tracking-tighter">algo incrível!</span>
                    </h1>

                    <p className="text-xl text-gray-500 dark:text-gray-400 font-medium max-w-lg mx-auto">
                        O {config.siteName} está em manutenção para melhorias. Voltaremos muito em breve com grandes novidades.
                    </p>
                </div>

                <div className="bg-white dark:bg-[#151e32] p-8 rounded-[3rem] border border-gray-100 dark:border-white/5 shadow-2xl space-y-8">
                    <h2 className="font-bold text-gray-900 dark:text-white uppercase tracking-widest text-xs">Precisa de ajuda imediata?</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <a href={`mailto:${config.contactEmail}`} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-white/5 hover:bg-primary/5 hover:border-primary/20 border border-transparent transition-all">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <Mail className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <p className="text-[10px] font-black text-gray-400 uppercase">E-mail</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{config.contactEmail}</p>
                            </div>
                        </a>

                        <a href={`tel:${config.contactPhone}`} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-white/5 hover:bg-green-500/5 hover:border-green-500/20 border border-transparent transition-all">
                            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
                                <Phone className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <p className="text-[10px] font-black text-gray-400 uppercase">Telefone</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{config.contactPhone}</p>
                            </div>
                        </a>
                    </div>

                    <div className="flex justify-center gap-6">
                        {config.socialLinks.instagram && (
                            <a href={config.socialLinks.instagram} target="_blank" className="text-gray-400 hover:text-primary transition-colors">
                                <Instagram className="w-6 h-6" />
                            </a>
                        )}
                        {config.socialLinks.facebook && (
                            <a href={config.socialLinks.facebook} target="_blank" className="text-gray-400 hover:text-primary transition-colors">
                                <Facebook className="w-6 h-6" />
                            </a>
                        )}
                    </div>
                </div>

                <p className="text-sm text-gray-400 font-bold uppercase tracking-[0.2em]">
                    &copy; {new Date().getFullYear()} {config.siteName}. Soluções Digitais de Elite.
                </p>
            </div>
        </div>
    );
}
