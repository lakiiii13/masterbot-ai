import { useState, useRef, useCallback, useEffect } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────
const MODELS = [
  { id: "gpt-5.2", label: "ChatGPT 5.2", tag: "OpenAI", dot: "#10a37f", desc: "Flagship model za kompleksno pisanje", provider: "openai" },
  { id: "gemini-3.1-pro-preview", label: "Gemini 3.1 Pro", tag: "Google", dot: "#4285f4", desc: "Najnoviji, odličan za pisanje, bez retirement u junu", provider: "google" },
  { id: "claude-sonnet-4-5", label: "Claude Sonnet 4.5", tag: "Anthropic", dot: "#e2692a", desc: "Odličan za reasoning i pisanje", provider: "anthropic" },
  { id: "claude-sonnet-4-6", label: "Claude Sonnet 4.6", tag: "Anthropic", dot: "#e2692a", desc: "Najnoviji, brz i inteligentan", provider: "anthropic" },
];

const TONES = [
  { id: "profesionalan", label: "Profesionalan", emoji: "💼" },
  { id: "marketarski", label: "Marketarski", emoji: "📢" },
  { id: "duhovit", label: "Duhovit", emoji: "😄" },
  { id: "poetican", label: "Poetičan", emoji: "🎭" },
  { id: "inspirativan", label: "Inspirativan", emoji: "✨" },
  { id: "informativni", label: "Informativni", emoji: "📋" },
  { id: "opusten", label: "Opušten", emoji: "😎" },
];

const LANGUAGES = ["Srpski jezik", "Hrvatski jezik", "Bosanski jezik", "Engleski jezik"];

const TOTAL_STEPS = 4;

