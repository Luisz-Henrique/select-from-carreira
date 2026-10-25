"""Gera desktop/index.html: a versão offline do jogo (AlaSQL e fontes embutidos).

Uso: python build.py && python build_desktop.py
Depois, dentro de desktop/: npm install && npm run build:win
"""
from pathlib import Path
import re

raiz = Path(__file__).parent
desk = raiz / "desktop"
html = (raiz / "index.html").read_text(encoding="utf-8")
fontes = (desk / "vendor" / "fonts-inline.css").read_text(encoding="utf-8")
alasql = (desk / "vendor" / "alasql.min.js").read_text(encoding="utf-8")

html = re.sub(r'<link rel="preconnect"[^>]*>\n', "", html)
html = re.sub(r'<link href="https://fonts.googleapis.com[^>]*>\n', lambda m: "<style>\n" + fontes + "\n</style>\n", html)
tag = '<script src="https://cdn.jsdelivr.net/npm/alasql@4.4.0/dist/alasql.min.js"></script>'
assert tag in html, "tag do AlaSQL não encontrada no index.html"
html = html.replace(tag, "<script>\n" + alasql + "\n</script>")
(desk / "index.html").write_text(html, encoding="utf-8")
print(f"desktop/index.html gerado ({len(html):,} caracteres)")
