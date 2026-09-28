import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLms } from '../../context/LmsContext';
import ThemeToggle from '../../components/ThemeToggle';
import {
  Award, ShieldCheck, CheckCircle2, AlertCircle, Search,
  Calendar, GraduationCap, ArrowRight, Download, Share2,
  ExternalLink, Sparkles, Lock
} from 'lucide-react';

export default function CertificateVerification() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { certificates, courses } = useLms();
  const [searchCode, setSearchCode] = useState(code || '');
  const [searchedCode, setSearchedCode] = useState(code || '');

  useEffect(() => {
    if (code) {
      setSearchCode(code);
      setSearchedCode(code);
    }
  }, [code]);

  const certificate = certificates.find(c =>
    (c.verificationCode && c.verificationCode.toLowerCase() === (searchedCode || '').toLowerCase().trim()) ||
    (c.certificateNumber && c.certificateNumber.toLowerCase() === (searchedCode || '').toLowerCase().trim())
  );

  const matchedCourse = certificate ? courses.find(c => c.id === certificate.courseId) : null;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchCode.trim()) {
      setSearchedCode(searchCode.trim());
      navigate(`/verify/${encodeURIComponent(searchCode.trim())}`, { replace: true });
    }
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-gradient)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Top Navbar */}
      <header className="topbar" style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: 'var(--border-subtle)', background: 'var(--topbar-bg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingLeft: 16 }}>
          <div className="sidebar-brand-icon" style={{ width: 36, height: 36 }}>
            <GraduationCap size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Evergreen LMS</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Autonomous Credential Verification</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingRight: 16 }}>
          <ThemeToggle />
          <Link to="/courses" className="btn btn-secondary btn-sm">
            Explore Courses
          </Link>
          <Link to="/admin" className="btn btn-primary btn-sm">
            Admin Portal
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ flex: 1, maxWidth: 900, margin: '0 auto', width: '100%', padding: '48px 20px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 14px',
            borderRadius: 999,
            background: 'rgba(6, 182, 212, 0.12)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            color: 'var(--cyan)',
            fontSize: 12,
            fontWeight: 600,
            marginBottom: 16
          }}>
            <ShieldCheck size={16} /> Official Public Verification Registry
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: 12 }}>
            Verify Learner Credentials
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15, maxWidth: 580, margin: '0 auto' }}>
            Evergreen self-service certificates are cryptographically tracked and tamper-evident. Enter a Certificate ID or Verification Hash to confirm validity.
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearch} style={{ maxWidth: 560, margin: '28px auto 0', display: 'flex', gap: 8 }}>
            <div className="input-with-icon" style={{ flex: 1 }}>
              <Search className="input-icon" size={18} />
              <input
                className="input"
                style={{ height: 46, fontSize: 14 }}
                placeholder="Enter Verification Code (e.g. VRF-7A3F9B2E) or Cert #"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '0 24px', height: 46 }}>
              Verify
            </button>
          </form>

          {/* Quick sample chips */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Try demo hashes:</span>
            {certificates.slice(0, 3).map(c => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setSearchCode(c.verificationCode);
                  setSearchedCode(c.verificationCode);
                  navigate(`/verify/${c.verificationCode}`, { replace: true });
                }}
                className="badge"
                style={{
                  cursor: 'pointer',
                  background: 'rgba(255,255,255,0.04)',
                  borderColor: 'rgba(255,255,255,0.1)',
                  color: 'var(--cyan)',
                  fontFamily: 'monospace',
                  fontSize: 11
                }}
              >
                {c.verificationCode}
              </button>
            ))}
          </div>
        </div>

        {/* Verification Result Card */}
        {searchedCode && (
          certificate ? (
            <div className="glass-card" style={{
              padding: 0,
              overflow: 'hidden',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              boxShadow: '0 0 35px -10px rgba(16, 185, 129, 0.25)'
            }}>
              {/* Authenticated Banner */}
              <div style={{
                background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.18), rgba(6, 182, 212, 0.12))',
                padding: '20px 28px',
                borderBottom: 'var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: 'rgba(16, 185, 129, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--emerald)',
                    boxShadow: '0 0 16px rgba(16, 185, 129, 0.4)'
                  }}>
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--emerald)' }}>
                      Verified Credential
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
                      Valid & Authenticated
                    </div>
                  </div>
                </div>
                <div style={{
                  padding: '6px 14px',
                  borderRadius: 999,
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: 'var(--emerald)',
                  fontSize: 12,
                  fontFamily: 'monospace',
                  fontWeight: 600
                }}>
                  STATE: ACTIVE / ISSUED
                </div>
              </div>

              {/* Certificate Inner Canvas */}
              <div style={{
                padding: '40px 32px',
                background: 'radial-gradient(ellipse at 50% 20%, rgba(245, 158, 11, 0.05), transparent 60%)'
              }}>
                <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 36px' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: '50%', background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)', color: 'var(--amber)', marginBottom: 16 }}>
                    <Award size={36} />
                  </div>
                  <div style={{ fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--amber)', fontWeight: 700, marginBottom: 8 }}>
                    Certificate of Competence & Completion
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 12 }}>
                    This certifies that
                  </p>
                  <h2 style={{ fontSize: 32, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 12 }}>
                    {certificate.studentName}
                  </h2>
                  <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 8 }}>
                    has successfully satisfied all autonomous self-service curriculum requirements for
                  </p>
                  <h3 style={{ fontSize: 22, fontWeight: 800, color: 'var(--cyan)', marginBottom: 12 }}>
                    {certificate.courseName}
                  </h3>
                  <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 999, background: 'rgba(255,255,255,0.06)', border: 'var(--border-subtle)', fontSize: 12, color: 'var(--text-secondary)' }}>
                    Curriculum Release Version v{certificate.courseVersion}
                  </div>
                </div>

                {/* Details Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: 16,
                  padding: 24,
                  background: 'rgba(13, 31, 40, 0.5)',
                  borderRadius: 'var(--radius-lg)',
                  border: 'var(--border-subtle)',
                  marginBottom: 28
                }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                      Certificate ID
                    </div>
                    <div style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--cyan)', fontSize: 13 }}>
                      {certificate.certificateNumber}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                      Verification Hash
                    </div>
                    <div style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--emerald)', fontSize: 13 }}>
                      {certificate.verificationCode}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                      Issue Date
                    </div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>
                      {formatDate(certificate.issuedAt)}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                      Issuing Authority
                    </div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>
                      Evergreen Self-Service Engine
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 12 }}>
                    <Lock size={14} style={{ color: 'var(--emerald)' }} />
                    <span>Server-authoritative evaluation completed with 100% threshold</span>
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    {matchedCourse && (
                      <Link to={`/course/${matchedCourse.slug}`} className="btn btn-secondary btn-sm">
                        View Course Syllabus <ExternalLink size={14} />
                      </Link>
                    )}
                    <button
                      onClick={() => window.print()}
                      className="btn btn-primary btn-sm"
                    >
                      <Download size={14} /> Print / Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card" style={{
              textAlign: 'center',
              padding: '60px 24px',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              boxShadow: '0 0 35px -10px rgba(239, 68, 68, 0.2)'
            }}>
              <div style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--crimson)',
                margin: '0 auto 18px'
              }}>
                <AlertCircle size={32} />
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
                Certificate Not Found
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, maxWidth: 500, margin: '0 auto 24px' }}>
                We could not locate any issued certificate matching the code <strong style={{ color: 'var(--crimson)', fontFamily: 'monospace' }}>"{searchedCode}"</strong> in our verification ledger. Please verify the code or check with the credential recipient.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                <button
                  onClick={() => {
                    setSearchCode('');
                    setSearchedCode('');
                    navigate('/verify', { replace: true });
                  }}
                  className="btn btn-secondary"
                >
                  Clear Search
                </button>
                <Link to="/courses" className="btn btn-primary">
                  Browse Catalog
                </Link>
              </div>
            </div>
          )
        )}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: 'var(--border-subtle)', padding: '24px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, background: 'var(--glass-surface)' }}>
        Evergreen Self-Service Training LMS • Built with Server-Authoritative Verification • No Manual Intermediaries
      </footer>
    </div>
  );
}
