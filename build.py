"""Junta os arquivos de src/ em um único index.html.

Uso: python build.py
"""
from pathlib import Path

raiz = Path(__file__).parent
src = raiz / "src"
ordem = ["core.js", "content.js", "game.js", "game2.js"]

shell = (src / "shell.html").read_text(encoding="utf-8")
js = "\n".join((src / nome).read_text(encoding="utf-8") for nome in ordem)
html = shell.replace("<!--SCRIPTS-->", '<script>\n"use strict";\n' + js + "\n</script>")
(raiz / "index.html").write_text(html, encoding="utf-8")
print(f"index.html gerado ({len(html):,} caracteres)")
