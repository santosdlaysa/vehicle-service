# AutoTrack — Sistema de Gestão de Atendimentos Automotivos

## Stack

| Camada | Tecnologia |
|---|---|
| Back-end | Node.js + TypeScript + Fastify |
| ORM | Prisma |
| Banco de dados | PostgreSQL |
| Auth | JWT (`@fastify/jwt`) + bcrypt |
| Upload de mídia | Supabase Storage |
| Front-end | Next.js 14 (App Router) |
| Estilização | Tailwind CSS |
| PWA | `@ducanh2912/next-pwa` |

---

## Arquitetura (Clean Architecture pragmática)

```
backend/src/
├── domain/              ← Zero dependências externas
│   ├── entities/        ← Service.ts (enums, regras de validação de transição)
│   └── errors/          ← DomainError, NotFoundError, BusinessRuleError, GoneError
│
├── application/         ← Use Cases (toda regra de negócio aqui)
│   └── use-cases/
│       ├── auth/        ← LoginUseCase
│       ├── service/     ← CreateServiceUseCase, ChangeStatusUseCase, GetPublicServiceUseCase
│       ├── checklist/   ← UpsertChecklistUseCase (bloqueia se isLocked = true)
│       ├── media/       ← UploadMediaUseCase (valida tipo/tamanho, comprime, envia ao Supabase)
│       └── receipt/     ← ConfirmReceiptUseCase (verifica expiração do link)
│
├── infrastructure/      ← Implementações concretas
│   ├── database/        ← PrismaClient singleton
│   ├── repositories/    ← PrismaUserRepository, PrismaServiceRepository,
│   │                       PrismaChecklistRepository, PrismaMediaRepository
│   └── services/        ← SupabaseStorageService (upload + delete)
│
└── presentation/        ← HTTP (Fastify)
    ├── middleware/       ← authMiddleware (JWT), errorHandler (centralizado)
    └── routes/           ← auth, service, checklist, media, public
```

---

## O que foi implementado ✅

### Back-end

#### Banco de dados (`prisma/schema.prisma`)
- [x] Tabela `users` — id (UUID), name, email, password_hash, created_at
- [x] Tabela `services` — id (UUID), dados do cliente/veículo, status, link_shared_at, delivered_at, receipt_confirmed_at, created_by (FK), timestamps
- [x] Tabela `checklists` — arranhões, amassados, retrovisores, faróis, pneus, vidros, objetos internos, combustível, notas, is_locked
- [x] Tabela `service_media` — url, type (ENTRY/EXIT), uploaded_by (FK), service_id (FK)
- [x] Tabela `status_history` — old_status, new_status, changed_by (FK), changed_at
- [x] Seed: cria usuário admin (`admin@empresa.com` / `admin123`)

#### Domínio
- [x] Enum `ServiceStatus`: RECEIVED → IN_PROGRESS → FINISHED → READY → DELIVERED
- [x] `isValidTransition()` — valida progressão linear (sem pular etapas)
- [x] `isLinkExpired()` — retorna true se DELIVERED há mais de 48h
- [x] Hierarquia de erros: `DomainError`, `NotFoundError`, `BusinessRuleError`, `UnauthorizedError`, `GoneError`

#### Use Cases / Regras de Negócio
- [x] **RN-001** Checklist imutável após link compartilhado (`isLocked = true`)
- [x] **RN-002** Transição para IN_PROGRESS requer ≥ 1 foto de entrada (ENTRY)
- [x] **RN-002** Transição para READY requer ≥ 1 foto de saída (EXIT)
- [x] **RN-003** Toda mudança de status grava `StatusHistory` com timestamp e userId em transação atômica
- [x] **RN-004** Link expira após 48h da entrega (modo histórico, confirmação bloqueada com 410)
- [x] Upload: compressão via `sharp` (resize 1920px, JPEG 80%), apenas URL salva no PostgreSQL
- [x] Validação de MIME type (jpeg/png/webp) e tamanho máximo (10 MB)

#### API REST
| Método | Rota | Auth |
|---|---|---|
| POST | `/api/auth/login` | — |
| GET | `/api/auth/me` | JWT |
| GET | `/api/services` | JWT |
| POST | `/api/services` | JWT |
| GET | `/api/services/:id` | JWT |
| PATCH | `/api/services/:id` | JWT |
| PATCH | `/api/services/:id/status` | JWT |
| POST | `/api/services/:id/share` | JWT |
| GET | `/api/services/:id/history` | JWT |
| GET | `/api/services/:id/checklist` | JWT |
| PUT | `/api/services/:id/checklist` | JWT |
| POST | `/api/services/:id/media` | JWT |
| GET | `/api/services/:id/media` | JWT |
| DELETE | `/api/services/:id/media/:mediaId` | JWT |
| GET | `/api/public/service/:uuid` | — |
| POST | `/api/public/service/:uuid/confirm` | — |

#### Segurança
- [x] UUID v4 validado com regex nas rotas públicas (previne enumeração)
- [x] Helmet (`@fastify/helmet`) — headers de segurança HTTP
- [x] CORS restrito à URL do frontend
- [x] Rate limit global configurado (`@fastify/rate-limit`)
- [x] IDs sequenciais nunca expostos (somente UUID)
- [x] `errorHandler` centralizado mapeia erros de domínio para status HTTP corretos

---

### Front-end (Next.js 14)

