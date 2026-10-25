/* ============ PERSONAGENS ============ */
const NPCS={
  chefe:{nome:'Seu Ronaldo',cargo:'Gerente de BI',dept:'Diretoria',skin:'#c68c5a',hair:'#9a9a9a',shirt:'#3a4a7a',pants:'#2a2f3d',tie:'#c0392b',bald:true},
  bia:{nome:'Bia',cargo:'Marketing',dept:'Marketing',skin:'#f1c7a1',hair:'#7b3fa0',shirt:'#e85d9a',pants:'#3b3561',long:true},
  carlao:{nome:'Carlão',cargo:'Vendas',dept:'Vendas',skin:'#a86a43',hair:'#2b1d14',shirt:'#f0f0f0',pants:'#2f3b52',tie:'#2a7de1',beard:true},
  neide:{nome:'Dona Neide',cargo:'Operações',dept:'Operações',skin:'#e6b48a',hair:'#d8d8d8',shirt:'#4f8a5b',pants:'#4a4038',long:true,glasses:true},
  jorge:{nome:'Jorge',cargo:'Financeiro',dept:'Financeiro',skin:'#f2d0b0',hair:'#3a2a1a',shirt:'#c9d6e8',pants:'#1f2633',glasses:true},
  kevin:{nome:'Kevin',cargo:'Estagiário',dept:'Dados',skin:'#f0c9a6',hair:'#e0b84a',shirt:'#f39c12',pants:'#2f5aa8',cap:true},
  fabio:{nome:'Fábio da TI',cargo:'Suporte',dept:'TI',skin:'#8d5a3b',hair:'#111111',shirt:'#2d2d2d',pants:'#2b2b2b',headset:true}
};
const DEPTS=['Marketing','Vendas','Operações','Financeiro'];
const DEPT_OF={bia:'Marketing',carlao:'Vendas',neide:'Operações',jorge:'Financeiro'};

const CARREIRA=[
  {nome:'Estagiário(a)',salario:1800,req:null},
  {nome:'Analista Júnior',salario:3500,req:{xp:250,missoes:6,sql:2,py:1}},
  {nome:'Analista Pleno',salario:6000,req:{xp:800,missoes:14,sql:3,py:3,negocio:2}},
  {nome:'Analista Sênior',salario:9500,req:{xp:1800,missoes:24,sql:5,py:4,negocio:3,com:2}},
  {nome:'Coordenador(a) de Dados',salario:14000,req:{xp:3200,missoes:34,sql:6,py:5,negocio:5,com:4,rep:62}},
  {nome:'Head de Dados',salario:22000,req:{xp:5200,missoes:46,sql:7,py:7,negocio:6,com:6,rep:70,auto:3}}
];

/* ============ MISSÕES ============
 kind: fill (lacunas) | sql | py | quiz ; tier = nível mínimo de cargo */
