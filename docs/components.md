# Componentes (biblioteca)

Pequena documentação dos componentes reutilizáveis presentes em `src/styles/_components.css` e exportados em `dist/styles.css`.

## Tokens usados
- Cores: `--color-primary-500`, `--color-secondary-500`, `--color-success-500`, `--color-warning-500`, `--color-danger-500`, `--gray-*`.
- Tipografia: `--font-sans`, `--fs-300` .. `--fs-800`.
- Espaçamento: `--space-1` .. `--space-6`.
- Radius: `--radius-sm`, `--radius-md`, `--radius-lg`.

## Botões
Classes principais:
- `.btn` — base (layout, foco, transições)
- `.btn--primary` — ação primária
- `.btn--ghost` — ação neutra/ghost

Exemplo:

```html
<a class="btn btn--primary" href="#">Doar</a>
<button class="btn btn--ghost" disabled>Salvar</button>
```

Acessibilidade: botões têm `:focus-visible` bem visíveis; evite usar apenas cor para transmitir estado.

## Cards
Classes: `.card`, `.card__media`, `.card__body`, `.card__title`, `.card__meta`.

Uso: blocos de preview de projeto ou notícia. Suportam imagens responsivas.

```html
<article class="card">
  <div class="card__media"><img src="assets/img/img1.svg" alt="Projeto"></div>
  <div class="card__body">
    <h3 class="card__title">Projeto A</h3>
    <p class="card__meta">Breve descrição</p>
  </div>
</article>
```

## Badges
Classe base `.badge` e variantes `.badge--success`, `.badge--warning`, `.badge--danger`, `.badge--info`.
Uso: status, etiquetas pequenas.

## Formulários
Classes: `.form`, `.input`, `.select`, `.textarea`, `.field-msg`, `.is-valid`, `.is-invalid`.

Padrões:
- Use `.form--grid-2` para dois campos lado-a-lado em >=768px.
- Forneça mensagens claras em `.field-msg` com `ok` ou `error` para estados.

## Navegação / Navbar
Estrutura sugerida (simplificada): `.navbar`, `.navbar__inner`, `.navbar__brand`, `.navbar__menu`, `.navbar__link`.

## Componentes de sobreposição
- `.modal`, `.modal-overlay`, `.toast`, `.alert` — usados para feedback e modais. Garanta `aria` apropriado quando abrir modais.

## Ícones sociais
Os SVGs sociais foram normalizados em `dist/styles.css` (tamanho máximo e wrapper com 36px). Use `footer .social a` ou `.social a`.

---
Arquivo fonte: `src/styles/_components.css` — ver também `docs/styleguide.md` para tokens e tipografia.
