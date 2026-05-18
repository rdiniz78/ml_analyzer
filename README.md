# Analisador de Nichos — Mercado Livre

Ferramenta para encontrar os melhores produtos para dropshipping no Mercado Livre Brasil, com dados reais da API oficial.

## Como fazer o deploy no Vercel (gratuito)

### Pré-requisitos
- Conta no GitHub (github.com) — gratuito
- Conta no Vercel (vercel.com) — gratuito

---

### Passo 1 — Subir o projeto no GitHub

1. Acesse github.com e clique em **"New repository"**
2. Nome: `ml-analyzer` (ou qualquer nome)
3. Deixe como **Public** e clique em **Create repository**
4. Na tela seguinte, clique em **"uploading an existing file"**
5. Arraste os arquivos do projeto (mantendo a estrutura de pastas):
   ```
   ml-analyzer/
   ├── api/
   │   └── search.js
   ├── public/
   │   └── index.html
   ├── package.json
   └── vercel.json
   ```
6. Clique em **Commit changes**

---

### Passo 2 — Deploy no Vercel

1. Acesse vercel.com e clique em **"Sign up"** → faça login com o GitHub
2. Clique em **"Add New Project"**
3. Selecione o repositório `ml-analyzer`
4. Clique em **Deploy** (sem alterar nada)
5. Aguarde ~1 minuto

Pronto! Você receberá uma URL tipo:
`https://ml-analyzer-seunome.vercel.app`

---

### Como usar

1. Acesse a URL do seu projeto
2. Clique em um nicho (Moda, Fitness, Home Office...)
3. Ou digite um nicho personalizado
4. Aguarde a análise (5–10 segundos)
5. Veja os produtos rankeados por score de oportunidade

---

### O que o score mede

| Critério | Pontos |
|---|---|
| Ticket médio R$500+ | +30 |
| Vendas altas (200+) | +25 |
| Poucos vendedores (≤5) | +25 |
| Muitos resultados | +15 |
| Fabricante presente | -15 |

Score 70+ = boa oportunidade
Score 45–69 = nicho moderado
Score abaixo de 45 = evitar

---

### Estrutura do projeto

```
api/search.js     → Proxy para a API do Mercado Livre (resolve CORS)
public/index.html → Frontend completo da ferramenta
vercel.json       → Configuração de rotas do Vercel
package.json      → Metadados do projeto
```
