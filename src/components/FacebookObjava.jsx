import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import logo from "../assets/images/logo.png";

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

const LANGUAGES = [
  { id: "sr", label: "Srpski", flag: "🇷🇸", prompt: "srpskom" },
  { id: "hr", label: "Hrvatski", flag: "🇭🇷", prompt: "hrvatskom" },
  { id: "bs", label: "Bosanski", flag: "🇧🇦", prompt: "bosanskom" },
  { id: "en", label: "English", flag: "🇬🇧", prompt: "English" },
  { id: "es", label: "Español", flag: "🇪🇸", prompt: "Spanish" },
  { id: "fr", label: "Français", flag: "🇫🇷", prompt: "French" },
  { id: "de", label: "Deutsch", flag: "🇩🇪", prompt: "German" },
  { id: "it", label: "Italiano", flag: "🇮🇹", prompt: "Italian" },
  { id: "pt", label: "Português", flag: "🇵🇹", prompt: "Portuguese" },
  { id: "ru", label: "Русский", flag: "🇷🇺", prompt: "Russian" },
  { id: "ar", label: "العربية", flag: "🇸🇦", prompt: "Arabic" },
  { id: "zh", label: "中文", flag: "🇨🇳", prompt: "Chinese" },
];

const TOTAL_STEPS = 4;

// ─── API (backend) ────────────────────────────────────────────────────────────
function useCallAI() {
  const apiUrl = import.meta.env.VITE_API_URL?.trim?.() || (import.meta.env.DEV ? "http://localhost:3000" : "");
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
  <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 299, height: 4, background: "rgba(255,255,255,0.04)" }}>
    <div style={{ height: "100%", background: "linear-gradient(90deg,#3b7ff5,#e2692a)", width: `${(step / total) * 100}%`, transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)", borderRadius: "0 4px 4px 0" }} />
  </div>
);

const StepLabel = ({ step, total, title }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 40 }}>
    <div style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg, rgba(59,127,245,0.15), rgba(226,105,42,0.15))", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "white", flexShrink: 0, boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>
      <span style={{ background: "linear-gradient(135deg,#3b7ff5,#e2692a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{step}</span>
    </div>
    <div>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>Korak {step} od {total}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: "white", letterSpacing: -0.5 }}>{title}</div>
    </div>
  </div>
);

const NextBtn = ({ onClick, disabled, label = "Nastavi", loading = false }) => (
  <button onClick={onClick} disabled={disabled || loading} style={{
    padding: "16px 36px", background: disabled ? "rgba(255,255,255,0.03)" : "white",
    border: disabled ? "1px solid rgba(255,255,255,0.05)" : "none", borderRadius: 100, color: disabled ? "rgba(255,255,255,0.2)" : "#090b11",
    fontSize: 16, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer", fontFamily: "inherit",
    transition: "all 0.2s", boxShadow: disabled ? "none" : "0 4px 24px rgba(255,255,255,0.15)",
    display: "flex", alignItems: "center", gap: 10, marginLeft: "auto"
  }}
  onMouseEnter={e => { if(!disabled && !loading) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(255,255,255,0.25)"; } }}
  onMouseLeave={e => { if(!disabled && !loading) { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(255,255,255,0.15)"; } }}>
    {loading ? <><span style={{ animation: "spin 0.8s linear infinite", display: "inline-block" }}>◌</span> Pripremam...</> : <>{label} <span style={{ fontSize: 18 }}>→</span></>}
  </button>
);

const BackBtn = ({ onClick }) => (
  <button onClick={onClick} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 100, padding: "16px 28px", color: "rgba(255,255,255,0.6)", fontSize: 15, cursor: "pointer", fontFamily: "inherit", fontWeight: 600, transition: "all 0.2s" }}
  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "white"; }}
  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}>
    ← Nazad
  </button>
);

