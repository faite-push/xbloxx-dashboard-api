# Influenciadores API & Integração

Este projeto fornece um sistema completo de gerenciamento de influenciadores (Dashboard) e uma API pública para consumo em lojas e landing pages.

## 🚀 Como Funciona

O sistema é dividido em duas partes principais:
1. **Dashboard de Administração**: Onde você cadastra, edita, deleta e reordena os influenciadores via drag-and-drop.
2. **API Pública**: Um endpoint que retorna a lista de influenciadores ordenados para ser consumido por qualquer frontend.

---

## 📡 Documentação da API

### Listar Influenciadores
Retorna todos os influenciadores cadastrados no sistema, ordenados pela ordem definida no painel.

- **URL:** `/api/influencers`
- **Método:** `GET`
- **Resposta:** JSON Array

#### Exemplo de Resposta:
```json
[
  {
    "id": 1,
    "name": "Nome do Creator",
    "followers_count": "1500000",
    "image_url": "https://link-da-imagem.com/avatar.jpg",
    "social_link": "https://youtube.com/@creator",
    "display_order": 0
  }
]
```

---

## 🎨 Integração Frontend (Sistema Pinkuzy)

Para criar uma seção de influenciadores como a do sistema Pinkuzy, siga as instruções abaixo:

### 1. Estrutura HTML
Adicione os containers onde os cards serão renderizados.

```html
<section class="container py-10">
  <div class="influ-section relative rounded-2xl border-[2px] border-white/10 bg-white/[1.5%] backdrop-blur-sm p-8 shadow-xl">
    <div class="flex flex-col items-center mb-6 gap-2">
      <h2 class="text-2xl font-black tracking-tight text-center">Conheça nossos creators</h2>
    </div>

    <!-- Container Desktop -->
    <div class="hidden md:flex items-center gap-4">
      <div id="influencers-list" class="flex gap-4 overflow-hidden">
        <div class="py-12 text-zinc-400" id="influencers-loading">Carregando creators...</div>
      </div>
    </div>

    <!-- Container Mobile -->
    <div class="md:hidden">
      <div id="influencers-mobile-list" class="flex gap-4 overflow-x-auto pb-4">
        <div class="py-12 text-zinc-400" id="influencers-mobile-loading">Carregando creators...</div>
      </div>
    </div>
  </div>

  <!-- Configuração da API -->
  <script id="influencers-config" type="application/json">
    { 
      "url": "SUA_URL_AQUI/api/influencers", 
      "limit": 8 
    }
  </script>
</section>
```

### 2. Lógica JavaScript
Este script busca os dados da API e renderiza os cards seguindo o estilo Pinkuzy.

```javascript
document.addEventListener('DOMContentLoaded', async () => {
  const getCfg = () => {
    try {
      return JSON.parse(document.getElementById('influencers-config').textContent);
    } catch { return { url: '/api/influencers', limit: 8 }; }
  };

  const cfg = getCfg();
  const list = document.getElementById('influencers-list');
  const mobileList = document.getElementById('influencers-mobile-list');

  try {
    const response = await fetch(cfg.url);
    const influencers = await response.json();

    const formatFollowers = (n) => {
      const num = Number(n || 0);
      if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace('.0', '') + 'M';
      if (num >= 1_000) return (num / 1_000).toFixed(1).replace('.0', '') + 'k';
      return String(num);
    };

    const cardsHtml = influencers.slice(0, cfg.limit).map((p) => `
      <div class="influ-card group min-w-[200px] rounded-xl border border-white/10 bg-white/[2%] p-4 flex flex-col items-center text-center hover:border-primary/40 transition-all duration-300">
        <div class="relative size-20 rounded-full overflow-hidden ring-2 ring-white/10 shadow-md mb-3">
          <img src="${p.image_url}" alt="${p.name}" class="w-full h-full object-cover">
        </div>
        <p class="font-semibold text-sm text-white">${p.name}</p>
        <p class="text-xs text-zinc-500 mb-3">${formatFollowers(p.followers_count)} seguidores</p>
        <a href="${p.social_link}" target="_blank" class="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-all">
          Visitar canal
        </a>
      </div>
    `).join('');

    if (list) list.innerHTML = cardsHtml;
    if (mobileList) mobileList.innerHTML = cardsHtml;
  } catch (e) {
    console.error('Erro ao carregar influencers:', e);
  }
});
```

### 3. Estilização CSS (Tailwind)
A seção utiliza classes do Tailwind CSS para o efeito "glassmorphism" e animações. Certifique-se de ter as cores `primary` e `background` configuradas em seu tema.

---

## 🛠️ Tecnologias Utilizadas
- **Backend:** Next.js (App Router), SQLite/LocalDB.
- **Frontend Admin:** Tailwind CSS, Shadcn UI, DragDropContext.
- **Autenticação:** Middleware com JWT integrado à API externa.
