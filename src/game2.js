/* ================= COMPUTADOR ================= */
let pcTab='inbox',pcUid=null;
const KIND={fill:'Lacunas',sql:'SQL',py:'Python',quiz:'Pergunta'};
function abrirPC(tab){
  inPC=true;pcTab=tab||'inbox';pcUid=null;
  abrirModal('Intranet da Tabelão S.A.','<div class="pc-wrap"><nav class="pc-nav" id="pcNav"></nav><div class="pc-main" id="pcMain"></div></div>',[], {wide:true,pc:true,noFocus:true});
  inPC=true;paused=true;renderPC();
}
function renderPC(){
  const nav=$('#pcNav');if(!nav)return;
  const tabs=[['inbox','Caixa de entrada',S.missoes.length],['dados','Dicionário de dados'],['hist','Entregues']];
  nav.innerHTML=tabs.map(([k,n,c])=>`<button class="${pcTab===k&&!pcUid?'on':''}" data-tab="${k}">${n}${c!=null?` <b>${c}</b>`:''}</button>`).join('')+`<div class="pc-energy">Energia <strong>${Math.round(S.energia)}</strong></div>`;
  nav.querySelectorAll('button').forEach(b=>b.onclick=()=>{salvarRascunho();pcTab=b.dataset.tab;pcUid=null;renderPC();});
  const main=$('#pcMain');
  if(pcUid){const e=S.missoes.find(x=>x.uid===pcUid);if(e)return renderMissao(main,e);pcUid=null;}
  if(pcTab==='inbox')return renderInbox(main);
  if(pcTab==='dados')return renderDados(main);
  if(pcTab==='hist')return renderHist(main);
}
function renderInbox(main){
  const ms=S.missoes.map(e=>({e,m:getM(e)})).filter(x=>x.m).sort((a,b)=>a.e.due-b.e.due);
  if(!ms.length){main.innerHTML=`<div class="empty-state"><p>Caixa de entrada zerada.</p><p class="muted">Converse com as áreas para pedir novas demandas, ou volte amanhã. Aproveite para estudar o dicionário de dados.</p></div>`;return;}
  main.innerHTML=`<ul class="inbox">${ms.map(({e,m})=>{const rw=rewardOf(m,e);return `<li><button data-uid="${e.uid}">
    <canvas width="28" height="28" data-port="${m.from}"></canvas>
    <span class="ib-from">${NPCS[m.from].nome}<small>${NPCS[m.from].cargo}</small></span>
    <span class="ib-title">${m.title}${e.revisao?' <em>(revisão)</em>':''}${m.rec?' <em>(recorrente)</em>':''}</span>
    <span class="tag t-${m.kind}">${KIND[m.kind]}</span>
    <span class="ib-due ${dueCls(e)}">${dueTxt(e)}</span>
    <span class="ib-rw">${brl(rw.pay)} · ${rw.xp} XP</span></button></li>`;}).join('')}</ul>`;
  main.querySelectorAll('canvas[data-port]').forEach(c=>drawPortrait(c,c.dataset.port));
  main.querySelectorAll('button[data-uid]').forEach(b=>b.onclick=()=>{pcUid=+b.dataset.uid;renderPC();});
}
function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
function renderMissao(main,e){
  const m=getM(e);const rw=rewardOf(m,e);
  const head=`<button class="back" id="pcBack">‹ Caixa de entrada</button>
   <header class="mail-h"><canvas width="44" height="44" id="mailPort"></canvas><div><div class="mail-from">${NPCS[m.from].nome} <span>${NPCS[m.from].cargo}</span></div>
   <h3>${m.title}</h3><div class="mail-meta"><span class="ib-due ${dueCls(e)}">Prazo: ${dueTxt(e).toLowerCase()}</span><span>${brl(rw.pay)} + ${rw.xp} XP${e.start===S.dia&&!e.revisao?' (+20% se entregar hoje)':''}</span><span class="tag t-${m.kind}">${KIND[m.kind]}</span></div></div></header>
   <p class="brief">${esc(m.brief)}</p>`;
  let work='';
  if(m.kind==='quiz'){
    const order=m.options.map((_,i)=>i);for(let i=order.length-1;i>0;i--){const j=(e.uid*7+i*13)%(i+1);[order[i],order[j]]=[order[j],order[i]];}
    work=`<div class="quiz">${order.map(i=>`<button class="opt" data-i="${i}" ${e.tried&&e.tried.includes(i)?'disabled':''}>${esc(m.options[i])}</button>`).join('')}</div><div id="out" class="out"></div>`;
  }else{
    const lang=m.lang==='sql'?'SQL':'Python (pandas)';
    let editor;
    if(m.kind==='fill'){
      let k=0;const parts=m.template.split('___');const vals=e.draft||[];
      editor=`<pre class="code fill">${parts.map((p,i)=>esc(p)+(i<parts.length-1?`<input class="blank" data-b="${i}" value="${esc(vals[i]||'')}" size="${Math.max(3,m.answers[i].length+1)}" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="Lacuna ${i+1}">`:'')).join('')}</pre>`;
    }else{
      editor=`<textarea id="code" class="code" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="Editor de código ${lang}">${esc(e.draft!=null?e.draft:(m.starter||''))}</textarea>`;
    }
    work=`<div class="ed-head"><span>${lang}</span><span class="muted">${m.kind==='fill'?'Preencha as lacunas':'Ctrl + Enter executa'}</span></div>${editor}
      ${m.kind!=='fill'?tabelasHelper(m.lang):''}
      <div class="ed-actions"><button class="btn" id="btnRun">Executar</button><button class="btn primary" id="btnSend">Entregar</button><span class="sp"></span>
      <button class="btn ghost" id="btnHint">${has('pato')&&S.pato!==S.dia?'Perguntar ao pato (grátis)':'Pedir dica (R$ 20)'}</button><button class="btn ghost" id="btnGab">Ver gabarito</button></div>
      <div id="hint" class="hint" hidden></div><div id="out" class="out"></div>`;
  }
  main.innerHTML=head+work;
  drawPortrait($('#mailPort'),m.from);
  $('#pcBack').onclick=()=>{salvarRascunho();pcUid=null;renderPC();};
  if(m.kind==='quiz'){
    main.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{
      const i=+b.dataset.i;
      if(S.energia<custoEnergia())return outErro('Sem energia para pensar. Vá até a copa tomar um café.');
      if(i===m.answer){mostrarSucesso(concluir(e));}
      else{e.wrong++;e.tried=(e.tried||[]).concat(i);S.energia=clamp(S.energia-3,0,100);b.disabled=true;b.classList.add('no');outErro('Não é bem isso. Pense no impacto para o negócio e tente de novo (a recompensa diminui um pouco).');lastHud='';updateHud();}
    });
    return;}
  const ta=$('#code');
  if(ta){ta.addEventListener('keydown',ev=>{
      if(ev.key==='Tab'){ev.preventDefault();const s=ta.selectionStart;ta.setRangeText('    ',s,ta.selectionEnd,'end');}
      if(ev.key==='Enter'&&(ev.ctrlKey||ev.metaKey)){ev.preventDefault();executar(m,e);}
      ev.stopPropagation();});
    setTimeout(()=>{ta.focus();ta.setSelectionRange(ta.value.length,ta.value.length);},40);}
  main.querySelectorAll('.blank').forEach((inp,i,all)=>{inp.addEventListener('keydown',ev=>{ev.stopPropagation();if(ev.key==='Enter'){ev.preventDefault();if(all[i+1])all[i+1].focus();else executar(m,e);}});if(i===0)setTimeout(()=>inp.focus(),40);});
  main.querySelectorAll('.chip').forEach(c=>c.onclick=()=>{if(!ta)return;const s=ta.selectionStart;ta.setRangeText(c.dataset.ins,s,ta.selectionEnd,'end');ta.focus();});
  $('#btnRun').onclick=()=>executar(m,e);
  $('#btnSend').onclick=()=>entregar(m,e);
  $('#btnHint').onclick=()=>{
    const h=$('#hint');if(!h.hidden)return;
    if(has('pato')&&S.pato!==S.dia){S.pato=S.dia;h.innerHTML=`<b>O pato olha para você.</b> Você explica o problema em voz alta e… ${esc(m.hint)}`;}
    else{if(S.dinheiro<20)return outErro('Sem dinheiro para a dica.');S.dinheiro-=20;h.innerHTML=`<b>Dica do Fábio:</b> ${esc(m.hint)}`;}
    h.hidden=false;lastHud='';updateHud();$('#btnHint').disabled=true;};
  $('#btnGab').onclick=()=>{
    if(!e.gab){abrirConfirm('Ver o gabarito? A entrega passa a valer só 30% da recompensa.',()=>{e.gab=true;aplicarGabarito(m);});}
    else aplicarGabarito(m);};
}
function abrirConfirm(msg,ok){const out=$('#out');out.innerHTML=`<div class="confirm"><p>${msg}</p><button class="btn primary" id="cfOk">Ver gabarito</button><button class="btn ghost" id="cfNo">Cancelar</button></div>`;$('#cfOk').onclick=()=>{out.innerHTML='';ok();};$('#cfNo').onclick=()=>out.innerHTML='';}
function aplicarGabarito(m){
  if(m.kind==='fill'){document.querySelectorAll('.blank').forEach((inp,i)=>inp.value=m.answers[i]);}
  else{$('#code').value=m.solution;}
  $('#hint').hidden=false;$('#hint').innerHTML='<b>Gabarito aplicado.</b> Execute, entenda cada parte e entregue. Na próxima, tente sem!';
}
function tabelasHelper(lang){
  const q=lang==='sql';
  return `<details class="tbls"><summary>Tabelas e colunas (clique para inserir)</summary>${Object.keys(SCHEMAS).map(t=>`<div class="tb"><button class="chip tname" data-ins="${t}">${t}</button>${Object.keys(SCHEMAS[t].cols).map(c=>`<button class="chip" data-ins="${q?c:`'${c}'`}" title="${esc(SCHEMAS[t].cols[c])}">${c}</button>`).join('')}</div>`).join('')}</details>`;
}
function codigoAtual(m){
  if(m.kind==='fill'){const vals=[...document.querySelectorAll('.blank')].map(i=>i.value.trim());let i=0;return {code:m.template.replace(/___/g,()=>vals[i++]||'___'),vals};}
  return {code:$('#code').value};
}
function salvarRascunho(){
  if(!pcUid)return;const e=S.missoes.find(x=>x.uid===pcUid);if(!e)return;const m=getM(e);if(!m||m.kind==='quiz')return;
  if(m.kind==='fill'){const b=document.querySelectorAll('.blank');if(b.length)e.draft=[...b].map(i=>i.value);}
  else{const ta=$('#code');if(ta)e.draft=ta.value;}
}
function outErro(msg){const o=$('#out');if(o)o.innerHTML=`<div class="err">${esc(msg)}</div>`;}
function rodar(m){
  const {code,vals}=codigoAtual(m);
  if(m.kind==='fill'&&vals.some(v=>!v)){outErro('Preencha todas as lacunas.');return null;}
  try{return runCode(m.lang,code);}catch(err){outErro(err.message||String(err));return null;}
}
function executar(m,e){salvarRascunho();const r=rodar(m);if(!r)return;$('#out').innerHTML=renderSaida(r);}
function entregar(m,e){
  salvarRascunho();
  if(S.energia<custoEnergia()){outErro(`Sem energia (precisa de ${custoEnergia()}). Vá até a copa tomar um café.`);return;}
  const r=rodar(m);if(!r)return;
  if(!r.hasResult){outErro('Seu código não devolveu resultado. Deixe a expressão final na última linha (sem atribuir a uma variável) ou use print().');return;}
  let exp;try{exp=expected(m);}catch(err){outErro('Erro interno ao conferir. Tente executar de novo.');return;}
  const c=compareResults(r.result,exp,m.ordered);
  if(!c.ok){e.wrong++;S.energia=clamp(S.energia-3,0,100);lastHud='';updateHud();
    $('#out').innerHTML=`<div class="err"><b>${NPCS[m.from].nome} devolveu:</b> “Não é isso que eu pedi.” ${esc(c.msg)}</div>`+renderSaida(r);return;}
  mostrarSucesso(concluir(e));
}
function mostrarSucesso(res){
  const {pay,xp,rapido,m}=res;
  const reac={bia:'Amei!!! Vai direto pro slide ✨',carlao:'É disso que eu tô falando! Valeu!',neide:'Conferi no caderninho: bate. Muito bem.',jorge:'Isso fecha. Obrigado.',chefe:'Excelente. Vou apresentar como se fosse meu. Brincadeira. Talvez.',fabio:'Limpo e sem gambiarra. Respeito.',kevin:'Uau. Me ensina depois?'}[m.from];
  $('#pcMain').innerHTML=`<div class="done"><canvas width="56" height="56" id="donePort"></canvas>
    <div><p class="done-q">“${reac}”</p><p class="done-who">${NPCS[m.from].nome}</p></div>
    <div class="done-rw"><span class="money">+${brl(pay)}</span><span>+${xp} XP</span>${rapido?'<span class="fast">Entrega no mesmo dia +20%</span>':''}</div>
    <div class="insight"><h4>O que esse número significa para o negócio</h4><p>${esc(m.insight)}</p></div>
    <button class="btn primary" id="doneBack">Voltar à caixa de entrada</button></div>`;
  drawPortrait($('#donePort'),m.from);
  $('#doneBack').onclick=()=>{pcUid=null;pcTab='inbox';renderPC();};$('#doneBack').focus();
  pcUid=null;const nav=$('#pcNav');if(nav){nav.querySelectorAll('button').forEach(b=>b.classList.remove('on'));const b=nav.querySelector('[data-tab="inbox"] b');if(b)b.textContent=S.missoes.length;}
  toast(`Entregue: ${m.title}. +${brl(pay)}`,'good');
}
function fmtCell(v){if(v===null||v===undefined||(typeof v==='number'&&isNaN(v)))return'<span class="nan">NaN</span>';if(typeof v==='number')return Number.isInteger(v)?v.toLocaleString('pt-BR'):(Math.round(v*100)/100).toLocaleString('pt-BR');if(typeof v==='boolean')return v?'True':'False';return esc(v);}
function tabelaHTML(cols,rows,idx){
  const max=25;const shown=rows.slice(0,max);
  return `<div class="tbl-wrap"><table class="res"><thead><tr>${idx?`<th class="ix">${esc(idx.name||'')}</th>`:''}${cols.map(c=>`<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${shown.map((r,i)=>`<tr>${idx?`<td class="ix">${fmtCell(idx.vals[i])}</td>`:''}${cols.map(c=>`<td>${fmtCell(r[c])}</td>`).join('')}</tr>`).join('')}</tbody></table></div>${rows.length>max?`<p class="muted small">… mais ${rows.length-max} linhas</p>`:''}<p class="muted small">${rows.length} linha${rows.length!==1?'s':''} × ${cols.length} coluna${cols.length!==1?'s':''}</p>`;
}
function renderValor(v){
  if(v instanceof DF)return tabelaHTML(v.cols,v.rows,null);
  if(v instanceof Series){const nm=v.name==null?'':String(v.name);
    return tabelaHTML([nm||'valor'],v.values.map(x=>({[nm||'valor']:x})),{name:v.indexName||'',vals:v.index});}
  if(v instanceof GroupBy)return `<div class="val">&lt;DataFrameGroupBy&gt; <span class="muted">Falta agregar: use .sum(), .mean(), .count()…</span></div>`;
  if(v instanceof Bound)return `<div class="val">&lt;método ${esc(v.name)}&gt; <span class="muted">Faltou abrir e fechar parênteses: ${esc(v.name)}()</span></div>`;
  return `<div class="val">${esc(fmtScalar(v))}</div>`;
}
function renderSaida(r){
  let h='';(r.prints||[]).forEach(p=>{if(p!==r.result)h+=renderValor(p);});
  if(r.hasResult)h+=renderValor(r.result);else if(!h)h='<div class="val muted">(sem saída)</div>';
  return `<div class="out-label">Resultado</div>`+h;
}
function renderDados(main){
  main.innerHTML=`<p class="muted">Estas são as tabelas da Tabelão S.A. Em SQL use o nome direto (FROM vendas). Em Python elas já estão carregadas como DataFrames: vendas, clientes, campanhas, entregas.</p>`+
  Object.keys(SCHEMAS).map(t=>{const df=new DF(Object.keys(DATA[t][0]),DATA[t].slice(0,6));return `<section class="dict"><h4>${t} <span class="muted">${DATA[t].length} linhas</span></h4><p>${SCHEMAS[t].desc}</p>
    <dl>${Object.entries(SCHEMAS[t].cols).map(([c,d])=>`<div><dt>${c}</dt><dd>${esc(d)}</dd></div>`).join('')}</dl>
    <details><summary>Ver as primeiras linhas</summary>${tabelaHTML(df.cols,df.rows,null)}</details></section>`;}).join('');
}
function renderHist(main){
  if(!S.histor.length){main.innerHTML='<div class="empty-state"><p>Nada entregue ainda.</p><p class="muted">Suas entregas aparecem aqui.</p></div>';return;}
  main.innerHTML=`<table class="ledger hist">${S.histor.map(h=>`<tr><td>Dia ${h.dia}</td><td>${esc(h.t)}<small>${NPCS[h.from].nome}</small></td><td class="num">${brl(h.pay)}</td><td class="num">${h.xp} XP</td></tr>`).join('')}</table>`;
}

/* ================= LOJA ================= */
let lojaTab='roupas';
function abrirLoja(tab){lojaTab=tab||lojaTab;abrirModal('Loja do celular','<div class="shop"><nav class="shop-nav" id="shopNav"></nav><div id="shopList" class="shop-list"></div></div>',[],{wide:true});renderLoja();}
function reqAuto(a){const r=a.req;const f=[];if(r.py&&lvl(S.skills.py)<r.py)f.push(`Python nv ${r.py}`);if(r.sql&&lvl(S.skills.sql)<r.sql)f.push(`SQL nv ${r.sql}`);if(r.negocio&&lvl(S.skills.negocio)<r.negocio)f.push(`Negócio nv ${r.negocio}`);if(r.feitos&&S.recFeitos[a.rec]<r.feitos)f.push(`${r.feitos} entregas do ${RECORRENTES[a.rec].nome.toLowerCase()} (${S.recFeitos[a.rec]}/${r.feitos})`);return f;}
function renderLoja(){
  if(!$('#shopNav'))return;
  const tabs=[['roupas','Roupas'],['acessorios','Acessórios'],['mesa','Mesa'],['cursos','Cursos'],['automacoes','Automações']];
  $('#shopNav').innerHTML=tabs.map(([k,n])=>`<button class="${lojaTab===k?'on':''}" data-k="${k}">${n}</button>`).join('')+`<span class="shop-money">${brl(S.dinheiro)}</span>`;
  $('#shopNav').querySelectorAll('button').forEach(b=>b.onclick=()=>{lojaTab=b.dataset.k;renderLoja();});
  const items=LOJA[lojaTab];
  $('#shopList').innerHTML=(lojaTab==='automacoes'?'<p class="muted">Automações trabalham por você todos os dias: geram renda, melhoram a reputação da área e eliminam relatórios recorrentes da sua caixa.</p>':lojaTab==='cursos'?'<p class="muted">Cursos dão XP direto na habilidade. Alguns exigem cargo mínimo.</p>':'')+
  items.map(it=>{
    let btn='',st='',extra='';
    if(lojaTab==='roupas'){if(S.roupa===it.id){btn='Vestindo';st='disabled';}else if(has(it.id))btn='Vestir';else btn=`Comprar ${brl(it.preco)}`;}
    else if(lojaTab==='acessorios'){if(has(it.id))btn=S.acess.includes(it.id)?'Tirar':'Usar';else btn=`Comprar ${brl(it.preco)}`;}
    else if(lojaTab==='mesa'){if(has(it.id)){btn='Na sua mesa';st='disabled';}else btn=`Comprar ${brl(it.preco)}`;}
    else if(lojaTab==='cursos'){if(S.cursos.includes(it.id)){btn='Concluído';st='disabled';}else if(it.min&&S.cargo<it.min){btn=`Exige ${CARREIRA[it.min].nome}`;st='disabled';}else btn=`Matricular ${brl(it.preco)}`;}
    else{if(S.autos.includes(it.id)){btn=`Rodando · ${brl(it.renda)}/dia`;st='disabled';}else{const f=reqAuto(it);if(f.length){btn='Bloqueada';st='disabled';extra=`<p class="req">Precisa de: ${f.join(', ')}</p>`;}else btn=`Implantar ${brl(it.preco)}`;}}
    const pobre=btn.startsWith('Comprar')||btn.startsWith('Matricular')||btn.startsWith('Implantar');
    if(pobre&&S.dinheiro<it.preco){st='disabled';}
    return `<div class="item">${lojaTab==='roupas'?`<canvas width="28" height="28" data-roupa="${it.id}"></canvas>`:''}<div class="item-t"><b>${it.nome}</b><p>${it.desc}${lojaTab==='automacoes'?` Renda: ${brl(it.renda)} por dia.`:''}</p>${extra}</div><button class="btn${pobre?' primary':''}" data-id="${it.id}" ${st}>${btn}</button></div>`;}).join('');
  $('#shopList').querySelectorAll('canvas[data-roupa]').forEach(c=>{const it=LOJA.roupas.find(x=>x.id===c.dataset.roupa);const cc=c.getContext('2d');cc.imageSmoothingEnabled=false;const L={...lookOf('eu'),shirt:it.shirt,jacket:it.jacket,tie:it.tie,collar:it.collar,hood:it.hood,print:it.print};drawChar(cc,2,2,L,'down',0,2);});
  $('#shopList').querySelectorAll('button[data-id]').forEach(b=>b.onclick=()=>comprar(lojaTab,b.dataset.id));
}
function comprar(tab,id){
  const it=LOJA[tab].find(x=>x.id===id);
  if(tab==='roupas'&&has(id)){S.roupa=id;toast(`Vestindo: ${it.nome}.`);}
  else if(tab==='acessorios'&&has(id)){S.acess=S.acess.includes(id)?S.acess.filter(x=>x!==id):[...S.acess,id];}
  else{
    if(S.dinheiro<it.preco)return;S.dinheiro-=it.preco;
    if(tab==='cursos'){S.cursos.push(id);S.skills[it.skill]+=it.xp;if(it.extra)for(const k in it.extra)S.skills[k]+=it.extra[k];toast(`Curso concluído: ${it.nome}. +${it.xp} XP.`,'good');}
    else if(tab==='automacoes'){S.autos.push(id);if(it.rec)S.missoes=S.missoes.filter(e=>!e.ref.startsWith('rec:'+it.rec));buildMap();toast(`${it.nome} implantada! Renda de ${brl(it.renda)} por dia.`,'gold');confete();}
    else{S.owned.push(id);if(tab==='roupas')S.roupa=id;if(tab==='acessorios')S.acess.push(id);toast(`Comprado: ${it.nome}.`,'good');}
  }
  salvar();lastHud='';updateHud();renderLoja();
}

/* ================= CARREIRA ================= */
function abrirCarreira(){
  const p=podePromover();const prox=CARREIRA[S.cargo+1];
  const reqRows=prox?(()=>{const r=prox.req;const rows=[];
    const add=(n,cur,need,txt)=>rows.push(`<li class="${cur>=need?'ok':''}"><span>${n}</span><div class="bar"><i style="width:${Math.min(100,cur/need*100)}%"></i></div><span class="num">${txt||`${cur}/${need}`}</span></li>`);
    add('XP total',S.xp,r.xp);add('Entregas',S.totalFeitas,r.missoes);
    if(r.sql)add('SQL',lvl(S.skills.sql),r.sql,`nv ${lvl(S.skills.sql)}/${r.sql}`);if(r.py)add('Python',lvl(S.skills.py),r.py,`nv ${lvl(S.skills.py)}/${r.py}`);
    if(r.negocio)add('Negócio',lvl(S.skills.negocio),r.negocio,`nv ${lvl(S.skills.negocio)}/${r.negocio}`);if(r.com)add('Comunicação',lvl(S.skills.com),r.com,`nv ${lvl(S.skills.com)}/${r.com}`);
    if(r.rep)add('Reputação média',avgRep(),r.rep);if(r.auto)add('Automações',S.autos.length,r.auto);return rows.join('');})():'';
  const body=`<div class="career">
    <ol class="ladder">${CARREIRA.map((c,i)=>`<li class="${i<S.cargo?'past':i===S.cargo?'now':''}"><b>${c.nome}</b><span>${brl(c.salario)}</span></li>`).join('')}</ol>
    <div class="career-r">
      ${prox?`<h4>Para virar ${prox.nome}</h4><ul class="reqs">${reqRows}</ul><p class="muted">${p.ok?'Tudo pronto. Vá até a sala do Seu Ronaldo e peça a promoção.':'Quando tudo estiver completo, peça a promoção ao chefe.'}</p>`:'<h4>Topo da carreira!</h4><p>Você é Head de Dados. Agora o desafio é manter as áreas felizes e as automações rodando.</p>'}
      <h4>Reputação com as áreas</h4><ul class="reqs">${DEPTS.map(d=>`<li class="${S.rep[d]>=60?'ok':''}"><span>${d}</span><div class="bar"><i style="width:${S.rep[d]}%"></i></div><span class="num">${S.rep[d]}</span></li>`).join('')}
      <li><span>Moral com o chefe</span><div class="bar"><i style="width:${S.chefe}%"></i></div><span class="num">${S.chefe}</span></li></ul>
      <p class="muted small">Reputação sobe com entregas e conversas; cai com atrasos. Aumento de salário depende da moral com o chefe e da reputação.</p>
    </div></div>`;
  abrirModal('Plano de carreira',body,[],{wide:true});
}

/* ================= AJUDA ================= */
function abrirAjuda(){
  abrirModal('Como jogar',`<div class="help">
   <p>Você começa como estagiário(a) na Tabelão S.A. As áreas (Marketing, Vendas, Operações e Financeiro) mandam demandas para o seu computador. Resolva com SQL, pandas e raciocínio de negócio, cumpra os prazos e suba na carreira.</p>
   <dl>
    <div><dt>Andar</dt><dd>Setas ou WASD. No celular, use o direcional.</dd></div>
    <div><dt>Interagir</dt><dd>E, Espaço ou Enter de frente para algo. No celular, o botão A.</dd></div>
    <div><dt>Missões</dt><dd>No seu computador. Começam com lacunas e evoluem para código de verdade, executado aqui mesmo no navegador.</dd></div>
    <div><dt>Prazos</dt><dd>Atrasou, a área e o chefe ficam chateados. Entregar no mesmo dia dá +20%.</dd></div>
    <div><dt>Energia</dt><dd>Cada entrega gasta energia. Café na copa recupera.</dd></div>
    <div><dt>Dinheiro</dt><dd>Salário a cada 4 dias, menos os boletos. Gaste em roupas, mesa, cursos e automações.</dd></div>
    <div><dt>Crescer</dt><dd>Converse com as áreas, peça demandas, peça aumento e promoção na sala do chefe.</dd></div>
    <div><dt>Calendário</dt><dd>Cada dia do jogo é uma semana do ano: Carnaval, Festa Junina, Black Friday e Natal acontecem no escritório.</dd></div>
   </dl>
   <p class="muted small">O Python aqui é um simulador do pandas que roda no seu navegador: cobre filtros, groupby, agg, merge, pivot_table, value_counts, sort_values e mais. O SQL roda num banco em memória (AlaSQL).</p>
  </div>`,[{t:'Recomeçar do zero',fn:()=>{if(confirm('Apagar todo o progresso e começar de novo?')){try{localStorage.removeItem(SAVE_KEY);}catch(e){}location.reload();}}},{t:'Voltar ao jogo',primary:true,fn:()=>fecharModal()}],{});
}

/* ================= TELA INICIAL ================= */
const SKINS=['#f2d0b0','#e0ac7e','#b97a50','#8a5534','#5c3a24'];
const HAIRS=['#2b1d14','#5a3a1e','#c9932f','#9a2f1e','#d8d8d8','#4b6fd6'];
const STYLES=[['curto','Curto'],['longo','Longo'],['careca','Careca']];
function telaInicial(sv){
  const tmp={skin:SKINS[1],hair:HAIRS[0],style:'curto'};
  const body=`<div class="start">
    <div class="start-hero"><h1>SELECT * FROM carreira</h1><p>Do estagiário ao Head de Dados. Resolva demandas reais de Marketing, Vendas, Operações e Financeiro com SQL e pandas, cumpra prazos e sobreviva ao escritório.</p></div>
    ${sv?`<div class="cont"><p>Você tem um jogo salvo: <b>${esc(sv.nome)}</b>, ${CARREIRA[sv.cargo].nome}, dia ${sv.dia}.</p><button class="btn primary" id="stCont" autofocus>Continuar</button></div><h4>Ou comece de novo</h4>`:''}
    <div class="creator">
      <canvas id="stPrev" width="56" height="84"></canvas>
      <div class="cr-f">
        <label for="stNome">Seu nome no crachá</label><input id="stNome" maxlength="16" value="" placeholder="Ex.: Ana" autocomplete="off" ${sv?'':'autofocus'}>
        <span class="lbl">Tom de pele</span><div class="sw" id="swSkin">${SKINS.map((c,i)=>`<button style="background:${c}" data-v="${c}" aria-label="Tom ${i+1}" class="${c===tmp.skin?'on':''}"></button>`).join('')}</div>
        <span class="lbl">Cabelo</span><div class="sw" id="swHair">${HAIRS.map((c,i)=>`<button style="background:${c}" data-v="${c}" aria-label="Cor ${i+1}" class="${c===tmp.hair?'on':''}"></button>`).join('')}</div>
        <div class="seg" id="swStyle">${STYLES.map(([k,n])=>`<button data-v="${k}" class="${k===tmp.style?'on':''}">${n}</button>`).join('')}</div>
      </div>
    </div></div>`;
  abrirModal('Tabelão S.A.',body,[{t:'Começar o primeiro dia',primary:!sv,fn:()=>{const nome=($('#stNome').value||'').trim()||'Analista';if(sv&&!confirm('Começar de novo apaga o jogo salvo. Continuar?'))return;fecharModal(true);entrar(novoEstado(nome,tmp),true);}}],{noClose:true,wide:true});
  const prev=()=>{const c=$('#stPrev'),x=c.getContext('2d');x.imageSmoothingEnabled=false;x.clearRect(0,0,c.width,c.height);drawChar(x,4,6,{skin:tmp.skin,hair:tmp.hair,style:tmp.style,shirt:'#5aa0d8',pants:'#2b3550'},'down',0,4);};
  const bind=(id,key)=>$('#'+id).querySelectorAll('button').forEach(b=>b.onclick=()=>{tmp[key]=b.dataset.v;$('#'+id).querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));prev();});
  bind('swSkin','skin');bind('swHair','hair');bind('swStyle','style');prev();
  $('#stNome').addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter')$('#modalActions button').click();});
  if(sv)$('#stCont').onclick=()=>{fecharModal(true);entrar(sv,false);};
}
function entrar(st,novo){
  S=st;S.hoje=S.hoje||{entregas:[],ganhos:0,xp:0,atrasos:[]};
  player={id:'player',x:S.pos.x,y:S.pos.y,px:S.pos.x*T,py:S.pos.y*T,dir:S.dir||'up',moving:false};
  buildMap();
  if(blocked(player.x,player.y,'player')){player.x=11;player.y=14;player.px=11*T;player.py=14*T;}
  lastHud='';updateHud();
  if(novo)comecarDia();else{paused=false;toast(`Bem-vindo(a) de volta, ${S.nome}. Dia ${S.dia}, ${horaStr(S.minuto)}.`);}
}

/* ================= CONTROLES ================= */
window.addEventListener('keydown',e=>{
  if(!S)return;
  const tag=(e.target.tagName||'').toLowerCase();const typing=tag==='input'||tag==='textarea';
  if(!$('#dialog').hidden&&!typing){
    if(['KeyE','Space','Enter'].includes(e.code)){if(document.activeElement&&document.activeElement.classList.contains('choice'))return;e.preventDefault();avancar();}
    return;}
  if(modalAberto()){if(e.key==='Escape')fecharModal();return;}
  if(typing)return;
  keys[e.code]=true;
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();
  if(['KeyE','Space','Enter'].includes(e.code)&&!e.repeat)interagir();
});
window.addEventListener('keyup',e=>{keys[e.code]=false;});
window.addEventListener('blur',()=>{keys={};});
document.querySelectorAll('.dpad [data-d]').forEach(b=>{
  const k='d'+b.dataset.d;
  const on=ev=>{ev.preventDefault();keys[k]=true;b.classList.add('on');try{b.setPointerCapture(ev.pointerId);}catch(_){}};
  const off=()=>{keys[k]=false;b.classList.remove('on');};
  b.addEventListener('pointerdown',on);b.addEventListener('pointerup',off);b.addEventListener('pointercancel',off);b.addEventListener('lostpointercapture',off);
});
$('#btnA').addEventListener('click',()=>{if(!S)return;if(!$('#dialog').hidden)return avancar();if(!modalAberto())interagir();});
$('#dialog').addEventListener('click',e=>{if(e.target.closest('.choice'))return;avancar();});
$('#modalClose').onclick=()=>fecharModal();
$('#modal').addEventListener('click',e=>{if(e.target.id==='modal')fecharModal();});
$('#btnLoja').onclick=()=>{if(S&&$('#dialog').hidden)abrirLoja();};
$('#btnCarreira').onclick=()=>{if(S&&$('#dialog').hidden)abrirCarreira();};
$('#btnAjuda').onclick=()=>{if(S&&$('#dialog').hidden)abrirAjuda();};
$('#btnPC').onclick=()=>{if(S&&$('#dialog').hidden)toast('Vá até o seu computador para trabalhar nas demandas (a mesa com o monitor azul).');};
setInterval(()=>{if(S&&!paused)salvar();},8000);
window.addEventListener('pagehide',()=>salvar());
document.fonts&&document.fonts.ready.then(()=>{lastHud='';});
telaInicial(carregar());
requestAnimationFrame(loop);