// ─── Step 1: Prompt ───────────────────────────────────────────────────────────
const Step1 = ({ value, onChange, onNext, onBack, callAI }) => {
  const [enhancing, setEnhancing] = useState(false);
  const [error, setError] = useState("");
  const defaultModel = MODELS[0];

  const enhance = async () => {
    if (!value.trim() || enhancing) return;
    setEnhancing(true);
    setError("");
    try {
      const improved = await callAI(
        `Ti si ekspert za poboljšavanje prompta za AI generisanje Facebook objava. Korisnik je uneo kratak opis. Tvoj zadatak je da ga proširiš u detaljan prompt koji će AI-u dati sve potrebne informacije za pisanje odlične objave.

VAŽNO: Koristi SAMO informacije koje korisnik eksplicitno pominje. Ne izmišljaj lokaciju, proizvode ili detalje koje korisnik nije naveo. Ako nešto nije spomenuto, preskoči to.

Proširi ono što korisnik JESTE naveo:
- Ako pominje biznis — razradi vrstu i kontekst
- Ako pominje proizvode/usluge — dodaj kako ih predstavi
- Ako pominje lokaciju — uključi je
- Razmisli o ciljnoj publici i tonu na osnovu onoga što je rekao
- Predloži poziv na akciju koji se prirodno uklapa

Piši na istom jeziku kao korisnikov unos. Vrati SAMO poboljšani prompt, bez uvoda ili objašnjenja. Maksimalno 1000 karaktera.`,
        value,
        defaultModel
      );
      if (improved) onChange(improved.trim().slice(0, 1000));
    } catch (e) {
      console.error(e);
      setError(e.message || "Greška pri poboljšavanju. Proveri da li je backend pokrenut i .env postavljen.");
    }
    setEnhancing(false);
  };

  return (
    <div style={slideIn}>
      <StepLabel step={1} total={TOTAL_STEPS} title="O čemu pišemo?" />

      {error && (
        <div style={{ marginBottom: 16, padding: "12px 16px", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, color: "#fca5a5", fontSize: 13 }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: 0.5 }}>{value.length}/1000 KARAKTERA</span>
        <button onClick={enhance} disabled={enhancing || !value.trim()} style={{ background: "rgba(79,142,247,0.1)", border: "1px solid rgba(79,142,247,0.25)", borderRadius: 100, padding: "8px 16px", color: enhancing ? "rgba(255,255,255,0.25)" : "#7eb3ff", fontSize: 13, fontWeight: 700, cursor: enhancing || !value.trim() ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s" }}
        onMouseEnter={e => { if(!enhancing && value.trim()) { e.currentTarget.style.background = "rgba(79,142,247,0.15)"; e.currentTarget.style.borderColor = "rgba(79,142,247,0.4)"; } }}
        onMouseLeave={e => { if(!enhancing && value.trim()) { e.currentTarget.style.background = "rgba(79,142,247,0.1)"; e.currentTarget.style.borderColor = "rgba(79,142,247,0.25)"; } }}>
          {enhancing ? <><span style={{ animation: "spin 0.8s linear infinite", display: "inline-block" }}>⟳</span> Poboljšavam...</> : "✨ Poboljšaj prompt"}
        </button>
      </div>

      <textarea
        rows={8}
        maxLength={1000}
        value={value}
        onChange={e => { onChange(e.target.value); setError(""); }}
        placeholder="Opiši temu, proizvod, događaj ili ideju za objavu...&#10;&#10;Npr: Naš restoran otvara novu terasu ovog vikenda, specijalna ponuda za prvih 50 gostiju."
        style={{ width: "100%", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "24px", color: "white", fontSize: 16, lineHeight: 1.7, resize: "none", outline: "none", fontFamily: "inherit", transition: "all 0.3s", boxSizing: "border-box", marginBottom: 32, boxShadow: "inset 0 2px 10px rgba(0,0,0,0.2)" }}
        onFocus={e => { e.target.style.borderColor = "rgba(79,142,247,0.5)"; e.target.style.background = "rgba(255,255,255,0.04)"; e.target.style.boxShadow = "0 0 0 4px rgba(79,142,247,0.1), inset 0 2px 10px rgba(0,0,0,0.2)"; }}
        onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.background = "rgba(255,255,255,0.02)"; e.target.style.boxShadow = "inset 0 2px 10px rgba(0,0,0,0.2)"; }}
        autoFocus
      />

      <div style={{ display: "flex", justifyContent: onBack ? "space-between" : "flex-end", alignItems: "center" }}>
        {onBack && <BackBtn onClick={onBack} />}
        <NextBtn onClick={onNext} disabled={!value.trim()} />
      </div>
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
      <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", marginBottom: 32, lineHeight: 1.6 }}>
        Opciono — ako dodaš sliku, AI će je analizirati i pisati na osnovu nje.
      </p>

      {image ? (
        <div style={{ position: "relative", borderRadius: 20, overflow: "hidden", marginBottom: 32, border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
          <img src={image.preview} alt="upload" style={{ width: "100%", maxHeight: 320, objectFit: "cover", display: "block" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(9,11,17,0.95) 0%, transparent 60%)" }} />
          <div style={{ position: "absolute", bottom: 20, left: 24, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: 14 }}>✓</div>
            <span style={{ fontSize: 16, fontWeight: 700, color: "white", letterSpacing: -0.3 }}>Slika uspešno učitana</span>
          </div>
          <button onClick={onClear} style={{ position: "absolute", top: 16, right: 16, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "50%", width: 36, height: 36, color: "white", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.8)"; e.currentTarget.style.borderColor = "#ef4444"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,0,0,0.5)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}>
            ✕
          </button>
        </div>
      ) : (
        <div onClick={() => ref.current?.click()} onDrop={handle} onDragOver={e => e.preventDefault()}
          style={{ border: "2px dashed rgba(79,142,247,0.25)", borderRadius: 20, padding: "64px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16, cursor: "pointer", background: "rgba(79,142,247,0.02)", transition: "all 0.3s", marginBottom: 32 }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(79,142,247,0.6)"; e.currentTarget.style.background = "rgba(79,142,247,0.06)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(79,142,247,0.25)"; e.currentTarget.style.background = "rgba(79,142,247,0.02)"; e.currentTarget.style.transform = "none"; }}>
          <div style={{ fontSize: 48, marginBottom: 8, filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.2))" }}>🖼️</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "rgba(255,255,255,0.8)", letterSpacing: -0.3 }}>Klikni ili prevuci sliku ovde</div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", fontWeight: 500, background: "rgba(255,255,255,0.05)", padding: "6px 16px", borderRadius: 100 }}>Podržano: PNG, JPG, WEBP</div>
          <input ref={ref} type="file" accept="image/*" style={{ display: "none" }} onChange={handle} />
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 40 }}>
        <BackBtn onClick={onBack} />
        <NextBtn onClick={onNext} label={image ? "Nastavi" : "Preskoči"} />
      </div>
    </div>
  );
};

// ─── Step 3: Tone + Language ──────────────────────────────────────────────────
const Step3 = ({ tone, onTone, language, onLanguage, onNext, onBack }) => (
  <div style={slideIn}>
    <StepLabel step={3} total={TOTAL_STEPS} title="Ton i jezik" />

    <div style={{ marginBottom: 40 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.4)", marginBottom: 16, textTransform: "uppercase", letterSpacing: 1.5 }}>Ton komunikacije</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {TONES.map(t => (
          <button key={t.id} onClick={() => onTone(tone === t.id ? "" : t.id)} style={{
            background: tone === t.id ? "rgba(59,127,245,0.12)" : "rgba(255,255,255,0.02)",
            border: `1.5px solid ${tone === t.id ? "rgba(79,142,247,0.5)" : "rgba(255,255,255,0.06)"}`,
            borderRadius: 16, padding: "16px 20px", color: tone === t.id ? "white" : "rgba(255,255,255,0.6)",
            fontSize: 15, fontWeight: tone === t.id ? 700 : 500, cursor: "pointer", fontFamily: "inherit",
            transition: "all 0.2s", display: "flex", alignItems: "center", gap: 12, textAlign: "left",
            boxShadow: tone === t.id ? "0 4px 20px rgba(79,142,247,0.15), inset 0 0 0 1px rgba(79,142,247,0.1)" : "none",
          }}
          onMouseEnter={e => { if(tone !== t.id) { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; } }}
          onMouseLeave={e => { if(tone !== t.id) { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; } }}>
            <span style={{ fontSize: 22, transition: "all 0.2s" }}>{t.emoji}</span> 
            <span>{t.label}</span>
            {tone === t.id && <span style={{ marginLeft: "auto", color: "#4f8ef7", fontSize: 18, fontWeight: 800 }}>✓</span>}
          </button>
        ))}
      </div>
    </div>

    <div style={{ marginBottom: 32 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.4)", marginBottom: 16, textTransform: "uppercase", letterSpacing: 1.5 }}>Jezik objave</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 12 }}>
        {LANGUAGES.map(l => (
          <button key={l.id} onClick={() => onLanguage(l)} style={{
            background: language?.id === l.id ? "rgba(226,105,42,0.12)" : "rgba(255,255,255,0.02)",
            border: `1.5px solid ${language?.id === l.id ? "rgba(226,105,42,0.5)" : "rgba(255,255,255,0.06)"}`,
            borderRadius: 16, padding: "16px 12px", color: language?.id === l.id ? "white" : "rgba(255,255,255,0.6)",
            fontSize: 14, fontWeight: language?.id === l.id ? 700 : 500, cursor: "pointer", fontFamily: "inherit",
            transition: "all 0.2s", display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
            boxShadow: language?.id === l.id ? "0 4px 20px rgba(226,105,42,0.15), inset 0 0 0 1px rgba(226,105,42,0.1)" : "none",
            position: "relative"
          }}
          onMouseEnter={e => { if(language?.id !== l.id) { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; } }}
          onMouseLeave={e => { if(language?.id !== l.id) { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; } }}>
            {language?.id === l.id && <div style={{ position: "absolute", top: 8, right: 8, color: "#e2692a", fontSize: 14, fontWeight: 800 }}>✓</div>}
            <span style={{ fontSize: 28, transition: "all 0.2s" }}>{l.flag}</span>
            <span>{l.label}</span>
          </button>
        ))}
      </div>
    </div>

    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 48 }}>
      <BackBtn onClick={onBack} />
      <NextBtn onClick={onNext} />
    </div>
  </div>
);

