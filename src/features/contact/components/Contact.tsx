"use client";

import React, { useState } from 'react';
import {
  ArrowUpRight,
  CheckCircle,
  MapPin,
  Mail,
  PhoneCall,
  RefreshCw,
  Send,
  Sparkles,
} from "lucide-react";

import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import FeaturedProjectsSlider from '@/shared/components/FeaturedProjectsSlider';
import { PHONE_CONTACTS, SITE_CONTACT } from '@/shared/utils/contact';

const Contact: React.FC = () => {
  const settings = useQuery(api.settings.get);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Criação de Website',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitMessage = useMutation(api.contacts.submit);

  const config = {
    contactEmail: SITE_CONTACT.email,
    whatsapp: SITE_CONTACT.whatsapp,
    address: SITE_CONTACT.address,
    siteName: settings?.siteName || 'Vitaleevo',
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await submitMessage({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
      });

      setIsSubmitting(false);
      setIsSubmitted(true);

      const whatsappMessage = `Olá! Meu nome é ${formData.name}.%0A%0AAssunto: ${formData.subject}%0A%0AMensagem: ${formData.message}`;
      const whatsappUrl = `https://wa.me/${config.whatsapp}?text=${whatsappMessage}`;

      setTimeout(() => {
        window.open(whatsappUrl, '_blank');
      }, 800);

    } catch (err) {
      console.error("Form submission error:", err);
      setError("Ocorreu um erro ao processar. Por favor, tente falar diretamente pelo WhatsApp.");
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-28 pb-20">
        <div className="mx-auto max-w-md px-4 text-center">
          <div className="mx-auto mb-8 flex h-24 w-24 animate-bounce items-center justify-center rounded-full bg-green-100 dark:bg-green-500/20">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <h1 className="mb-4 font-display text-3xl font-black text-slate-900 dark:text-white">
            Mensagem Recebida!
          </h1>
          <p className="mb-8 text-slate-600 dark:text-slate-400">
            Obrigado pelo contacto! A sua mensagem foi guardada. Estamos a redirecioná-lo
            para o WhatsApp para um atendimento imediato.
          </p>
          <div className="flex flex-col gap-4">
            <a
              href={`https://wa.me/${config.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-green-500 px-8 py-4 font-bold text-white transition-all hover:bg-green-600"
            >
              Abrir WhatsApp Novamente
            </a>
            <button
              onClick={() => setIsSubmitted(false)}
              className="font-semibold text-slate-500 hover:text-slate-700"
            >
              Enviar Nova Mensagem
            </button>
          </div>
        </div>
      </div>
    );
  }

  const infoItems = [
    { icon: <MapPin className="h-6 w-6" />, title: 'Localização', line1: config.address, line2: 'Abrir no Google Maps', href: SITE_CONTACT.mapUrl },
    { icon: <Mail className="h-6 w-6" />, title: 'E-mail', line1: config.contactEmail, line2: 'Enviar e-mail', href: `mailto:${config.contactEmail}` },
  ];

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-primary/[0.04] via-transparent to-transparent pt-28 pb-20 dark:from-primary/[0.08]">
      <div className="absolute -top-1/2 right-0 h-[600px] w-[600px] -translate-y-1/2 translate-x-1/2 rounded-full bg-primary-glow/30 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 h-80 w-80 -translate-x-1/2 translate-y-1/2 rounded-full bg-secondary/10 blur-3xl"></div>
      <div className="wrap relative z-10">
        <div className="grid grid-cols-1 items-start gap-12 xl:grid-cols-[0.92fr_1.08fr]">
          <div className="space-y-9 xl:sticky xl:top-32">
            <div className="space-y-5">
              <span className="eyebrow inline-flex items-center gap-2"><Sparkles className="h-3.5 w-3.5" /> {config.siteName} Angola</span>
              <h1 className="max-w-xl font-display text-4xl font-black leading-[0.98] tracking-tight text-slate-900 sm:text-6xl dark:text-white">
                Vamos criar o próximo passo da sua{" "}
                <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                  presença digital.
                </span>
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-slate-600 dark:text-slate-300">
                Fale com a nossa equipa para transformar ideias em experiências digitais, automações e soluções que fazem o negócio avançar.
              </p>
            </div>

            <div className="space-y-8">
              <div className="grid gap-3 sm:grid-cols-2">
                {PHONE_CONTACTS.map((phone) => (
                  <a
                    key={phone.digits}
                    href={"tel:+" + phone.digits}
                    className="group rounded-2xl border border-slate-200/80 bg-white/70 p-5 shadow-sm backdrop-blur transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg dark:border-white/10 dark:bg-slate-900/60"
                  >
                    <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                      <PhoneCall className="h-5 w-5" />
                    </span>
                    <span className="block text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{phone.label}</span>
                    <span className="mt-1 block font-display text-lg font-bold text-slate-900 dark:text-white">{phone.display}</span>
                  </a>
                ))}
              </div>

              <div className="space-y-3">
                {infoItems.map((item) => (
                  <a
                    key={item.title}
                    href={item.href}
                    target={item.title === "Localização" ? "_blank" : undefined}
                    rel={item.title === "Localização" ? "noopener noreferrer" : undefined}
                    className="group flex items-start gap-4 rounded-2xl p-3 transition-colors hover:bg-white/70 dark:hover:bg-white/[0.04]"
                  >
                    <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-white dark:bg-primary/20">
                      {item.icon}
                    </span>
                    <span className="min-w-0 pt-0.5">
                      <span className="block text-lg font-bold text-slate-900 dark:text-white">{item.title}</span>
                      <span className="mt-0.5 block truncate text-slate-600 dark:text-slate-400">{item.line1}</span>
                      <span className="mt-1 flex items-center gap-1 text-sm font-semibold text-primary">{
                        item.line2
                      } <ArrowUpRight className="h-3.5 w-3.5" /></span>
                    </span>
                  </a>
                ))}
              </div>

              <a
                href={"https://wa.me/" + config.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-green-500 px-5 py-4 font-bold text-white shadow-lg shadow-green-500/25 transition-all hover:-translate-y-1 hover:bg-green-600 hover:shadow-xl"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Conversar no WhatsApp
              </a>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-surface-light p-7 shadow-2xl shadow-primary/10 md:p-10 dark:border-white/10 dark:bg-surface-dark">
            <div className="absolute left-0 top-0 h-1.5 w-full bg-gradient-to-r from-primary via-primary-light to-secondary"></div>
            <div className="mb-8 max-w-lg">
              <span className="mb-3 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-primary">Resposta personalizada</span>
              <h2 className="font-display text-3xl font-black text-slate-900 dark:text-white">Conte-nos o que precisa.</h2>
              <p className="mt-2 text-slate-600 dark:text-slate-400">Partilhe o contexto do seu projecto e a nossa equipa entrará em contacto.</p>
            </div>

            {error && (
              <div className="mb-6 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-400">Seu Nome</label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="input-primary"
                    placeholder="Ex: Lucas Silva"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-400">Seu Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="input-primary"
                    placeholder="lucas@exemplo.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-400">WhatsApp / Telefone</label>
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="input-primary"
                    placeholder="+244 ..."
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-400">Assunto do Projecto</label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="input-primary"
                  >
                    <option>Criação de Website</option>
                    <option>Design & Branding</option>
                    <option>Marketing Digital (Tráfego)</option>
                    <option>Gestão de Redes Sociais</option>
                    <option>Consultoria de TI</option>
                    <option>Infraestrutura e Segurança</option>
                    <option>Compra de Equipamentos</option>
                    <option>Outro</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-400">Descreva sua Necessidade</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="input-primary resize-none"
                  placeholder="Conte-nos um pouco sobre sua ideia..."
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-primary py-5 font-black text-xl text-white shadow-xl shadow-primary/30 transition-all hover:-translate-y-1 hover:bg-primary-dark disabled:bg-primary/50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    Enviar Proposta
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Sua mensagem será enviada com segurança para nossa equipa.
            </p>
          </div>
        </div>

        <div className="mt-24">
          <FeaturedProjectsSlider />
        </div>
      </div>
    </div>
  );
};

export default Contact;
