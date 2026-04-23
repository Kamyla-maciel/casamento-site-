import { useState, useEffect } from "react";
import { db } from "./firebaseConfig"; 
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  orderBy 
} from "firebase/firestore";

// ── Paleta de Cores Original ────────────────────
const C = {
  azulEscuro: "#42567b",
  azulMedio:  "#7a93b8",
  azulClaro:  "#b5c2d5",
  fundo:      "#f4f1ed",
  creme:      "#faf8f5",
  texto:      "#2a3242",
  suave:      "#8896a8",
  branco:     "#ffffff",
};

const ADMIN_PASS = "EL2025"; 

// ── Ícones ──────────────────────────────────────
const IcoCheck   = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8L6.5 11.5L13 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>;
const IcoX       = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>;
const IcoArrow   = () => <svg width="16" height="10" viewBox="0 0 16 10" fill="none"><path d="M1 1L8 8L15 1" stroke={C.azulClaro} strokeWidth="1.4" strokeLinecap="round"/></svg>;
const IcoStar    = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1l1.5 4.5H13L9.5 8l1.5 4.5L7 10 3 12.5 4.5 8 1 5.5h4.5z" stroke={C.azulClaro} strokeWidth="1" fill="none"/></svg>;
const IcoTrash   = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 3.5h10M5 3.5V2.5h4v1M5.5 6v4M8.5 6v4M3 3.5l.7 8h6.6l.7-8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>;
const IcoUsers   = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.3"/><path d="M1 13c0-2.5 2-4 5-4s5 1.5 5 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><circle cx="11.5" cy="5.5" r="2" stroke="currentColor" strokeWidth="1.3"/><path d="M13.5 13c0-2-1-3.2-2.5-3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>;
const IcoLock    = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><circle cx="8" cy="10.5" r="1" fill="currentColor"/></svg>;

