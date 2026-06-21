import { useState, useEffect, useRef } from "react";

// ═══════════════════════════════════════════
// DESIGN TOKENS — Vert & Or luxe
// ═══════════════════════════════════════════
const C = {
  emerald:   "#0D9B6E",
  emeraldDk: "#0A7A57",
  emeraldLt: "#E6F7F2",
  gold:      "#C9A84C",
  goldLt:    "#FBF5E6",
  goldDk:    "#A07830",
  night:     "#0A1A12",
  dark:      "#112318",
  surface:   "#152B1E",
  card:      "#1A3325",
  border:    "#234532",
  textPrim:  "#F0F9F4",
  textSec:   "#8BAF98",
  danger:    "#FF5252",
  dangerLt:  "#2A1515",
  success:   "#4ADE80",
  successLt: "#0F2A1A",
  warn:      "#FFB020",
  warnLt:    "#2A1E08",
};

// ═══════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════
const PRODUCTS = [
  { id:1,  name:"Plan Starter",       emoji:"🌱", invest:2000,    gpd:150,    days:80 },
  { id:2,  name:"Plan Bronze",        emoji:"🥉", invest:5000,    gpd:350,    days:80 },
  { id:3,  name:"Plan Silver",        emoji:"🥈", invest:10000,   gpd:700,    days:80 },
  { id:4,  name:"Plan Gold",          emoji:"🥇", invest:20000,   gpd:1400,   days:80 },
  { id:5,  name:"Plan Platine",       emoji:"💎", invest:30000,   gpd:2100,   days:80 },
  { id:6,  name:"Plan Diamond",       emoji:"💠", invest:50000,   gpd:3500,   days:80 },
  { id:7,  name:"Plan Elite",         emoji:"⭐", invest:75000,   gpd:5000,   days:80 },
  { id:8,  name:"Plan Premium",       emoji:"🌟", invest:100000,  gpd:7000,   days:80 },
  { id:9,  name:"Plan VIP",           emoji:"👑", invest:150000,  gpd:10000,  days:80 },
  { id:10, name:"Plan Master",        emoji:"🏆", invest:200000,  gpd:14000,  days:80 },
  { id:11, name:"Plan Pro",           emoji:"🚀", invest:300000,  gpd:20000,  days:80 },
  { id:12, name:"Plan Expert",        emoji:"💫", invest:500000,  gpd:33000,  days:80 },
  { id:13, name:"Plan Legend",        emoji:"🔱", invest:750000,  gpd:50000,  days:80 },
  { id:14, name:"Plan Ultimate",      emoji:"⚡", invest:1000000, gpd:70000,  days:80 },
  { id:15, name:"Plan Millionnaire",  emoji:"💰", invest:2000000, gpd:140000, days:80 },
];

const COUNTRIES = [
  { code:"SN", flag:"🇸🇳", name:"Sénégal" },
  { code:"CI", flag:"🇨🇮", name:"Côte d'Ivoire" },
  { code:"ML", flag:"🇲🇱", name:"Mali" },
  { code:"BF", flag:"🇧🇫", name:"Burkina Faso" },
  { code:"GN", flag:"🇬🇳", name:"Guinée" },
  { code:"CM", flag:"🇨🇲", name:"Cameroun" },
  { code:"UG", flag:"🇺🇬", name:"Ouganda" },
];

function fmt(n) { return new Intl.NumberFormat("fr-FR").format(Math.round(n)) + " F"; }
function genCode() { return Math.random().toString(36).substring(2,8).toUpperCase(); }

// ═══════════════════════════════════════════
// STORAGE
// ═══════════════════════════════════════════
function loadDB() {
  try {
    const raw = localStorage.getItem("iw_db") || sessionStorage.getItem("iw_db_session") || "null";
    const data = JSON.parse(raw) || { users:[], txs:[], investments:[], currentUser:null };
    return data;
  }
  catch { return { users:[], txs:[], investments:[], currentUser:null }; }
}
function saveDB(db) {
  const str = JSON.stringify(db);
  try { localStorage.setItem("iw_db", str); } catch(e) {}
  try { sessionStorage.setItem("iw_db_session", str); } catch(e) {}
}

// ═══════════════════════════════════════════
// GLOBAL STYLES
// ═══════════════════════════════════════════
const globalCSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
body{background:${C.night};color:${C.textPrim};font-family:'Inter',sans-serif;min-height:100vh;overflow-x:hidden;}
input,select,textarea{font-family:'Inter',sans-serif;}
::-webkit-scrollbar{width:4px;}
::-webkit-scrollbar-track{background:${C.dark};}
::-webkit-scrollbar-thumb{background:${C.border};border-radius:99px;}
@keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.6}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes glow{0%,100%{box-shadow:0 0 20px rgba(201,168,76,0.3)}50%{box-shadow:0 0 40px rgba(201,168,76,0.6)}}
@keyframes slideIn{from{transform:translateY(100%)}to{transform:translateY(0)}}
@keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
`;

// ═══════════════════════════════════════════
// COMPOSANTS COMMUNS
// ═══════════════════════════════════════════

function GoldLine() {
  return <div style={{height:2,background:`linear-gradient(90deg,transparent,${C.gold},transparent)`,margin:"0 -20px",opacity:.5}}/>;
}

function Badge({children,color="emerald"}) {
  const bg = color==="gold" ? C.goldLt+"22" : color==="danger" ? C.dangerLt : C.successLt;
  const fg = color==="gold" ? C.gold : color==="danger" ? C.danger : C.success;
  return <span style={{background:bg,color:fg,border:`1px solid ${fg}33`,padding:"3px 10px",borderRadius:99,fontSize:11,fontWeight:600}}>{children}</span>;
}

function Spinner() {
  return <div style={{width:20,height:20,border:`2px solid ${C.border}`,borderTopColor:C.gold,borderRadius:"50%",animation:"spin .7s linear infinite",margin:"0 auto"}}/>;
}

function Toast({msg,visible}) {
  if(!msg) return null;
  return <div style={{
    position:"fixed",bottom:90,left:"50%",transform:"translateX(-50%)",
    background:C.card,border:`1px solid ${C.gold}44`,color:C.textPrim,
    padding:"12px 24px",borderRadius:14,fontSize:13,fontWeight:500,
    zIndex:9999,whiteSpace:"nowrap",
    boxShadow:`0 8px 32px rgba(0,0,0,.5),0 0 0 1px ${C.gold}22`,
    animation:visible?"toastIn .3s ease forwards":"none",
    opacity:visible?1:0,transition:"opacity .3s"
  }}>{msg}</div>;
}

function Modal({open,onClose,title,subtitle,children}) {
  if(!open) return null;
  return (
    <div onClick={e=>{if(e.target===e.currentTarget)onClose();}} style={{
      position:"fixed",inset:0,background:"rgba(0,0,0,.75)",zIndex:500,
      display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(8px)"
    }}>
      <div style={{
        background:C.dark,borderRadius:"24px 24px 0 0",
        padding:"0 20px 40px",width:"100%",maxWidth:430,
        maxHeight:"90vh",overflowY:"auto",
        animation:"slideIn .35s cubic-bezier(.32,1.2,.64,1) forwards",
        border:`1px solid ${C.border}`,borderBottom:"none"
      }}>
        <div style={{display:"flex",justifyContent:"center",padding:"12px 0 20px"}}>
          <div style={{width:40,height:4,background:C.border,borderRadius:99}}/>
        </div>
        <div style={{marginBottom:20}}>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,color:C.textPrim}}>{title}</div>
          {subtitle && <div style={{fontSize:13,color:C.textSec,marginTop:4}}>{subtitle}</div>}
        </div>
        {children}
      </div>
    </div>
  );
}

function Input({label,type="text",value,onChange,placeholder,min,accept,readOnly}) {
  return (
    <div style={{marginBottom:14}}>
      <label style={{display:"block",fontSize:11,fontWeight:600,color:C.textSec,marginBottom:6,textTransform:"uppercase",letterSpacing:.5}}>{label}</label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} min={min} accept={accept} readOnly={readOnly}
        style={{
          width:"100%",padding:"13px 14px",background:C.surface,
          border:`1.5px solid ${C.border}`,borderRadius:12,
          color:C.textPrim,fontSize:14,outline:"none",transition:".2s",
          opacity:readOnly?.5:1
        }}
        onFocus={e=>e.target.style.borderColor=C.gold}
        onBlur={e=>e.target.style.borderColor=C.border}
      />
    </div>
  );
}

function Select({label,value,onChange,children}) {
  return (
    <div style={{marginBottom:14}}>
      <label style={{display:"block",fontSize:11,fontWeight:600,color:C.textSec,marginBottom:6,textTransform:"uppercase",letterSpacing:.5}}>{label}</label>
      <select value={value} onChange={onChange}
        style={{
          width:"100%",padding:"13px 14px",background:C.surface,
          border:`1.5px solid ${C.border}`,borderRadius:12,
          color:C.textPrim,fontSize:14,outline:"none",appearance:"none"
        }}
      >{children}</select>
    </div>
  );
}

function Btn({children,onClick,variant="primary",disabled,style:sx}) {
  const styles = {
    primary:{background:`linear-gradient(135deg,${C.gold},${C.goldDk})`,color:C.night,border:"none"},
    ghost:{background:"transparent",color:C.textSec,border:`1px solid ${C.border}`},
    danger:{background:C.dangerLt,color:C.danger,border:`1px solid ${C.danger}33`},
    emerald:{background:`linear-gradient(135deg,${C.emerald},${C.emeraldDk})`,color:"#fff",border:"none"},
  };
  return (
    <button onClick={onClick} disabled={disabled}
      style={{
        width:"100%",padding:"14px",borderRadius:14,
        fontSize:14,fontWeight:700,cursor:disabled?"not-allowed":"pointer",
        opacity:disabled?.5:1,transition:".2s",letterSpacing:.3,
        ...styles[variant],...sx
      }}
    >{children}</button>
  );
}

// ═══════════════════════════════════════════
// LOGIN PAGE — avec "PICO INVESTE"
// ═══════════════════════════════════════════
function LoginPage({db,setDb,onLogin}) {
  const [email,setEmail]=useState("");
  const [pass,setPass]=useState("");
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(false);

  function handle() {
    setErr(""); setLoading(true);
    setTimeout(()=>{
      const u = db.users.find(u=>u.email===email && u.password===pass);
      if(!u){setErr("Email ou mot de passe incorrect.");setLoading(false);return;}
      const nd={...db,currentUser:u.id};
      saveDB(nd);setDb(nd);onLogin();
    },700);
  }

  return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      <div style={{
        background:`linear-gradient(160deg,${C.dark} 0%,${C.surface} 100%)`,
        padding:"60px 24px 40px",textAlign:"center",position:"relative",overflow:"hidden"
      }}>
        <div style={{position:"absolute",top:-60,left:-60,width:200,height:200,borderRadius:"50%",background:`${C.gold}08`}}/>
        <div style={{position:"absolute",bottom:-40,right:-40,width:160,height:160,borderRadius:"50%",background:`${C.emerald}08`}}/>
        <div style={{animation:"float 4s ease-in-out infinite",display:"inline-block",marginBottom:16}}>
          <div style={{
            width:80,height:80,borderRadius:"50%",margin:"0 auto",
            background:`linear-gradient(135deg,${C.gold},${C.emerald})`,
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:36,boxShadow:`0 0 40px ${C.gold}40`
          }}>💰</div>
        </div>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:32,fontWeight:800,
          background:`linear-gradient(135deg,${C.gold},#fff)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"
        }}>PICO INVESTE</div>
        <div style={{color:C.textSec,fontSize:14,marginTop:6}}>Votre argent travaille pour vous ✨</div>
        <div style={{display:"flex",justifyContent:"center",gap:6,marginTop:24}}>
          {[40,24,56,20,36].map((w,i)=>(
            <div key={i} style={{width:w,height:3,borderRadius:99,background:`linear-gradient(90deg,${C.gold},${C.emerald})`,opacity:.3+i*.1}}/>
          ))}
        </div>
      </div>

      <div style={{flex:1,padding:"32px 20px",background:C.night}}>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:700,marginBottom:4}}>Bon retour 👋</div>
        <div style={{color:C.textSec,fontSize:13,marginBottom:28}}>Connectez-vous à votre espace</div>

        {err && <div style={{background:C.dangerLt,border:`1px solid ${C.danger}33`,color:C.danger,padding:"10px 14px",borderRadius:10,fontSize:13,marginBottom:16}}>{err}</div>}

        <Input label="Adresse email" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="vous@email.com"/>
        <Input label="Mot de passe" type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••"/>

        <Btn onClick={handle} disabled={loading}>{loading?<Spinner/>:"Se connecter"}</Btn>

        <div style={{textAlign:"center",marginTop:20,fontSize:13,color:C.textSec}}>
          Pas de compte ?{" "}
          <span onClick={()=>onLogin("register")} style={{color:C.gold,fontWeight:600,cursor:"pointer"}}>Créer un compte</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// REGISTER PAGE — avec "PICO INVESTE"
