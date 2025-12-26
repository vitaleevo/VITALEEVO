"use client";

import React, { useState } from 'react';
import {
  CheckCircle,
  Clock,
  MapPin,
  Mail,
  Phone,
  RefreshCw,
  Send
} from "lucide-react";

import { useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { sendContactEmail } from '@/app/actions/contact';

const Contact: React.FC = () => {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Store in Convex (Database backup)
      await submitMessage({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
      });

      // 2. Email is temporarily disabled until domain is verified
      // const result = await sendContactEmail(formData);

      setIsSubmitting(false);
      setIsSubmitted(true);

      // 3. Direct WhatsApp Redirect
      const whatsappMessage = `Olá! Meu nome é ${formData.name}.%0A%0AAssunto: ${formData.subject}%0A%0AMensagem: ${formData.message}`;
      const whatsappUrl = `https://wa.me/244935348327?text=${whatsappMessage}`;

      // Open WhatsApp automatically
      setTimeout(() => {
        window.open(whatsappUrl, '_blank');
      }, 800);

    } catch (err: any) {
      console.error("Form submission error:", err);
      setError("Ocorreu um erro ao processar. Por favor, tente falar diretamente pelo WhatsApp.");
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="pt-28 pb-20 min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="font-display font-black text-3xl text-gray-900 dark:text-white mb-4">
            Mensagem Recebida!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Obrigado pelo contacto! A sua mensagem foi guardada. Estamos a redirecioná-lo para o WhatsApp para um atendimento imediato.
          </p>
          <div className="flex flex-col gap-4">
            <a
              href="https://wa.me/244935348327"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
            >
              Abrir WhatsApp Novamente
            </a>
            <button
              onClick={() => setIsSubmitted(false)}
              className="text-gray-500 hover:text-gray-700 font-semibold"
            >
              Enviar Nova Mensagem
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div className="space-y-10 lg:sticky lg:top-32">
            <div className="space-y-4">
              <h4 className="text-secondary font-bold tracking-wider uppercase text-sm">VitalEvo Angola</h4>
              <h1 className="font-display font-black text-4xl sm:text-6xl text-gray-900 dark:text-white leading-tight">
                Dê vida à sua <br />
                <span className="text-primary">Visão Digital.</span>
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-lg leading-relaxed">
                Estamos localizados no coração de Benfica. Venha tomar um café conosco ou envie-nos uma mensagem agora mesmo!
              </p>
            </div>

            <div className="space-y-8">
              <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-secondary" />
                  Horário de Funcionamento
                </h3>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                    <span>Segunda a Sexta</span>
                    <span className="font-bold">08:00 - 17:00</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                    <span>Sábado</span>
                    <span className="font-bold">08:00 - 12:00</span>
                  </div>
                  <div className="flex justify-between py-1 text-red-500">
                    <span>Domingo</span>
                    <span className="font-bold">Fechado</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {[
                  { icon: <MapPin className="w-6 h-6" />, title: 'Localização', line1: 'Bairro Benfica ao lado da dona xepa', line2: 'Luanda, Angola' },
                  { icon: <Mail className="w-6 h-6" />, title: 'E-mail', line1: 'info@vitaleevo.ao', line2: 'Resposta em 24h' },
                  { icon: <Phone className="w-6 h-6" />, title: 'Contacto', line1: '+244 935 348 327', line2: '+244 959 822 513' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start space-x-4 group">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg">{item.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">{item.line1}</p>
                      <p className="text-gray-500 dark:text-gray-500 text-sm">{item.line2}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* WhatsApp CTA */}
              <a
                href="https://wa.me/244935348327"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-green-500/30 transition-all hover:-translate-y-1"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Chamar no WhatsApp
              </a>
            </div>
          </div>

          <div className="bg-surface-light dark:bg-surface-dark p-8 md:p-12 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
            <h2 className="font-display font-bold text-2xl text-gray-900 dark:text-white mb-8">Solicitar Consultoria Gratuita</h2>

            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm border border-red-100 dark:border-red-900/30">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Seu Nome</label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full h-14 px-5 rounded-xl bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-gray-800 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-gray-900 dark:text-white transition-all"
                    placeholder="Ex: Lucas Silva"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Seu Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full h-14 px-5 rounded-xl bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-gray-800 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-gray-900 dark:text-white transition-all"
                    placeholder="lucas@exemplo.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">WhatsApp / Telefone</label>
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full h-14 px-5 rounded-xl bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-gray-800 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-gray-900 dark:text-white transition-all"
                    placeholder="+244 ..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Assunto do Projecto</label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full h-14 px-5 rounded-xl bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-gray-800 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-gray-900 dark:text-white transition-all"
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
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Descreva sua Necessidade</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full p-5 rounded-xl bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-gray-800 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-gray-900 dark:text-white transition-all resize-none"
                  placeholder="Conte-nos um pouco sobre sua ideia..."
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary-dark disabled:bg-primary/50 text-white py-5 rounded-xl font-black text-xl shadow-xl shadow-primary/30 transition-all hover:-translate-y-1 flex items-center justify-center gap-3"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Enviar Proposta
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Sua mensagem será enviada com segurança para nossa equipa.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