const MISSOES=[
 // ---------- ESTAGIÁRIO ----------
 {id:'f1',tier:0,from:'carlao',kind:'fill',lang:'sql',title:'O sistema tá vivo?',
  brief:'Oi, novato! Me mostra as 5 primeiras linhas da tabela de vendas? Quero ver se o sistema tá vivo ou se é melhor eu voltar pro meu caderninho.',
  template:'___ * FROM vendas LIMIT 5;',answers:['SELECT'],hint:'O comando que seleciona colunas começa com S.',
  insight:'Antes de qualquer análise, olhe algumas linhas. Você descobre formatos, colunas e sujeira nos dados antes de tirar conclusões erradas.'},
 {id:'f2',tier:0,from:'neide',kind:'fill',lang:'sql',title:'Quem está atrasando?',
  brief:'Meu filho, preciso da lista de entregas com situação “Atrasado”. Cliente ligando aqui igual telemarketing.',
  template:"SELECT * FROM entregas WHERE situacao ___ 'Atrasado';",answers:['='],hint:'Em SQL, igualdade é um sinal só.',
  insight:'Entrega atrasada vira ligação no SAC, reembolso e nota baixa. Operações usa essa lista para cobrar a transportadora e avisar o cliente antes que ele reclame.'},
 {id:'f3',tier:0,from:'bia',kind:'fill',lang:'py',title:'Espiadinha nas campanhas',
  brief:'Amigo, me mostra as 3 primeiras linhas da tabela de campanhas em pandas? Só pra eu ver se tem algo viral ali ✨',
  template:'campanhas.___(3)',answers:['head'],hint:'O método que mostra as primeiras linhas tem nome de parte do corpo.',
  insight:'head() é o “olá” de toda análise em pandas. Marketing costuma ter várias fontes; conferir as colunas evita misturar cliques com impressões.'},
 {id:'f4',tier:0,from:'jorge',kind:'fill',lang:'sql',title:'Quantos pedidos, afinal?',
  brief:'Preciso do número total de pedidos para o fechamento. Um número. Um. Por favor.',
  template:'SELECT ___(*) FROM vendas;',answers:['COUNT'],hint:'Contar em inglês.',
  insight:'Volume de pedidos é a base do ticket médio (faturamento ÷ pedidos). O Financeiro usa para projetar caixa e comissão.'},
 {id:'f5',tier:0,from:'carlao',kind:'fill',lang:'py',title:'Só as vendas do site',
  brief:'Filtra pra mim só as vendas do canal “Site”? O diretor quer saber se o e-commerce paga a conta.',
  template:"vendas[vendas['canal'] ___ 'Site']",answers:['=='],hint:'Em Python, comparar igualdade usa dois sinais de igual.',
  insight:'Separar por canal mostra onde investir. Se o site vende bem com custo menor que a loja física, a estratégia muda.'},
 {id:'f6',tier:0,from:'bia',kind:'fill',lang:'sql',title:'Ranking de receita',
  brief:'Quero as campanhas da que mais deu receita para a que menos deu. Vou colocar no slide com MUITA cor.',
  template:'SELECT canal, receita FROM campanhas ORDER BY receita ___;',answers:['DESC'],ordered:true,hint:'Do maior para o menor é ordem decrescente.',
  insight:'Ranking de receita sozinho engana: uma campanha cara pode trazer muita receita e pouco lucro. Logo, logo você vai calcular ROI.'},
 {id:'f7',tier:0,from:'neide',kind:'fill',lang:'py',title:'Contagem por transportadora',
  brief:'Quantas entregas cada transportadora fez? Quero saber em quem a gente tá mais dependente.',
  template:"entregas['transportadora'].___()",answers:['value_counts'],hint:'Conta os valores: value_...',
  insight:'Concentração em um fornecedor é risco operacional. Se 50% das entregas dependem de uma empresa, uma greve para metade da operação.'},
 {id:'q1',tier:0,from:'chefe',kind:'quiz',title:'Pergunta de corredor',
  brief:'Ô, estagiário! Rapidinho: o que é ticket médio?',
  options:['Faturamento dividido pelo número de pedidos','O maior pedido do mês','Preço médio da tabela de produtos','Lucro dividido por clientes'],answer:0,
  insight:'Ticket médio = faturamento ÷ pedidos. Para crescer receita há três alavancas: mais clientes, mais pedidos por cliente ou ticket maior.'},
 {id:'q2',tier:0,from:'carlao',kind:'quiz',title:'“Vendas de ontem”',
  brief:'Me passa as vendas de ontem? Qual a PRIMEIRA coisa que você deveria me perguntar?',
  options:['Qual a definição: pedido feito, faturado ou pago? Bruto ou líquido?','Qual cor você quer no gráfico?','Posso fazer em Python?','Ontem de manhã ou de tarde?'],answer:0,
  insight:'Metade dos “números errados” no mundo corporativo são definições diferentes. Alinhar a métrica antes de rodar a query economiza retrabalho e discussão.'},
 {id:'q3',tier:0,from:'bia',kind:'quiz',title:'Sopa de letrinhas',
  brief:'O diretor perguntou o CTR da campanha e eu sorri e acenei. O que é CTR?',
  options:['Cliques ÷ impressões','Conversões ÷ cliques','Receita ÷ investimento','Custo ÷ clientes novos'],answer:0,
  insight:'CTR mede se o anúncio chama atenção. Conversão mede se o clique vira venda. Um CTR alto com conversão baixa geralmente indica promessa do anúncio diferente da página.'},
 {id:'q4',tier:0,from:'jorge',kind:'quiz',title:'Excel, nosso velho amigo',
  brief:'No Excel, qual função faz algo parecido com um JOIN do SQL?',
  options:['PROCV / PROCX','SOMA','CONCATENAR','SE'],answer:0,
  insight:'PROCV é um JOIN de pobre: traz uma coluna de outra tabela por uma chave. Entender isso ajuda a traduzir pedidos de quem só usa Excel.'},
 // ---------- JÚNIOR ----------
 {id:'f8',tier:1,from:'carlao',kind:'fill',lang:'sql',title:'Faturamento por região',
  brief:'Reunião de metas! Preciso do faturamento somado de cada região.',
  template:'SELECT regiao, ___(valor) AS total FROM vendas ___ BY regiao;',answers:['SUM','GROUP'],hint:'Somar e agrupar.',
  insight:'O Sudeste concentra a maior parte do faturamento. Isso orienta onde colocar vendedores, mas também revela regiões pouco exploradas com potencial de crescimento.'},
 {id:'f9',tier:1,from:'jorge',kind:'fill',lang:'py',title:'Comissão dos vendedores',
  brief:'Preciso do total vendido por vendedor para calcular comissão. Sem isso, o Carlão me persegue no corredor.',
  template:"vendas.___('vendedor')['valor'].___()",answers:['groupby','sum'],hint:'Agrupar e somar, em inglês.',
  insight:'Comissão é custo variável. O Financeiro precisa desse número antes da folha; um erro aqui vira problema trabalhista e de clima.'},
 {id:'s1',tier:1,from:'carlao',kind:'sql',title:'O app vende?',
  brief:'Quanto faturamos no canal App? Só o total, um número.',
  starter:'-- Escreva sua consulta aqui\n',solution:"SELECT SUM(valor) FROM vendas WHERE canal = 'App';",hint:'SUM(valor) com WHERE canal = \'App\'.',
  insight:'O app tem ticket médio maior que os outros canais. Isso pode justificar investir em push e cupons exclusivos para o app.'},
 {id:'s2',tier:1,from:'neide',kind:'sql',title:'Volume por transportadora',
  brief:'Quero a quantidade de entregas por transportadora, em SQL desta vez. O Fábio disse que é “mais profissional”.',
  starter:'-- Uma linha por transportadora\n',solution:'SELECT transportadora, COUNT(*) FROM entregas GROUP BY transportadora;',hint:'COUNT(*) com GROUP BY transportadora.',
  insight:'Volume sozinho não diz qualidade. Cruzando com atrasos, você descobre se a transportadora mais usada é também a mais confiável.'},
 {id:'s3',tier:1,from:'bia',kind:'sql',title:'Campanhas caras',
  brief:'Lista todas as campanhas (todas as colunas) com investimento acima de R$ 10.000. O Jorge quer “conversar” sobre elas.',
  starter:'',solution:'SELECT * FROM campanhas WHERE investimento > 10000;',hint:'WHERE investimento > 10000 (sem ponto no número).',
  insight:'Campanhas caras precisam provar retorno. Separar as maiores é o primeiro passo para uma revisão de verba.'},
 {id:'p1',tier:1,from:'bia',kind:'py',title:'Quanto já gastamos?',
  brief:'Qual o total investido em todas as campanhas? Em pandas, por favor.',
  starter:'# a tabela já está carregada como campanhas\n',solution:"campanhas['investimento'].sum()",hint:"Selecione a coluna investimento e use .sum().",
  insight:'Investimento total é o denominador do ROI e do CAC. Marketing sem esse número não consegue defender orçamento.'},
 {id:'p2',tier:1,from:'carlao',kind:'py',title:'Pedidos gordinhos',
  brief:'Quero ver todas as vendas acima de R$ 3.000, com todas as colunas. São os clientes que eu levo pra almoçar.',
  starter:'',solution:"vendas[vendas['valor'] > 3000]",hint:"Filtro booleano: vendas[ condição ].",
  insight:'Pedidos grandes costumam ser poucos clientes com muito peso. Perder um deles dói; vale um atendimento dedicado.'},
 {id:'p3',tier:1,from:'neide',kind:'py',title:'Promessa média',
  brief:'Qual o prazo médio prometido (coluna prazo_dias) nas entregas?',
  starter:'',solution:"entregas['prazo_dias'].mean()",hint:'.mean() calcula a média.',
  insight:'Prazo prometido é marketing; prazo real é operação. A diferença entre os dois é a promessa quebrada que vira reclamação.'},
 {id:'q5',tier:1,from:'chefe',kind:'quiz',title:'Média traiçoeira',
  brief:'Temos alguns pedidos de notebook enormes e muitos de mouse. Para descrever o pedido “típico”, o melhor é…',
  options:['A mediana, que não é puxada pelos extremos','A média, sempre','O maior valor','A soma'],answer:0,
  insight:'Com outliers, a média engana. Mediana descreve o caso típico; média continua útil para projetar receita total.'},
 {id:'q6',tier:1,from:'jorge',kind:'quiz',title:'WHERE ou HAVING?',
  brief:'Quero só os vendedores cuja SOMA de vendas passa de R$ 40 mil. Qual cláusula filtra depois do agrupamento?',
  options:['HAVING','WHERE','ORDER BY','LIMIT'],answer:0,
  insight:'WHERE filtra linhas antes de agrupar; HAVING filtra grupos depois. Confundir os dois é um dos erros mais comuns em entrevista técnica.'},
 {id:'q7',tier:1,from:'fabio',kind:'quiz',title:'O idioma do Power BI',
  brief:'Já tentou desligar e ligar? Brincadeira. Qual linguagem cria medidas no Power BI?',
  options:['DAX','VBA','HTML','Bash'],answer:0,
  insight:'SQL busca, pandas transforma, DAX mede no dashboard. Saber qual ferramenta usar em cada etapa é o que diferencia um analista sênior.'},
 // ---------- PLENO ----------
 {id:'s4',tier:2,from:'carlao',kind:'sql',title:'Ticket médio por canal',
  brief:'Qual canal traz pedidos maiores? Quero o ticket médio (média de valor) por canal.',
  starter:'',solution:'SELECT canal, AVG(valor) FROM vendas GROUP BY canal;',hint:'AVG(valor) agrupado por canal.',
  insight:'Canais com ticket maior merecem ofertas de produtos premium. Canais com ticket menor podem receber kits e combos para subir o valor.'},
 {id:'s5',tier:2,from:'jorge',kind:'sql',title:'Clube dos 40 mil',
  brief:'Quais vendedores venderam mais de R$ 40.000 no total? Quero vendedor e total.',
  starter:'',solution:'SELECT vendedor, SUM(valor) FROM vendas GROUP BY vendedor HAVING SUM(valor) > 40000;',hint:'GROUP BY vendedor e HAVING SUM(valor) > 40000.',
  insight:'Esses vendedores batem a meta de bônus. Entender o que fazem diferente (carteira, produto, canal) vale mais que o próprio bônus.'},
 {id:'s6',tier:2,from:'bia',kind:'sql',title:'Quem é nosso cliente?',
  brief:'Faturamento por segmento de cliente (Varejo, Atacado, Corporativo). Os dados de segmento estão na tabela clientes.',
  starter:'',solution:'SELECT c.segmento, SUM(v.valor) FROM vendas v JOIN clientes c ON v.cliente_id = c.id GROUP BY c.segmento;',hint:'JOIN clientes c ON v.cliente_id = c.id, depois GROUP BY c.segmento.',
  insight:'Varejo lidera a receita. A comunicação de marketing deve falar a língua do pequeno lojista, não do comprador corporativo.'},
 {id:'s7',tier:2,from:'neide',kind:'sql',title:'Unidades por categoria',
  brief:'Pra planejar o estoque: quantas unidades (quantidade) saíram de cada categoria?',
  starter:'',solution:'SELECT categoria, SUM(quantidade) FROM vendas GROUP BY categoria;',hint:'SUM(quantidade) por categoria.',
  insight:'Acessórios saem em volume, eletrônicos em valor. Estoque e armazém são planejados por unidade; o caixa, por valor.'},
 {id:'p4',tier:2,from:'bia',kind:'py',title:'ROI de verdade',
  brief:'Crie a coluna roi = (receita − investimento) ÷ investimento e me devolva o ROI médio por canal, do maior para o menor.',
  starter:"campanhas['roi'] = \n",solution:"campanhas['roi'] = (campanhas['receita'] - campanhas['investimento']) / campanhas['investimento']\ncampanhas.groupby('canal')['roi'].mean().sort_values(ascending=False)",ordered:true,hint:"Depois de criar a coluna: groupby('canal')['roi'].mean().sort_values(ascending=False)",
  insight:'YouTube tem o melhor retorno por real investido, mesmo sem ser o canal com mais receita. Realocar verba para ele tende a aumentar o lucro total.'},
 {id:'p5',tier:2,from:'neide',kind:'py',title:'Atrasos por transportadora',
  brief:'Quantas entregas ATRASADAS cada transportadora teve?',
  starter:'',solution:"entregas[entregas['situacao'] == 'Atrasado']['transportadora'].value_counts()",hint:'Filtre situacao == "Atrasado" e depois value_counts() na transportadora.',
  insight:'Em números absolutos a VaiVoando atrasa mais, mas ela também entrega mais. Sempre olhe proporção, não só contagem.'},
 {id:'p6',tier:2,from:'fabio',kind:'py',title:'Dados faltando',
  brief:'Alguém disse que tem buraco na tabela de entregas. Conte os valores vazios de cada coluna.',
  starter:'',solution:'entregas.isnull().sum()',hint:'isnull() marca vazios; sum() conta por coluna.',
  insight:'Vazio em dias_reais significa “em trânsito”, não erro. Entender por que um dado falta é tão importante quanto contá-lo.'},
 {id:'q8',tier:2,from:'chefe',kind:'quiz',title:'Corte de verba',
  brief:'Precisamos cortar 20% da verba de marketing. Qual critério você usaria para escolher o que cortar?',
  options:['Cortar os canais com menor ROI e menor potencial de escala','Cortar igualmente todos os canais','Cortar o canal com menor receita absoluta','Cortar o canal que o diretor não gosta'],answer:0,
  insight:'Corte linear é confortável politicamente e ruim financeiramente. Decisão de verba é sobre retorno marginal: onde o próximo real rende menos.'},
 {id:'q9',tier:2,from:'kevin',kind:'quiz',title:'Kevin aprendendo R',
  brief:'O Kevin entrou num curso de R. Qual pacote faz em R o papel que o pandas faz em Python?',
  options:['dplyr (tidyverse)','ggplot2','shiny','knitr'],answer:0,
  insight:'dplyr filtra, agrupa e resume, como pandas. ggplot2 é para gráficos. Os conceitos se transferem entre linguagens; a sintaxe é detalhe.'},
 // ---------- SÊNIOR ----------
 {id:'s8',tier:3,from:'bia',kind:'sql',title:'Taxa de conversão por canal',
  brief:'Taxa de conversão (%) por canal = soma de conversões × 100 ÷ soma de cliques. Ordene da maior para a menor.',
  starter:'',solution:'SELECT canal, SUM(conversoes) * 100.0 / SUM(cliques) AS taxa FROM campanhas GROUP BY canal ORDER BY taxa DESC;',ordered:true,hint:'Use SUM(conversoes) * 100.0 / SUM(cliques). O 100.0 evita divisão inteira em bancos reais.',
  insight:'Somar antes de dividir dá a taxa ponderada. Fazer média das taxas mensais distorce quando os volumes são diferentes. E-mail converte pouco: talvez a lista esteja velha.'},
 {id:'s9',tier:3,from:'carlao',kind:'sql',title:'Faixas de pedido',
  brief:'Classifique os pedidos em faixas: “Alto” (valor ≥ 3000), “Médio” (≥ 1000) e “Baixo” (o resto). Quero faixa e quantidade de pedidos.',
  starter:'',solution:"SELECT CASE WHEN valor >= 3000 THEN 'Alto' WHEN valor >= 1000 THEN 'Médio' ELSE 'Baixo' END AS faixa, COUNT(*) FROM vendas GROUP BY CASE WHEN valor >= 3000 THEN 'Alto' WHEN valor >= 1000 THEN 'Médio' ELSE 'Baixo' END;",hint:"CASE WHEN ... THEN 'Alto' ... END, e agrupe pela mesma expressão.",
  insight:'Segmentar pedidos por faixa permite políticas diferentes: frete grátis no Médio para empurrar para o Alto, atendimento consultivo no Alto.'},
 {id:'s10',tier:3,from:'carlao',kind:'sql',title:'Clientes fantasmas',
  brief:'Quais clientes ATIVOS nunca compraram nada? Quero só o nome deles. Vou ligar um por um.',
  starter:'',solution:'SELECT c.nome FROM clientes c LEFT JOIN vendas v ON v.cliente_id = c.id WHERE c.ativo = 1 AND v.id IS NULL;',hint:'LEFT JOIN de clientes com vendas e filtre v.id IS NULL. Ou use NOT IN.',
  insight:'Cliente ativo sem compra é receita parada. Uma ação de reativação nessa lista costuma ter custo baixíssimo e retorno rápido.'},
 {id:'s11',tier:3,from:'jorge',kind:'sql',title:'Acima da média',
  brief:'Quantos pedidos ficaram acima do ticket médio geral? Use uma subconsulta.',
  starter:'',solution:'SELECT COUNT(*) FROM vendas WHERE valor > (SELECT AVG(valor) FROM vendas);',hint:'WHERE valor > (SELECT AVG(valor) FROM vendas)',
  insight:'Menos da metade dos pedidos fica acima da média: os pedidos grandes puxam a média para cima, típico de B2B. Planeje com mediana, projete receita com média.'},
 {id:'p7',tier:3,from:'jorge',kind:'py',title:'Faturamento por estado',
  brief:'Junte vendas com clientes e me dê o faturamento por estado. Em vendas a chave é cliente_id; em clientes, id.',
  starter:'',solution:"pd.merge(vendas, clientes, left_on='cliente_id', right_on='id').groupby('estado')['valor'].sum()",hint:"pd.merge(vendas, clientes, left_on='cliente_id', right_on='id'), depois groupby('estado').",
  insight:'Estado define imposto (ICMS) e frete. Um estado com muita venda e frete caro pode estar dando prejuízo escondido.'},
 {id:'p8',tier:3,from:'carlao',kind:'py',title:'Matriz região × canal',
  brief:'Monte uma tabela dinâmica: regiões nas linhas, canais nas colunas, soma de valor. Onde não tiver venda, coloque 0.',
  starter:'',solution:"pd.pivot_table(vendas, index='regiao', columns='canal', values='valor', aggfunc='sum', fill_value=0)",hint:"pd.pivot_table(vendas, index=..., columns=..., values=..., aggfunc='sum', fill_value=0)",
  insight:'Os zeros contam a história: o App só vende no Sudeste e no Sul, e o Norte compra apenas pelo Site. Ou falta divulgação do app, ou falta presença física nessas regiões.'},
 {id:'p9',tier:3,from:'carlao',kind:'py',title:'Top 3 produtos',
  brief:'Quais os 3 produtos com maior faturamento? Do maior para o menor.',
  starter:'',solution:"vendas.groupby('produto')['valor'].sum().sort_values(ascending=False).head(3)",ordered:true,hint:'groupby, sum, sort_values(ascending=False), head(3).',
  insight:'O Notebook sozinho faz mais da metade da receita. Dependência de um produto é risco: uma falta de estoque derruba o mês.'},
 {id:'q10',tier:3,from:'chefe',kind:'quiz',title:'Black Friday',
  brief:'O comercial quer 40% de desconto em tudo na Black Friday. O que você checa antes de apoiar?',
  options:['Margem por produto e elasticidade: se o volume extra cobre o desconto','Se os concorrentes também vão dar 40%','Se o site aguenta','Nada, desconto sempre aumenta o lucro'],answer:0,
  insight:'Desconto aumenta receita fácil e lucro difícil. Com margem de 30%, um desconto de 40% vende abaixo do custo: quanto mais vende, mais perde.'},
 {id:'q11',tier:3,from:'bia',kind:'quiz',title:'Teste A/B',
  brief:'A nova página teve conversão 3,2% contra 3,0% da antiga, com p-valor de 0,30. O que recomendar?',
  options:['Ainda não há evidência de diferença; continuar o teste ou aceitar empate','Trocar já, ganhou!','Voltar para a antiga','Refazer com cores diferentes'],answer:0,
  insight:'p-valor alto indica que a diferença pode ser acaso. Decidir com ruído gera “vitórias” que somem no mês seguinte.'},
 // ---------- COORDENAÇÃO ----------
 {id:'s12',tier:4,from:'chefe',kind:'sql',title:'Curva do semestre',
  brief:'Faturamento por mês, em ordem de mês, para a apresentação da diretoria.',
  starter:'',solution:'SELECT mes, SUM(valor) FROM vendas GROUP BY mes ORDER BY mes;',ordered:true,hint:'GROUP BY mes ORDER BY mes.',
  insight:'Queda forte em maio e junho. Antes de culpar o mercado, cruze com campanhas e estoque: talvez o problema seja interno.'},
 {id:'s13',tier:4,from:'chefe',kind:'sql',title:'Churn da base',
  brief:'Qual o percentual de clientes inativos (ativo = 0) sobre o total? Um número.',
  starter:'',solution:'SELECT 100.0 * SUM(CASE WHEN ativo = 0 THEN 1 ELSE 0 END) / COUNT(*) FROM clientes;',hint:'SUM(CASE WHEN ativo = 0 THEN 1 ELSE 0 END) * 100.0 / COUNT(*)',
  insight:'Churn de 20% significa repor um em cada cinco clientes só para ficar no lugar. Reter costuma custar muito menos que adquirir.'},
 {id:'s14',tier:4,from:'neide',kind:'sql',title:'Quem mais estoura prazo',
  brief:'Atraso médio em dias (dias_reais − prazo_dias) por transportadora, ignorando as em trânsito. Do pior para o melhor.',
  starter:'',solution:'SELECT transportadora, AVG(dias_reais - prazo_dias) AS atraso FROM entregas WHERE dias_reais IS NOT NULL GROUP BY transportadora ORDER BY atraso DESC;',ordered:true,hint:'WHERE dias_reais IS NOT NULL, AVG(dias_reais - prazo_dias), ORDER BY ... DESC.',
  insight:'A TartaLog atrasa mais de 2 dias em média. Com esse dado a Neide renegocia contrato com multa por atraso, ou troca de fornecedor.'},
 {id:'p10',tier:4,from:'jorge',kind:'py',title:'Participação por região',
  brief:'Participação (%) de cada região no faturamento total, arredondada para 1 casa decimal.',
  starter:'',solution:"(vendas.groupby('regiao')['valor'].sum() / vendas['valor'].sum() * 100).round(1)",hint:'Divida o groupby pela soma total, multiplique por 100 e use .round(1).',
  insight:'Quase 60% no Sudeste. Expandir para o Sul, que já responde por 21%, é mais barato que abrir o Norte do zero.'},
 {id:'p11',tier:4,from:'bia',kind:'py',title:'Safras de clientes',
  brief:'Quantos clientes entraram em cada mês (mes_cadastro)? É o começo da nossa análise de coorte.',
  starter:'',solution:"clientes.groupby('mes_cadastro')['id'].count()",hint:"groupby('mes_cadastro')['id'].count()",
  insight:'Coorte agrupa clientes pelo mês de entrada. Depois você acompanha quantos de cada safra seguem ativos: é assim que se mede retenção de verdade.'},
 {id:'p12',tier:4,from:'chefe',kind:'py',title:'Ranking comercial',
  brief:'Por vendedor: total vendido (coluna total) e número de pedidos (coluna pedidos), ordenado pelo total, do maior para o menor.',
  starter:'',solution:"vendas.groupby('vendedor').agg(total=('valor', 'sum'), pedidos=('id', 'count')).sort_values('total', ascending=False)",ordered:true,hint:"agg(total=('valor','sum'), pedidos=('id','count')) e sort_values('total', ascending=False).",
  insight:'A Carla vende mais com pedidos parecidos com os da Ana: ticket maior. Treinar o time no discurso dela vale mais que contratar.'},
 {id:'q12',tier:4,from:'chefe',kind:'quiz',title:'IA em tudo',
  brief:'A diretoria quer “uma IA que preveja churn” para semana que vem. Os dados de cancelamento estão espalhados em três planilhas. Primeiro passo?',
  options:['Definir churn com o negócio e consolidar um histórico confiável','Contratar uma ferramenta de IA','Treinar um modelo com o que tiver','Dizer que é impossível'],answer:0,
  insight:'Modelo bom com dado ruim é chute caro. Na maioria dos projetos, 80% do valor está em definir o problema e organizar os dados.'},
 {id:'q13',tier:4,from:'chefe',kind:'quiz',title:'Apresentando para a diretoria',
  brief:'Você tem 5 minutos com o CEO. Como abre a apresentação?',
  options:['Com a recomendação e o impacto em R$; detalhes depois, se pedirem','Com a metodologia completa','Com todos os gráficos que você fez','Com uma piada sobre SQL'],answer:0,
  insight:'Executivos decidem por conclusão, não por processo. Comece pelo “e daí?”; a metodologia é seu respaldo, não seu roteiro.'}
];
/* Missões recorrentes: automatizáveis */
const RECORRENTES={
  rel_vendas:{nome:'Relatório diário de vendas',from:'carlao',lang:'sql',variants:[
    {brief:'Relatório diário: faturamento total de todas as vendas. Um número.',solution:'SELECT SUM(valor) FROM vendas;'},
    {brief:'Relatório diário: número total de pedidos.',solution:'SELECT COUNT(*) FROM vendas;'},
    {brief:'Relatório diário: faturamento só da região Sudeste.',solution:"SELECT SUM(valor) FROM vendas WHERE regiao = 'Sudeste';"}]},
  rel_mkt:{nome:'Relatório diário de marketing',from:'bia',lang:'py',variants:[
    {brief:'Relatório do dia: total de conversões de todas as campanhas (pandas).',solution:"campanhas['conversoes'].sum()"},
    {brief:'Relatório do dia: receita total das campanhas (pandas).',solution:"campanhas['receita'].sum()"},
    {brief:'Relatório do dia: média de cliques por campanha (pandas).',solution:"campanhas['cliques'].mean()"}]},
  rel_ops:{nome:'Relatório diário de operações',from:'neide',lang:'sql',variants:[
    {brief:'Relatório do dia: quantas entregas estão atrasadas?',solution:"SELECT COUNT(*) FROM entregas WHERE situacao = 'Atrasado';"},
    {brief:'Relatório do dia: quantas entregas estão em trânsito?',solution:"SELECT COUNT(*) FROM entregas WHERE situacao = 'Em trânsito';"},
    {brief:'Relatório do dia: quantas entregas foram concluídas no prazo (Entregue)?',solution:"SELECT COUNT(*) FROM entregas WHERE situacao = 'Entregue';"}]}
};
const MISSOES_EVENTO={
  maes:{from:'bia',kind:'sql',lang:'sql',title:'Campanha de Dia das Mães',brief:'Dia das Mães chegando! Qual categoria tem mais pedidos? Quero categoria e quantidade de pedidos, de todas as categorias.',solution:'SELECT categoria, COUNT(*) FROM vendas GROUP BY categoria;',hint:'COUNT(*) por categoria.',insight:'Datas comemorativas pedem o produto certo. Eletrônicos lideram em pedidos: bom foco para presente de maior valor, com parcelamento em destaque.'},
  blackfriday:{from:'carlao',kind:'sql',lang:'sql',title:'Estoque para Black Friday',brief:'BLACK FRIDAY! Quais os 3 produtos com mais unidades vendidas? Produto e unidades, do maior para o menor.',solution:'SELECT produto, SUM(quantidade) AS unidades FROM vendas GROUP BY produto ORDER BY unidades DESC LIMIT 3;',ordered:true,hint:'SUM(quantidade), GROUP BY produto, ORDER BY ... DESC LIMIT 3.',insight:'Faltar o produto mais vendido na Black Friday é dinheiro deixado na mesa. Estoque se planeja por unidade, não por receita.'},
  natal:{from:'jorge',kind:'py',lang:'py',title:'Fechamento do ano',brief:'Antes do amigo secreto: faturamento total por categoria, em pandas.',solution:"vendas.groupby('categoria')['valor'].sum()",hint:"groupby('categoria')['valor'].sum()",insight:'Eletrônicos puxam a receita. O orçamento do ano que vem começa aqui.'}
};

