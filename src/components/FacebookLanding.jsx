import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import logo from "../assets/images/logo.png";

const formatDate = (d) => {
  const date = new Date(d);
  const now = new Date();
  const diff = now - date;
  if (diff < 60000) return "Upravo";
  if (diff < 3600000) return `Pre ${Math.floor(diff / 60000)} min`;
  if (diff < 86400000) return `Pre ${Math.floor(diff / 3600000)} h`;
  return date.toLocaleDateString("sr-Latn", { day: "numeric", month: "short", year: "numeric" });
};

const PREVIEW_LEN = 65;

export default function FacebookLanding() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userEmail = searchParams.get("email")?.trim() || null;
  const bypass = searchParams.get("bypass")?.trim() || "";
  const adminBypass = import.meta.env.VITE_ADMIN_BYPASS?.trim() || "";
  const hasAccess = userEmail || import.meta.env.DEV || (adminBypass && bypass === adminBypass);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const [modalPost, setModalPost] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    const fetchPosts = async () => {
      const { data, error } = await supabase.rpc("get_my_posts", { p_user_email: userEmail || null });
      if (!error) {
        setPosts(data || []);
        setLoading(false);
        return;
      }
      let q = supabase.from("generated_posts").select("id, content, prompt, metadata, created_at").eq("platform", "facebook");
      if (userEmail) q = q.eq("user_email", userEmail);
      const fallback = await q.order("created_at", { ascending: false }).limit(20);
      if (!fallback.error) setPosts(fallback.data || []);
      setLoading(false);
    };
    fetchPosts();
  }, [userEmail]);

  const copy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async () => {
    if (!modalPost || !supabase || deleting) return;
    if (!confirm("Da li ste sigurni da želite da obrišete ovu objavu?")) return;
    setDeleting(true);
    try {
      const { error } = await supabase.rpc("delete_my_post", { p_id: modalPost.id, p_user_email: userEmail || null });
      if (!error) {
        setPosts((prev) => prev.filter((p) => p.id !== modalPost.id));
        setModalPost(null);
      } else {
        const { error: delError } = await supabase.from("generated_posts").delete().eq("id", modalPost.id);
        if (!delError) {
          setPosts((prev) => prev.filter((p) => p.id !== modalPost.id));
          setModalPost(null);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(165deg, #0f1419 0%, #141a22 35%, #12171f 70%, #0e1218 100%)", fontFamily: "'Plus Jakarta Sans',sans-serif", color: "white", padding: "clamp(24px, 5vw, 60px) clamp(16px, 4vw, 24px) clamp(40px, 8vw, 80px)", position: "relative", overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <style>{`
        body { margin: 0; padding: 0; background: #0f1419; }
        * { box-sizing: border-box; }
        .post-item:hover .arrow { transform: translateX(4px); color: rgba(255,255,255,0.7) !important; }
      `}</style>
      {/* Ambient glow - jači za svetliji osećaj */}
      <div style={{ position: "absolute", top: -80, left: "50%", transform: "translateX(-50%)", width: 700, height: 450, background: "radial-gradient(ellipse, rgba(59,127,245,0.18) 0%, rgba(226,105,42,0.08) 35%, transparent 65%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -50, right: -80, width: 500, height: 350, background: "radial-gradient(ellipse, rgba(226,105,42,0.12) 0%, transparent 55%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "40%", left: -150, width: 350, height: 350, background: "radial-gradient(circle, rgba(59,127,245,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div className="fb-landing-grid" style={{ maxWidth: 960, margin: "0 auto", position: "relative", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "stretch", minHeight: "calc(100vh - 140px)", justifyContent: "center", alignContent: "center" }}>
        {/* Levo: Kreiraj objavu */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ background: "linear-gradient(145deg, rgba(59,127,245,0.14) 0%, rgba(226,105,42,0.06) 50%, rgba(255,255,255,0.02) 100%)", padding: "40px", borderRadius: 28, border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 8px 48px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", width: "100%", height: 400 }}>
            <img src={logo} alt="Logo" style={{ width: 140, height: 140, objectFit: "contain", marginBottom: 32, filter: "drop-shadow(0 12px 32px rgba(0,0,0,0.4))" }} />
          <button
            onClick={() => hasAccess && navigate(userEmail ? `/facebook-objava?email=${encodeURIComponent(userEmail)}` : bypass ? `/facebook-objava?bypass=${encodeURIComponent(bypass)}` : "/facebook-objava")}
            disabled={!hasAccess}
            style={{
              padding: "18px 40px",
              background: "linear-gradient(135deg, #fff 0%, #f0f4ff 100%)",
              border: "none",
              borderRadius: 100,
              color: "#090b11",
              fontSize: 18,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
              boxShadow: "0 6px 32px rgba(59,127,245,0.3), 0 4px 16px rgba(0,0,0,0.2)",
              transition: "all 0.25s ease",
              display: "inline-flex",
              alignItems: "center",
              gap: 12
            }}
            onMouseEnter={(e) => {
              if (hasAccess) {
                e.target.style.transform = "translateY(-4px) scale(1.03)";
                e.target.style.boxShadow = "0 16px 48px rgba(226,105,42,0.35), 0 8px 24px rgba(0,0,0,0.25)";
                e.target.style.background = "linear-gradient(135deg, #fff 0%, #ffe8dc 100%)";
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "none";
              e.target.style.boxShadow = "0 6px 32px rgba(59,127,245,0.3), 0 4px 16px rgba(0,0,0,0.2)";
              e.target.style.background = "linear-gradient(135deg, #fff 0%, #f0f4ff 100%)";
            }}
          >
            <span style={{ fontSize: 20 }}>✨</span> Započni novu objavu
          </button>
          </div>
        </div>

        {/* Desno: Istorija */}
        <div style={{ background: "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 28, padding: 32, display: "flex", flexDirection: "column", height: 400, boxShadow: "0 24px 80px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, paddingBottom: 12, flexShrink: 0 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.7)", letterSpacing: 0.2 }}>
              Istorija
            </h2>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>
              {posts.length} sačuvano
            </span>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: 32, color: "rgba(255,255,255,0.4)" }}>
              <div style={{ width: 24, height: 24, border: "2px solid rgba(59,127,245,0.2)", borderTopColor: "#3b7ff5", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 12px" }} />
              <span style={{ fontSize: 14 }}>Učitavam istoriju...</span>
            </div>
          ) : posts.length === 0 ? (
            <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, padding: "24px 0" }}>
              Nemate prethodno kreiranih objava
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1, overflowY: "auto", paddingRight: 4 }}>
              {posts.map((p) => {
                const raw = p.content.replace(/\s+/g, " ").trim();
                const preview = raw.length > PREVIEW_LEN ? raw.slice(0, PREVIEW_LEN) + "…" : raw;
                return (
                  <div
                    key={p.id}
                    className="post-item"
                    onClick={() => setModalPost(p)}
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: 16,
                      padding: "16px",
                      transition: "all 0.2s ease",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: 10,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)";
                      e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                      e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", flex: 1, minWidth: 0 }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "rgba(59,127,245,0.6)", flexShrink: 0 }} />
                      <span style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.5)", flexShrink: 0 }}>
                        {formatDate(p.created_at)}
                      </span>
                      {p.metadata?.tone && (
                        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", background: "rgba(255,255,255,0.06)", padding: "2px 6px", borderRadius: 6, flexShrink: 0 }}>
                          {p.metadata.tone}
                        </span>
                      )}
                      <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, minWidth: 0 }}>
                        {preview}
                      </span>
                    </div>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", flexShrink: 0 }}>→</span>
                  </div>
                );
              })}
            </div>
          )}

        {/* Modal */}
        {modalPost && (
          <div
            onClick={() => setModalPost(null)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.75)",
              backdropFilter: "blur(12px)",
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "clamp(16px, 4vw, 24px)",
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "linear-gradient(180deg, #12161e 0%, #0d1117 100%)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 24,
                maxWidth: 560,
                width: "100%",
                maxHeight: "85vh",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(59,127,245,0.1)",
              }}
            >
              <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "linear-gradient(135deg, #3b7ff5, #5b9aff)", boxShadow: "0 0 10px rgba(59,127,245,0.4)" }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.55)" }}>{formatDate(modalPost.created_at)}</span>
                  {modalPost.metadata?.tone && (
                    <span style={{ fontSize: 11, color: "rgba(226,105,42,0.95)", background: "rgba(226,105,42,0.12)", padding: "4px 10px", borderRadius: 10, border: "1px solid rgba(226,105,42,0.2)", fontWeight: 600 }}>{modalPost.metadata.tone}</span>
                  )}
                </div>
                <button
                  onClick={() => setModalPost(null)}
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, width: 36, height: 36, color: "rgba(255,255,255,0.7)", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit" }}
                >
                  ×
                </button>
              </div>
              <div style={{ padding: 24, overflowY: "auto", flex: 1 }}>
                <p style={{ fontSize: 15, lineHeight: 1.8, color: "rgba(255,255,255,0.9)", whiteSpace: "pre-wrap", margin: "0 0 24px" }}>
                  {modalPost.content}
                </p>
                {modalPost.prompt && (
                  <div style={{ marginBottom: 24, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Originalni prompt</p>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.5, margin: 0 }}>"{modalPost.prompt}"</p>
                  </div>
                )}
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                  <button
                    onClick={() => copy(modalPost.content, modalPost.id)}
                    style={{
                      minWidth: 120,
                      background: copiedId === modalPost.id ? "rgba(34,197,94,0.15)" : "linear-gradient(135deg, rgba(59,127,245,0.15), rgba(226,105,42,0.08))",
                      border: `1px solid ${copiedId === modalPost.id ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.1)"}`,
                      borderRadius: 12,
                      padding: "12px 24px",
                      color: copiedId === modalPost.id ? "#4ade80" : "rgba(255,255,255,0.9)",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      transition: "all 0.2s",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8
                    }}
                  >
                    {copiedId === modalPost.id ? "✓ Kopirano" : "⎘ Kopiraj"}
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    style={{
                      minWidth: 120,
                      background: "rgba(239,68,68,0.1)",
                      border: "1px solid rgba(239,68,68,0.3)",
                      borderRadius: 12,
                      padding: "12px 24px",
                      color: "#fca5a5",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: deleting ? "not-allowed" : "pointer",
                      fontFamily: "inherit",
                      transition: "all 0.2s",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8
                    }}
                    onMouseEnter={e => { if(!deleting) { e.currentTarget.style.background = "rgba(239,68,68,0.2)"; } }}
                    onMouseLeave={e => { if(!deleting) { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; } }}
                  >
                    {deleting ? "⟳ Brisanje..." : "🗑 Obriši"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .fb-landing-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
