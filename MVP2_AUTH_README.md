# Estevez Guarda MVP2 — acesso recorrente

Fluxo:
- `/` — solicitar acesso ou entrar;
- `/admin` — Super Admin (senha + OTP administrativo);
- `/activate/<token>` — primeiro acesso, OTP de ativação + definição de senha;
- `/login` — acessos seguintes, e-mail + senha;
- `/briefing` — Command Center + Assistente Estevez.

O OTP do usuário comum é usado somente na ativação inicial da conta.