/* ============ LOJA ============ */
const LOJA={
  roupas:[
    {id:'basica',nome:'Camiseta básica',preco:0,desc:'O clássico do primeiro dia.',shirt:'#5aa0d8'},
    {id:'select',nome:'Camiseta SELECT * FROM café',preco:180,desc:'Piada interna. Só os de dados riem.',shirt:'#2b2b33',print:true},
    {id:'moletom',nome:'Moletom de dev',preco:280,desc:'Ar-condicionado a 17 °C não te vence mais.',shirt:'#4b5563',hood:true},
    {id:'polo',nome:'Camisa polo',preco:350,desc:'Casual de sexta, todos os dias.',shirt:'#1f8a70',collar:true},
    {id:'social',nome:'Camisa social',preco:600,desc:'Para reunião com diretoria.',shirt:'#eef2f7',collar:true},
    {id:'blazer',nome:'Blazer',preco:1400,desc:'Impõe respeito em apresentação.',shirt:'#eef2f7',jacket:'#22325a',collar:true},
    {id:'terno',nome:'Terno completo',preco:3200,desc:'Roupa de quem decide orçamento.',shirt:'#eef2f7',jacket:'#2b2b2f',tie:'#b8322a',collar:true}
  ],
  acessorios:[
    {id:'oculos',nome:'Óculos de analista',preco:220,desc:'+1 de credibilidade visual.'},
    {id:'fone',nome:'Fone com cancelamento de ruído',preco:450,desc:'O Carlão no telefone vira um sussurro.'},
    {id:'cracha',nome:'Crachá dourado',preco:900,desc:'Brilha mais que dashboard em reunião.'}
  ],
  mesa:[
    {id:'planta',nome:'Planta na mesa',preco:120,desc:'+10 de energia no começo do dia.'},
    {id:'caneca',nome:'Caneca “Confia nos dados”',preco:60,desc:'Café custa a metade.'},
    {id:'pato',nome:'Patinho de borracha',preco:80,desc:'1 dica grátis por dia. Explique o código pro pato.'},
    {id:'monitor2',nome:'Segundo monitor',preco:1200,desc:'+15% de XP em todas as missões.'},
    {id:'cadeira',nome:'Cadeira ergonômica',preco:1600,desc:'Missões gastam 30% menos energia.'},
    {id:'quadro',nome:'Quadro “Em Deus confiamos, o resto traga dados”',preco:250,desc:'+5% em bônus de missão.'},
    {id:'cafeteira',nome:'Cafeteira própria',preco:2400,desc:'Café grátis e sem fila na copa.'}
  ],
  cursos:[
    {id:'c_sql1',nome:'SQL do zero ao JOIN',preco:400,desc:'+120 XP de SQL.',skill:'sql',xp:120},
    {id:'c_py1',nome:'Pandas na prática',preco:400,desc:'+120 XP de Python.',skill:'py',xp:120},
    {id:'c_neg1',nome:'Métricas de negócio',preco:500,desc:'+150 XP de Negócio.',skill:'negocio',xp:150},
    {id:'c_com1',nome:'Comunicação com dados',preco:500,desc:'+150 XP de Comunicação.',skill:'com',xp:150},
    {id:'c_sql2',nome:'SQL avançado: subconsultas e CASE',preco:1500,desc:'+350 XP de SQL.',skill:'sql',xp:350,min:2},
    {id:'c_py2',nome:'Python para automação',preco:1500,desc:'+350 XP de Python.',skill:'py',xp:350,min:2},
    {id:'c_neg2',nome:'MBA relâmpago (só os slides)',preco:3500,desc:'+600 XP de Negócio.',skill:'negocio',xp:600,min:3},
    {id:'c_ml',nome:'Machine Learning aplicado',preco:6000,desc:'+500 XP de Python e +300 de Negócio.',skill:'py',xp:500,extra:{negocio:300},min:4}
  ],
  automacoes:[
    {id:'a_vendas',nome:'Robô do relatório de vendas',preco:900,rec:'rel_vendas',req:{py:2,feitos:3},renda:90,dept:'Vendas',desc:'Script agendado envia o relatório de vendas sozinho.'},
    {id:'a_mkt',nome:'Dashboard automático de marketing',preco:1600,rec:'rel_mkt',req:{py:3,sql:3,feitos:3},renda:150,dept:'Marketing',desc:'A Bia para de pedir print do Excel.'},
    {id:'a_ops',nome:'Alerta de atrasos de entrega',preco:2600,rec:'rel_ops',req:{py:4,feitos:3},renda:220,dept:'Operações',desc:'Avisa a Neide antes do cliente ligar.'},
    {id:'a_etl',nome:'Pipeline ETL noturno',preco:6000,req:{py:5,sql:5},renda:450,desc:'Os dados chegam limpos às 7h. +10% de XP.'},
    {id:'a_ia',nome:'Agente de IA de previsões',preco:14000,req:{py:7,negocio:5},renda:1000,desc:'Previsão de vendas diária. A diretoria te ama.'}
  ]
};

