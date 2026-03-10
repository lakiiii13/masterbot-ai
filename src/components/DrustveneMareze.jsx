import { useState } from "react";
import { useNavigate } from "react-router-dom";

// ─── Icons ───────────────────────────────────────────────────────────────────
const IconHeart = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);
const IconThumb = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
    <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
  </svg>
);
const IconShield = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const IconIn = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);
const IconGrid = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>
);
const IconFbCircle = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/>
  </svg>
);
const IconImage = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
);
const IconChevron = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);
const IconSparkle = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z"/>
  </svg>
);
const IconCopy = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);

// ─── Models ───────────────────────────────────────────────────────────────────
const MODELS = [
  { id: "gpt-5.2", label: "ChatGPT 5.2", tag: "OpenAI", dot: "#10a37f", provider: "openai" },
  { id: "gemini-3.1-pro-preview", label: "Gemini 3.1 Pro", tag: "Google", dot: "#4285f4", provider: "google" },
  { id: "claude-sonnet-4-5", label: "Claude Sonnet 4.5", tag: "Anthropic", dot: "#c2410c", provider: "anthropic" },
  { id: "claude-sonnet-4-6", label: "Claude Sonnet 4.6", tag: "Anthropic", dot: "#c2410c", provider: "anthropic" },
];

// ─── Tool Configs ─────────────────────────────────────────────────────────────
const TOOLS = [
  {
    id: "inspiracija",
    title: "Inspiracija za objave",
    desc: "Daću ti nove ideje za objave na mrežama",
    icon: <IconHeart />,
    available: false,
  },
  {
    id: "facebook",
    title: "Facebook objava",
    desc: "Napisaću tekst koji ide uz Facebook post",
    icon: <IconThumb />,
    available: true,
    accent: "#1877f2",
    systemPrompt: "Ti si ekspert za pisanje Facebook objava na srpskom jeziku. Napiši engaging, prirodan Facebook post koji nije previše marketinški. Koristi odgovarajuće emoji-je. Ton treba da bude human i autentičan.",
    placeholder: "Opiši šta želiš da objaviš na Facebooku...",
    outputLabel: "Facebook post",
  },
  {
    id: "instagram",
    title: "Instagram objava",
    desc: "Napisaću opis za Instagram objavu",
    icon: <IconShield />,
    available: true,
    accent: "#e1306c",
    systemPrompt: "Ti si ekspert za pisanje Instagram captions na srpskom jeziku. Napiši kreativan caption sa relevantnim hashtagovima. Budi autentičan, vizuelan i privlačan — izbegavaj korporativni ton.",
    placeholder: "Opiši šta je na slici ili šta želiš da kažeš...",
    outputLabel: "Instagram caption",
  },
  {
    id: "linkedin",
    title: "LinkedIn post",
    desc: "Napraviću ti jedinstvenu LinkedIn objavu",
    icon: <IconIn />,
    available: false,
  },
  {
    id: "carousel",
    title: "Instagram Carousel",
    desc: "Umem da osmislim i Carousel — probaj",
    icon: <IconGrid />,
    available: false,
  },
  {
    id: "fbreklama",
    title: "Facebook reklama",
    desc: "Napraviću tekst za reklamu koji će oduševiti publiku",
    icon: <IconFbCircle />,
    available: false,
  },
  {
    id: "vizual",
    title: "Napravi vizual",
    desc: "Napraviću vizual za tvoje društvene mreže",
    icon: <IconImage />,
    available: false,
    isNew: true,
  },
];

