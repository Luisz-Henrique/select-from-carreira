/* ============ SOM: trilha procedural com Web Audio ============ */
const SOM={ctx:null,master:null,mus:null,filtro:null,sfx:null,trilha:null,nome:null,passo:0,proximo:0,timer:null,
  cfg:{musica:true,efeitos:true,vozes:true,volume:0.55},ruido:null,ultimoBlip:0};
(function(){try{const c=JSON.parse(localStorage.getItem('select-from-carreira-som')||'null');if(c)Object.assign(SOM.cfg,c);}catch(e){}})();
function somSalvarCfg(){try{localStorage.setItem('select-from-carreira-som',JSON.stringify(SOM.cfg));}catch(e){}}
const midiHz=m=>440*Math.pow(2,(m-69)/12);
function rng32(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}

/* Gera uma trilha a partir de parâmetros: progressão de acordes, baixo, arpejo, melodia e bateria */
function gerarTrilha(o){
  const maior=o.modo!=='menor';
  const esc=maior?[0,2,4,5,7,9,11]:[0,2,3,5,7,8,10];
  const penta=maior?[0,2,4,7,9]:[0,3,5,7,10];
  const graus=o.prog||(maior?[0,5,3,4]:[0,5,2,6]);
  const acorde=g=>[0,2,4,6].map(k=>{const i=g+k;return o.raiz+esc[i%7]+12*Math.floor(i/7);});
  const barras=graus.length*(o.barrasPorAcorde||1),len=barras*16;
  const R=rng32(o.seed||1);
  const notas=[];
  graus.forEach((g,gi)=>{
    const ac=acorde(g);const b0=gi*(o.barrasPorAcorde||1)*16;
    for(let bar=0;bar<(o.barrasPorAcorde||1);bar++){
      const s=b0+bar*16;
      // baixo
      (o.baixo||[0,8]).forEach(st=>notas.push({s:s+st,m:ac[0]-12,d:o.baixoDur||6,v:'baixo'}));
      if(o.quinta)notas.push({s:s+14,m:ac[2]-12,d:2,v:'baixo'});
      // acordes / arpejo
      if(o.arpejo){for(let k=0;k<16;k+=o.arpejo){notas.push({s:s+k,m:ac[(k/o.arpejo)%4]+12,d:o.arpejo,v:'arp'});}}
      if(o.teclas)o.teclas.forEach(st=>ac.slice(0,o.notasAcorde||4).forEach(m=>notas.push({s:s+st,m:m+12,d:o.teclaDur||6,v:'tecla'})));
    }
  });
  // melodia (pentatônica, determinística pela semente)
  if(o.melodia){
    let pos=0,grau=2;
    while(pos<len){
      const dur=[2,2,4,4,6,8][Math.floor(R()*6)];
      if(R()<o.melodia){grau=Math.max(0,Math.min(9,grau+[-2,-1,-1,0,1,1,2][Math.floor(R()*7)]));
        const m=o.raiz+24+penta[grau%5]+12*Math.floor(grau/5)+(o.oitavaMel||0);notas.push({s:pos,m,d:Math.max(2,dur-1),v:'mel'});}
      pos+=dur;}
  }
  const bat={kick:[],caixa:[],chimbal:[]};
  for(let b=0;b<barras;b++){const s=b*16;(o.kick||[]).forEach(k=>bat.kick.push(s+k));(o.caixa||[]).forEach(k=>bat.caixa.push(s+k));(o.chimbal||[]).forEach(k=>bat.chimbal.push(s+k));}
  const porPasso=Array.from({length:len},()=>[]);notas.forEach(n=>{if(n.s<len)porPasso[n.s].push(n);});
  return {bpm:o.bpm,len,porPasso,bat,timbre:o.timbre,swing:o.swing||0,ganho:o.ganho||1};
}
const TRILHAS={
  escritorio:gerarTrilha({bpm:78,raiz:53,modo:'maior',prog:[0,2,1,4],barrasPorAcorde:2,baixo:[0,10],teclas:[0,7],teclaDur:5,melodia:.55,seed:7,kick:[0,10],caixa:[4,12],chimbal:[0,2,4,6,8,10,12,14],swing:.12,
    timbre:{baixo:['triangle',.22],tecla:['sine',.05],mel:['triangle',.07],arp:['sine',.03]}}),
  festa:gerarTrilha({bpm:118,raiz:55,modo:'maior',prog:[0,3,4,0],baixo:[0,6,8,14],baixoDur:2,arpejo:2,melodia:.8,seed:21,kick:[0,4,8,12],caixa:[4,12],chimbal:[2,6,10,14],
    timbre:{baixo:['square',.08],arp:['square',.025],mel:['square',.045]}})
};
const TEMAS={
  chefe:{bpm:96,raiz:43,modo:'maior',seed:11,teclas:[0,8],notasAcorde:3,baixo:[0,4,8,12],baixoDur:3,melodia:.6,caixa:[4,12],timbre:{baixo:['square',.06],tecla:['sawtooth',.018],mel:['square',.04]},oitavaMel:0},
  bia:{bpm:120,raiz:60,modo:'maior',seed:3,arpejo:2,baixo:[0,8],melodia:.7,chimbal:[2,6,10,14],timbre:{baixo:['sine',.18],arp:['sine',.04],mel:['triangle',.07]}},
  carlao:{bpm:110,raiz:45,modo:'maior',seed:5,teclas:[2,6,10,14],teclaDur:2,notasAcorde:3,baixo:[0,3,8,11],baixoDur:2,melodia:.65,kick:[0,8],chimbal:[0,4,8,12],timbre:{baixo:['triangle',.2],tecla:['square',.016],mel:['sawtooth',.025]}},
  neide:{bpm:72,raiz:53,modo:'maior',seed:9,arpejo:4,baixo:[0],baixoDur:12,melodia:.5,timbre:{baixo:['sine',.18],arp:['triangle',.04],mel:['sine',.07]}},
  jorge:{bpm:84,raiz:50,modo:'menor',seed:13,teclas:[0,4,8,12],teclaDur:3,notasAcorde:3,baixo:[0,8],melodia:.45,timbre:{baixo:['triangle',.2],tecla:['square',.014],mel:['square',.035]}},
  kevin:{bpm:132,raiz:62,modo:'maior',seed:17,arpejo:1,baixo:[0,4,8,12],baixoDur:2,melodia:.85,chimbal:[0,2,4,6,8,10,12,14],timbre:{baixo:['square',.06],arp:['square',.015],mel:['square',.04]},oitavaMel:12},
  fabio:{bpm:112,raiz:52,modo:'menor',seed:19,arpejo:1,baixo:[0,2,4,6,8,10,12,14],baixoDur:1,melodia:.4,kick:[0,4,8,12],chimbal:[2,6,10,14],timbre:{baixo:['sawtooth',.05],arp:['square',.012],mel:['sawtooth',.02]}},
  tereza:{bpm:70,raiz:58,modo:'maior',seed:23,arpejo:4,teclas:[0],teclaDur:14,baixo:[0],baixoDur:14,melodia:.55,timbre:{baixo:['sine',.16],arp:['sine',.035],tecla:['sine',.03],mel:['triangle',.065]}}
};
const VOZ={chefe:110,bia:520,carlao:180,neide:330,jorge:220,kevin:440,fabio:260,tereza:380,eu:300};
function trilhaDe(nome){if(TRILHAS[nome])return TRILHAS[nome];if(TEMAS[nome]){TRILHAS[nome]=gerarTrilha(TEMAS[nome]);return TRILHAS[nome];}return TRILHAS.escritorio;}

