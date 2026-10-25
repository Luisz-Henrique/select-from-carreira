# SELECT * FROM carreira

Jogo em pixel art para aprender SQL e Python (pandas) resolvendo demandas reais de uma empresa.
Você começa como estagiário(a) na Tabelão S.A. e pode chegar a Head de Dados, atendendo
Marketing, Vendas, Operações e Financeiro, com prazos, salário, promoções, automações e muitas
cenas no escritório.

## Jogar

- **No navegador:** https://luisz-henrique.github.io/select-from-carreira/
- **No Windows (sem navegador):** baixe o `.zip` na página de
  [Releases](https://github.com/Luisz-Henrique/select-from-carreira/releases), descompacte e abra
  `SELECT FROM carreira.exe`. Na primeira vez o Windows pode exibir “O Windows protegeu o
  computador”: clique em *Mais informações* e depois em *Executar assim mesmo*.

Controles: setas ou WASD para andar, E/Espaço/Enter para interagir, F11 para tela cheia na versão
desktop. O progresso fica salvo automaticamente.

## Estrutura

```
index.html          versão web, pronta para jogar (gerada por build.py)
build.py            junta src/ em index.html
build_desktop.py    gera desktop/index.html, a versão offline
src/
  shell.html        estrutura da página e estilos
  core.js           dados da empresa, simulador de pandas, SQL e verificação das respostas
  content.js        missões, personagens, cenas, loja e calendário de eventos
  game.js           mapa, pixel art, personagens e sistemas do jogo
  game2.js          computador, loja, carreira, tela inicial e controles
desktop/            projeto Electron que gera o executável
  main.js           janela do jogo
  package.json      scripts de build (Windows, Mac e Linux)
  vendor/           AlaSQL e fontes para funcionar offline
```

## Editar e gerar novas versões

```bash
python build.py            # atualiza index.html a partir de src/
python build_desktop.py    # atualiza desktop/index.html (offline)
cd desktop
npm install                # uma vez só, precisa do Node.js
npm start                  # testa a versão desktop
npm run build:win          # gera o .exe em desktop/dist/
```

## Tecnologia

- HTML, CSS e JavaScript puros, sem framework.
- SQL executado com [AlaSQL](https://github.com/AlaSQL/alasql) (licença MIT).
- Python: simulador de um subconjunto do pandas escrito em JavaScript (filtros, groupby, agg,
  merge, pivot_table, value_counts, sort_values, isnull e outros). Não é o pandas real.
- Fontes Press Start 2P e IBM Plex (SIL Open Font License).
- Versão desktop com [Electron](https://www.electronjs.org/).

## Direitos

Todos os direitos reservados. O código está público para consulta; uso, cópia ou redistribuição
dependem de autorização do autor.
