# Sons of Peaky - Site

Site estático com manifesto, agenda e geradores de conteúdo para o grupo Sons of Peaky.

Como rodar localmente:
- Basta abrir `index.html` no navegador.

Como publicar no GitHub Pages (resumido):

```powershell
Set-Location -Path 'C:\Users\Erik-Note\Pictures\SOP\SITE'
git init
git add .
git commit -m "Initial site"
git remote add origin https://github.com/<your-username>/<repo-name>.git
git branch -M main
git push -u origin main
```

Depois vá em Settings → Pages e selecione `main` / root para publicar.

Observações:
- Se você quiser usar a API remota (Gemini), NÃO coloque a chave diretamente em `app.js` no repositório público. Use um backend ou secrets do GitHub.
- Recomendo criar um branch `gh-pages` ou usar `main` com a opção Pages do GitHub.

Helper para publicar localmente
--------------------------------
Criei um script `publish.ps1` que automatiza `git init`, commit e push para o repositório remoto. Antes de usar, instale o Git e substitua o URL remoto no script ou passe como parâmetro:

```powershell
.\publish.ps1 -GitRemote "https://github.com\<your-username>\<repo-name>.git" -Branch main
```

O script também verifica se o `git` está instalado e dá instruções caso não esteja.