function somIniciar(){
  if(SOM.ctx){if(SOM.ctx.state==='suspended')SOM.ctx.resume();return;}
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
  try{SOM.ctx=new AC();}catch(e){return;}
  const c=SOM.ctx;
  SOM.master=c.createGain();SOM.master.gain.value=SOM.cfg.volume;SOM.master.connect(c.destination);
  SOM.filtro=c.createBiquadFilter();SOM.filtro.type='lowpass';SOM.filtro.frequency.value=5200;SOM.filtro.connect(SOM.master);
  SOM.mus=c.createGain();SOM.mus.gain.value=SOM.cfg.musica?1:0;SOM.mus.connect(SOM.filtro);
  SOM.sfx=c.createGain();SOM.sfx.gain.value=SOM.cfg.efeitos?1:0;SOM.sfx.connect(SOM.master);
  const buf=c.createBuffer(1,c.sampleRate*.5,c.sampleRate);const d=buf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;SOM.ruido=buf;
  SOM.timer=setInterval(somAgendar,25);
  if(SOM.pendente)somTocar(SOM.pendente);
}
function tom(dest,t,freq,dur,tipo,vol,ataque,soltura){
  const c=SOM.ctx;const o=c.createOscillator();const g=c.createGain();
  o.type=tipo;o.frequency.setValueAtTime(freq,t);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+(ataque||.01));
  g.gain.setTargetAtTime(0,t+Math.max(.02,dur*.6),(soltura||dur*.35)+.01);
  o.connect(g);g.connect(dest);o.start(t);o.stop(t+dur+(soltura||.3)*4+.05);
}
function bateria(t,tipo){
  const c=SOM.ctx;
  if(tipo==='kick'){const o=c.createOscillator();const g=c.createGain();o.frequency.setValueAtTime(120,t);o.frequency.exponentialRampToValueAtTime(40,t+.12);g.gain.setValueAtTime(.32,t);g.gain.exponentialRampToValueAtTime(.001,t+.18);o.connect(g);g.connect(SOM.mus);o.start(t);o.stop(t+.2);return;}
  const s=c.createBufferSource();s.buffer=SOM.ruido;const f=c.createBiquadFilter();const g=c.createGain();
  if(tipo==='caixa'){f.type='bandpass';f.frequency.value=1800;g.gain.setValueAtTime(.09,t);g.gain.exponentialRampToValueAtTime(.001,t+.14);}
  else{f.type='highpass';f.frequency.value=7000;g.gain.setValueAtTime(.025,t);g.gain.exponentialRampToValueAtTime(.001,t+.05);}
  s.connect(f);f.connect(g);g.connect(SOM.mus);s.start(t);s.stop(t+.2);
}
function somAgendar(){
  const c=SOM.ctx,tr=SOM.trilha;if(!c||!tr||!SOM.cfg.musica)return;
  const passoSeg=60/tr.bpm/4;
  while(SOM.proximo<c.currentTime+.15){
    const p=SOM.passo,t=SOM.proximo+(p%2?tr.swing*passoSeg:0);
    tr.porPasso[p].forEach(n=>{const tb=tr.timbre[n.v];if(!tb)return;tom(SOM.mus,t,midiHz(n.m),n.d*passoSeg,tb[0],tb[1]*tr.ganho,n.v==='tecla'?.02:.008,n.v==='baixo'?.12:.2);});
    if(tr.bat.kick.includes(p))bateria(t,'kick');if(tr.bat.caixa.includes(p))bateria(t,'caixa');if(tr.bat.chimbal.includes(p))bateria(t,'chimbal');
    SOM.passo=(p+1)%tr.len;SOM.proximo+=passoSeg;
  }
}
function somTocar(nome){
  if(!SOM.ctx){SOM.pendente=nome;return;}
  if(SOM.nome===nome)return;
  const c=SOM.ctx;const g=SOM.mus.gain;
  const alvo=SOM.cfg.musica?1:0;
  g.cancelScheduledValues(c.currentTime);g.setValueAtTime(g.value,c.currentTime);g.linearRampToValueAtTime(0,c.currentTime+.35);
  SOM.nome=nome;
  setTimeout(()=>{if(SOM.nome!==nome)return;SOM.trilha=trilhaDe(nome);SOM.passo=0;SOM.proximo=c.currentTime+.05;
    g.cancelScheduledValues(c.currentTime);g.setValueAtTime(0,c.currentTime);g.linearRampToValueAtTime(alvo,c.currentTime+.6);},380);
}
function somNoite(noite){if(!SOM.ctx)return;SOM.filtro.frequency.setTargetAtTime(noite?1400:5200,SOM.ctx.currentTime,.8);}
function somAplicarCfg(){
  if(!SOM.ctx)return;const t=SOM.ctx.currentTime;
  SOM.master.gain.setTargetAtTime(SOM.cfg.volume,t,.05);
  SOM.mus.gain.cancelScheduledValues(t);SOM.mus.gain.setTargetAtTime(SOM.cfg.musica?1:0,t,.1);
  SOM.sfx.gain.setTargetAtTime(SOM.cfg.efeitos?1:0,t,.05);
  if(SOM.cfg.musica){SOM.proximo=Math.max(SOM.proximo,t+.05);}
}
function somBlip(quem){
  if(!SOM.ctx||!SOM.cfg.vozes||!SOM.cfg.efeitos)return;const c=SOM.ctx;const agora=c.currentTime;
  if(agora-SOM.ultimoBlip<.055)return;SOM.ultimoBlip=agora;
  const base=VOZ[quem]||300;tom(SOM.sfx,agora,base*(0.92+Math.random()*.2),.045,quem==='chefe'||quem==='carlao'?'square':'triangle',.05,.004,.02);
}
function somEfeito(tipo){
  if(!SOM.ctx||!SOM.cfg.efeitos)return;const t=SOM.ctx.currentTime;const d=SOM.sfx;
  const seq=(ns,dur,tp,v)=>ns.forEach((m,i)=>tom(d,t+i*dur,midiHz(m),dur*1.2,tp,v,.005,.06));
  switch(tipo){
    case 'sucesso':seq([72,76,79,84],.09,'square',.06);break;
    case 'erro':seq([52,47],.13,'square',.05);break;
    case 'moeda':seq([83,88],.07,'square',.05);break;
    case 'promocao':seq([60,64,67,72,76,79,84],.08,'square',.06);break;
    case 'clique':tom(d,t,880,.03,'square',.025,.002,.01);break;
    case 'porta':tom(d,t,90,.25,'triangle',.18,.005,.08);break;
    case 'cafe':seq([67,71,74],.07,'triangle',.06);break;
    case 'aula':seq([69,73,76,81],.1,'sine',.07);break;
  }
}
['pointerdown','keydown','touchstart'].forEach(ev=>window.addEventListener(ev,somIniciar,{passive:true}));