/* ============ CENAS CÔMICAS ============ */
const CENAS={
  kevin_delete:[['kevin','Gente… uma pergunta hipotética.'],['kevin','O que acontece se alguém rodar DELETE FROM vendas… sem WHERE?'],['fabio','…'],['fabio','Kevin. Larga. O. Teclado.'],['chefe','KEVIN!'],['fabio','Relaxa, tem backup de ontem. Mas a gente PERDEU as vendas de hoje de manhã.'],['eu','Lição do dia: produção não é lugar de teste. E backup não é opcional.',null,{com:10}]],
  pizza:[['chefe','Preciso de um gráfico de pizza com as 37 categorias de despesa.'],['chefe','Em 3D. Com sombra. A diretoria ADORA pizza.'],{q:'O que você faz?',opts:[
    {t:'Sugerir um gráfico de barras ordenado',fx:{negocio:20,boss:-3},r:[['chefe','Barras? Hmm… é, dá pra ler. Mas eu ia gostar da sombra.']]},
    {t:'Fazer a pizza 3D, sombra e tudo',fx:{boss:6},r:[['chefe','LINDO! Ninguém entendeu nada, mas aplaudiram.']]}]}],
  reuniao:[['chefe','Reunião às 14h para alinharmos quando será a reunião de alinhamento.'],['jorge','Não podia ser um e-mail?'],['chefe','Podia. Mas aí não teria pão de queijo.'],['eu','(2 horas depois) Decidimos marcar outra reunião.',null,{energia:-10}]],
  carlao_rapidinho:[['carlao','Só um número rapidinho: vendas por região, por produto, por vendedor, comparando com o ano passado.'],['carlao','Pra daqui 5 minutos. Rapidinho mesmo.'],{q:'Como responder?',opts:[
    {t:'Alinhar prioridade e prazo realistas',fx:{com:20,rep:{Vendas:2}},r:[['carlao','Tá, amanhã de manhã serve. Você é chato, mas é confiável.']]},
    {t:'Aceitar e correr',fx:{energia:-20,rep:{Vendas:5}},r:[['carlao','VALEU! Errou duas regiões, mas valeu!']]}]}],
  impressora:[['neide','Fábio, a impressora tá piscando “PC LOAD LETTER”.'],['fabio','Já tentou desligar e ligar?'],['neide','Já. Ela respondeu “não”.'],['fabio','…isso é novo.']],
  caderno:[['neide','O sistema diz que temos 40 cadeiras no estoque.'],['neide','Meu caderninho diz 12. E o caderninho nunca errou.'],['eu','Contagem física: 12 cadeiras. O caderno venceu o ERP.'],['neide','Dado que ninguém confere vira ficção, meu filho.',null,{negocio:10}]],
  viral:[['bia','Seu dashboard tá ótimo, mas dá pra deixar ele mais… viral?'],['eu','Viral… como?'],['bia','Mais roxo. E se os números piscassem?'],['eu','(Os números não vão piscar.)']],
  nao_fecha:[['jorge','Isso aqui não fecha.'],['eu','Quanto de diferença?'],['jorge','R$ 0,03.'],['jorge','Arredondamento. Arredonda só no final, nunca no meio da conta.',null,{negocio:10}]],
  excel:[['carlao','O Excel travou. A planilha tem 1 milhão e 48 mil linhas.'],['eu','É o limite do Excel, Carlão. Essa base precisa ir para um banco de dados.'],['carlao','Banco eu conheço, é onde tá meu dinheiro.'],['eu','Te mostro como o SQL faz isso em 2 segundos.',null,{rep:{Vendas:3},com:10}]],
  cafe:[['kevin','ACABOU O CAFÉ.'],['jorge','Calma.'],['kevin','O CAFÉ, JORGE.'],['eu','A produtividade do andar caiu 40%.',null,{energia:-10}]],
  ia_tudo:[['chefe','Li no LinkedIn: precisamos de IA em tudo.'],['chefe','Até na cafeteira.'],['fabio','A cafeteira não tem nem Wi-Fi.'],['chefe','Então já começa com um projeto de infraestrutura!']],
  final_v3:[['kevin','Pode revisar minha planilha? É rapidinho.'],['eu','“relatorio_final_v3_AGORA_VAI_revisado (2).xlsx”… com 47 abas?'],['kevin','A aba 31 é a certa. Acho.'],['eu','Vamos falar sobre versionamento, Kevin.',null,{com:10}]],
  sujos:[['bia','Por que tem cliente em “SP”, “sp”, “São Paulo” e “Sampa”?'],['eu','Formulário de texto livre. Clássico.'],['bia','E o que faz?'],['eu','Padroniza na entrada com uma lista fixa. Limpar depois é sempre mais caro.',null,{negocio:10}]]
};
const CENAS_ALEATORIAS=['kevin_delete','pizza','reuniao','carlao_rapidinho','impressora','caderno','viral','nao_fecha','excel','cafe','ia_tudo','final_v3','sujos'];

