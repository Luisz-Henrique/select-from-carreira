/* ================= ESTADO ================= */
const SAVE_KEY='select-from-carreira-v1';
const T=16,MW=24,MH=16;
const $=s=>document.querySelector(s);
const cv=$('#cv'),ctx=cv.getContext('2d');ctx.imageSmoothingEnabled=false;
const reduceMotion=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
let S=null;
function novoEstado(nome,look){
  return {v:1,nome,look,dia:1,minuto:540,dinheiro:300,salario:CARREIRA[0].salario,cargo:0,xp:0,
    skills:{sql:0,py:0,negocio:0,com:0},energia:100,rep:{Marketing:50,Vendas:50,'Operações':50,Financeiro:50},chefe:50,
    missoes:[],feitas:{},totalFeitas:0,recFeitos:{rel_vendas:0,rel_mkt:0,rel_ops:0},
    roupa:'basica',owned:['basica'],acess:[],cursos:[],autos:[],ultimoAumento:-99,falou:{},pato:0,
    pos:{x:11,y:14},dir:'up',hoje:{entregas:[],ganhos:0,xp:0,atrasos:[]},cenasVistas:[],uid:1,aviso18:false,histor:[],
    tereza:{idx:0,dia:0,feitas:[],desafios:[],apresentada:false},cursoProg:{}};
}
function salvar(){if(!S)return;if(typeof player!=='undefined'&&player)S.pos={x:player.x,y:player.y};try{localStorage.setItem(SAVE_KEY,JSON.stringify(S));}catch(e){}}
function carregar(){try{const s=localStorage.getItem(SAVE_KEY);return s?JSON.parse(s):null;}catch(e){return null;}}
const lvl=x=>Math.floor(Math.sqrt(x/30));
const lvlProg=x=>{const l=lvl(x);return (x-30*l*l)/(30*((l+1)**2-l*l));};
const avgRep=()=>Math.round(DEPTS.reduce((a,d)=>a+S.rep[d],0)/DEPTS.length);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const brl=v=>(v<0?'−':'')+'R$ '+Math.abs(Math.round(v)).toLocaleString('pt-BR');
const has=id=>S.owned.includes(id);
const horaStr=m=>`${String(Math.floor(m/60)).padStart(2,'0')}:${String(Math.floor(m%60)).padStart(2,'0')}`;
const mesDoDia=d=>MESES[Math.min(11,Math.floor(((d-1)%52)*12/52))];
const semana=d=>((d-1)%52)+1;
const eventoHoje=()=>{const w=semana(S.dia);if(w===1&&S.dia>1)return{nome:'Ano novo'};return EVENTOS[w]||null;};

/* ================= MAPA ================= */
let solid,inter,floorT,furn,npcs,player;
const DESKS=[
  {x:3,y:12,w:3,cx:3,cy:13,nome:'Bancada dos estagiários'},
  {x:10,y:8,w:2,cx:10,cy:9,nome:'Sua mesa no open space'},
  {x:10,y:8,w:2,cx:10,cy:9,nome:'Sua mesa no open space'},
  {x:19,y:9,w:2,cx:19,cy:10,nome:'Mesa de canto, perto do chefe'},
  {x:19,y:12,w:2,cx:19,cy:13,nome:'Sua sala com parede de vidro'},
  {x:19,y:12,w:2,cx:19,cy:13,nome:'Sua sala com parede de vidro'}
];
function deskAtual(){return DESKS[S.cargo];}
function buildMap(){
  solid=[...Array(MH)].map(()=>Array(MW).fill(false));
  inter=[...Array(MH)].map(()=>Array(MW).fill(null));
  floorT=[...Array(MH)].map((_,y)=>[...Array(MW)].map((_,x)=>{
    if(x>=1&&x<=5&&y>=2&&y<=6)return'tile';
    if(x>=17&&x<=22&&y>=2&&y<=6)return'wood';
    if(x>=17&&x<=22&&y>=12&&y<=14)return'wood';
    return'carpet';}));
  furn=[];
  const S_=(x,y,w=1,h=1)=>{for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)solid[j][i]=true;};
  const I_=(x,y,w,h,v)=>{for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)inter[j][i]=v;};
  const F=(type,x,y,w=1,h=1,extra={})=>{furn.push({type,x,y,w,h,...extra});};
  for(let x=0;x<MW;x++){S_(x,0);S_(x,1);S_(x,15);}
  for(let y=0;y<MH;y++){S_(0,y);S_(23,y);}
  // copa
  F('cafe',1,2);S_(1,2);I_(1,2,1,1,{t:'cafe',label:'Pegar café'});
  F('geladeira',2,2);S_(2,2);I_(2,2,1,1,{t:'obj',id:'geladeira',label:'Abrir a geladeira'});
  F('balcao',3,2,2);S_(3,2,2);I_(3,2,2,1,{t:'obj',id:'pia',label:'Olhar a pia'});
  F('mesacopa',2,5,2);S_(2,5,2);I_(2,5,2,1,{t:'obj',id:'mesacopa',label:'Mesa da copa'});
  F('divisoria',6,2,1,3);S_(6,2,1,3);
  // áreas
  const areaDesk=(x,y,npc,dept)=>{F('deskNpc',x,y,2,1,{npc});S_(x,y,2);I_(x,y,2,1,{t:'npc',id:npc,label:`Falar com ${NPCS[npc].nome} (${NPCS[npc].cargo})`});F('cadeira',x,y-1,1,1,{cor:'#3b4254',behind:true});};
  areaDesk(7,3,'bia');areaDesk(10,3,'carlao');areaDesk(13,3,'jorge');areaDesk(7,8,'neide');areaDesk(13,8,'fabio');
  F('mesaMentora',13,11,2);S_(13,11,2);I_(13,11,2,1,{t:'npc',id:'tereza',label:'Falar com Tereza (Cientista de Dados Sênior)'});F('cadeira',13,10,1,1,{cor:'#2a6f68',behind:true});
  F('rack',15,8);S_(15,8);I_(15,8,1,1,{t:'obj',id:'rack',label:'Servidor'});
  F('quadro',11,1,2);I_(11,1,2,1,{t:'carreira',label:'Quadro de metas (plano de carreira)'});
  // sala do chefe
  for(let y=2;y<=6;y++){F('vidroV',16,y);S_(16,y);}
  for(let x=16;x<=22;x++){if(x===19)continue;F('vidroH',x,7);S_(x,7);}
  F('mesaChefe',19,4,2);S_(19,4,2);I_(19,4,2,1,{t:'npc',id:'chefe',label:'Falar com Seu Ronaldo (Gerente de BI)'});
  F('estante',22,2);S_(22,2);F('planta',17,2);S_(17,2);
  F('cadeira',19,3,1,1,{cor:'#5b2a2a',behind:true,grande:true});
  // sala de vidro inferior
  for(let x=16;x<=22;x++){if(x===18)continue;F('vidroH',x,11);S_(x,11);}
  for(let y=12;y<=14;y++){F('vidroV',16,y);S_(16,y);}
  F('planta',22,14);S_(22,14);
  // outros
  F('impressora',1,8);S_(1,8);I_(1,8,1,1,{t:'obj',id:'impressora',label:'Impressora'});
  F('bebedouro',5,7);S_(5,7);I_(5,7,1,1,{t:'obj',id:'bebedouro',label:'Bebedouro (rádio-corredor)'});
  F('planta',1,10);S_(1,10);F('planta',22,8);S_(22,8);F('planta',5,14);S_(5,14);
  F('porta',11,15,2);I_(11,15,2,1,{t:'porta',label:'Ir para casa'});
  // mesa do jogador
  const d=deskAtual();
  if(S.cargo<4){F('mesaReuniao',19,13,2);S_(19,13,2);I_(19,13,2,1,{t:'obj',id:'reuniao',label:'Sala de reunião'});}
  if(S.cargo>=1&&S.cargo<=2){F('bancada',2,12,3,1,{vazia:true});S_(2,12,3);I_(2,12,3,1,{t:'obj',id:'bancada',label:'Antiga bancada dos estagiários'});}
  if(S.cargo===0){F('bancada',2,12,3,1);S_(2,12,3);I_(3,12,2,1,{t:'pc',label:'Usar o computador'});I_(2,12,1,1,{t:'npc',id:'kevin',label:'Falar com Kevin (estagiário)'});}
  else{F('deskPlayer',d.x,d.y,d.w,1);S_(d.x,d.y,d.w);I_(d.x,d.y,d.w,1,{t:'pc',label:'Usar o computador'});}
  F('cadeiraPlayer',d.cx,d.cy,1,1);
  if(S.autos.length){F('servidores',d.x+d.w,d.y,1,1);S_(d.x+d.w,d.y);I_(d.x+d.w,d.y,1,1,{t:'obj',id:'autos',label:'Suas automações'});}
  // NPCs
  npcs={
    bia:mkNpc('bia',7,2),carlao:mkNpc('carlao',10,2),jorge:mkNpc('jorge',13,2),neide:mkNpc('neide',7,7),fabio:mkNpc('fabio',13,7),
    chefe:mkNpc('chefe',19,3),kevin:mkNpc('kevin',2,13,true),tereza:mkNpc('tereza',13,10)};
}
function mkNpc(id,x,y,wander){return {id,x,y,px:x*T,py:y*T,dir:'down',moving:false,wander:!!wander,timer:2+Math.random()*3,frame:0,home:{x,y}};}
function blocked(x,y,who){
  if(x<0||y<0||x>=MW||y>=MH)return true;
  if(solid[y][x])return true;
  if(who!=='player'&&player.x===x&&player.y===y)return true;
  if(who!=='player'&&player.tx===x&&player.ty===y)return true;
  for(const k in npcs){const n=npcs[k];if(n===who)continue;if((n.x===x&&n.y===y)||(n.tx===x&&n.ty===y))return true;}
  return false;
}

