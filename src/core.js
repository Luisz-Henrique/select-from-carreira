/* ============ DADOS DA EMPRESA (gerados com semente fixa) ============ */
function mulberry(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const DATA=(function(){
  const R=mulberry(20260105);
  const pick=a=>a[Math.floor(R()*a.length)];
  const ri=(a,b)=>a+Math.floor(R()*(b-a+1));
  const PRODUTOS=[['Notebook','Eletrônicos',3500],['Monitor','Eletrônicos',1200],['Webcam','Eletrônicos',300],['Mouse','Acessórios',80],['Teclado','Acessórios',150],['Headset','Acessórios',250],['Cadeira','Móveis',900],['Mesa','Móveis',1100]];
  const ESTADOS={SP:'Sudeste',RJ:'Sudeste',MG:'Sudeste',PR:'Sul',RS:'Sul',BA:'Nordeste',PE:'Nordeste',GO:'Centro-Oeste',AM:'Norte'};
  const UF=['SP','SP','SP','RJ','RJ','MG','MG','PR','RS','BA','PE','GO','AM','SP','PR','BA','SP','RS','MG','GO'];
  const NOMES=['Padaria Pão Quente','Tech Mais','Escola Saber','Clínica Viva','Mercado Bom Preço','Studio Pixel','Advocacia Lima','Construtora Alicerce','Café da Esquina','Agência Lume','Loja do Zé','Hotel Mirante','Farmácia Saúde','Coworking Hub','Oficina Turbo','Pet Feliz','Livraria Página','Academia Força','Ótica Visão','Gráfica Cor'];
  const SEG=['Varejo','Atacado','Corporativo'];
  const clientes=NOMES.map((nome,i)=>({id:i+1,nome,estado:UF[i],segmento:pick(SEG),ativo:R()<0.75?1:0,mes_cadastro:ri(1,6)}));
  clientes[17].ativo=1;clientes[18].ativo=1;clientes[19].ativo=0;clientes[16].ativo=1;
  const VEND=['Ana','Bruno','Carla','Diego','Eva'];
  const CANAIS=['Loja','Loja','Site','Site','Site','App'];
  const vendas=[];
  for(let i=1;i<=60;i++){
    const p=pick(PRODUTOS);const cid=ri(1,16);const c=clientes[cid-1];
    const q=p[2]>=900?ri(1,3):ri(1,10);const mes=ri(1,6);const dia=ri(1,28);
    vendas.push({id:i,data_venda:`2026-0${mes}-${String(dia).padStart(2,'0')}`,mes,cliente_id:cid,regiao:ESTADOS[c.estado],produto:p[0],categoria:p[1],vendedor:pick(VEND),canal:pick(CANAIS),quantidade:q,valor:p[2]*q});
  }
  const CC=['Instagram','Google Ads','TikTok','E-mail','YouTube','Influencer'];
  const campanhas=[];let cid=1;
  for(const mes of [1,2])for(const canal of CC){
    const investimento=ri(20,150)*100;const cliques=ri(800,20000);
    const taxa=0.008+R()*0.05;const conversoes=Math.max(5,Math.round(cliques*taxa));
    campanhas.push({id:cid++,canal,mes,investimento,cliques,conversoes,receita:conversoes*ri(60,320)});
  }
  const TR=['RapidLog','TartaLog','VaiVoando'];
  const entregas=[];
  for(let i=1;i<=45;i++){
    const t=pick(TR);const prazo=pick([3,5,7]);
    let real=R()<0.1?null:Math.max(1,prazo+ri(-2,t==='TartaLog'?6:3));
    entregas.push({id:i,venda_id:i,transportadora:t,prazo_dias:prazo,dias_reais:real,situacao:real==null?'Em trânsito':(real>prazo?'Atrasado':'Entregue')});
  }
  return {vendas,clientes,campanhas,entregas};
})();
const SCHEMAS={
  vendas:{desc:'Cada linha é um pedido.',cols:{id:'número do pedido',data_venda:'data (texto AAAA-MM-DD)',mes:'mês (1 a 6)',cliente_id:'liga com clientes.id',regiao:'região do cliente',produto:'nome do produto',categoria:'Eletrônicos, Acessórios ou Móveis',vendedor:'quem vendeu',canal:'Loja, Site ou App',quantidade:'unidades',valor:'valor total em R$'}},
  clientes:{desc:'Cadastro de clientes (empresas).',cols:{id:'código do cliente',nome:'razão social',estado:'UF',segmento:'Varejo, Atacado ou Corporativo',ativo:'1 = ativo, 0 = cancelou',mes_cadastro:'mês em que entrou (1 a 6)'}},
  campanhas:{desc:'Campanhas de marketing por canal e mês.',cols:{id:'código',canal:'canal de mídia',mes:'mês',investimento:'R$ investidos',cliques:'cliques recebidos',conversoes:'vendas geradas',receita:'R$ gerados'}},
  entregas:{desc:'Entregas dos pedidos.',cols:{id:'código',venda_id:'liga com vendas.id',transportadora:'empresa de frete',prazo_dias:'prazo prometido',dias_reais:'dias que levou (vazio = em trânsito)',situacao:'Entregue, Atrasado ou Em trânsito'}}
};

/* ============ MINI-PANDAS (subconjunto do pandas que roda no navegador) ============ */
class PyErr extends Error{}
const perr=m=>new PyErr(m);
class DF{constructor(cols,rows,index){this.cols=cols;this.rows=rows;this.index=index||rows.map((_,i)=>i);}}
class Series{constructor(name,index,values,indexName,isDefault){this.name=name;this.index=index;this.values=values;this.indexName=indexName||null;this.isDefault=!!isDefault;}}
class GroupBy{constructor(df,keys,sel,asIndex){this.df=df;this.keys=keys;this.sel=sel;this.asIndex=asIndex!==false;}}
class Tuple{constructor(items){this.items=items;}}
class PyDict{constructor(entries){this.entries=entries;}get(k){const e=this.entries.find(x=>x[0]===k);return e?e[1]:undefined;}set(k,v){const e=this.entries.find(x=>x[0]===k);if(e)e[1]=v;else this.entries.push([k,v]);}}
class Bound{constructor(self,name){this.self=self;this.name=name;}}
class StrAcc{constructor(s){this.s=s;}}
class LocAcc{constructor(df){this.df=df;}}
const PD={__pd:true};const NP={__np:true};
class PyFunc{constructor(name,params,body,closure,isLambda){this.name=name;this.params=params;this.body=body;this.closure=closure;this.isLambda=isLambda;}}

function tokenize(src){
  src=src.replace(/\r\n?/g,'\n').replace(/\t/g,'    ');
  const toks=[];let i=0,depth=0,atStart=true;const stack=[0];
  while(i<src.length){
    if(atStart&&depth===0){
      let j=i,col=0;while(src[j]===' '){col++;j++;}
      if(j>=src.length||src[j]==='\n'||src[j]==='#'){while(j<src.length&&src[j]!=='\n')j++;i=j+1;continue;}
      if(col>stack[stack.length-1]){stack.push(col);toks.push({t:'indent'});}
      else{while(col<stack[stack.length-1]){stack.pop();toks.push({t:'dedent'});}if(col!==stack[stack.length-1])throw perr('IndentationError: o recuo desta linha não bate com as linhas anteriores.');}
      i=j;atStart=false;continue;
    }
    const c=src[i];
    if(c==='#'){while(i<src.length&&src[i]!=='\n')i++;continue;}
    if(c==='\n'){if(depth===0){toks.push({t:'nl'});atStart=true;}i++;continue;}
    if(c===';'){if(depth===0)toks.push({t:'nl'});i++;continue;}
    if(c===' '||c==='\r'){i++;continue;}
    if(c==='\\'&&src[i+1]==='\n'){i+=2;continue;}
    if(/[0-9]/.test(c)||(c==='.'&&/[0-9]/.test(src[i+1]||''))){let j=i;while(j<src.length&&/[0-9._]/.test(src[j]))j++;if(/[eE]/.test(src[j]||'')){j++;if(/[+-]/.test(src[j]))j++;while(/[0-9]/.test(src[j]||''))j++;}toks.push({t:'num',v:parseFloat(src.slice(i,j).replace(/_/g,''))});i=j;continue;}
    if(/[A-Za-z_\u00C0-\u00FF]/.test(c)){let j=i;while(j<src.length&&/[A-Za-z0-9_\u00C0-\u00FF]/.test(src[j]))j++;const w=src.slice(i,j);
      if(/^[fFrRbB]$/.test(w)&&(src[j]==='"'||src[j]==="'")){const r=readStr(src,j);i=r.end;if(w==='f'||w==='F')toks.push({t:'fstr',v:r.s});else toks.push({t:'str',v:r.s});continue;}
      toks.push({t:'name',v:w});i=j;continue;}
    if(c==='"'||c==="'"){const r=readStr(src,i);toks.push({t:'str',v:r.s});i=r.end;continue;}
    const two=src.slice(i,i+2);
    if(['==','!=','>=','<=','**','//','+=','-=','*=','/='].includes(two)){toks.push({t:'op',v:two});i+=2;continue;}
    if('([{'.includes(c)){depth++;toks.push({t:'op',v:c});i++;continue;}
    if(')]}'.includes(c)){depth=Math.max(0,depth-1);toks.push({t:'op',v:c});i++;continue;}
    if('+-*/<>=,.:&|~%'.includes(c)){toks.push({t:'op',v:c});i++;continue;}
    throw perr(`SyntaxError: caractere inesperado “${c}”`);
  }
  toks.push({t:'nl'});while(stack.length>1){stack.pop();toks.push({t:'dedent'});}
  toks.push({t:'eof'});return toks;
}
function readStr(src,i){
  const q=src[i];
  if(src.slice(i,i+3)===q.repeat(3)){const e=src.indexOf(q.repeat(3),i+3);if(e<0)throw perr('SyntaxError: texto com aspas triplas sem fechar');return {s:src.slice(i+3,e),end:e+3};}
  let j=i+1,s='';
  while(j<src.length&&src[j]!==q){if(src[j]==='\n')throw perr('SyntaxError: texto sem fechar aspas');if(src[j]==='\\'){const n=src[j+1];s+=n==='n'?'\n':n==='t'?'\t':n;j+=2;}else s+=src[j++];}
  if(j>=src.length)throw perr('SyntaxError: texto sem fechar aspas');
  return {s,end:j+1};
}
function parse(src){
  const T=tokenize(src);let p=0;
  const peek=(o=0)=>T[p+o];
  const isOp=(v,o=0)=>T[p+o].t==='op'&&T[p+o].v===v;
  const isName=(v,o=0)=>T[p+o].t==='name'&&T[p+o].v===v;
  const near=()=>T[p].t!=='eof'&&T[p].t!=='nl'&&T[p].v!==undefined?` perto de “${T[p].v}”`:'';
  const expect=v=>{if(!isOp(v))throw perr(`SyntaxError: esperava “${v}”`+near());p++;};
  const expectName=v=>{if(!isName(v))throw perr(`SyntaxError: esperava “${v}”`+near());p++;};
  const KW=['for','if','elif','else','while','def','return','break','continue','pass','in','not','and','or','is','lambda','import','from'];
  const prog=stmtsUntil(null);
  return prog;
  function stmtsUntil(end){
    const out=[];
    while(peek().t!=='eof'&&!(end&&peek().t===end)){
      if(peek().t==='nl'){p++;continue;}
      if(peek().t==='indent')throw perr('IndentationError: recuo inesperado. Só recue linhas dentro de for, if, def ou while.');
      out.push(stmt());
    }
    return out;
  }
  function block(){
    expect(':');
    if(peek().t!=='nl'){const s=simple();return [s];}
    while(peek().t==='nl')p++;
    if(peek().t!=='indent')throw perr('IndentationError: depois de “:” a próxima linha precisa estar recuada (4 espaços).');
    p++;const b=stmtsUntil('dedent');if(peek().t==='dedent')p++;return b;
  }
  function stmt(){
    if(isName('import')||isName('from')){while(peek().t!=='nl'&&peek().t!=='eof')p++;return {k:'pass'};}
    if(isName('for')){p++;const names=[];do{if(isOp(','))p++;if(isOp('(')){p++;}if(peek().t!=='name')throw perr('SyntaxError: esperava o nome da variável do for');names.push(T[p++].v);if(isOp(')'))p++;}while(isOp(','));
      expectName('in');const it=expr();const body=block();return {k:'for',names,it,body};}
    if(isName('while')){p++;const cond=expr();const body=block();return {k:'while',cond,body};}
    if(isName('if')){p++;const branches=[];const cond=expr();branches.push([cond,block()]);let els=null;
      for(;;){while(peek().t==='nl'&&(isName('elif',1)||isName('else',1)))p++;
        if(isName('elif')){p++;const c=expr();branches.push([c,block()]);continue;}
        if(isName('else')){p++;els=block();}break;}
      return {k:'if',branches,els};}
    if(isName('def')){p++;if(peek().t!=='name')throw perr('SyntaxError: esperava o nome da função');const name=T[p++].v;expect('(');const params=[];
      while(!isOp(')')){if(peek().t!=='name')throw perr('SyntaxError: parâmetro inválido');const pn=T[p++].v;let def;if(isOp('=')){p++;def=expr();}params.push({n:pn,def});if(isOp(','))p++;else break;}
      expect(')');const body=block();return {k:'def',name,params,body};}
    return simple();
  }
  function simple(){
    if(isName('return')){p++;const e=(peek().t==='nl'||peek().t==='eof'||peek().t==='dedent')?null:exprList();return {k:'return',e};}
    if(isName('break')){p++;return {k:'break'};}
    if(isName('continue')){p++;return {k:'continue'};}
    if(isName('pass')){p++;return {k:'pass'};}
    const e=exprList();
    let s;
    if(isOp('=')){p++;const v=exprList();s={k:'assign',target:e,value:v};}
    else if(peek().t==='op'&&['+=','-=','*=','/='].includes(peek().v)){const op=T[p++].v[0];const v=expr();s={k:'assign',target:e,value:{k:'bin',op,a:e,b:v}};}
    else s={k:'expr',e};
    if(peek().t!=='nl'&&peek().t!=='eof'&&peek().t!=='dedent')throw perr(`SyntaxError: sobrou “${peek().v}” no fim da linha`);
    return s;
  }
  function exprList(){const e=expr();if(isOp(',')&&!isOp('=',1)){const items=[e];while(isOp(',')){p++;if(peek().t==='nl'||isOp('='))break;items.push(expr());}return {k:'tuple',items};}return e;}
  function expr(){
    if(isName('lambda')){p++;const params=[];while(!isOp(':')){if(peek().t!=='name')throw perr('SyntaxError: lambda inválida');params.push({n:T[p++].v});if(isOp(','))p++;}p++;const body=expr();return {k:'lambda',params,body};}
    const a=orE();
    if(isName('if')&&!isOp(':',1)){const save=p;p++;const cond=orE();if(isName('else')){p++;const b=expr();return {k:'ternary',cond,a,b};}p=save;}
    return a;}
  function orE(){let a=andE();while(isName('or')){p++;a={k:'bool',op:'or',a,b:andE()};}return a;}
  function andE(){let a=notE();while(isName('and')){p++;a={k:'bool',op:'and',a,b:notE()};}return a;}
  function notE(){if(isName('not')){p++;return{k:'un',op:'not',a:notE()};}return cmp();}
  function cmp(){let a=bor();
    for(;;){
      if(peek().t==='op'&&['==','!=','>','<','>=','<='].includes(peek().v)){const op=peek().v;p++;a={k:'bin',op,a,b:bor()};continue;}
      if(isName('in')){p++;a={k:'bin',op:'in',a,b:bor()};continue;}
      if(isName('not')&&isName('in',1)){p+=2;a={k:'un',op:'not',a:{k:'bin',op:'in',a,b:bor()}};continue;}
      if(isName('is')){p++;let neg=false;if(isName('not')){p++;neg=true;}const b=bor();a={k:'bin',op:neg?'isnot':'is',a,b};continue;}
      break;}
    return a;}
  function bor(){let a=band();while(isOp('|')){p++;a={k:'bin',op:'|',a,b:band()};}return a;}
  function band(){let a=add();while(isOp('&')){p++;a={k:'bin',op:'&',a,b:add()};}return a;}
  function add(){let a=mul();while(isOp('+')||isOp('-')){const op=peek().v;p++;a={k:'bin',op,a,b:mul()};}return a;}
  function mul(){let a=un();while(isOp('*')||isOp('/')||isOp('//')||isOp('%')){const op=peek().v;p++;a={k:'bin',op,a,b:un()};}return a;}
  function un(){if(isOp('-')||isOp('~')||isOp('+')){const op=peek().v;p++;return{k:'un',op,a:un()};}return pow();}
  function pow(){let a=post();if(isOp('**')){p++;return{k:'bin',op:'**',a,b:un()};}return a;}
  function post(){let a=prim();
    for(;;){
      if(isOp('[')){p++;
        if(isOp(':')||(peek(1).t==='op'&&peek(1).v===':')){let s=null,e=null;if(!isOp(':'))s=expr();expect(':');if(!isOp(']'))e=expr();expect(']');a={k:'slice',obj:a,s,e};continue;}
        const items=[expr()];while(isOp(',')){p++;if(isOp(']'))break;items.push(expr());}expect(']');
        a={k:'idx',obj:a,key:items.length===1?items[0]:{k:'tuple',items}};}
      else if(isOp('.')){p++;if(peek().t!=='name')throw perr('SyntaxError: esperava um nome depois do ponto');a={k:'attr',obj:a,name:T[p++].v};}
      else if(isOp('(')){p++;const args=[],kwargs={};
        while(!isOp(')')){
          if(peek().t==='name'&&peek(1).t==='op'&&peek(1).v==='='){const n=T[p].v;p+=2;kwargs[n]=expr();}
          else args.push(expr());
          if(isOp(','))p++;else break;}
        expect(')');a={k:'call',fn:a,args,kwargs};}
      else break;}
    return a;}
  function prim(){const t=peek();
    if(t.t==='num'){p++;return{k:'lit',v:t.v};}
    if(t.t==='str'||t.t==='fstr'){
      const parts=[];
      while(peek().t==='str'||peek().t==='fstr'){const tk=T[p++];if(tk.t==='str')parts.push({lit:tk.v});else parts.push(...parseF(tk.v));}
      if(parts.every(x=>x.lit!==undefined))return {k:'lit',v:parts.map(x=>x.lit).join('')};
      return {k:'fstr',parts};}
    if(t.t==='name'){
      if(t.v==='True'){p++;return{k:'lit',v:true};}if(t.v==='False'){p++;return{k:'lit',v:false};}if(t.v==='None'){p++;return{k:'lit',v:null};}
      if(KW.includes(t.v))throw perr(`SyntaxError: “${t.v}” não pode aparecer aqui`);
      p++;return{k:'name',v:t.v};}
    if(isOp('(')){p++;if(isOp(')')){p++;return{k:'tuple',items:[]};}const e=expr();if(isOp(',')){const items=[e];while(isOp(',')){p++;if(isOp(')'))break;items.push(expr());}expect(')');return{k:'tuple',items};}expect(')');return e;}
    if(isOp('[')){p++;const items=[];
      if(!isOp(']')){const first=expr();
        if(isName('for')){p++;const names=[];do{if(isOp(','))p++;names.push(T[p++].v);}while(isOp(','));expectName('in');const it=orE();let cond=null;if(isName('if')){p++;cond=orE();}expect(']');return {k:'listcomp',elt:first,names,it,cond};}
        items.push(first);if(isOp(','))p++;
        while(!isOp(']')){items.push(expr());if(isOp(','))p++;else break;}}
      expect(']');return{k:'list',items};}
    if(isOp('{')){p++;const pairs=[];while(!isOp('}')){const k=expr();expect(':');pairs.push([k,expr()]);if(isOp(','))p++;else break;}expect('}');return{k:'dict',pairs};}
    if(t.t==='nl'||t.t==='eof')throw perr('SyntaxError: a linha terminou antes da hora (falta fechar algo?)');
    if(t.t==='indent'||t.t==='dedent')throw perr('IndentationError: confira o recuo das linhas.');
    throw perr(`SyntaxError: não esperava “${t.v}” aqui`);}
  function parseF(s){
    const parts=[];let i=0,lit='';
    while(i<s.length){
      if(s[i]==='{'&&s[i+1]==='{'){lit+='{';i+=2;continue;}
      if(s[i]==='}'&&s[i+1]==='}'){lit+='}';i+=2;continue;}
      if(s[i]==='{'){let j=i+1,d=0,q=null;while(j<s.length){const c=s[j];if(q){if(c===q)q=null;}else if(c==='"'||c==="'")q=c;else if('([{'.includes(c))d++;else if(')]}'.includes(c)){if(c==='}'&&d===0)break;d--;}j++;}
        if(j>=s.length)throw perr('SyntaxError: f-string com { sem fechar }');
        let inner=s.slice(i+1,j),fmt='';
        let dd=0,qq=null;for(let k=0;k<inner.length;k++){const c=inner[k];if(qq){if(c===qq)qq=null;continue;}if(c==='"'||c==="'"){qq=c;continue;}if('([{'.includes(c))dd++;else if(')]}'.includes(c))dd--;else if(c===':'&&dd===0){fmt=inner.slice(k+1);inner=inner.slice(0,k);break;}}
        if(lit){parts.push({lit});lit='';}
        const sub=parse(inner);if(sub.length!==1||sub[0].k!=='expr')throw perr('SyntaxError: expressão inválida dentro da f-string');
        parts.push({e:sub[0].e,fmt});i=j+1;continue;}
      lit+=s[i++];}
    if(lit)parts.push({lit});return parts;}
}
const isNum=v=>typeof v==='number'&&isFinite(v);
const isNull=v=>v===null||v===undefined||(typeof v==='number'&&isNaN(v));
function cmpVals(a,b){if(isNull(a))return isNull(b)?0:1;if(isNull(b))return -1;if(typeof a==='number'&&typeof b==='number')return a-b;return String(a).localeCompare(String(b),'pt-BR');}
const nums=vs=>vs.filter(v=>typeof v==='number'&&!isNaN(v)||typeof v==='boolean').map(Number);
function aggFn(f,vs){
  const n=nums(vs);
  switch(f){
    case 'sum':return n.reduce((a,b)=>a+b,0);
    case 'mean':return n.length?n.reduce((a,b)=>a+b,0)/n.length:null;
    case 'count':return vs.filter(v=>!isNull(v)).length;
    case 'size':return vs.length;
    case 'max':{const c=vs.filter(v=>!isNull(v));return c.length?c.reduce((a,b)=>cmpVals(a,b)>=0?a:b):null;}
    case 'min':{const c=vs.filter(v=>!isNull(v));return c.length?c.reduce((a,b)=>cmpVals(a,b)<=0?a:b):null;}
    case 'median':{if(!n.length)return null;const s=[...n].sort((a,b)=>a-b);const m=Math.floor(s.length/2);return s.length%2?s[m]:(s[m-1]+s[m])/2;}
    case 'std':{if(n.length<2)return null;const m=n.reduce((a,b)=>a+b,0)/n.length;return Math.sqrt(n.reduce((a,b)=>a+(b-m)**2,0)/(n.length-1));}
    case 'nunique':return new Set(vs.filter(v=>!isNull(v))).size;
    case 'first':return vs[0];
    case 'last':return vs[vs.length-1];
  }
  throw perr(`Função de agregação “${f}” não suportada no simulador. Use sum, mean, count, max, min, median, std ou nunique.`);
}
function colErr(df,c){return perr(`KeyError: a coluna “${c}” não existe. Colunas disponíveis: ${df.cols.join(', ')}`);}
function getCol(df,c){if(!df.cols.includes(c))throw colErr(df,c);return new Series(c,df.index.slice(),df.rows.map(r=>r[c]),null,true);}
function toList(v){if(Array.isArray(v))return v;if(v instanceof Tuple)return v.items;if(v instanceof Series)return v.values;return [v];}
function kw(args,kwargs,i,name,def){if(name in kwargs)return kwargs[name];if(args.length>i)return args[i];return def;}
function typeName(v){if(v instanceof DF)return'DataFrame';if(v instanceof Series)return'Series';if(v instanceof GroupBy)return'DataFrameGroupBy';if(v===null)return'None';if(Array.isArray(v))return'list';return typeof v==='number'?'number':typeof v==='string'?'str':typeof v==='boolean'?'bool':'objeto';}

function getItem(o,key){
  if(o instanceof DF){
    if(typeof key==='string')return getCol(o,key);
    if(Array.isArray(key)){key.forEach(c=>{if(!o.cols.includes(c))throw colErr(o,c);});return new DF(key.slice(),o.rows.map(r=>{const n={};key.forEach(c=>n[c]=r[c]);return n;}),o.index.slice());}
    if(key instanceof Series){
      if(key.values.length!==o.rows.length)throw perr('O filtro tem tamanho diferente da tabela. Filtre usando colunas da própria tabela.');
      if(key.values.some(v=>typeof v!=='boolean'))throw perr('O filtro precisa ser verdadeiro/falso, como df[df["coluna"] > 10].');
      const rows=[],idx=[];key.values.forEach((b,i)=>{if(b){rows.push(o.rows[i]);idx.push(o.index[i]);}});return new DF(o.cols.slice(),rows,idx);}
    throw perr(`Não sei indexar uma tabela com ${typeName(key)}.`);
  }
  if(o instanceof Series){
    if(key instanceof Series){if(key.values.length!==o.values.length)throw perr('Filtro com tamanho diferente.');const idx=[],vals=[];key.values.forEach((b,i)=>{if(b){idx.push(o.index[i]);vals.push(o.values[i]);}});return new Series(o.name,idx,vals,o.indexName,o.isDefault);}
    const i=o.index.indexOf(key);if(i<0)throw perr(`KeyError: “${key}” não está no índice.`);return o.values[i];
  }
  if(o instanceof GroupBy){if(typeof key==='string'){if(!o.df.cols.includes(key))throw colErr(o.df,key);}else if(Array.isArray(key))key.forEach(c=>{if(!o.df.cols.includes(c))throw colErr(o.df,c);});return new GroupBy(o.df,o.keys,key,o.asIndex);}
  if(o instanceof LocAcc){
    let mask=key,cols=null;if(key instanceof Tuple){mask=key.items[0];cols=key.items[1];}
    let r=o.df;if(mask instanceof Series)r=getItem(r,mask);
    if(cols!=null)r=getItem(r,cols);return r;}
  if(o instanceof PyDict){const v=o.get(key);if(v===undefined)throw perr(`KeyError: ${key}`);return v;}
  if(Array.isArray(o)){if(typeof key!=='number')throw perr('Listas usam índice numérico.');const v=o[key<0?o.length+key:key];if(v===undefined)throw perr('IndexError: posição fora da lista.');return v;}
  if(o instanceof Tuple)return o.items[key<0?o.items.length+key:key];
  if(typeof o==='string'){if(typeof key!=='number')throw perr('Texto usa índice numérico.');const c=o[key<0?o.length+key:key];if(c===undefined)throw perr('IndexError: posição fora do texto.');return c;}
  throw perr(`TypeError: ${typeName(o)} não aceita colchetes.`);
}
const DF_METHODS=['head','tail','sort_values','groupby','merge','drop_duplicates','dropna','fillna','isnull','isna','notnull','sum','mean','count','max','min','median','nunique','rename','reset_index','copy','drop','pivot_table','describe','info','plot','query','apply','to_csv'];
const S_METHODS=['sum','mean','count','max','min','median','std','nunique','unique','value_counts','sort_values','sort_index','head','tail','round','isin','isnull','isna','notnull','notna','idxmax','idxmin','reset_index','abs','cumsum','fillna','astype','between','tolist','to_frame','nlargest','nsmallest','plot','apply','map','describe'];
const G_METHODS=['sum','mean','count','max','min','median','std','nunique','size','agg','aggregate','first','last'];
function getAttr(o,n){
  if(o===PD){if(['merge','pivot_table','DataFrame','concat','read_csv','to_datetime'].includes(n))return new Bound(PD,n);throw perr(`AttributeError: pd.${n} não existe no simulador.`);}
  if(o instanceof DF){
    if(n==='shape')return new Tuple([o.rows.length,o.cols.length]);
    if(n==='columns')return o.cols.slice();
    if(n==='index')return o.index.slice();
    if(n==='loc')return new LocAcc(o);
    if(n==='iloc')throw perr('iloc não é suportado no simulador. Use head(n) ou filtros.');
    if(n==='dtypes'){return new Series(null,o.cols.slice(),o.cols.map(c=>{const v=o.rows.find(r=>!isNull(r[c]));return v==null?'object':typeof v[c]==='number'?(Number.isInteger(v[c])?'int64':'float64'):'object';}));}
    if(DF_METHODS.includes(n))return new Bound(o,n);
    if(o.cols.includes(n))return getCol(o,n);
    throw perr(`AttributeError: DataFrame não tem “${n}”. Se era uma coluna, as colunas são: ${o.cols.join(', ')}`);}
  if(o instanceof Series){
    if(n==='str')return new StrAcc(o);
    if(n==='values')return o.values.slice();
    if(n==='index')return o.index.slice();
    if(n==='name')return o.name;
    if(n==='shape')return new Tuple([o.values.length]);
    if(S_METHODS.includes(n))return new Bound(o,n);
    throw perr(`AttributeError: Series não tem “${n}”.`);}
  if(o instanceof GroupBy){if(G_METHODS.includes(n))return new Bound(o,n);if(o.df.cols.includes(n))return new GroupBy(o.df,o.keys,n,o.asIndex);throw perr(`AttributeError: groupby não tem “${n}”. Depois do groupby use sum(), mean(), count(), size() ou agg().`);}
  if(o instanceof StrAcc){if(['contains','upper','lower','strip','startswith','endswith','len','replace'].includes(n))return new Bound(o,n);throw perr(`.str.${n} não é suportado.`);}
  if(o===NP){if(n==='nan')return null;if(['where','round','mean','sum','max','min','abs','sqrt'].includes(n))return new Bound(NP,n);throw perr(`AttributeError: np.${n} não existe no simulador.`);}
  if(Array.isArray(o)&&['append','count','index','pop','extend','sort','reverse','insert','copy','remove'].includes(n))return new Bound(o,n);
  if(typeof o==='string'&&['upper','lower','strip','replace','startswith','endswith','split','join','title','capitalize','count','find','zfill','isdigit','lstrip','rstrip'].includes(n))return new Bound(o,n);
  if(o instanceof PyDict&&['get','keys','values','items','update','pop','copy'].includes(n))return new Bound(o,n);
  throw perr(`AttributeError: ${typeName(o)} não tem “${n}”.`);
}
function elementwise(a,b,f){
  if(a instanceof Series&&b instanceof Series){
    if(a.values.length===b.values.length&&a.index.every((x,i)=>x===b.index[i]))return new Series(a.name,a.index.slice(),a.values.map((v,i)=>f(v,b.values[i])),a.indexName,a.isDefault);
    const idx=[...new Set([...a.index,...b.index])];
    return new Series(a.name,idx,idx.map(k=>{const i=a.index.indexOf(k),j=b.index.indexOf(k);return f(i<0?null:a.values[i],j<0?null:b.values[j]);}),a.indexName||b.indexName,false);}
  if(a instanceof Series)return new Series(a.name,a.index.slice(),a.values.map(v=>f(v,b)),a.indexName,a.isDefault);
  if(b instanceof Series)return new Series(b.name,b.index.slice(),b.values.map(v=>f(a,v)),b.indexName,b.isDefault);
  return f(a,b);
}
function arith(op,x,y){
  if(isNull(x)||isNull(y))return null;
  if(op==='+'){if(typeof x==='string'||typeof y==='string'){if(typeof x!==typeof y)throw perr('TypeError: não dá para somar texto com número. Use str(numero).');return x+y;}return x+y;}
  if(typeof x==='string'||typeof y==='string')throw perr(`TypeError: operação “${op}” com texto.`);
  switch(op){case '-':return x-y;case '*':return x*y;case '/':if(y===0)return x===0?null:Infinity;return x/y;case '//':return Math.floor(x/y);case '%':return x%y;case '**':return x**y;}
}
function compare(op,x,y){
  if(op==='=='){if(isNull(x)||isNull(y))return false;return x===y||(typeof x!=='string'&&typeof y!=='string'&&Number(x)===Number(y));}
  if(op==='!=')return !compare('==',x,y);
  if(isNull(x)||isNull(y))return false;
  if((typeof x==='string')!==(typeof y==='string'))throw perr(`TypeError: comparando texto com número (${JSON.stringify(x)} ${op} ${JSON.stringify(y)}).`);
  switch(op){case '>':return x>y;case '<':return x<y;case '>=':return x>=y;case '<=':return x<=y;}
}
function binop(op,a,b){
  if(a instanceof DF||b instanceof DF)throw perr('Operações matemáticas direto em DataFrame não são suportadas. Selecione uma coluna: df["coluna"].');
  if(op==='&'||op==='|'){
    const chk=v=>{if(v instanceof Series&&v.values.some(x=>typeof x!=='boolean'))throw perr('Para combinar condições, coloque cada uma entre parênteses: (df["a"] > 1) & (df["b"] == "X")');};
    chk(a);chk(b);return elementwise(a,b,(x,y)=>op==='&'?(!!x&&!!y):(!!x||!!y));}
  if(op==='in'){if(typeof b==='string')return b.includes(a);if(b instanceof PyDict)return b.entries.some(e=>e[0]===a);if(b instanceof Series)return b.index.includes(a);const l=toList(b);return l.some(x=>x===a);}
  if(op==='is')return a===b||(isNull(a)&&isNull(b));
  if(op==='isnot')return !(a===b||(isNull(a)&&isNull(b)));
  if(op==='*'&&typeof a==='string'&&typeof b==='number')return a.repeat(Math.max(0,b));
  if(op==='*'&&Array.isArray(a)&&typeof b==='number'){let r=[];for(let i=0;i<b;i++)r=r.concat(a);return r;}
  if(op==='%'&&typeof a==='string')throw perr('Formatação com % não é suportada. Use f-strings: f"Total: {valor}"');
  if(['==','!=','>','<','>=','<='].includes(op))return elementwise(a,b,(x,y)=>compare(op,x,y));
  if(Array.isArray(a)&&Array.isArray(b)&&op==='+')return a.concat(b);
  return elementwise(a,b,(x,y)=>arith(op,x,y));
}
function buildGroups(gb){
  const keys=toList(gb.keys);keys.forEach(k=>{if(!gb.df.cols.includes(k))throw colErr(gb.df,k);});
  const m=new Map();
  gb.df.rows.forEach(r=>{const kv=keys.map(k=>r[k]);if(kv.some(isNull))return;const id=JSON.stringify(kv);if(!m.has(id))m.set(id,{key:kv,rows:[]});m.get(id).rows.push(r);});
  const g=[...m.values()];
  g.sort((a,b)=>{for(let i=0;i<a.key.length;i++){const c=cmpVals(a.key[i],b.key[i]);if(c)return c;}return 0;});
  return {keys,groups:g};
}
function numericCols(df,exclude){return df.cols.filter(c=>!exclude.includes(c)&&df.rows.some(r=>typeof r[c]==='number')&&df.rows.every(r=>isNull(r[c])||typeof r[c]==='number'));}
function gbAgg(gb,f){
  const {keys,groups}=buildGroups(gb);
  if(f==='size'){
    if(keys.length===1&&gb.asIndex)return new Series('size',groups.map(g=>g.key[0]),groups.map(g=>g.rows.length),keys[0]);
    return new DF([...keys,'size'],groups.map(g=>{const o={};keys.forEach((k,i)=>o[k]=g.key[i]);o.size=g.rows.length;return o;}));}
  if(typeof gb.sel==='string'){
    const vals=groups.map(g=>aggFn(f,g.rows.map(r=>r[gb.sel])));
    if(keys.length===1&&gb.asIndex)return new Series(gb.sel,groups.map(g=>g.key[0]),vals,keys[0]);
    return new DF([...keys,gb.sel],groups.map((g,i)=>{const o={};keys.forEach((k,j)=>o[k]=g.key[j]);o[gb.sel]=vals[i];return o;}));}
  const cols=Array.isArray(gb.sel)?gb.sel:(['sum','mean','median','std'].includes(f)?numericCols(gb.df,keys):gb.df.cols.filter(c=>!keys.includes(c)));
  return new DF([...keys,...cols],groups.map(g=>{const o={};keys.forEach((k,j)=>o[k]=g.key[j]);cols.forEach(c=>o[c]=aggFn(f,g.rows.map(r=>r[c])));return o;}));
}
function gbAggSpec(gb,args,kwargs){
  const {keys,groups}=buildGroups(gb);
  const mk=(specs)=>new DF([...keys,...specs.map(s=>s[0])],groups.map(g=>{const o={};keys.forEach((k,j)=>o[k]=g.key[j]);specs.forEach(([name,col,f])=>o[name]=aggFn(f,g.rows.map(r=>r[col])));return o;}));
  if(Object.keys(kwargs).length){
    const specs=Object.entries(kwargs).map(([name,v])=>{if(!(v instanceof Tuple)||v.items.length!==2)throw perr('Agregação nomeada usa tuplas: total=("coluna", "sum")');if(!gb.df.cols.includes(v.items[0]))throw colErr(gb.df,v.items[0]);return [name,v.items[0],v.items[1]];});
    return mk(specs);}
  const a=args[0];
  if(typeof a==='string')return gbAgg(gb,a);
  if(Array.isArray(a)){if(typeof gb.sel!=='string')throw perr('Lista de funções no agg: selecione uma coluna antes, ex.: df.groupby("x")["valor"].agg(["sum","mean"])');return mk(a.map(f=>[f,gb.sel,f]));}
  if(a instanceof PyDict){return mk(a.entries.map(([c,f])=>[c,c,f]));}
  throw perr('agg() não entendeu os argumentos.');
}
function sortDF(df,by,asc){
  by=toList(by);by.forEach(c=>{if(!df.cols.includes(c))throw colErr(df,c);});
  const ascs=Array.isArray(asc)?asc:by.map(()=>asc!==false);
  const ord=df.rows.map((r,i)=>i);
  ord.sort((i,j)=>{for(let k=0;k<by.length;k++){const a=df.rows[i][by[k]],b=df.rows[j][by[k]];if(isNull(a)&&isNull(b))continue;if(isNull(a))return 1;if(isNull(b))return -1;let c=cmpVals(a,b);if(c)return ascs[k]?c:-c;}return i-j;});
  return new DF(df.cols.slice(),ord.map(i=>df.rows[i]),ord.map(i=>df.index[i]));
}
function merge(l,r,args,kwargs){
  if(!(l instanceof DF)||!(r instanceof DF))throw perr('merge precisa de duas tabelas.');
  const how=kw([],kwargs,0,'how','inner');
  let on=kwargs.on,lo=kwargs.left_on,ro=kwargs.right_on;
  if(on===undefined&&lo===undefined){const common=l.cols.filter(c=>r.cols.includes(c));if(!common.length)throw perr('As tabelas não têm coluna em comum. Use left_on= e right_on=.');on=common;}
  let lk,rk;if(on!==undefined){lk=toList(on);rk=lk;}else{lk=toList(lo);rk=toList(ro);}
  lk.forEach(c=>{if(!l.cols.includes(c))throw colErr(l,c);});rk.forEach(c=>{if(!r.cols.includes(c))throw colErr(r,c);});
  const sameKeys=on!==undefined;
  const rCols=r.cols.filter(c=>!(sameKeys&&rk.includes(c)));
  const lName={},rName={};
  l.cols.forEach(c=>lName[c]=(rCols.includes(c)&&!(sameKeys&&lk.includes(c)))?c+'_x':c);
  rCols.forEach(c=>rName[c]=l.cols.includes(c)?c+'_y':c);
  const cols=[...l.cols.map(c=>lName[c]),...rCols.map(c=>rName[c])];
  const idx=new Map();r.rows.forEach(row=>{const k=JSON.stringify(rk.map(c=>row[c]));if(!idx.has(k))idx.set(k,[]);idx.get(k).push(row);});
  const out=[];
  if(!['inner','left'].includes(how))throw perr('No simulador, merge aceita how="inner" ou how="left".');
  l.rows.forEach(row=>{const k=JSON.stringify(lk.map(c=>row[c]));const ms=idx.get(k);
    if(ms)ms.forEach(m=>{const o={};l.cols.forEach(c=>o[lName[c]]=row[c]);rCols.forEach(c=>o[rName[c]]=m[c]);out.push(o);});
    else if(how==='left'){const o={};l.cols.forEach(c=>o[lName[c]]=row[c]);rCols.forEach(c=>o[rName[c]]=null);out.push(o);}});
  return new DF(cols,out);
}
function pivot(df,args,kwargs){
  const index=kwargs.index,columns=kwargs.columns,values=kwargs.values,f=kwargs.aggfunc||'mean',fill=kwargs.fill_value;
  if(!index||!columns||!values)throw perr('pivot_table precisa de index=, columns= e values=.');
  [index,columns,values].forEach(c=>{if(!df.cols.includes(c))throw colErr(df,c);});
  const rowsK=[...new Set(df.rows.map(r=>r[index]))].sort(cmpVals),colsK=[...new Set(df.rows.map(r=>r[columns]))].sort(cmpVals);
  const out=rowsK.map(rk=>{const o={[index]:rk};colsK.forEach(ck=>{const vs=df.rows.filter(r=>r[index]===rk&&r[columns]===ck).map(r=>r[values]);o[ck]=vs.length?aggFn(f,vs):(fill!==undefined?fill:null);});return o;});
  return new DF([index,...colsK.map(String)],out.map(o=>{const n={};n[index]=o[index];colsK.forEach(c=>n[String(c)]=o[c]);return n;}));
}
function seriesOf(name,index,values,indexName){return new Series(name,index,values,indexName,false);}
function callBound(b,args,kwargs,ctx){
  const s=b.self,n=b.name;
  if(s===PD){
    if(n==='merge')return merge(args[0],args[1],args,kwargs);
    if(n==='pivot_table'){const d=args[0]||kwargs.data;return pivot(d,args,kwargs);}
    throw perr(`pd.${n} não está disponível no simulador: as tabelas já estão carregadas (vendas, clientes, campanhas, entregas).`);}
  if(s instanceof DF){
    switch(n){
      case 'head':{const k=kw(args,kwargs,0,'n',5);return new DF(s.cols.slice(),s.rows.slice(0,k),s.index.slice(0,k));}
      case 'tail':{const k=kw(args,kwargs,0,'n',5);return new DF(s.cols.slice(),s.rows.slice(-k),s.index.slice(-k));}
      case 'sort_values':return sortDF(s,kw(args,kwargs,0,'by'),kw(args,kwargs,1,'ascending',true));
      case 'groupby':{const by=kw(args,kwargs,0,'by');if(by===undefined)throw perr('groupby precisa da coluna: df.groupby("coluna")');return new GroupBy(s,by,null,kwargs.as_index);}
      case 'merge':return merge(s,args[0],args,kwargs);
      case 'pivot_table':return pivot(s,args,kwargs);
      case 'drop_duplicates':{const sub=toList(kw(args,kwargs,0,'subset',s.cols));const seen=new Set();const rows=[],idx=[];s.rows.forEach((r,i)=>{const k=JSON.stringify(sub.map(c=>r[c]));if(!seen.has(k)){seen.add(k);rows.push(r);idx.push(s.index[i]);}});return new DF(s.cols.slice(),rows,idx);}
      case 'dropna':{const sub=toList(kw(args,kwargs,99,'subset',s.cols));const rows=[],idx=[];s.rows.forEach((r,i)=>{if(sub.every(c=>!isNull(r[c]))){rows.push(r);idx.push(s.index[i]);}});return new DF(s.cols.slice(),rows,idx);}
      case 'fillna':{const v=kw(args,kwargs,0,'value');return new DF(s.cols.slice(),s.rows.map(r=>{const o={};s.cols.forEach(c=>o[c]=isNull(r[c])?v:r[c]);return o;}),s.index.slice());}
      case 'isnull':case 'isna':case 'notnull':return new DF(s.cols.slice(),s.rows.map(r=>{const o={};s.cols.forEach(c=>o[c]=n==='notnull'?!isNull(r[c]):isNull(r[c]));return o;}),s.index.slice());
      case 'sum':case 'mean':case 'max':case 'min':case 'median':{const cols=n==='sum'&&s.rows.every(r=>s.cols.every(c=>typeof r[c]==='boolean'))?s.cols:numericCols(s,[]);return seriesOf(null,cols,cols.map(c=>aggFn(n,s.rows.map(r=>r[c]))));}
      case 'count':case 'nunique':return seriesOf(null,s.cols.slice(),s.cols.map(c=>aggFn(n,s.rows.map(r=>r[c]))));
      case 'rename':{const m=kwargs.columns;if(!(m instanceof PyDict))throw perr('Use rename(columns={"antigo": "novo"})');const nm=c=>m.get(c)!==undefined?m.get(c):c;return new DF(s.cols.map(nm),s.rows.map(r=>{const o={};s.cols.forEach(c=>o[nm(c)]=r[c]);return o;}),s.index.slice());}
      case 'reset_index':return new DF(s.cols.slice(),s.rows.slice());
      case 'copy':return new DF(s.cols.slice(),s.rows.map(r=>({...r})),s.index.slice());
      case 'drop':{const cs=toList(kwargs.columns||args[0]);cs.forEach(c=>{if(!s.cols.includes(c))throw colErr(s,c);});const keep=s.cols.filter(c=>!cs.includes(c));return getItem(s,keep);}
      case 'info':case 'describe':throw perr(`${n}() ainda não está no simulador. Tente head(), shape ou isnull().sum().`);
      case 'plot':throw perr('Gráficos ficam para o Power BI da firma 😉 Aqui, entregue a tabela.');
      default:throw perr(`${n}() não é suportado no simulador.`);}
  }
  if(s instanceof Series){
    switch(n){
      case 'sum':case 'mean':case 'count':case 'max':case 'min':case 'median':case 'std':case 'nunique':return aggFn(n,s.values);
      case 'unique':return [...new Set(s.values)];
      case 'tolist':return s.values.slice();
      case 'nlargest':case 'nsmallest':{const k=kw(args,kwargs,0,'n',5);const r=callBound(new Bound(s,'sort_values'),[],{ascending:n==='nsmallest'});return callBound(new Bound(r,'head'),[k],{});}
      case 'value_counts':{const m=new Map();s.values.forEach(v=>{if(isNull(v))return;m.set(v,(m.get(v)||0)+1);});let e=[...m.entries()].sort((a,b)=>b[1]-a[1]);const norm=kwargs.normalize;const tot=e.reduce((a,x)=>a+x[1],0);if(kwargs.ascending)e.reverse();return seriesOf(norm?'proportion':'count',e.map(x=>x[0]),e.map(x=>norm?x[1]/tot:x[1]),s.name);}
      case 'sort_values':{const asc=kw(args,kwargs,0,'ascending',true);const o=s.values.map((v,i)=>i);o.sort((i,j)=>{const a=s.values[i],b=s.values[j];if(isNull(a))return 1;if(isNull(b))return -1;const c=cmpVals(a,b);return asc?c:-c;});return new Series(s.name,o.map(i=>s.index[i]),o.map(i=>s.values[i]),s.indexName,s.isDefault);}
      case 'sort_index':{const asc=kw(args,kwargs,0,'ascending',true);const o=s.index.map((v,i)=>i);o.sort((i,j)=>{const c=cmpVals(s.index[i],s.index[j]);return asc?c:-c;});return new Series(s.name,o.map(i=>s.index[i]),o.map(i=>s.values[i]),s.indexName,s.isDefault);}
      case 'head':{const k=kw(args,kwargs,0,'n',5);return new Series(s.name,s.index.slice(0,k),s.values.slice(0,k),s.indexName,s.isDefault);}
      case 'tail':{const k=kw(args,kwargs,0,'n',5);return new Series(s.name,s.index.slice(-k),s.values.slice(-k),s.indexName,s.isDefault);}
      case 'round':{const d=kw(args,kwargs,0,'decimals',0);return elementwise(s,0,v=>isNull(v)?v:Math.round(v*10**d)/10**d);}
      case 'abs':return elementwise(s,0,v=>isNull(v)?v:Math.abs(v));
      case 'cumsum':{let t=0;return new Series(s.name,s.index.slice(),s.values.map(v=>(t+=isNull(v)?0:v)),s.indexName,s.isDefault);}
      case 'isin':{const l=toList(args[0]);return elementwise(s,0,v=>l.includes(v));}
      case 'between':return elementwise(s,0,v=>!isNull(v)&&v>=args[0]&&v<=args[1]);
      case 'isnull':case 'isna':return elementwise(s,0,v=>isNull(v));
      case 'notnull':case 'notna':return elementwise(s,0,v=>!isNull(v));
      case 'fillna':return elementwise(s,0,v=>isNull(v)?args[0]:v);
      case 'astype':{const t=args[0];return elementwise(s,0,v=>isNull(v)?v:(t==='int'||t==='int64')?Math.trunc(Number(v)):(t==='float'||t==='float64')?Number(v):t==='str'?String(v):v);}
      case 'idxmax':case 'idxmin':{let bi=-1;s.values.forEach((v,i)=>{if(isNull(v))return;if(bi<0||(n==='idxmax'?v>s.values[bi]:v<s.values[bi]))bi=i;});return bi<0?null:s.index[bi];}
      case 'reset_index':{const nm=kwargs.name||s.name||0;const ic=s.indexName||'index';if(s.isDefault||kwargs.drop)return new Series(s.name,s.values.map((_,i)=>i),s.values.slice(),null,true);return new DF([ic,String(nm)],s.index.map((k,i)=>({[ic]:k,[String(nm)]:s.values[i]})));}
      case 'to_frame':{const nm=s.name||0;if(s.isDefault)return new DF([String(nm)],s.values.map(v=>({[String(nm)]:v})),s.index.slice());const ic=s.indexName||'index';return new DF([ic,String(nm)],s.index.map((k,i)=>({[ic]:k,[String(nm)]:s.values[i]})));}
      case 'plot':throw perr('Gráficos ficam para o Power BI da firma 😉 Aqui, entregue os números.');
      case 'map':{const m=args[0];if(m instanceof PyDict)return elementwise(s,0,v=>{const r=m.get(v);return r===undefined?null:r;});return elementwise(s,0,v=>chamar(m,[v],ctx));}
      case 'apply':return elementwise(s,0,v=>chamar(args[0],[v],ctx));
      default:throw perr(`${n}() não é suportado no simulador.`);}
  }
  if(s instanceof GroupBy){
    if(n==='agg'||n==='aggregate')return gbAggSpec(s,args,kwargs);
    return gbAgg(s,n);}
  if(s instanceof StrAcc){
    const v=s.s;const f={contains:x=>typeof x==='string'&&(kwargs.case===false?x.toLowerCase().includes(String(args[0]).toLowerCase()):x.includes(args[0])),upper:x=>typeof x==='string'?x.toUpperCase():x,lower:x=>typeof x==='string'?x.toLowerCase():x,strip:x=>typeof x==='string'?x.trim():x,startswith:x=>typeof x==='string'&&x.startsWith(args[0]),endswith:x=>typeof x==='string'&&x.endsWith(args[0]),len:x=>typeof x==='string'?x.length:null,replace:x=>typeof x==='string'?x.split(args[0]).join(args[1]):x}[n];
    return elementwise(v,0,x=>f(x));}
  if(s===NP){
    if(n==='where'){const [c,a,b]=args;if(c instanceof Series){return new Series(null,c.index.slice(),c.values.map((v,i)=>{const pick=x=>x instanceof Series?x.values[i]:x;return v?pick(a):pick(b);}),c.indexName,c.isDefault);}return c?a:b;}
    const f={round:(x,d)=>Math.round(x*10**(d||0))/10**(d||0),abs:Math.abs,sqrt:Math.sqrt}[n];
    if(f){const x=args[0];if(x instanceof Series)return elementwise(x,0,v=>isNull(v)?v:f(v,args[1]));return f(x,args[1]);}
    if(['mean','sum','max','min'].includes(n))return aggFn(n,toList(args[0]));}
  if(Array.isArray(s)){
    switch(n){case 'append':s.push(args[0]);return null;case 'count':return s.filter(x=>x===args[0]).length;case 'index':{const i=s.indexOf(args[0]);if(i<0)throw perr('ValueError: valor não está na lista');return i;}
      case 'pop':{if(!s.length)throw perr('IndexError: lista vazia');const i=args.length?args[0]:s.length-1;return s.splice(i<0?s.length+i:i,1)[0];}
      case 'extend':s.push(...iterar(args[0]));return null;case 'insert':s.splice(args[0],0,args[1]);return null;case 'remove':{const i=s.indexOf(args[0]);if(i<0)throw perr('ValueError: valor não está na lista');s.splice(i,1);return null;}
      case 'sort':{const key=kwargs.key;s.sort((a,b)=>key?cmpVals(chamar(key,[a],ctx),chamar(key,[b],ctx)):cmpVals(a,b));if(kwargs.reverse)s.reverse();return null;}
      case 'reverse':s.reverse();return null;case 'copy':return s.slice();}}
  if(typeof s==='string'){
    switch(n){case 'upper':return s.toUpperCase();case 'lower':return s.toLowerCase();case 'strip':return s.trim();case 'lstrip':return s.replace(/^\s+/,'');case 'rstrip':return s.replace(/\s+$/,'');
      case 'replace':return s.split(args[0]).join(args[1]);case 'startswith':return s.startsWith(args[0]);case 'endswith':return s.endsWith(args[0]);
      case 'split':return args.length&&args[0]!=null?s.split(args[0]):s.trim().split(/\s+/).filter(Boolean);
      case 'join':return iterar(args[0]).map(x=>{if(typeof x!=='string')throw perr('TypeError: join só junta textos. Use str() nos números.');return x;}).join(s);
      case 'title':return s.toLowerCase().replace(/(^|\s)\S/g,m=>m.toUpperCase());case 'capitalize':return s.charAt(0).toUpperCase()+s.slice(1).toLowerCase();
      case 'count':return s.split(args[0]).length-1;case 'find':return s.indexOf(args[0]);case 'zfill':return s.padStart(args[0],'0');case 'isdigit':return /^\d+$/.test(s);}}
  if(s instanceof PyDict){
    switch(n){case 'get':{const v=s.get(args[0]);return v===undefined?(args.length>1?args[1]:null):v;}
      case 'keys':return s.entries.map(e=>e[0]);case 'values':return s.entries.map(e=>e[1]);case 'items':return s.entries.map(e=>new Tuple([e[0],e[1]]));
      case 'update':args[0].entries.forEach(([k,v])=>s.set(k,v));return null;case 'pop':{const i=s.entries.findIndex(e=>e[0]===args[0]);if(i<0){if(args.length>1)return args[1];throw perr(`KeyError: ${fmtScalar(args[0])}`);}return s.entries.splice(i,1)[0][1];}
      case 'copy':return new PyDict(s.entries.map(e=>[e[0],e[1]]));}}
  throw perr(`${n}() não suportado.`);
}
function fmtScalar(v){if(v===null||v===undefined)return'None';if(v===true)return'True';if(v===false)return'False';if(typeof v==='number'){if(!isFinite(v))return isNaN(v)?'nan':(v>0?'inf':'-inf');return Number.isInteger(v)?String(v):String(Math.round(v*10000)/10000);}if(Array.isArray(v))return'['+v.map(x=>typeof x==='string'?`'${x}'`:fmtScalar(x)).join(', ')+']';if(v instanceof Tuple)return'('+v.items.map(x=>typeof x==='string'?`'${x}'`:fmtScalar(x)).join(', ')+')';if(v instanceof PyDict)return strPy(v);return String(v);}
function iterar(v){
  if(Array.isArray(v))return v.slice();if(v instanceof Tuple)return v.items.slice();if(typeof v==='string')return [...v];
  if(v instanceof PyDict)return v.entries.map(e=>e[0]);if(v instanceof Series)return v.values.slice();if(v instanceof DF)return v.cols.slice();
  throw perr(`TypeError: não dá para percorrer ${typeName(v)} com for.`);
}
function verdade(v){if(v instanceof Series)throw perr('ValueError: uma Series não é verdadeira nem falsa sozinha. Para filtrar use df[condição]; para testar tudo use .all() ou .any().');if(v instanceof DF)throw perr('ValueError: um DataFrame não é verdadeiro nem falso sozinho.');if(Array.isArray(v))return v.length>0;if(v instanceof PyDict)return v.entries.length>0;if(v instanceof Tuple)return v.items.length>0;if(isNull(v))return false;return !!v;}
function strPy(v){if(typeof v==='string')return v;if(v instanceof PyDict)return '{'+v.entries.map(([k,x])=>reprPy(k)+': '+reprPy(x)).join(', ')+'}';if(Array.isArray(v))return '['+v.map(reprPy).join(', ')+']';if(v instanceof Tuple)return '('+v.items.map(reprPy).join(', ')+(v.items.length===1?',':'')+')';if(v instanceof PyFunc)return `<function ${v.name}>`;if(v instanceof DF||v instanceof Series)return v;return fmtScalar(v);}
function reprPy(v){return typeof v==='string'?`'${v}'`:strPy(v);}
function formatar(v,fmt){
  if(!fmt)return strPy(v);
  if(isNull(v))return 'nan';
  let m=fmt.match(/^([<>^])?(\d+)?(,)?(?:\.(\d+))?([fd%e])?$/);
  if(!m)throw perr(`Formato “${fmt}” não suportado. Use, por exemplo, {valor:.2f} ou {valor:,.2f}.`);
  const [,al,w,sep,prec,tp]=m;
  let s;
  if(typeof v!=='number'){s=String(v);}
  else{
    let x=v;if(tp==='%')x=v*100;
    const p=prec!=null?+prec:(tp==='f'||tp==='%'?6:(tp==='d'?0:null));
    s=p!=null?x.toFixed(p):fmtScalar(x);
    if(sep){const [i,d]=s.split('.');s=i.replace(/\B(?=(\d{3})+(?!\d))/g,',')+(d!==undefined?'.'+d:'');}
    if(tp==='%')s+='%';
  }
  if(w){const n=+w;if(s.length<n){const pad=' '.repeat(n-s.length);s=al==='<'?s+pad:al==='^'?pad.slice(0,pad.length>>1)+s+pad.slice(pad.length>>1):(typeof v==='number'||al==='>'?pad+s:s+pad);}}
  return s;
}
const BUILTINS={
  len:a=>{const x=a[0];if(x instanceof DF)return x.rows.length;if(x instanceof Series)return x.values.length;if(Array.isArray(x)||typeof x==='string')return x.length;if(x instanceof Tuple)return x.items.length;if(x instanceof PyDict)return x.entries.length;throw perr('TypeError: len() não funciona com '+typeName(x)+'.');},
  round:a=>{const d=a[1]||0;if(a[0] instanceof Series)return callBound(new Bound(a[0],'round'),[d],{});if(isNull(a[0]))return a[0];const r=Math.round(a[0]*10**d)/10**d;return r;},
  sum:a=>iterar(a[0]).reduce((x,y)=>x+(isNull(y)?0:y),a[1]||0),
  max:a=>{const l=a.length>1?a:iterar(a[0]);if(!l.length)throw perr('ValueError: max() de lista vazia');return l.reduce((x,y)=>cmpVals(x,y)>=0?x:y);},
  min:a=>{const l=a.length>1?a:iterar(a[0]);if(!l.length)throw perr('ValueError: min() de lista vazia');return l.reduce((x,y)=>cmpVals(x,y)<=0?x:y);},
  abs:a=>Math.abs(a[0]),
  int:a=>{const v=a[0];if(typeof v==='string'){if(!/^\s*-?\d+\s*$/.test(v))throw perr(`ValueError: não dá para converter “${v}” em inteiro.`);return parseInt(v,10);}return Math.trunc(Number(v));},
  float:a=>{const v=Number(a[0]);if(isNaN(v))throw perr(`ValueError: não dá para converter “${a[0]}” em número.`);return v;},
  str:a=>strPy(a[0]),bool:a=>verdade(a[0]),
  list:a=>a.length?iterar(a[0]):[],
  tuple:a=>new Tuple(a.length?iterar(a[0]):[]),
  dict:(a,kw)=>{const d=new PyDict([]);if(a.length)iterar(a[0]).forEach(p=>{const it=iterar(p);d.set(it[0],it[1]);});Object.entries(kw||{}).forEach(([k,v])=>d.set(k,v));return d;},
  set:a=>[...new Set(a.length?iterar(a[0]):[])],
  sorted:(a,kw,ctx)=>{const l=iterar(a[0]);const key=kw&&kw.key;l.sort((x,y)=>key?cmpVals(chamar(key,[x],ctx),chamar(key,[y],ctx)):cmpVals(x,y));if(kw&&kw.reverse)l.reverse();return l;},
  range:a=>{let [s,e,st]=a.length===1?[0,a[0],1]:[a[0],a[1],a[2]||1];if(st===0)throw perr('ValueError: passo zero em range()');const r=[];for(let i=s;st>0?i<e:i>e;i+=st){r.push(i);if(r.length>100000)throw perr('range grande demais para o simulador.');}return r;},
  enumerate:(a,kw)=>{const st=a[1]!=null?a[1]:(kw&&kw.start)||0;return iterar(a[0]).map((v,i)=>new Tuple([i+st,v]));},
  zip:a=>{const ls=a.map(iterar);const n=Math.min(...ls.map(l=>l.length));const r=[];for(let i=0;i<n;i++)r.push(new Tuple(ls.map(l=>l[i])));return r;},
  type:a=>`<class '${typeName(a[0])}'>`,
  isinstance:a=>{const t=a[1];return typeName(a[0])===t;},
  input:()=>{throw perr('input() não funciona aqui: não tem teclado do outro lado. Coloque o valor direto numa variável.');}
};
class Sinal{constructor(t,v){this.t=t;this.v=v;}}
function chamar(f,args,ctx,kwargs){
  if(f instanceof Bound)return callBound(f,args,kwargs||{},ctx);
  if(f&&f.builtin==='print'){const sep=kwargs&&kwargs.sep!=null?kwargs.sep:' ';const end=kwargs&&kwargs.end!=null?kwargs.end:'\n';
    if(args.length===1&&(args[0] instanceof DF||args[0] instanceof Series)){ctx.out.push(args[0]);ctx.lastPrint=args[0];return null;}
    const txt=args.map(strPy).join(sep);ctx.out.push({txt:txt+end});ctx.lastPrint=args.length===1?args[0]:txt;return null;}
  if(f&&f.builtin)return BUILTINS[f.builtin](args,kwargs||{},ctx);
  if(f instanceof PyFunc){
    if(++ctx.depth>200)throw perr('RecursionError: chamadas demais (a função chama ela mesma sem parar?).');
    const env=Object.create(f.closure);
    f.params.forEach((p,i)=>{let v;if(i<args.length)v=args[i];else if(kwargs&&p.n in kwargs)v=kwargs[p.n];else if(p.def!==undefined)v=p.defVal;else throw perr(`TypeError: ${f.name}() precisa do argumento “${p.n}”.`);env[p.n]=v;});
    if(args.length>f.params.length)throw perr(`TypeError: ${f.name}() recebeu argumentos demais.`);
    let r=null;
    if(f.isLambda)r=evalNode(f.body,env,ctx);
    else{const s=execBlock(f.body,env,ctx);if(s&&s.t==='return')r=s.v;else if(s)throw perr(`SyntaxError: ${s.t} fora de um loop.`);}
    ctx.depth--;return r;}
  throw perr(`TypeError: ${typeName(f)} não é uma função.`);
}
function atribuir(target,v,env,ctx){
  if(target.k==='name'){env[target.v]=v;return;}
  if(target.k==='tuple'){const vals=iterar(v);if(vals.length!==target.items.length)throw perr(`ValueError: esperava ${target.items.length} valores para desempacotar, veio ${vals.length}.`);target.items.forEach((t,i)=>atribuir(t,vals[i],env,ctx));return;}
  if(target.k==='idx'){const o=evalNode(target.obj,env,ctx);const key=evalNode(target.key,env,ctx);
    if(o instanceof DF&&typeof key==='string'){const vals=v instanceof Series?v.values:o.rows.map(()=>v);if(vals.length!==o.rows.length)throw perr('A nova coluna precisa ter o mesmo tamanho da tabela.');o.rows=o.rows.map((r,i)=>({...r,[key]:vals[i]}));if(!o.cols.includes(key))o.cols.push(key);return;}
    if(o instanceof PyDict){o.set(key,v);return;}
    if(Array.isArray(o)){const i=key<0?o.length+key:key;if(i<0||i>=o.length)throw perr('IndexError: posição fora da lista.');o[i]=v;return;}
    throw perr('Atribuição com colchetes não suportada para '+typeName(o)+'.');}
  throw perr('Não dá para atribuir valor a essa expressão.');
}
function execBlock(stmts,env,ctx){
  for(const s of stmts){
    if(++ctx.passos>300000)throw perr('O código rodou tempo demais (loop infinito?). Confira a condição do while.');
    switch(s.k){
      case 'pass':break;
      case 'expr':{const v=evalNode(s.e,env,ctx);ctx.last=v;ctx.lastIsExpr=!(s.e.k==='call'&&s.e.fn.k==='name'&&s.e.fn.v==='print');break;}
      case 'assign':{const v=evalNode(s.value,env,ctx);atribuir(s.target,v,env,ctx);ctx.lastIsExpr=false;break;}
      case 'def':{const f=new PyFunc(s.name,s.params.map(p=>({...p,defVal:p.def!==undefined?evalNode(p.def,env,ctx):undefined})),s.body,env,false);env[s.name]=f;ctx.lastIsExpr=false;break;}
      case 'return':return new Sinal('return',s.e?evalNode(s.e,env,ctx):null);
      case 'break':return new Sinal('break');
      case 'continue':return new Sinal('continue');
      case 'if':{let done=false;for(const [c,b] of s.branches){if(verdade(evalNode(c,env,ctx))){const r=execBlock(b,env,ctx);if(r)return r;done=true;break;}}
        if(!done&&s.els){const r=execBlock(s.els,env,ctx);if(r)return r;}ctx.lastIsExpr=false;break;}
      case 'for':{const it=iterar(evalNode(s.it,env,ctx));
        for(const v of it){if(s.names.length===1)env[s.names[0]]=v;else atribuir({k:'tuple',items:s.names.map(n=>({k:'name',v:n}))},v,env,ctx);
          const r=execBlock(s.body,env,ctx);if(r){if(r.t==='break')break;if(r.t==='continue')continue;return r;}}
        ctx.lastIsExpr=false;break;}
      case 'while':{while(verdade(evalNode(s.cond,env,ctx))){if(++ctx.passos>300000)throw perr('O código rodou tempo demais (loop infinito?). Confira a condição do while.');const r=execBlock(s.body,env,ctx);if(r){if(r.t==='break')break;if(r.t==='continue')continue;return r;}}ctx.lastIsExpr=false;break;}
    }
  }
  return null;
}
function evalNode(n,env,ctx){
  switch(n.k){
    case 'lit':return n.v;
    case 'name':if(n.v in env)return env[n.v];if(BUILTINS[n.v]||n.v==='print')return{builtin:n.v};throw perr(`NameError: “${n.v}” não foi definido. Tabelas disponíveis: vendas, clientes, campanhas, entregas.`);
    case 'list':return n.items.map(x=>evalNode(x,env,ctx));
    case 'listcomp':{const out=[];const loc=Object.create(env);for(const v of iterar(evalNode(n.it,env,ctx))){if(n.names.length===1)loc[n.names[0]]=v;else atribuir({k:'tuple',items:n.names.map(x=>({k:'name',v:x}))},v,loc,ctx);if(n.cond&&!verdade(evalNode(n.cond,loc,ctx)))continue;out.push(evalNode(n.elt,loc,ctx));}return out;}
    case 'tuple':return new Tuple(n.items.map(x=>evalNode(x,env,ctx)));
    case 'dict':return new PyDict(n.pairs.map(([k,v])=>[evalNode(k,env,ctx),evalNode(v,env,ctx)]));
    case 'fstr':return n.parts.map(p=>p.lit!==undefined?p.lit:formatar(evalNode(p.e,env,ctx),p.fmt)).join('');
    case 'lambda':return new PyFunc('<lambda>',n.params,n.body,env,true);
    case 'ternary':return verdade(evalNode(n.cond,env,ctx))?evalNode(n.a,env,ctx):evalNode(n.b,env,ctx);
    case 'bool':{const a=evalNode(n.a,env,ctx);if(a instanceof Series)throw perr('Com Series use & (e) e | (ou), com parênteses em cada condição, em vez de and/or.');if(n.op==='and')return verdade(a)?evalNode(n.b,env,ctx):a;return verdade(a)?a:evalNode(n.b,env,ctx);}
    case 'bin':return binop(n.op,evalNode(n.a,env,ctx),evalNode(n.b,env,ctx));
    case 'un':{const a=evalNode(n.a,env,ctx);if(n.op==='-')return elementwise(a,0,v=>isNull(v)?v:-v);if(n.op==='+')return a;if(n.op==='~'){if(a instanceof Series)return elementwise(a,0,v=>!v);return ~a;}if(n.op==='not'){if(a instanceof Series)throw perr('Para negar um filtro use ~ (til).');return !verdade(a);}}
    case 'idx':return getItem(evalNode(n.obj,env,ctx),evalNode(n.key,env,ctx));
    case 'slice':{const o=evalNode(n.obj,env,ctx);const s=n.s?evalNode(n.s,env,ctx):0;const e=n.e?evalNode(n.e,env,ctx):undefined;if(o instanceof DF)return new DF(o.cols.slice(),o.rows.slice(s,e),o.index.slice(s,e));if(o instanceof Series)return new Series(o.name,o.index.slice(s,e),o.values.slice(s,e),o.indexName,o.isDefault);if(Array.isArray(o)||typeof o==='string')return o.slice(s,e);throw perr('Fatiamento não suportado aqui.');}
    case 'attr':return getAttr(evalNode(n.obj,env,ctx),n.name);
    case 'call':{const f=evalNode(n.fn,env,ctx);const args=n.args.map(x=>evalNode(x,env,ctx));const kwargs={};for(const k in n.kwargs)kwargs[k]=evalNode(n.kwargs[k],env,ctx);return chamar(f,args,ctx,kwargs);}
  }
  throw perr('Expressão não suportada.');
}
function cloneTables(){const env={pd:PD,np:NP};for(const t in DATA){const rows=DATA[t].map(r=>({...r}));env[t]=new DF(Object.keys(DATA[t][0]),rows);}return env;}
function runPython(code){
  const env=cloneTables();const ctx={out:[],lastPrint:undefined,last:undefined,lastIsExpr:false,passos:0,depth:0};
  const stmts=parse(code);
  const r=execBlock(stmts,env,ctx);
  if(r)throw perr(`SyntaxError: “${r.t}” fora de função ou loop.`);
  const result=ctx.lastIsExpr?ctx.last:ctx.lastPrint;
  return {result,prints:ctx.out,fromPrint:!ctx.lastIsExpr,hasResult:result!==undefined&&!(ctx.lastIsExpr&&ctx.last===null&&!ctx.out.length)};
}

/* ============ SQL (alasql) ============ */
let SQLDB=null;
function sqlDb(){if(SQLDB)return SQLDB;const db=new alasql.Database();for(const t in DATA){db.exec(`CREATE TABLE ${t}`);db.tables[t].data=DATA[t].map(r=>({...r}));}SQLDB=db;return db;}
function runSQL(code){
  let q=code.replace(/--[^\n]*/g,'').replace(/\/\*[\s\S]*?\*\//g,'').trim().replace(/;+\s*$/,'');
  if(!q)throw new Error('Escreva uma consulta.');
  if(q.includes(';'))throw new Error('Envie uma consulta por vez (sem ; no meio).');
  if(!/^(select|with)\b/i.test(q)){
    if(/^(delete|drop|update|insert|truncate|alter)\b/i.test(q))throw new Error('Opa! Essa base é de produção. Aqui só rodamos SELECT. (O Kevin manda lembranças.)');
    throw new Error('A consulta precisa começar com SELECT.');}
  q=q.split(/('(?:[^']|'')*')/).map((part,i)=>i%2?part:part.replace(/\bAS\s+(count|sum|top|desc|asc|order|group|avg|min|max)\b/gi,'AS `$1`').replace(/(^|[^`\w.])(total|value|index)\b(?!\s*\()/gi,'$1`$2`')).join('');
  const db=sqlDb();
  for(const t in DATA)db.tables[t].data=DATA[t].map(r=>({...r}));
  let res;
  try{res=db.exec(q);}catch(e){throw new Error(traduzErroSQL(e.message||String(e)));}
  if(!Array.isArray(res))throw new Error('A consulta não retornou linhas.');
  const cols=res.length?Object.keys(res[0]):[];
  return new DF(cols,res.map(r=>{const o={};cols.forEach(c=>o[c]=r[c]===undefined?null:r[c]);return o;}));
}
function traduzErroSQL(m){
  if(/Table .* does not exist|Table does not exist/i.test(m))return 'Tabela não encontrada. As tabelas são: vendas, clientes, campanhas, entregas.';
  if(/Parse error/i.test(m))return 'Erro de sintaxe no SQL. Confira vírgulas, aspas simples nos textos e a ordem SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY → LIMIT.';
  if(/Column .* not found|Cannot read/i.test(m))return 'Alguma coluna não existe ou está escrita errado. Confira o dicionário de dados.';
  return 'Erro no SQL: '+m;
}

/* ============ VERIFICADOR ============ */
function normalize(v){
  if(v instanceof DF)return v.rows.map(r=>v.cols.map(c=>r[c]));
  if(v instanceof Series)return v.isDefault?v.values.map(x=>[x]):v.index.map((k,i)=>[k,v.values[i]]);
  if(Array.isArray(v))return v.map(x=>[x]);
  if(v instanceof Tuple)return [v.items];
  return [[v]];
}
function cellKey(c){if(isNull(c))return'∅';if(typeof c==='boolean')return c?'1':'0';if(typeof c==='number')return'#';return'$'+String(c).trim().toLowerCase();}
function rowSig(row){const s=row.map(cellKey).filter(k=>k[0]==='$').sort();return s.join('|');}
function sameRow(a,b){
  if(a.length!==b.length)return false;
  const sa=a.filter(c=>typeof c==='string').map(x=>x.trim().toLowerCase()).sort(),sb=b.filter(c=>typeof c==='string').map(x=>x.trim().toLowerCase()).sort();
  if(sa.join('|')!==sb.join('|'))return false;
  const toN=c=>isNull(c)?null:typeof c==='boolean'?(c?1:0):c;
  const na=a.filter(c=>typeof c!=='string').map(toN),nb=b.filter(c=>typeof c!=='string').map(toN);
  const sortN=x=>x.slice().sort((p,q)=>p===null?1:q===null?-1:p-q);
  const xa=sortN(na),xb=sortN(nb);
  return xa.every((x,i)=>{const y=xb[i];if(x===null||y===null)return x===y;return Math.abs(x-y)<=Math.max(0.051,Math.abs(y)*0.0006);});
}
function compareResults(got,exp,ordered){
  const A=normalize(got),B=normalize(exp);
  if(A.length!==B.length)return {ok:false,msg:`Seu resultado tem ${A.length} linha(s); o esperado tem ${B.length}.`};
  if(A[0]&&B[0]&&A[0].length!==B[0].length)return {ok:false,msg:`Seu resultado tem ${A[0].length} coluna(s); o esperado tem ${B[0].length}. Retorne só o que foi pedido.`};
  if(ordered){for(let i=0;i<A.length;i++)if(!sameRow(A[i],B[i]))return {ok:false,msg:i===0&&A.length>1?'Os valores ou a ordem não batem. Confira o critério de ordenação.':`A linha ${i+1} não bate com o esperado.`};return{ok:true};}
  const used=new Array(B.length).fill(false);
  for(const r of A){const j=B.findIndex((b,k)=>!used[k]&&sameRow(r,b));if(j<0)return {ok:false,msg:'Os valores não batem com o esperado. Confira filtros e agregações.'};used[j]=true;}
  return {ok:true};
}
function runCode(lang,code){if(lang==='sql')return {result:runSQL(code),prints:[],hasResult:true};return runPython(code);}

if(typeof module!=='undefined')module.exports={DATA,runPython,runSQL,compareResults,normalize,DF,Series,fmtScalar,setAlasql:a=>{global.alasql=a;}};