// ═══════════════════════════════════════════
function RegisterPage({db,setDb,onDone,refCode:initRef}) {
  const [form,setForm]=useState({name:"",email:"",phone:"",country:"",pass:"",confirm:"",ref:initRef||""});
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(false);
  const set=k=>e=>setForm(f=>({...f,[k]:e.target.value}));

  function handle() {
    setErr("");
    if(!form.name||!form.email||!form.phone||!form.country||!form.pass){setErr("Remplissez tous les champs obligatoires.");return;}
    if(form.pass!==form.confirm){setErr("Les mots de passe ne correspondent pas.");return;}
    if(form.pass.length<6){setErr("Mot de passe minimum 6 caractères.");return;}
    if(db.users.find(u=>u.email===form.email)){setErr("Cet email est déjà utilisé.");return;}
    setLoading(true);
    setTimeout(()=>{
      const refUser = form.ref ? db.users.find(u=>u.refCode===form.ref.toUpperCase()) : null;
      const c = COUNTRIES.find(x=>x.code===form.country);
      const nu = {
        id:Date.now().toString(), name:form.name, email:form.email,
        phone:form.phone, country:c?`${c.flag} ${c.name}`:form.country,
        password:form.pass, balance:0, refCode:genCode(),
        referrerId:refUser?.id||null, refBonus:0,
        since:new Date().toLocaleDateString("fr-FR"), referrals:[],
        joinDate:Date.now()
      };
      const newUsers = [...db.users, nu];
      if(refUser){
        const idx=newUsers.findIndex(u=>u.id===refUser.id);
        if(idx>-1 && !newUsers[idx].referrals.includes(nu.id))
          newUsers[idx]={...newUsers[idx],referrals:[...newUsers[idx].referrals,nu.id]};
      }
      const nd={...db,users:newUsers,currentUser:nu.id};
      saveDB(nd);setDb(nd);onDone();
    },800);
  }

  return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      <div style={{background:`linear-gradient(160deg,${C.dark},${C.surface})`,padding:"48px 20px 28px",textAlign:"center"}}>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:28,fontWeight:800,
          background:`linear-gradient(135deg,${C.gold},#fff)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"
        }}>Rejoindre PICO INVESTE</div>
        <div style={{color:C.textSec,fontSize:13,marginTop:6}}>Commencez à investir dès aujourd'hui 🚀</div>
      </div>

      <div style={{flex:1,padding:"28px 20px 40px",background:C.night}}>
        {err && <div style={{background:C.dangerLt,border:`1px solid ${C.danger}33`,color:C.danger,padding:"10px 14px",borderRadius:10,fontSize:13,marginBottom:16}}>{err}</div>}

        <Input label="Nom complet *" value={form.name} onChange={set("name")} placeholder="Jean Dupont"/>
        <Input label="Email *" type="email" value={form.email} onChange={set("email")} placeholder="vous@email.com"/>
        <Input label="Téléphone *" type="tel" value={form.phone} onChange={set("phone")} placeholder="+221 77 000 00 00"/>

        <Select label="Pays * (Wave disponible)" value={form.country} onChange={set("country")}>
          <option value="">Sélectionnez votre pays</option>
          {COUNTRIES.map(c=><option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
        </Select>

        <Input label="Mot de passe *" type="password" value={form.pass} onChange={set("pass")} placeholder="Minimum 6 caractères"/>
        <Input label="Confirmer mot de passe *" type="password" value={form.confirm} onChange={set("confirm")} placeholder="Répétez le mot de passe"/>
        <Input label="Code de parrainage (optionnel)" value={form.ref} onChange={set("ref")} placeholder="Ex: ABC123"/>

        <div style={{background:`${C.gold}10`,border:`1px solid ${C.gold}33`,borderRadius:12,padding:"12px 14px",marginBottom:16,fontSize:12,color:C.textSec}}>
          📱 Paiements uniquement via <strong style={{color:C.gold}}>Wave</strong> — disponible dans les pays listés ci-dessus
        </div>

        <Btn onClick={handle} disabled={loading}>{loading?<Spinner/>:"Créer mon compte"}</Btn>

        <div style={{textAlign:"center",marginTop:20,fontSize:13,color:C.textSec}}>
          Déjà inscrit ?{" "}
          <span onClick={()=>onDone("login")} style={{color:C.gold,fontWeight:600,cursor:"pointer"}}>Se connecter</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// DEPOSIT MODAL — 4 étapes sécurisées (amélioré)
// ═══════════════════════════════════════════
function DepositModal({open,onClose,db,setDb,showToast,user}) {
  const [step,setStep]=useState(1);
  const [amt,setAmt]=useState("");
  const [proofUrl,setProofUrl]=useState(null);
  const [proofFile,setProofFile]=useState(null);
  const [confirm,setConfirm]=useState(false);
  const [submitting,setSubmitting]=useState(false);
  const [uploadError,setUploadError]=useState("");

  function reset(){setStep(1);setAmt("");setProofUrl(null);setProofFile(null);setConfirm(false);setSubmitting(false);setUploadError("");}
  function close(){reset();onClose();}

  function handleFile(e){
    const f=e.target.files[0]; if(!f) return;
    setUploadError("");
    if(!f.type.startsWith("image/")){setUploadError("Veuillez sélectionner une image (JPG, PNG, WEBP)."); return;}
    if(f.size > 5*1024*1024){setUploadError("L'image ne doit pas dépasser 5 Mo."); return;}
    setProofFile(f);
    const r=new FileReader(); r.onload=ev=>setProofUrl(ev.target.result); r.readAsDataURL(f);
  }

  function submit(){
    if(!confirm){showToast("✅ Cochez la confirmation");return;}
    if(!proofUrl){showToast("📸 Uploadez votre capture d'abord");return;}
    setSubmitting(true);
    const tx={id:Date.now().toString(),userId:user.id,type:"deposit",amount:parseInt(amt),status:"pending",date:Date.now(),proof:proofUrl};
    setTimeout(()=>{
      const nd={...db,txs:[...db.txs,tx]};
      saveDB(nd);setDb(nd);
      setSubmitting(false);close();
      showToast("✅ Dépôt soumis — en attente de validation admin");
    },700);
  }

  const steps=[
    {n:1,label:"Montant"},
    {n:2,label:"Paiement"},
    {n:3,label:"Preuve"},
    {n:4,label:"Confirmation"},
  ];

  return (
    <Modal open={open} onClose={close} title="💳 Dépôt Wave" subtitle={`Étape ${step} sur 4 — ${steps[step-1].label}`}>
      {/* Stepper */}
      <div style={{display:"flex",alignItems:"center",marginBottom:24}}>
        {steps.map((s,i)=>(
          <div key={s.n} style={{display:"flex",alignItems:"center",flex:i<3?1:"auto"}}>
            <div style={{
              width:32,height:32,borderRadius:"50%",
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:12,fontWeight:700,flexShrink:0,
              background:step>s.n?C.emerald:step===s.n?C.gold:C.surface,
              color:step>=s.n?C.night:C.textSec,
              border:`2px solid ${step>s.n?C.emerald:step===s.n?C.gold:C.border}`,
              transition:".3s"
            }}>{step>s.n?"✓":s.n}</div>
            {i<3&&<div style={{flex:1,height:2,background:step>s.n?C.emerald:C.border,margin:"0 4px",transition:".3s"}}/>}
          </div>
        ))}
      </div>

      {/* ÉTAPE 1 — Montant */}
      {step===1&&(
        <div style={{animation:"fadeUp .3s ease"}}>
          <div style={{background:`${C.gold}10`,border:`1px solid ${C.gold}30`,borderRadius:14,padding:"16px",marginBottom:16,textAlign:"center"}}>
            <div style={{fontSize:32,marginBottom:8}}>💰</div>
            <div style={{fontWeight:700,fontSize:15,color:C.textPrim,marginBottom:4}}>Quel montant voulez-vous déposer ?</div>
            <div style={{fontSize:12,color:C.textSec}}>Montant minimum : <strong style={{color:C.gold}}>2 000 F</strong></div>
          </div>
          <Input label="Montant en Francs CFA" type="number" value={amt} onChange={e=>setAmt(e.target.value)} placeholder="Ex: 5 000" min="2000"/>
          {amt&&parseInt(amt)>=2000&&(
            <div style={{background:C.successLt,border:`1px solid ${C.success}33`,borderRadius:10,padding:"10px 14px",marginBottom:12,display:"flex",justifyContent:"space-between"}}>
              <span style={{fontSize:13,color:C.textSec}}>Montant saisi</span>
              <span style={{fontSize:15,fontWeight:700,color:C.success}}>{fmt(parseInt(amt))}</span>
            </div>
          )}
          <Btn onClick={()=>{
            if(!amt||parseInt(amt)<2000){showToast("⚠️ Minimum 2 000 F");return;}
            setStep(2);
          }}>Continuer →</Btn>
          <Btn variant="ghost" onClick={close} sx={{marginTop:8}}>Annuler</Btn>
        </div>
      )}

      {/* ÉTAPE 2 — Infos paiement Wave */}
      {step===2&&(
        <div style={{animation:"fadeUp .3s ease"}}>
          <div style={{background:`${C.emerald}15`,border:`1px solid ${C.emerald}40`,borderRadius:16,padding:"18px",marginBottom:16}}>
            <div style={{fontSize:11,fontWeight:700,color:C.emerald,textTransform:"uppercase",letterSpacing:.5,marginBottom:12}}>📱 Envoyez via Wave à ce numéro</div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,background:C.surface,borderRadius:10,padding:"10px 14px"}}>
              <span style={{fontSize:13,color:C.textSec}}>Numéro</span>
              <span style={{fontSize:18,fontWeight:800,color:C.textPrim,letterSpacing:2}}>776 227 173</span>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:C.surface,borderRadius:10,padding:"10px 14px"}}>
              <span style={{fontSize:13,color:C.textSec}}>Nom</span>
              <span style={{fontSize:14,fontWeight:700,color:C.gold}}>MARTINEZ GOMEZ</span>
            </div>
          </div>
          <div style={{background:`${C.gold}10`,border:`1px solid ${C.gold}30`,borderRadius:12,padding:"14px",marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:13,color:C.textSec}}>Montant à envoyer</span>
            <span style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:800,color:C.gold}}>{fmt(parseInt(amt))}</span>
          </div>
          <div style={{background:C.warnLt,border:`1px solid ${C.warn}33`,borderRadius:10,padding:"12px",fontSize:12,color:C.warn,marginBottom:16,lineHeight:1.6}}>
            ⚠️ <strong>Important :</strong> Envoyez exactement <strong>{fmt(parseInt(amt))}</strong> au numéro ci-dessus. Gardez la capture d'écran du paiement, vous en aurez besoin à l'étape suivante.
          </div>
          <Btn onClick={()=>setStep(3)}>J'ai envoyé le paiement ✓</Btn>
          <Btn variant="ghost" onClick={()=>setStep(1)} sx={{marginTop:8}}>← Retour</Btn>
        </div>
      )}

      {/* ÉTAPE 3 — Upload capture (amélioré) */}
      {step===3&&(
        <div style={{animation:"fadeUp .3s ease"}}>
          <div style={{fontWeight:600,fontSize:14,color:C.textPrim,marginBottom:4}}>📸 Uploadez votre preuve de paiement</div>
          <div style={{fontSize:12,color:C.textSec,marginBottom:16}}>Prenez une capture d'écran de votre transaction Wave et uploadez-la ici.</div>

          <label htmlFor="proof-upload" style={{
            display:"block",
            border:`2px dashed ${proofUrl?C.emerald:uploadError?C.danger:C.border}`,
            borderRadius:14,padding:"24px 16px",
            textAlign:"center",cursor:"pointer",marginBottom:16,transition:".2s",
            background:proofUrl?`${C.emerald}08`:C.surface
          }}>
            <input id="proof-upload" type="file" accept="image/*" style={{display:"none"}} onChange={handleFile}/>
            {proofUrl ? (
              <div>
                <img src={proofUrl} style={{maxWidth:"100%",maxHeight:200,borderRadius:10,marginBottom:10,objectFit:"cover",border:`1px solid ${C.emerald}40`}}/>
                <div style={{fontSize:13,color:C.emerald,fontWeight:700}}>✅ Capture chargée avec succès</div>
                <div style={{fontSize:11,color:C.textSec,marginTop:4}}>Cliquez pour changer</div>
              </div>
            ) : (
              <div>
                <div style={{fontSize:48,marginBottom:10}}>📲</div>
                <div style={{fontSize:14,fontWeight:600,color:C.textPrim,marginBottom:4}}>Cliquez pour choisir votre capture</div>
                <div style={{fontSize:11,color:C.textSec}}>JPG, PNG, WEBP · max 5 Mo</div>
              </div>
            )}
          </label>
          {uploadError && <div style={{background:C.dangerLt,border:`1px solid ${C.danger}33`,color:C.danger,borderRadius:10,padding:"10px",fontSize:12,marginBottom:16}}>⚠️ {uploadError}</div>}
          <div style={{background:C.warnLt,border:`1px solid ${C.warn}33`,borderRadius:10,padding:"10px 12px",fontSize:12,color:C.warn,marginBottom:16}}>
            ⚠️ Sans capture valide, votre dépôt sera automatiquement <strong>refusé</strong>.
          </div>
          <Btn onClick={()=>{if(!proofUrl){showToast("📸 Uploadez votre capture d'abord");return;}setStep(4);}}>Continuer →</Btn>
          <Btn variant="ghost" onClick={()=>setStep(2)} sx={{marginTop:8}}>← Retour</Btn>
        </div>
      )}

      {/* ÉTAPE 4 — Confirmation finale */}
      {step===4&&(
        <div style={{animation:"fadeUp .3s ease"}}>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:"16px",marginBottom:16}}>
            <div style={{fontSize:11,fontWeight:700,color:C.textSec,textTransform:"uppercase",letterSpacing:.5,marginBottom:12}}>📋 Récapitulatif</div>
            {[
              ["Montant déposé",fmt(parseInt(amt))],
              ["Envoyé à","776 227 173 (MARTINEZ GOMEZ)"],
              ["Statut","⏳ En attente de validation admin"],
            ].map(([k,v],i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:i<2?`1px solid ${C.border}`:""}}>
                <span style={{fontSize:12,color:C.textSec}}>{k}</span>
                <span style={{fontSize:12,fontWeight:600,color:i===0?C.gold:C.textPrim}}>{v}</span>
              </div>
            ))}
          </div>
          {proofUrl&&<img src={proofUrl} style={{width:"100%",maxHeight:120,objectFit:"cover",borderRadius:10,marginBottom:16,border:`1px solid ${C.emerald}40`}}/>}
          <div onClick={()=>setConfirm(c=>!c)} style={{
            display:"flex",alignItems:"center",gap:10,background:confirm?`${C.emerald}15`:C.surface,
            border:`1.5px solid ${confirm?C.emerald:C.border}`,borderRadius:12,padding:"12px 14px",marginBottom:16,cursor:"pointer",transition:".2s"
          }}>
            <div style={{width:22,height:22,borderRadius:6,background:confirm?C.emerald:C.surface,border:`2px solid ${confirm?C.emerald:C.border}`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:13,fontWeight:700,flexShrink:0,transition:".2s"}}>
              {confirm?"✓":""}
            </div>
            <span style={{fontSize:12,color:C.textSec,lineHeight:1.5}}>Je confirme avoir envoyé <strong style={{color:C.textPrim}}>{fmt(parseInt(amt))}</strong> via Wave au numéro <strong style={{color:C.textPrim}}>776 227 173</strong> et que la capture est correcte.</span>
          </div>
          <Btn onClick={submit} disabled={submitting||!confirm}>{submitting?<Spinner/>:"✅ Soumettre ma demande"}</Btn>
          <Btn variant="ghost" onClick={()=>setStep(3)} sx={{marginTop:8}}>← Retour</Btn>
        </div>
      )}
    </Modal>
  );
}

// ═══════════════════════════════════════════
// WITHDRAW MODAL — stylé
// ═══════════════════════════════════════════
function WithdrawModal({open,onClose,db,setDb,showToast,user}) {
  const [step,setStep]=useState(1);
  const [amt,setAmt]=useState("");
  const [wave,setWave]=useState("");
  const [waveConfirm,setWaveConfirm]=useState("");
  const [confirm,setConfirm]=useState(false);
  const [submitting,setSubmitting]=useState(false);

  function reset(){setStep(1);setAmt("");setWave("");setWaveConfirm("");setConfirm(false);setSubmitting(false);}
  function close(){reset();onClose();}

  function submit(){
    if(!confirm){showToast("✅ Cochez la confirmation");return;}
    setSubmitting(true);
    const tx={id:Date.now().toString(),userId:user.id,type:"withdraw",amount:parseInt(amt),status:"pending",date:Date.now(),waveNum:wave};
    setTimeout(()=>{
      const nd={...db,txs:[...db.txs,tx]};
      saveDB(nd);setDb(nd);
      setSubmitting(false);close();
      showToast("✅ Retrait soumis — traitement sous 24h");
    },700);
  }

  return (
    <Modal open={open} onClose={close} title="💸 Retrait Wave" subtitle={`Étape ${step} sur 2`}>
      {/* Stepper stylé */}
      <div style={{display:"flex",alignItems:"center",marginBottom:24,background:C.surface,borderRadius:12,padding:"8px 12px",border:`1px solid ${C.border}`}}>
        {[{n:1,l:"Infos"},{n:2,l:"Confirmation"}].map((s,i)=>(
          <div key={s.n} style={{display:"flex",alignItems:"center",flex:i<1?1:"auto",width:i<1?"50%":"auto"}}>
            <div style={{
              width:36,height:36,borderRadius:"50%",flexShrink:0,
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,
              background:step>s.n?C.emerald:step===s.n?C.gold:C.surface,
              color:step>=s.n?C.night:C.textSec,
              border:`2px solid ${step>s.n?C.emerald:step===s.n?C.gold:C.border}`,transition:".3s"
            }}>{step>s.n?"✓":s.n}</div>
            {i<1&&<div style={{flex:1,height:2,background:step>1?C.emerald:C.border,margin:"0 8px",transition:".3s"}}/>}
          </div>
        ))}
      </div>

      {/* ÉTAPE 1 */}
      {step===1&&(
        <div style={{animation:"fadeUp .3s ease"}}>
          <div style={{
            background:`linear-gradient(135deg,${C.surface},${C.dark})`,
            border:`1px solid ${C.border}`,borderRadius:16,
            padding:"16px",marginBottom:16,
            display:"flex",justifyContent:"space-between",alignItems:"center"
          }}>
            <span style={{fontSize:13,color:C.textSec}}>💳 Solde disponible</span>
            <span style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,color:C.gold}}>{fmt(user.balance)}</span>
          </div>
          <Input label="Montant à retirer (min. 1 000 F)" type="number" value={amt} onChange={e=>setAmt(e.target.value)} placeholder="Ex: 10 000"/>
          <Input label="Votre numéro Wave" type="tel" value={wave} onChange={e=>setWave(e.target.value)} placeholder="Ex: 77 000 00 00"/>
          <Input label="Confirmez votre numéro Wave" type="tel" value={waveConfirm} onChange={e=>setWaveConfirm(e.target.value)} placeholder="Répétez le numéro"/>
          <div style={{
            background:`${C.warn}15`,border:`1px solid ${C.warn}40`,
            borderRadius:12,padding:"12px 16px",fontSize:12,color:C.warn,
            marginBottom:16,lineHeight:1.6
          }}>
            <div style={{display:"flex",gap:8,alignItems:"flex-start"}}>
              <span style={{fontSize:18}}>⚠️</span>
              <div>Vérifiez votre numéro Wave attentivement. Le paiement sera envoyé sur ce numéro. <strong>Aucune correction possible après validation.</strong></div>
            </div>
          </div>
          <Btn onClick={()=>{
            if(!amt||parseInt(amt)<1000){showToast("⚠️ Minimum 1 000 F");return;}
            if(user.balance<parseInt(amt)){showToast("❌ Solde insuffisant");return;}
            if(!wave){showToast("📱 Entrez votre numéro Wave");return;}
            if(wave!==waveConfirm){showToast("❌ Les numéros Wave ne correspondent pas");return;}
            setStep(2);
          }}>Continuer →</Btn>
          <Btn variant="ghost" onClick={close} sx={{marginTop:8}}>Annuler</Btn>
        </div>
      )}

      {/* ÉTAPE 2 */}
      {step===2&&(
        <div style={{animation:"fadeUp .3s ease"}}>
          <div style={{
            background:`linear-gradient(135deg,${C.card},${C.dark})`,
            border:`1px solid ${C.gold}30`,borderRadius:16,
            padding:"20px",marginBottom:16,
            boxShadow:`0 4px 20px rgba(0,0,0,.3)`
          }}>
            <div style={{fontSize:11,fontWeight:700,color:C.gold,textTransform:"uppercase",letterSpacing:.5,marginBottom:14}}>📋 Récapitulatif du retrait</div>
            {[
              ["Montant demandé",fmt(parseInt(amt)),C.danger],
              ["Numéro Wave",wave,C.textPrim],
              ["Délai","Sous 24h après validation",C.textSec],
              ["Statut","⏳ En attente de l'admin",C.warn],
            ].map(([k,v,color],i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:i<3?`1px solid ${C.border}`:""}}>
                <span style={{fontSize:13,color:C.textSec}}>{k}</span>
                <span style={{fontSize:14,fontWeight:600,color:color||C.textPrim}}>{v}</span>
              </div>
            ))}
          </div>
          <div onClick={()=>setConfirm(c=>!c)} style={{
            display:"flex",alignItems:"center",gap:12,background:confirm?`${C.emerald}15`:C.surface,
            border:`1.5px solid ${confirm?C.emerald:C.border}`,borderRadius:12,
            padding:"14px 16px",marginBottom:16,cursor:"pointer",transition:".2s"
          }}>
            <div style={{
              width:24,height:24,borderRadius:6,
              background:confirm?C.emerald:C.surface,
              border:`2px solid ${confirm?C.emerald:C.border}`,
              display:"flex",alignItems:"center",justifyContent:"center",
              color:"#fff",fontSize:14,fontWeight:700,flexShrink:0,transition:".2s"
            }}>{confirm?"✓":""}</div>
            <span style={{fontSize:13,color:C.textSec,lineHeight:1.5}}>
              Je confirme vouloir retirer <strong style={{color:C.textPrim}}>{fmt(parseInt(amt))}</strong> sur mon numéro Wave <strong style={{color:C.textPrim}}>{wave}</strong>.
            </span>
          </div>
          <Btn onClick={submit} disabled={submitting||!confirm}>
            {submitting?<Spinner/>:"✅ Confirmer le retrait"}
          </Btn>
          <Btn variant="ghost" onClick={()=>setStep(1)} sx={{marginTop:8}}>← Modifier</Btn>
        </div>
      )}
    </Modal>
  );
}

// ═══════════════════════════════════════════
// HOME PAGE
// ═══════════════════════════════════════════
function HomePage({db,setDb,showToast,onAdmin}) {
  const u=db.users.find(x=>x.id===db.currentUser);
  const [depositModal,setDepositModal]=useState(false);
  const [withdrawModal,setWithdrawModal]=useState(false);
  const [bannerVisible,setBannerVisible]=useState(true);

  // Réinitialiser la bannière à chaque montage (affichage de l'onglet Accueil)
  useEffect(() => {
    setBannerVisible(true);
  }, []);

  // Accès admin caché : 5 clics rapides sur le solde
  const [adminClicks, setAdminClicks] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);

  function handleBalanceClick() {
    const now = Date.now();
    if (now - lastClickTime > 2000) {
      setAdminClicks(1);
    } else {
      setAdminClicks(prev => prev + 1);
    }
    setLastClickTime(now);
    if (adminClicks + 1 >= 5) {
      if (onAdmin) onAdmin();
      setAdminClicks(0);
    }
  }

  if(!u) return null;
  const myTxs=db.txs.filter(t=>t.userId===u.id).sort((a,b)=>b.date-a.date).slice(0,5);
  const myInvests=db.investments.filter(i=>i.userId===u.id&&i.status==="active");
  const totalGains=db.txs.filter(t=>t.userId===u.id&&["bonus","gain"].includes(t.type)&&t.status==="approved").reduce((s,t)=>s+t.amount,0);

  const txIcon={deposit:"⬇️",withdraw:"⬆️",bonus:"🎁",gain:"📈",invest:"💼"};
  const txLabel={deposit:"Dépôt Wave",withdraw:"Retrait Wave",bonus:"Bonus parrainage",gain:"Gain quotidien",invest:"Investissement"};

  return (
    <div style={{paddingBottom:80}}>
      {/* Modals */}
      <DepositModal open={depositModal} onClose={()=>setDepositModal(false)} db={db} setDb={setDb} showToast={showToast} user={u}/>
      <WithdrawModal open={withdrawModal} onClose={()=>setWithdrawModal(false)} db={db} setDb={setDb} showToast={showToast} user={u}/>

      {/* Header */}
      <div style={{
        background:`linear-gradient(160deg,${C.dark},${C.surface})`,
        padding:"24px 20px 32px",position:"relative",overflow:"hidden"
      }}>
        <div style={{position:"absolute",top:-30,right:-30,width:120,height:120,borderRadius:"50%",background:`${C.gold}12`,filter:"blur(20px)"}}/>
        <div style={{position:"absolute",bottom:-20,left:-20,width:100,height:100,borderRadius:"50%",background:`${C.emerald}10`,filter:"blur(15px)"}}/>

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
          <div>
            <div style={{color:C.textSec,fontSize:12}}>Bonjour 👋</div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,color:C.textPrim}}>{u.name.split(" ")[0]}</div>
          </div>
          <div style={{
            width:46,height:46,borderRadius:"50%",
            background:`linear-gradient(135deg,${C.gold},${C.emerald})`,
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:18,fontWeight:700,color:C.night,
            boxShadow:`0 0 20px ${C.gold}40`
          }}>{u.name[0].toUpperCase()}</div>
        </div>

        {/* Balance Card — clic pour admin */}
        <div onClick={handleBalanceClick} style={{cursor:"pointer"}}>
          <div style={{
            background:`linear-gradient(135deg,${C.emeraldDk},${C.night})`,
            borderRadius:20,padding:"22px 20px",
            border:`1px solid ${C.gold}30`,
            boxShadow:`0 8px 32px rgba(0,0,0,.4),inset 0 1px 0 ${C.gold}20`,
            position:"relative",overflow:"hidden"
          }}>
            <div style={{position:"absolute",top:-30,right:-30,width:100,height:100,borderRadius:"50%",background:`${C.gold}08`}}/>
            <div style={{fontSize:11,color:C.textSec,fontWeight:500,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Solde disponible</div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:40,fontWeight:800,
              background:`linear-gradient(135deg,${C.gold},#fff)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
              lineHeight:1.1,marginBottom:4
            }}>{new Intl.NumberFormat("fr-FR").format(u.balance)}</div>
            <div style={{fontSize:13,color:C.textSec}}>Francs CFA</div>
            <GoldLine style={{margin:"16px 0"}}/>
            <div style={{display:"flex",gap:10,marginTop:16}}>
              <button onClick={(e)=>{e.stopPropagation(); setDepositModal(true);}} style={{
                flex:1,padding:"12px",borderRadius:12,
                background:`linear-gradient(135deg,${C.gold},${C.goldDk})`,
                color:C.night,border:"none",fontSize:13,fontWeight:700,cursor:"pointer",
                display:"flex",alignItems:"center",justifyContent:"center",gap:6
              }}><span>⬇️</span> Dépôt</button>
              <button onClick={(e)=>{e.stopPropagation(); setWithdrawModal(true);}} style={{
                flex:1,padding:"12px",borderRadius:12,
                background:C.surface,color:C.textPrim,
                border:`1px solid ${C.border}`,fontSize:13,fontWeight:600,cursor:"pointer",
                display:"flex",alignItems:"center",justifyContent:"center",gap:6
              }}><span>⬆️</span> Retrait</button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu scrollable */}
      <div style={{padding:"20px 16px 0"}}>

        {/* Bannière Telegram — réinitialisée à chaque affichage */}
        {bannerVisible && (
          <div style={{
            background:`linear-gradient(135deg,#0088cc,#0055aa)`,
            borderRadius:18,padding:"16px",marginBottom:20,
            position:"relative",overflow:"hidden",
            boxShadow:`0 6px 24px rgba(0,136,204,0.35)`
          }}>
            <div style={{position:"absolute",top:-20,right:-20,width:80,height:80,borderRadius:"50%",background:"rgba(255,255,255,0.08)"}}/>
            <div style={{position:"absolute",bottom:-30,left:-10,width:100,height:100,borderRadius:"50%",background:"rgba(255,255,255,0.05)"}}/>
            <div style={{display:"flex",alignItems:"center",gap:14,position:"relative"}}>
              <div style={{width:48,height:48,borderRadius:14,background:"rgba(255,255,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>✈️</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:14,color:"#fff",marginBottom:3}}>Rejoignez notre canal Telegram !</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,0.75)"}}>Actus exclusives, conseils & offres spéciales</div>
              </div>
              <span onClick={()=>setBannerVisible(false)} style={{position:"absolute",top:-8,right:-4,color:"rgba(255,255,255,0.6)",cursor:"pointer",fontSize:18,lineHeight:1,padding:"4px"}}>✕</span>
            </div>
            <a href="https://t.me/+Le-FgJipb-UyMDY0" target="_blank" rel="noreferrer" style={{
              display:"block",marginTop:14,
              background:"rgba(255,255,255,0.2)",color:"#fff",
              padding:"10px",borderRadius:10,
              fontSize:13,fontWeight:700,textDecoration:"none",
              textAlign:"center",border:"1px solid rgba(255,255,255,0.3)",
              backdropFilter:"blur(10px)"
            }}>📲 Rejoindre le canal maintenant</a>
          </div>
        )}

        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
          {[
            {icon:"📈",label:"Gains totaux",val:fmt(totalGains),color:C.success},
            {icon:"💼",label:"Investissements",val:myInvests.length,color:C.gold},
            {icon:"👥",label:"Filleuls",val:(u.referrals||[]).length,color:C.emerald},
            {icon:"🎁",label:"Bonus parrainage",val:fmt(u.refBonus||0),color:C.gold},
          ].map((s,i)=>(
            <div key={i} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:"14px"}}>
              <div style={{fontSize:22,marginBottom:6}}>{s.icon}</div>
              <div style={{fontSize:11,color:C.textSec,marginBottom:4}}>{s.label}</div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:700,color:s.color}}>{s.val}</div>
            </div>
          ))}
        </div>

        {/* Référence */}
        <div style={{
          background:`linear-gradient(135deg,${C.card},${C.surface})`,
          border:`1px solid ${C.gold}30`,borderRadius:18,padding:"16px",marginBottom:16
        }}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
            <div style={{fontSize:28}}>🎁</div>
            <div>
              <div style={{fontWeight:700,fontSize:14,color:C.textPrim}}>Programme de parrainage</div>
              <div style={{fontSize:11,color:C.textSec}}>Invitez et gagnez sur chaque dépôt</div>
            </div>
          </div>
          <div style={{display:"flex",gap:8,marginBottom:12}}>
            {[{n:"Niv.1",p:"30%"},{n:"Niv.2",p:"3%"},{n:"Niv.3",p:"2%"}].map((l,i)=>(
              <div key={i} style={{flex:1,background:C.surface,borderRadius:10,padding:"8px",textAlign:"center",border:`1px solid ${C.border}`}}>
                <div style={{fontSize:10,color:C.textSec}}>{l.n}</div>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:C.gold}}>{l.p}</div>
              </div>
            ))}
          </div>
          <div style={{background:C.surface,borderRadius:10,padding:"10px 12px",display:"flex",alignItems:"center",border:`1px solid ${C.border}`}}>
            <div style={{flex:1,fontSize:11,color:C.gold,fontWeight:600,wordBreak:"break-all"}}>investwave.app/ref/{u.refCode}</div>
            <button onClick={()=>{
              navigator.clipboard.writeText(`https://investwave.app/ref/${u.refCode}`).then(()=>showToast("🔗 Lien copié !")).catch(()=>showToast("Code : "+u.refCode));
            }} style={{
              background:`linear-gradient(135deg,${C.gold},${C.goldDk})`,color:C.night,
              border:"none",padding:"7px 14px",borderRadius:8,fontSize:11,fontWeight:700,cursor:"pointer",marginLeft:8,whiteSpace:"nowrap"
            }}>Copier</button>
          </div>
        </div>

        {/* Transactions récentes */}
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,marginBottom:12}}>Transactions récentes</div>
        {myTxs.length===0 ? (
          <div style={{textAlign:"center",padding:"40px 20px",color:C.textSec,background:C.card,borderRadius:16,border:`1px solid ${C.border}`}}>
            <div style={{fontSize:40,marginBottom:10}}>💳</div>
            <div style={{fontWeight:600,color:C.textPrim}}>Aucune transaction</div>
            <div style={{fontSize:12,marginTop:4}}>Faites votre premier dépôt pour commencer</div>
          </div>
        ) : (
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {myTxs.map(t=>{
              const isPlus=["deposit","bonus","gain"].includes(t.type)&&t.status==="approved";
              return (
                <div key={t.id} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"12px 14px",display:"flex",alignItems:"center",gap:12}}>
                  <div style={{width:40,height:40,borderRadius:11,background:C.surface,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{txIcon[t.type]}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:600,color:C.textPrim}}>{txLabel[t.type]}</div>
                    <div style={{fontSize:11,color:C.textSec,marginTop:2}}>{new Date(t.date).toLocaleDateString("fr-FR")} · {
                      t.status==="pending"?"⏳ En attente":t.status==="approved"?"✅ Validé":"❌ Refusé"
                    }</div>
                  </div>
                  <div style={{fontSize:14,fontWeight:700,color:t.status==="pending"?C.textSec:isPlus?C.success:C.danger}}>
                    {t.status==="pending"?"±":isPlus?"+":"-"}{fmt(t.amount)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// PRODUCTS PAGE
// ═══════════════════════════════════════════
function ProductsPage({db,setDb,showToast}) {
  const u=db.users.find(x=>x.id===db.currentUser);
  const [modal,setModal]=useState(null);
  const [investing,setInvesting]=useState(false);
  if(!u) return null;

  function confirmInvest(p){
    if(u.balance<p.invest){showToast("❌ Solde insuffisant. Faites un dépôt d'abord.");return;}
    setInvesting(true);
    setTimeout(()=>{
      const inv={id:Date.now().toString(),userId:u.id,productId:p.id,amount:p.invest,status:"active",startDate:Date.now()};
      const tx={id:Date.now().toString()+"i",userId:u.id,type:"invest",amount:p.invest,status:"approved",date:Date.now()};
      const newUsers=db.users.map(x=>x.id===u.id?{...x,balance:x.balance-p.invest}:x);
      const nd={...db,users:newUsers,investments:[...db.investments,inv],txs:[...db.txs,tx]};
      saveDB(nd);setDb(nd);
      setInvesting(false);setModal(null);
      showToast(`🚀 Investissement lancé — ${p.name}`);
    },700);
  }

  return (
    <div style={{paddingBottom:80}}>
      <div style={{background:`linear-gradient(160deg,${C.dark},${C.surface})`,padding:"24px 20px 20px"}}>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:800,
          background:`linear-gradient(135deg,${C.gold},#fff)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"
        }}>Plans d'investissement</div>
        <div style={{color:C.textSec,fontSize:13,marginTop:4}}>Choisissez votre plan et faites fructifier votre argent</div>
      </div>

      <div style={{padding:"16px 16px 0"}}>
        {PRODUCTS.map((p,idx)=>{
          const total=p.gpd*p.days;
          const ret=p.invest+total;
          const roi=Math.round((total/p.invest)*100);
          return (
            <div key={p.id} style={{
              background:C.card,border:`1px solid ${idx<3?C.gold+"40":C.border}`,
              borderRadius:18,padding:"18px",marginBottom:12,
              position:"relative",overflow:"hidden",
              animation:`fadeUp .4s ease ${idx*.05}s both`
            }}>
              {idx<3 && <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${C.gold},${C.emerald})`}}/>}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{
                    width:44,height:44,borderRadius:12,
                    background:`linear-gradient(135deg,${C.gold}20,${C.emerald}20)`,
                    border:`1px solid ${C.gold}30`,
                    display:"flex",alignItems:"center",justifyContent:"center",fontSize:22
                  }}>{p.emoji}</div>
                  <div>
                    <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700}}>{p.name}</div>
                    <div style={{fontSize:12,color:C.textSec}}>80 jours · ROI <strong style={{color:C.gold}}>{roi}%</strong></div>
                  </div>
                </div>
                {idx<3&&<Badge color="gold">⭐ Populaire</Badge>}
              </div>

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
                {[
                  {l:"Investissement",v:fmt(p.invest),c:C.textPrim},
                  {l:"Gain/jour",v:fmt(p.gpd),c:C.success},
                  {l:"Gain total",v:fmt(total),c:C.gold},
                ].map((s,i)=>(
                  <div key={i} style={{background:C.surface,borderRadius:10,padding:"10px 8px",textAlign:"center"}}>
                    <div style={{fontSize:9,color:C.textSec,textTransform:"uppercase",letterSpacing:.3,marginBottom:4}}>{s.l}</div>
                    <div style={{fontSize:12,fontWeight:700,color:s.c}}>{s.v}</div>
                  </div>
                ))}
              </div>

              <div style={{background:`${C.gold}10`,border:`1px solid ${C.gold}30`,borderRadius:10,padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <span style={{fontSize:12,color:C.gold}}>💰 Retour total</span>
                <span style={{fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:800,color:C.gold}}>{fmt(ret)}</span>
              </div>

              <button onClick={()=>setModal(p)} style={{
                width:"100%",padding:"13px",
                background:`linear-gradient(135deg,${C.gold},${C.goldDk})`,
                color:C.night,border:"none",borderRadius:12,
                fontSize:13,fontWeight:700,cursor:"pointer",
                boxShadow:`0 4px 16px ${C.gold}30`
              }}>Investir maintenant →</button>
            </div>
          );
        })}
      </div>

      {/* Invest Confirm Modal */}
      {modal && (
        <Modal open={!!modal} onClose={()=>setModal(null)} title={`${modal.emoji} ${modal.name}`} subtitle="Confirmez votre investissement">
          <div style={{background:`${C.gold}10`,border:`1px solid ${C.gold}30`,borderRadius:14,padding:"16px",marginBottom:16}}>
            <div style={{fontSize:11,fontWeight:700,color:C.gold,textTransform:"uppercase",letterSpacing:.5,marginBottom:10}}>📊 Résumé du plan</div>
            {[
              ["Montant à investir",fmt(modal.invest)],
              ["Gain par jour",fmt(modal.gpd)],
              ["Durée","80 jours"],
              ["Gain total",fmt(modal.gpd*modal.days)],
              ["Retour total",fmt(modal.invest+modal.gpd*modal.days)],
            ].map(([k,v],i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:i<4?`1px solid ${C.border}`:""}}> 
                <span style={{fontSize:13,color:C.textSec}}>{k}</span>
                <span style={{fontSize:13,fontWeight:700,color:i===4?C.gold:C.textPrim}}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{display:"flex",justifyContent:"space-between",background:C.surface,borderRadius:10,padding:"10px 14px",marginBottom:16}}>
            <span style={{fontSize:12,color:C.textSec}}>Votre solde actuel</span>
            <span style={{fontWeight:700,color:u.balance>=modal.invest?C.success:C.danger}}>{fmt(u.balance)}</span>
          </div>
          {u.balance<modal.invest&&<div style={{background:C.dangerLt,border:`1px solid ${C.danger}33`,borderRadius:10,padding:"10px 14px",fontSize:12,color:C.danger,marginBottom:14}}>❌ Solde insuffisant. Faites un dépôt d'abord.</div>}
          <Btn onClick={()=>confirmInvest(modal)} disabled={investing||u.balance<modal.invest}>{investing?<Spinner/>:"Confirmer l'investissement"}</Btn>
          <Btn variant="ghost" onClick={()=>setModal(null)} sx={{marginTop:8}}>Annuler</Btn>
        </Modal>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// ACCOUNT PAGE
// ═══════════════════════════════════════════
function AccountPage({db,setDb,showToast,onLogout}) {
  const u=db.users.find(x=>x.id===db.currentUser);
  if(!u) return null;

  const invests=db.investments.filter(i=>i.userId===u.id);
  const txs=db.txs.filter(t=>t.userId===u.id).sort((a,b)=>b.date-a.date);

  function copyLink(){
    const link=`https://investwave.app/ref/${u.refCode}`;
    navigator.clipboard.writeText(link).then(()=>showToast("🔗 Lien copié !")).catch(()=>showToast("Code : "+u.refCode));
  }

  return (
    <div style={{paddingBottom:80}}>
      <div style={{
        background:`linear-gradient(160deg,${C.dark},${C.surface})`,
        padding:"32px 20px 48px",textAlign:"center",position:"relative",overflow:"hidden"
      }}>
        <div style={{position:"absolute",top:-40,right:-40,width:140,height:140,borderRadius:"50%",background:`${C.gold}08`,filter:"blur(20px)"}}/>
        <div style={{
          width:80,height:80,borderRadius:"50%",margin:"0 auto 12px",
          background:`linear-gradient(135deg,${C.gold},${C.emerald})`,
          display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:32,fontWeight:700,color:C.night,
          boxShadow:`0 0 40px ${C.gold}40`,animation:"glow 3s ease-in-out infinite"
        }}>{u.name[0].toUpperCase()}</div>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700}}>{u.name}</div>
        <div style={{color:C.textSec,fontSize:12,marginTop:4}}>{u.email}</div>
        <div style={{color:C.textSec,fontSize:12,marginTop:2}}>{u.country}</div>
        <div style={{display:"flex",justifyContent:"center",gap:8,marginTop:16}}>
          <Badge color="gold">Code: {u.refCode}</Badge>
          <Badge>Membre depuis {u.since}</Badge>
        </div>
      </div>

      <div style={{margin:"-24px 16px 0",position:"relative",zIndex:10}}>
        {/* Balance card */}
        <div style={{
          background:`linear-gradient(135deg,${C.emeraldDk},${C.dark})`,
          border:`1px solid ${C.gold}30`,borderRadius:18,
          padding:"20px",marginBottom:12,
          boxShadow:`0 8px 32px rgba(0,0,0,.4)`
        }}>
          <div style={{fontSize:11,color:C.textSec,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Solde total</div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:36,fontWeight:800,
            background:`linear-gradient(135deg,${C.gold},#fff)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"
          }}>{fmt(u.balance)}</div>
        </div>

        {/* Info */}
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:"16px",marginBottom:12}}>
          <div style={{fontSize:11,fontWeight:700,color:C.textSec,textTransform:"uppercase",letterSpacing:.5,marginBottom:12}}>Informations personnelles</div>
          {[
            ["📱 Téléphone",u.phone],
            ["🌍 Pays",u.country],
            ["🎁 Filleuls",(u.referrals||[]).length],
            ["💰 Bonus parrainage",fmt(u.refBonus||0)],
          ].map(([k,v],i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:i<3?`1px solid ${C.border}`:""}}>
              <span style={{fontSize:13,color:C.textSec}}>{k}</span>
              <span style={{fontSize:13,fontWeight:600,color:C.textPrim}}>{v}</span>
            </div>
          ))}
        </div>

        {/* Referral */}
        <div style={{background:`linear-gradient(135deg,${C.card},${C.surface})`,border:`1px solid ${C.gold}30`,borderRadius:18,padding:"16px",marginBottom:12}}>
          <div style={{fontSize:11,fontWeight:700,color:C.gold,textTransform:"uppercase",letterSpacing:.5,marginBottom:10}}>🔗 Mon lien de parrainage</div>
          <div style={{background:C.surface,borderRadius:10,padding:"10px 12px",display:"flex",alignItems:"center",border:`1px solid ${C.border}`}}>
            <div style={{flex:1,fontSize:11,color:C.gold,fontWeight:600,wordBreak:"break-all"}}>investwave.app/ref/{u.refCode}</div>
            <button onClick={copyLink} style={{background:`linear-gradient(135deg,${C.gold},${C.goldDk})`,color:C.night,border:"none",padding:"7px 14px",borderRadius:8,fontSize:11,fontWeight:700,cursor:"pointer",marginLeft:8,whiteSpace:"nowrap"}}>Copier</button>
          </div>
          <div style={{display:"flex",gap:8,marginTop:10}}>
            {[{n:"Niveau 1",p:"30%"},{n:"Niveau 2",p:"3%"},{n:"Niveau 3",p:"2%"}].map((l,i)=>(
              <div key={i} style={{flex:1,background:C.surface,borderRadius:10,padding:"8px",textAlign:"center",border:`1px solid ${C.border}`}}>
                <div style={{fontSize:10,color:C.textSec}}>{l.n}</div>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:C.gold}}>{l.p}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Active investments */}
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,marginBottom:10}}>Mes investissements</div>
        {invests.length===0 ? (
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:"28px",textAlign:"center",color:C.textSec,marginBottom:12}}>
            <div style={{fontSize:36,marginBottom:8}}>📊</div>
            <div style={{fontWeight:600,color:C.textPrim}}>Aucun investissement actif</div>
            <div style={{fontSize:12,marginTop:4}}>Explorez nos plans et commencez dès aujourd'hui</div>
          </div>
        ) : invests.map(inv=>{
          const p=PRODUCTS.find(x=>x.id===inv.productId);
          const days=Math.floor((Date.now()-inv.startDate)/86400000);
          const pct=Math.min(100,Math.round((days/p.days)*100));
          const gained=Math.min(days*p.gpd,p.gpd*p.days);
          return (
            <div key={inv.id} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:"16px",marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:20}}>{p.emoji}</span>
                  <div>
                    <div style={{fontWeight:700,fontSize:14}}>{p.name}</div>
                    <div style={{fontSize:11,color:C.textSec}}>{fmt(inv.amount)} investis</div>
                  </div>
                </div>
                <Badge color={inv.status==="active"?"emerald":"gold"}>{inv.status==="active"?"✅ Actif":"✔️ Terminé"}</Badge>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:C.textSec,marginBottom:6}}>
                <span>Jour {days}/{p.days}</span>
                <span style={{color:C.success,fontWeight:600}}>+{fmt(gained)} accumulés</span>
              </div>
              <div style={{background:C.surface,borderRadius:99,height:6,overflow:"hidden"}}>
                <div style={{width:`${pct}%`,height:"100%",background:`linear-gradient(90deg,${C.emerald},${C.gold})`,borderRadius:99,transition:".5s"}}/>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:C.textSec,marginTop:4}}>
                <span>{pct}% complété</span>
                <span>{Math.max(0,p.days-days)} jours restants</span>
              </div>
            </div>
          );
        })}

        {/* History */}
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,margin:"16px 0 10px"}}>Historique complet</div>
        {txs.length===0 ? (
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:"20px",textAlign:"center",color:C.textSec}}>
            <div style={{fontSize:32,marginBottom:6}}>📋</div>
            <div style={{fontSize:13}}>Aucune transaction</div>
          </div>
        ) : (
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {txs.map(t=>{
              const icons={deposit:"⬇️",withdraw:"⬆️",bonus:"🎁",gain:"📈",invest:"💼"};
              const labels={deposit:"Dépôt Wave",withdraw:"Retrait Wave",bonus:"Bonus parrainage",gain:"Gain quotidien",invest:"Investissement"};
              const isPlus=["deposit","bonus","gain"].includes(t.type)&&t.status==="approved";
              return (
                <div key={t.id} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"11px 14px",display:"flex",alignItems:"center",gap:12}}>
                  <div style={{width:36,height:36,borderRadius:10,background:C.surface,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>{icons[t.type]}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:600}}>{labels[t.type]}</div>
                    <div style={{fontSize:10,color:C.textSec}}>{new Date(t.date).toLocaleDateString("fr-FR")} · {t.status==="pending"?"⏳":t.status==="approved"?"✅":"❌"}</div>
                  </div>
                  <div style={{fontSize:13,fontWeight:700,color:t.status==="pending"?C.textSec:isPlus?C.success:C.danger}}>
                    {t.status==="pending"?"±":isPlus?"+":"-"}{fmt(t.amount)}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <button onClick={onLogout} style={{
          width:"100%",marginTop:20,padding:"14px",
          background:C.dangerLt,color:C.danger,
          border:`1px solid ${C.danger}33`,borderRadius:14,
          fontSize:14,fontWeight:600,cursor:"pointer"
        }}>🚪 Se déconnecter</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// ADMIN PAGE
// ═══════════════════════════════════════════
function AdminPage({db,setDb,showToast}) {
  const [loggedIn,setLoggedIn]=useState(false);
  const [code,setCode]=useState("");
  const [err,setErr]=useState(false);
  const [tab,setTab]=useState("deposits");
  const [fullImg,setFullImg]=useState(null);

  function doLogin(){
    if(code==="26102008"){setLoggedIn(true);setErr(false);}
    else{setErr(true);}
  }

  function approveDeposit(txId){
    const tx=db.txs.find(t=>t.id===txId); if(!tx||tx.status!=="pending") return;
    let newUsers=[...db.users];
    const uIdx=newUsers.findIndex(u=>u.id===tx.userId);
    if(uIdx>-1){
      newUsers[uIdx]={...newUsers[uIdx],balance:newUsers[uIdx].balance+tx.amount};
      const bonusTxs=[];
      let cur=newUsers[uIdx];
      const rates=[0.30,0.03,0.02];
      for(let i=0;i<3;i++){
        if(!cur.referrerId) break;
        const rIdx=newUsers.findIndex(u=>u.id===cur.referrerId);
        if(rIdx<0) break;
        const bonus=Math.floor(tx.amount*rates[i]);
        newUsers[rIdx]={...newUsers[rIdx],balance:newUsers[rIdx].balance+bonus,refBonus:(newUsers[rIdx].refBonus||0)+bonus};
        bonusTxs.push({id:Date.now().toString()+i,userId:newUsers[rIdx].id,type:"bonus",amount:bonus,status:"approved",date:Date.now()});
        cur=newUsers[rIdx];
      }
      const nd={...db,users:newUsers,txs:db.txs.map(t=>t.id===txId?{...t,status:"approved"}:t).concat(bonusTxs)};
      saveDB(nd);setDb(nd);showToast("✅ Dépôt validé");
    }
  }

  function approveWithdraw(txId){
    const tx=db.txs.find(t=>t.id===txId); if(!tx||tx.status!=="pending") return;
    let newUsers=db.users.map(u=>{
      if(u.id!==tx.userId) return u;
      return {...u,balance:Math.max(0,u.balance-tx.amount)};
    });
    const nd={...db,users:newUsers,txs:db.txs.map(t=>t.id===txId?{...t,status:"approved"}:t)};
    saveDB(nd);setDb(nd);showToast("✅ Retrait validé et payé");
  }

  function rejectTx(txId){
    const nd={...db,txs:db.txs.map(t=>t.id===txId?{...t,status:"rejected"}:t)};
    saveDB(nd);setDb(nd);showToast("❌ Transaction refusée");
  }

  if(!loggedIn) return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 20px",background:`radial-gradient(ellipse at center,${C.dark} 0%,${C.night} 100%)`}}>
      <div style={{animation:"glow 3s ease-in-out infinite",fontSize:64,marginBottom:20}}>🔐</div>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:700,marginBottom:6,textAlign:"center"}}>Espace Admin</div>
      <div style={{color:C.textSec,fontSize:13,marginBottom:32,textAlign:"center"}}>Accès sécurisé réservé à l'administrateur</div>

      {err && <div style={{background:C.dangerLt,border:`1px solid ${C.danger}33`,color:C.danger,padding:"10px 14px",borderRadius:10,fontSize:13,marginBottom:16,width:"100%",maxWidth:360}}>Code incorrect. Accès refusé.</div>}

      <div style={{width:"100%",maxWidth:360}}>
        <Input label="Code d'accès secret" type="password" value={code} onChange={e=>setCode(e.target.value)} placeholder="••••••••"/>
        <Btn onClick={doLogin}>Accéder au panneau</Btn>
      </div>
    </div>
  );

  const deposits=db.txs.filter(t=>t.type==="deposit").sort((a,b)=>b.date-a.date);
  const withdrawals=db.txs.filter(t=>t.type==="withdraw").sort((a,b)=>b.date-a.date);
  const pending=db.txs.filter(t=>t.status==="pending").length;

  return (
    <div style={{paddingBottom:80}}>
      {fullImg && (
        <div onClick={()=>setFullImg(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.9)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
          <img src={fullImg} style={{maxWidth:"95%",maxHeight:"90vh",borderRadius:12}}/>
        </div>
      )}

      <div style={{background:`linear-gradient(160deg,${C.dark},${C.surface})`,padding:"24px 20px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700}}>⚙️ Panneau Admin</div>
          <div style={{color:C.textSec,fontSize:12,marginTop:2}}>Gestion de la plateforme</div>
        </div>
        <button onClick={()=>{setLoggedIn(false);setCode("");}} style={{background:C.dangerLt,color:C.danger,border:`1px solid ${C.danger}33`,padding:"8px 14px",borderRadius:10,fontSize:12,fontWeight:600,cursor:"pointer"}}>Quitter</button>
      </div>

      <div style={{padding:"16px"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:16}}>
          {[
            {icon:"👥",label:"Membres",val:db.users.length,color:C.emerald},
            {icon:"⏳",label:"En attente",val:pending,color:C.warn},
            {icon:"💰",label:"Plans actifs",val:db.investments.filter(i=>i.status==="active").length,color:C.gold},
          ].map((s,i)=>(
            <div key={i} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"12px",textAlign:"center"}}>
              <div style={{fontSize:24,marginBottom:4}}>{s.icon}</div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,color:s.color}}>{s.val}</div>
              <div style={{fontSize:10,color:C.textSec}}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{display:"flex",background:C.surface,borderRadius:12,padding:3,marginBottom:16,border:`1px solid ${C.border}`}}>
          {[{k:"deposits",l:"📥 Dépôts"},{k:"withdrawals",l:"📤 Retraits"},{k:"users",l:"👥 Membres"}].map(t=>(
            <div key={t.k} onClick={()=>setTab(t.k)} style={{
              flex:1,padding:"8px",textAlign:"center",fontSize:11,fontWeight:600,
              borderRadius:10,cursor:"pointer",transition:".2s",
              background:tab===t.k?C.card:"transparent",
              color:tab===t.k?C.gold:C.textSec,
              boxShadow:tab===t.k?`0 2px 8px rgba(0,0,0,.3)`:""
            }}>{t.l}</div>
          ))}
        </div>

        {tab==="deposits" && (deposits.length===0 ? (
          <div style={{textAlign:"center",padding:"40px",color:C.textSec,background:C.card,borderRadius:16,border:`1px solid ${C.border}`}}>
            <div style={{fontSize:36,marginBottom:8}}>📥</div><div>Aucun dépôt</div>
          </div>
        ) : deposits.map(t=>{
          const u=db.users.find(x=>x.id===t.userId);
          return (
            <div key={t.id} style={{background:C.card,border:`1px solid ${t.status==="pending"?C.warn+"44":C.border}`,borderRadius:16,padding:"16px",marginBottom:10,position:"relative"}}>
              {t.status==="pending" && <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:C.warn,borderRadius:"16px 16px 0 0"}}/>}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                <div>
                  <div style={{fontWeight:700,fontSize:14,color:C.textPrim}}>{u?.name||"—"}</div>
                  <div style={{fontSize:11,color:C.textSec}}>{u?.email} · {u?.country}</div>
                  <div style={{fontSize:11,color:C.textSec}}>{new Date(t.date).toLocaleString("fr-FR")}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:C.gold}}>{fmt(t.amount)}</div>
                  <Badge color={t.status==="pending"?"gold":t.status==="approved"?"emerald":"danger"}>
                    {t.status==="pending"?"⏳ En attente":t.status==="approved"?"✅ Validé":"❌ Refusé"}
                  </Badge>
                </div>
              </div>
              {t.proof && <img src={t.proof} onClick={()=>setFullImg(t.proof)} style={{width:"100%",maxHeight:140,objectFit:"cover",borderRadius:10,border:`1px solid ${C.border}`,cursor:"pointer",marginBottom:10}}/>}
              {t.status==="pending" && (
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>approveDeposit(t.id)} style={{flex:1,padding:"10px",background:`${C.success}15`,color:C.success,border:`1px solid ${C.success}33`,borderRadius:10,fontSize:12,fontWeight:600,cursor:"pointer"}}>✅ Valider le dépôt</button>
                  <button onClick={()=>rejectTx(t.id)} style={{flex:1,padding:"10px",background:C.dangerLt,color:C.danger,border:`1px solid ${C.danger}33`,borderRadius:10,fontSize:12,fontWeight:600,cursor:"pointer"}}>❌ Refuser</button>
                </div>
              )}
            </div>
          );
        }))}

        {tab==="withdrawals" && (withdrawals.length===0 ? (
          <div style={{textAlign:"center",padding:"40px",color:C.textSec,background:C.card,borderRadius:16,border:`1px solid ${C.border}`}}>
            <div style={{fontSize:36,marginBottom:8}}>📤</div><div>Aucun retrait</div>
          </div>
        ) : withdrawals.map(t=>{
          const u=db.users.find(x=>x.id===t.userId);
          return (
            <div key={t.id} style={{background:C.card,border:`1px solid ${t.status==="pending"?C.warn+"44":C.border}`,borderRadius:16,padding:"16px",marginBottom:10,position:"relative"}}>
              {t.status==="pending" && <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:C.warn,borderRadius:"16px 16px 0 0"}}/>}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                <div>
                  <div style={{fontWeight:700,fontSize:14}}>{u?.name||"—"}</div>
                  <div style={{fontSize:11,color:C.textSec}}>Wave : <strong style={{color:C.textPrim}}>{t.waveNum||"—"}</strong></div>
                  <div style={{fontSize:11,color:C.textSec}}>{new Date(t.date).toLocaleString("fr-FR")}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:C.danger}}>{fmt(t.amount)}</div>
                  <Badge color={t.status==="pending"?"gold":t.status==="approved"?"emerald":"danger"}>
                    {t.status==="pending"?"⏳ En attente":t.status==="approved"?"✅ Payé":"❌ Refusé"}
                  </Badge>
                </div>
              </div>
              {t.status==="pending" && (
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>approveWithdraw(t.id)} style={{flex:1,padding:"10px",background:`${C.success}15`,color:C.success,border:`1px solid ${C.success}33`,borderRadius:10,fontSize:12,fontWeight:600,cursor:"pointer"}}>✅ Valider & payer</button>
                  <button onClick={()=>rejectTx(t.id)} style={{flex:1,padding:"10px",background:C.dangerLt,color:C.danger,border:`1px solid ${C.danger}33`,borderRadius:10,fontSize:12,fontWeight:600,cursor:"pointer"}}>❌ Refuser</button>
                </div>
              )}
            </div>
          );
        }))}

        {tab==="users" && (db.users.length===0 ? (
          <div style={{textAlign:"center",padding:"40px",color:C.textSec,background:C.card,borderRadius:16,border:`1px solid ${C.border}`}}>
            <div style={{fontSize:36,marginBottom:8}}>👥</div><div>Aucun membre</div>
          </div>
        ) : db.users.map(u=>{
          const userInvests=db.investments.filter(i=>i.userId===u.id&&i.status==="active").length;
          return (
            <div key={u.id} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"14px",marginBottom:8,display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:42,height:42,borderRadius:"50%",background:`linear-gradient(135deg,${C.gold}30,${C.emerald}30)`,border:`1px solid ${C.gold}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:700,color:C.gold,flexShrink:0}}>{u.name[0].toUpperCase()}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:600,fontSize:13,color:C.textPrim,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.name}</div>
                <div style={{fontSize:11,color:C.textSec,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.email}</div>
                <div style={{fontSize:10,color:C.textSec}}>{u.country} · {userInvests} plan(s) actif(s)</div>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:14,fontWeight:700,color:C.gold}}>{fmt(u.balance)}</div>
                <div style={{fontSize:10,color:C.textSec}}>{(u.referrals||[]).length} filleul(s)</div>
              </div>
            </div>
          );
        }))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// BOTTOM NAV — sans admin visible