/* ============ CALENDÁRIO (cada dia de jogo = uma semana do ano) ============ */
const MESES=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
const EVENTOS={
  1:{nome:'Primeiro dia',deco:null},
  3:{nome:'Planejamento anual',cena:[['chefe','Este ano somos data-driven! Por isso aprovei o orçamento com base no feeling.'],['jorge','…'],['eu','Vou anotar isso no meu caderno de frases.']]},
  7:{nome:'Carnaval',deco:'carnaval',bonus:{energia:15},cena:[['bia','Vim de fantasia de gráfico de pizza! 🎉'],['chefe','Finalmente uma pizza com poucas fatias.'],['kevin','Eu vim de bug.'],['fabio','Esse a gente já conhece.']]},
  10:{nome:'Dia da Mulher',cena:[['chefe','Hoje a diretoria homenageia as mulheres da empresa!'],['neide','Com flor ou com equiparação salarial?'],['chefe','…com flor, por enquanto.'],['bia','Anotado, Seu Ronaldo. Anotadíssimo.']]},
  14:{nome:'Páscoa',deco:'pascoa',bonus:{energia:20},cena:[['kevin','Tem ovo de chocolate na copa!'],['jorge','Classifiquei o ovo como despesa de bem-estar.'],['eu','+20 de energia no açúcar.']]},
  18:{nome:'Dia do Trabalhador',bonus:{dinheiro:200},cena:[['chefe','Feliz Dia do Trabalhador! Como presente… um vale de R$ 200.'],['carlao','E a folga?'],['chefe','A folga é o vale.']]},
  19:{nome:'Dia das Mães',missao:'maes',cena:[['bia','Campanha de Dia das Mães! Preciso dos dados ONTEM.'],['eu','Pode deixar, sai hoje.']]},
  24:{nome:'Festa Junina',deco:'junina',bonus:{energia:20},cena:[['chefe','Arraiá da firma! Vim de caipira executivo.'],['neide','Fiz o quentão. Não pergunte a receita.'],['kevin','Ganhei no correio elegante: “Seu código compila no meu coração.”'],['fabio','Quem mandou isso?'],['bia','👀']]},
  32:{nome:'Dia dos Pais',cena:[['carlao','Meu filho disse que quer ser vendedor igual eu.'],['jorge','Coitado.'],['carlao','Ele é ótimo! Já me vendeu um videogame.']]},
  37:{nome:'Dia do Programador',deco:'prog',bonus:{energia:15},cena:[['fabio','Hoje é o 256º dia do ano. Nosso dia.'],['fabio','Pedi pizza. 8 bits de calabresa.'],['chefe','Então essa é a famosa pizza que vocês tanto pedem!']]},
  41:{nome:'Dia das Crianças',cena:[['kevin','Trouxe meu sobrinho pra conhecer o escritório.'],['eu','Ele está… no seu computador?'],['kevin','Ele que fez minha última query.'],['chefe','E ficou melhor que as suas.']]},
  44:{nome:'Halloween',deco:'halloween',cena:[['bia','Hoje vou contar a história mais assustadora do mundo corporativo.'],['bia','Era uma vez uma planilha… SEM BACKUP.'],['kevin','Para! Para!']]},
  47:{nome:'Black Friday',deco:'bf',mult:2,missao:'blackfriday',cena:[['carlao','BLACK FRIDAY! Missões valem o dobro hoje!'],['jorge','E o lucro?'],['carlao','O lucro a gente vê em dezembro.'],['jorge','É isso que me preocupa.']]},
  51:{nome:'Natal',deco:'natal',bonus:{decimo:true},missao:'natal',cena:[['chefe','Amigo secreto!'],['kevin','Tirei o Seu Ronaldo. Comprei uma caneca: “Melhor chefe do mundo (segundo ele mesmo)”.'],['chefe','…adorei.'],['jorge','E o 13º salário caiu na conta. Isso fecha.']]},
  52:{nome:'Réveillon',deco:'reveillon',cena:[['chefe','Ano que vem: mais dados, menos achismo!'],['eu','Meta registrada. E dessa vez com indicador.']]}
};
const ANIVERSARIOS={5:'jorge',12:'bia',28:'neide',35:'carlao',45:'kevin',49:'fabio'};

