/* ============ IDE: editor com destaque de sintaxe ============ */
const SQL_KW=new Set('SELECT FROM WHERE AND OR NOT IN IS NULL AS ON JOIN LEFT RIGHT INNER OUTER FULL CROSS GROUP BY ORDER HAVING LIMIT OFFSET DESC ASC DISTINCT CASE WHEN THEN ELSE END BETWEEN LIKE WITH UNION ALL EXISTS TOP'.split(' '));
const SQL_FN=new Set('COUNT SUM AVG MIN MAX ROUND COALESCE UPPER LOWER LENGTH ABS CAST IFNULL NULLIF SUBSTRING TRIM'.split(' '));
const PY_KW=new Set('def return if elif else for while in not and or is None True False import as from lambda break continue pass with try except class'.split(' '));
const PY_FN=new Set('print len range sum min max round int float str list dict sorted enumerate zip type abs set tuple bool isinstance'.split(' '));
const TABELAS=['vendas','clientes','campanhas','entregas'];
function escH(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
function realcar(code,lang){
  if(lang==='txt')return escH(code);
  const re=lang==='sql'
    ?/(--[^\n]*)|('(?:[^']|'')*'?)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][A-Za-z0-9_]*)|([^\sA-Za-z0-9_']+|\s+)/g
    :/(#[^\n]*)|([fFrR]?(?:"""[\s\S]*?(?:"""|$)|'''[\s\S]*?(?:'''|$)|"(?:[^"\\\n]|\\.)*"?|'(?:[^'\\\n]|\\.)*'?))|(\b\d+(?:\.\d+)?\b)|([A-Za-z_\u00C0-\u00FF][A-Za-z0-9_\u00C0-\u00FF]*)|([^\sA-Za-z0-9_'"#\u00C0-\u00FF]+|\s+)/g;
  let out='',m,prev='';
  while((m=re.exec(code))){
    const [tok,com,str,num,word]=m;
    if(com)out+=`<span class="t-com">${escH(com)}</span>`;
    else if(str)out+=`<span class="t-str">${escH(str)}</span>`;
    else if(num)out+=`<span class="t-num">${num}</span>`;
    else if(word){
      if(lang==='sql'){const U=word.toUpperCase();
        out+=SQL_KW.has(U)?`<span class="t-kw">${word}</span>`:SQL_FN.has(U)?`<span class="t-fn">${word}</span>`:TABELAS.includes(word.toLowerCase())?`<span class="t-tb">${word}</span>`:`<span class="t-id">${word}</span>`;}
      else{out+=PY_KW.has(word)?`<span class="t-kw">${word}</span>`:prev==='.'?`<span class="t-fn">${word}</span>`:PY_FN.has(word)?`<span class="t-bi">${word}</span>`:(TABELAS.includes(word)||word==='pd'||word==='np')?`<span class="t-tb">${word}</span>`:`<span class="t-id">${word}</span>`;}
    }else out+=escH(tok);
    prev=tok.trim()?tok.slice(-1):prev;
  }
  return out;
}
/* Editor: textarea transparente sobre um <pre> realçado + gutter com números de linha */
function editorHTML(id,lang,code){
  return `<div class="ed" id="${id}" data-lang="${lang}"><div class="ed-gut" aria-hidden="true"></div><div class="ed-area"><pre class="ed-hl" aria-hidden="true"></pre><textarea class="ed-ta" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" aria-label="Editor de código ${lang==='sql'?'SQL':'Python'}">${escH(code)}</textarea></div></div>`;
}
function editorLigar(root,{onRun,onChange}={}){
  const ta=root.querySelector('.ed-ta'),hl=root.querySelector('.ed-hl'),gut=root.querySelector('.ed-gut'),lang=root.dataset.lang;
  const upd=()=>{
    hl.innerHTML=realcar(ta.value,lang)+'\n';
    const n=ta.value.split('\n').length;gut.innerHTML=Array.from({length:Math.max(n,1)},(_,i)=>`<span>${i+1}</span>`).join('');
    ta.style.height='auto';ta.style.height=Math.max(ta.scrollHeight,root.classList.contains('mini')?60:140)+'px';
    hl.style.transform=`translateX(${-ta.scrollLeft}px)`;
    if(onChange)onChange(ta.value);
  };
  ta.addEventListener('input',upd);
  ta.addEventListener('scroll',()=>{hl.style.transform=`translateX(${-ta.scrollLeft}px)`;});
  ta.addEventListener('keydown',e=>{
    e.stopPropagation();
    if((e.key==='Enter'&&(e.ctrlKey||e.metaKey))||(e.key==='Enter'&&e.shiftKey&&lang==='py')){e.preventDefault();if(onRun)onRun();return;}
    if(e.key==='F5'&&lang==='sql'){e.preventDefault();if(onRun)onRun();return;}
    if(e.key==='Tab'){e.preventDefault();const s=ta.selectionStart;ta.setRangeText('    ',s,ta.selectionEnd,'end');upd();return;}
    if(e.key==='Enter'){
      const s=ta.selectionStart;const ini=ta.value.lastIndexOf('\n',s-1)+1;const linha=ta.value.slice(ini,s);
      let ind=(linha.match(/^ */)||[''])[0];if(lang==='py'&&/:\s*$/.test(linha))ind+='    ';
      if(ind){e.preventDefault();ta.setRangeText('\n'+ind,s,ta.selectionEnd,'end');upd();}
    }
  });
  upd();
  return {ta,valor:()=>ta.value,definir:v=>{ta.value=v;upd();},inserir:t=>{const s=ta.selectionStart;ta.setRangeText(t,s,ta.selectionEnd,'end');ta.focus();upd();},atualizar:upd};
}
/* Tipos das colunas para o navegador de banco */
function tipoColuna(t,c){const v=DATA[t].map(r=>r[c]).find(x=>x!==null&&x!==undefined);if(typeof v==='number')return DATA[t].every(r=>r[c]==null||Number.isInteger(r[c]))?'INT':'DECIMAL';return 'TEXT';}
function dtypePandas(t,c){const tp=tipoColuna(t,c);return tp==='INT'?(DATA[t].some(r=>r[c]==null)?'float64':'int64'):tp==='DECIMAL'?'float64':'object';}

