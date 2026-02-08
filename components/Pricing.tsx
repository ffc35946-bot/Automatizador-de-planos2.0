
import React from 'react';
import { Check, Star, ShieldCheck, Zap, CreditCard, Lock, ArrowRight } from 'lucide-react';

const Pricing: React.FC = () => {
  const benefits = [
    "Integração Ilimitada (Kirvano, Kiwify, Cakto)",
    "Logs de Webhook em Tempo Real",
    "Dashboard de Retenção e Churn",
    "Simulador de Eventos de Recorrência",
    "Assistente de IA para Troubleshooting",
    "Suporte Prioritário via WhatsApp"
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 md:p-6 animate-fade-in relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-64 md:w-96 h-64 md:h-96 bg-primary/10 rounded-full blur-[80px] md:blur-[100px]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-64 md:w-96 h-64 md:h-96 bg-secondary/5 rounded-full blur-[80px] md:blur-[100px]"></div>

      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center relative z-10">
        {/* Left Side: Content */}
        <div className="space-y-6 md:space-y-10 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
            <Star size={12} fill="currentColor" /> Oferta de Lançamento
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-white leading-[1.1] tracking-tighter px-2 md:px-0">
            Sua operação no <br className="hidden md:block" />
            <span className="text-primary">Piloto Automático.</span>
          </h1>
          <p className="text-text-secondary text-base md:text-xl leading-relaxed max-w-md mx-auto lg:mx-0">
            Esqueça as planilhas e ativações manuais. Conecte seu checkout e deixe o Plan Automator cuidar de tudo.
          </p>
          
          <div className="flex flex-wrap gap-6 justify-center lg:justify-start pt-4">
             <div className="flex items-center gap-2 text-[10px] font-bold text-text-secondary uppercase">
               <ShieldCheck size={16} className="text-secondary" /> 
               <span>Segurança Bancária</span>
             </div>
             <div className="flex items-center gap-2 text-[10px] font-bold text-text-secondary uppercase">
               <Zap size={16} className="text-yellow-500" /> 
               <span>Setup em 2 Minutos</span>
             </div>
          </div>
        </div>

        {/* Right Side: Optimized Card */}
        <div className="relative group">
          {/* Card Outer Glow */}
          <div className="absolute inset-0 bg-primary/20 blur-[40px] rounded-[3rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div className="bg-card border border-white/10 rounded-[2.5rem] md:rounded-[3.5rem] p-1 md:p-1 shadow-2xl relative overflow-hidden flex flex-col">
            {/* Best Value Badge */}
            <div className="absolute -top-1 right-12 bg-secondary text-background font-black text-[9px] px-6 py-2 rounded-b-2xl uppercase tracking-[0.2em] shadow-lg z-20">
              Melhor Valor
            </div>

            {/* Price Header Section */}
            <div className="p-8 md:p-12 bg-white/[0.02] rounded-t-[3.4rem] border-b border-white/5">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-white font-black text-2xl md:text-3xl tracking-tight">Plano Pro</h3>
                  <p className="text-text-secondary text-xs font-medium">Acesso total à plataforma</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                  <Zap size={24} className="text-primary" />
                </div>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-primary text-xl md:text-2xl font-black">R$</span>
                <span className="text-5xl md:text-7xl font-black text-white tracking-tighter">19,90</span>
                <span className="text-text-secondary font-bold text-lg">/mês</span>
              </div>
            </div>

            {/* Benefits Section */}
            <div className="p-8 md:p-12 space-y-8 flex-1">
              <div className="space-y-4">
                <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">O que está incluso:</p>
                <div className="grid grid-cols-1 gap-4">
                  {benefits.map((b, i) => (
                    <div key={i} className="flex items-center gap-4 group/item">
                      <div className="w-6 h-6 bg-secondary/10 rounded-full flex items-center justify-center shrink-0 border border-secondary/20 group-hover/item:bg-secondary group-hover/item:text-background transition-all">
                        <Check size={14} className="group-hover/item:scale-110" />
                      </div>
                      <span className="text-sm md:text-base text-text-secondary group-hover/item:text-white font-medium transition-colors">{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA and Trust Section */}
              <div className="space-y-6 pt-4">
                <button className="w-full bg-primary hover:bg-indigo-500 text-white font-black py-5 md:py-6 rounded-2xl md:rounded-3xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 uppercase text-xs md:text-sm tracking-[0.2em] flex items-center justify-center gap-3">
                  Quero começar agora
                  <ArrowRight size={18} />
                </button>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 border-t border-white/5 mt-4">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-text-secondary">
                    <Lock size={12} className="text-secondary" />
                    <span>Checkout Seguro</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-text-secondary">
                    <CreditCard size={12} className="text-primary" />
                    <span>Cartão ou PIX</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