// ─── Tool Page ────────────────────────────────────────────────────────────────
function ToolPage({ tool, onBack }) {
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState(MODELS[0]);
  const [modelOpen, setModelOpen] = useState(false);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [copied, setCopied] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL?.trim?.() || "";
  const apiKey = import.meta.env.VITE_API_KEY?.trim?.() || "";

  const callAI = async (systemMsg, userMsg, selectedModel) => {
    if (!apiUrl) throw new Error("Postavite VITE_API_URL u .env (URL backend-a). Vidi .env.example.");
    if (!apiKey) throw new Error("Postavite VITE_API_KEY u .env (isti kao API_SECRET na backend-u).");
    const res = await fetch(`${apiUrl.replace(/\/$/, "")}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-Key": apiKey },
      body: JSON.stringify({
        systemMsg,
        userContent: userMsg,
        modelId: selectedModel?.id || "gpt-5.2",
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || "Greška na serveru");
    return data.text?.trim?.() || "";
  };

  const enhancePrompt = async () => {
    if (!prompt.trim() || enhancing) return;
    setEnhancing(true);
    try {
      const improved = await callAI(
        "Poboljšaj dati prompt da bude jasniji i detaljniji za AI generisanje sadržaja za društvene mreže. Vrati SAMO poboljšani prompt, bez objašnjenja ili komentara.",
        prompt,
        model
      );
      if (improved) setPrompt(improved);
    } catch (e) {
      console.error(e);
      if (e.message?.includes("VITE_API_URL") || e.message?.includes("VITE_API_KEY")) setOutput("Postavite VITE_API_URL i VITE_API_KEY u .env. Vidi .env.example.");
    }
    setEnhancing(false);
  };

  const generate = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setOutput("");
    try {
      const text = await callAI(
        tool.systemPrompt + `\nOdabrani model: ${model.label}.`,
        prompt,
        model
      );
      setOutput(text || "Nema odgovora.");
    } catch (e) {
      setOutput(e.message || "Greška pri generisanju. Pokušaj ponovo.");
    }
    setLoading(false);
  };

  const copy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="tool-page">
      <div className="tool-header">
        <button className="back-btn" onClick={onBack}>← Nazad</button>
        <div className="tool-header-info">
          <span className="tool-header-icon" style={{ color: tool.accent }}>{tool.icon}</span>
          <div>
            <div className="tool-header-title">{tool.title}</div>
            <div className="tool-header-sub">AI copywriting alat</div>
          </div>
        </div>
      </div>

      <div className="tool-body">
        {/* Model selector */}
        <div className="field">
          <label className="field-label">AI Model</label>
          <div className="model-select-wrap">
            <button className="model-btn" onClick={() => setModelOpen(v => !v)}>
              <span className="model-dot" style={{ background: model.dot }} />
              <span className="model-name">{model.label}</span>
              <span className="model-tag">{model.tag}</span>
              <span className="model-chevron">{modelOpen ? "▲" : "▼"}</span>
            </button>
            {modelOpen && (
              <div className="model-dropdown">
                {MODELS.map(m => (
                  <button key={m.id} className={`model-option ${model.id === m.id ? "active" : ""}`}
                    onClick={() => { setModel(m); setModelOpen(false); }}>
                    <span className="model-dot" style={{ background: m.dot }} />
                    <span style={{ flex: 1 }}>{m.label}</span>
                    <span className="model-tag">{m.tag}</span>
                    {model.id === m.id && <span style={{ color: tool.accent }}>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Prompt */}
        <div className="field">
          <div className="field-row">
            <label className="field-label">Prompt</label>
            <button className="enhance-btn" onClick={enhancePrompt} disabled={enhancing || !prompt.trim()}>
              {enhancing
                ? <><span className="spin">⟳</span> Poboljšavam...</>
                : <><IconSparkle /> Poboljšaj prompt</>}
            </button>
          </div>
          <textarea
            className="textarea"
            rows={5}
            placeholder={tool.placeholder}
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            style={{ "--accent": tool.accent }}
          />
          <div className="char-count">{prompt.length} karaktera</div>
        </div>

        {/* Generate */}
        <button
          className="generate-btn"
          onClick={generate}
          disabled={loading || !prompt.trim()}
          style={{ "--accent": tool.accent, "--accent-faded": tool.accent + "22" }}
        >
          {loading
            ? <><span className="spin">◌</span> Generišem...</>
            : `Generiši ${tool.outputLabel} →`}
        </button>

        {/* Output */}
        {output && (
          <div className="output-wrap">
            <div className="output-header">
              <span className="field-label">Rezultat</span>
              <button className="copy-btn" onClick={copy} style={{ color: copied ? "#16a34a" : undefined }}>
                <IconCopy /> {copied ? "Kopirano!" : "Kopiraj"}
              </button>
            </div>
            <div className="output-box" style={{ "--accent": tool.accent }}>{output}</div>
            <button className="regen-btn" onClick={generate}>↺ Regeneriši</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
function Card({ tool, onClick }) {
  return (
    <button
      className={`card ${tool.isNew ? "card-new" : ""} ${!tool.available ? "card-soon" : ""}`}
      onClick={() => tool.available && onClick(tool.id)}
      style={{ cursor: tool.available ? "pointer" : "default" }}
    >
      <div className="card-top">
        <span className="card-title">{tool.title}</span>
        <span className="card-icon">{tool.icon}</span>
      </div>
      <p className="card-desc">{tool.desc}</p>
      <div className="card-footer">
        {tool.isNew && <span className="badge-new">NOVA VERZIJA</span>}
        {tool.available && (
          <span className="card-arrow"><IconChevron /></span>
        )}
        {!tool.available && !tool.isNew && (
          <span className="badge-soon">Uskoro</span>
        )}
      </div>
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DrustveneMareze() {
  const navigate = useNavigate();
  const [active, setActive] = useState(null);
  const tool = TOOLS.find(t => t.id === active);

  const handleCardClick = (toolId) => {
    if (toolId === "facebook") {
      navigate("/alati/facebook-objava");
      return;
    }
    if (toolId === "instagram") {
      navigate("/alati/instagram-objava");
      return;
    }
    setActive(toolId);
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display&display=swap" rel="stylesheet" />
      <style>{CSS}</style>

      {active && tool?.available ? (
        <ToolPage tool={tool} onBack={() => setActive(null)} />
      ) : (
        <div className="home">
          <div className="home-inner">
            {/* Left */}
            <div className="home-left">
              <h1 className="home-title">Društvene<br />mreže</h1>
              <p className="home-sub">
                Pomoći ću ti da dobiješ inspiraciju za objave i zatim da ih kreiraš i objaviš. Svi tvoji pratioci će ti biti zahvalni.
              </p>
            </div>

            {/* Grid */}
            <div className="grid">
              {TOOLS.map(t => (
                <Card key={t.id} tool={t} onClick={handleCardClick} />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body { font-family: 'DM Sans', sans-serif; }

  /* ── Home ── */
  .home {
    min-height: 100vh;
    background: linear-gradient(135deg, #1e3a8a 0%, #6d28d9 30%, #db2777 65%, #f97316 100%);
    display: flex;
    align-items: center;
    padding: 48px 32px;
  }
  .home-inner {
    max-width: 1100px;
    margin: 0 auto;
    width: 100%;
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 48px;
    align-items: start;
  }
  .home-left { padding-top: 8px; }
  .home-title {
    font-family: 'DM Serif Display', serif;
    font-size: 52px;
    font-weight: 400;
    color: white;
    line-height: 1.1;
    margin-bottom: 20px;
    letter-spacing: -0.5px;
  }
  .home-sub {
    color: rgba(255,255,255,0.75);
    font-size: 15px;
    line-height: 1.65;
    font-weight: 400;
  }

  /* ── Grid ── */
  .grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  /* ── Card ── */
  .card {
    background: white;
    border: none;
    border-radius: 16px;
    padding: 20px 20px 16px;
    text-align: left;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    font-family: 'DM Sans', sans-serif;
    position: relative;
    overflow: hidden;
  }
  .card:hover {
    transform: translateY(-3px);
    box-shadow: 0 16px 40px rgba(0,0,0,0.18);
  }
  .card-soon { opacity: 0.82; }
  .card-new {
    border: 2px solid #7c3aed;
  }
  .card-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 10px;
    gap: 8px;
  }
  .card-title {
    font-size: 17px;
    font-weight: 700;
    color: #111;
    line-height: 1.25;
    letter-spacing: -0.2px;
  }
  .card-icon {
    color: #555;
    flex-shrink: 0;
    margin-top: 1px;
  }
  .card-desc {
    font-size: 13.5px;
    color: #555;
    line-height: 1.55;
    margin-bottom: 16px;
    font-weight: 400;
  }
  .card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .card-arrow {
    margin-left: auto;
    color: #999;
    display: flex;
    align-items: center;
    transition: transform 0.2s;
  }
  .card:hover .card-arrow { transform: translateX(3px); color: #333; }
  .badge-new {
    background: #7c3aed;
    color: white;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.8px;
    padding: 3px 8px;
    border-radius: 20px;
    text-transform: uppercase;
  }
  .badge-soon {
    font-size: 11px;
    color: #aaa;
    font-weight: 500;
  }

  /* ── Tool Page ── */
  .tool-page {
    min-height: 100vh;
    background: #f5f4f2;
    font-family: 'DM Sans', sans-serif;
  }
  .tool-header {
    background: white;
    border-bottom: 1px solid #e8e8e8;
    padding: 16px 32px;
    display: flex;
    align-items: center;
    gap: 20px;
  }
  .back-btn {
    background: #f2f2f0;
    border: none;
    border-radius: 8px;
    padding: 8px 14px;
    font-size: 13px;
    font-weight: 500;
    color: #444;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: background 0.15s;
  }
  .back-btn:hover { background: #e8e8e8; }
  .tool-header-icon { display: flex; }
  .tool-header-info { display: flex; align-items: center; gap: 12px; }
  .tool-header-title { font-size: 16px; font-weight: 700; color: #111; }
  .tool-header-sub { font-size: 12px; color: #999; margin-top: 1px; }

  .tool-body {
    max-width: 680px;
    margin: 0 auto;
    padding: 40px 24px 60px;
  }

  .field { margin-bottom: 24px; }
  .field-label {
    display: block;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    color: #888;
    margin-bottom: 8px;
  }
  .field-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }
  .field-row .field-label { margin-bottom: 0; }

  /* Model select */
  .model-select-wrap { position: relative; }
  .model-btn {
    width: 100%;
    background: white;
    border: 1.5px solid #e2e2e0;
    border-radius: 10px;
    padding: 12px 16px;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    font-weight: 500;
    color: #222;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: border-color 0.15s;
  }
  .model-btn:hover { border-color: #bbb; }
  .model-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .model-name { flex: 1; text-align: left; }
  .model-tag {
    font-size: 10px;
    font-weight: 600;
    color: #aaa;
    background: #f2f2f0;
    padding: 2px 7px;
    border-radius: 20px;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }
  .model-chevron { font-size: 11px; color: #bbb; }
  .model-dropdown {
    position: absolute;
    top: calc(100% + 6px);
    left: 0; right: 0;
    background: white;
    border: 1.5px solid #e2e2e0;
    border-radius: 12px;
    overflow: hidden;
    z-index: 50;
    box-shadow: 0 8px 30px rgba(0,0,0,0.1);
  }
  .model-option {
    width: 100%;
    padding: 11px 16px;
    background: transparent;
    border: none;
    border-bottom: 1px solid #f2f2f0;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    font-weight: 500;
    color: #222;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: background 0.12s;
    text-align: left;
  }
  .model-option:last-child { border-bottom: none; }
  .model-option:hover, .model-option.active { background: #fafafa; }

  /* Enhance btn */
  .enhance-btn {
    background: #faf7ff;
    border: 1.5px solid #d8c8ff;
    border-radius: 8px;
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 600;
    color: #6d28d9;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
    font-family: 'DM Sans', sans-serif;
    transition: all 0.15s;
  }
  .enhance-btn:hover:not(:disabled) { background: #f3ecff; border-color: #b39ddb; }
  .enhance-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  /* Textarea */
  .textarea {
    width: 100%;
    background: white;
    border: 1.5px solid #e2e2e0;
    border-radius: 12px;
    padding: 14px 16px;
    font-size: 14px;
    font-family: 'DM Sans', sans-serif;
    line-height: 1.65;
    color: #222;
    resize: vertical;
    outline: none;
    transition: border-color 0.15s;
  }
  .textarea::placeholder { color: #bbb; }
  .textarea:focus { border-color: var(--accent, #6d28d9); }
  .char-count { text-align: right; font-size: 11px; color: #bbb; margin-top: 6px; }

  /* Generate btn */
  .generate-btn {
    width: 100%;
    padding: 15px;
    background: #111;
    border: none;
    border-radius: 12px;
    color: white;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    letter-spacing: -0.1px;
  }
  .generate-btn:hover:not(:disabled) { background: #222; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,0,0,0.2); }
  .generate-btn:disabled { background: #ccc; cursor: not-allowed; transform: none; box-shadow: none; }

  /* Output */
  .output-wrap { margin-top: 32px; animation: fadeUp 0.35s ease; }
  .output-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
  .copy-btn {
    background: #f2f2f0;
    border: none;
    border-radius: 8px;
    padding: 7px 12px;
    font-size: 12px;
    font-weight: 600;
    color: #555;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
    font-family: 'DM Sans', sans-serif;
    transition: all 0.15s;
  }
  .copy-btn:hover { background: #e8e8e8; }
  .output-box {
    background: white;
    border: 1.5px solid #e2e2e0;
    border-left: 4px solid var(--accent, #111);
    border-radius: 12px;
    padding: 18px 20px;
    font-size: 14px;
    line-height: 1.75;
    color: #333;
    white-space: pre-wrap;
    margin-bottom: 12px;
  }
  .regen-btn {
    background: transparent;
    border: 1.5px solid #e2e2e0;
    border-radius: 8px;
    padding: 9px 16px;
    font-size: 13px;
    font-weight: 500;
    color: #666;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: all 0.15s;
  }
  .regen-btn:hover { background: #f8f8f6; border-color: #ccc; }

  /* Spin */
  @keyframes spin { to { transform: rotate(360deg); } }
  .spin { display: inline-block; animation: spin 0.8s linear infinite; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

  @media (max-width: 900px) {
    .home-inner { grid-template-columns: 1fr; gap: 32px; }
    .grid { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 560px) {
    .grid { grid-template-columns: 1fr; }
    .home { padding: 32px 20px; }
  }
`;
