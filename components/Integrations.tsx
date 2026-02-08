
import React, { useState, useEffect } from 'react';
import Card from './Card';
import Modal from './Modal';
import { IntegrationPlatform, LogStatus, SubscriptionStatus, type Integration, type SaasConfig, type User, type LogEntry } from '../types';
import { INITIAL_INTEGRATIONS, WEBHOOK_URL } from '../constants';
import { Copy, Check, Plus, Trash2, LayoutGrid, HelpCircle, Globe, RefreshCw, XOctagon, User as UserIcon, Code, Eye } from 'lucide-react';

interface IntegrationsProps {
  onHelpClick?: () => void;
}

const Integrations: React.FC<IntegrationsProps> = ({ onHelpClick }) => {
  const [user, setUser] = useState<User | null>(null);
  const [integrations, setIntegrations] = useState<Integration[]>(INITIAL_INTEGRATIONS);
  const [saasConfig, setSaasConfig] = useState<SaasConfig>({ endpoint: '', apiKey: '' });
  const [planMappings, setPlanMappings] = useState<{id: number, checkoutId: string, saasPlan: string, isRecurring: boolean}[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [copied, setCopied] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{success: boolean, message: string} | null>(null);

  const [testEmail, setTestEmail] = useState('cliente@exemplo.com');
  const [tempSecret, setTempSecret] = useState('');
  const [tempToken, setTempToken] = useState('');

  useEffect(() => {
    const session = localStorage.getItem('saas_active_session');
    if (session) {
      const userData = JSON.parse(session);
      setUser(userData);
      const savedIntegrationsStr = localStorage.getItem(`integrations_${userData.email}`);
      const savedConfig = localStorage.getItem(`config_${userData.email}`);
      const savedMappings = localStorage.getItem(`mappings_${userData.email}`);

      if (savedIntegrationsStr) {
          const saved: Integration[] = JSON.parse(savedIntegrationsStr);
          const merged = INITIAL_INTEGRATIONS.map(initial => {
              const savedItem = saved.find(s => s.platform === initial.platform);
              return { ...initial, connected: savedItem ? savedItem.connected : false, webhookSecret: savedItem?.webhookSecret || '', apiToken: savedItem?.apiToken || '' };
          });
          setIntegrations(merged);
      }
      setSaasConfig(savedConfig ? JSON.parse(savedConfig) : { endpoint: '', apiKey: '' });
      setPlanMappings(savedMappings ? JSON.parse(savedMappings) : []);
    }
  }, []);

  const saveToStorage = (type: 'integrations' | 'config' | 'mappings', data: any) => {
    if (!user) return;
    localStorage.setItem(`${type}_${user.email}`, JSON.stringify(data));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(WEBHOOK_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConnectClick = (int: Integration) => {
    setSelectedIntegration(int);
    setTempSecret(int.webhookSecret || '');
    setTempToken(int.apiToken || '');
    setIsModalOpen(true);
  };

  const handleSaveIntegrationSettings = () => {
    if (!selectedIntegration) return;
    const updated = integrations.map(int => 
      int.platform === selectedIntegration.platform 
        ? { ...int, connected: true, webhookSecret: tempSecret, apiToken: tempToken }
        : int
    );
    setIntegrations(updated);
    saveToStorage('integrations', updated);
    setIsModalOpen(false);
  };

  const handleSaveAll = () => {
    saveToStorage('integrations', integrations);
    saveToStorage('config', saasConfig);
    saveToStorage('mappings', planMappings);
    setTestResult({ success: true, message: "Todas as configurações foram salvas!" });
    setTimeout(() => setTestResult(null), 3000);
  };

  const getPlatformPayload = (platform: IntegrationPlatform, event: 'approved' | 'canceled' | 'expired') => {
    const mapping = planMappings[0] || { checkoutId: 'prod_default', saasPlan: 'VIP', isRecurring: true };
    
    switch(platform) {
      case IntegrationPlatform.Kiwify:
        return {
          order_status: event === 'approved' ? 'paid' : event === 'canceled' ? 'canceled' : 'expired',
          customer_email: testEmail,
          product_id: mapping.checkoutId,
          subscription_id: "sub_kiwify_8822",
          webhook_event: event === 'approved' ? 'ORDER_PAID' : (event === 'canceled' ? 'SUBSCRIPTION_CANCELED' : 'SUBSCRIPTION_EXPIRED')
        };
      case IntegrationPlatform.Kirvano:
        return {
          event: event === 'approved' ? 'order.approved' : (event === 'canceled' ? 'subscription.canceled' : 'subscription.expired'),
          data: {
            customer: { email: testEmail, name: "Usuário Kirvano" },
            product: { id: mapping.checkoutId, name: mapping.saasPlan },
            subscription: event !== 'approved' ? { status: event, id: "sub_kir_99" } : null
          }
        };
      case IntegrationPlatform.Cakto:
        return {
          event: event === 'approved' ? 'order_approved' : (event === 'canceled' ? 'subscription_canceled' : 'subscription_expired'),
          email: testEmail,
          product_id: mapping.checkoutId,
          subscription_status: event === 'approved' ? 'active' : event
        };
      default:
        return {
          status: event,
          email: testEmail,
          plan: mapping.saasPlan,
          timestamp: new Date().toISOString()
        };
    }
  };

  const simulateWebhookEvent = async (eventType: 'approved' | 'canceled' | 'expired') => {
    if (!saasConfig.endpoint) { alert("Configure seu Endpoint primeiro!"); return; }
    
    setIsTesting(true);
    const platform = selectedIntegration?.platform || IntegrationPlatform.Custom;
    const mockPayload = getPlatformPayload(platform, eventType);

    try {
        if (saasConfig.endpoint.startsWith('http')) {
            await fetch(saasConfig.endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Simulation-Mode': 'true' },
                body: JSON.stringify(mockPayload)
            });
        }
        
        setTimeout(() => {
            setIsTesting(false);
            setTestResult({ success: true, message: `Webhook ${platform} enviado: ${eventType}` });

            if (user) {
                const isRecurring = planMappings.find(m => m.checkoutId === (mockPayload as any).product_id)?.isRecurring ?? true;
                
                const newLog: LogEntry = {
                    id: `evt_${Date.now()}`,
                    timestamp: new Date(),
                    platform: platform,
                    userEmail: testEmail,
                    plan: planMappings[0]?.saasPlan || 'Plano Padrão',
                    status: LogStatus.Success,
                    subStatus: eventType === 'approved' ? SubscriptionStatus.Active : 
                               eventType === 'canceled' ? SubscriptionStatus.Canceled : SubscriptionStatus.Expired,
                    expiryDate: eventType === 'approved' ? new Date(Date.now() + 30 * 86400000) : 
                                eventType === 'canceled' ? new Date(Date.now() + 7 * 86400000) : // Carência de 7 dias no cancelamento
                                new Date(Date.now() - 3600000) // Expirado agora
                };
                
                if (!isRecurring && eventType === 'approved') {
                    newLog.subStatus = SubscriptionStatus.SinglePurchase;
                    newLog.expiryDate = undefined;
                }

                const currentLogs = JSON.parse(localStorage.getItem(`logs_${user.email}`) || '[]');
                localStorage.setItem(`logs_${user.email}`, JSON.stringify([newLog, ...currentLogs]));
            }
        }, 800);
    } catch (e) {
        setIsTesting(false);
        setTestResult({ success: false, message: "Erro: Verifique se sua URL aceita POST e está online." });
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <h2 className="text-3xl font-black text-white tracking-tight">Recorrência Multicanal</h2>
           <p className="text-sm text-text-secondary mt-1 font-medium">Automação de acessos para Kirvano, Kiwify e Cakto.</p>
        </div>
        <button 
          onClick={onHelpClick}
          className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl text-xs font-bold text-text-secondary hover:text-white transition-all"
        >
          <HelpCircle size={16} />
          Como Integrar?
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card title="Canais de Checkout">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {integrations.map((int) => (
                <div 
                  key={int.platform}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    int.connected ? 'bg-primary/5 border-primary/20' : 'bg-sidebar/50 border-white/5 opacity-70 hover:opacity-100'
                  }`}
                  onClick={() => handleConnectClick(int)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <img src={int.logo} alt={int.platform} className="h-8 w-8 rounded-lg object-contain bg-white p-1" />
                    {int.connected ? (
                      <div className="px-2 py-1 bg-green-500/10 text-green-500 text-[8px] font-black rounded uppercase">Conectado</div>
                    ) : (
                      <div className="px-2 py-1 bg-white/5 text-gray-500 text-[8px] font-black rounded uppercase">Inativo</div>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-white">{int.platform}</h4>
                  <p className="text-[10px] text-text-secondary mt-1">Configurar Webhook e API</p>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Endpoint do seu SaaS">
            <div className="space-y-4">
              <div className="p-4 bg-background/50 border border-white/10 rounded-2xl">
                <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest block mb-2">Sua URL de Webhook (POST)</label>
                <div className="flex items-center gap-2">
                  <Globe size={18} className="text-primary shrink-0" />
                  <input 
                    type="text" 
                    placeholder="https://seu-saas.com/api/webhook"
                    value={saasConfig.endpoint}
                    onChange={(e) => setSaasConfig({ ...saasConfig, endpoint: e.target.value })}
                    className="bg-transparent border-none focus:ring-0 text-sm text-white w-full outline-none"
                  />
                </div>
              </div>
              <button 
                onClick={handleSaveAll}
                className="w-full py-4 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-indigo-500 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw size={16} />
                Atualizar Configurações
              </button>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Simulador de Recorrência">
            <div className="space-y-6">
              <div className="p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl flex items-start gap-3">
                <HelpCircle size={18} className="text-yellow-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-yellow-500/80 leading-relaxed font-medium">
                  Use este simulador para testar como seu backend reage a diferentes eventos de pagamento sem precisar fazer uma compra real.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-secondary uppercase ml-1">E-mail para Teste</label>
                  <input 
                    type="email" 
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    className="w-full bg-sidebar/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-primary outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <button 
                    onClick={() => simulateWebhookEvent('approved')}
                    disabled={isTesting}
                    className="flex flex-col items-center justify-center gap-2 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl hover:bg-green-500/20 transition-all group"
                  >
                    <Check className="text-green-500 group-hover:scale-110 transition-transform" size={20} />
                    <span className="text-[8px] font-black text-green-500 uppercase">Aprovar</span>
                  </button>
                  <button 
                    onClick={() => simulateWebhookEvent('canceled')}
                    disabled={isTesting}
                    className="flex flex-col items-center justify-center gap-2 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl hover:bg-yellow-500/20 transition-all group"
                  >
                    <RefreshCw className="text-yellow-400 group-hover:scale-110 transition-transform" size={20} />
                    <span className="text-[8px] font-black text-yellow-400 uppercase">Cancelar</span>
                  </button>
                  <button 
                    onClick={() => simulateWebhookEvent('expired')}
                    disabled={isTesting}
                    className="flex flex-col items-center justify-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl hover:bg-red-500/20 transition-all group"
                  >
                    <XOctagon className="text-red-500 group-hover:scale-110 transition-transform" size={20} />
                    <span className="text-[8px] font-black text-red-500 uppercase">Expirar</span>
                  </button>
                </div>

                {testResult && (
                  <div className={`p-3 rounded-xl border text-center animate-slide-down ${
                    testResult.success ? 'bg-secondary/10 border-secondary/20 text-secondary' : 'bg-red-500/10 border-red-500/20 text-red-500'
                  }`}>
                    <p className="text-[10px] font-bold">{testResult.message}</p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card title="Link do Webhook Automator">
            <div className="p-4 bg-sidebar/50 border border-white/10 rounded-2xl space-y-3">
               <p className="text-[10px] text-text-secondary leading-relaxed font-medium">
                 Copie este URL e cole na área de Webhooks do seu Checkout (Kirvano, Kiwify ou Cakto) para que nós possamos monitorar suas vendas.
               </p>
               <div className="flex items-center gap-2 bg-background/50 p-3 rounded-xl border border-white/5">
                  <Code size={16} className="text-primary shrink-0" />
                  <code className="text-[10px] text-white truncate flex-1 font-mono">{WEBHOOK_URL}</code>
                  <button 
                    onClick={handleCopy}
                    className="text-text-secondary hover:text-white transition-colors p-1"
                  >
                    {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                  </button>
               </div>
            </div>
          </Card>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={`Configurar ${selectedIntegration?.platform}`}
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">Webhook Secret / Client ID</label>
              <input 
                type="text" 
                value={tempSecret}
                onChange={(e) => setTempSecret(e.target.value)}
                className="w-full bg-sidebar border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-primary"
                placeholder="Insira o segredo do webhook"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">API Token (Opcional)</label>
              <input 
                type="password" 
                value={tempToken}
                onChange={(e) => setTempToken(e.target.value)}
                className="w-full bg-sidebar border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-primary"
                placeholder="Token de acesso à API"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-3 bg-sidebar border border-border rounded-xl text-xs font-black uppercase text-white hover:bg-card transition-all"
            >
              Cancelar
            </button>
            <button 
              onClick={handleSaveIntegrationSettings}
              className="flex-1 py-3 bg-primary text-white rounded-xl text-xs font-black uppercase shadow-lg shadow-primary/20 hover:bg-indigo-500 transition-all"
            >
              Salvar Conexão
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Integrations;
