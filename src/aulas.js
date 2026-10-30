/* ============ MENTORA TEREZA: aulas diárias ============
 Formato de bloco:
   ['p', texto]                    parágrafo (aceita `código` e **negrito**)
   ['code', 'sql'|'py'|'txt', código]  exemplo (sql e py são executáveis)
   ['cmp', sql, py, legenda]       mesma consulta em SQL e em pandas, lado a lado
   ['tip', texto]                  dica destacada
   ['list', [itens]]               lista curta
*/
NPCS.tereza={nome:'Tereza',cargo:'Cientista de Dados Sênior',dept:'Dados',skin:'#8d5a3b',hair:'#1f1610',shirt:'#2a9d8f',pants:'#3b3561',long:true,glasses:true};
FALAS.tereza=['Código bom é código que outra pessoa entende. Inclusive você daqui a seis meses.','Errar a query é normal. Entregar sem conferir é que não pode.','Antes de abrir o Python, me diz: qual pergunta de negócio você quer responder?','SQL e pandas são duas línguas para a mesma conversa.'];

const TEREZA=[
 {id:'t01',titulo:'Python é uma calculadora com memória',skill:'py',blocos:[
  ['p','Em SQL você pede dados para o banco. Em Python você guarda valores em **variáveis** e faz contas com elas. Uma variável é só um nome que aponta para um valor.'],
  ['code','py',`faturamento = 108330
pedidos = 60
ticket = faturamento / pedidos
print(f"Ticket médio: R$ {ticket:.2f}")`],
  ['p','O `f` antes das aspas cria uma **f-string**: tudo que estiver entre `{ }` vira o valor da variável. O `:.2f` formata com 2 casas decimais.'],
  ['tip','Nomes de variáveis em Python usam letras minúsculas e _ no lugar de espaço: `ticket_medio`, não `Ticket Médio`.']],
  desafio:{lang:'py',enunciado:'Crie `investimento = 5000` e `receita = 12000`, calcule o ROI, que é (receita − investimento) ÷ investimento, e deixe `roi` sozinho na última linha.',starter:'investimento = 5000\nreceita = 12000\n',solution:'investimento = 5000\nreceita = 12000\nroi = (receita - investimento) / investimento\nroi'}},
 {id:'t02',titulo:'Listas: a coluna antes da coluna',skill:'py',blocos:[
  ['p','Uma **lista** guarda vários valores em ordem, entre colchetes. Pense nela como uma coluna de tabela sem nome.'],
  ['code','py',`pedidos = [120, 340, 90, 510]
print(len(pedidos))   # quantos itens: COUNT
print(sum(pedidos))   # soma: SUM
print(max(pedidos))   # maior: MAX
pedidos[0]            # o primeiro item (começa no zero!)`],
  ['tip','Em Python a contagem começa no **zero**: `pedidos[0]` é o primeiro, `pedidos[-1]` é o último.']],
  desafio:{lang:'py',enunciado:'Calcule a média da lista `[120, 340, 90, 510]` usando `sum` e `len`.',starter:'pedidos = [120, 340, 90, 510]\n',solution:'pedidos = [120, 340, 90, 510]\nsum(pedidos) / len(pedidos)'}},
 {id:'t03',titulo:'Dicionários: chave e valor',skill:'py',blocos:[
  ['p','Um **dicionário** liga uma chave a um valor, como uma linha com nomes de colunas. Fica entre chaves `{ }`.'],
  ['code','py',`metas = {"Ana": 40000, "Bruno": 30000, "Carla": 45000}
print(metas["Carla"])
metas["Diego"] = 25000      # adiciona uma chave nova
for nome, meta in metas.items():
    print(f"{nome}: R$ {meta}")`],
  ['p','Um DataFrame do pandas é, no fundo, um monte de colunas com nome, como um dicionário de listas.']],
  desafio:{lang:'py',enunciado:'No dicionário `metas`, devolva a meta do Bruno.',starter:'metas = {"Ana": 40000, "Bruno": 30000}\n',solution:'metas = {"Ana": 40000, "Bruno": 30000}\nmetas["Bruno"]'}},
 {id:'t04',titulo:'for: repetindo sem copiar e colar',skill:'py',blocos:[
  ['p','O `for` percorre uma lista item por item. Tudo que estiver **recuado** (4 espaços) embaixo dele roda uma vez para cada item.'],
  ['code','py',`valores = [80, 3500, 150, 1200]
total_grandes = 0
for v in valores:
    if v > 1000:
        total_grandes += v
print(total_grandes)`],
  ['tip','O recuo não é enfeite: é ele que diz ao Python o que está dentro do `for`. Errou o recuo, mudou o programa.']],
  desafio:{lang:'py',enunciado:'Some apenas os valores acima de 100 da lista `[80, 3500, 150, 1200, 95]`. Deixe o total na última linha.',starter:'valores = [80, 3500, 150, 1200, 95]\ntotal = 0\n',solution:'valores = [80, 3500, 150, 1200, 95]\ntotal = 0\nfor v in valores:\n    if v > 100:\n        total += v\ntotal'}},
 {id:'t05',titulo:'if, elif, else: o CASE WHEN do Python',skill:'py',blocos:[
  ['p','Você já conhece o `CASE WHEN`. Em Python a mesma lógica usa `if`, `elif` (senão, se) e `else`.'],
  ['cmp',`SELECT valor,
  CASE WHEN valor >= 3000 THEN 'Alto'
       WHEN valor >= 1000 THEN 'Médio'
       ELSE 'Baixo' END AS faixa
FROM vendas LIMIT 5`,`def faixa(v):
    if v >= 3000:
        return "Alto"
    elif v >= 1000:
        return "Médio"
    else:
        return "Baixo"

vendas["faixa"] = vendas["valor"].apply(faixa)
vendas[["valor", "faixa"]].head()`,'O `apply` aplica a função em cada linha da coluna.']],
  desafio:{lang:'py',enunciado:'Escreva `classificar(v)` que devolve "Alto" se v ≥ 3000 e "Baixo" caso contrário. Na última linha, chame `classificar(4500)`.',starter:'def classificar(v):\n    ',solution:'def classificar(v):\n    if v >= 3000:\n        return "Alto"\n    return "Baixo"\nclassificar(4500)'}},
 {id:'t06',titulo:'Funções: escreva uma vez, use sempre',skill:'py',blocos:[
  ['p','Se você faz a mesma conta toda semana, transforme em **função** com `def`. Ela recebe valores (parâmetros) e devolve um resultado com `return`.'],
  ['code','py',`def ticket_medio(faturamento, pedidos):
    if pedidos == 0:
        return 0          # evita divisão por zero
    return faturamento / pedidos

print(ticket_medio(108330, 60))
print(ticket_medio(0, 0))`],
  ['tip','Uma função boa faz uma coisa só e tem um nome que diz o quê. `calcula_tudo()` é um alerta.']],
  desafio:{lang:'py',enunciado:'Crie `roi(receita, investimento)` que devolve (receita − investimento) ÷ investimento. Na última linha, chame `roi(12000, 5000)`.',starter:'def roi(receita, investimento):\n    ',solution:'def roi(receita, investimento):\n    return (receita - investimento) / investimento\nroi(12000, 5000)'}},
 {id:'t07',titulo:'DataFrame: a tabela do SQL dentro do Python',skill:'py',blocos:[
  ['p','No pandas, uma tabela é um **DataFrame**. As tabelas da empresa já estão carregadas com os mesmos nomes do banco: `vendas`, `clientes`, `campanhas` e `entregas`.'],
  ['cmp','SELECT * FROM vendas LIMIT 5','vendas.head()','`head()` mostra as 5 primeiras linhas, como LIMIT 5.'],
  ['code','py',`print(vendas.shape)     # (linhas, colunas)
print(vendas.columns)   # nomes das colunas
vendas.dtypes           # tipo de cada coluna`],
  ['tip','`shape` não tem parênteses: é uma informação guardada, não uma ação. `head()` tem, porque executa algo.']],
  desafio:{lang:'py',enunciado:'Quantas linhas tem a tabela `clientes`? Devolva o número.',starter:'',solution:'len(clientes)'}},
 {id:'t08',titulo:'SELECT de colunas',skill:'py',blocos:[
  ['p','Para escolher colunas, passe uma **lista de nomes** entre colchetes. Por isso aparecem dois pares: um do DataFrame e outro da lista.'],
  ['cmp','SELECT produto, valor FROM vendas',`vendas[["produto", "valor"]]`],
  ['p','Com um nome só, sem lista, você recebe uma **Series**, uma coluna sozinha: `vendas["valor"]`. Ela já tem `.sum()`, `.mean()` e companhia.'],
  ['code','py',`vendas["valor"].sum()`]],
  desafio:{lang:'py',enunciado:'Selecione as colunas `nome` e `estado` da tabela `clientes`.',starter:'',solution:'clientes[["nome", "estado"]]'}},
 {id:'t09',titulo:'WHERE vira filtro com colchetes',skill:'py',blocos:[
  ['p','O filtro do pandas tem duas partes: a **condição** (que gera Verdadeiro/Falso para cada linha) e os colchetes que mantêm só as linhas verdadeiras.'],
  ['cmp',"SELECT * FROM vendas WHERE canal = 'App'",`vendas[vendas["canal"] == "App"]`,'Em Python, igualdade é `==`. Um `=` só é para guardar valores.'],
  ['code','py',`condicao = vendas["valor"] > 3000
print(condicao.head())        # True / False por linha
vendas[condicao].head()`]],
  desafio:{lang:'py',enunciado:'Filtre as campanhas do canal "TikTok" (todas as colunas).',starter:'',solution:'campanhas[campanhas["canal"] == "TikTok"]'}},
 {id:'t10',titulo:'AND e OR: & e | com parênteses',skill:'py',blocos:[
  ['p','No pandas, `AND` vira `&` e `OR` vira `|`. E cada condição precisa estar **entre parênteses**, senão o Python calcula na ordem errada.'],
  ['cmp',"SELECT * FROM vendas\nWHERE canal = 'Site' AND valor > 1000",`vendas[(vendas["canal"] == "Site") & (vendas["valor"] > 1000)]`],
  ['cmp',"SELECT * FROM vendas\nWHERE regiao IN ('Sul', 'Norte')",`vendas[vendas["regiao"].isin(["Sul", "Norte"])]`,'`IN` vira `.isin([...])`.'],
  ['tip','O erro mais comum de quem vem do SQL: escrever `and` em vez de `&`. Com tabelas, use sempre `&`, `|` e `~` (NOT).']],
  desafio:{lang:'py',enunciado:'Filtre as vendas do canal "Site" com valor acima de 1000.',starter:'',solution:'vendas[(vendas["canal"] == "Site") & (vendas["valor"] > 1000)]'}},
 {id:'t11',titulo:'GROUP BY vira groupby',skill:'py',blocos:[
  ['p','A ideia é a mesma: separar em grupos e resumir cada um. A ordem é: **agrupar → escolher a coluna → agregar**.'],
  ['cmp','SELECT regiao, SUM(valor)\nFROM vendas\nGROUP BY regiao',`vendas.groupby("regiao")["valor"].sum()`],
  ['p','O resultado é uma Series com a região no **índice**. Se quiser uma tabela normal, com a região como coluna, adicione `.reset_index()`.'],
  ['code','py',`vendas.groupby("regiao")["valor"].sum().reset_index()`]],
  desafio:{lang:'py',enunciado:'Some a `quantidade` vendida por `categoria`.',starter:'',solution:'vendas.groupby("categoria")["quantidade"].sum()'}},
 {id:'t12',titulo:'Várias contas de uma vez: agg',skill:'py',blocos:[
  ['p','Em SQL você escreve vários `SUM`, `COUNT` e `AVG` no mesmo SELECT, cada um com seu `AS`. No pandas, o `agg` faz isso dando nome a cada resultado.'],
  ['cmp','SELECT canal,\n  SUM(valor) AS total,\n  COUNT(id)  AS pedidos,\n  AVG(valor) AS ticket\nFROM vendas GROUP BY canal',`vendas.groupby("canal").agg(
    total=("valor", "sum"),
    pedidos=("id", "count"),
    ticket=("valor", "mean")
)`,'Cada linha do agg é `nome=("coluna", "função")`.']],
  desafio:{lang:'py',enunciado:'Por `vendedor`, calcule `total` (soma de valor) e `pedidos` (contagem de id).',starter:'',solution:'vendas.groupby("vendedor").agg(total=("valor", "sum"), pedidos=("id", "count"))'}},
 {id:'t13',titulo:'ORDER BY e LIMIT',skill:'py',blocos:[
  ['cmp','SELECT produto, valor FROM vendas\nORDER BY valor DESC\nLIMIT 3',`vendas.sort_values("valor", ascending=False)[["produto", "valor"]].head(3)`,'`ascending=False` é o DESC.'],
  ['p','Num resultado de groupby, use `sort_values` direto na Series:'],
  ['code','py',`vendas.groupby("produto")["valor"].sum().sort_values(ascending=False).head(3)`]],
  desafio:{lang:'py',enunciado:'Mostre as 3 regiões com maior faturamento (soma de valor), da maior para a menor.',starter:'',solution:'vendas.groupby("regiao")["valor"].sum().sort_values(ascending=False).head(3)',ordered:true}},
 {id:'t14',titulo:'JOIN vira merge',skill:'py',blocos:[
  ['p','`merge` junta duas tabelas pela chave. Quando as colunas têm nomes diferentes, use `left_on` e `right_on`.'],
  ['cmp','SELECT c.segmento, SUM(v.valor)\nFROM vendas v\nJOIN clientes c ON v.cliente_id = c.id\nGROUP BY c.segmento',`juntas = pd.merge(vendas, clientes, left_on="cliente_id", right_on="id")
juntas.groupby("segmento")["valor"].sum()`],
  ['tip','Se as duas tabelas tiverem colunas com o mesmo nome (como `id`), o pandas renomeia para `id_x` e `id_y`. Não se assuste.']],
  desafio:{lang:'py',enunciado:'Junte vendas e clientes e some o `valor` por `estado`.',starter:'',solution:'pd.merge(vendas, clientes, left_on="cliente_id", right_on="id").groupby("estado")["valor"].sum()'}},
 {id:'t15',titulo:'Quem ficou de fora: anti-join',skill:'py',blocos:[
  ['p','Em SQL, para achar clientes sem compras, usamos `LEFT JOIN ... WHERE v.id IS NULL` ou `NOT IN`. No pandas, o jeito mais direto é `isin` com `~` (NOT).'],
  ['cmp','SELECT nome FROM clientes\nWHERE id NOT IN (SELECT cliente_id FROM vendas)',`clientes[~clientes["id"].isin(vendas["cliente_id"])]["nome"]`]],
  desafio:{lang:'py',enunciado:'Liste o `nome` dos clientes que nunca compraram.',starter:'',solution:'clientes[~clientes["id"].isin(vendas["cliente_id"])]["nome"]'}},
 {id:'t16',titulo:'Nulos: o vazio que engana',skill:'py',blocos:[
  ['p','Dado vazio aparece como `NaN` no pandas (é o `NULL` do SQL). Antes de qualquer análise, conte os vazios.'],
  ['code','py',`entregas.isnull().sum()`],
  ['p','Funções como `mean()` e `sum()` **ignoram** os vazios, como o AVG do SQL. Para trocar o vazio por um valor use `fillna`; para remover a linha, `dropna`.'],
  ['code','py',`print(entregas["dias_reais"].mean())
print(entregas["dias_reais"].fillna(0).mean())   # média muda!`],
  ['tip','Preencher vazio com zero quase sempre distorce a média. Antes, pergunte por que o dado está vazio.']],
  desafio:{lang:'py',enunciado:'Calcule a média de `dias_reais` das entregas (ignorando os vazios).',starter:'',solution:'entregas["dias_reais"].mean()'}},
 {id:'t17',titulo:'COUNT DISTINCT e value_counts',skill:'py',blocos:[
  ['cmp','SELECT COUNT(DISTINCT produto) FROM vendas',`vendas["produto"].nunique()`],
  ['cmp','SELECT canal, COUNT(*) FROM vendas\nGROUP BY canal ORDER BY 2 DESC',`vendas["canal"].value_counts()`,'`value_counts` já conta e ordena do maior para o menor.']],
  desafio:{lang:'py',enunciado:'Quantas transportadoras diferentes aparecem em `entregas`?',starter:'',solution:'entregas["transportadora"].nunique()'}},
 {id:'t18',titulo:'Percentual do total',skill:'negocio',blocos:[
  ['p','Número absoluto sozinho não diz muito. Participação no total responde “quanto isso pesa?”.'],
  ['cmp','SELECT regiao,\n  SUM(valor) * 100.0 / (SELECT SUM(valor) FROM vendas) AS pct\nFROM vendas GROUP BY regiao',`(vendas.groupby("regiao")["valor"].sum() / vendas["valor"].sum() * 100).round(1)`],
  ['code','py',`vendas["canal"].value_counts(normalize=True)   # já em proporção`]],
  desafio:{lang:'py',enunciado:'Qual o percentual de pedidos de cada canal? (Dica: `value_counts(normalize=True)` vezes 100.)',starter:'',solution:'vendas["canal"].value_counts(normalize=True) * 100'}},
 {id:'t19',titulo:'Média ou mediana?',skill:'negocio',blocos:[
  ['p','A **média** soma tudo e divide; a **mediana** é o valor do meio da fila. Quando poucos valores são enormes (como notebooks no meio de mouses), a média sobe e deixa de representar o caso típico.'],
  ['code','py',`print(f"Média:   R$ {vendas['valor'].mean():,.0f}")
print(f"Mediana: R$ {vendas['valor'].median():,.0f}")`],
  ['tip','Use a mediana para descrever o cliente típico e a média para projetar receita total.']],
  desafio:{lang:'py',enunciado:'Calcule a mediana do `valor` das vendas.',starter:'',solution:'vendas["valor"].median()'}},
 {id:'t20',titulo:'Taxa de conversão do jeito certo',skill:'negocio',blocos:[
  ['p','Para taxa geral, **some antes de dividir**. A média das taxas dá o mesmo peso para uma campanha com 100 cliques e outra com 20 mil.'],
  ['code','py',`certa = campanhas["conversoes"].sum() / campanhas["cliques"].sum()
errada = (campanhas["conversoes"] / campanhas["cliques"]).mean()
print(f"Somando antes: {certa:.2%}")
print(f"Média das taxas: {errada:.2%}")`]],
  desafio:{lang:'py',enunciado:'Calcule a taxa de conversão geral: soma de conversões ÷ soma de cliques.',starter:'',solution:'campanhas["conversoes"].sum() / campanhas["cliques"].sum()'}}
];