// ─── API (backend) ────────────────────────────────────────────────────────────
function useCallAI() {
  const apiUrl = import.meta.env.VITE_API_URL?.trim?.() || "";
  const apiKey = import.meta.env.VITE_API_KEY?.trim?.() || "";
  return useCallback(async (systemMsg, userContent, selectedModel) => {
    if (!apiUrl) throw new Error("Postavite VITE_API_URL u .env (URL backend-a). Vidi .env.example.");
    if (!apiKey) throw new Error("Postavite VITE_API_KEY u .env (isti kao API_SECRET na backend-u).");
    const res = await fetch(`${apiUrl.replace(/\/$/, "")}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-Key": apiKey },
      body: JSON.stringify({
        systemMsg,
        userContent,
        modelId: selectedModel?.id || "gpt-5.2",
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || "Greška na serveru");
    return data.text?.trim?.() || "";
  }, [apiUrl, apiKey]);
}

// ─── Shared UI ────────────────────────────────────────────────────────────────
const ProgressBar = ({ step, total }) => (
  <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 299, height: 2, background: "rgba(255,255,255,0.06)" }}>
    <div style={{ height: "100%", background: "linear-gradient(90deg,#3b7ff5,#e2692a)", width: `${(step / total) * 100}%`, transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)" }} />
  </div>
);

const StepLabel = ({ step, total, title }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 36 }}>
    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#3b7ff5,#e2692a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "white", flexShrink: 0 }}>{step}</div>
    <div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 600, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 2 }}>Korak {step} od {total}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: "white", letterSpacing: -0.4 }}>{title}</div>
    </div>
  </div>
);

const NextBtn = ({ onClick, disabled, label = "Nastavi →", loading = false }) => (
  <button onClick={onClick} disabled={disabled || loading} style={{
    padding: "14px 32px", background: disabled ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg,#3b7ff5,#2563eb)",
    border: "none", borderRadius: 12, color: disabled ? "rgba(255,255,255,0.2)" : "white",
    fontSize: 15, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer", fontFamily: "inherit",
    transition: "all 0.2s", boxShadow: disabled ? "none" : "0 4px 20px rgba(59,127,245,0.35)",
    display: "flex", alignItems: "center", gap: 8,
  }}>
    {loading ? <><span style={{ animation: "spin 0.8s linear infinite", display: "inline-block" }}>◌</span> Malo čekaj...</> : label}
  </button>
);

const BackBtn = ({ onClick }) => (
  <button onClick={onClick} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "13px 20px", color: "rgba(255,255,255,0.45)", fontSize: 14, cursor: "pointer", fontFamily: "inherit", fontWeight: 500, transition: "all 0.2s" }}>← Nazad</button>
);

// ─── Step 1: Prompt ───────────────────────────────────────────────────────────
const Step1 = ({ value, onChange, onNext, callAI }) => {
  const [enhancing, setEnhancing] = useState(false);
  const defaultModel = MODELS[0];

  const enhance = async () => {
    if (!value.trim() || enhancing) return;
    setEnhancing(true);
    try {
      const improved = await callAI(
        `Ti si ekspert za poboljšavanje prompta za AI generisanje Facebook objava. Korisnik je uneo kratak opis. Tvoj zadatak je da ga proširiš u detaljan, konkretan prompt koji će AI-u dati sve potrebne informacije za pisanje odlične objave.

Proširi prompt tako da uključi:
- Vrstu biznisa/lokaciju (npr. poslastičarnica u Beogradu)
- Proizvode ili usluge (npr. sladoled od vanile, specijaliteti)
- Ciljnu publiku (kome se obraća)
- Željeni ton (opušten, profesionalan, duhovit...)
- Ključne poruke ili pozive na akciju (poseti, probaj, naruči...)
- Jedinstvene prednosti ako postoje

Piši na istom jeziku kao korisnikov unos. Vrati SAMO poboljšani prompt, bez uvoda ili objašnjenja. Maksimalno 1000 karaktera.`,
        value,
        defaultModel
      );
      if (improved) onChange(improved.trim().slice(0, 1000));
    } catch (e) { console.error(e); }
    setEnhancing(false);
  };

  return (
    <div style={slideIn}>
      <StepLabel step={1} total={TOTAL_STEPS} title="O čemu pišemo?" />

      <div style={{ marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{value.length}/1000 karaktera</span>
        <button onClick={enhance} disabled={enhancing || !value.trim()} style={{ background: "rgba(79,142,247,0.1)", border: "1px solid rgba(79,142,247,0.25)", borderRadius: 20, padding: "6px 13px", color: enhancing ? "rgba(255,255,255,0.25)" : "#7eb3ff", fontSize: 12, fontWeight: 700, cursor: enhancing || !value.trim() ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 5, transition: "all 0.2s" }}>
          {enhancing ? <><span style={{ animation: "spin 0.8s linear infinite", display: "inline-block" }}>⟳</span> Poboljšavam...</> : "✨ Poboljšaj prompt"}
        </button>
      </div>

      <textarea
        rows={7}
        maxLength={1000}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Opiši temu, proizvod, događaj ili ideju za objavu...&#10;&#10;Npr: Naš restoran otvara novu terasu ovog vikenda, specijalna ponuda za prvih 50 gostiju."
        style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1.5px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "16px 18px", color: "white", fontSize: 15, lineHeight: 1.75, resize: "none", outline: "none", fontFamily: "inherit", transition: "border-color 0.2s, box-shadow 0.2s", boxSizing: "border-box", marginBottom: 24 }}
        onFocus={e => { e.target.style.borderColor = "#4f8ef7"; e.target.style.boxShadow = "0 0 0 3px rgba(79,142,247,0.1)"; }}
        onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.boxShadow = "none"; }}
        autoFocus
      />

      <NextBtn onClick={onNext} disabled={!value.trim()} />
    </div>
  );
};

// ─── Step 2: Image ────────────────────────────────────────────────────────────
const Step2 = ({ image, onImage, onClear, onNext, onBack }) => {
  const ref = useRef();
  const handle = useCallback((e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files[0] || e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (ev) => onImage({ base64: ev.target.result.split(",")[1], preview: ev.target.result, type: file.type });
    reader.readAsDataURL(file);
  }, [onImage]);

  return (
    <div style={slideIn}>
      <StepLabel step={2} total={TOTAL_STEPS} title="Dodaj sliku" />
      <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", marginBottom: 28, lineHeight: 1.6 }}>
        Opciono — ako dodaš sliku, AI će je analizirati i pisati na osnovu nje.
      </p>

      {image ? (
        <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", marginBottom: 28 }}>
          <img src={image.preview} alt="upload" style={{ width: "100%", maxHeight: 280, objectFit: "cover", display: "block" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(9,11,17,0.9) 0%, transparent 50%)" }} />
          <div style={{ position: "absolute", bottom: 16, left: 18, fontSize: 14, fontWeight: 600, color: "white" }}>✓ Slika učitana</div>
          <button onClick={onClear} style={{ position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "50%", width: 30, height: 30, color: "white", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
      ) : (
        <div onClick={() => ref.current?.click()} onDrop={handle} onDragOver={e => e.preventDefault()}
          style={{ border: "2px dashed rgba(79,142,247,0.2)", borderRadius: 16, padding: "48px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, cursor: "pointer", background: "rgba(79,142,247,0.03)", transition: "all 0.25s", marginBottom: 28 }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(79,142,247,0.45)"; e.currentTarget.style.background = "rgba(79,142,247,0.07)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(79,142,247,0.2)"; e.currentTarget.style.background = "rgba(79,142,247,0.03)"; }}>
          <div style={{ fontSize: 40, marginBottom: 4 }}>🖼️</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>Klikni ili prevuci sliku ovde</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>PNG, JPG, WEBP</div>
          <input ref={ref} type="file" accept="image/*" style={{ display: "none" }} onChange={handle} />
        </div>
      )}

      <div style={{ display: "flex", gap: 10 }}>
        <BackBtn onClick={onBack} />
        <NextBtn onClick={onNext} label={image ? "Nastavi →" : "Preskoči →"} />
      </div>
    </div>
  );
};

// ─── Step 3: Tone + Language ──────────────────────────────────────────────────
const Step3 = ({ tone, onTone, language, onLanguage, onNext, onBack }) => (
  <div style={slideIn}>
    <StepLabel step={3} total={TOTAL_STEPS} title="Ton i jezik" />

    <div style={{ marginBottom: 28 }}>
      <label style={labelStyle}>Ton komunikacije</label>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {TONES.map(t => (
          <button key={t.id} onClick={() => onTone(tone === t.id ? "" : t.id)} style={{
            background: tone === t.id ? "rgba(59,127,245,0.15)" : "rgba(255,255,255,0.03)",
            border: `1.5px solid ${tone === t.id ? "rgba(79,142,247,0.5)" : "rgba(255,255,255,0.08)"}`,
            borderRadius: 12, padding: "13px 16px", color: tone === t.id ? "white" : "rgba(255,255,255,0.5)",
            fontSize: 14, fontWeight: tone === t.id ? 600 : 400, cursor: "pointer", fontFamily: "inherit",
            transition: "all 0.2s", display: "flex", alignItems: "center", gap: 10, textAlign: "left",
            boxShadow: tone === t.id ? "0 0 0 1px rgba(79,142,247,0.2) inset" : "none",
          }}>
            <span style={{ fontSize: 18 }}>{t.emoji}</span> {t.label}
            {tone === t.id && <span style={{ marginLeft: "auto", color: "#4f8ef7", fontSize: 16 }}>✓</span>}
          </button>
        ))}
      </div>
    </div>

    <div style={{ marginBottom: 32 }}>
      <label style={labelStyle}>Jezik objave</label>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {LANGUAGES.map(l => (
          <button key={l} onClick={() => onLanguage(l)} style={{
            background: language === l ? "rgba(59,127,245,0.15)" : "rgba(255,255,255,0.03)",
            border: `1.5px solid ${language === l ? "rgba(79,142,247,0.5)" : "rgba(255,255,255,0.08)"}`,
            borderRadius: 10, padding: "10px 18px", color: language === l ? "white" : "rgba(255,255,255,0.45)",
            fontSize: 14, fontWeight: language === l ? 600 : 400, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
          }}>{l}</button>
        ))}
      </div>
    </div>

    <div style={{ display: "flex", gap: 10 }}>
      <BackBtn onClick={onBack} />
      <NextBtn onClick={onNext} />
    </div>
  </div>
);

// ─── Step 4: Model + Variations ───────────────────────────────────────────────
const Step4 = ({ model, onModel, variations, onVariations, onGenerate, onBack, loading }) => (
  <div style={slideIn}>
    <StepLabel step={4} total={TOTAL_STEPS} title="Model i varijacije" />

    <div style={{ marginBottom: 28 }}>
      <label style={labelStyle}>AI Model</label>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {MODELS.map(m => (
          <button key={m.id} onClick={() => onModel(m)} style={{
            background: model.id === m.id ? "rgba(59,127,245,0.12)" : "rgba(255,255,255,0.03)",
            border: `1.5px solid ${model.id === m.id ? "rgba(79,142,247,0.45)" : "rgba(255,255,255,0.07)"}`,
            borderRadius: 12, padding: "13px 16px", color: "white", fontSize: 14, cursor: "pointer",
            fontFamily: "inherit", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 12, textAlign: "left",
          }}>
            <div style={{ width: 9, height: 9, borderRadius: "50%", background: m.dot, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: model.id === m.id ? 700 : 500, marginBottom: 2 }}>{m.label}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontWeight: 400 }}>{m.desc}</div>
            </div>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.06)", padding: "3px 8px", borderRadius: 20, fontWeight: 700, letterSpacing: 0.3 }}>{m.tag}</span>
            {model.id === m.id && <span style={{ color: "#4f8ef7", fontSize: 18, flexShrink: 0 }}>✓</span>}
          </button>
        ))}
      </div>
    </div>

    <div style={{ marginBottom: 36 }}>
      <label style={labelStyle}>Broj varijacija</label>
      <div style={{ display: "flex", gap: 10 }}>
        {[1, 2, 3].map(n => (
          <button key={n} onClick={() => onVariations(n)} style={{
            flex: 1, padding: "16px", background: variations === n ? "linear-gradient(135deg,#3b7ff5,#2563eb)" : "rgba(255,255,255,0.04)",
            border: `1.5px solid ${variations === n ? "#3b7ff5" : "rgba(255,255,255,0.08)"}`,
            borderRadius: 12, color: "white", fontSize: 18, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
            transition: "all 0.2s", boxShadow: variations === n ? "0 4px 16px rgba(59,127,245,0.35)" : "none",
          }}>{n}</button>
        ))}
      </div>
    </div>

    <div style={{ display: "flex", gap: 10 }}>
      <BackBtn onClick={onBack} />
      <NextBtn onClick={onGenerate} label="✦ Kreiraj objavu" loading={loading} />
    </div>
  </div>
);

// ─── Loading Screen ───────────────────────────────────────────────────────────
const LoadingScreen = () => {
  const [msgIdx, setMsgIdx] = useState(0);
  const msgs = ["Analiziram tvoj prompt...", "Biram prave reči...", "Dodajem emojije...", "Finalizujem tekst..."];
  useEffect(() => {
    const t = setInterval(() => setMsgIdx(i => (i + 1) % msgs.length), 1800);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 32, paddingTop: 0 }}>
      <div style={{ position: "relative", width: 100, height: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "absolute", inset: -22, borderRadius: "50%", border: "2.5px solid transparent", borderTopColor: "#3b7ff5", borderRightColor: "rgba(59,127,245,0.2)", animation: "spinRing 1s linear infinite" }} />
        <div style={{ position: "absolute", inset: -36, borderRadius: "50%", border: "2px solid transparent", borderBottomColor: "#e2692a", borderLeftColor: "rgba(226,105,42,0.2)", animation: "spinRing 1.6s linear infinite reverse" }} />
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg,#3b7ff5,#e2692a)", animation: "botGlow 1.5s ease-in-out infinite" }} />
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: "white", marginBottom: 10, letterSpacing: -0.3 }}>Pišem objavu...</div>
        <div key={msgIdx} style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", animation: "fadeUp 0.4s ease" }}>{msgs[msgIdx]}</div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: ["#3b7ff5", "#7b5ef8", "#e2692a"][i], animation: `dotBounce 1s ease-in-out ${i * 0.18}s infinite` }} />
        ))}
      </div>
    </div>
  );
};

// ─── Result Screen ────────────────────────────────────────────────────────────
const ResultScreen = ({ results, onReset, onRegenerate }) => (
  <div style={{ ...slideIn, paddingBottom: 60 }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
      <div>
        <div style={{ fontSize: 12, color: "#22c55e", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>✓ Generisano</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "white", letterSpacing: -0.3 }}>
          {results.length === 1 ? "Tvoja Facebook objava" : `${results.length} varijacije`}
        </h2>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onRegenerate} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "9px 16px", color: "rgba(255,255,255,0.55)", fontSize: 13, cursor: "pointer", fontFamily: "inherit", fontWeight: 500 }}>↺ Regeneriši</button>
        <button onClick={onReset} style={{ background: "rgba(59,127,245,0.12)", border: "1px solid rgba(79,142,247,0.3)", borderRadius: 10, padding: "9px 16px", color: "#7eb3ff", fontSize: 13, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>+ Nova objava</button>
      </div>
    </div>

    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {results.map((text, i) => (
        <ResultCard key={i} text={text} index={i} total={results.length} />
      ))}
    </div>
  </div>
);

const ResultCard = ({ text, index, total }) => {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const copy = () => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, overflow: "hidden", animation: `fadeUp 0.45s ease ${index * 0.1}s both` }}>
      {total > 1 && (
        <div style={{ padding: "10px 18px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: "linear-gradient(135deg,#3b7ff5,#e2692a)" }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: 1, textTransform: "uppercase" }}>Varijacija {index + 1}</span>
        </div>
      )}
      <div style={{ padding: "20px 22px" }}>
        <p style={{ fontSize: 15, lineHeight: 1.8, color: "rgba(255,255,255,0.82)", whiteSpace: "pre-wrap", marginBottom: 18 }}>{text}</p>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={copy} style={actionBtn(copied ? "#22c55e" : null)}>{copied ? "✓ Kopirano" : "⎘ Kopiraj"}</button>
          <button onClick={() => setLiked(v => !v)} style={actionBtn(liked ? "#e2692a" : null)}>{liked ? "❤️ Sačuvano" : "♡ Sačuvaj"}</button>
        </div>
      </div>
    </div>
  );
};

const actionBtn = (color) => ({
  background: color ? `${color}18` : "rgba(255,255,255,0.05)",
  border: `1px solid ${color ? color + "40" : "rgba(255,255,255,0.09)"}`,
  borderRadius: 8, padding: "8px 14px", color: color || "rgba(255,255,255,0.5)",
  fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
});

// ─── Shared styles ────────────────────────────────────────────────────────────
const slideIn = { animation: "slideIn 0.38s cubic-bezier(0.4,0,0.2,1)" };
const labelStyle = { display: "block", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 };

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function FacebookObjava() {
  const callAI = useCallAI();
  const [step, setStep] = useState(1);
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState(null);
  const [tone, setTone] = useState("");
  const [language, setLanguage] = useState("Srpski jezik");
  const [model, setModel] = useState(MODELS[0]);
  const [variations, setVariations] = useState(1);
  const [output, setOutput] = useState([]);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    setOutput([]);
    setStep(5);
    try {
      const system = `Ti si ekspert za pisanje Facebook objava na ${language.replace(" jezik", "")}. ${tone ? `Ton: ${TONES.find(t => t.id === tone)?.label}.` : ""} Napiši engaging, human post sa emoji-jima. Model: ${model.label}.${image ? " Analiziraj sliku i napiši post na osnovu nje." : ""}`;
      const results = [];
      for (let i = 0; i < variations; i++) {
        const suffix = variations > 1 ? ` (Varijacija ${i + 1} — drugačija od ostalih)` : "";
        let userContent;
        if (image) {
          userContent = [
            { type: "image_url", image_url: { url: image.preview } },
            { type: "text", text: prompt + suffix },
          ];
        } else {
          userContent = prompt + suffix;
        }
        const text = await callAI(system, userContent, model);
        results.push(text?.trim() || "");
      }
      setOutput(results);
    } catch (e) {
      setOutput([e.message || "Greška. Pokušaj ponovo."]);
    }
    setLoading(false);
    setStep(6);
  };

  const reset = () => { setStep(1); setPrompt(""); setImage(null); setTone(""); setLanguage("Srpski jezik"); setModel(MODELS[0]); setVariations(1); setOutput([]); };

  return (
    <div style={{ minHeight: "100vh", background: "#090b11", fontFamily: "'Plus Jakarta Sans',sans-serif", color: "white" }}>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <ProgressBar step={step === 6 ? TOTAL_STEPS : step - 1} total={TOTAL_STEPS} />

      <div style={{ maxWidth: 580, margin: "0 auto", padding: "48px 24px 60px" }}>
        {step === 1 && <Step1 value={prompt} onChange={setPrompt} onNext={() => setStep(2)} callAI={callAI} />}
        {step === 2 && <Step2 image={image} onImage={setImage} onClear={() => setImage(null)} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
        {step === 3 && <Step3 tone={tone} onTone={setTone} language={language} onLanguage={setLanguage} onNext={() => setStep(4)} onBack={() => setStep(2)} />}
        {step === 4 && <Step4 model={model} onModel={setModel} variations={variations} onVariations={setVariations} onGenerate={generate} onBack={() => setStep(3)} loading={loading} />}
        {step === 5 && <LoadingScreen />}
        {step === 6 && <ResultScreen results={output} onReset={reset} onRegenerate={generate} />}
      </div>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        textarea::placeholder { color: rgba(255,255,255,0.2) !important; }
        select option { background: #0d1520; color: white; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes spinRing { to { transform: rotate(360deg); } }
        @keyframes botGlow {
          0%,100% { filter: drop-shadow(0 0 14px rgba(79,142,247,0.6)); }
          50% { filter: drop-shadow(0 0 22px rgba(226,105,42,0.7)); }
        }
        @keyframes dotBounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideIn { from { opacity:0; transform:translateX(18px); } to { opacity:1; transform:translateX(0); } }
      `}</style>
    </div>
  );
}
