# Styleguide

## Paleta de cores

| Nome | Valor |
|---|---|
| color-primary-600 | #1E88E5 |
| color-primary-500 | #2196F3 |
| color-primary-400 | #42A5F5 |
| color-secondary-600 | #8E24AA |
| color-secondary-500 | #9C27B0 |
| color-secondary-400 | #AB47BC |
| color-success-500 | #2E7D32 |
| color-warning-500 | #F9A825 |
| color-danger-500 | #D32F2F |
| color-info-500 | #1976D2 |
| gray-900 | #111827 |
| gray-800 | #1F2937 |
| gray-700 | #374151 |
| gray-600 | #4B5563 |
| gray-500 | #6B7280 |
| gray-300 | #D1D5DB |
| gray-200 | #E5E7EB |
| gray-100 | #F3F4F6 |
| white | #FFF |

## Tipografia

- Fonte base: 'Inter',system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif

### Escalas de fonte
| Token | Valor |
|---|---:|
| fs-100 | 12px |
| fs-200 | 14px |
| fs-300 | 16px |
| fs-400 | 18px |
| fs-500 | 20px |
| fs-600 | 24px |
| fs-700 | 32px |
| fs-800 | 40px |

## Espa�amentos
| Token | Valor |
|---|---:|
| space-1 | 8px |
| space-2 | 16px |
| space-3 | 24px |
| space-4 | 32px |
| space-5 | 48px |
| space-6 | 64px |

## Radii & sombras
- radius-sm: 6px
- radius-md: 10px
- radius-lg: 16px

## Containers
- container-sm: 540px
- container-md: 720px
- container-lg: 960px
- container-xl: 1140px

## Observa��es de tipografia (trechos de _typography.css)

```css
/* _typography.css
   Base typography for etapa 2
*/
body{font-family:var(--font-sans);font-size:var(--fs-300);color:var(--gray-800);line-height:1.6;background:var(--gray-100)}
h1{font-size:var(--fs-800);line-height:1.2;margin:var(--space-4) 0 var(--space-2)}
h2{font-size:var(--fs-700);line-height:1.25;margin:var(--space-3) 0 var(--space-2)}
h3{font-size:var(--fs-600);line-height:1.3;margin:var(--space-3) 0 var(--space-2)}
h4{font-size:var(--fs-500);line-height:1.35;margin:var(--space-2) 0 var(--space-1)}
p,ul,ol{margin:0 0 var(--space-2)}
.small{font-size:var(--fs-200);color:var(--gray-600)}
.muted{color:var(--gray-600)}
```