/* ================= DESENHO ================= */
const P={carpet:'#6f7f9e',carpet2:'#687897',tile:'#d9dee6',tile2:'#c9d0db',wood:'#b07a4a',wood2:'#a06d40',wallTop:'#2d3448',wall:'#e8e3d6',wall2:'#cfc8b6',base:'#7a6a55'};
function R(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(x|0,y|0,w,h);}
function drawFloor(){
  for(let y=2;y<15;y++)for(let x=1;x<23;x++){
    const t=floorT[y][x],px=x*T,py=y*T;
    if(t==='carpet'){R(px,py,T,T,(x+y)%2?P.carpet:P.carpet2);if((x*7+y*3)%11===0)R(px+5,py+9,2,1,'#7b8bab');}
    else if(t==='tile'){R(px,py,T,T,P.tile);R(px,py,T,1,P.tile2);R(px,py,1,T,P.tile2);}
    else{R(px,py,T,T,P.wood);for(let k=0;k<4;k++)R(px,py+k*4+3,T,1,P.wood2);R(px+((y%2)?6:12),py,1,T,P.wood2);}
  }
}
function janelaCor(){const m=S.minuto;if(m<600)return['#a8dcff','#d7f0ff'];if(m<1020)return['#8ccaf2','#c3e7ff'];if(m<1110)return['#f4a259','#f9d38c'];return['#1d2a4d','#2c3d69'];}
function drawWalls(){
  R(0,0,MW*T,T,P.wallTop);R(0,T,MW*T,T,P.wall);R(0,T*2-3,MW*T,3,P.base);
  const [c1,c2]=janelaCor();
  for(const wx of [2,8,14,18,21]){
    const px=wx*T;R(px-1,T+1,T*2-2+2,T-5,'#5a5f6e');R(px+1,T+3,T*2-6,T-9,c1);R(px+1,T+3,T*2-6,3,c2);R(px+T-2,T+3,2,T-9,'#5a5f6e');
    if(S.minuto>=1110){R(px+4,T+5,1,1,'#fff');R(px+20,T+4,1,1,'#fff');}
    else{R(px+3,T+9,6,3,'#5d6b85');R(px+10,T+7,4,5,'#4e5b74');R(px+19,T+8,5,4,'#5d6b85');}
  }
  R(0,T*15,MW*T,T,P.wallTop);R(0,0,T,MH*T,P.wallTop);R(T*23,0,T,MH*T,P.wallTop);
}
function rr(x,y,w,h,c){R(x,y,w,h,c);}
function drawFurn(f){
  const px=f.x*T,py=f.y*T,t=Date.now();
  switch(f.type){
    case 'cafe':R(px+2,py-6,12,20,'#3a3f4b');R(px+4,py-4,8,5,'#1b1e25');R(px+5,py-3,2,1,'#ff5d5d');R(px+5,py+4,6,5,'#2a2d35');R(px+6,py+6,4,3,'#f3efe6');R(px+7,py+7,2,1,'#6b4426');break;
    case 'geladeira':R(px+1,py-10,14,24,'#e9eef4');R(px+1,py-10,14,1,'#ffffff');R(px+1,py+1,14,1,'#b8c2cf');R(px+12,py-6,1,5,'#8a96a8');R(px+12,py+4,1,6,'#8a96a8');break;
    case 'balcao':R(px,py-2,T*f.w,16,'#c7b79a');R(px,py-2,T*f.w,3,'#e4d8c0');R(px+T+3,py-1,9,2,'#9fb3c8');R(px+T+7,py-5,1,4,'#8a96a8');R(px+3,py-6,4,4,'#d95d39');break;
    case 'mesacopa':R(px+1,py-2,T*2-2,9,'#c58b5b');R(px+1,py-2,T*2-2,2,'#dba57a');R(px+3,py+7,2,6,'#7a5235');R(px+T*2-5,py+7,2,6,'#7a5235');
      if(S.aniversario){R(px+10,py-8,10,6,'#f6d6e6');R(px+10,py-8,10,2,'#e85d9a');R(px+14,py-11,1,3,'#ffd23f');R(px+14,py-12,1,1,'#ff8c3b');}
      if(eventoHoje()&&eventoHoje().deco==='pascoa'){R(px+6,py-5,4,4,'#7b4a2a');R(px+20,py-5,4,4,'#a8673d');R(px+21,py-4,2,1,'#ffd23f');}break;
    case 'divisoria':R(px+4,py-4,8,T*3+2,'#9aa4b5');R(px+4,py-4,8,2,'#c1c9d6');for(let k=0;k<3;k++)R(px+5,py+k*T+2,6,1,'#7d889b');break;
    case 'deskNpc':{R(px,py-4,T*2,8,'#a46d3f');R(px,py-4,T*2,2,'#c48a55');R(px,py+4,T*2,9,'#7c5130');R(px+2,py+4,2,10,'#5e3c22');R(px+T*2-4,py+4,2,10,'#5e3c22');
      R(px+9,py-12,12,9,'#3d4352');R(px+13,py-4,4,1,'#3d4352');R(px+3,py-3,5,3,'#f3f3f3');R(px+24,py-3,4,2,'#e1c76a');
      if(f.npc==='bia'){R(px+25,py-6,3,3,'#e85d9a');}if(f.npc==='carlao'){R(px+2,py-6,5,3,'#2ecc71');}if(f.npc==='jorge'){R(px+24,py-6,5,4,'#1f6f43');R(px+25,py-5,3,1,'#bfe6cf');}if(f.npc==='neide'){R(px+2,py-5,6,3,'#c0392b');R(px+2,py-5,6,1,'#e74c3c');}if(f.npc==='fabio'){R(px+2,py-6,4,3,'#222');R(px+3,py-5,1,1,'#2ecc71');}
      break;}
    case 'deskPlayer':{const w=T*f.w;R(px,py-4,w,8,'#a46d3f');R(px,py-4,w,2,'#c48a55');R(px,py+4,w,9,'#7c5130');R(px+2,py+4,2,10,'#5e3c22');R(px+w-4,py+4,2,10,'#5e3c22');
      drawMonitor(px+9,py-14);if(has('monitor2'))drawMonitor(px+20,py-13,true);drawDeskDecor(px,py,w);break;}
    case 'bancada':{const w=T*3;R(px,py-4,w,8,'#9b9b9b');R(px,py-4,w,2,'#bdbdbd');R(px,py+4,w,9,'#6d6d6d');R(px+2,py+4,2,10,'#4f4f4f');R(px+w-4,py+4,2,10,'#4f4f4f');
      if(!f.vidas&&!f.vazia){R(px+3,py-12,10,8,'#3d4352');R(px+4,py-11,8,6,'#1e3a5f');R(px+5,py-10,3,1,'#e74c3c');drawMonitor(px+T+9,py-14);drawDeskDecor(px+T,py,T*2);}
      if(f.vazia){R(px+12,py-3,10,3,'#f3f3f3');R(px+26,py-6,4,4,'#e0b84a');}
      break;}
    case 'cadeira':{const c=f.cor;if(f.grande){R(px+3,py-6,10,12,c);R(px+3,py-6,10,2,'#7a3a3a');}else{R(px+4,py-3,8,8,c);R(px+4,py-3,8,2,'#4d5468');}R(px+7,py+5,2,4,'#2a2d35');R(px+4,py+9,8,2,'#2a2d35');break;}
    case 'cadeiraPlayer':{const ergo=has('cadeira');const c=ergo?'#1f6f8b':'#3b4254';R(px+4,py+2,8,6,c);R(px+3,py+8,10,3,c);if(ergo){R(px+4,py+1,8,2,'#2a9fc7');R(px+2,py+6,1,4,'#2a2d35');R(px+13,py+6,1,4,'#2a2d35');}R(px+7,py+11,2,3,'#2a2d35');R(px+4,py+14,8,1,'#2a2d35');break;}
    case 'mesaMentora':{R(px,py-4,T*2,8,'#8a5a36');R(px,py-4,T*2,2,'#a8744a');R(px,py+4,T*2,9,'#6b4426');R(px+2,py+4,2,10,'#4a2e19');R(px+T*2-4,py+4,2,10,'#4a2e19');
      R(px+3,py-9,10,6,'#c9d0db');R(px+4,py-8,8,4,'#2a9d8f');R(px+3,py-3,10,1,'#9aa4b5');
      R(px+18,py-7,7,2,'#c0392b');R(px+19,py-9,6,2,'#2b59c3');R(px+18,py-11,7,2,'#ffd23f');R(px+27,py-6,3,3,'#f6f7f9');break;}
    case 'rack':{R(px+2,py-10,12,24,'#1f232c');for(let k=0;k<5;k++){R(px+4,py-8+k*4,8,2,'#2f3542');R(px+10,py-8+k*4,1,1,((t/300+k)|0)%2?'#2ecc71':'#0f5132');}break;}
    case 'servidores':{R(px+3,py-8,10,20,'#20242e');const n=S.autos.length;for(let k=0;k<5;k++){R(px+5,py-6+k*4,6,2,'#2f3542');if(k<n)R(px+9,py-6+k*4,1,1,((t/250+k)|0)%2?'#4fc3f7':'#0d3c55');}
      R(px+4,py-12,8,4,'#9aa4b5');R(px+5,py-11,2,1,'#4fc3f7');R(px+9,py-11,2,1,'#4fc3f7');break;}
    case 'quadro':{R(px+1,py+2,T*2-2,12,'#f6f7f9');R(px+1,py+2,T*2-2,1,'#9aa4b5');R(px+4,py+5,10,1,'#2b59c3');R(px+4,py+8,16,1,'#d6453d');R(px+4,py+11,8,1,'#2f9e5b');R(px+20,py+4,7,7,'#ffd23f');break;}
    case 'vidroV':R(px+6,py-6,4,T+6,'rgba(170,215,240,.55)');R(px+6,py-6,1,T+6,'#d8f0ff');R(px+9,py-6,1,T+6,'#6d8aa6');break;
    case 'vidroH':R(px,py-6,T,12,'rgba(170,215,240,.5)');R(px,py-6,T,1,'#d8f0ff');R(px,py+5,T,2,'#6d8aa6');R(px+(f.x%2?3:9),py-4,1,6,'rgba(255,255,255,.7)');break;
    case 'mesaChefe':{R(px-2,py-4,T*2+4,9,'#5a3420');R(px-2,py-4,T*2+4,2,'#7b4a2e');R(px-2,py+5,T*2+4,9,'#43261a');R(px+10,py+7,12,3,'#d4af37');R(px+3,py-11,10,8,'#2c3140');R(px+22,py-7,4,4,'#e8e3d6');if(S.cargo<5)R(px+23,py-6,2,1,'#c0392b');break;}
    case 'estante':R(px+1,py-10,14,24,'#6b4426');for(let k=0;k<3;k++){R(px+2,py-8+k*7,12,1,'#4a2e19');R(px+3,py-13+k*7+6,2,5,['#c0392b','#2b59c3','#2f9e5b'][k]);R(px+6,py-13+k*7+6,2,5,'#ffd23f');R(px+9,py-13+k*7+7,3,4,'#8e44ad');}break;
    case 'planta':R(px+4,py+4,8,8,'#b5651d');R(px+4,py+4,8,2,'#cf7a2a');R(px+3,py-5,10,10,'#2f8f4e');R(px+1,py-2,4,5,'#3fae63');R(px+11,py-3,4,5,'#3fae63');R(px+6,py-8,4,4,'#3fae63');break;
    case 'impressora':R(px+1,py-2,14,12,'#d8dce3');R(px+1,py-2,14,3,'#eef1f5');R(px+3,py+3,10,2,'#2a2d35');R(px+4,py-5,8,3,'#ffffff');R(px+12,py,1,1,((t/400)|0)%2?'#ffd23f':'#d6453d');R(px+3,py+10,10,3,'#b8bec9');break;
    case 'bebedouro':R(px+4,py-10,8,8,'rgba(120,190,240,.8)');R(px+4,py-10,8,2,'#cfe9ff');R(px+3,py-2,10,15,'#e8ecf2');R(px+5,py+1,6,2,'#9aa4b5');break;
    case 'porta':{const w=T*2;R(px,py,w,T,'#6b4f37');R(px+2,py+1,w/2-3,T-1,'#8a6849');R(px+w/2+1,py+1,w/2-3,T-1,'#8a6849');R(px+w/2-3,py+7,1,3,'#d4af37');R(px+w/2+2,py+7,1,3,'#d4af37');R(px+8,py-2,16,4,'#2f9e5b');R(px+10,py-1,12,2,'#bff0cf');break;}
    case 'mesaReuniao':R(px-6,py-4,T*2+12,10,'#7b4a2e');R(px-6,py-4,T*2+12,2,'#9b623d');R(px-2,py+6,2,7,'#4a2e19');R(px+T*2,py+6,2,7,'#4a2e19');R(px+4,py-3,4,3,'#f3f3f3');R(px+18,py-3,3,3,'#d95d39');break;
  }
}
function drawMonitor(x,y,small){
  const t=Date.now();const pend=S.missoes.length>0;
  R(x,y,12,9,'#2c3140');R(x+1,y+1,10,7,pend?'#1d4f91':'#16314f');R(x+5,y+9,2,2,'#2c3140');R(x+3,y+11,6,1,'#2c3140');
  if(!small){R(x+2,y+2,5,1,'#8fc1ff');R(x+2,y+4,7,1,'#5d8fd6');if(pend&&((t/450)|0)%2){R(x+8,y+2,2,3,'#ffd23f');}}
  else{R(x+2,y+3,6,3,'#2f9e5b');R(x+3,y+2,1,4,'#bff0cf');}
  R(x-1,y+13,14,2,'#d9dce3');
}
function drawDeskDecor(px,py,w){
  if(has('planta')){R(px+2,py-6,5,4,'#b5651d');R(px+1,py-11,7,5,'#3fae63');R(px+3,py-13,3,2,'#2f8f4e');}
  if(has('caneca')){R(px+w-7,py-6,4,4,'#f6f7f9');R(px+w-3,py-5,1,2,'#f6f7f9');R(px+w-6,py-5,2,1,'#2b59c3');}
  if(has('pato')){R(px+3,py-2,4,3,'#ffd23f');R(px+6,py-3,2,2,'#ffd23f');R(px+8,py-2,1,1,'#ff8c3b');}
  if(has('cafeteira')){R(px+w-14,py-10,6,8,'#3a3f4b');R(px+w-13,py-5,4,2,'#6b4426');}
  if(has('quadro')){R(px+w-10,py-14,8,7,'#6b4426');R(px+w-9,py-13,6,5,'#f6f7f9');R(px+w-8,py-11,4,1,'#2b59c3');}
}
function drawDeco(){
  const ev=eventoHoje();if(!ev||!ev.deco)return;const t=Date.now();
  if(ev.deco==='junina'||ev.deco==='carnaval'){const cols=ev.deco==='junina'?['#d6453d','#ffd23f','#2b59c3','#2f9e5b']:['#e85d9a','#ffd23f','#4fc3f7','#8e44ad'];
    for(let x=1;x<23;x++){const c=cols[x%4];for(let k=0;k<4;k++)R(x*T+4+k,T*2+1+k,8-2*k,1,c);}R(T,T*2,22*T,1,'#5a3420');}
  if(ev.deco==='carnaval'||ev.deco==='reveillon'){const cols=ev.deco==='carnaval'?['#e85d9a','#ffd23f','#4fc3f7','#2ecc71']:['#ffd23f','#f6f7f9','#d4af37'];for(let i=0;i<70;i++){const x=(i*97)%(22*T)+T,y=(i*53)%(12*T)+3*T;R(x,y,2,1,cols[i%cols.length]);}}
  if(ev.deco==='natal'){const px=T*1,py=T*12;R(px+6,py+8,4,6,'#6b4426');for(let k=0;k<4;k++)R(px+2+k*1,py-2+k*3-6,12-k*2,4,'#2f8f4e');R(px+7,py-12,2,2,'#ffd23f');for(let i=0;i<20;i++)R(T+i*T+4,T*2+1,2,2,['#d6453d','#ffd23f','#2ecc71','#4fc3f7'][(i+((t/500)|0))%4]);}
  if(ev.deco==='halloween'){for(const [x,y] of [[6,6],[12,10],[21,10],[4,10]]){R(x*T+3,y*T+6,10,8,'#e67e22');R(x*T+7,y*T+4,2,2,'#2f8f4e');R(x*T+5,y*T+8,2,2,'#1b1b1b');R(x*T+9,y*T+8,2,2,'#1b1b1b');R(x*T+6,y*T+11,4,1,'#1b1b1b');}}
  if(ev.deco==='bf'||ev.deco==='prog'){const txt=ev.deco==='bf'?'BLACK FRIDAY':'DIA 256';R(T*4,T+2,T*3+8,10,ev.deco==='bf'?'#111':'#2b59c3');ctx.fillStyle=ev.deco==='bf'?'#ffd23f':'#fff';ctx.font='6px "Press Start 2P", monospace';ctx.textBaseline='top';ctx.fillText(txt,T*4+3,T+4);}
  if(ev.deco==='pascoa'){for(const [x,y] of [[9,6],[17,9],[4,13]]){R(x*T+5,y*T+6,5,6,['#e85d9a','#4fc3f7','#ffd23f'][x%3]);R(x*T+5,y*T+8,5,1,'#fff');}}
}
/* ---- personagens ---- */
function lookOf(id){
  if(id==='eu'||id==='player'){const r=LOJA.roupas.find(x=>x.id===S.roupa)||LOJA.roupas[0];
    return {skin:S.look.skin,hair:S.look.hair,style:S.look.style,shirt:r.shirt,jacket:r.jacket,tie:r.tie,collar:r.collar,hood:r.hood,print:r.print,pants:'#2b3550',glasses:S.acess.includes('oculos'),headset:S.acess.includes('fone'),cracha:S.acess.includes('cracha')};}
  const n=NPCS[id];return {skin:n.skin,hair:n.hair,style:n.bald?'careca':n.long?'longo':'curto',shirt:n.shirt,tie:n.tie,pants:n.pants,glasses:n.glasses,headset:n.headset,cap:n.cap,beard:n.beard,collar:!!n.tie};
}
function drawChar(c,x0,y0,L,dir,frame,scale){
  const s=scale||1;const flip=dir==='right';
  const r=(x,y,w,h,col)=>{if(!col)return;const xx=flip?(12-x-w):x;c.fillStyle=col;c.fillRect(x0+xx*s,y0+y*s,w*s,h*s);};
  const side=dir==='left'||dir==='right';const up=dir==='up';
  const dark='#1b1f2a';const sleeve=L.jacket||L.shirt;
  const step=frame%2;
  // pernas
  const lift=frame>0,lA=lift&&step===1,lB=lift&&step===0;
  if(side){r(4,14,2,lA?3:4,L.pants);r(6,14,2,lB?3:4,L.pants);r(4,lA?17:18,3,1,dark);r(6,lB?17:18,3,1,dark);}
  else{r(3,14,2,lA?3:4,L.pants);r(7,14,2,lB?3:4,L.pants);r(3,lA?17:18,2,1,dark);r(7,lB?17:18,2,1,dark);}
  // tronco
  if(side){r(3,9,6,5,L.shirt);if(L.jacket){r(3,9,6,5,L.jacket);r(3,9,1,2,L.shirt);}const ao=lift?(step?1:-1):0;r(5+ao,10,2,3,sleeve);r(5+ao,13,2,1,L.skin);}
  else{r(2,9,8,5,L.shirt);
    if(L.hood&&!up)r(2,9,8,1,'#3a414e');
    if(L.jacket){r(2,9,3,5,L.jacket);r(7,9,3,5,L.jacket);}
    if(!up){if(L.collar){r(4,9,1,1,'#ffffff');r(7,9,1,1,'#ffffff');}if(L.tie)r(5,10,2,4,L.tie);if(L.print){r(4,11,4,1,'#ffd23f');r(4,12,2,1,'#4fc3f7');}if(L.cracha)r(8,11,1,2,'#d4af37');}
    r(1,9,1,4,sleeve);r(10,9,1,4,sleeve);r(1,13,1,1,L.skin);r(10,13,1,1,L.skin);}
  if(L.hood&&up)r(2,7,8,3,'#3a414e');
  // cabeça
  r(2,1,8,8,L.skin);
  const H=L.hair;
  if(L.style==='careca'){r(2,3,1,3,H);r(9,3,1,3,H);if(!up)r(4,1,2,1,'#ffffff55');if(up)r(2,3,8,3,H);}
  else{
    r(2,0,8,3,H);
    if(up){r(2,0,8,7,H);if(L.style==='longo')r(2,7,8,3,H);}
    else if(side){r(7,1,3,6,H);if(L.style==='longo')r(7,6,3,4,H);}
    else{r(2,3,1,2,H);r(9,3,1,2,H);if(L.style==='longo'){r(1,3,2,7,H);r(9,3,2,7,H);}}
  }
  if(L.cap){r(2,-1,8,3,'#2b59c3');if(!up&&!side)r(1,2,10,1,'#1f3f8f');if(side)r(0,2,3,1,'#1f3f8f');}
  if(!up){
    if(side){r(3,5,1,1,dark);if(L.glasses){r(2,4,3,1,'#2a2d35');}}
    else{r(4,5,1,1,dark);r(7,5,1,1,dark);r(5,7,2,1,'#00000033');if(L.glasses){r(3,4,3,1,'#2a2d35');r(6,4,3,1,'#2a2d35');r(3,6,3,1,'#2a2d3588');r(6,6,3,1,'#2a2d3588');}}
    if(L.beard){if(side)r(2,6,5,3,H);else{r(3,6,6,3,H);r(5,7,2,1,'#c0806066');}}
  }
  if(L.headset){r(1,3,1,4,'#222');r(10,3,1,4,'#222');r(2,-1,8,1,'#222');if(!up&&!side)r(2,7,2,1,'#222');}
}
function drawPortrait(canvas,id){
  const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;c.clearRect(0,0,canvas.width,canvas.height);
  const s=canvas.width/14;drawChar(c,s*1,s*2,lookOf(id),'down',0,s);
}
function drawShadow(px,py){ctx.fillStyle='rgba(20,25,40,.28)';ctx.fillRect(px+3,py+13,10,2);ctx.fillRect(px+4,py+12,8,1);}
function bubble(px,py,txt,col){ctx.fillStyle=col||'#fff';ctx.fillRect(px+4,py-15,9,8);ctx.fillRect(px+6,py-7,2,2);ctx.fillStyle='#1b2233';
  if(txt==='!'){ctx.fillRect(px+8,py-14,1,4);ctx.fillRect(px+8,py-9,1,1);}
  else if(txt==='book'){ctx.fillStyle='#2b59c3';ctx.fillRect(px+5,py-14,3,5);ctx.fillRect(px+9,py-14,3,5);ctx.fillStyle='#ffffff';ctx.fillRect(px+6,py-13,1,3);ctx.fillRect(px+10,py-13,1,3);}else{ctx.fillRect(px+6,py-11,1,1);ctx.fillRect(px+8,py-11,1,1);ctx.fillRect(px+10,py-11,1,1);}}

