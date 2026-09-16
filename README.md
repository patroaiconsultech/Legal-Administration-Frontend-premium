# Efatá Secure Briefing Portal — Frontend V1.1

Frontend independente do briefing confidencial.

## Experiência

- `/` — solicitação de acesso;
- `/a/<token>` — consumo do magic link aprovado;
- `/briefing` — Gate jurídico + apresentação;
- `/admin` — Super Admin, fila de aprovação e Web Push.

O bundle público não contém a apresentação confidencial nem o catálogo de agentes.
Esses dados são entregues pelo backend somente depois da autorização.

## PWA

O frontend inclui:
- `manifest.webmanifest`;
- `sw.js`;
- instalação do Efatá Control;
- subscription de Web Push no painel administrativo;
- `notificationclick` abre a solicitação no painel.

O Service Worker não intercepta `/api`, `/admin`, `/briefing` ou `/a/*`.

## Desenvolvimento

```bash
cp .env.example .env
npm install
npm run dev
```
