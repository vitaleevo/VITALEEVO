"use client";

import React from 'react';
import Link from 'next/link';
import Logo from './Logo';
import {
  Instagram,
  Facebook,
  Music2,
  MapPin,
  Mail,
  Phone,
  Linkedin,
  Twitter
} from "lucide-react";

import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';

const Footer: React.FC = () => {
  const settings = useQuery(api.settings.get);

  // Default fallbacks while loading
  const config: any = settings || {
    siteName: "Vitaleevo",
    siteDescription: "A agência parceira do seu crescimento digital em Angola. Criatividade, Tecnologia e Estratégia em um só lugar.",
    socialLinks: {
      instagram: 'https://www.instagram.com/vitaleevo/',
      facebook: 'https://www.facebook.com/vitaleevo',
      linkedin: '',
      twitter: ''
    },
    address: 'Bairro Benfica, próximo à Dona Xepa, Luanda, Angola',
    contactEmail: 'info@vitaleevo.ao',
    contactPhone: '+244 935 348 327'
  };

  const socialIcons = [
    { name: 'Instagram', icon: <Instagram className="w-5 h-5" />, url: config.socialLinks?.instagram },
    { name: 'Facebook', icon: <Facebook className="w-5 h-5" />, url: config.socialLinks?.facebook },
    { name: 'LinkedIn', icon: <Linkedin className="w-5 h-5" />, url: config.socialLinks?.linkedin },
    { name: 'Twitter', icon: <Twitter className="w-5 h-5" />, url: config.socialLinks?.twitter },
  ].filter(s => s.url); // Only show if url exists

  return (
    <footer className="bg-surface-light dark:bg-background-dark pt-16 pb-8 border-t border-gray-200 dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <div className="mb-6">
              <Logo />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">
              {config.siteDescription}
            </p>
            <div className="flex gap-4">
              {socialIcons.map((social, idx) => (
                <a
                  key={idx}
                  href={social.url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-primary hover:text-white transition-all shadow-sm"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-6 uppercase tracking-widest text-xs">Acesso Rápido</h4>
            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">Sobre Nós</Link></li>
              <li><Link href="/portfolio" className="hover:text-primary transition-colors">Portfólio</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-6 uppercase tracking-widest text-xs">Horário</h4>
            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex justify-between"><span>Seg - Sex:</span> <span>08h às 17h</span></li>
              <li className="flex justify-between"><span>Sábado:</span> <span>08h às 12h</span></li>
              <li className="flex justify-between text-red-500 font-bold"><span>Domingo:</span> <span>Fechado</span></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-6 uppercase tracking-widest text-xs">Contacto Direto</h4>
            <ul className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-secondary shrink-0" />
                <span>{config.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-secondary" />
                <a href={`mailto:${config.contactEmail}`} className="hover:text-primary">{config.contactEmail}</a>
              </li>
              <li className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-secondary" />
                  <a href={`tel:${config.contactPhone}`} className="hover:text-primary">{config.contactPhone}</a>
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} {config.siteName || "Vitaleevo"}. Todos os direitos reservados.
          </p>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="/legal/terms" className="hover:text-primary transition-colors">Termos</Link>
            <Link href="/legal/privacy" className="hover:text-primary transition-colors">Privacidade</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
