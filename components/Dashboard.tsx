
import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import { LogStatus, SubscriptionStatus, type LogEntry, type User } from '../types';
import { TrendingUp, Rocket, UserCheck, AlertTriangle, ShieldAlert, Clock } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [user, setUser] = useState<User | null>(null);

  const loadLogs = (email: string) => {
    const userLogs = localStorage.getItem(`logs_${email}`);
    if (userLogs) {
      setLogs(JSON.parse(userLogs).map((l: any) => ({ 
        ...l, 
        timestamp: new Date(l.timestamp),
        expiryDate: l.expiryDate ? new Date(l.expiryDate) : undefined
      })));
    }
  };

  useEffect(() => {
    const session = localStorage.getItem('saas_active_session');
    if (session) {
      const userData = JSON.parse(session);
      setUser(userData);
      loadLogs(userData.email);
    }
    const interval = setInterval(() => {
        if (session) { loadLogs(JSON.parse(session).email); }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const now = new Date();
  const userAccessState = logs.reduce((acc, log) => {
    const email = log.userEmail;
    if (!acc[email] || log.timestamp > acc[email].timestamp) { acc[email] = log; }
    return acc;
  }, {} as Record<string, LogEntry>);

  const uniqueUsers: LogEntry[] = Object.values(userAccessState);
  
  const currentActiveUsers = uniqueUsers.filter(log => {
    const hasValidStatus = log.subStatus === SubscriptionStatus.Active || log.subStatus === SubscriptionStatus.Canceled;
    const isNotExpired = !log.expiryDate || log.expiryDate > now;
    return hasValidStatus && isNotExpired;
  });

  const usersAtRisk = uniqueUsers.filter(log => 
    log.subStatus === SubscriptionStatus.Canceled && log.expiryDate && log.expiryDate > now
  );

  const totalChurnedUsers = uniqueUsers.filter(log => {
    const isExpiredStatus = log.subStatus === SubscriptionStatus.Expired;
    const isDateExpired = log.expiryDate && log.expiryDate < now;
    return isExpiredStatus || isDateExpired;
  }).length;

  if (logs.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-6 animate-fade-in">
        <div className="w-20 md:w-24 h-20 md:h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center mb-6 ring-1 ring-primary/20 shadow-2xl">
          <Rocket size={40} className="text-primary animate-pulse" />
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-white mb-3">Escutando Webhooks...</h2>
        <p className="text-text-secondary max-w-md leading-relaxed mb-8 text-xs md:text-sm font-medium">
          Aguardando o primeiro evento do <strong>Kirvano, Kiwify ou Cakto</strong> para iniciar o monitoramento de recorrência.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in pb-20 px-2 md:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 md:gap-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight text-center md:text-left">Monitor de Retenção</h2>
          <p className="text-text-secondary mt-1 font-medium text-xs md:text-sm text-center md:text-left">Controle total sobre quem entra e quem sai.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-card/50 p-4 md:p-6 rounded-[2rem] border border-border shadow-xl">
          <UserCheck size={18} className="text-primary mb-3 md:mb-4" />
          <p className="text-2xl md:text-3xl font-black text-white mb-1">{currentActiveUsers.length}</p>
          <p className="text-text-secondary text-[8px] md:text-[10px] font-bold uppercase tracking-widest">Acessos Ativos</p>
        </div>
        <div className="bg-card/50 p-4 md:p-6 rounded-[2rem] border border-border shadow-xl">
          <AlertTriangle size={18} className="text-red-500 mb-3 md:mb-4" />
          <p className="text-2xl md:text-3xl font-black text-white mb-1">{totalChurnedUsers}</p>
          <p className="text-text-secondary text-[8px] md:text-[10px] font-bold uppercase tracking-widest">Revogados</p>
        </div>
        <div className="bg-card/50 p-4 md:p-6 rounded-[2rem] border border-border shadow-xl">
          <Clock size={18} className="text-yellow-400 mb-3 md:mb-4" />
          <p className="text-2xl md:text-3xl font-black text-white mb-1">{usersAtRisk.length}</p>
          <p className="text-text-secondary text-[8px] md:text-[10px] font-bold uppercase tracking-widest">Em Cancelamento</p>
        </div>
        <div className="bg-card/50 p-4 md:p-6 rounded-[2rem] border border-border shadow-xl">
          <TrendingUp size={18} className="text-secondary mb-3 md:mb-4" />
          <p className="text-2xl md:text-3xl font-black text-white mb-1">{uniqueUsers.length}</p>
          <p className="text-text-secondary text-[8px] md:text-[10px] font-bold uppercase tracking-widest">Base Total</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card/30 rounded-[2rem] md:rounded-[2.5rem] border border-border p-6 md:p-8">
            <h3 className="text-base md:text-lg font-black text-white mb-6 md:mb-8 uppercase tracking-widest">Fluxo Mensal</h3>
            <div className="h-48 md:h-64 w-full">
                <ResponsiveContainer>
                    <AreaChart data={logs.slice(-10).map(l => ({ name: l.timestamp.toLocaleTimeString(), val: 1 }))}>
                        <Area type="monotone" dataKey="val" stroke="#6366f1" fill="#6366f122" strokeWidth={3} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
        
        <div className="bg-sidebar/50 rounded-[2rem] md:rounded-[2.5rem] border border-border p-6 md:p-8">
            <h3 className="text-[10px] md:text-[11px] font-black text-white mb-6 uppercase tracking-[0.2em] flex items-center gap-2">
                <ShieldAlert size={14} className="text-yellow-500" /> Assinaturas em Risco
            </h3>
            <div className="space-y-4 max-h-[250px] md:max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                {usersAtRisk.length === 0 ? (
                    <div className="text-center py-10 md:py-12 opacity-20"><Clock size={24} md:size={32} className="mx-auto mb-3" /><p className="text-[8px] md:text-[9px] font-black uppercase">Tudo estável</p></div>
                ) : (
                    usersAtRisk.map(u => (
                        <div key={u.id} className="p-3 md:p-4 bg-background/40 rounded-2xl border border-white/5 flex items-center justify-between gap-3">
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-white truncate">{u.userEmail}</p>
                                <p className="text-[8px] md:text-[9px] text-text-secondary font-bold uppercase">Expira: {u.expiryDate?.toLocaleDateString()}</p>
                            </div>
                            <div className="px-2 py-1 bg-yellow-500/10 text-yellow-500 text-[7px] md:text-[8px] font-black rounded-md border border-yellow-500/20 uppercase whitespace-nowrap">Risco</div>
                        </div>
                    ))
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
