
import React, { useState, useEffect } from 'react';
import type { LogEntry, User } from '../types';
import { SubscriptionStatus } from '../types';
import { Database, ShieldAlert, Trash2, X, Calendar, Globe, User as UserIcon } from 'lucide-react';

const SubStatusBadge: React.FC<{ status: SubscriptionStatus, isExpired: boolean }> = ({ status, isExpired }) => {
  const baseClasses = "flex items-center space-x-2 px-3 py-1 text-[9px] font-black uppercase tracking-wider rounded-full border shadow-sm";
  
  if (isExpired) {
    return <div className={`${baseClasses} bg-red-500/20 text-red-400 border-red-500/40 animate-pulse`}>
      <ShieldAlert size={10} />
      <span>ACESSO EXPIRADO</span>
    </div>;
  }

  switch (status) {
    case SubscriptionStatus.Active:
      return <div className={`${baseClasses} bg-green-500/10 text-green-400 border-green-500/20`}><span>{status}</span></div>;
    case SubscriptionStatus.Canceled:
      return <div className={`${baseClasses} bg-yellow-500/10 text-yellow-400 border-yellow-500/20`}><span>{status}</span></div>;
    case SubscriptionStatus.Expired:
      return <div className={`${baseClasses} bg-red-500/10 text-red-400 border-red-500/20`}><span>{status}</span></div>;
    default:
      return <div className={`${baseClasses} bg-gray-500/10 text-gray-400 border-gray-500/20`}><span>{status}</span></div>;
  }
};

const Logs: React.FC = () => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [showConfirmClear, setShowConfirmClear] = useState(false);
    const now = new Date();

    const loadLogs = (email: string) => {
        const savedLogs = localStorage.getItem(`logs_${email}`);
        if (savedLogs) {
            setLogs(JSON.parse(savedLogs).map((l: any) => ({ 
                ...l, 
                timestamp: new Date(l.timestamp),
                expiryDate: l.expiryDate ? new Date(l.expiryDate) : undefined
            })));
        } else {
            setLogs([]);
        }
    };

    useEffect(() => {
        const session = localStorage.getItem('saas_active_session');
        if (session) {
            const userData = JSON.parse(session);
            setUser(userData);
            loadLogs(userData.email);
        }
    }, []);

    const handleClearLogs = () => {
        if (!user) return;
        localStorage.removeItem(`logs_${user.email}`);
        setLogs([]);
        setShowConfirmClear(false);
    };

    const formatTime = (date: Date) => date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

    if (logs.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 animate-fade-in">
                <div className="w-20 h-20 bg-sidebar border border-white/5 rounded-[2rem] flex items-center justify-center mb-6 shadow-2xl">
                    <Database size={32} className="text-gray-600" />
                </div>
                <h2 className="text-2xl font-black text-white mb-2">Sem Movimentação</h2>
                <p className="text-text-secondary text-sm max-w-xs leading-relaxed">Aguardando eventos de pagamento ou testes do simulador para processar acessos.</p>
            </div>
        );
    }

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in pb-20 px-2 md:px-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h2 className="text-2xl md:text-3xl font-black text-white">Ciclo de Acesso</h2>
            <p className="text-xs md:text-sm text-text-secondary font-medium">Histórico em tempo real de ativações e bloqueios.</p>
        </div>
        
        <div className="flex items-center gap-3">
            {!showConfirmClear ? (
                <button 
                    onClick={() => setShowConfirmClear(true)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-5 py-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg active:scale-95"
                >
                    <Trash2 size={14} />
                    Limpar Testes
                </button>
            ) : (
                <div className="flex items-center gap-2 animate-fade-in flex-1 md:flex-none">
                    <button 
                        onClick={handleClearLogs}
                        className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2"
                    >
                        Confirmar
                    </button>
                    <button 
                        onClick={() => setShowConfirmClear(false)}
                        className="p-3 bg-sidebar border border-white/10 rounded-xl text-text-secondary hover:text-white"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}
            <div className="hidden sm:block bg-card p-3 rounded-2xl border border-border text-[11px] font-bold text-text-secondary uppercase">
                Monitor Ativo
            </div>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden lg:block bg-card/40 rounded-[2.5rem] border border-border shadow-2xl overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left">
            <thead className="bg-sidebar/50">
                <tr>
                <th className="p-6 text-[10px] font-black text-text-secondary uppercase">Estado do Plano</th>
                <th className="p-6 text-[10px] font-black text-text-secondary uppercase">Usuário</th>
                <th className="p-6 text-[10px] font-black text-text-secondary uppercase">Expiração Estimada</th>
                <th className="p-6 text-[10px] font-black text-text-secondary uppercase">Canal</th>
                <th className="p-6 text-[10px] font-black text-text-secondary uppercase">Evento</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
                {logs.map((log) => {
                  const isDateExpired = log.expiryDate && log.expiryDate < now;
                  return (
                    <tr key={log.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="p-6"><SubStatusBadge status={log.subStatus} isExpired={!!isDateExpired} /></td>
                        <td className="p-6 text-sm font-bold text-white group-hover:text-primary transition-colors">{log.userEmail}</td>
                        <td className={`p-6 text-xs font-mono ${isDateExpired ? 'text-red-500 line-through opacity-50' : 'text-text-secondary'}`}>
                            {log.expiryDate ? log.expiryDate.toLocaleDateString() : 'Vitalício'}
                        </td>
                        <td className="p-6"><span className="text-[10px] font-black px-2 py-1 bg-white/5 rounded-md text-gray-500 group-hover:text-gray-300">{log.platform}</span></td>
                        <td className="p-6 text-xs font-bold text-text-secondary">{formatTime(log.timestamp)}</td>
                    </tr>
                  );
                })}
            </tbody>
            </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {logs.map((log) => {
          const isDateExpired = log.expiryDate && log.expiryDate < now;
          return (
            <div key={log.id} className="bg-card/40 border border-white/5 p-5 rounded-[2rem] space-y-4">
              <div className="flex justify-between items-start">
                <SubStatusBadge status={log.subStatus} isExpired={!!isDateExpired} />
                <span className="text-[9px] font-black px-2 py-1 bg-white/5 rounded-md text-gray-500">{log.platform}</span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-sidebar rounded-lg text-primary"><UserIcon size={14} /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Usuário</p>
                    <p className="text-xs font-bold text-white truncate">{log.userEmail}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-sidebar rounded-lg text-secondary"><Calendar size={14} /></div>
                    <div>
                      <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest">Expiração</p>
                      <p className={`text-[10px] font-bold ${isDateExpired ? 'text-red-500 line-through opacity-50' : 'text-white'}`}>
                        {log.expiryDate ? log.expiryDate.toLocaleDateString() : 'Vitalício'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-sidebar rounded-lg text-primary/70"><Globe size={14} /></div>
                    <div>
                      <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest">Data</p>
                      <p className="text-[10px] font-bold text-white">{formatTime(log.timestamp).split(' ')[0]}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Logs;
