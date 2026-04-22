

import { useState, useEffect } from "react";

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

// ── Helpers ─────────────────────────────────────
const STORAGE_KEY = "casamento-rsvp-convidados";
const ADMIN_PASS  = "EL2025"; 

async function salvar(lista) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
  } catch (e) { console.error("Erro ao salvar:", e); }
}

async function carregar() {
  try {
    const r = localStorage.getItem(STORAGE_KEY);
    return r ? JSON.parse(r) : [];
  } catch { return []; }
}

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
  const [nome,       setNome]       = useState("");
  const [acomp,      setAcomp]      = useState("0");
  const [presenca,   setPresenca]   = useState(null);    // "sim" | "nao"
  const [restricao,  setRestricao]  = useState("nenhuma");
  const [mensagem,   setMensagem]   = useState("");
  const [erros,      setErros]      = useState({});
  const [enviado,    setEnviado]    = useState(false);
  const [nomeEnviado,setNomeEnviado]= useState("");

  function validar() {
    const e = {};
    if (!nome.trim())   e.nome = true;
    if (!presenca)      e.presenca = true;
    return e;
  }

  function confirmar() {
    const e = validar();
    if (Object.keys(e).length) { setErros(e); return; }

    const registro = {
      id:        Date.now(),
      nome:      nome.trim(),
      acomp:     parseInt(acomp),
      presenca,
      restricao: presenca === "sim" ? restricao : null,
      mensagem:  mensagem.trim() || null,
      hora:      new Date().toLocaleString("pt-BR"),
    };

    onConfirmar(registro);
    setNomeEnviado(nome.trim());
    setEnviado(true);
  }

  // ── Tela de sucesso ──────────────────────────
  if (enviado) {
    const vai = presenca === "sim";
    return (
      <div style={s.sucessoWrap}>
        <div style={s.sucessoIcone}>
          {vai ? <IcoCheck /> : <IcoX />}
        </div>
        <h3 style={s.sucessoTitulo}>{vai ? "Até breve! ✦" : "Obrigado por avisar"}</h3>
        <p style={s.sucessoTexto}>
          {vai
            ? <>Que alegria, <strong>{nomeEnviado}</strong>!<br/>Sua presença foi registrada com sucesso.</>
            : <>Sentiremos sua falta, <strong>{nomeEnviado}</strong>.<br/>Agradecemos por nos avisar.</>}
        </p>
      </div>
    );
  }

  // ── Formulário ───────────────────────────────
  return (
    <div>
      {/* Campo nome */}
      <div style={s.campo}>
        <label style={s.label}>Seu nome completo</label>
        <input
          style={{ ...s.input, ...(erros.nome ? s.inputErro : {}) }}
          value={nome}
          onChange={e => { setNome(e.target.value); setErros(p => ({...p, nome: false})); }}
          placeholder="Como consta no convite"
          onFocus={e => e.target.style.borderColor = C.azulMedio}
          onBlur={e  => e.target.style.borderColor = erros.nome ? "#e06" : "rgba(181,194,213,.5)"}
        />
      </div>


      {/* Confirmação */}
      <div style={s.campo}>
        <label style={{ ...s.label, ...(erros.presenca ? { color: "#c04" } : {}) }}>
          {erros.presenca ? "Selecione uma opção ↓" : "Você irá comparecer?"}
        </label>
        <div style={s.opcoes}>
          {["sim", "nao"].map(v => (
            <button
              key={v}
              onClick={() => { setPresenca(v); setErros(p => ({...p, presenca: false})); }}
              style={{
                ...s.opcao,
                ...(presenca === v ? s.opcaoAtiva : {}),
                ...(erros.presenca ? { borderColor: "#c04" } : {}),
              }}
            >
              {v === "sim" ? <><IcoCheck /> Sim, estarei lá</> : <><IcoX /> Não poderei ir</>}
            </button>
          ))}
        </div>
      </div>

      {/* Restrição alimentar — só se confirmar presença */}
      {presenca === "sim" && (
        <div style={s.campo}>
          <label style={s.label}>Restrição alimentar</label>
          <select style={s.select} value={restricao} onChange={e => setRestricao(e.target.value)}>
            <option value="nenhuma">Nenhuma restrição</option>
            <option value="vegetariano">Vegetariano</option>
            <option value="vegano">Vegano</option>
            <option value="sem-gluten">Sem glúten</option>
            <option value="sem-lactose">Sem lactose</option>
          </select>
        </div>
      )}

      {/* Mensagem */}
      {presenca && (
        <div style={s.campo}>
          <label style={s.label}>Mensagem para os noivos <span style={{ opacity: .5, textTransform: "none", letterSpacing: 0 }}>(opcional)</span></label>
          <input
            style={s.input}
            value={mensagem}
            onChange={e => setMensagem(e.target.value)}
            placeholder="Deixe um recadinho especial ✦"
            onFocus={e => e.target.style.borderColor = C.azulMedio}
            onBlur={e  => e.target.style.borderColor = "rgba(181,194,213,.5)"}
          />
        </div>
      )}

      <button style={s.btnEnviar} onClick={confirmar}
        onMouseEnter={e => e.target.style.background = "#354a6a"}
        onMouseLeave={e => e.target.style.background = C.azulEscuro}>
        Confirmar Presença
      </button>
    </div>
  );
}