// ════════════════════════════════════════════════
// TELA: CONFIRMAÇÃO
// ════════════════════════════════════════════════
function TelaConvidado({ onConfirmar }) {
  const [nome, setNome] = useState("");
  const [presenca, setPresenca] = useState(null); 
  const [mensagem, setMensagem] = useState("");
  const [erros, setErros] = useState({});
  const [enviado, setEnviado] = useState(false);
  const [nomeEnviado, setNomeEnviado] = useState("");

  async function confirmar() {
    const e = {};
    if (!nome.trim()) e.nome = true;
    if (!presenca) e.presenca = true;
    if (Object.keys(e).length) { setErros(e); return; }

    const registro = {
      nome: nome.trim(),
      presenca,
      mensagem: mensagem.trim() || null,
      hora: new Date().toLocaleString("pt-BR"),
      timestamp: Date.now()
    };

    try {
      await onConfirmar(registro);
      setNomeEnviado(nome.trim());
      setEnviado(true);
    } catch (err) { alert("Erro ao enviar. Tente novamente."); }
  }

  if (enviado) {
    const vai = presenca === "sim";
    return (
      <div style={s.sucessoWrap}>
        <div style={s.sucessoIcone}>{vai ? <IcoCheck /> : <IcoX />}</div>
        <h3 style={s.sucessoTitulo}>{vai ? "Até breve! ✦" : "Obrigado por avisar"}</h3>
        <p style={s.sucessoTexto}>
          {vai 
            ? <>Que alegria, <strong>{nomeEnviado}</strong>!<br/>Sua presença foi registrada.</>
            : <>Sentiremos sua falta, <strong>{nomeEnviado}</strong>.<br/>Agradecemos o aviso.</>}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div style={s.campo}>
        <label style={s.label}>Seu nome completo</label>
        <input
          style={{ ...s.input, ...(erros.nome ? s.inputErro : {}) }}
          value={nome}
          onChange={e => { setNome(e.target.value); setErros(p => ({...p, nome: false})); }}
          placeholder="Como consta no convite"
        />
      </div>

      <div style={s.campo}>
        <label style={{ ...s.label, ...(erros.presenca ? { color: "#c04" } : {}) }}>
          {erros.presenca ? "Selecione uma opção ↓" : "Você irá comparecer?"}
        </label>
        <div style={s.opcoes}>
          {["sim", "nao"].map(v => (
            <button
              key={v}
              onClick={() => { setPresenca(v); setErros(p => ({...p, presenca: false})); }}
              style={{ ...s.opcao, ...(presenca === v ? s.opcaoAtiva : {}), ...(erros.presenca ? { borderColor: "#c04" } : {}) }}
            >
              {v === "sim" ? <><IcoCheck /> Sim, estarei lá</> : <><IcoX /> Não poderei ir</>}
            </button>
          ))}
        </div>
      </div>

      {presenca && (
        <div style={s.campo}>
          <label style={s.label}>Mensagem para os noivos <span style={{ opacity: .5, textTransform: "none" }}>(opcional)</span></label>
          <input
            style={s.input}
            value={mensagem}
            onChange={e => setMensagem(e.target.value)}
            placeholder="Deixe um recadinho especial ✦"
          />
        </div>
      )}

      <button style={s.btnEnviar} onClick={confirmar}>Confirmar Presença</button>
    </div>
  );
}

// ════════════════════════════════════════════════
// TELA: ADMIN
// ════════════════════════════════════════════════
function TelaAdmin({ convidados, onRemover }) {
  const [autenticado, setAutenticado] = useState(false);
  const [senha, setSenha] = useState("");
  const [erroSenha, setErroSenha] = useState(false);
  const [filtro, setFiltro] = useState("todos");

  if (!autenticado) {
    return (
      <div style={s.loginWrap}>
        <div style={s.loginIcone}><IcoLock /></div>
        <h3 style={s.sucessoTitulo}>Área Restrita</h3>
        <input
          type="password"
          style={{ ...s.input, ...(erroSenha ? s.inputErro : {}), maxWidth: 260, textAlign: "center" }}
          value={senha}
          onChange={e => setSenha(e.target.value)}
          onKeyDown={e => e.key === "Enter" && (senha === ADMIN_PASS ? setAutenticado(true) : setErroSenha(true))}
          placeholder="Senha do Painel"
        />
        <button style={{ ...s.btnEnviar, marginTop: 14, maxWidth: 260 }} onClick={() => senha === ADMIN_PASS ? setAutenticado(true) : setErroSenha(true)}>Entrar</button>
      </div>
    );
  }

  const listagem = convidados.filter(c => filtro === "todos" ? true : c.presenca === filtro);

  return (
    <div>
      <div style={s.resumoGrid}>
        <div style={s.resumoCard}><span style={s.resumoNum}>{convidados.filter(c=>c.presenca==="sim").length}</span><span style={s.resumoLabel}>Sim</span></div>
        <div style={s.resumoCard}><span style={s.resumoNum}>{convidados.filter(c=>c.presenca==="nao").length}</span><span style={s.resumoLabel}>Não</span></div>
        <div style={s.resumoCard}><span style={s.resumoNum}>{convidados.length}</span><span style={s.resumoLabel}>Total</span></div>
      </div>
      <div style={s.filtros}>
        {["todos", "sim", "nao"].map(v => (
          <button key={v} style={{ ...s.filtroBtn, ...(filtro === v ? s.filtroBtnAtivo : {}) }} onClick={() => setFiltro(v)}>{v.toUpperCase()}</button>
        ))}
      </div>
      <div style={s.listaAdmin}>
        {listagem.map(c => (
          <div key={c.id} style={s.itemAdmin}>
            <div>
              <div style={s.itemNome}>{c.nome} {c.presenca === "sim" ? "✓" : "✕"}</div>
              <div style={s.itemMeta}>{c.hora}</div>
              {c.mensagem && <div style={s.itemMsg}>"{c.mensagem}"</div>}
            </div>
            <button style={s.btnRemover} onClick={() => onRemover(c.id)}><IcoTrash /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════
// APP PRINCIPAL
// ════════════════════════════════════════════════
export default function App() {
  const [tela, setTela] = useState("rsvp");
  const [convidados, setConvidados] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      const q = query(collection(db, "confirmacoes"), orderBy("timestamp", "desc"));
      const snap = await getDocs(q);
      setConvidados(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setCarregando(false);
    };
    carregar();
  }, []);

  const handleConfirmar = async (reg) => {
    const docRef = await addDoc(collection(db, "confirmacoes"), reg);
    setConvidados([{ id: docRef.id, ...reg }, ...convidados]);
  };

  const handleRemover = async (id) => {
    if (window.confirm("Remover?")) {
      await deleteDoc(doc(db, "confirmacoes", id));
      setConvidados(convidados.filter(c => c.id !== id));
    }
  };

  return (
    <div style={s.page}>
      <section style={s.hero}>
        {["tl","tr","bl","br"].map(p => <div key={p} style={{...s.corner, ...s[`corner_${p}`]}}/>)}
        <div style={s.heroOverlay}/>
        <div style={s.heroContent}>
          <div style={s.monoWrap}>
            <div style={s.anel}/>
            <svg viewBox="0 0 200 200" fill="none" style={{ width: "100%", height: "100%", filter: "drop-shadow(0 8px 32px rgba(66,86,123,.18))" }}>
              <circle cx="100" cy="100" r="96" fill="white" stroke="#b5c2d5" strokeWidth="1"/>
              <text x="34" y="127" fontFamily="Georgia, serif" fontSize="82" fill="#42567b">E</text>
              <text x="83" y="120" fontFamily="Georgia, serif" fontSize="36" fontStyle="italic" fill="#b5c2d5">e</text>
              <text x="106" y="127" fontFamily="Georgia, serif" fontSize="82" fill="#42567b">L</text>
            </svg>
          </div>
          <h1 style={s.nomes}>Erica <em style={{ color: C.azulMedio, fontStyle: "italic", fontSize: "0.6em" }}>&</em> Leandreson</h1>
          <p style={s.subtitulo}>Coríntios 13:13</p>
          <div style={s.tagLinha}>
            <span style={s.tagLinha_linha}/><p style={s.tagLinha_txt}>Você está convidado</p><span style={s.tagLinha_linha}/>
          </div>
          <p style={s.tagData}>◆ Confirme sua presença abaixo ◆</p>
          <button style={s.setaBaixo} onClick={() => document.getElementById("rsvp-sec").scrollIntoView({ behavior: "smooth" })}>
            <p style={s.setaBaixoTxt}>rsvp</p><IcoArrow />
          </button>
        </div>
      </section>

      <section id="rsvp-sec" style={s.secaoForm}>
        <div style={s.abas}>
          <button style={{ ...s.aba, ...(tela === "rsvp" ? s.abaAtiva : {}) }} onClick={() => setTela("rsvp")}>Confirmar Presença</button>
          <button style={{ ...s.aba, ...(tela === "admin" ? s.abaAtiva : {}) }} onClick={() => setTela("admin")}><IcoUsers /> Painel</button>
        </div>
        <div style={s.divisor}><span style={s.divisorLinha}/><IcoStar /><span style={s.divisorLinha}/></div>
        <div style={s.formCard}>
          {carregando ? <p>Carregando...</p> : tela === "rsvp" ? <TelaConvidado onConfirmar={handleConfirmar}/> : <TelaAdmin convidados={convidados} onRemover={handleRemover}/>}
        </div>
      </section>

      <footer style={s.footer}><strong>E & L — Erica & Leandreson</strong><br/>Com amor, aguardamos sua presença</footer>
      <style>{`@keyframes girar { to { transform: rotate(360deg); } } body { margin: 0; }`}</style>
    </div>
  );
}

// ── Estilos Finais (Design Original Restaurado) ──
const s = {
  page: { fontFamily: "'Georgia', serif", background: C.fundo, minHeight: "100vh", color: C.texto },
  hero: { minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", padding: "60px 24px", background: C.fundo },
  heroOverlay: { position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(-45deg, transparent, transparent 28px, rgba(181,194,213,.1) 28px, rgba(181,194,213,.1) 29px)", pointerEvents: "none" },
  corner: { position: "absolute", width: 80, height: 80, borderColor: C.azulClaro, borderStyle: "solid", opacity: .5 },
  corner_tl: { top: 24, left: 24, borderWidth: "1px 0 0 1px" },
  corner_tr: { top: 24, right: 24, borderWidth: "1px 1px 0 0" },
  corner_bl: { bottom: 24, left: 24, borderWidth: "0 0 1px 1px" },
  corner_br: { bottom: 24, right: 24, borderWidth: "0 1px 1px 0" },
  heroContent: { position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" },
  monoWrap: { position: "relative", width: 190, height: 190, marginBottom: 36 },
  anel: { position: "absolute", inset: -16, borderRadius: "50%", border: `1px solid rgba(181,194,213,.5)`, animation: "girar 30s linear infinite" },
  nomes: { fontSize: "clamp(2.5rem, 7vw, 4rem)", fontWeight: 300, color: C.azulEscuro, margin: 0 },
  subtitulo: { fontStyle: "italic", fontSize: 18, color: C.azulMedio, marginTop: 10 },
  tagLinha: { display: "flex", alignItems: "center", gap: 12, margin: "30px 0" },
  tagLinha_linha: { width: 40, height: 1, background: C.azulMedio, opacity: 0.5 },
  tagLinha_txt: { fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: C.azulMedio },
  tagData: { fontSize: 11, letterSpacing: 4, textTransform: "uppercase", color: C.suave },
  setaBaixo: { marginTop: 40, background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 },
  setaBaixoTxt: { fontSize: 10, letterSpacing: 3, color: C.suave, textTransform: "uppercase" },
  secaoForm: { background: C.creme, padding: "80px 20px", display: "flex", flexDirection: "column", alignItems: "center" },
  abas: { display: "flex", gap: 10, marginBottom: 30 },
  aba: { background: "none", border: `1px solid #b5c2d5`, padding: "10px 20px", cursor: "pointer", color: C.suave, fontFamily: "Georgia" },
  abaAtiva: { background: C.azulEscuro, color: "white", borderColor: C.azulEscuro },
  divisor: { display: "flex", alignItems: "center", gap: 15, marginBottom: 40 },
  divisorLinha: { width: 60, height: 1, background: C.azulClaro },
  formCard: { background: "white", padding: "40px", borderRadius: 4, width: "100%", maxWidth: 500, boxShadow: "0 15px 50px rgba(66,86,123,.1)", textAlign: "center" },
  campo: { marginBottom: 20, textAlign: "left" },
  label: { display: "block", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: C.azulMedio, marginBottom: 8 },
  input: { width: "100%", padding: 12, background: C.fundo, border: "1px solid rgba(181,194,213,.5)", borderRadius: 2, boxSizing: "border-box" },
  inputErro: { borderColor: "#c04" },
  opcoes: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  opcao: { padding: 12, border: "1px solid #b5c2d5", background: C.fundo, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 },
  opcaoAtiva: { background: C.azulEscuro, color: "white" },
  btnEnviar: { width: "100%", padding: 16, background: C.azulEscuro, color: "white", border: "none", cursor: "pointer", letterSpacing: 3, textTransform: "uppercase", fontSize: 11, marginTop: 10 },
  sucessoWrap: { padding: "20px 0" },
  sucessoIcone: { width: 60, height: 60, borderRadius: "50%", background: "rgba(181,194,213,.2)", margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center", color: C.azulEscuro },
  sucessoTitulo: { color: C.azulEscuro, fontWeight: 300 },
  sucessoTexto: { color: C.suave, fontSize: 14, lineHeight: 1.6 },
  resumoGrid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 30 },
  resumoCard: { background: C.fundo, padding: 15, borderRadius: 4 },
  resumoNum: { fontSize: 28, display: "block", color: C.azulEscuro },
  resumoLabel: { fontSize: 9, color: C.suave, textTransform: "uppercase" },
  filtros: { display: "flex", gap: 10, marginBottom: 20 },
  filtroBtn: { padding: "6px 12px", border: "1px solid #ddd", background: "none", cursor: "pointer", fontSize: 10 },
  filtroBtnAtivo: { background: C.azulEscuro, color: "white" },
  listaAdmin: { textAlign: "left" },
  itemAdmin: { padding: "15px 0", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  itemNome: { fontWeight: "bold", color: C.texto },
  itemMeta: { fontSize: 10, color: C.suave, marginTop: 2 },
  itemMsg: { fontSize: 12, fontStyle: "italic", color: C.azulMedio, marginTop: 5 },
  btnRemover: { background: "none", border: "none", color: "#ccc", cursor: "pointer" },
  footer: { padding: "40px 20px", background: C.azulEscuro, color: "rgba(255,255,255,0.6)", textAlign: "center", fontSize: 11, lineHeight: 1.8, letterSpacing: 1 }
};