/* ============ FALAS SOLTAS ============ */
const FALAS={
  chefe:['Precisamos de mais sinergia entre as áreas. Não sei o que é, mas precisamos.','Meu sobrinho disse que IA resolve tudo. Já resolveu o seu relatório?','Lembre: dado sem decisão é só curiosidade cara.','Gráfico de pizza é subestimado. Pense nisso.'],
  bia:['Esse mês a meta é engajamento. Ou conversão. Os dois! Tudo!','Você acha que o algoritmo do Instagram gosta de mim?','Dashboard sem roxo é só uma tabela triste.','O TikTok trouxe 300 vendas. Ou 30. Confere pra mim?'],
  carlao:['Cliente bom é cliente que paga. O resto é estatística.','Fechei com o Hotel Mirante! Coloca no sistema aí.','Sabia que o Excel aguenta 1 milhão de linhas? Eu testei. Eu descobri.','Se o número não for bom, arredonda pra cima.'],
  neide:['Trinta anos de operação, meu filho. Já vi três ERPs morrerem.','A TartaLog atrasou de novo. Anota aí.','Dado bom é dado conferido.','Quer um café? Fui eu que fiz, é forte.'],
  jorge:['Isso aqui não fecha.','Receita não é lucro. Repita comigo.','Planilha de orçamento: versão 14. Ainda não fecha.','Toda reunião deveria ter um custo por minuto no canto da tela.'],
  kevin:['Achei um atalho que apaga tudo! Quer dizer… salva. Salva tudo.','Você usa SELECT * em produção? Eu uso. Não devia?','Meu código funciona e eu não sei por quê. Isso é normal?','Fiz um dashboard com 48 gráficos!'],
  fabio:['Já tentou desligar e ligar?','A senha não pode ser “senha123”. Nem “Senha123”.','O servidor caiu porque alguém rodou um SELECT sem LIMIT em 80 milhões de linhas.','Não, eu não consigo recuperar o arquivo que você salvou por cima.']
};
if(typeof module!=='undefined')module.exports={MISSOES,RECORRENTES,MISSOES_EVENTO};
MISSOES.forEach(m=>{if(!m.lang&&m.kind!=='quiz')m.lang=m.kind;});