// ════════════════════════════════════════════════
// TELA: ADMIN (protegida por senha)
// ════════════════════════════════════════════════
function TelaAdmin({ convidados, onRemover }) {
  const [autenticado, setAutenticado] = useState(false);
  const [senha,       setSenha]       = useState("");
  const [erroSenha,   setErroSenha]   = useState(false);
  const [filtro,      setFiltro]      = useState("todos"); // todos | sim | nao

  function entrar() {
    if (senha === ADMIN_PASS) { setAutenticado(true); }
    else { setErroSenha(true); setTimeout(() => setErroSenha(false), 1500); }
  }

  if (!autenticado) {
    return (
      <div style={s.loginWrap}>
        <div style={s.loginIcone}><IcoLock /></div>
        <h3 style={{ ...s.sucessoTitulo, marginBottom: 6 }}>Área Restrita</h3>
        <p style={{ ...s.sucessoTexto, marginBottom: 28 }}>Insira a senha para acessar o painel</p>
        <input
          type="password"
          style={{ ...s.input, ...(erroSenha ? s.inputErro : {}), maxWidth: 260, textAlign: "center" }}
          value={senha}
          onChange={e => setSenha(e.target.value)}
          onKeyDown={e => e.key === "Enter" && entrar()}
          placeholder="••••••"
        />
        <button style={{ ...s.btnEnviar, marginTop: 14, maxWidth: 260 }} onClick={entrar}>
          Entrar
        </button>
        {erroSenha && <p style={{ color: "#c04", fontSize: 12, marginTop: 10, letterSpacing: 1 }}>Senha incorreta</p>}
      </div>
    );
  }

  // ── Painel autenticado ───────────────────────
  const confirmados = convidados.filter(c => c.presenca === "sim");
  const recusados   = convidados.filter(c => c.presenca === "nao");
  const totalPessoas = confirmados.reduce((acc, c) => acc + 1 + c.acomp, 0);

  const listagem = filtro === "sim" ? confirmados
                 : filtro === "nao" ? recusados
                 : convidados;

  return (
    <div>
      {/* Cards de resumo */}
      <div style={s.resumoGrid}>
        {[
          { label: "Confirmados",   valor: confirmados.length, sub: `${totalPessoas} pessoas no total`, cor: C.azulEscuro },
          { label: "Não virão",     valor: recusados.length,   sub: "aguardando resposta",              cor: C.suave },
          { label: "Total RSVP",    valor: convidados.length,  sub: "respostas recebidas",              cor: C.azulMedio },
        ].map(({ label, valor, sub, cor }) => (
          <div key={label} style={s.resumoCard}>
            <span style={{ ...s.resumoNum, color: cor }}>{valor}</span>
            <span style={s.resumoLabel}>{label}</span>
            <span style={s.resumoSub}>{sub}</span>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={s.filtros}>
        {[["todos","Todos"], ["sim","Confirmados"], ["nao","Não virão"]].map(([v, l]) => (
          <button key={v} style={{ ...s.filtroBtn, ...(filtro === v ? s.filtroBtnAtivo : {}) }}
            onClick={() => setFiltro(v)}>{l}
          </button>
        ))}
      </div>

      {/* Lista */}
      {listagem.length === 0 ? (
        <p style={{ textAlign: "center", color: C.suave, fontSize: 13, padding: "32px 0" }}>
          Nenhuma resposta ainda.
        </p>
      ) : (
        <div style={s.listaAdmin}>
          {listagem.map(c => (
            <div key={c.id} style={s.itemAdmin}>
              <div style={s.itemLeft}>
                <span style={{ ...s.itemBadge, background: c.presenca === "sim" ? "rgba(66,86,123,.12)" : "rgba(136,150,168,.1)", color: c.presenca === "sim" ? C.azulEscuro : C.suave }}>
                  {c.presenca === "sim" ? "✓" : "✕"}
                </span>
                <div>
                  <p style={s.itemNome}>{c.nome}</p>
                  <p style={s.itemMeta}>
                    {c.presenca === "sim"
                      ? `${1 + c.acomp} ${1 + c.acomp === 1 ? "pessoa" : "pessoas"}${c.restricao && c.restricao !== "nenhuma" ? ` · ${c.restricao}` : ""}`
                      : "Não confirmou presença"}
                    {" · "}{c.hora}
                  </p>
                  {c.mensagem && <p style={s.itemMsg}>"{c.mensagem}"</p>}
                </div>
              </div>
              <button style={s.btnRemover} title="Remover"
                onClick={() => onRemover(c.id)}
                onMouseEnter={e => e.currentTarget.style.color = "#c04"}
                onMouseLeave={e => e.currentTarget.style.color = C.suave}>
                <IcoTrash />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════
// APP PRINCIPAL
// ════════════════════════════════════════════════
export default function App() {
  const [tela,       setTela]       = useState("rsvp");   // "rsvp" | "admin"
  const [convidados, setConvidados] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregar().then(lista => {
      setConvidados(lista);
      setCarregando(false);
    });
  }, []);

  async function handleConfirmar(registro) {
    const nova = [...convidados, registro];
    setConvidados(nova);
    await salvar(nova);
  }

  async function handleRemover(id) {
    const nova = convidados.filter(c => c.id !== id);
    setConvidados(nova);
    await salvar(nova);
  }

  return (
    <div style={s.page}>

      {/* ── HERO ─────────────────────────────── */}
      <section style={s.hero}>
        {/* Cantos decorativos */}
        {["tl","tr","bl","br"].map(p => <div key={p} style={{...s.corner, ...s[`corner_${p}`]}}/>)}

        {/* Linhas de fundo */}
        <div style={s.heroOverlay}/>

        <div style={s.heroContent}>

          {/* Monograma */}
          <div style={s.monoWrap}>
            <div style={s.anel}/>
            <svg viewBox="0 0 200 200" fill="none" style={{ width: "100%", height: "100%", filter: "drop-shadow(0 8px 32px rgba(66,86,123,.18))" }}>
              <circle cx="100" cy="100" r="96" fill="white" stroke="#b5c2d5" strokeWidth="1"/>
              <circle cx="100" cy="100" r="80" fill="none" stroke="#b5c2d5" strokeWidth="0.5" strokeDasharray="4 6"/>
              <text x="34" y="127" fontFamily="Georgia, serif" fontSize="82" fontWeight="300" fill="#42567b">E</text>
              <text x="83" y="120" fontFamily="Georgia, serif" fontSize="36" fontStyle="italic" fontWeight="300" fill="#b5c2d5">e</text>
              <text x="106" y="127" fontFamily="Georgia, serif" fontSize="82" fontWeight="300" fill="#42567b">L</text>
              <rect x="97" y="30" width="6" height="6" transform="rotate(45 100 33)" fill="#b5c2d5" opacity="0.7"/>
              <rect x="97" y="158" width="6" height="6" transform="rotate(45 100 161)" fill="#b5c2d5" opacity="0.7"/>
            </svg>
          </div>

          <h1 style={{ ...s.nomes, textAlign: "center", width: "100%", marginTop: 8 }}>Erica <em style={{ color: C.azulMedio, fontStyle: "italic", fontSize: "0.6em", margin: "0 8px" }}>&</em> Leandreson</h1>
          <p style={s.subtitulo}>Coríntios 13:13</p>

          <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "32px 0 0" }}>
            <span style={s.tagLinha_linha}/>
            <p style={s.tagLinha_txt}>Você está convidado</p>
            <span style={s.tagLinha_linha}/>
          </div>

          <p style={{ ...s.tagData, marginTop: 16 }}>◆ &nbsp; Confirme sua presença abaixo &nbsp; ◆</p>

          <button style={s.setaBaixo} onClick={() => document.getElementById("rsvp-sec").scrollIntoView({ behavior: "smooth" })}>
            <p style={s.setaBaixoTxt}>rsvp</p>
            <IcoArrow />
          </button>
        </div>
      </section>

      {/* ── SEÇÃO FORMULÁRIO / ADMIN ──────────── */}
      <section id="rsvp-sec" style={s.secaoForm}>

        {/* Abas */}
        <div style={s.abas}>
          {[["rsvp","Confirmar Presença"], ["admin","Painel "]].map(([v, l]) => (
            <button key={v} style={{ ...s.aba, ...(tela === v ? s.abaAtiva : {}) }} onClick={() => setTela(v)}>
              {v === "admin" && <IcoUsers />}{l}
            </button>
          ))}
        </div>

        {/* Divisor ornamental */}
        <div style={s.divisor}>
          <span style={s.divisorLinha}/><IcoStar /><span style={{ ...s.divisorLinha, transform: "scaleX(-1)" }}/>
        </div>

        {/* Card principal */}
        <div style={s.formCard}>
          {carregando
            ? <p style={{ textAlign: "center", color: C.suave, padding: 40 }}>Carregando…</p>
            : tela === "rsvp"
              ? <TelaConvidado onConfirmar={handleConfirmar}/>
              : <TelaAdmin convidados={convidados} onRemover={handleRemover}/>
          }
        </div>

      </section>

      {/* ── RODAPÉ ───────────────────────────── */}
      <footer style={s.footer}>
        <strong style={{ color: C.azulClaro, fontWeight: 400 }}>E &amp; L — Erica &amp; Leandreson</strong>
        &nbsp;·&nbsp; Com amor, aguardamos sua presença
      </footer>

      {/* Keyframe anel */}
      <style>{`
        @keyframes girar { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; }
        body { margin: 0; }
      `}</style>
    </div>
  );
}

// ════════════════════════════════════════════════
// ESTILOS
// ════════════════════════════════════════════════
const s = {
  page: { fontFamily: "'Georgia', serif", background: C.fundo, minHeight: "100vh", color: C.texto },

  // Hero
  hero: { minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", padding: "60px 24px", background: C.fundo },
  heroOverlay: { position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(-45deg, transparent, transparent 28px, rgba(181,194,213,.1) 28px, rgba(181,194,213,.1) 29px)", pointerEvents: "none" },
  corner: { position: "absolute", width: 80, height: 80, borderColor: C.azulClaro, borderStyle: "solid", opacity: .5 },
  corner_tl: { top: 24, left: 24, borderWidth: "1px 0 0 1px" },
  corner_tr: { top: 24, right: 24, borderWidth: "1px 1px 0 0" },
  corner_bl: { bottom: 24, left: 24, borderWidth: "0 0 1px 1px" },
  corner_br: { bottom: 24, right: 24, borderWidth: "0 1px 1px 0" },
  heroContent: { position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" },

  taginha: { display: "flex", alignItems: "center", gap: 12, marginBottom: 32, animation: "fadeUp .8s ease both" },
  tagLinha: { display: "flex", alignItems: "center", gap: 12, marginBottom: 32 },
  tagLinha_linha: { display: "block", width: 56, height: 1, background: C.azulMedio, opacity: .5 },
  tagLinha_txt: { fontFamily: "'Georgia',serif", fontSize: 11, letterSpacing: 4, textTransform: "uppercase", color: C.azulMedio },

  monoWrap: { position: "relative", width: 190, height: 190, marginBottom: 36 },
  anel: { position: "absolute", inset: -16, borderRadius: "50%", border: `1px solid rgba(181,194,213,.5)`, animation: "girar 30s linear infinite" },

  nomes: { fontFamily: "'Georgia',serif", fontSize: "clamp(2.8rem,8vw,4.5rem)", fontWeight: 300, letterSpacing: 2, color: C.azulEscuro, margin: 0, lineHeight: 1 },
  subtitulo: { fontFamily: "'Georgia',serif", fontStyle: "italic", fontSize: 18, color: C.azulMedio, marginTop: 10 },
  tagData: { fontSize: 11, letterSpacing: 4, textTransform: "uppercase", color: C.suave, marginTop: 16 },
  setaBaixo: { marginTop: 48, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer" },
  setaBaixoTxt: { fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: C.suave, margin: 0 },

  // Seção form
  secaoForm: { background: C.creme, padding: "72px 24px 96px", display: "flex", flexDirection: "column", alignItems: "center" },
  abas: { display: "flex", gap: 8, marginBottom: 36 },
  aba: { background: "none", border: `1px solid rgba(181,194,213,.4)`, borderRadius: 2, padding: "10px 22px", fontFamily: "'Georgia',serif", fontSize: 13, color: C.suave, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, letterSpacing: 1, transition: "all .2s" },
  abaAtiva: { background: C.azulEscuro, borderColor: C.azulEscuro, color: "white" },

  divisor: { display: "flex", alignItems: "center", gap: 14, marginBottom: 40 },
  divisorLinha: { display: "block", height: 1, width: 72, background: `linear-gradient(to right, transparent, ${C.azulClaro})` },

  formCard: { background: "white", border: `1px solid rgba(181,194,213,.35)`, borderRadius: 4, padding: "44px 40px", width: "100%", maxWidth: 540, boxShadow: "0 12px 48px rgba(66,86,123,.07)", position: "relative" },

  // Campos do form
  campo: { marginBottom: 22 },
  label: { display: "block", fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: C.azulMedio, marginBottom: 8, fontFamily: "Georgia, serif" },
  input: { width: "100%", background: C.fundo, border: `1px solid rgba(181,194,213,.5)`, borderRadius: 2, color: C.texto, fontFamily: "Georgia, serif", fontSize: 15, padding: "12px 14px", outline: "none", transition: "border-color .2s", display: "block" },
  inputErro: { borderColor: "#cc0044" },
  select: { width: "100%", background: C.fundo, border: `1px solid rgba(181,194,213,.5)`, borderRadius: 2, color: C.texto, fontFamily: "Georgia, serif", fontSize: 15, padding: "12px 14px", outline: "none", appearance: "none", cursor: "pointer" },
  opcoes: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  opcao: { background: C.fundo, border: `1px solid rgba(181,194,213,.5)`, borderRadius: 2, padding: "12px 10px", fontFamily: "Georgia, serif", fontSize: 12, letterSpacing: 1, color: C.suave, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all .2s" },
  opcaoAtiva: { background: C.azulEscuro, borderColor: C.azulEscuro, color: "white" },
  btnEnviar: { width: "100%", background: C.azulEscuro, color: "white", border: "none", borderRadius: 2, fontFamily: "Georgia, serif", fontSize: 11, letterSpacing: 4, textTransform: "uppercase", padding: 17, cursor: "pointer", marginTop: 8, transition: "background .2s" },

  // Sucesso
  sucessoWrap: { display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "16px 0" },
  sucessoIcone: { width: 68, height: 68, borderRadius: "50%", background: "rgba(181,194,213,.2)", border: `1px solid ${C.azulClaro}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 22, color: C.azulEscuro },
  sucessoTitulo: { fontFamily: "Georgia, serif", fontSize: 24, fontWeight: 300, color: C.azulEscuro, marginBottom: 10 },
  sucessoTexto: { color: C.suave, fontSize: 14, lineHeight: 1.7, maxWidth: 300 },

  // Login admin
  loginWrap: { display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "16px 0" },
  loginIcone: { width: 60, height: 60, borderRadius: "50%", background: "rgba(181,194,213,.15)", border: `1px solid ${C.azulClaro}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, color: C.azulEscuro },

  // Painel admin
  resumoGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 28 },
  resumoCard: { background: C.fundo, border: `1px solid rgba(181,194,213,.35)`, borderRadius: 4, padding: "16px 12px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" },
  resumoNum: { fontFamily: "Georgia, serif", fontSize: 32, fontWeight: 300, lineHeight: 1 },
  resumoLabel: { fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: C.suave, marginTop: 4 },
  resumoSub: { fontSize: 10, color: C.azulClaro, marginTop: 3 },

  filtros: { display: "flex", gap: 8, marginBottom: 20 },
  filtroBtn: { background: "none", border: `1px solid rgba(181,194,213,.4)`, borderRadius: 2, padding: "7px 16px", fontFamily: "Georgia, serif", fontSize: 12, color: C.suave, cursor: "pointer", transition: "all .2s" },
  filtroBtnAtivo: { background: C.azulEscuro, borderColor: C.azulEscuro, color: "white" },

  listaAdmin: { display: "flex", flexDirection: "column", gap: 10 },
  itemAdmin: { background: C.fundo, border: `1px solid rgba(181,194,213,.3)`, borderRadius: 4, padding: "14px 16px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 },
  itemLeft: { display: "flex", alignItems: "flex-start", gap: 12 },
  itemBadge: { width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0, marginTop: 2 },
  itemNome: { fontFamily: "Georgia, serif", fontSize: 15, color: C.texto, margin: "0 0 3px" },
  itemMeta: { fontSize: 11, color: C.suave, letterSpacing: .5, margin: 0 },
  itemMsg: { fontSize: 12, color: C.azulMedio, fontStyle: "italic", marginTop: 4, margin: "4px 0 0" },
  btnRemover: { background: "none", border: "none", cursor: "pointer", color: C.suave, padding: 4, transition: "color .2s", flexShrink: 0 },

  // Footer
  footer: { background: C.azulEscuro, color: "rgba(255,255,255,.4)", textAlign: "center", padding: "28px 24px", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", fontFamily: "Georgia, serif" },
};