#### Admin Panel (protegido por JWT)
- [x] `AuthProvider` — contexto React com login/logout, recupera sessão via `/auth/me`
- [x] Guard de rota no layout (`/admin/layout.tsx`) — redireciona para `/admin/login` se não autenticado
- [x] `/admin/login` — formulário de login
- [x] `/admin/dashboard` — cards de contagem por status + lista dos últimos atendimentos
- [x] `/admin/services` — listagem com busca (nome/placa/telefone) e filtro por status
- [x] `/admin/services/new` — formulário de criação de atendimento
- [x] `/admin/services/[id]` — detalhes + timeline de status + botão "Avançar status" + botão "Compartilhar link"
- [x] `/admin/services/[id]/checklist` — formulário com toggles, nível de combustível, objetos, notas; bloqueado quando `isLocked`
- [x] `/admin/services/[id]/media` — upload (câmera/galeria), visualização e remoção de fotos por tipo (Entrada/Saída)

#### PWA do Cliente (público, sem auth)
- [x] `/service/[uuid]` — Server Component com fetch inicial SSR + cliente polling a cada 30s
- [x] Aba **Status** — timeline visual de progresso
- [x] Aba **Checklist** — leitura apenas (visível só após lock)
- [x] Aba **Fotos** — galeria antes/depois separada por entrada e saída
- [x] Botão de **Aceite Digital** — confirmação de recebimento do veículo
- [x] Exibição de aviso quando link expirado (> 48h após entrega)
- [x] `manifest.json` — PWA instalável (standalone, tema azul)
- [x] `next-pwa` configurado

#### Componentes
- [x] `StatusBadge` — pill colorido por status
- [x] `StatusTimeline` — linha do tempo vertical com ícones (check/loader/circle)
- [x] `api.ts` — wrapper tipado de fetch (com JWT), incluindo upload multipart
- [x] `publicApi.ts` — fetch sem autenticação para rotas públicas

#### Infraestrutura
- [x] `docker-compose.yml` — PostgreSQL local
- [x] `.env.example` para backend e frontend
- [x] Monorepo com `pnpm workspaces` (backend / frontend / shared)

---

## O que falta / próximos passos ⚠️

### Crítico (necessário para funcionar em produção)

| Item | Descrição |
|---|---|
| **Criar bucket no Supabase** | Criar bucket `service-media` com política pública de leitura no painel do Supabase |
| **Preencher `.env`** | Copiar `.env.example` → `.env` e inserir `DATABASE_URL`, `JWT_SECRET`, credenciais do Supabase |
| **Rodar migration** | `cd backend && npx prisma migrate dev --name init` |
| **Ícones PWA** | Criar/colocar `public/icons/icon-192x192.png` e `icon-512x512.png` para instalação como PWA |
| **Criar usuário admin** | `npx tsx prisma/seed.ts` (gera `admin@empresa.com` / `admin123`) |

### Funcionalidades ausentes

| Item | Prioridade | Descrição |
|---|---|---|
| **Cadastro de usuários** | Alta | Não há rota `POST /api/users` para criar novos funcionários. Hoje só via seed. |
| **Edição de atendimento** | Média | A rota `PATCH /services/:id` existe no backend mas não há UI para isso no frontend |
| **Paginação no frontend** | Média | A API retorna `totalPages` mas a lista de serviços no admin não tem navegação de páginas |
| **Notificação via WhatsApp** | Média | RF-005 pede compartilhamento via WhatsApp — o link é gerado, mas a abertura do WhatsApp (`wa.me/`) não está integrada |
| **Gestão de usuários** | Baixa | Não há tela de admin para criar/listar/desativar funcionários |
| **Refresh token** | Baixa | JWT expira em 7d sem renovação automática — usuário é deslogado abruptamente |
| **Filtro de datas** | Baixa | A listagem não permite filtrar por período de entrada |

### Qualidade e segurança

| Item | Prioridade | Descrição |
|---|---|---|
| **Testes** | Alta | Nenhum teste unitário ou de integração foi escrito ainda |
| **Rate limit nas rotas públicas** | Alta | O plugin está registrado globalmente mas não aplicado especificamente em `/api/public/*` com limite mais restrito |
| **Variável `FRONTEND_URL`** | Alta | O backend usa `process.env.FRONTEND_URL` mas sem validação de inicialização — adicionar validação de env vars no boot |
| **Logs estruturados** | Média | Fastify já loga, mas não há rastreamento de `requestId` nos logs de use case |
| **HTTPS em produção** | Média | Configurar proxy reverso (Nginx/Caddy) ou deploy em plataforma com TLS automático (Railway, Render, Fly.io) |
| **Política de CORS** | Média | Hoje aceita só 1 origem — para múltiplos ambientes (staging/prod) precisa de lista dinâmica |
| **Imagens no Next.js** | Baixa | `next.config.ts` precisa de `images.remotePatterns` com o domínio do Supabase para o componente `<Image>` funcionar |

### Checklist de deploy

```bash
# 1. Configurar variáveis de ambiente no servidor
# 2. Subir PostgreSQL (Docker ou serviço gerenciado)
# 3. cd backend && npx prisma migrate deploy
# 4. cd backend && npx tsx prisma/seed.ts
# 5. Criar bucket no Supabase com política de leitura pública
# 6. cd backend && npm run build && npm start
# 7. cd frontend && npm run build && npm start
```

---

## Correção rápida necessária (Next.js Image)

Adicionar ao `frontend/next.config.ts`:

```typescript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: '*.supabase.co',
      pathname: '/storage/v1/object/public/**',
    },
  ],
},
```

Sem isso, o componente `<Image>` bloqueará as fotos do Supabase.
