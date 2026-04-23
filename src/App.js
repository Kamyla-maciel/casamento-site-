import { useState, useEffect } from "react";
// Importação da conexão com o banco
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

// ── Paleta ──────────────────────────────────────
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

// ── Ícones inline ───────────────────────────────
const IcoCheck   = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8L6.5 11.5L13 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>;
const IcoX       = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>;
const IcoArrow   = () => <svg width="16" height="10" viewBox="0 0 16 10" fill="none"><path d="M1 1L8 8L15 1" stroke={C.azulClaro} strokeWidth="1.4" strokeLinecap="round"/></svg>;
const IcoStar    = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1l1.5 4.5H13L9.5 8l1.5 4.5L7 10 3 12.5 4.5 8 1 5.5h4.5z" stroke={C.azulClaro} strokeWidth="1" fill="none"/></svg>;
const IcoTrash   = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 3.5h10M5 3.5V2.5h4v1M5.5 6v4M8.5 6v4M3 3.5l.7 8h6.6l.7-8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>;
const IcoUsers   = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.3"/><path d="M1 13c0-2.5 2-4 5-4s5 1.5 5 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><circle cx="11.5" cy="5.5" r="2" stroke="currentColor" strokeWidth="1.3"/><path d="M13.5 13c0-2-1-3.2-2.5-3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>;
const IcoLock    = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><circle cx="8" cy="10.5" r="1" fill="currentColor"/></svg>;