/* ================= LOOP ================= */
let keys={},lastT=0,paused=true,inPC=false,frameN=0;
function npcHasDueToday(id){return S.missoes.some(e=>{const m=getM(e);return m&&m.from===id&&e.due<=S.dia;});}
function render(){
  ctx.clearRect(0,0,cv.width,cv.height);
  drawWalls();drawFloor();
  const items=[];
  furn.forEach(f=>items.push({z:f.y*T+(f.behind?-8:(f.type==='vidroH'?6:4)),fn:()=>drawFurn(f)}));
  const chars=[...Object.values(npcs),player];
  chars.forEach(ch=>items.push({z:ch.py+8,fn:()=>{
    drawShadow(ch.px,ch.py);
    const L=ch===player?lookOf('eu'):lookOf(ch.id);
    drawChar(ctx,ch.px+2,ch.py-6,L,ch.dir,ch.moving?1+(((ch.anim||0)*6)|0)%2:0,1);
    if(ch!==player){
      if(ch.id==='tereza'&&S.tereza&&terezaDisponivel()){bubble(ch.px,ch.py,'book','#bfe6ff');}
      else if(npcHasDueToday(ch.id))bubble(ch.px,ch.py,'!','#ffd23f');
      else if(S.falou[ch.id]!==S.dia&&!paused)bubble(ch.px,ch.py,'…','#ffffff');
    }}}));
  items.sort((a,b)=>a.z-b.z).forEach(i=>i.fn());
  drawDeco();
  if(S.minuto>=1080){ctx.fillStyle=`rgba(20,30,70,${Math.min(.28,(S.minuto-1080)/400)})`;ctx.fillRect(0,0,cv.width,cv.height);}
  const tgt=alvo();if(tgt&&!paused){const [tx,ty]=tgt.pos;R(tx*T+5,ty*T-10,7,7,'#1b2233');ctx.fillStyle='#ffd23f';ctx.font='5px "Press Start 2P", monospace';ctx.textBaseline='top';ctx.fillText('E',tx*T+6,ty*T-9);}
}
function alvo(){
  const d={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[player.dir];
  const x=player.x+d[0],y=player.y+d[1];
  for(const k in npcs){const n=npcs[k];if(n.x===x&&n.y===y)return {t:'npc',id:k,label:`Falar com ${NPCS[k].nome} (${NPCS[k].cargo})`,pos:[x,y]};}
  if(y>=0&&y<MH&&x>=0&&x<MW&&inter[y][x])return {...inter[y][x],pos:[x,y]};
  return null;
}
function stepChar(ch,dt,speed){
  if(!ch.moving)return;
  ch.anim=(ch.anim||0)+dt;
  const tx=ch.tx*T,ty=ch.ty*T;const v=speed*T*dt;
  const dx=tx-ch.px,dy=ty-ch.py;const dist=Math.hypot(dx,dy);
  if(dist<=v){ch.px=tx;ch.py=ty;ch.x=ch.tx;ch.y=ch.ty;ch.tx=undefined;ch.ty=undefined;ch.moving=false;}
  else{ch.px+=dx/dist*v;ch.py+=dy/dist*v;}
}
const DIRS={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
function heldDir(){
  if(keys.ArrowUp||keys.KeyW||keys.dUp)return'up';if(keys.ArrowDown||keys.KeyS||keys.dDown)return'down';
  if(keys.ArrowLeft||keys.KeyA||keys.dLeft)return'left';if(keys.ArrowRight||keys.KeyD||keys.dRight)return'right';return null;
}
function update(dt){
  if(!paused){
    if(!player.moving){const d=heldDir();if(d){player.dir=d;const [dx,dy]=DIRS[d];const nx=player.x+dx,ny=player.y+dy;if(!blocked(nx,ny,'player')){player.tx=nx;player.ty=ny;player.moving=true;}else player.anim=0;}}
    stepChar(player,dt,5.5);
    for(const k in npcs){const n=npcs[k];
      if(n.wander&&!n.moving){n.timer-=dt;if(n.timer<=0){n.timer=1.5+Math.random()*4;const ds=Object.keys(DIRS);const d=ds[Math.floor(Math.random()*4)];const [dx,dy]=DIRS[d];n.dir=d;
        const nx=n.x+dx,ny=n.y+dy;const far=Math.abs(nx-n.home.x)+Math.abs(ny-n.home.y)>9;if(!far&&!blocked(nx,ny,n)&&!inter[ny][nx]){n.tx=nx;n.ty=ny;n.moving=true;}}}
      stepChar(n,dt,3);}
    const vel=inPC?1.1:2.2;
    S.minuto+=dt*vel;
    somNoite(S.minuto>=1080);
    if(S.minuto>=1080&&!S.aviso18){S.aviso18=true;toast('18:00. Expediente encerrado: saia pela porta quando quiser. Hora extra conta pontos com o chefe, mas cansa.');}
    if(S.minuto>=1260){S.minuto=1260;fimDoDia(true);}
    updateHud();
  }else if(inPC){S.minuto+=dt*1.1;if(S.minuto>=1260)S.minuto=1260;updateClock();}
}
function loop(t){
  const dt=Math.min(.05,(t-lastT)/1000||0);lastT=t;frameN++;
  if(S){update(dt);render();}
  requestAnimationFrame(loop);
}

/* ================= HUD ================= */
function updateClock(){$('#hClock').textContent=horaStr(S.minuto);}
let lastHud='';
function updateHud(){
  updateClock();
  const ev=eventoHoje();
  const key=[S.dia,Math.round(S.dinheiro),S.energia,S.xp,S.cargo,S.missoes.length,S.chefe,JSON.stringify(S.skills),S.salario,S.missoes.map(m=>m.due).join()].join('|');
  if(key===lastHud)return;lastHud=key;
  $('#hDay').textContent=`Dia ${S.dia} · ${mesDoDia(S.dia)}${ev?' · '+ev.nome:''}`;
  $('#hMoney').textContent=brl(S.dinheiro);
  $('#hMoney').classList.toggle('neg',S.dinheiro<0);
  $('#meNome').textContent=S.nome;$('#meCargo').textContent=CARREIRA[S.cargo].nome;$('#meSal').textContent=brl(S.salario)+' por mês (pago a cada 4 dias)';
  setBar('#barEnergia',S.energia/100,S.energia);setBar('#barChefe',S.chefe/100,S.chefe);
  drawPortrait($('#mePort'),'eu');
  const sk=[['sql','SQL'],['py','Python'],['negocio','Negócio'],['com','Comunicação']];
  $('#skills').innerHTML=sk.map(([k,n])=>`<div class="sk"><span>${n}</span><span class="lv">nv ${lvl(S.skills[k])}</span><div class="bar"><i style="width:${Math.round(lvlProg(S.skills[k])*100)}%"></i></div></div>`).join('');
  const ms=S.missoes.map(e=>({e,m:getM(e)})).filter(x=>x.m);
  $('#missList').innerHTML=ms.length?ms.map(({e,m})=>`<li><span class="due ${dueCls(e)}">${dueTxt(e)}</span><span class="mt">${m.title}</span><span class="mf">${NPCS[m.from].nome}</span></li>`).join(''):'<li class="empty">Nenhuma demanda aberta. Converse com as áreas ou espere o próximo dia.</li>';
  $('#missCount').textContent=ms.length;
  const pode=podePromover();$('#btnCarreira').classList.toggle('glow',pode.ok&&S.cargo<5);
}
function setBar(sel,p,v){const el=$(sel);el.querySelector('i').style.width=clamp(p,0,1)*100+'%';el.querySelector('b').textContent=Math.round(v);el.classList.toggle('low',p<.25);}
function dueTxt(e){const d=e.due-S.dia;return d<0?'Atrasada':d===0?'Hoje':d===1?'Amanhã':`Em ${d} dias`;}
function dueCls(e){const d=e.due-S.dia;return d<=0?'hot':d===1?'warm':'';}
let toastT=null;
function toast(msg,kind){const box=$('#toasts');while(box.children.length>=3)box.firstChild.remove();const el=document.createElement('div');el.className='toast '+(kind||'');el.textContent=msg;$('#toasts').appendChild(el);setTimeout(()=>el.classList.add('out'),3800);setTimeout(()=>el.remove(),4300);}

/* ================= MISSÕES ================= */
const PAY=[90,160,280,450,700,900],XPT=[30,45,70,100,140,160];
function getM(e){
  if(e.ref.startsWith('rec:')){const [,k,vi]=e.ref.split(':');const r=RECORRENTES[k];const v=r.variants[+vi];
    return {id:e.ref,rec:k,tier:Math.min(S.cargo,3),from:r.from,kind:r.lang,lang:r.lang,title:r.nome,brief:v.brief,solution:v.solution,starter:'',hint:r.lang==='sql'?'Uma consulta simples com SUM, COUNT ou WHERE resolve.':'Selecione a coluna e use sum() ou mean().',
      insight:'Tarefa repetitiva é candidata a automação. Depois de 3 entregas e com Python suficiente, compre a automação na loja e nunca mais faça este relatório na mão.'};}
  if(e.ref.startsWith('evt:')){const k=e.ref.slice(4);return {id:e.ref,evt:k,tier:Math.min(S.cargo,3),...MISSOES_EVENTO[k],starter:''};}
  return MISSOES.find(m=>m.id===e.ref);
}
function rewardOf(m,e){
  let pay=m.rec?70+30*S.cargo:PAY[m.tier];let xp=m.rec?20:XPT[m.tier];
  if(m.evt)pay*=2;
  if(e&&e.revisao){pay*=.5;xp*=.5;}
  const ev=eventoHoje();if(ev&&ev.mult)pay*=ev.mult;
  if(has('quadro'))pay*=1.05;if(has('monitor2'))xp*=1.15;if(S.autos.includes('a_etl'))xp*=1.1;
  return {pay:Math.round(pay),xp:Math.round(xp)};
}
function poolDisponivel(from){
  const ativos=new Set(S.missoes.map(e=>e.ref));
  let p=MISSOES.filter(m=>m.tier<=S.cargo&&!S.feitas[m.id]&&!ativos.has(m.id)&&(!from||m.from===from));
  const novas=p.filter(m=>m.tier>=S.cargo-1);if(novas.length)p=novas;
  if(!p.length){p=MISSOES.filter(m=>m.tier<=S.cargo&&m.tier>=S.cargo-1&&!ativos.has(m.id)&&(!from||m.from===from)).map(m=>({...m,_rev:true}));}
  return p;
}
function addMissao(m,dueExtra){
  const due=S.dia+(dueExtra!=null?dueExtra:(m.kind==='quiz'||m.kind==='fill'?1:2));
  const e={uid:S.uid++,ref:m.id,due,start:S.dia,wrong:0,gab:false,draft:null};if(m._rev)e.revisao=true;
  S.missoes.push(e);return e;
}
function gerarMissoesDoDia(){
  // recorrente
  if(S.cargo>=1){
    const recs=Object.keys(RECORRENTES).filter(k=>!LOJA.automacoes.some(a=>a.rec===k&&S.autos.includes(a.id)));
    const ativos=S.missoes.filter(e=>e.ref.startsWith('rec:')).length;
    if(recs.length&&ativos===0){const k=recs[S.dia%recs.length];const vi=S.dia%RECORRENTES[k].variants.length;S.missoes.push({uid:S.uid++,ref:`rec:${k}:${vi}`,due:S.dia,start:S.dia,wrong:0,gab:false,draft:null});}
  }
  const ev=eventoHoje();
  if(ev&&ev.missao&&!S.missoes.some(e=>e.ref==='evt:'+ev.missao)){S.missoes.push({uid:S.uid++,ref:'evt:'+ev.missao,due:S.dia,start:S.dia,wrong:0,gab:false,draft:null});}
  const regulares=S.missoes.filter(e=>!e.ref.includes(':')).length;
  let novas=Math.max(0,Math.min(2,4-regulares));
  if(S.dia===1)novas=3;
  for(let i=0;i<novas;i++){const p=poolDisponivel();if(!p.length)break;
    const prefer=p.filter(m=>m.tier===S.cargo);const src=prefer.length&&Math.random()<.7?prefer:p;
    addMissao(src[Math.floor(Math.random()*src.length)]);}
}
const expCache=new Map();
function solutionCode(m){if(m.kind==='fill'){let i=0;return m.template.replace(/___/g,()=>m.answers[i++]);}return m.solution;}
function expected(m){const code=solutionCode(m);if(!expCache.has(code))expCache.set(code,runCode(m.lang,code).result);return expCache.get(code);}
function custoEnergia(){return has('cadeira')?10:15;}
function concluir(e,extra){
  const m=getM(e);const rw=rewardOf(m,e);
  let pay=rw.pay,xp=rw.xp;
  const rapido=e.start===S.dia&&!e.revisao;
  if(rapido){pay=Math.round(pay*1.2);}
  const penal=e.gab?.3:Math.max(.4,1-.15*e.wrong);
  pay=Math.round(pay*penal);xp=Math.round(xp*penal);
  S.dinheiro+=pay;S.xp+=xp;
  if(m.kind==='quiz')S.skills.negocio+=xp;else{S.skills[m.lang==='sql'?'sql':'py']+=xp;S.skills.negocio+=Math.round(xp*.25);}
  S.skills.com+=5;
  const dept=DEPT_OF[m.from];if(dept)S.rep[dept]=clamp(S.rep[dept]+(e.gab?1:4),0,100);
  S.chefe=clamp(S.chefe+(m.from==='chefe'?4:1)+(rapido?1:0),0,100);
  S.energia=clamp(S.energia-custoEnergia(),0,100);
  S.feitas[m.id]=(S.feitas[m.id]||0)+1;S.totalFeitas++;
  if(m.rec)S.recFeitos[m.rec]++;
  S.missoes=S.missoes.filter(x=>x.uid!==e.uid);
  S.hoje.entregas.push(m.title);S.hoje.ganhos+=pay;S.hoje.xp+=xp;
  S.histor.unshift({dia:S.dia,t:m.title,from:m.from,pay,xp});S.histor=S.histor.slice(0,40);
  salvar();lastHud='';updateHud();
  if(podePromover().ok&&S.cargo<5&&S.avisoPromo!==S.dia){S.avisoPromo=S.dia;setTimeout(()=>toast('Você cumpre os requisitos de promoção! Converse com o Seu Ronaldo.','gold'),600);}
  return {pay,xp,rapido,m};
}

/* ================= DIÁLOGO ================= */
let dlgQueue=[],dlgDone=null,typing=null;
function nomeDe(id){return id==='eu'?S.nome:NPCS[id].nome;}
function falar(lines,done){dlgQueue=lines.slice();dlgDone=done||null;paused=true;$('#dialog').hidden=false;
  const quem=lines.find(l=>Array.isArray(l)&&l[0]!=='eu'&&NPCS[l[0]]);somTocar(quem?quem[0]:musicaAmbiente());proxFala();}
function aplicarFx(fx){if(!fx)return;
  if(fx.com)S.skills.com+=fx.com;if(fx.negocio)S.skills.negocio+=fx.negocio;if(fx.energia)S.energia=clamp(S.energia+fx.energia,0,100);
  if(fx.boss)S.chefe=clamp(S.chefe+fx.boss,0,100);if(fx.dinheiro)S.dinheiro+=fx.dinheiro;
  if(fx.rep)for(const d in fx.rep)S.rep[d]=clamp(S.rep[d]+fx.rep[d],0,100);
  const parts=[];if(fx.com)parts.push(`+${fx.com} XP Comunicação`);if(fx.negocio)parts.push(`+${fx.negocio} XP Negócio`);if(fx.energia)parts.push(`${fx.energia>0?'+':''}${fx.energia} energia`);if(fx.boss)parts.push(`chefe ${fx.boss>0?'+':''}${fx.boss}`);if(fx.dinheiro)parts.push(`${fx.dinheiro>0?'+':''}${brl(fx.dinheiro)}`);if(fx.rep)for(const d in fx.rep)parts.push(`${d} +${fx.rep[d]}`);
  if(parts.length)toast(parts.join(' · '));lastHud='';updateHud();}
function proxFala(){
  const box=$('#dialog');const ch=$('#dlgChoices');ch.innerHTML='';
  if(!dlgQueue.length){box.hidden=true;paused=modalAberto();const d=dlgDone;dlgDone=null;salvar();somTocar(musicaAmbiente());if(d)d();return;}
  const l=dlgQueue.shift();
  if(l.q){
    $('#dlgName').textContent=S.nome;drawPortrait($('#dlgPort'),'eu');$('#dlgText').textContent=l.q;$('#dlgNext').hidden=true;
    l.opts.forEach((o,i)=>{const b=document.createElement('button');b.className='choice';b.textContent=o.t;b.onclick=()=>{if(o.fn)o.fn();aplicarFx(o.fx);if(o.r)dlgQueue.unshift(...o.r);proxFala();};ch.appendChild(b);if(i===0)setTimeout(()=>b.focus(),30);});
    return;}
  const [who,txt,_,fx]=l;
  $('#dlgName').textContent=who==='eu'?S.nome:`${NPCS[who].nome} · ${NPCS[who].cargo}`;
  drawPortrait($('#dlgPort'),who);
  const full=txt.replace(/\{nome\}/g,S.nome);
  $('#dlgNext').hidden=false;
  if(fx)aplicarFx(fx);
  if(reduceMotion){$('#dlgText').textContent=full;typing=null;return;}
  let i=0;const el=$('#dlgText');el.textContent='';clearInterval(typing);
  typing=setInterval(()=>{i+=2;el.textContent=full.slice(0,i);if(/\S/.test(full.charAt(i-1)))somBlip(who);if(i>=full.length){clearInterval(typing);typing=null;}},16);
  el.dataset.full=full;
}
function avancar(){if(typing){clearInterval(typing);typing=null;$('#dlgText').textContent=$('#dlgText').dataset.full;return;}if($('#dlgChoices').children.length)return;proxFala();}

/* ================= INTERAÇÕES ================= */
function interagir(){
  const a=alvo();if(!a)return;
  if(a.t==='npc'){const n=npcs[a.id];const inv={up:'down',down:'up',left:'right',right:'left'}[player.dir];if(n&&!(a.id==='chefe'))n.dir=inv;if(a.id==='chefe')return falarChefe();if(a.id==='tereza')return falarTereza();return falarNpc(a.id);}
  if(a.t==='pc')return abrirPC();
  if(a.t==='cafe')return cafe();
  if(a.t==='porta')return porta();
  if(a.t==='carreira')return abrirCarreira();
  if(a.t==='obj')return objeto(a.id);
}
function falarNpc(id){
  const primeira=S.falou[id]!==S.dia;
  const linhas=[];
  const dept=DEPT_OF[id];
  if(S.aniversario===id&&primeira)linhas.push([id,'Hoje é meu aniversário! Tem bolo na copa, pode pegar. 🎂']);
  const pend=S.missoes.map(e=>({e,m:getM(e)})).find(x=>x.m&&x.m.from===id);
  if(pend){const d=pend.e.due-S.dia;linhas.push([id,d<=0?`E aquele “${pend.m.title}”? O prazo é hoje, hein!`:`Tô esperando o “${pend.m.title}”. Sem pressa… mas com pressa.`]);}
  else linhas.push([id,FALAS[id][Math.floor(Math.random()*FALAS[id].length)]]);
  if(primeira){S.falou[id]=S.dia;linhas.push(['eu',`(Bom papo. +8 XP de Comunicação${dept?`, ${dept} +2`:''}.)`,null,{com:8,...(dept?{rep:{[dept]:2}}:{})}]);}
  if(dept||id==='fabio'||id==='kevin'){
    linhas.push({q:'Algo mais?',opts:[{t:'Tem alguma demanda para mim?',fn:()=>pedirDemanda(id)},{t:'Só passando. Até mais!'}]});}
  falar(linhas);
}
function falarTereza(){
  const linhas=[];const primeira=S.falou.tereza!==S.dia;
  if(primeira){S.falou.tereza=S.dia;}
  if(terezaDisponivel()){const a=aulaDeHoje();linhas.push(['tereza',S.tereza.idx>=TEREZA.length?`Você já viu todas as minhas aulas! Hoje vamos revisar: “${a.titulo}”.`:`Bom dia, ${S.nome}! A aula de hoje é: “${a.titulo}”. Leva uns minutinhos.`]);
    linhas.push({q:'Vamos?',opts:[{t:'Bora, quero a aula de hoje',fn:()=>{dlgDone=()=>abrirAulaTereza(a,true);}},{t:'Rever aulas anteriores',fn:()=>{dlgDone=()=>abrirPC('caderno');}},{t:'Agora não, depois eu volto'}]});}
  else{linhas.push(['tereza',FALAS.tereza[Math.floor(Math.random()*FALAS.tereza.length)]]);linhas.push(['tereza','A aula de hoje já foi. Amanhã tem outra! As anteriores ficam no seu computador, em “Aulas da Tereza”.']);
    linhas.push({q:'Algo mais?',opts:[{t:'Abrir minhas aulas anteriores',fn:()=>{dlgDone=()=>abrirPC('caderno');}},{t:'Só passando'}]});}
  falar(linhas);
}
function apresentarTereza(){
  S.tereza.apresentada=true;
  falar([['chefe','Atenção, pessoal! Esta é a Tereza, nossa nova cientista de dados sênior.'],['tereza','Oi! Vou ficar naquela mesa perto do TI.'],['tereza','Todo dia eu preparo uma aula curta de código, de SQL e de Python. Passa lá quando aparecer o livrinho em cima da minha cabeça.'],['kevin','Tem prova?'],['tereza','Tem desafio. E vale XP.'],['eu','(Os cursos da loja também ganharam aulas de verdade, com exemplos para executar. Ficam no computador, na aba Cursos.)']]);
}
function musicaAmbiente(){const ev=eventoHoje();return ev&&ev.deco&&ev.deco!=='halloween'?'festa':'escritorio';}
function pedirDemanda(id){
  if(S.missoes.length>=6){dlgQueue.unshift([id,'Você já tá com a caixa cheia. Entrega o que tem primeiro!']);return;}
  const p=poolDisponivel(id).filter(m=>!m._rev);
  if(!p.length){dlgQueue.unshift([id,'Por enquanto não tenho nada no seu nível. Volta outro dia!']);return;}
  const m=p[Math.floor(Math.random()*p.length)];addMissao(m);lastHud='';updateHud();
  dlgQueue.unshift([id,`Tenho sim: “${m.title}”. Mandei no seu e-mail. Prazo de ${m.kind==='quiz'||m.kind==='fill'?'1 dia':'2 dias'}.`]);
}
function falarChefe(){
  const linhas=[];const primeira=S.falou.chefe!==S.dia;
  linhas.push(['chefe',primeira?FALAS.chefe[Math.floor(Math.random()*FALAS.chefe.length)]:'Pois não?']);
  if(primeira){S.falou.chefe=S.dia;S.skills.com+=5;}
  linhas.push({q:'Sobre o que você quer falar?',opts:[
    {t:'Quero conversar sobre promoção',fn:pedirPromocao},
    {t:'Quero pedir um aumento',fn:pedirAumento},
    {t:'Como estou indo?',fn:()=>{const a=avgRep();dlgQueue.unshift(['chefe',S.chefe>=70?'Está indo muito bem. As áreas elogiam seu trabalho.':S.chefe>=45?'Está no caminho. Entregue no prazo e converse mais com as áreas.':'Preciso de mais entregas no prazo. Atraso pega mal com as áreas.'],['chefe',`Reputação média com as áreas: ${a}. Minha confiança em você: ${S.chefe}.`]);}},
    {t:'Nada não, só passando'}]});
  falar(linhas);
}
function podePromover(){
  if(S.cargo>=5)return{ok:false,falta:[]};
  const r=CARREIRA[S.cargo+1].req;const falta=[];
  const chk=(cond,txt)=>{if(!cond)falta.push(txt);};
  chk(S.xp>=r.xp,`${r.xp} XP total (você tem ${S.xp})`);
  chk(S.totalFeitas>=r.missoes,`${r.missoes} entregas (você tem ${S.totalFeitas})`);
  if(r.sql)chk(lvl(S.skills.sql)>=r.sql,`SQL nível ${r.sql}`);
  if(r.py)chk(lvl(S.skills.py)>=r.py,`Python nível ${r.py}`);
  if(r.negocio)chk(lvl(S.skills.negocio)>=r.negocio,`Negócio nível ${r.negocio}`);
  if(r.com)chk(lvl(S.skills.com)>=r.com,`Comunicação nível ${r.com}`);
  if(r.rep)chk(avgRep()>=r.rep,`reputação média ${r.rep} com as áreas (hoje ${avgRep()})`);
  if(r.auto)chk(S.autos.length>=r.auto,`${r.auto} automações rodando`);
  return{ok:!falta.length,falta};
}
function pedirPromocao(){
  if(S.cargo>=5){dlgQueue.unshift(['chefe','Promoção? Você é Head de Dados. A próxima é a minha cadeira, e ela não está vaga.']);return;}
  const p=podePromover();
  if(!p.ok){dlgQueue.unshift(['chefe',`Para ${CARREIRA[S.cargo+1].nome} ainda falta: ${p.falta.slice(0,3).join('; ')}.`],['chefe','O quadro de metas na parede tem tudo. Volte quando estiver pronto(a).']);return;}
  const novo=S.cargo+1;
  dlgQueue.unshift(['chefe','Olha… eu estava esperando você vir aqui.'],['chefe',`A partir de hoje você é ${CARREIRA[novo].nome}! Parabéns!`],['chefe',S.cargo===0?'E chega de bancada: você ganhou mesa própria no open space.':novo===3?'Sua nova mesa fica perto da minha sala. Para eu te chamar mais fácil.':novo===4?'Aquela sala de reunião com vidro agora é sua. Não deixe o Kevin cochilar lá.':'Agora você responde direto para a diretoria. Que a força esteja com você.'],
    ['eu',`Novo salário: ${brl(Math.max(S.salario*1.1,CARREIRA[novo].salario))}. Novo crachá. Nova mesa.`,null]);
  const done=()=>{S.cargo=novo;S.salario=Math.round(Math.max(S.salario*1.1,CARREIRA[novo].salario)/10)*10;S.chefe=clamp(S.chefe+5,0,100);
    const d=deskAtual();buildMap();player.x=d.cx;player.y=d.cy;player.px=d.cx*T;player.py=d.cy*T;player.dir='up';lastHud='';updateHud();salvar();toast(`Promoção! Agora você é ${CARREIRA[novo].nome}.`,'gold');somEfeito('promocao');confete();};
  const prev=dlgDone;dlgDone=()=>{done();if(prev)prev();};
}
function pedirAumento(){
  if(S.dia-S.ultimoAumento<6){dlgQueue.unshift(['chefe','Já conversamos sobre isso há pouco tempo. Volte daqui a alguns dias, com resultados.']);return;}
  S.ultimoAumento=S.dia;
  const score=S.chefe*.55+avgRep()*.3+lvl(S.skills.com)*4+Math.min(10,S.hoje.entregas.length*3);
  const chance=clamp((score-38)/40,.05,.92);
  if(Math.random()<chance){const pct=8+Math.floor(Math.random()*8);const novo=Math.round(S.salario*(1+pct/100)/10)*10;
    dlgQueue.unshift(['chefe','Hmm. Deixa eu ver seus números…'],['chefe',`Você tem entregado. E o Jorge disse que fecha. Aumento de ${pct}%!`],['eu',`Salário: ${brl(S.salario)} → ${brl(novo)}.`]);
    S.salario=novo;S.chefe=clamp(S.chefe-3,0,100);}
  else{const f=[['O orçamento está congelado. Literalmente: o Jorge guardou na geladeira.'],['Que tal um aumento… de responsabilidades? Parabéns! Pronto.'],['Agora não dá. Mas olha: vale-pizza na sexta!']];
    dlgQueue.unshift(['chefe',f[Math.floor(Math.random()*f.length)][0]],['eu','(Não rolou. Melhore a moral com o chefe e a reputação com as áreas, e tente de novo em alguns dias.)']);S.chefe=clamp(S.chefe-2,0,100);}
  lastHud='';updateHud();
}
function cafe(){
  const preco=has('cafeteira')?0:has('caneca')?4:8;
  if(S.energia>=100){falar([['eu','Mais café agora e eu começo a enxergar sons.']]);return;}
  if(S.dinheiro<preco){falar([['eu','Sem dinheiro nem para o café. Hora de entregar alguma coisa.']]);return;}
  S.dinheiro-=preco;S.energia=clamp(S.energia+30,0,100);lastHud='';updateHud();somEfeito('cafe');
  const f=['Café passado. +30 de energia.','O café da Neide. Forte o suficiente para compilar sozinho. +30 de energia.','Cafeína: o ETL do corpo humano. +30 de energia.'];
  toast(f[Math.floor(Math.random()*f.length)]+(preco?` (${brl(preco)})`:''));salvar();
}
function objeto(id){
  const O={
    geladeira:[['eu','Um iogurte com etiqueta: “NEIDE. NÃO MEXA. TEM CÂMERA.”'],['eu','Não tem câmera. Mas ninguém arrisca.']],
    pia:[['eu','Pilha de canecas sujas. Uma delas diz “Melhor analista do mundo”. Ninguém assume.']],
    mesacopa:S.aniversario?[['eu',`Bolo de aniversário de ${NPCS[S.aniversario].nome}! +15 de energia.`,null,{energia:15}]]:[['eu','Um pão de queijo esquecido da última reunião. Respeite o pão de queijo.']],
    impressora:[['eu','A impressora pisca: “PC LOAD LETTER”. Ninguém sabe o que significa. Nem ela.']],
    bebedouro:S.falou.bebedouro!==S.dia?[['eu',['Rádio-corredor: dizem que a diretoria quer “um dashboard que responda tudo”. Boa sorte.','Rádio-corredor: o Carlão vendeu um notebook para o próprio cunhado e contou como “cliente novo”.','Rádio-corredor: a TartaLog vai ser renegociada. Dados da Neide, você sabe.','Rádio-corredor: dizem que quem fala com todas as áreas cresce mais rápido aqui.'][S.dia%4],null,{com:5}]]:[['eu','Água. Hidratação também é soft skill.']],
    rack:[['fabio','NÃO ENCOSTA NO SERVIDOR.'],['eu','Eu só estava olhando.'],['fabio','É assim que começa.']],
    reuniao:[['eu','A sala de reunião. Aqui, 1 hora vira 2 e uma decisão vira outra reunião.']],
    bancada:[['kevin','Saudades da gente na bancada?'],['eu','…do ar-condicionado batendo na nuca? Não muito.']],
    autos:[['eu',`Automações rodando: ${S.autos.map(a=>LOJA.automacoes.find(x=>x.id===a).nome).join(', ')}. Renda passiva: ${brl(rendaAutos())} por dia.`]]
  };
  if(id==='bebedouro')S.falou.bebedouro=S.dia;
  falar(O[id]||[['eu','…']]);
}
function porta(){
  if(S.minuto<17*60){falar([{q:`Ainda são ${horaStr(S.minuto)}. Sair mais cedo? O chefe vai notar.`,opts:[{t:'Sair mesmo assim',fn:()=>{S.chefe=clamp(S.chefe-3,0,100);dlgDone=()=>fimDoDia(false);}},{t:'Voltar ao trabalho'}]}]);return;}
  falar([{q:'Encerrar o dia e ir para casa?',opts:[{t:'Ir para casa',fn:()=>{dlgDone=()=>fimDoDia(false);}},{t:'Ficar mais um pouco'}]}]);
}
function rendaAutos(){return S.autos.reduce((a,id)=>a+LOJA.automacoes.find(x=>x.id===id).renda,0);}

/* ================= DIAS ================= */
function fimDoDia(forcado){
  somEfeito('porta');fecharModal(true);$('#dialog').hidden=true;dlgQueue=[];
  paused=true;
  const horaExtra=S.minuto>=19*60&&!forcado;if(horaExtra)S.chefe=clamp(S.chefe+2,0,100);
  // atrasos
  const venc=S.missoes.filter(e=>e.due<=S.dia);
  venc.forEach(e=>{const m=getM(e);const dept=DEPT_OF[m.from];if(dept)S.rep[dept]=clamp(S.rep[dept]-(m.rec?4:7),0,100);S.chefe=clamp(S.chefe-(m.from==='chefe'?7:4),0,100);S.hoje.atrasos.push(`${m.title} (${NPCS[m.from].nome})`);});
  S.missoes=S.missoes.filter(e=>e.due>S.dia);
  const renda=rendaAutos();
  if(renda){S.dinheiro+=renda;S.autos.forEach(id=>{const a=LOJA.automacoes.find(x=>x.id===id);if(a.dept)S.rep[a.dept]=clamp(S.rep[a.dept]+1,0,100);});}
  let pag=null;
  if(S.dia%4===0){const contas=Math.round(S.salario*.55/10)*10;S.dinheiro+=S.salario-contas;pag={sal:S.salario,contas};}
  let decimo=null;const ev=eventoHoje();if(ev&&ev.bonus&&ev.bonus.decimo){S.dinheiro+=S.salario;decimo=S.salario;}
  const h=S.hoje;
  const body=`
    <div class="sum">
      <p class="sum-lead">${forcado?'21:00. O segurança apagou as luzes e te mandou para casa.':h.entregas.length?`Você entregou ${h.entregas.length} demanda${h.entregas.length>1?'s':''} hoje.`:'Nenhuma entrega hoje. Amanhã é outro dia.'}</p>
      <table class="ledger">
        ${h.entregas.map(t=>`<tr><td>Entregue</td><td>${t}</td></tr>`).join('')}
        ${h.atrasos.map(t=>`<tr class="bad"><td>Atrasou</td><td>${t}: a área ficou chateada</td></tr>`).join('')}
        ${horaExtra?'<tr class="good"><td>Hora extra</td><td>o chefe notou (+2 de moral)</td></tr>':''}
        <tr><td>Ganhos com missões</td><td class="num">${brl(h.ganhos)}</td></tr>
        <tr><td>XP do dia</td><td class="num">+${h.xp}</td></tr>
        ${renda?`<tr><td>Automações</td><td class="num">${brl(renda)}</td></tr>`:''}
        ${pag?`<tr class="good"><td>Salário</td><td class="num">${brl(pag.sal)}</td></tr><tr class="bad"><td>Boletos do mês (aluguel, mercado, internet)</td><td class="num">−${brl(pag.contas)}</td></tr>`:`<tr><td>Próximo salário</td><td>em ${4-S.dia%4} dia${4-S.dia%4>1?'s':''}</td></tr>`}
        ${decimo?`<tr class="good"><td>13º salário 🎄</td><td class="num">${brl(decimo)}</td></tr>`:''}
        <tr class="total"><td>Saldo</td><td class="num">${brl(S.dinheiro)}</td></tr>
      </table>
      ${S.chefe<20?'<p class="warn">Seu Ronaldo marcou uma “conversa rápida” para amanhã. Isso nunca é bom: entregue no prazo.</p>':''}
    </div>`;
  S.dia++;S.minuto=540;S.aviso18=false;S.energia=clamp(100+(has('planta')?10:0),0,110);S.hoje={entregas:[],ganhos:0,xp:0,atrasos:[]};
  const d=deskAtual();player.x=11;player.y=14;player.px=11*T;player.py=14*T;player.dir='up';player.moving=false;
  for(const k in npcs){const n=npcs[k];n.x=n.home.x;n.y=n.home.y;n.px=n.x*T;n.py=n.y*T;n.moving=false;n.dir='down';}
  salvar();lastHud='';updateHud();
  abrirModal(`Fim do dia ${S.dia-1}`,body,[{t:`Começar o dia ${S.dia}`,primary:true,fn:()=>{fecharModal(true);comecarDia();}}],{noClose:true});
}
function comecarDia(){
  S.aniversario=ANIVERSARIOS[semana(S.dia)]||null;
  gerarMissoesDoDia();
  const cenas=[];
  const ev=eventoHoje();
  if(S.dia===1){cenas.push(['chefe','Bem-vindo(a) à Tabelão S.A., {nome}! Eu sou o Seu Ronaldo, gerente de BI.'],['chefe','Sua mesa é a bancada ali embaixo, à esquerda, do lado do Kevin. Não toque no teclado dele.'],['chefe','As demandas das áreas chegam no seu computador. Cada uma tem prazo: atrasou, a área fica chateada. E eu também.'],['chefe','Salário cai a cada 4 dias. Café fica na copa. Aumento e promoção, na minha sala… quando você merecer.'],['kevin','Oi! Eu sou o Kevin. Se o servidor cair, não fui eu.'],['tereza','E eu sou a Tereza, cientista de dados. Todo dia tenho uma aula curta de código na minha mesa, perto do TI. Passa lá quando aparecer o livrinho!'],['eu','(Ande com as setas ou WASD. Aperte E ou Espaço perto das coisas e das pessoas para interagir.)']);}
  else{
    if(ev){if(ev.bonus){if(ev.bonus.energia)S.energia=clamp(S.energia+ev.bonus.energia,0,120);if(ev.bonus.dinheiro)S.dinheiro+=ev.bonus.dinheiro;}if(ev.cena)cenas.push(...ev.cena);}
    if(S.aniversario){cenas.push(['kevin',`Hoje é aniversário de ${NPCS[S.aniversario].nome}! Tem bolo na copa!`]);}
    if(S.chefe<20){cenas.push(['chefe','Precisamos conversar. As áreas reclamaram de atrasos.'],['chefe','Não vou te mandar embora, mas preciso ver entregas no prazo. Combinado?'],['eu','Combinado. (Moral com o chefe recuperada para 30.)']);S.chefe=30;}
    else if(!ev&&Math.random()<.5){const pend=CENAS_ALEATORIAS.filter(c=>!S.cenasVistas.includes(c));const pool=pend.length?pend:CENAS_ALEATORIAS;const c=pool[Math.floor(Math.random()*pool.length)];if(!pend.length)S.cenasVistas=[];S.cenasVistas.push(c);cenas.push(...CENAS[c]);}
  }
  if(S.dia===1&&S.tereza)S.tereza.apresentada=true;
  lastHud='';updateHud();salvar();somTocar(musicaAmbiente());
  const fim=()=>{paused=false;toast(`${S.missoes.length} demanda${S.missoes.length!==1?'s':''} na sua caixa de entrada. Vá até o seu computador.`);};
  if(cenas.length)falar(cenas,fim);else fim();
}

/* ================= MODAL ================= */
function modalAberto(){return !$('#modal').hidden;}
function abrirModal(title,html,actions,opts){
  opts=opts||{};paused=true;
  $('#modalTitle').textContent=title;$('#modalBody').innerHTML=html;
  const a=$('#modalActions');a.innerHTML='';(actions||[]).forEach(x=>{const b=document.createElement('button');b.className='btn'+(x.primary?' primary':'');b.textContent=x.t;b.onclick=x.fn;a.appendChild(b);});
  a.hidden=!(actions&&actions.length);
  $('#modalClose').hidden=!!opts.noClose;$('#modal').dataset.noclose=opts.noClose?'1':'';
  $('#modal').className='modal'+(opts.wide?' wide':'')+(opts.pc?' pc':'');
  $('#modal').hidden=false;
  setTimeout(()=>{const f=$('#modal').querySelector('[autofocus]')||$('#modalActions button')||$('#modalClose');if(f&&!opts.noFocus)f.focus();},30);
}
function fecharModal(force){
  if(!force&&$('#modal').dataset.noclose==='1')return;
  if(inPC)salvarRascunho();
  $('#modal').hidden=true;inPC=false;paused=!$('#dialog').hidden;lastHud='';if(S)updateHud();
}
function confete(){if(reduceMotion)return;const c=$('#confete');c.innerHTML='';for(let i=0;i<40;i++){const s=document.createElement('i');s.style.left=Math.random()*100+'%';s.style.background=['#ffd23f','#2b59c3','#2f9e5b','#e85d9a','#d6453d'][i%5];s.style.animationDelay=Math.random()*.4+'s';c.appendChild(s);}setTimeout(()=>c.innerHTML='',2600);}
