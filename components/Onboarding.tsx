
import React from 'react';
import { Zap, ShieldCheck, BarChart3, ChevronRight } from 'lucide-react';

interface OnboardingProps {
  onConfirm: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onConfirm }) => {
  const steps = [
    {
      icon: <Zap className="text-primary" size={24} />,
      title: "Conecte seus Checkouts",
      desc: "Integre Kirvano, Kiwify e Cakto em segundos usando nossos Webhooks pré-configurados."
    },
    {
      icon: <ShieldCheck className="text-secondary" size={24} />,
      title: "Controle de Acesso Automático",
      desc: "Nossa IA processa pagamentos, cancelamentos e expirações, liberando ou bloqueando seu SaaS instantaneamente."
    },
    {
      icon: <BarChart3 className="text-purple-500" size={24} />,
      title: "Métricas de Retenção",
      desc: "Acompanhe seu Churn e usuários em risco de cancelamento em um dashboard em tempo real."
    }
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 md:p-6 animate-fade-in overflow-y-auto">
      <div className="max-w-2xl w-full py-10 space-y-8 md:space-y-10 text-center">
        <div className="space-y-3 md:space-y-4">
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">Como o App funciona?</h1>
          <p className="text-text-secondary text-base md:text-lg px-4">Seu micro-SaaS no piloto automático em 3 passos simples.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 px-2">
          {steps.map((step, i) => (
            <div key={i} className="bg-card/40 border border-white/5 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] space-y-4 hover:border-primary/30 transition-all group">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-background rounded-2xl flex items-center justify-center mx-auto shadow-xl group-hover:scale-110 transition-transform">
                {step.icon}
              </div>
              <h3 className="text-white font-bold text-sm leading-tight">{step.title}</h3>
              <p className="text-text-secondary text-[10px] md:text-[11px] leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="pt-4 px-4">
          <button 
            onClick={onConfirm}
            className="w-full md:w-auto inline-flex items-center justify-center gap-3 bg-primary hover:bg-indigo-500 text-white font-black px-8 md:px-10 py-4 md:py-5 rounded-2xl shadow-2xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 uppercase text-[10px] md:text-xs tracking-[0.2em]"
          >
            Ver Planos de Acesso
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