// ─── Step 4: Model + Variations ───────────────────────────────────────────────
const Step4 = ({ model, onModel, variations, onVariations, onGenerate, onBack, loading }) => (
  <div style={slideIn}>
    <StepLabel step={4} total={TOTAL_STEPS} title="Model i varijacije" />

    <div style={{ marginBottom: 40 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.4)", marginBottom: 16, textTransform: "uppercase", letterSpacing: 1.5 }}>AI Model</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {MODELS.map(m => (
          <button key={m.id} onClick={() => onModel(m)} style={{
            background: model.id === m.id ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)",
            border: `2px solid ${model.id === m.id ? m.dot : "rgba(255,255,255,0.05)"}`,
            borderRadius: 20, padding: "20px 24px", color: "white", fontSize: 15, cursor: "pointer",
            fontFamily: "inherit", transition: "all 0.3s", display: "flex", alignItems: "center", gap: 16, textAlign: "left",
            boxShadow: model.id === m.id ? `0 8px 32px ${m.dot}25` : "none",
          }}
          onMouseEnter={e => { if(model.id !== m.id) { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; } }}
          onMouseLeave={e => { if(model.id !== m.id) { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"; } }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: m.dot, flexShrink: 0, boxShadow: `0 0 12px ${m.dot}` }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, marginBottom: 4, fontSize: 17, letterSpacing: -0.3 }}>{m.label}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", fontWeight: 500, lineHeight: 1.4 }}>{m.desc}</div>
            </div>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", background: "rgba(255,255,255,0.1)", padding: "4px 10px", borderRadius: 100, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }}>{m.tag}</span>
            <div style={{ width: 24, height: 24, borderRadius: "50%", border: `2px solid ${model.id === m.id ? m.dot : "rgba(255,255,255,0.2)"}`, display: "flex", alignItems: "center", justifyContent: "center", background: model.id === m.id ? m.dot : "transparent", transition: "all 0.2s", marginLeft: 8 }}>
              {model.id === m.id && <div style={{ width: 10, height: 10, borderRadius: "50%", background: "white" }} />}
            </div>
          </button>
        ))}
      </div>
    </div>

    <div style={{ marginBottom: 36 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.4)", marginBottom: 16, textTransform: "uppercase", letterSpacing: 1.5 }}>Broj varijacija</div>
      <div style={{ display: "flex", gap: 12 }}>
        {[1, 2, 3].map(n => (
          <button key={n} onClick={() => onVariations(n)} style={{
            flex: 1, padding: "20px", background: variations === n ? "white" : "rgba(255,255,255,0.02)",
            border: `2px solid ${variations === n ? "white" : "rgba(255,255,255,0.08)"}`,
            borderRadius: 16, color: variations === n ? "#090b11" : "white", fontSize: 24, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
            transition: "all 0.3s", boxShadow: variations === n ? "0 8px 32px rgba(255,255,255,0.2)" : "none",
          }}
          onMouseEnter={e => { if(variations !== n) { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; } }}
          onMouseLeave={e => { if(variations !== n) { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; } }}>
            {n}
          </button>
        ))}
      </div>
    </div>

    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 48 }}>
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
      <div style={{ position: "relative", width: 140, height: 140, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "absolute", inset: -22, borderRadius: "50%", border: "2.5px solid transparent", borderTopColor: "#3b7ff5", borderRightColor: "rgba(59,127,245,0.2)", animation: "spinRing 1s linear infinite" }} />
        <div style={{ position: "absolute", inset: -36, borderRadius: "50%", border: "2px solid transparent", borderBottomColor: "#e2692a", borderLeftColor: "rgba(226,105,42,0.2)", animation: "spinRing 1.6s linear infinite reverse" }} />
        <img src={logo} alt="" style={{ width: 100, height: 100, objectFit: "contain", borderRadius: "50%", animation: "logoPulse 2s ease-in-out infinite" }} />
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