/* ============ GRADES DE RESULTADO ============ */
function celula(v){if(v===null||v===undefined||(typeof v==='number'&&isNaN(v)))return'<span class="nan">NULL</span>';if(typeof v==='number')return Number.isInteger(v)?String(v):(Math.round(v*10000)/10000).toString();if(typeof v==='boolean')return v?'true':'false';return escH(v);}
function celulaPd(v){if(v===null||v===undefined||(typeof v==='number'&&isNaN(v)))return'<span class="nan">NaN</span>';if(typeof v==='number')return Number.isInteger(v)?String(v):(Math.round(v*1e6)/1e6).toString();if(typeof v==='boolean')return v?'True':'False';return escH(v);}
function gradeSQL(df,ms){
  const max=200;const rows=df.rows.slice(0,max);
  const num=c=>df.rows.some(r=>typeof r[c]==='number');
  return `<div class="grid-wrap"><table class="grid"><thead><tr><th class="rn"></th>${df.cols.map(c=>`<th class="${num(c)?'n':''}"><span class="ct">${num(c)?'123':'abc'}</span>${escH(c)}</th>`).join('')}</tr></thead><tbody>${rows.map((r,i)=>`<tr><td class="rn">${i+1}</td>${df.cols.map(c=>`<td class="${typeof r[c]==='number'?'n':''}">${celula(r[c])}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
  <div class="grid-status"><span class="ok">✔</span> ${df.rows.length} linha${df.rows.length!==1?'s':''} retornada${df.rows.length!==1?'s':''}${ms!=null?` em ${ms} ms`:''}${df.rows.length>max?` (mostrando ${max})`:''}</div>`;
}
function tabelaPandas(v){
  if(v instanceof DF){
    const max=30,rows=v.rows,cut=rows.length>max;const show=cut?[...rows.slice(0,15).map((r,i)=>[v.index[i],r]),null,...rows.slice(-10).map((r,i)=>[v.index[rows.length-10+i],r])]:rows.map((r,i)=>[v.index[i],r]);
    return `<div class="pdwrap"><table class="pdtable"><thead><tr><th></th>${v.cols.map(c=>`<th>${escH(c)}</th>`).join('')}</tr></thead><tbody>${show.map(x=>x===null?`<tr><th>…</th>${v.cols.map(()=>'<td>…</td>').join('')}</tr>`:`<tr><th>${celulaPd(x[0])}</th>${v.cols.map(c=>`<td class="${typeof x[1][c]==='number'?'n':''}">${celulaPd(x[1][c])}</td>`).join('')}</tr>`).join('')}</tbody></table></div><p class="pdshape">${rows.length} rows × ${v.cols.length} columns</p>`;}
  if(v instanceof Series){
    const lines=v.index.map((k,i)=>[k,v.values[i]]);const cut=lines.length>30;const show=cut?[...lines.slice(0,15),null,...lines.slice(-10)]:lines;
    const w=Math.max(...v.index.map(k=>String(k).length),(v.indexName||'').length,1);
    const txt=(v.indexName?v.indexName+'\n':'')+show.map(x=>x===null?'...':String(x[0]).padEnd(w+4)+(typeof x[1]==='number'?(Number.isInteger(x[1])?String(x[1]):(Math.round(x[1]*1e6)/1e6).toString()):x[1]===null?'NaN':String(x[1]))).join('\n')+`\nName: ${v.name==null?'None':v.name}, Length: ${v.values.length}, dtype: ${v.values.every(x=>typeof x==='number'&&Number.isInteger(x))?'int64':v.values.every(x=>typeof x==='number'||x===null)?'float64':v.values.every(x=>typeof x==='boolean')?'bool':'object'}`;
    return `<pre class="pdseries">${escH(txt)}</pre>`;}
  if(v instanceof GroupBy)return `<pre class="pdseries">&lt;pandas.core.groupby.DataFrameGroupBy object&gt;\n<span class="dica"># Falta agregar: use .sum(), .mean(), .count()…</span></pre>`;
  if(v instanceof Bound)return `<pre class="pdseries">&lt;bound method ${escH(v.name)}&gt;\n<span class="dica"># Faltou abrir e fechar parênteses: ${escH(v.name)}()</span></pre>`;
  return `<pre class="pdseries">${escH(typeof v==='string'?`'${v}'`:strPy(v))}</pre>`;
}
function saidaNotebook(r){
  let h='';let txt='';
  const flush=()=>{if(txt){h+=`<pre class="stdout">${escH(txt)}</pre>`;txt='';}};
  (r.prints||[]).forEach(p=>{if(p&&p.txt!==undefined)txt+=p.txt;else{flush();h+=tabelaPandas(p);}});
  flush();
  const out=(r.hasResult&&!r.fromPrint)?tabelaPandas(r.result):'';
  return {stdout:h,out};
}

/* ============ AULAS (mentora e cursos) ============ */
function mdInline(s){return escH(s).replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>').replace(/\n/g,'<br>');}
let blocoSeq=0;
function blocoExec(lang,code,titulo){
  const id='bx'+(++blocoSeq);
  if(lang==='txt')return `<div class="ex"><div class="ex-h"><span>${titulo||'Exemplo'}</span></div><pre class="ex-txt">${escH(code)}</pre></div>`;
  return `<div class="ex ex-${lang}" data-ex="${id}"><div class="ex-h"><span>${titulo||(lang==='sql'?'SQL':'Python')}</span><button class="ex-run" data-run="${id}">▶ Executar</button></div>${editorHTML(id,lang,code).replace('class="ed"','class="ed mini"')}<div class="ex-out" id="${id}-out"></div></div>`;
}
function renderBlocos(blocos){
  return blocos.map(b=>{
    switch(b[0]){
      case 'p':return `<p>${mdInline(b[1])}</p>`;
      case 'tip':return `<div class="tip"><b>Dica</b> ${mdInline(b[1])}</div>`;
      case 'list':return `<ul class="aula-l">${b[1].map(x=>`<li>${mdInline(x)}</li>`).join('')}</ul>`;
      case 'code':return blocoExec(b[1],b[2]);
      case 'cmp':return `<div class="cmp"><div class="cmp-col">${blocoExec('sql',b[1],'Em SQL')}</div><div class="cmp-col">${blocoExec('py',b[2],'Em pandas')}</div>${b[3]?`<p class="cmp-leg">${mdInline(b[3])}</p>`:''}</div>`;
    }
    return '';}).join('');
}
function ligarBlocos(root,onRun){
  root.querySelectorAll('.ed.mini').forEach(ed=>{
    const id=ed.id;const box=root.querySelector(`[data-ex="${id}"]`);const lang=ed.dataset.lang;
    const api=editorLigar(ed,{onRun:()=>exec()});
    const exec=()=>{const out=document.getElementById(id+'-out');
      try{const t0=performance.now();
        if(lang==='sql'){const df=runSQL(api.valor());out.innerHTML=gradeSQL(df,Math.max(1,Math.round(performance.now()-t0)));}
        else{const r=runPython(api.valor());const s=saidaNotebook(r);out.innerHTML=s.stdout+s.out||'<pre class="stdout muted">(sem saída)</pre>';}
        if(onRun)onRun();}
      catch(err){out.innerHTML=`<pre class="ex-err">${escH(err.message||String(err))}</pre>`;}};
    box.querySelector('.ex-run').onclick=exec;
  });
}
