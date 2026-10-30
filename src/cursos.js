/* ============ CURSOS: aulas + prova final ============ */
const CURSOS={
 c_sql1:{aulas:[
  {titulo:'SELECT e FROM: pedindo dados ao banco',blocos:[
   ['p','Toda consulta começa dizendo **o que** você quer (SELECT) e **de onde** (FROM). O banco devolve uma tabela.'],
   ['code','sql','SELECT produto, valor\nFROM vendas\nLIMIT 5'],
   ['p','`LIMIT` corta o resultado. Use sempre que estiver explorando: em produção, tabelas podem ter milhões de linhas.'],
   ['tip','`SELECT *` traz todas as colunas. É ótimo para espiar a tabela, mas em relatório escolha só as colunas que precisa: fica mais rápido e mais claro.']]},
  {titulo:'WHERE: filtrando linhas',blocos:[
   ['p','O `WHERE` mantém só as linhas que passam na condição. Texto vai entre **aspas simples**.'],
   ['code','sql',"SELECT * FROM vendas\nWHERE canal = 'App' AND valor > 1000"],
   ['list',['`=`, `<>`, `>`, `<`, `>=`, `<=`: comparações','`AND`, `OR`, `NOT`: combinam condições','`IN (\'Sul\', \'Norte\')`: está na lista','`BETWEEN 1000 AND 3000`: dentro do intervalo','`LIKE \'Note%\'`: começa com “Note”']],
   ['code','sql',"SELECT produto, valor FROM vendas\nWHERE regiao IN ('Sul', 'Norte')\n  AND valor BETWEEN 1000 AND 4000"]]},
  {titulo:'Agregações: resumindo números',blocos:[
   ['p','Funções de agregação transformam muitas linhas em um número: `COUNT` (conta), `SUM` (soma), `AVG` (média), `MIN` e `MAX`.'],
   ['code','sql','SELECT COUNT(*) AS pedidos,\n       SUM(valor) AS faturamento,\n       AVG(valor) AS ticket_medio,\n       MAX(valor) AS maior_pedido\nFROM vendas'],
   ['tip','`AS` dá nome à coluna do resultado. Nome claro é meio caminho para quem vai ler o relatório.']]},
  {titulo:'GROUP BY e HAVING',blocos:[
   ['p','`GROUP BY` faz a agregação **por grupo**. Toda coluna no SELECT que não está agregada precisa estar no GROUP BY.'],
   ['code','sql','SELECT vendedor, SUM(valor) AS total\nFROM vendas\nGROUP BY vendedor'],
   ['p','`HAVING` filtra **depois** de agrupar. `WHERE` filtra **antes**. Por isso condição sobre SUM ou COUNT vai no HAVING.'],
   ['code','sql',"SELECT vendedor, SUM(valor) AS total\nFROM vendas\nWHERE canal <> 'Loja'\nGROUP BY vendedor\nHAVING SUM(valor) > 20000"]]},
  {titulo:'JOIN: juntando tabelas',blocos:[
   ['p','As informações ficam espalhadas: o pedido está em `vendas`, o segmento do cliente em `clientes`. O `JOIN` liga as duas pela chave.'],
   ['code','sql','SELECT c.segmento, COUNT(*) AS pedidos, SUM(v.valor) AS total\nFROM vendas v\nJOIN clientes c ON v.cliente_id = c.id\nGROUP BY c.segmento'],
   ['p','`v` e `c` são apelidos das tabelas. `JOIN` (ou INNER JOIN) mantém só quem existe nos dois lados. `LEFT JOIN` mantém tudo da tabela da esquerda, mesmo sem par.'],
   ['tip','Antes de confiar num JOIN, conte as linhas antes e depois. Se aumentou sem motivo, a chave tem duplicados.']]}
  ],quiz:[
  {q:'Você quer o faturamento por região, só das regiões que passam de R$ 30 mil. Onde vai a condição do total?',o:['HAVING SUM(valor) > 30000','WHERE SUM(valor) > 30000','ORDER BY SUM(valor) > 30000'],a:0,e:'Condição sobre agregação vai no HAVING, que roda depois do GROUP BY.'},
  {q:'Qual consulta traz pedidos do Sul OU do Norte?',o:["WHERE regiao IN ('Sul', 'Norte')","WHERE regiao = 'Sul' AND regiao = 'Norte'","WHERE regiao = 'Sul, Norte'"],a:0,e:'IN testa se o valor está na lista. AND exigiria as duas regiões ao mesmo tempo, o que nunca acontece.'},
  {q:'Depois de um JOIN, o número de linhas dobrou sem explicação. O que provavelmente aconteceu?',o:['A chave tem valores duplicados em uma das tabelas','O banco está lento','Faltou um LIMIT'],a:0,e:'Cada linha casa com todas as linhas de mesma chave do outro lado. Chave duplicada multiplica linhas.'}]},

 c_py1:{aulas:[
  {titulo:'DataFrame e Series',blocos:[
   ['p','**DataFrame** é a tabela. **Series** é uma coluna. As tabelas da empresa já estão carregadas: `vendas`, `clientes`, `campanhas`, `entregas`.'],
   ['code','py','print(vendas.shape)\nvendas.head()'],
   ['code','py','coluna = vendas["valor"]   # isto é uma Series\nprint(coluna.sum(), coluna.mean(), coluna.max())']]},
  {titulo:'Selecionar e filtrar',blocos:[
   ['cmp','SELECT produto, valor FROM vendas','vendas[["produto", "valor"]]'],
   ['cmp',"SELECT * FROM vendas WHERE valor > 3000 AND canal = 'Site'",'vendas[(vendas["valor"] > 3000) & (vendas["canal"] == "Site")]','Cada condição entre parênteses, e & no lugar de AND.'],
   ['tip','Leia `vendas[condição]` como “vendas, onde condição”.']]},
  {titulo:'groupby e agg',blocos:[
   ['cmp','SELECT regiao, SUM(valor) FROM vendas GROUP BY regiao','vendas.groupby("regiao")["valor"].sum()'],
   ['cmp','SELECT regiao, SUM(valor) AS total, COUNT(id) AS pedidos\nFROM vendas GROUP BY regiao','vendas.groupby("regiao").agg(total=("valor", "sum"), pedidos=("id", "count"))'],
   ['p','Funções disponíveis no agg: `sum`, `mean`, `count`, `min`, `max`, `median`, `nunique`.']]},
  {titulo:'Ordenar, top N e contagens',blocos:[
   ['cmp','SELECT produto, SUM(valor) AS total FROM vendas\nGROUP BY produto ORDER BY total DESC LIMIT 3','vendas.groupby("produto")["valor"].sum().sort_values(ascending=False).head(3)'],
   ['code','py','vendas["canal"].value_counts()'],
   ['tip','`value_counts()` é o atalho para “quantos de cada?”. Com `normalize=True` devolve proporções.']]},
  {titulo:'merge: o JOIN do pandas',blocos:[
   ['cmp','SELECT * FROM vendas v JOIN clientes c ON v.cliente_id = c.id','pd.merge(vendas, clientes, left_on="cliente_id", right_on="id")'],
   ['p','Use `how="left"` para um LEFT JOIN. Depois do merge, você pode filtrar e agrupar normalmente.'],
   ['code','py','juntas = pd.merge(vendas, clientes, left_on="cliente_id", right_on="id")\njuntas.groupby("segmento")["valor"].mean().round(2)']]}
  ],quiz:[
  {q:'Como filtrar vendas do App com valor acima de 1000?',o:['vendas[(vendas["canal"] == "App") & (vendas["valor"] > 1000)]','vendas[vendas["canal"] == "App" and vendas["valor"] > 1000]','vendas.where(canal = "App", valor > 1000)'],a:0,e:'Com tabelas use & e parênteses em cada condição. and não funciona com colunas inteiras.'},
  {q:'O que `vendas.groupby("canal")["valor"].mean()` devolve?',o:['O ticket médio de cada canal','A média geral de valor','A quantidade de vendas por canal'],a:0,e:'Agrupa por canal, pega a coluna valor e calcula a média de cada grupo.'},
  {q:'Qual é o equivalente de LEFT JOIN no merge?',o:['how="left"','left=True','join="left_outer"'],a:0,e:'O parâmetro how define o tipo de junção: inner (padrão) ou left.'}]},

 c_neg1:{aulas:[
  {titulo:'Faturamento e ticket médio',blocos:[
   ['p','**Faturamento** é quanto entrou. **Ticket médio** é faturamento ÷ pedidos. Receita cresce por três alavancas: mais clientes, mais pedidos por cliente ou ticket maior.'],
   ['code','sql','SELECT canal, SUM(valor) AS faturamento, COUNT(*) AS pedidos,\n       SUM(valor) / COUNT(*) AS ticket_medio\nFROM vendas GROUP BY canal'],
   ['tip','Ticket alto com poucos pedidos e ticket baixo com muitos pedidos podem dar o mesmo faturamento. A estratégia para cada caso é diferente.']]},
  {titulo:'Funil: CTR e conversão',blocos:[
   ['p','O funil de marketing tem etapas: impressão → clique → venda. **CTR** = cliques ÷ impressões (o anúncio chama atenção?). **Conversão** = vendas ÷ cliques (a página convence?).'],
   ['code','sql','SELECT canal,\n  SUM(cliques) AS cliques,\n  SUM(conversoes) AS vendas,\n  SUM(conversoes) * 100.0 / SUM(cliques) AS conversao_pct\nFROM campanhas GROUP BY canal ORDER BY conversao_pct DESC'],
   ['tip','Conversão baixa costuma ser problema da página ou da oferta, não do anúncio.']]},
  {titulo:'ROI e CAC',blocos:[
   ['p','**ROI** = (receita − investimento) ÷ investimento: quanto cada real voltou. **CAC** = investimento ÷ clientes novos: quanto custa conquistar um cliente.'],
   ['code','py','por_canal = campanhas.groupby("canal").agg(inv=("investimento", "sum"), rec=("receita", "sum"), conv=("conversoes", "sum"))\npor_canal["roi"] = (por_canal["rec"] - por_canal["inv"]) / por_canal["inv"]\npor_canal["cac"] = por_canal["inv"] / por_canal["conv"]\npor_canal.sort_values("roi", ascending=False)'],
   ['tip','ROI alto em canal pequeno nem sempre escala. Investir o dobro raramente traz o dobro de retorno.']]},
  {titulo:'Churn e retenção',blocos:[
   ['p','**Churn** é o percentual de clientes que cancelaram no período. Com churn de 20%, você precisa repor um em cada cinco clientes só para ficar no mesmo lugar.'],
   ['code','sql','SELECT segmento,\n  COUNT(*) AS clientes,\n  SUM(CASE WHEN ativo = 0 THEN 1 ELSE 0 END) * 100.0 / COUNT(*) AS churn_pct\nFROM clientes GROUP BY segmento'],
   ['tip','Reter costuma custar bem menos que adquirir. Por isso churn é uma das métricas que a diretoria mais olha.']]}
  ],quiz:[
  {q:'Uma campanha tem muitos cliques e pouquíssimas vendas. Onde investigar primeiro?',o:['Na página de destino e na oferta','No criativo do anúncio','No orçamento'],a:0,e:'Se o anúncio gera cliques, ele atrai. Se não converte, o problema costuma estar depois do clique.'},
  {q:'Investimento de R$ 10 mil, receita de R$ 25 mil. Qual o ROI?',o:['150%','250%','40%'],a:0,e:'(25 − 10) ÷ 10 = 1,5, ou seja, 150%.'},
  {q:'O que significa CAC?',o:['Custo para adquirir um cliente','Clientes ativos no ciclo','Custo anual de campanhas'],a:0,e:'CAC = investimento em aquisição ÷ clientes conquistados.'}]},

 c_com1:{aulas:[
  {titulo:'Comece pela conclusão',blocos:[
   ['p','Quem decide tem pouco tempo. Abra com a **resposta** e o **impacto**; os detalhes vêm depois, se pedirem. É a chamada pirâmide invertida.'],
   ['code','txt','RUIM:  "Analisei 60 pedidos de 6 meses em 3 canais e cruzei com..."\nBOM:   "O App tem o maior ticket (R$ 3,4 mil). Proponho uma campanha\n        de push para dobrar os pedidos lá. Detalhes no anexo."'],
   ['tip','Teste do elevador: se você só tivesse 30 segundos, o que diria? Isso é a primeira frase.']]},
  {titulo:'Escolhendo o gráfico certo',blocos:[
   ['list',['**Comparar categorias**: barras (horizontais se os nomes forem longos)','**Evolução no tempo**: linha','**Parte de um todo** com até 4 fatias: pizza ou barra empilhada; com mais, barras','**Relação entre duas medidas**: dispersão','**Um número importante**: número grande, sem gráfico']],
   ['tip','Pizza com 37 fatias (oi, Seu Ronaldo) é uma tabela que ninguém consegue ler. Ordene as barras do maior para o menor.']]},
  {titulo:'Número sem comparação não diz nada',blocos:[
   ['p','“Faturamos R$ 11 mil em maio” é bom ou ruim? Sem referência, ninguém sabe. Compare com o mês anterior, com a meta ou com o mesmo período do ano passado.'],
   ['code','sql','SELECT mes, SUM(valor) AS faturamento\nFROM vendas GROUP BY mes ORDER BY mes'],
   ['p','Com a série completa fica claro: maio e junho caíram muito em relação a março e abril. Agora sim é uma informação.']]},
  {titulo:'Resumo executivo em 5 linhas',blocos:[
   ['code','txt','1. Conclusão:     o que descobrimos (uma frase)\n2. Evidência:     o número que sustenta (com comparação)\n3. Impacto:       quanto vale em R$ ou em clientes\n4. Recomendação:  o que fazer, com dono e prazo\n5. Risco:         o que pode dar errado ou o que ainda não sabemos'],
   ['tip','Termine sempre com um pedido claro: “preciso da aprovação de R$ X até sexta”. Análise sem pedido vira só curiosidade.']]}
  ],quiz:[
  {q:'Você tem 2 minutos com o diretor. Como começa?',o:['Com a recomendação e o impacto','Com a metodologia','Com todos os gráficos'],a:0,e:'Executivos decidem pela conclusão. A metodologia é seu respaldo, não seu roteiro.'},
  {q:'Qual gráfico mostra melhor o faturamento dos últimos 12 meses?',o:['Linha','Pizza','Dispersão'],a:0,e:'Evolução no tempo pede linha.'},
  {q:'“O churn foi 5% em junho.” O que falta para essa frase ser útil?',o:['Uma comparação: mês anterior, meta ou mercado','Mais casas decimais','Um gráfico 3D'],a:0,e:'Sem referência ninguém sabe se 5% é bom ou ruim.'}]},

 c_sql2:{aulas:[
  {titulo:'CASE WHEN: criando categorias',blocos:[
   ['p','`CASE WHEN` cria uma coluna nova a partir de regras. As condições são testadas em ordem; a primeira verdadeira vence.'],
   ['code','sql',"SELECT CASE WHEN valor >= 3000 THEN 'Alto'\n            WHEN valor >= 1000 THEN 'Médio'\n            ELSE 'Baixo' END AS faixa,\n       COUNT(*) AS pedidos\nFROM vendas\nGROUP BY CASE WHEN valor >= 3000 THEN 'Alto'\n              WHEN valor >= 1000 THEN 'Médio'\n              ELSE 'Baixo' END"],
   ['code','sql',"SELECT SUM(CASE WHEN canal = 'App' THEN valor ELSE 0 END) AS app,\n       SUM(CASE WHEN canal <> 'App' THEN valor ELSE 0 END) AS outros\nFROM vendas"],
   ['tip','`SUM(CASE WHEN ... THEN 1 ELSE 0 END)` é o jeito clássico de contar só o que interessa dentro de um agrupamento.']]},
  {titulo:'Subconsultas',blocos:[
   ['p','Uma subconsulta é uma consulta dentro da outra. Útil para comparar cada linha com um valor geral.'],
   ['code','sql','SELECT produto, valor\nFROM vendas\nWHERE valor > (SELECT AVG(valor) FROM vendas)\nORDER BY valor DESC\nLIMIT 5'],
   ['p','Também serve como lista: `WHERE id IN (SELECT ...)`.']]},
  {titulo:'Anti-join: quem está de fora',blocos:[
   ['p','“Clientes que nunca compraram”, “produtos sem estoque”: perguntas sobre ausência. Duas formas clássicas:'],
   ['code','sql','SELECT c.nome\nFROM clientes c\nLEFT JOIN vendas v ON v.cliente_id = c.id\nWHERE v.id IS NULL'],
   ['code','sql','SELECT nome FROM clientes\nWHERE id NOT IN (SELECT cliente_id FROM vendas)'],
   ['tip','Cuidado: se a subconsulta do NOT IN tiver algum NULL, em bancos reais o resultado pode vir vazio. O LEFT JOIN é mais seguro.']]},
  {titulo:'DISTINCT e duplicidades',blocos:[
   ['p','`COUNT(DISTINCT x)` conta valores únicos. Compare com `COUNT(x)` para descobrir se há repetição.'],
   ['code','sql','SELECT COUNT(cliente_id) AS pedidos,\n       COUNT(DISTINCT cliente_id) AS clientes_unicos\nFROM vendas'],
   ['p','Aqui, 60 pedidos vêm de 16 clientes: em média, quase 4 pedidos por cliente. Isso é recorrência, um ótimo sinal.']]},
  {titulo:'WITH: organizando consultas grandes',blocos:[
   ['p','`WITH` (CTE) dá nome a um passo intermediário. A consulta fica legível de cima para baixo, como uma receita.'],
   ['code','sql','WITH por_vendedor AS (\n  SELECT vendedor, SUM(valor) AS total\n  FROM vendas GROUP BY vendedor\n)\nSELECT vendedor, total\nFROM por_vendedor\nWHERE total > 30000'],
   ['tip','Consulta com 4 subconsultas aninhadas é difícil de revisar. Quebre em CTEs com nomes que expliquem cada passo.']]}
  ],quiz:[
  {q:'Para achar clientes sem nenhuma compra, qual padrão usar?',o:['LEFT JOIN vendas ... WHERE v.id IS NULL','INNER JOIN vendas ... WHERE v.id IS NULL','GROUP BY cliente HAVING COUNT(*) = 0 direto em vendas'],a:0,e:'O LEFT JOIN mantém todos os clientes; quem não tem venda fica com NULL do lado de vendas.'},
  {q:'Em um CASE WHEN com várias condições verdadeiras, qual vale?',o:['A primeira, de cima para baixo','A última','A mais específica'],a:0,e:'O CASE para na primeira condição verdadeira. Ordem importa.'},
  {q:'COUNT(id) = 60 e COUNT(DISTINCT cliente_id) = 16. O que isso indica?',o:['Clientes compram mais de uma vez','Há erro no banco','Há 60 clientes'],a:0,e:'São 60 pedidos de 16 clientes diferentes: recorrência.'}]},

 c_py2:{aulas:[
  {titulo:'Variáveis, tipos e f-strings',blocos:[
   ['p','Os tipos básicos: número inteiro (`int`), número com vírgula (`float`), texto (`str`) e verdadeiro/falso (`bool`).'],
   ['code','py','cliente = "Hotel Mirante"\npedidos = 4\nvalor = 3500.0\nativo = True\nprint(f"{cliente}: {pedidos} pedidos, R$ {valor:,.2f}, ativo={ativo}")'],
   ['tip','`{valor:,.2f}` usa vírgula para milhar e ponto para decimal, no padrão americano. Para o padrão brasileiro, troque depois: `texto.replace(",", "X").replace(".", ",").replace("X", ".")`.']]},
  {titulo:'Listas e dicionários',blocos:[
   ['code','py','regioes = ["Sudeste", "Sul", "Nordeste"]\nregioes.append("Norte")\nprint(regioes, len(regioes))\n\nmeta = {"Sudeste": 100000, "Sul": 40000}\nmeta["Nordeste"] = 30000\nprint(meta.get("Norte", 0))   # get com valor padrão evita erro'],
   ['p','Lista para coisas em sequência; dicionário para buscar por nome. Uma lista de dicionários é basicamente uma tabela.']]},
  {titulo:'for e if',blocos:[
   ['code','py','metas = {"Sudeste": 100000, "Sul": 40000, "Nordeste": 30000}\nfor regiao, meta in metas.items():\n    real = vendas[vendas["regiao"] == regiao]["valor"].sum()\n    status = "bateu" if real >= meta else "não bateu"\n    print(f"{regiao}: {real:,.0f} de {meta:,.0f} ({status})")'],
   ['tip','`x if condição else y` é um if de uma linha só. Ótimo para rótulos simples.']]},
  {titulo:'Funções',blocos:[
   ['code','py','def resumo_regiao(regiao):\n    dados = vendas[vendas["regiao"] == regiao]\n    return {\n        "regiao": regiao,\n        "pedidos": len(dados),\n        "faturamento": dados["valor"].sum(),\n    }\n\nresumo_regiao("Sul")'],
   ['p','Funções deixam o código reutilizável: o mesmo resumo serve para qualquer região, mês ou vendedor.']]},
  {titulo:'Automatizando um relatório',blocos:[
   ['p','Juntando tudo: um relatório que percorre todas as regiões e monta o texto sozinho. Agendado num servidor, ele roda todo dia sem ninguém apertar botão.'],
   ['code','py','def relatorio():\n    total = vendas["valor"].sum()\n    linhas = ["RELATÓRIO DE VENDAS"]\n    for regiao in sorted(vendas["regiao"].unique()):\n        fat = vendas[vendas["regiao"] == regiao]["valor"].sum()\n        linhas.append(f"- {regiao}: R$ {fat:,.0f} ({fat / total:.1%})")\n    linhas.append(f"TOTAL: R$ {total:,.0f}")\n    return "\\n".join(linhas)\n\nprint(relatorio())'],
   ['tip','No mundo real, o passo seguinte seria enviar esse texto por e-mail ou Slack e agendar com cron, Airflow ou o agendador da nuvem.']]}
  ],quiz:[
  {q:'O que o código abaixo imprime?\n\nfor x in [1, 2, 3]:\n    if x == 2:\n        continue\n    print(x)',o:['1 e 3','1, 2 e 3','Só 2'],a:0,e:'continue pula para o próximo item, então o 2 não é impresso.'},
  {q:'Qual a vantagem de `meta.get("Norte", 0)` sobre `meta["Norte"]`?',o:['Não dá erro se a chave não existir','É mais rápido','Cria a chave automaticamente'],a:0,e:'get devolve o valor padrão quando a chave não existe, em vez de KeyError.'},
  {q:'O que faz `return` dentro de uma função?',o:['Devolve o resultado e encerra a função','Imprime o resultado','Repete a função'],a:0,e:'return entrega o valor para quem chamou a função e para a execução dela.'}]},

 c_neg2:{aulas:[
  {titulo:'Unit economics: LTV e CAC',blocos:[
   ['p','**LTV** é quanto um cliente deixa de margem durante toda a relação. **CAC** é quanto custou conquistá-lo. Regra de bolso: LTV ÷ CAC acima de 3 é saudável.'],
   ['code','py','ticket = 1500          # por pedido\npedidos_por_ano = 4\nmargem = 0.30\nanos_como_cliente = 2\nltv = ticket * pedidos_por_ano * margem * anos_como_cliente\ncac = 1200\nprint(f"LTV: R$ {ltv:,.0f} | CAC: R$ {cac:,.0f} | LTV/CAC: {ltv / cac:.1f}")']]},
  {titulo:'Margem e desconto',blocos:[
   ['p','Desconto parece pequeno no preço e é enorme no lucro. Com margem de 30%, um desconto de 10% derruba o lucro por unidade em um terço.'],
   ['code','py','preco, custo = 100, 70\nfor desconto in [0, 0.10, 0.20, 0.30]:\n    novo = preco * (1 - desconto)\n    lucro = novo - custo\n    precisa = (preco - custo) / lucro if lucro > 0 else None\n    print(f"desconto {desconto:.0%}: lucro R$ {lucro:.0f} por unidade; volume necessário: {precisa}x" if precisa else f"desconto {desconto:.0%}: vende sem lucro")'],
   ['tip','Antes de apoiar uma promoção, calcule quanto o volume precisa crescer para empatar o lucro.']]},
  {titulo:'Pareto: os 20% que fazem 80%',blocos:[
   ['p','Em muitos negócios, poucos clientes ou produtos concentram a maior parte da receita. Saber quem são muda prioridades de atendimento e estoque.'],
   ['code','py','por_cliente = vendas.groupby("cliente_id")["valor"].sum().sort_values(ascending=False)\nacumulado = por_cliente.cumsum() / por_cliente.sum()\nprint(f"{len(por_cliente)} clientes compraram")\nprint(f"Os 4 maiores fazem {acumulado.head(4).max():.0%} da receita")']]},
  {titulo:'Teste A/B sem se enganar',blocos:[
   ['p','Num teste A/B, metade vê a versão A e metade a B. Diferença pequena com pouca gente pode ser só sorte. O **p-valor** mede isso: abaixo de 0,05 costuma ser considerado sinal; acima, trate como empate.'],
   ['list',['Defina a métrica e o tamanho da amostra **antes** de começar','Não pare o teste no primeiro dia em que a B “ganhou”','Um teste por vez na mesma página','Ganho de 0,2 ponto com p-valor 0,30 é empate, não vitória']]]}
  ],quiz:[
  {q:'LTV de R$ 3.600 e CAC de R$ 1.200. Como está a saúde da aquisição?',o:['Saudável: LTV/CAC = 3','Ruim: LTV/CAC = 0,3','Impossível saber'],a:0,e:'3.600 ÷ 1.200 = 3, o limite de bolso para considerar saudável.'},
  {q:'Margem de 30% e desconto de 30%. O que acontece?',o:['Vende sem lucro','Lucro cai 30%','Lucro cai 10%'],a:0,e:'O desconto consome toda a margem: o preço novo cobre só o custo.'},
  {q:'B converteu 3,2% contra 3,0% de A, com p-valor 0,30. O que fazer?',o:['Tratar como empate ou continuar o teste','Trocar para B','Voltar para A'],a:0,e:'p-valor alto indica que a diferença pode ser acaso.'}]},

 c_ml:{aulas:[
  {titulo:'O que é (e o que não é) Machine Learning',blocos:[
   ['p','Machine Learning é ensinar o computador a achar padrões em exemplos do passado para prever casos novos. Não é mágica e não funciona sem dados históricos confiáveis.'],
   ['list',['**Prever um número** (quanto vamos vender?): regressão','**Prever uma categoria** (o cliente vai cancelar?): classificação','**Agrupar parecidos** sem resposta prévia: clusterização']],
   ['tip','Se uma regra simples resolve 90% do problema, comece pela regra. Modelo é para quando a regra não dá conta.']]},
  {titulo:'Features e target',blocos:[
   ['p','O **target** é o que você quer prever (ex.: `ativo`). As **features** são as informações que ajudam a prever (ex.: quantos pedidos o cliente fez, quanto gastou).'],
   ['code','py','compras = vendas.groupby("cliente_id").agg(pedidos=("id", "count"), gasto=("valor", "sum")).reset_index()\nbase = pd.merge(clientes, compras, left_on="id", right_on="cliente_id", how="left")\nbase["pedidos"] = base["pedidos"].fillna(0)\nbase[["nome", "pedidos", "gasto", "ativo"]].head(8)'],
   ['tip','80% do trabalho de ML é montar essa tabela de features direito. O algoritmo é a parte curta.']]},
  {titulo:'Treino, teste e overfitting',blocos:[
   ['p','Separe os dados: uma parte para **treinar** e outra, nunca vista pelo modelo, para **testar**. Um modelo que acerta tudo no treino e erra no teste decorou em vez de aprender: isso é **overfitting**.'],
   ['code','txt','from sklearn.model_selection import train_test_split\nX_treino, X_teste, y_treino, y_teste = train_test_split(X, y, test_size=0.3)\nmodelo.fit(X_treino, y_treino)\nmodelo.score(X_teste, y_teste)   # a nota que importa'],
   ['p','Esse exemplo usa scikit-learn, que roda no Python de verdade (Google Colab, por exemplo), não aqui no simulador.']]},
  {titulo:'Métricas: acurácia, precisão e recall',blocos:[
   ['p','Imagine prever cancelamentos. **Acurácia**: quanto acertou no total. **Precisão**: dos que o modelo disse que iam cancelar, quantos cancelaram. **Recall**: dos que cancelaram, quantos o modelo pegou.'],
   ['code','py','vp, fp, fn, vn = 30, 10, 20, 140   # verdadeiro/falso positivo e negativo\nacuracia = (vp + vn) / (vp + fp + fn + vn)\nprecisao = vp / (vp + fp)\nrecall = vp / (vp + fn)\nprint(f"Acurácia {acuracia:.0%} | Precisão {precisao:.0%} | Recall {recall:.0%}")'],
   ['tip','Com poucos cancelamentos na base, acurácia engana: dizer “ninguém cancela” acerta muito e não serve para nada.']]},
  {titulo:'Sempre comece por um baseline',blocos:[
   ['p','Antes de qualquer modelo, crie uma regra simples e meça. O modelo só vale a pena se for claramente melhor.'],
   ['code','py','compras = vendas.groupby("cliente_id")["id"].count()\nclientes["pedidos"] = clientes["id"].map(dict(zip(compras.index, compras.values))).fillna(0)\nclientes["previsto_ativo"] = np.where(clientes["pedidos"] >= 3, 1, 0)\nacerto = (clientes["previsto_ativo"] == clientes["ativo"]).mean()\nprint(f"Regra “3 ou mais pedidos = ativo” acerta {acerto:.0%}")']]}
  ],quiz:[
  {q:'O modelo acerta 99% no treino e 60% no teste. O que aconteceu?',o:['Overfitting: decorou os dados de treino','O teste está errado','É um ótimo modelo'],a:0,e:'A nota que importa é a do teste. Diferença grande indica que o modelo não generaliza.'},
  {q:'Prever “vai cancelar: sim ou não” é um problema de…',o:['Classificação','Regressão','Clusterização'],a:0,e:'O resultado é uma categoria.'},
  {q:'Por que começar com uma regra simples (baseline)?',o:['Para saber se o modelo realmente melhora alguma coisa','Porque modelos são proibidos no começo','Para economizar memória'],a:0,e:'Sem baseline não dá para saber se a complexidade do modelo se paga.'}]}
};