// ─── Unsaved Modal ────────────────────────────────────────────────────────────
const UnsavedModal = ({ onSave, onDiscard, onCancel, saving }) => (
  <div
    onClick={onCancel}
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.8)",
      backdropFilter: "blur(14px)",
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        background: "linear-gradient(180deg, #141922 0%, #0e1219 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 28,
        maxWidth: 440,
        width: "100%",
        padding: 32,
        boxShadow: "0 32px 96px rgba(0,0,0,0.6), 0 0 0 1px rgba(59,127,245,0.08), inset 0 1px 0 rgba(255,255,255,0.03)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, rgba(59,127,245,0.2), rgba(226,105,42,0.15))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>💾</div>
        <p style={{ fontSize: 18, fontWeight: 600, color: "rgba(255,255,255,0.95)", margin: 0, lineHeight: 1.4 }}>
          Da li želite da sačuvate objavu pre nego što nastavite?
        </p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={onSave}
            disabled={saving}
            style={{
              flex: 1,
              background: "linear-gradient(135deg, rgba(226,105,42,0.25), rgba(226,105,42,0.15))",
              border: "1px solid rgba(226,105,42,0.45)",
              borderRadius: 14,
              padding: "16px 24px",
              color: "#ff9e66",
              fontSize: 15,
              fontWeight: 700,
              cursor: saving ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
            onMouseEnter={e => { if(!saving) { e.currentTarget.style.background = "linear-gradient(135deg, rgba(226,105,42,0.35), rgba(226,105,42,0.2))"; e.currentTarget.style.borderColor = "rgba(226,105,42,0.6)"; } }}
            onMouseLeave={e => { if(!saving) { e.currentTarget.style.background = "linear-gradient(135deg, rgba(226,105,42,0.25), rgba(226,105,42,0.15))"; e.currentTarget.style.borderColor = "rgba(226,105,42,0.45)"; } }}
          >
            {saving ? "⟳ Čuvam..." : "💾 Sačuvaj"}
          </button>
          <button
            onClick={onDiscard}
            style={{
              flex: 1,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 14,
              padding: "16px 24px",
              color: "rgba(255,255,255,0.85)",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
          >
            Nastavi bez čuvanja
          </button>
        </div>
        <button
          onClick={onCancel}
          style={{
            width: "100%",
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 14,
            padding: "14px 24px",
            color: "rgba(255,255,255,0.5)",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(255,255,255,0.8)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
        >
          Otkaži
        </button>
      </div>
    </div>
  </div>
);

// ─── Result Screen ────────────────────────────────────────────────────────────
const ResultScreen = ({ results, onReset, onRegenerate, saveMeta, onViewHistory }) => {
  const [savedIndices, setSavedIndices] = useState(new Set());
  const [pendingAction, setPendingAction] = useState(null);
  const [modalSaving, setModalSaving] = useState(false);

  const hasAnySaved = savedIndices.size > 0;
  const markSaved = (i) => setSavedIndices(s => new Set([...s, i]));

  const runAction = (action) => {
    if (action === "reset") onReset?.();
    else if (action === "regenerate") onRegenerate?.();
    else if (action === "viewHistory") onViewHistory?.();
    setPendingAction(null);
  };

  const handleAction = (action) => {
    if (hasAnySaved) {
      runAction(action);
    } else {
      setPendingAction(action);
    }
  };

  const handleModalSave = async () => {
    if (!saveMeta || modalSaving) return;
    setModalSaving(true);
    try {
      await saveMeta(results[0]);
      markSaved(0);
      runAction(pendingAction);
    } catch (e) {
      console.error(e);
    } finally {
      setModalSaving(false);
    }
  };

  const handleModalDiscard = () => runAction(pendingAction);

  return (
    <div style={{ ...slideIn, paddingBottom: 60 }}>
      {pendingAction && (
        <UnsavedModal
          onSave={handleModalSave}
          onDiscard={handleModalDiscard}
          onCancel={() => setPendingAction(null)}
          saving={modalSaving}
        />
      )}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 24 }}>
        {onReset && (
          <button onClick={() => handleAction("reset")} style={{ background: "linear-gradient(135deg,#3b7ff5,#2563eb)", border: "none", borderRadius: 100, padding: "12px 24px", color: "white", fontSize: 14, cursor: "pointer", fontFamily: "inherit", fontWeight: 700, transition: "all 0.2s", boxShadow: "0 4px 16px rgba(59,127,245,0.3)", whiteSpace: "nowrap" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(59,127,245,0.4)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(59,127,245,0.3)"; }}>
            + Nova objava
          </button>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        {results.map((text, i) => (
          <ResultCard key={i} text={text} index={i} total={results.length} onSave={saveMeta ? () => saveMeta(text) : null} onSaved={() => markSaved(i)} onRegenerate={() => handleAction("regenerate")} onViewHistory={() => handleAction("viewHistory")} isFirst={i === 0} />
        ))}
      </div>
    </div>
  );
};

const ResultCard = ({ text, index, total, onSave, onSaved, onRegenerate, onViewHistory, isFirst }) => {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const copy = () => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const handleSave = async () => {
    if (!onSave || saved || saving) return;
    setSaving(true);
    try {
      await onSave();
      setSaved(true);
      onSaved?.();
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };
  const btn = (onClick, label, style = {}) => (
    <button onClick={onClick} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 100, padding: "12px 24px", color: "rgba(255,255,255,0.8)", fontSize: 14, cursor: "pointer", fontFamily: "inherit", fontWeight: 600, transition: "all 0.2s", whiteSpace: "nowrap", ...style }}
      onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "white"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(255,255,255,0.8)"; }}>
      {label}
    </button>
  );
  return (
    <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, overflow: "hidden", animation: `fadeUp 0.45s ease ${index * 0.1}s both`, transition: "all 0.3s" }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}>
      {total > 1 && (
        <div style={{ padding: "12px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.2)", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "linear-gradient(135deg,#3b7ff5,#e2692a)", boxShadow: "0 0 10px rgba(59,127,245,0.5)" }} />
          <span style={{ fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.5)", letterSpacing: 1.5, textTransform: "uppercase" }}>Varijacija {index + 1}</span>
        </div>
      )}
      <div style={{ padding: "32px 32px 24px" }}>
        <p style={{ fontSize: 17, lineHeight: 1.85, color: "rgba(255,255,255,0.95)", whiteSpace: "pre-wrap", margin: "0 0 28px" }}>{text}</p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
          <button onClick={copy} style={{ flex: 1, minWidth: "140px", background: copied ? "#22c55e" : "rgba(255,255,255,0.05)", border: copied ? "1px solid #22c55e" : "1px solid rgba(255,255,255,0.1)", borderRadius: 100, padding: "14px", color: copied ? "white" : "rgba(255,255,255,0.8)", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            onMouseEnter={e => { if(!copied) { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; } }}
            onMouseLeave={e => { if(!copied) { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; } }}>
            {copied ? "✓ Kopirano" : "📋 Kopiraj tekst"}
          </button>
          {onSave && (
            <button onClick={handleSave} disabled={saved || saving} style={{ flex: 1, minWidth: "140px", background: saved ? "rgba(226,105,42,0.15)" : "rgba(226,105,42,0.1)", border: `1px solid ${saved ? "#e2692a" : "rgba(226,105,42,0.3)"}`, borderRadius: 100, padding: "14px", color: saved ? "#e2692a" : "#ff9e66", fontSize: 14, fontWeight: 700, cursor: saved || saving ? "not-allowed" : "pointer", fontFamily: "inherit", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              onMouseEnter={e => { if(!saved && !saving) { e.currentTarget.style.background = "rgba(226,105,42,0.15)"; e.currentTarget.style.borderColor = "rgba(226,105,42,0.5)"; } }}
              onMouseLeave={e => { if(!saved && !saving) { e.currentTarget.style.background = "rgba(226,105,42,0.1)"; e.currentTarget.style.borderColor = "rgba(226,105,42,0.3)"; } }}>
              {saving ? <><span style={{ animation: "spin 0.8s linear infinite", display: "inline-block" }}>⟳</span> Čuvam...</> : saved ? "✓ Sačuvano" : "💾 Sačuvaj"}
            </button>
          )}
          {isFirst && onRegenerate && btn(onRegenerate, "↺ Regeneriši")}
        </div>

        {isFirst && onViewHistory && (
          <button onClick={onViewHistory} style={{ width: "100%", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "16px 24px", color: "rgba(255,255,255,0.8)", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}>
            📋 Prethodne objave
          </button>
        )}
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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userEmail = searchParams.get("email")?.trim() || null;
  const callAI = useCallAI();
  const [step, setStep] = useState(1);
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState(null);
  const [tone, setTone] = useState("");
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [model, setModel] = useState(MODELS[0]);
  const [variations, setVariations] = useState(1);
  const [output, setOutput] = useState([]);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    setOutput([]);
    setStep(5);
    try {
      const lang = typeof language === "object" ? language : LANGUAGES.find(l => l.label === language) || LANGUAGES[0];
      const langInstruction = lang.prompt ? `CRITICAL: Write the ENTIRE post ONLY in ${lang.prompt}. The output must be 100% in ${lang.prompt} — no mixing with other languages.` : "";
      const system = `Ti si ekspert za pisanje Facebook objava. ${langInstruction} ${tone ? `Ton: ${TONES.find(t => t.id === tone)?.label}.` : ""} Napiši engaging, human post sa emoji-jima. Model: ${model.label}.${image ? " Analiziraj sliku i napiši post na osnovu nje." : ""}

VAŽNO: Piši SAMO čist tekst za društvene mreže. NEMOJ koristiti Markdown ili formatiranje: bez asteriskova (**), bez # naslova, bez bold, bez HTML tagova. Emoji su dozvoljeni.`;
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
        let text = await callAI(system, userContent, model);
        text = (text || "").trim().replace(/\*\*/g, "").replace(/#{1,6}\s?/g, "");
        results.push(text || "");
      }
      setOutput(results);
    } catch (e) {
      setOutput([e.message || "Greška. Pokušaj ponovo."]);
    }
    setLoading(false);
    setStep(6);
  };

  const reset = () => { setStep(1); setPrompt(""); setImage(null); setTone(""); setLanguage(LANGUAGES[0]); setModel(MODELS[0]); setVariations(1); setOutput([]); };

  const saveToSupabase = useCallback(
    async (content) => {
      if (!supabase) throw new Error("Supabase nije konfigurisan. Dodaj VITE_SUPABASE_URL i VITE_SUPABASE_ANON_KEY u .env");
      const lang = typeof language === "object" ? language?.label : language;
      const { error } = await supabase.from("generated_posts").insert({
        platform: "facebook",
        content,
        prompt: prompt || null,
        metadata: { language: lang, tone: tone || null },
        ...(userEmail && { user_email: userEmail }),
      });
      if (error) throw error;
    },
    [prompt, language, tone, userEmail]
  );

  return (
    <div style={{ minHeight: "100vh", background: "#090b11", fontFamily: "'Plus Jakarta Sans',sans-serif", color: "white" }}>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <ProgressBar step={step === 6 ? TOTAL_STEPS : step - 1} total={TOTAL_STEPS} />

      <div style={{ maxWidth: 580, margin: "0 auto", padding: "clamp(24px, 5vw, 48px) clamp(16px, 4vw, 24px) clamp(40px, 8vw, 60px)" }}>
        {step === 1 && <Step1 value={prompt} onChange={setPrompt} onNext={() => setStep(2)} onBack={() => navigate(userEmail ? `/?email=${encodeURIComponent(userEmail)}` : "/")} callAI={callAI} />}
        {step === 2 && <Step2 image={image} onImage={setImage} onClear={() => setImage(null)} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
        {step === 3 && <Step3 tone={tone} onTone={setTone} language={language} onLanguage={setLanguage} onNext={() => setStep(4)} onBack={() => setStep(2)} />}
        {step === 4 && <Step4 model={model} onModel={setModel} variations={variations} onVariations={setVariations} onGenerate={generate} onBack={() => setStep(3)} loading={loading} />}
        {step === 5 && <LoadingScreen />}
        {step === 6 && <ResultScreen results={output} onReset={reset} onRegenerate={generate} saveMeta={saveToSupabase} onViewHistory={() => navigate(userEmail ? `/?email=${encodeURIComponent(userEmail)}` : "/")} />}
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
        @keyframes logoPulse {
          0%,100% { box-shadow: 0 0 40px rgba(59,127,245,0.35), 0 0 80px rgba(226,105,42,0.15); transform: scale(1); }
          50% { box-shadow: 0 0 50px rgba(59,127,245,0.2), 0 0 100px rgba(226,105,42,0.4); transform: scale(1.02); }
        }
        @keyframes dotBounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideIn { from { opacity:0; transform:translateX(18px); } to { opacity:1; transform:translateX(0); } }
        @media (max-width: 640px) {
          button { min-height: 44px; }
        }
      `}</style>
    </div>
  );
}
