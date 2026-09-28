import { useState } from 'react';
import {
  Building2, CreditCard, Mail, Award, Shield, HardDrive, Save,
  Palette, Sun, Moon, Check, Activity, Zap, Code, Copy, CheckCircle2,
  RefreshCw, Terminal, Eye, ExternalLink
} from 'lucide-react';
import { useLms } from '../../context/LmsContext';

export default function Settings() {
  const { theme, setTheme, webhookLogs, triggerTestWebhook } = useLms();
  const [activeTab, setActiveTab] = useState('appearance');

  const tabs = [
    { id: 'appearance', label: 'Appearance & Theme', icon: Palette },
    { id: 'organisation', label: 'Organisation', icon: Building2 },
    { id: 'gateways', label: 'Payment Gateways', icon: CreditCard },
    { id: 'webhooks', label: 'Webhooks & API', icon: Activity },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'certificates', label: 'Certificates', icon: Award },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'storage', label: 'Storage', icon: HardDrive },
  ];
  const [gatewaySubTab, setGatewaySubTab] = useState('stripe');
  const [selectedWebhook, setSelectedWebhook] = useState(null);
  const [testGateway, setTestGateway] = useState('Stripe');
  const [testEventType, setTestEventType] = useState('checkout.session.completed');
  const [dispatchNotice, setDispatchNotice] = useState(null);
  const [copiedText, setCopiedText] = useState(false);

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Configure your LMS platform settings</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24 }}>
        {/* Settings Nav */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                borderRadius: 'var(--radius-md)', textAlign: 'left', fontSize: 13, fontWeight: 500,
                background: activeTab === tab.id ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
                color: activeTab === tab.id ? 'var(--cyan)' : 'var(--text-secondary)',
                border: activeTab === tab.id ? '1px solid rgba(6, 182, 212, 0.2)' : '1px solid transparent',
                transition: 'all var(--transition-fast)',
              }}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="glass-card-static">
          {activeTab === 'appearance' && (
            <div>
              <h3 style={{ marginBottom: 8 }}>Appearance & Theme Configuration</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 24 }}>
                Choose the visual style for your LMS. Both dark glassmorphism and multi-color consistent light theme are fully supported.
              </p>

              {/* Theme selector cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, marginBottom: 32 }}>
                {/* Dark Theme Card */}
                <div
                  onClick={() => setTheme('dark')}
                  style={{
                    background: '#091820',
                    border: theme === 'dark' ? '2px solid var(--cyan)' : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 20,
                    cursor: 'pointer',
                    boxShadow: theme === 'dark' ? '0 0 20px rgba(6, 182, 212, 0.3)' : 'none',
                    transition: 'all var(--transition-normal)',
                    position: 'relative'
                  }}
                >
                  {theme === 'dark' && (
                    <div style={{
                      position: 'absolute', top: 12, right: 12, width: 22, height: 22,
                      borderRadius: '50%', background: 'var(--cyan)', color: '#000',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Check size={14} strokeWidth={3} />
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 'var(--radius-md)',
                      background: 'rgba(6, 182, 212, 0.2)', color: 'var(--cyan)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Moon size={18} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, color: '#f1f5f9', fontSize: 15 }}>Dark Glassmorphism</h4>
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>High-tech, immersive glow</span>
                    </div>
                  </div>
                  <div style={{
                    background: 'rgba(13, 31, 40, 0.7)',
                    borderRadius: 8,
                    padding: 12,
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6
                  }}>
                    <div style={{ height: 14, width: '60%', background: '#06b6d4', borderRadius: 4 }} />
                    <div style={{ height: 8, width: '90%', background: 'rgba(255,255,255,0.2)', borderRadius: 3 }} />
                    <div style={{ height: 8, width: '40%', background: 'rgba(255,255,255,0.1)', borderRadius: 3 }} />
                  </div>
                </div>

                {/* Light Theme Card */}
                <div
                  onClick={() => setTheme('light')}
                  style={{
                    background: '#ffffff',
                    border: theme === 'light' ? '2px solid #0284c7' : '1px solid #cbd5e1',
                    borderRadius: 'var(--radius-lg)',
                    padding: 20,
                    cursor: 'pointer',
                    boxShadow: theme === 'light' ? '0 0 20px rgba(2, 132, 199, 0.25)' : 'none',
                    transition: 'all var(--transition-normal)',
                    position: 'relative'
                  }}
                >
                  {theme === 'light' && (
                    <div style={{
                      position: 'absolute', top: 12, right: 12, width: 22, height: 22,
                      borderRadius: '50%', background: '#0284c7', color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Check size={14} strokeWidth={3} />
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 'var(--radius-md)',
                      background: 'rgba(2, 132, 199, 0.12)', color: '#0284c7',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Sun size={18} style={{ color: '#d97706' }} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, color: '#0f172a', fontSize: 15 }}>Consistent Light Theme</h4>
                      <span style={{ fontSize: 11, color: '#64748b' }}>Clean, multi-color & crisp</span>
                    </div>
                  </div>
                  <div style={{
                    background: '#f8fafc',
                    borderRadius: 8,
                    padding: 12,
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6
                  }}>
                    <div style={{ height: 14, width: '60%', background: '#0284c7', borderRadius: 4 }} />
                    <div style={{ height: 8, width: '90%', background: '#94a3b8', borderRadius: 3 }} />
                    <div style={{ height: 8, width: '40%', background: '#cbd5e1', borderRadius: 3 }} />
                  </div>
                </div>
              </div>

              {/* Color Pattern Rules & Legend */}
              <h4 style={{ fontSize: 14, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Palette size={16} style={{ color: 'var(--cyan)' }} />
                Consistent Color Patterns across all themes
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 24 }}>
                <div style={{ padding: 12, borderRadius: 'var(--radius-md)', border: 'var(--border-subtle)', background: 'var(--glass-surface)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--cyan)' }} />
                    <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--cyan)' }}>Cyan / Sky</span>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Primary actions, active links, tabs, focus borders</span>
                </div>

                <div style={{ padding: 12, borderRadius: 'var(--radius-md)', border: 'var(--border-subtle)', background: 'var(--glass-surface)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--emerald)' }} />
                    <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--emerald)' }}>Emerald Green</span>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Completion, passing scores, published status, progress bars</span>
                </div>

                <div style={{ padding: 12, borderRadius: 'var(--radius-md)', border: 'var(--border-subtle)', background: 'var(--glass-surface)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--purple)' }} />
                    <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--purple)' }}>Purple / Violet</span>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Quizzes, certificates, interactive checkpoints</span>
                </div>

                <div style={{ padding: 12, borderRadius: 'var(--radius-md)', border: 'var(--border-subtle)', background: 'var(--glass-surface)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--amber)' }} />
                    <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--amber)' }}>Amber / Gold</span>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Ratings, handbook PDFs, pricing chips, draft badges</span>
                </div>

                <div style={{ padding: 12, borderRadius: 'var(--radius-md)', border: 'var(--border-subtle)', background: 'var(--glass-surface)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--red)' }} />
                    <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--red)' }}>Rose / Red</span>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Danger states, video lectures, deadline notifications</span>
                </div>

                <div style={{ padding: 12, borderRadius: 'var(--radius-md)', border: 'var(--border-subtle)', background: 'var(--glass-surface)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--teal)' }} />
                    <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--teal)' }}>Teal</span>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Checklists, task milestones, curriculum perks</span>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'organisation' && (
            <div>
              <h3 style={{ marginBottom: 20 }}>Organisation Settings</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <SettingField label="Organisation Name" value="Evergreen Training" />
                <SettingField label="Contact Email" value="admin@traininglms.com" />
                <SettingField label="Timezone" value="UTC" type="select" options={['UTC', 'EST', 'PST', 'GMT']} />
                <SettingField label="Currency" value="USD" type="select" options={['USD', 'EUR', 'GBP', 'AUD']} />
                <SettingField label="Default Language" value="English" type="select" options={['English', 'Spanish', 'French']} />
              </div>
            </div>
          )}
          {activeTab === 'gateways' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0' }}>Multi-Gateway Payment Configuration</h3>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
                    Configure credentials and account settings for supported global and local checkout providers.
                  </p>
                </div>
              </div>

              {/* Gateway Sub-tabs */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 20, borderBottom: 'var(--border-subtle)', paddingBottom: 12 }}>
                {[
                  { id: 'stripe', label: 'Stripe Card' },
                  { id: 'paypal', label: 'PayPal' },
                  { id: 'razorpay', label: 'Razorpay' },
                  { id: 'local', label: 'Local Wallets / Wire' },
                ].map(gw => (
                  <button
                    key={gw.id}
                    type="button"
                    onClick={() => setGatewaySubTab(gw.id)}
                    className={`btn btn-sm ${gatewaySubTab === gw.id ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: 12 }}
                  >
                    {gw.label}
                  </button>
                ))}
              </div>

              {gatewaySubTab === 'stripe' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                    <span className="badge badge-draft">Test Mode</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Accepts international Visa, Mastercard, AMEX</span>
                  </div>
                  <SettingField label="Publishable Key" value="pk_test_51MzDemoEvergreenKey99" />
                  <SettingField label="Secret Key" value="sk_test_••••••••••••••••" type="password" />
                  <SettingField label="Webhook Secret" value="whsec_••••••••••••••••" type="password" />
                  <SettingField label="Webhook Endpoint" value="https://api.traininglms.com/stripe/webhook" readOnly />
                </div>
              )}

              {gatewaySubTab === 'paypal' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                    <span className="badge badge-active" style={{ background: 'rgba(31, 187, 210, 0.15)', color: 'var(--cyan)' }}>Sandbox Active</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Express Checkout & PayPal Wallet</span>
                  </div>
                  <SettingField label="Client ID" value="AbcXYZ-PayPalDemoClientID-Sandbox" />
                  <SettingField label="Secret Key" value="EKey_••••••••••••••••" type="password" />
                  <SettingField label="Merchant Email" value="payments@traininglms.com" />
                  <SettingField label="Environment" value="Sandbox" type="select" options={['Sandbox', 'Live Production']} />
                </div>
              )}

              {gatewaySubTab === 'razorpay' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                    <span className="badge badge-active" style={{ background: 'rgba(243, 156, 18, 0.15)', color: 'var(--amber)' }}>UPI & NetBanking</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Supports INR payments, UPI QR codes, and Wallets</span>
                  </div>
                  <SettingField label="Key ID" value="rzp_test_90XdemoEvergreen" />
                  <SettingField label="Key Secret" value="rzp_secret_••••••••••••" type="password" />
                  <SettingField label="Webhook Secret" value="whsec_rzp_••••••••••••" type="password" />
                  <SettingField label="Default Currency" value="INR" type="select" options={['INR', 'USD']} />
                </div>
              )}

              {gatewaySubTab === 'local' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                    <span className="badge badge-active" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--emerald)' }}>Instant Mobile Verification</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Supports bKash, Nagad, Rocket, and Bank Wire receipts</span>
                  </div>
                  <SettingField label="bKash Merchant / Personal No." value="+880 1819-200300" />
                  <SettingField label="Nagad Merchant / Personal No." value="+880 1712-400500" />
                  <SettingField label="Rocket Account No." value="+880 1911-600700" />
                  <SettingField label="Bank Name & Wire Swift" value="Standard Chartered Bank — SWIFT: SCBLBDDX" />
                  <SettingField label="Account Title & Number" value="Training LMS Global Inc. — A/C: 01-9876543-01" />
                </div>
              )}
            </div>
          )}

          {activeTab === 'webhooks' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0' }}>Webhooks & API Event Stream</h3>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
                    Inspect real-time gateway notifications, cryptographic HMAC signatures, and test event lifecycles.
                  </p>
                </div>

                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px',
                  background: 'rgba(31, 187, 210, 0.1)', border: '1px solid rgba(31, 187, 210, 0.3)',
                  borderRadius: 'var(--radius-md)', fontSize: 12
                }}>
                  <Terminal size={14} style={{ color: 'var(--cyan)' }} />
                  <span style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                    https://api.traininglms.com/webhooks/listener
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText('https://api.traininglms.com/webhooks/listener');
                      setCopiedText(true);
                      setTimeout(() => setCopiedText(false), 2000);
                    }}
                    style={{ background: 'transparent', border: 'none', color: 'var(--cyan)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    title="Copy endpoint URL"
                  >
                    {copiedText ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              {/* Interactive Dispatcher Card */}
              <div style={{
                padding: '16px 20px', background: 'var(--glass-surface)',
                borderRadius: 'var(--radius-md)', border: '1px solid rgba(243, 156, 18, 0.3)',
                marginBottom: 24
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Zap size={18} style={{ color: 'var(--amber)' }} />
                  <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                    Interactive Webhook Dispatcher & Simulator
                  </h4>
                </div>
                <p style={{ margin: '0 0 16px 0', fontSize: 12, color: 'var(--text-secondary)' }}>
                  Trigger simulated inbound webhook events from Stripe, PayPal, Razorpay, or Local Wallets to test real-time server handler callbacks and signature validation.
                </p>

                {dispatchNotice && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px',
                    borderRadius: 'var(--radius-sm)', background: 'rgba(16, 185, 129, 0.15)',
                    color: 'var(--emerald)', fontSize: 12, marginBottom: 14
                  }}>
                    <CheckCircle2 size={16} /> {dispatchNotice}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
                      Payment Gateway
                    </label>
                    <select
                      className="select select-sm"
                      value={testGateway}
                      onChange={e => {
                        const gw = e.target.value;
                        setTestGateway(gw);
                        if (gw === 'Stripe') setTestEventType('checkout.session.completed');
                        else if (gw === 'PayPal') setTestEventType('CHECKOUT.ORDER.APPROVED');
                        else if (gw === 'Razorpay') setTestEventType('payment.captured');
                        else setTestEventType('wallet.transaction.verified');
                      }}
                      style={{ width: 140 }}
                    >
                      <option value="Stripe">Stripe</option>
                      <option value="PayPal">PayPal</option>
                      <option value="Razorpay">Razorpay</option>
                      <option value="Local">Local Wallet</option>
                    </select>
                  </div>

                  <div style={{ flex: 1, minWidth: 220 }}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
                      Event Type
                    </label>
                    <select
                      className="select select-sm"
                      value={testEventType}
                      onChange={e => setTestEventType(e.target.value)}
                    >
                      {testGateway === 'Stripe' && (
                        <>
                          <option value="checkout.session.completed">checkout.session.completed (Success)</option>
                          <option value="payment_intent.succeeded">payment_intent.succeeded (Direct Charge)</option>
                          <option value="charge.refunded">charge.refunded (Reversal)</option>
                          <option value="payment_intent.payment_failed">payment_intent.payment_failed (Decline)</option>
                        </>
                      )}
                      {testGateway === 'PayPal' && (
                        <>
                          <option value="CHECKOUT.ORDER.APPROVED">CHECKOUT.ORDER.APPROVED (Authorized)</option>
                          <option value="PAYMENT.CAPTURE.COMPLETED">PAYMENT.CAPTURE.COMPLETED (Settled)</option>
                          <option value="PAYMENT.CAPTURE.DENIED">PAYMENT.CAPTURE.DENIED (Failed)</option>
                        </>
                      )}
                      {testGateway === 'Razorpay' && (
                        <>
                          <option value="payment.captured">payment.captured (UPI Succeeded)</option>
                          <option value="order.paid">order.paid (Order Complete)</option>
                          <option value="refund.processed">refund.processed (Refund Complete)</option>
                        </>
                      )}
                      {testGateway === 'Local' && (
                        <>
                          <option value="wallet.transaction.verified">wallet.transaction.verified (bKash/Nagad Match)</option>
                          <option value="bank.transfer.cleared">bank.transfer.cleared (Swift Deposit Cleared)</option>
                        </>
                      )}
                    </select>
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      const log = triggerTestWebhook({ gateway: testGateway, eventType: testEventType });
                      setDispatchNotice(`Dispatched "${testEventType}" event #${log.id}. Response: 200 OK (HMAC Verified).`);
                      setTimeout(() => setDispatchNotice(null), 5000);
                    }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    <Zap size={14} /> Dispatch Test Event
                  </button>
                </div>
              </div>

              {/* Event Logs Stream Table */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                  Inbound Webhook Delivery Log ({(webhookLogs || []).length} Events)
                </h4>
                <span className="badge badge-active" style={{ fontSize: 11 }}>
                  Live Listener Active
                </span>
              </div>

              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '25%', minWidth: 160 }}>Event ID & Gateway</th>
                      <th style={{ width: '30%', minWidth: 200 }}>Event Type</th>
                      <th style={{ width: '20%', minWidth: 140 }}>Status & Code</th>
                      <th style={{ width: '15%', minWidth: 130 }}>Timestamp</th>
                      <th style={{ width: '10%', minWidth: 100, textAlign: 'center' }}>Payload</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(webhookLogs || []).map(wh => (
                      <tr key={wh.id}>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                            {wh.id}
                          </div>
                          <span style={{
                            padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700,
                            background: 'rgba(31, 187, 210, 0.15)', color: 'var(--cyan)'
                          }}>
                            {wh.gateway}
                          </span>
                        </td>

                        <td>
                          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                            {wh.eventType}
                          </span>
                        </td>

                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span className="badge badge-active" style={{ fontSize: 10 }}>
                              <CheckCircle2 size={10} /> {wh.status}
                            </span>
                            <span style={{ fontSize: 11, color: 'var(--emerald)', fontWeight: 700 }}>
                              {wh.responseCode} OK
                            </span>
                          </div>
                        </td>

                        <td style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {new Date(wh.receivedAt).toLocaleTimeString('en-US', {
                            hour: '2-digit', minute: '2-digit', second: '2-digit'
                          })}
                        </td>

                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => setSelectedWebhook(wh)}
                            className="btn btn-secondary btn-sm"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '3px 8px' }}
                          >
                            <Code size={12} /> Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Webhook JSON Payload Inspector Modal */}
          {selectedWebhook && (
            <div className="modal-backdrop" onClick={() => setSelectedWebhook(null)}>
              <div className="modal-dialog modal-lg" onClick={e => e.stopPropagation()} style={{ maxWidth: 680 }}>
                <div className="modal-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Code size={20} style={{ color: 'var(--cyan)' }} />
                    <div>
                      <h3 style={{ margin: 0, fontSize: 16 }}>Webhook Event Details: {selectedWebhook.id}</h3>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {selectedWebhook.gateway} • {selectedWebhook.eventType}
                      </span>
                    </div>
                  </div>
                  <button className="btn btn-ghost btn-icon" onClick={() => setSelectedWebhook(null)}>
                    <Check size={18} />
                  </button>
                </div>

                <div className="modal-body" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
                      Cryptographic Signature (HMAC SHA-256)
                    </div>
                    <div style={{
                      padding: '8px 12px', background: 'rgba(0,0,0,0.3)', borderRadius: 6,
                      fontSize: 11, fontFamily: 'monospace', color: 'var(--cyan)', wordBreak: 'break-all'
                    }}>
                      {selectedWebhook.signature}
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>
                        Raw JSON Payload
                      </span>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => {
                          navigator.clipboard?.writeText(JSON.stringify(selectedWebhook.payload, null, 2));
                        }}
                        style={{ fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                      >
                        <Copy size={12} /> Copy JSON
                      </button>
                    </div>

                    <pre style={{
                      padding: 14, background: '#07121a', border: 'var(--border-subtle)',
                      borderRadius: 8, fontSize: 12, color: '#38bdf8', overflowX: 'auto',
                      maxHeight: 280, lineHeight: 1.5, margin: 0
                    }}>
                      {JSON.stringify(selectedWebhook.payload, null, 2)}
                    </pre>
                  </div>
                </div>

                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setSelectedWebhook(null)}>
                    Close Inspector
                  </button>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'email' && (
            <div>
              <h3 style={{ marginBottom: 20 }}>Email Configuration</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <SettingField label="SMTP Host" value="smtp.mailgun.org" />
                <SettingField label="SMTP Port" value="587" />
                <SettingField label="From Address" value="noreply@traininglms.com" />
                <SettingField label="Reply-To" value="support@traininglms.com" />
              </div>
            </div>
          )}
          {activeTab === 'certificates' && (
            <div>
              <h3 style={{ marginBottom: 20 }}>Certificate Settings</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <SettingField label="Default Template" value="Professional Dark" type="select" options={['Professional Dark', 'Classic Light', 'Modern Gradient']} />
                <SettingField label="Number Format" value="CERT-YYYY-CODE-RANDOM" readOnly />
                <SettingField label="Verification URL" value="https://traininglms.com/verify/" readOnly />
                <SettingField label="Include QR Code" value="Yes" type="select" options={['Yes', 'No']} />
              </div>
            </div>
          )}
          {activeTab === 'security' && (
            <div>
              <h3 style={{ marginBottom: 20 }}>Security Settings</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <SettingField label="Admin MFA" value="Required" type="select" options={['Required', 'Optional', 'Disabled']} />
                <SettingField label="Min Password Length" value="12" />
                <SettingField label="Session Timeout" value="24 hours" type="select" options={['1 hour', '4 hours', '12 hours', '24 hours']} />
                <SettingField label="Rate Limiting" value="Enabled" type="select" options={['Enabled', 'Disabled']} />
              </div>
            </div>
          )}
          {activeTab === 'storage' && (
            <div>
              <h3 style={{ marginBottom: 20 }}>Storage Configuration</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <SettingField label="Provider" value="Amazon S3" type="select" options={['Amazon S3', 'Google Cloud Storage', 'Azure Blob']} />
                <SettingField label="Max Upload Size" value="500 MB" type="select" options={['100 MB', '250 MB', '500 MB', '1 GB']} />
                <SettingField label="Allowed Types" value="Video, PDF, PPTX, Images" readOnly />
                <div style={{ padding: '16px', background: 'rgba(0,0,0,0.15)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Storage Used</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>124 GB / 500 GB</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: '24.8%' }} />
                  </div>
                </div>
              </div>
            </div>
          )}
          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-primary"><Save size={16} /> Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingField({ label, value, type = 'text', options, readOnly }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>{label}</label>
      {type === 'select' ? (
        <select className="select" defaultValue={value} style={{ maxWidth: 400 }}>
          {options?.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input className="input" type={type === 'password' ? 'password' : 'text'} defaultValue={value} readOnly={readOnly}
          style={{ maxWidth: 400, opacity: readOnly ? 0.7 : 1 }} />
      )}
    </div>
  );
}