// ═══════════════════════════════════════════
function BottomNav({active,setActive}) {
  const tabs=[
    {k:"home",  icon:"🏠", label:"Accueil"},
    {k:"products",icon:"📦",label:"Produits"},
    {k:"account",icon:"👤",label:"Compte"},
  ];
  return (
    <div style={{
      position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",
      width:"100%",maxWidth:430,
      background:C.dark,borderTop:`1px solid ${C.border}`,
      display:"flex",height:64,zIndex:100,
      boxShadow:`0 -8px 32px rgba(0,0,0,.4)`
    }}>
      {tabs.map(t=>(
        <div key={t.k} onClick={()=>setActive(t.k)} style={{
          flex:1,display:"flex",flexDirection:"column",alignItems:"center",
          justifyContent:"center",gap:3,cursor:"pointer",transition:".2s",
          padding:"6px 0",position:"relative"
        }}>
          {active===t.k && <div style={{
            position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",
            width:32,height:2,background:`linear-gradient(90deg,${C.gold},${C.emerald})`,borderRadius:99
          }}/>}
          <div style={{fontSize:20,transition:".2s",transform:active===t.k?"scale(1.15)":"scale(1)"}}>{t.icon}</div>
          <div style={{fontSize:9,fontWeight:active===t.k?700:400,color:active===t.k?C.gold:C.textSec,transition:".2s"}}>{t.label}</div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════
// APP ROOT
// ═══════════════════════════════════════════
export default function App() {
  const [db,setDb]=useState(loadDB);
  const [screen,setScreen]=useState("login"); // login | register | app
  const [activeTab,setActiveTab]=useState("home");
  const [toast,setToast]=useState("");
  const [toastVisible,setToastVisible]=useState(false);

  useEffect(()=>{
    const params=new URLSearchParams(window.location.search);
    const ref=params.get("ref");
    const freshDb=loadDB();
    if(freshDb.currentUser && freshDb.users.find(u=>u.id===freshDb.currentUser)){
      setDb(freshDb);
      setScreen("app");
    } else if(ref){
      setScreen("register");
    }
  },[]);

  function showToast(msg){
    setToast(msg);setToastVisible(true);
    setTimeout(()=>setToastVisible(false),3000);
  }

  function handleLogin(dest){
    if(dest==="register"){setScreen("register");return;}
    if(db.currentUser&&db.users.find(u=>u.id===db.currentUser)){setScreen("app");}
  }

  function handleRegister(dest){
    if(dest==="login"){setScreen("login");return;}
    if(db.currentUser&&db.users.find(u=>u.id===db.currentUser)){setScreen("app");}
  }

  function handleLogout(){
    const nd={...db,currentUser:null};
    saveDB(nd);setDb(nd);setScreen("login");
  }

  function handleAdminAccess(){
    setActiveTab("admin");
  }

  return (
    <div style={{maxWidth:430,margin:"0 auto",minHeight:"100vh",background:C.night,position:"relative"}}>
      <style>{globalCSS}</style>
      <Toast msg={toast} visible={toastVisible}/>

      {screen==="login" && <LoginPage db={db} setDb={d=>{setDb(d);}} onLogin={handleLogin}/>}
      {screen==="register" && <RegisterPage db={db} setDb={d=>{setDb(d);}} onDone={handleRegister} refCode={new URLSearchParams(window.location.search).get("ref")||""}/>}

      {screen==="app" && (
        <>
          <div style={{display:activeTab==="home"?"block":"none"}}>
            <HomePage db={db} setDb={d=>{setDb(d);}} showToast={showToast} onAdmin={handleAdminAccess}/>
          </div>
          <div style={{display:activeTab==="products"?"block":"none"}}>
            <ProductsPage db={db} setDb={d=>{setDb(d);}} showToast={showToast}/>
          </div>
          <div style={{display:activeTab==="account"?"block":"none"}}>
            <AccountPage db={db} setDb={d=>{setDb(d);}} showToast={showToast} onLogout={handleLogout}/>
          </div>
          <div style={{display:activeTab==="admin"?"block":"none"}}>
            <AdminPage db={db} setDb={d=>{setDb(d);}} showToast={showToast}/>
          </div>
          <BottomNav active={activeTab} setActive={setActiveTab}/>
        </>
      )}
    </div>
  );
}