// ════════════════════════════════════════════════
// TELA: CONFIRMAÇÃO (pública)
// ════════════════════════════════════════════════
function TelaConvidado({ onConfirmar }) {
  const [nome, setNome] = useState("");
  const [presenca, setPresenca] = useState(null); 
  const [mensagem, setMensagem] = useState("");
  const [erros, setErros] = useState({});
  const [enviado, setEnviado] = useState(false);
  const [nomeEnviado, setNomeEnviado] = useState("");

  function validar() {
    const e = {};
    if (!nome.trim()) e.nome = true;
    if (!presenca) e.presenca = true;
    return e;
  }

  async function confirmar() {
    const e = validar();
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
    } catch (err) {
      alert("Erro ao enviar. Tente novamente.");
    }
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
          <label style={s.label}>Mensagem para os noivos</label>
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

  function entrar() {
    if (senha === ADMIN_PASS) { setAutenticado(true); }
    else { setErroSenha(true); setTimeout(() => setErroSenha(false), 1500); }
  }

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
          onKeyDown={e => e.key === "Enter" && entrar()}
          placeholder="Senha do Painel"
        />
        <button style={{ ...s.btnEnviar, marginTop: 14, maxWidth: 260 }} onClick={entrar}>Entrar</button>
      </div>
    );
  }

  const confirmados = convidados.filter(c => c.presenca === "sim");
  const recusados   = convidados.filter(c => c.presenca === "nao");
  const listagem = filtro === "sim" ? confirmados : filtro === "nao" ? recusados : convidados;

  return (
    <div>
      <div style={s.resumoGrid}>
        <div style={s.resumoCard}>
          <span style={{ ...s.resumoNum, color: C.azulEscuro }}>{confirmados.length}</span>
          <span style={s.resumoLabel}>Confirmados</span>
        </div>
        <div style={s.resumoCard}>
          <span style={{ ...s.resumoNum, color: C.suave }}>{recusados.length}</span>
          <span style={s.resumoLabel}>Ausentes</span>
        </div>
        <div style={s.resumoCard}>
          <span style={{ ...s.resumoNum, color: C.azulMedio }}>{convidados.length}</span>
          <span style={s.resumoLabel}>Total</span>
        </div>
      </div>

      <div style={s.filtros}>
        {["todos", "sim", "nao"].map(v => (
          <button key={v} style={{ ...s.filtroBtn, ...(filtro === v ? s.filtroBtnAtivo : {}) }} onClick={() => setFiltro(v)}>
            {v === "todos" ? "Todos" : v === "sim" ? "Sim" : "Não"}
          </button>
        ))}
      </div>

      <div style={s.listaAdmin}>
        {listagem.map(c => (
          <div key={c.id} style={s.itemAdmin}>
            <div style={s.itemLeft}>
              <div style={s.itemNome}>{c.nome}</div>
              <div style={s.itemMeta}>{c.hora}</div>
              {c.mensagem && <div style={s.itemMsg}>{c.mensagem}</div>}
            </div>
            <button style={s.btnRemover} onClick={() => onRemover(c.id)}><IcoTrash /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════
// APP PRINCIPAL (FIREBASE CONNECTED)
// ════════════════════════════════════════════════
export default function App() {
  const [tela, setTela] = useState("rsvp");
  const [convidados, setConvidados] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // Carregar dados do Firebase ao abrir
  useEffect(() => {
    const buscarDados = async () => {
      try {
        const q = query(collection(db, "confirmacoes"), orderBy("timestamp", "desc"));
        const snapshot = await getDocs(q);
        const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setConvidados(lista);
      } catch (e) {
        console.error("Erro ao carregar:", e);
      } finally {
        setCarregando(false);
      }
    };
    buscarDados();
  }, []);

  // Salvar no Firebase
  const handleConfirmar = async (registro) => {
    try {
      const docRef = await addDoc(collection(db, "confirmacoes"), registro);
      setConvidados([{ id: docRef.id, ...registro }, ...convidados]);
    } catch (e) {
      console.error("Erro ao salvar:", e);
      throw e;
    }
  };

  // Remover do Firebase
  const handleRemover = async (id) => {
    if (!window.confirm("Remover esta confirmação?")) return;
    try {
      await deleteDoc(doc(db, "confirmacoes", id));
      setConvidados(convidados.filter(c => c.id !== id));
    } catch (e) {
      console.error("Erro ao remover:", e);
    }
  };

  return (
    <div style={s.page}>
      <section style={s.hero}>
        <div style={s.heroContent}>
          <div style={s.monoWrap}>
            <div style={s.anel}/>
            <svg viewBox="0 0 200 200" fill="none" style={{ width: "100%", height: "100%" }}>
              <circle cx="100" cy="100" r="96" fill="white" stroke="#b5c2d5" strokeWidth="1"/>
              <text x="34" y="127" fontFamily="Georgia, serif" fontSize="82" fill="#42567b">E</text>
              <text x="83" y="120" fontFamily="Georgia, serif" fontSize="36" fontStyle="italic" fill="#b5c2d5">e</text>
              <text x="106" y="127" fontFamily="Georgia, serif" fontSize="82" fill="#42567b">L</text>
            </svg>
          </div>
          <h1 style={s.nomes}>Erica <em style={{ color: C.azulMedio }}>&</em> Leandreson</h1>
          <p style={s.subtitulo}>Coríntios 13:13</p>
          <p style={s.tagData}>◆ Confirme sua presença ◆</p>
        </div>
      </section>

      <section id="rsvp-sec" style={s.secaoForm}>
        <div style={s.abas}>
          <button style={{ ...s.aba, ...(tela === "rsvp" ? s.abaAtiva : {}) }} onClick={() => setTela("rsvp")}>Confirmar</button>
          <button style={{ ...s.aba, ...(tela === "admin" ? s.abaAtiva : {}) }} onClick={() => setTela("admin")}>Painel</button>
        </div>

        <div style={s.formCard}>
          {carregando 
            ? <p style={{textAlign:'center', color:C.suave}}>Carregando...</p>
            : tela === "rsvp" 
              ? <TelaConvidado onConfirmar={handleConfirmar}/> 
              : <TelaAdmin convidados={convidados} onRemover={handleRemover}/>
          }
        </div>
      </section>

      <footer style={s.footer}>E & L — Com amor, aguardamos você</footer>
      
      <style>{`
        @keyframes girar { to { transform: rotate(360deg); } }
        body { margin: 0; padding: 0; }
      `}</style>
    </div>
  );
}

// ── Estilos (Simplificados para o exemplo) ──
const s = {
  page: { fontFamily: "Georgia, serif", background: C.fundo, minHeight: "100vh" },
  hero: { minHeight: "80vh", display: "flex", justifyContent: "center", alignItems: "center", textAlign: "center" },
  monoWrap: { position: "relative", width: 160, height: 160, margin: "0 auto 24px" },
  anel: { position: "absolute", inset: -10, borderRadius: "50%", border: "1px solid rgba(181,194,213,.4)", animation: "girar 20s linear infinite" },
  nomes: { fontSize: "3rem", color: C.azulEscuro, margin: 0 },
  subtitulo: { fontStyle: "italic", color: C.azulMedio, margin: "8px 0" },
  tagData: { fontSize: 10, letterSpacing: 3, color: C.suave, textTransform: "uppercase" },
  secaoForm: { padding: "60px 20px", display: "flex", flexDirection: "column", alignItems: "center", background: C.creme },
  abas: { display: "flex", gap: 10, marginBottom: 30 },
  aba: { padding: "10px 20px", border: "1px solid #b5c2d5", background: "none", cursor: "pointer", borderRadius: 4, color: C.suave },
  abaAtiva: { background: C.azulEscuro, color: "white", borderColor: C.azulEscuro },
  formCard: { background: "white", padding: 30, borderRadius: 8, width: "100%", maxWidth: 500, boxShadow: "0 10px 30px rgba(0,0,0,0.05)" },
  campo: { marginBottom: 20, textAlign: "left" },
  label: { display: "block", fontSize: 11, textTransform: "uppercase", marginBottom: 8, color: C.azulMedio },
  input: { width: "100%", padding: 12, border: "1px solid #ddd", borderRadius: 4, background: C.fundo },
  inputErro: { borderColor: "#c04" },
  opcoes: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  opcao: { padding: 12, border: "1px solid #ddd", background: C.fundo, cursor: "pointer" },
  opcaoAtiva: { background: C.azulEscuro, color: "white" },
  btnEnviar: { width: "100%", padding: 15, background: C.azulEscuro, color: "white", border: "none", cursor: "pointer", textTransform: "uppercase", letterSpacing: 2 },
  sucessoWrap: { textAlign: "center" },
  sucessoIcone: { fontSize: 30, marginBottom: 15 },
  sucessoTitulo: { color: C.azulEscuro },
  sucessoTexto: { color: C.suave },
  resumoGrid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 },
  resumoCard: { background: C.fundo, padding: 15, borderRadius: 4 },
  resumoNum: { fontSize: 24, display: "block" },
  resumoLabel: { fontSize: 9, textTransform: "uppercase" },
  filtros: { display: "flex", gap: 5, marginBottom: 15 },
  filtroBtn: { padding: "5px 10px", fontSize: 11, border: "1px solid #ddd", cursor: "pointer" },
  filtroBtnAtivo: { background: C.azulEscuro, color: "white" },
  listaAdmin: { textAlign: "left" },
  itemAdmin: { padding: 15, borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between" },
  itemNome: { fontWeight: "bold", color: C.texto },
  itemMeta: { fontSize: 10, color: C.suave },
  itemMsg: { fontSize: 12, fontStyle: "italic", color: C.azulMedio },
  btnRemover: { background: "none", border: "none", cursor: "pointer", color: "#ccc" },
  footer: { padding: 40, background: C.azulEscuro, color: "white", textAlign: "center", fontSize: 11, letterSpacing: 2 }
};