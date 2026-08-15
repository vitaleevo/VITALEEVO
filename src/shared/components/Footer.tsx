"use client";

import React from "react";
import Link from "next/link";
import Logo from "./Logo";
import {
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  MapPin,
  Mail,
  PhoneCall,
  ArrowUpRight,
} from "lucide-react";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { PHONE_CONTACTS, SITE_CONTACT } from "@/shared/utils/contact";

const Footer: React.FC = () => {
  const settings = useQuery(api.settings.get);

  const config: any = settings || {
    siteName: "Vitaleevo",
    siteDescription:
      "A agência parceira do seu crescimento digital em Angola. Criatividade, Tecnologia e Estratégia em um só lugar.",
    socialLinks: {
      instagram: "https://www.instagram.com/vitaleevo/",
      facebook: "https://www.facebook.com/vitaleevo",
      linkedin: "",
      twitter: "",
    },
    address: SITE_CONTACT.address,
    contactEmail: SITE_CONTACT.email,
    contactPhone: SITE_CONTACT.primaryPhone,
  };

  const socials = [
    { name: "Instagram", icon: Instagram, url: config.socialLinks?.instagram },
    { name: "Facebook", icon: Facebook, url: config.socialLinks?.facebook },
    { name: "LinkedIn", icon: Linkedin, url: config.socialLinks?.linkedin },
    { name: "Twitter", icon: Twitter, url: config.socialLinks?.twitter },
  ].filter((s) => s.url);

  return (
    <footer className="border-t border-slate-200 bg-white dark:border-white/5 dark:bg-[#0b1120]">
      <div className="wrap py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="mb-5 inline-block">
              <Logo />
            </Link>
            <p className="mb-6 max-w-xs text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              {config.siteDescription}
            </p>
            <div className="flex gap-3">
              {socials.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.name}
                    href={s.url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.name}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-all hover:-translate-y-0.5 hover:border-primary hover:text-primary dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="mb-5 text-xs font-bold uppercase tracking-[0.18em] text-slate-900 dark:text-white">
              Navegação
            </h4>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <li><Link href="/" className="transition-colors hover:text-primary">Home</Link></li>
              <li><Link href="/about" className="transition-colors hover:text-primary">Sobre Nós</Link></li>
              <li><Link href="/services" className="transition-colors hover:text-primary">Serviços</Link></li>
              <li><Link href="/portfolio" className="transition-colors hover:text-primary">Portfólio</Link></li>
              <li><Link href="/blog" className="transition-colors hover:text-primary">Blog</Link></li>
            </ul>
          </div>

          {/* Store */}
          <div>
            <h4 className="mb-5 text-xs font-bold uppercase tracking-[0.18em] text-slate-900 dark:text-white">
              Loja
            </h4>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <li><Link href="/store" className="transition-colors hover:text-primary">Todos os Produtos</Link></li>
              <li><Link href="/cart" className="transition-colors hover:text-primary">Carrinho</Link></li>
              <li><Link href="/legal/terms" className="transition-colors hover:text-primary">Termos de Uso</Link></li>
              <li><Link href="/legal/privacy" className="transition-colors hover:text-primary">Política de Privacidade</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-5 text-xs font-bold uppercase tracking-[0.18em] text-slate-900 dark:text-white">
              Contacto
            </h4>
            <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <a
                  href={SITE_CONTACT.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-primary"
                >
                  {SITE_CONTACT.address}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                <a href={`mailto:${SITE_CONTACT.email}`} className="hover:text-primary">{SITE_CONTACT.email}</a>
              </li>
              {PHONE_CONTACTS.map((phone) => (
                <li key={phone.digits} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 transition-colors hover:border-primary/30 dark:border-white/10 dark:bg-white/5">
                  <PhoneCall className="h-4 w-4 shrink-0 text-primary" />
                  <a href={`tel:+${phone.digits}`} className="font-semibold hover:text-primary">{phone.display}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-8 md:flex-row dark:border-white/5">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} {config.siteName || "Vitaleevo"}. Todos os direitos reservados.
          </p>
          <Link
            href="/contact"
            className="group inline-flex items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-primary-dark"
          >
            Falar com um especialista
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
