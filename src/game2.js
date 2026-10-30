/* ================= COMPUTADOR ================= */
let pcTab='inbox',pcUid=null,edApi=null;
const KIND={fill:'Lacunas',sql:'SQL',py:'Python',quiz:'Pergunta'};
function abrirPC(tab){
  inPC=true;pcTab=tab||'inbox';pcUid=null;
  abrirModal('Intranet da Tabelão S.A.','<div class="pc-wrap"><nav class="pc-nav" id="pcNav"></nav><div class="pc-main" id="pcMain"></div></div>',[], {wide:true,pc:true,noFocus:true});
  inPC=true;paused=true;renderPC();
}
function renderPC(){
  const nav=$('#pcNav');if(!nav)return;
  const tabs=[['inbox','Caixa de entrada',S.missoes.length],['cursos','Cursos'],['caderno','Aulas da Tereza'],['dados','Dicionário de dados'],['hist','Entregues']];
  nav.innerHTML=tabs.map(([k,n,c])=>`<button class="${pcTab===k&&!pcUid?'on':''}" data-tab="${k}">${n}${c!=null?` <b>${c}</b>`:''}</button>`).join('')+`<div class="pc-energy">Energia <strong>${Math.round(S.energia)}</strong></div>`;
  nav.querySelectorAll('button').forEach(b=>b.onclick=()=>{salvarRascunho();pcTab=b.dataset.tab;pcUid=null;cursoAberto=null;renderPC();});
  const main=$('#pcMain');
  if(pcUid){const e=S.missoes.find(x=>x.uid===pcUid);if(e)return renderMissao(main,e);pcUid=null;}
  if(pcTab==='inbox')return renderInbox(main);
  if(pcTab==='dados')return renderDados(main);
  if(pcTab==='hist')return renderHist(main);
  if(pcTab==='cursos')return renderCursosPC(main);
  if(pcTab==='caderno')return renderCaderno(main);
}
function renderInbox(main){
  const ms=S.missoes.map(e=>({e,m:getM(e)})).filter(x=>x.m).sort((a,b)=>a.e.due-b.e.due);
  if(!ms.length){main.innerHTML=`<div class="empty-state"><p>Caixa de entrada zerada.</p><p class="muted">Converse com as áreas para pedir novas demandas, ou volte amanhã. Aproveite para fazer um curso ou rever as aulas da Tereza.</p></div>`;return;}
  main.innerHTML=`<ul class="inbox">${ms.map(({e,m})=>{const rw=rewardOf(m,e);return `<li><button data-uid="${e.uid}">
    <canvas width="28" height="28" data-port="${m.from}"></canvas>
    <span class="ib-from">${NPCS[m.from].nome}<small>${NPCS[m.from].cargo}</small></span>
    <span class="ib-title">${m.title}${e.revisao?' <em>(revisão)</em>':''}${m.rec?' <em>(recorrente)</em>':''}</span>
    <span class="tag t-${m.kind}">${KIND[m.kind]}</span>
    <span class="ib-due ${dueCls(e)}">${dueTxt(e)}</span>
    <span class="ib-rw">${brl(rw.pay)} · ${rw.xp} XP</span></button></li>`;}).join('')}</ul>`;
  main.querySelectorAll('canvas[data-port]').forEach(c=>drawPortrait(c,c.dataset.port));
  main.querySelectorAll('button[data-uid]').forEach(b=>b.onclick=()=>{somEfeito('clique');pcUid=+b.dataset.uid;renderPC();});
}
function esc(s){return escH(s);}
/* --- contexto de dados da missão --- */
function tabelasDaMissao(m){const code=m.kind==='fill'?m.template:(m.solution||'');return TABELAS.filter(t=>new RegExp('\\b'+t+'\\b').test(code));}
function colunasUsadas(m,t){const code=m.kind==='fill'?solutionCode(m):(m.solution||'');return Object.keys(DATA[t][0]).filter(c=>new RegExp('\\b'+c+'\\b').test(code));}
function descreverEsperado(m){
  let exp;try{exp=expected(m);}catch(e){return '';}
  const ord=m.ordered?' <b>na ordem pedida</b>':'';
  if(exp instanceof DF){
    if(exp.rows.length===1&&exp.cols.length===1)return `um único número${ord}.`;
    const nomes=m.lang==='py'?`: ${exp.cols.map(c=>`<code>${escH(c)}</code>`).join(', ')}`:'';
    return `uma tabela com <b>${exp.rows.length} linha${exp.rows.length!==1?'s':''}</b> e <b>${exp.cols.length} coluna${exp.cols.length!==1?'s':''}</b>${nomes}${ord}.`;}
  if(exp instanceof Series)return exp.isDefault?`uma coluna com <b>${exp.values.length} valores</b>${ord}.`:`uma Series com <b>${exp.values.length} linhas</b>, uma para cada <code>${escH(exp.indexName||'item')}</code>${ord}.`;
  if(Array.isArray(exp))return `uma lista com ${exp.length} itens${ord}.`;
  return 'um único valor.';
}
function painelDados(m){
  const ts=tabelasDaMissao(m);if(!ts.length)return '';
  const aberto=m.tier<=2||m.rec?'open':'';
  return `<details class="mctx" ${aberto}><summary>Dados desta missão <span class="muted">(${ts.join(', ')})</span></summary>
    ${ts.map(t=>{const usadas=colunasUsadas(m,t);const cols=Object.keys(DATA[t][0]);
      return `<div class="mctx-t"><div class="mctx-h"><b>${t}</b><span class="muted">${SCHEMAS[t].desc} ${DATA[t].length} linhas.</span></div>
      <div class="mini-wrap"><table class="mini"><thead><tr>${cols.map(c=>`<th class="${usadas.includes(c)?'use':''}" title="${escH(SCHEMAS[t].cols[c])}">${c}<small>${m.lang==='py'?dtypePandas(t,c):tipoColuna(t,c)}</small></th>`).join('')}</tr></thead>
      <tbody>${DATA[t].slice(0,4).map(r=>`<tr>${cols.map(c=>`<td class="${usadas.includes(c)?'use':''}">${celula(r[c])}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div>`;}).join('')}
    <p class="muted small">As colunas em destaque provavelmente vão ser úteis. Passe o mouse no nome para ver a descrição.</p></details>`;
}
/* --- tela da missão --- */
function renderMissao(main,e){
  const m=getM(e);const rw=rewardOf(m,e);
  const head=`<button class="back" id="pcBack">‹ Caixa de entrada</button>
   <header class="mail-h"><canvas width="44" height="44" id="mailPort"></canvas><div><div class="mail-from">${NPCS[m.from].nome} <span>${NPCS[m.from].cargo}</span></div>
   <h3>${m.title}</h3><div class="mail-meta"><span class="ib-due ${dueCls(e)}">Prazo: ${dueTxt(e).toLowerCase()}</span><span>${brl(rw.pay)} + ${rw.xp} XP${e.start===S.dia&&!e.revisao?' (+20% se entregar hoje)':''}</span><span class="tag t-${m.kind}">${KIND[m.kind]}</span></div></div></header>
   <p class="brief">${esc(m.brief)}</p>`;
  edApi=null;
  if(m.kind==='quiz'){
    const order=m.options.map((_,i)=>i);for(let i=order.length-1;i>0;i--){const j=(e.uid*7+i*13)%(i+1);[order[i],order[j]]=[order[j],order[i]];}
    main.innerHTML=head+`<div class="quiz">${order.map(i=>`<button class="opt" data-i="${i}" ${e.tried&&e.tried.includes(i)?'disabled':''}>${esc(m.options[i])}</button>`).join('')}</div><div id="out" class="out"></div>`;
    drawPortrait($('#mailPort'),m.from);$('#pcBack').onclick=()=>{pcUid=null;renderPC();};
    main.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{
      const i=+b.dataset.i;
      if(S.energia<custoEnergia())return outErro('Sem energia para pensar. Vá até a copa tomar um café.');
      if(i===m.answer){somEfeito('sucesso');mostrarSucesso(concluir(e));}
      else{somEfeito('erro');e.wrong++;e.tried=(e.tried||[]).concat(i);S.energia=clamp(S.energia-3,0,100);b.disabled=true;b.classList.add('no');outErro('Não é bem isso. Pense no impacto para o negócio e tente de novo (a recompensa diminui um pouco).');lastHud='';updateHud();}
    });
    return;}
  const sql=m.lang==='sql';
  const arquivo=`missao_${String(m.id).replace(/[^a-z0-9]/gi,'_')}`;
  let editor;
  if(m.kind==='fill'){
    const parts=m.template.split('___');const vals=e.draft||[];
    const linhas=m.template.split('\n').length;
    editor=`<div class="ed fill" data-lang="${m.lang}"><div class="ed-gut" aria-hidden="true">${Array.from({length:linhas},(_,i)=>`<span>${i+1}</span>`).join('')}</div><div class="ed-area"><pre class="ed-hl static">${parts.map((p,i)=>realcar(p,m.lang)+(i<parts.length-1?`<input class="blank" data-b="${i}" value="${esc(vals[i]||'')}" size="${Math.max(3,m.answers[i].length+1)}" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="Lacuna ${i+1}">`:'')).join('')}</pre></div></div>`;
  }else editor=editorHTML('missEd',m.lang,e.draft!=null?e.draft:(m.starter||''));
  const botoes=`<button class="tb-btn run" id="btnRun" title="${sql?'Ctrl+Enter ou F5':'Shift+Enter ou Ctrl+Enter'}">▶ Executar</button><button class="tb-btn send" id="btnSend">✓ Entregar</button><span class="sp"></span>
      <button class="tb-btn ghost" id="btnHint">${has('pato')&&S.pato!==S.dia?'🦆 Perguntar ao pato':'💡 Dica (R$ 20)'}</button><button class="tb-btn ghost" id="btnGab">Gabarito</button>`;
  const esperado=descreverEsperado(m);
  let tool;
  if(sql){
    tool=`<div class="tool sqltool">
      <div class="tool-bar"><span class="tool-logo">🛢 Cliente SQL</span><span class="conn"><i class="dot"></i>tabelao_prod</span>${botoes}</div>
      <div class="tool-main">
        <aside class="dbnav"><div class="dbnav-h">Navegador do banco</div>
          <div class="tree"><div class="tr-db">▾ 🛢 tabelao_prod</div><div class="tr-f">▾ 📁 Tabelas</div>
          ${TABELAS.map(t=>`<details class="tr-t" ${tabelasDaMissao(m).includes(t)?'open':''}><summary><span class="ico">▦</span>${t}</summary>${Object.keys(DATA[t][0]).map(c=>`<button class="tr-c" data-ins="${c}" title="${esc(SCHEMAS[t].cols[c])}"><span>${c}</span><small>${tipoColuna(t,c)}</small></button>`).join('')}</details>`).join('')}</div></aside>
        <div class="tool-ed"><div class="ed-tabs"><span class="ed-tab on">${arquivo}.sql</span></div>${editor}</div>
      </div>
      <div class="tool-res"><div class="ed-tabs res-tabs"><span class="ed-tab on" id="tabRes">Resultado</span><span class="ed-tab" id="tabMsg">Mensagens</span></div><div id="out" class="out"><p class="res-vazio">Execute a consulta para ver o resultado aqui.</p></div></div>
    </div>`;
  }else{
    e.execN=e.execN||0;
    tool=`<div class="tool nb">
      <div class="nb-top"><span class="nb-logo">jupyter</span><span class="nb-file">${arquivo}.ipynb</span><span class="nb-saved">salvo automaticamente</span><span class="nb-kernel">Python 3 (pandas) <i class="dot"></i></span></div>
      <div class="tool-bar nb-bar">${botoes}</div>
      <details class="nb-vars"><summary>Variáveis carregadas</summary><div class="vars">${TABELAS.map(t=>`<div class="var"><button class="chip tname" data-ins="${t}">${t}</button><span class="muted">DataFrame ${DATA[t].length} × ${Object.keys(DATA[t][0]).length}</span><div class="var-cols">${Object.keys(DATA[t][0]).map(c=>`<button class="chip" data-ins="'${c}'" title="${esc(SCHEMAS[t].cols[c])}">${c}</button>`).join('')}</div></div>`).join('')}<div class="var"><button class="chip tname" data-ins="pd">pd</button><span class="muted">módulo pandas</span></div><div class="var"><button class="chip tname" data-ins="np">np</button><span class="muted">módulo numpy (np.where)</span></div></div></details>
      <div class="nb-body">
        <div class="cell md"><div class="prompt"></div><div class="md-txt"><b>${esc(m.title)}</b><br>${esc(m.brief)}</div></div>
        <div class="cell cc sel"><div class="prompt" id="inPrompt">In [${e.execN||' '}]:</div><div class="cell-in">${editor}</div></div>
        <div class="cell-out" id="out"></div>
      </div>
    </div>`;
  }
  main.innerHTML=head+painelDados(m)+(esperado?`<div class="esperado"><span>🎯</span><div>Resultado esperado: ${esperado}</div></div>`:'')+tool+`<div id="hint" class="hint" hidden></div>`;
  drawPortrait($('#mailPort'),m.from);
  $('#pcBack').onclick=()=>{salvarRascunho();pcUid=null;renderPC();};
  if(m.kind!=='fill'){const ed=$('#missEd');edApi=editorLigar(ed,{onRun:()=>executar(m,e)});setTimeout(()=>{edApi.ta.focus();edApi.ta.setSelectionRange(edApi.ta.value.length,edApi.ta.value.length);},40);}
  main.querySelectorAll('.blank').forEach((inp,i,all)=>{inp.addEventListener('keydown',ev=>{ev.stopPropagation();if(ev.key==='Enter'){ev.preventDefault();if(all[i+1])all[i+1].focus();else executar(m,e);}});if(i===0)setTimeout(()=>inp.focus(),40);});
  main.querySelectorAll('[data-ins]').forEach(c=>c.onclick=()=>{if(edApi)edApi.inserir(c.dataset.ins);});
  if(sql){$('#tabRes').onclick=()=>{if(main._ultimo)mostrarSQL(main._ultimo);};$('#tabMsg').onclick=()=>mostrarMsg(main._msg||'Nenhuma mensagem.');}
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
function mostrarSQL(x){const out=$('#out');if(!out)return;$('#tabRes')&&$('#tabRes').classList.add('on');$('#tabMsg')&&$('#tabMsg').classList.remove('on');out.innerHTML=(x.aviso||'')+gradeSQL(x.df,x.ms);}
function mostrarMsg(msg,erro){const out=$('#out');if(!out)return;if($('#tabMsg')){$('#tabMsg').classList.add('on');$('#tabRes').classList.remove('on');}out.innerHTML=`<pre class="msg ${erro?'err-msg':''}">${esc(msg)}</pre>`;}
function abrirConfirm(msg,ok){const h=$('#hint');h.hidden=false;h.innerHTML=`<div class="confirm"><p>${msg}</p><button class="btn primary" id="cfOk">Ver gabarito</button><button class="btn ghost" id="cfNo">Cancelar</button></div>`;$('#cfOk').onclick=()=>{h.hidden=true;ok();};$('#cfNo').onclick=()=>{h.hidden=true;h.innerHTML='';};}
function aplicarGabarito(m){
  if(m.kind==='fill'){document.querySelectorAll('.blank').forEach((inp,i)=>inp.value=m.answers[i]);}
  else if(edApi)edApi.definir(m.solution);
  const h=$('#hint');h.hidden=false;h.innerHTML='<b>Gabarito aplicado.</b> Execute, entenda cada parte e entregue. Na próxima, tente sem!';
}
function codigoAtual(m){
  if(m.kind==='fill'){const vals=[...document.querySelectorAll('.blank')].map(i=>i.value.trim());let i=0;return {code:m.template.replace(/___/g,()=>vals[i++]||'___'),vals};}
  return {code:edApi?edApi.valor():''};
}
function salvarRascunho(){
  if(!pcUid)return;const e=S.missoes.find(x=>x.uid===pcUid);if(!e)return;const m=getM(e);if(!m||m.kind==='quiz')return;
  if(m.kind==='fill'){const b=document.querySelectorAll('.blank');if(b.length)e.draft=[...b].map(i=>i.value);}
  else if(edApi)e.draft=edApi.valor();
}
function outErro(msg){const m=pcUid&&getM(S.missoes.find(x=>x.uid===pcUid)||{ref:''});
  if(m&&m.lang==='sql'){mostrarMsg(msg,true);return;}
  const o=$('#out');if(o)o.innerHTML=`<pre class="nb-err">${esc(msg)}</pre>`;}
function rodar(m,e){
  const {code,vals}=codigoAtual(m);
  if(m.kind==='fill'&&vals.some(v=>!v)){outErro('Preencha todas as lacunas.');return null;}
  try{const t0=performance.now();const r=runCode(m.lang,code);r.ms=Math.max(1,Math.round(performance.now()-t0));return r;}
  catch(err){somEfeito('erro');const msg=err.message||String(err);
    if(m.lang==='sql')mostrarMsg('SQL Error: '+msg,true);
    else{e.execN=(e.execN||0)+1;$('#inPrompt').textContent=`In [${e.execN}]:`;$('#out').innerHTML=`<pre class="nb-err"><b>${esc(msg.split(':')[0])}</b>${esc(msg.includes(':')?msg.slice(msg.indexOf(':')):'')}</pre>`;}
    return null;}
}
function mostrarResultado(m,e,r,aviso){
  aviso=aviso||'';
  if(m.lang==='sql'){const main=$('#pcMain');main._ultimo={df:r.result,ms:r.ms,aviso};main._msg=`Consulta executada com sucesso.\n${r.result.rows.length} linha(s) em ${r.ms} ms.`;mostrarSQL(main._ultimo);return;}
  e.execN=(e.execN||0)+1;$('#inPrompt').textContent=`In [${e.execN}]:`;
  const s=saidaNotebook(r);
  $('#out').innerHTML=aviso+(s.stdout?`<div class="out-row"><div class="prompt"></div><div class="out-body">${s.stdout}</div></div>`:'')+(s.out?`<div class="out-row"><div class="prompt out">Out[${e.execN}]:</div><div class="out-body">${s.out}</div></div>`:'')+(!s.stdout&&!s.out?'<div class="out-row"><div class="prompt"></div><div class="out-body muted small">(sem saída: deixe a expressão na última linha para ver o resultado)</div></div>':'');
}
function executar(m,e){salvarRascunho();const r=rodar(m,e);if(!r)return;somEfeito('clique');mostrarResultado(m,e,r);}
function entregar(m,e){
  salvarRascunho();
  if(S.energia<custoEnergia()){outErro(`Sem energia (precisa de ${custoEnergia()}). Vá até a copa tomar um café.`);return;}
  const r=rodar(m,e);if(!r)return;
  if(!r.hasResult){outErro('Seu código não devolveu resultado. Deixe a expressão final na última linha (sem atribuir a uma variável) ou use print().');return;}
  let exp;try{exp=expected(m);}catch(err){outErro('Erro interno ao conferir. Tente executar de novo.');return;}
  const c=compareResults(r.result,exp,m.ordered);
  if(!c.ok){e.wrong++;S.energia=clamp(S.energia-3,0,100);lastHud='';updateHud();somEfeito('erro');
    mostrarResultado(m,e,r,`<div class="devolveu"><b>${NPCS[m.from].nome} devolveu:</b> “Não é isso que eu pedi.” ${esc(c.msg)}</div>`);return;}
  somEfeito('sucesso');mostrarSucesso(concluir(e));
}
function mostrarSucesso(res){
  const {pay,xp,rapido,m}=res;
  const reac={bia:'Amei!!! Vai direto pro slide ✨',carlao:'É disso que eu tô falando! Valeu!',neide:'Conferi no caderninho: bate. Muito bem.',jorge:'Isso fecha. Obrigado.',chefe:'Excelente. Vou apresentar como se fosse meu. Brincadeira. Talvez.',fabio:'Limpo e sem gambiarra. Respeito.',kevin:'Uau. Me ensina depois?',tereza:'Muito bem. Agora explica pra mim o porquê.'}[m.from];
  edApi=null;
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
function renderValor(v){return tabelaPandas(v);}
function renderDados(main){
  main.innerHTML=`<p class="muted">Estas são as tabelas da Tabelão S.A. Em SQL use o nome direto (FROM vendas). Em Python elas já estão carregadas como DataFrames: vendas, clientes, campanhas, entregas.</p>`+
  Object.keys(SCHEMAS).map(t=>{const cols=Object.keys(DATA[t][0]);const df=new DF(cols,DATA[t].slice(0,6));return `<section class="dict"><h4>${t} <span class="muted">${DATA[t].length} linhas</span></h4><p>${SCHEMAS[t].desc}</p>
    <dl>${Object.entries(SCHEMAS[t].cols).map(([c,d])=>`<div><dt>${c}</dt><dd><span class="tp">${tipoColuna(t,c)}</span> ${esc(d)}</dd></div>`).join('')}</dl>
    <details><summary>Ver as primeiras linhas</summary>${gradeSQL(df)}</details></section>`;}).join('');
}
function renderHist(main){
  if(!S.histor.length){main.innerHTML='<div class="empty-state"><p>Nada entregue ainda.</p><p class="muted">Suas entregas aparecem aqui.</p></div>';return;}
  main.innerHTML=`<table class="ledger hist">${S.histor.map(h=>`<tr><td>Dia ${h.dia}</td><td>${esc(h.t)}<small>${NPCS[h.from].nome}</small></td><td class="num">${brl(h.pay)}</td><td class="num">${h.xp} XP</td></tr>`).join('')}</table>`;
}

/* ================= AULAS DA TEREZA ================= */
const SKILL_NOME={sql:'SQL',py:'Python',negocio:'Negócio',com:'Comunicação'};
function terezaDisponivel(){return S.tereza.dia!==S.dia;}
function aulaDeHoje(){return TEREZA[S.tereza.idx%TEREZA.length];}
function abrirAulaTereza(aula,doDia){
  const jaFeita=S.tereza.feitas.includes(aula.id);
  const revisao=S.tereza.idx>=TEREZA.length&&doDia;
  const body=`<div class="aula">
    <div class="aula-top"><canvas width="44" height="44" id="aulaPort"></canvas><div><span class="tag t-${aula.skill==='sql'?'sql':aula.skill==='py'?'py':'fill'}">${SKILL_NOME[aula.skill]}</span><h3>${esc(aula.titulo)}</h3><p class="muted small">Aula ${TEREZA.indexOf(aula)+1} de ${TEREZA.length}${revisao?' · revisão':''}</p></div></div>
    ${renderBlocos(aula.blocos)}
    ${aula.desafio?`<section class="desafio"><h4>Desafio rápido</h4><p>${mdInline(aula.desafio.enunciado)}</p>${blocoExec(aula.desafio.lang,aula.desafio.starter||'','Sua resposta')}<div class="desafio-acoes"><button class="btn primary" id="btnDesafio">Conferir</button><span id="desafioMsg" class="small"></span></div></section>`:''}
  </div>`;
  abrirModal(`Aula da Tereza`,body,[{t:'Fechar',fn:()=>fecharModal()}],{wide:true,noFocus:true});
  drawPortrait($('#aulaPort'),'tereza');
  const root=$('#modalBody');ligarBlocos(root);
  if(doDia&&!jaFeita&&S.tereza.dia!==S.dia){S.tereza.dia=S.dia;S.skills[aula.skill]+=10;toast(`Aula concluída: +10 XP de ${SKILL_NOME[aula.skill]}.`);somEfeito('aula');}
  else if(doDia&&S.tereza.dia!==S.dia){S.tereza.dia=S.dia;}
  if(doDia){if(!S.tereza.feitas.includes(aula.id))S.tereza.feitas.push(aula.id);S.tereza.idx++;}
  salvar();lastHud='';updateHud();
  const bd=$('#btnDesafio');
  if(bd)bd.onclick=()=>{
    const box=root.querySelector('.desafio .ed');const code=box.querySelector('.ed-ta').value;const msg=$('#desafioMsg');
    let r;try{r=runCode(aula.desafio.lang,code);}catch(err){msg.className='small bad';msg.textContent=err.message;somEfeito('erro');return;}
    const out=document.getElementById(box.id+'-out');
    if(aula.desafio.lang==='sql')out.innerHTML=gradeSQL(r.result);else{const s=saidaNotebook(r);out.innerHTML=s.stdout+s.out;}
    if(!r.hasResult){msg.className='small bad';msg.textContent='Deixe o resultado na última linha para eu conferir.';return;}
    const c=compareResults(r.result,runCode(aula.desafio.lang,aula.desafio.solution).result,aula.desafio.ordered);
    if(!c.ok){msg.className='small bad';msg.textContent='Ainda não. '+c.msg;somEfeito('erro');return;}
    if(!S.tereza.desafios.includes(aula.id)){S.tereza.desafios.push(aula.id);S.skills[aula.skill]+=20;S.xp+=10;msg.textContent='Isso! +20 XP de '+SKILL_NOME[aula.skill]+'.';salvar();lastHud='';updateHud();}
    else msg.textContent='Certo de novo!';
    msg.className='small good';somEfeito('sucesso');
  };
}
function renderCaderno(main){
  const vistas=TEREZA.filter(a=>S.tereza.feitas.includes(a.id));
  main.innerHTML=`<div class="caderno"><p class="muted">Toda manhã a Tereza tem uma aula nova na mesa dela, perto do TI. As aulas que você já viu ficam guardadas aqui para revisar.</p>
    ${vistas.length?`<ol class="aulas-lista">${TEREZA.map((a,i)=>S.tereza.feitas.includes(a.id)?`<li><button data-a="${a.id}"><span class="num">${i+1}</span><span>${esc(a.titulo)}</span><span class="tag t-${a.skill==='sql'?'sql':a.skill==='py'?'py':'fill'}">${SKILL_NOME[a.skill]}</span>${S.tereza.desafios.includes(a.id)?'<span class="ok-mark">✔ desafio</span>':''}</button></li>`:'').join('')}</ol>`:'<div class="empty-state"><p>Nenhuma aula ainda.</p><p class="muted">Vá até a mesa da Tereza e peça a aula do dia.</p></div>'}
    <p class="muted small">${S.tereza.feitas.length} de ${TEREZA.length} aulas vistas · ${S.tereza.desafios.length} desafios resolvidos</p></div>`;
  main.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{const a=TEREZA.find(x=>x.id===b.dataset.a);inPC=false;abrirAulaTereza(a,false);});
}

/* ================= CURSOS ================= */
let cursoAberto=null,aulaAberta=0;
function progCurso(id){S.cursoProg[id]=S.cursoProg[id]||{vistas:[],ok:false,nota:null};return S.cursoProg[id];}
function renderCursosPC(main){
  if(cursoAberto)return renderCurso(main,cursoAberto);
  main.innerHTML=`<div class="ead"><div class="ead-h"><b>Escola Tabelão</b><span class="muted">Cursos comprados na loja aparecem aqui. A prova final libera o XP do curso.</span></div>
   <div class="ead-grid">${LOJA.cursos.map(c=>{const meu=S.cursos.includes(c.id);const p=progCurso(c.id);const n=CURSOS[c.id].aulas.length;
     return `<div class="ead-card ${meu?'':'lock'}"><div class="ead-card-h"><span class="tag t-${c.skill==='sql'?'sql':c.skill==='py'?'py':'fill'}">${SKILL_NOME[c.skill]}</span>${p.ok?'<span class="ok-mark">✔ concluído</span>':''}</div>
       <b>${esc(c.nome)}</b><p class="muted small">${n} aulas + prova · ${c.desc}</p>
       <div class="bar"><i style="width:${Math.round(p.vistas.length/n*100)}%"></i></div>
       ${meu?`<button class="btn primary" data-c="${c.id}">${p.vistas.length?'Continuar':'Começar'}</button>`:`<button class="btn" data-loja="1">Comprar na loja · ${brl(c.preco)}</button>`}</div>`;}).join('')}</div></div>`;
  main.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{cursoAberto=b.dataset.c;aulaAberta=Math.min(progCurso(cursoAberto).vistas.length,CURSOS[cursoAberto].aulas.length);renderPC();});
  main.querySelectorAll('[data-loja]').forEach(b=>b.onclick=()=>{fecharModal();abrirLoja('cursos');});
}
function renderCurso(main,id){
  const c=LOJA.cursos.find(x=>x.id===id),cur=CURSOS[id],p=progCurso(id);const n=cur.aulas.length;
  const naProva=aulaAberta>=n;
  if(!naProva&&!p.vistas.includes(aulaAberta)){p.vistas.push(aulaAberta);salvar();}
  main.innerHTML=`<div class="curso"><button class="back" id="cBack">‹ Todos os cursos</button>
   <div class="curso-l"><aside class="curso-nav"><b>${esc(c.nome)}</b><ol>${cur.aulas.map((a,i)=>`<li><button class="${i===aulaAberta?'on':''}" data-i="${i}">${p.vistas.includes(i)?'✔':'○'} ${esc(a.titulo)}</button></li>`).join('')}
     <li><button class="${naProva?'on':''}" data-i="${n}">${p.ok?'✔':'★'} Prova final</button></li></ol></aside>
   <div class="curso-c" id="cursoC"></div></div></div>`;
  $('#cBack').onclick=()=>{cursoAberto=null;renderPC();};
  main.querySelectorAll('.curso-nav [data-i]').forEach(b=>b.onclick=()=>{aulaAberta=+b.dataset.i;renderCurso(main,id);});
  const cc=$('#cursoC');
  if(!naProva){
    const a=cur.aulas[aulaAberta];
    cc.innerHTML=`<p class="muted small">Aula ${aulaAberta+1} de ${n}</p><h3>${esc(a.titulo)}</h3>${renderBlocos(a.blocos)}<div class="curso-nav-b">${aulaAberta>0?'<button class="btn" id="cPrev">‹ Anterior</button>':''}<button class="btn primary" id="cNext">${aulaAberta<n-1?'Próxima aula ›':'Ir para a prova ›'}</button></div>`;
    ligarBlocos(cc);
    if($('#cPrev'))$('#cPrev').onclick=()=>{aulaAberta--;renderCurso(main,id);main.scrollTop=0;};
    $('#cNext').onclick=()=>{aulaAberta++;renderCurso(main,id);main.scrollTop=0;};
    return;}
  if(p.vistas.length<n){cc.innerHTML=`<h3>Prova final</h3><p>Veja todas as aulas antes da prova. Faltam ${n-p.vistas.length}.</p>`;return;}
  cc.innerHTML=`<h3>Prova final</h3><p class="muted">Acerte pelo menos 2 de 3 para concluir${p.ok?'':` e ganhar <b>+${c.xp} XP de ${SKILL_NOME[c.skill]}</b>`}.</p>
    ${cur.quiz.map((q,qi)=>{const ord=q.o.map((_,i)=>i);const R=rng32(qi*97+id.length*13+id.charCodeAt(2));for(let i=ord.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[ord[i],ord[j]]=[ord[j],ord[i]];}return `<fieldset class="pq"><legend>${qi+1}. ${mdInline(q.q)}</legend>${ord.map(oi=>`<label><input type="radio" name="q${qi}" value="${oi}"> ${mdInline(q.o[oi])}</label>`).join('')}<p class="pq-exp" hidden></p></fieldset>`;}).join('')}
    <button class="btn primary" id="cProva">Entregar prova</button><p id="cRes"></p>`;
  cc.querySelectorAll('input').forEach(i=>i.addEventListener('keydown',ev=>ev.stopPropagation()));
  $('#cProva').onclick=()=>{
    let acertos=0;
    cur.quiz.forEach((q,qi)=>{const sel=cc.querySelector(`input[name="q${qi}"]:checked`);const fs=cc.querySelectorAll('.pq')[qi];const ok=sel&&+sel.value===q.a;if(ok)acertos++;fs.classList.toggle('certo',!!ok);fs.classList.toggle('errado',!ok);const ex=fs.querySelector('.pq-exp');ex.hidden=false;ex.textContent=(ok?'Certo. ':'Resposta: '+q.o[q.a]+'. ')+q.e;});
    p.nota=Math.max(p.nota||0,acertos);
    const res=$('#cRes');
    if(acertos>=2){if(!p.ok){p.ok=true;S.skills[c.skill]+=c.xp;if(c.extra)for(const k in c.extra)S.skills[k]+=c.extra[k];S.xp+=Math.round(c.xp/4);toast(`Curso concluído: ${c.nome}. +${c.xp} XP!`,'gold');somEfeito('promocao');confete();}
      res.innerHTML=`<b class="good">${acertos} de 3. Aprovado!</b>`;}
    else{res.innerHTML=`<b class="bad">${acertos} de 3.</b> Revise as aulas e tente de novo.`;somEfeito('erro');}
    salvar();lastHud='';updateHud();
  };
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
  $('#shopList').innerHTML=(lojaTab==='automacoes'?'<p class="muted">Automações trabalham por você todos os dias: geram renda, melhoram a reputação da área e eliminam relatórios recorrentes da sua caixa.</p>':lojaTab==='cursos'?'<p class="muted">Cada curso tem aulas com exemplos que você pode executar e uma prova final. O XP vem quando você passa na prova. Os cursos ficam no seu computador, na aba Cursos.</p>':'')+
  items.map(it=>{
    let btn='',st='',extra='';
    if(lojaTab==='roupas'){if(S.roupa===it.id){btn='Vestindo';st='disabled';}else if(has(it.id))btn='Vestir';else btn=`Comprar ${brl(it.preco)}`;}
    else if(lojaTab==='acessorios'){if(has(it.id))btn=S.acess.includes(it.id)?'Tirar':'Usar';else btn=`Comprar ${brl(it.preco)}`;}
    else if(lojaTab==='mesa'){if(has(it.id)){btn='Na sua mesa';st='disabled';}else btn=`Comprar ${brl(it.preco)}`;}
    else if(lojaTab==='cursos'){if(S.cursos.includes(it.id)){btn=progCurso(it.id).ok?'Rever aulas':'Estudar';}else if(it.min&&S.cargo<it.min){btn=`Exige ${CARREIRA[it.min].nome}`;st='disabled';}else btn=`Matricular ${brl(it.preco)}`;}
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
  else if(tab==='cursos'&&S.cursos.includes(id)){fecharModal();abrirPC('cursos');cursoAberto=id;aulaAberta=Math.min(progCurso(id).vistas.length,CURSOS[id].aulas.length-1);renderPC();return;}
  else{
    if(S.dinheiro<it.preco)return;S.dinheiro-=it.preco;
    somEfeito('moeda');
    if(tab==='cursos'){S.cursos.push(id);progCurso(id);salvar();toast(`Matrícula feita: ${it.nome}. Bons estudos!`,'good');fecharModal();abrirPC('cursos');cursoAberto=id;aulaAberta=0;renderPC();return;}
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
   <h4>Som</h4>
   <div class="som-cfg">
    <label><input type="checkbox" id="cfMus" ${SOM.cfg.musica?'checked':''}> Música</label>
    <label><input type="checkbox" id="cfSfx" ${SOM.cfg.efeitos?'checked':''}> Efeitos sonoros</label>
    <label><input type="checkbox" id="cfVoz" ${SOM.cfg.vozes?'checked':''}> Vozes nos diálogos</label>
    <label class="vol">Volume <input type="range" id="cfVol" min="0" max="1" step="0.05" value="${SOM.cfg.volume}"></label>
   </div>
   <p class="muted small">O Python aqui é um simulador que roda no seu navegador: aceita variáveis, listas, dicionários, for, if, funções, f-strings e boa parte do pandas (filtros, groupby, agg, merge, pivot_table, apply e mais). O SQL roda num banco em memória (AlaSQL).</p>
  </div>`,[{t:'Recomeçar do zero',fn:()=>{if(confirm('Apagar todo o progresso e começar de novo?')){try{localStorage.removeItem(SAVE_KEY);}catch(e){}location.reload();}}},{t:'Voltar ao jogo',primary:true,fn:()=>fecharModal()}],{});
  const liga=(id,k)=>{$('#'+id).onchange=ev=>{SOM.cfg[k]=ev.target.checked;somSalvarCfg();somAplicarCfg();atualizarBotaoSom();};};
  liga('cfMus','musica');liga('cfSfx','efeitos');liga('cfVoz','vozes');
  $('#cfVol').oninput=ev=>{SOM.cfg.volume=+ev.target.value;somSalvarCfg();somAplicarCfg();};
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
  S.tereza=S.tereza||{idx:0,dia:0,feitas:[],desafios:[],apresentada:false};
  if(!S.cursoProg){S.cursoProg={};(S.cursos||[]).forEach(id=>{S.cursoProg[id]={vistas:CURSOS[id].aulas.map((_,i)=>i),ok:true,nota:null};});}
  player={id:'player',x:S.pos.x,y:S.pos.y,px:S.pos.x*T,py:S.pos.y*T,dir:S.dir||'up',moving:false};
  buildMap();
  if(blocked(player.x,player.y,'player')){player.x=11;player.y=14;player.px=11*T;player.py=14*T;}
  lastHud='';updateHud();
  somTocar(musicaAmbiente());
  if(novo)comecarDia();else if(!S.tereza.apresentada){paused=false;apresentarTereza();}else{paused=false;toast(`Bem-vindo(a) de volta, ${S.nome}. Dia ${S.dia}, ${horaStr(S.minuto)}.`);}
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
function atualizarBotaoSom(){const b=$('#btnSom');if(!b)return;b.textContent=SOM.cfg.musica?'♪':'♪̸';b.setAttribute('aria-label',SOM.cfg.musica?'Desligar música':'Ligar música');b.classList.toggle('off',!SOM.cfg.musica);}
$('#btnSom').onclick=()=>{somIniciar();SOM.cfg.musica=!SOM.cfg.musica;somSalvarCfg();somAplicarCfg();atualizarBotaoSom();};
atualizarBotaoSom();
$('#btnPC').onclick=()=>{if(S&&$('#dialog').hidden)toast('Vá até o seu computador para trabalhar nas demandas (a mesa com o monitor azul).');};
setInterval(()=>{if(S&&!paused)salvar();},8000);
window.addEventListener('pagehide',()=>salvar());
document.fonts&&document.fonts.ready.then(()=>{lastHud='';});
telaInicial(carregar());
requestAnimationFrame(loop);
