# 🎓 MenteUp — Front-end

## Plataforma Web de Gamificação Educacional

![Versão](https://img.shields.io/badge/vers%C3%A3o-1.0.0-blue)
![React](https://img.shields.io/badge/React-19-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6)
![Vite](https://img.shields.io/badge/Vite-8-646CFF)
![Tailwind](https://img.shields.io/badge/Tailwind%20CSS-4-38BDF8)


O **MenteUp** é uma plataforma web de gamificação educacional. Ela incentiva o engajamento e a participação dos estudantes com atividades interativas, desafios ao vivo, pontuação, ranking, conquistas e avatares. Os professores acompanham o desempenho das turmas. O administrador cuida dos usuários, das turmas, dos logs de auditoria e dos indicadores da plataforma.

Este repositório tem a **interface web (front-end)** do MenteUp. A API REST fica em um repositório separado ([PFC-MenteUp-Backend](https://github.com/eloisamarin/PFC-MenteUp-Backend)).

| Ambiente | Endereço |
|---|---|
| Aplicação (front-end) | https://menteup.vercel.app |
| API (back-end) | https://pfc-menteup-backend.onrender.com |

## Vídeo das Funcionalidades
Vídeo Menteup: https://drive.google.com/file/d/1mA2XsdNKIGsaFj6UkQUOCrodvDmc4DFc/view?usp=sharing

---

## 📑 Sumário

1. [Objetivo](#-objetivo)
2. [Funcionalidades](#-funcionalidades)
3. [Arquitetura](#️-arquitetura)
4. [Tecnologias](#-tecnologias)
5. [Estrutura do projeto](#-estrutura-do-projeto)
6. [Rotas da aplicação](#️-rotas-da-aplicação)
7. [Como executar localmente](#️-como-executar-localmente)
8. [Variáveis de ambiente](#-variáveis-de-ambiente)
9. [Implantação (deploy)](#️-implantação-deploy)
10. [Segurança e LGPD no front-end](#-segurança-e-lgpd-no-front-end)
11. [Instruções e evidências de execução](#-instruções-e-evidências-de-execução)
12. [Equipe](#-equipe)

---

## 🎯 Objetivo

Desenvolver uma plataforma educacional baseada em gamificação que incentive o engajamento dos estudantes e ajude os professores a acompanhar o processo de aprendizagem.

### Objetivos específicos

- Promover a resolução de atividades e desafios.
- Permitir que os professores criem e disponibilizem questionários.
- Atribuir pontos aos estudantes conforme o desempenho nas atividades.
- Estabelecer um sistema de ranqueamento.
- Converter os pontos acumulados em conquistas.

---

## 🚀 Funcionalidades

### 🔐 Acesso (todos os perfis)

- Página inicial de apresentação da plataforma.
- **Cadastro público** de aluno e de professor. Antes de marcar o aceite, a pessoa precisa abrir o Termo de Aceite e a Política de Privacidade. O cadastro de professor aguarda a aprovação do administrador.
- **Login com verificação em duas etapas (2FA):** código enviado por e-mail, com botão para reenviar.
- **Esqueci minha senha**, **redefinição de senha** e **primeiro acesso** pelo convite recebido por e-mail.
- Campo de senha com os **requisitos exibidos em tempo real** (maiúscula, minúscula, número, caractere especial e tamanho).
- Tela de **novo aceite** quando sai uma versão nova do Termo ou da Política.
- **Meus dados:** download dos próprios dados e exclusão da conta (LGPD).

### 👨‍🎓 Aluno

- **Dashboard** com progresso, nível, XP e painel de indicadores (filtros por período e turma).
- Lista de **atividades** e tela para responder nos cinco formatos: **Quiz**, **Verdadeiro ou Falso**, **Associação**, **Ordenação** e **Lacunas**.
- **Desafios ao vivo**, com cronômetro e ranking da partida.
- **Ranking** e **conquistas**, com animação de comemoração ao ganhar uma conquista.
- **Turmas:** pedido de entrada e acompanhamento das solicitações.
- **Perfil** com escolha de avatar e troca de senha.

### 👨‍🏫 Professor

- **Dashboard** com o engajamento das turmas e o painel de indicadores (filtros por período, turma e aluno).
- Criação, edição e visualização de **atividades** nos cinco formatos, para uma ou mais turmas dele.
- Criação, edição e condução de **desafios ao vivo**.
- **Turmas:** inclusão de alunos pelo e-mail e aprovação ou recusa das solicitações.
- **Desempenho** da turma e de cada aluno, com comentários nos resultados.

### 🛡️ Administrador

- **Dashboard** com os indicadores de toda a plataforma e o botão para abrir o **Grafana**.
- **Usuários:** criação (com convite por e-mail), edição, aprovação de professores e exclusão.
- **Turmas:** criação, escolha do professor responsável, arquivamento e desarquivamento.
- **Atividades** e **desafios** de qualquer turma.
- **Desempenho**, **ranking** e **logs do sistema**.

---

## 🏗️ Arquitetura

O front-end é uma **SPA (Single Page Application)** em React. Ele conversa com a API somente por HTTPS e JSON, enviando o token JWT no cabeçalho `Authorization`.

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                      GitHub                                     │
│   PFC-MenteUp-Frontend                PFC-MenteUp-Backend                       │
└──────────┬─────────────────────────────────────────┬────────────────────────────┘
           │ push na main                            │ push na main
           │ (deploy automático)                     │ (deploy automático)
           ▼                                         │
┌──────────────────────┐                             │     ┌────────────────────┐
│  Front-end (Vercel)  │                             │     │   Grafana Cloud    │
│  React + TypeScript  │                             │     │  plugin Infinity   │
└──────────┬───────────┘                             │     └──────────┬─────────┘
           │ HTTPS / JSON + JWT                      │                │ HTTPS +
           │                                         │                │ X-Dashboard-Token
           ▼                                         ▼                ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         Back-end (Render · Docker)                              │
│                 Java 21 + Spring Boot 4 + Spring Security                       │
└──────────┬──────────────────────────────────────────────────────────┬───────────┘
           │ JPA / Hibernate                                          │ API HTTPS
           ▼                                                          ▼
┌──────────────────────┐                                   ┌────────────────────┐
│ PostgreSQL 18 (Neon) │                                   │ Brevo (e-mails)    │
└──────────────────────┘                                   └────────────────────┘
```

### Organização interna

- **`services/api.ts`** concentra todas as chamadas à API (`apiFetch`). Ele coloca o token, encerra a sessão e volta ao login quando a API responde **401**, leva para o novo aceite quando ela responde **428** e limpa o cache das telas depois de criar, editar ou excluir algo.
- **`routes/privateRoute.tsx`** protege as rotas por perfil (`ALUNO`, `PROFESSOR` e `ADMINISTRADOR`).
- **Layouts por perfil** (`AlunoLayout`, `ProfessorLayout` e `AdminLayout`) com menu próprio.
- **Componentes reutilizáveis:** `CampoSenha`, `RequisitosSenha`, `PainelIndicadores`, `ConfirmarExclusao`, `Paginacao`, `DocumentoLegal`, `Avatar` e os editores e *players* de cada formato de atividade.
- **Contextos e hooks:** autenticação, conquistas (`ConquistasProvider` e `useConquistas`), estado do desafio ao vivo (`useEstadoDesafio`), turmas e paginação.

---

## 💻 Tecnologias

| Tecnologia | Uso |
|---|---|
| React 19 | Construção da interface |
| TypeScript 6 | Tipagem e lógica da aplicação |
| Vite 8 | Servidor de desenvolvimento e build |
| React Router 7 | Rotas e proteção por perfil |
| Tailwind CSS 4 e CSS Modules | Estilização e responsividade |
| lucide-react | Ícones |
| react-markdown | Exibição do Termo e da Política vindos da API |
| Firebase (Cloud Messaging) | Notificações push (opcional) |
| ESLint | Padronização do código |

**Infraestrutura:** Vercel (hospedagem), GitHub (código e deploy automático).

**Ferramentas:** Visual Studio Code, Figma, Git e GitHub.

---

## 📂 Estrutura do projeto

```text
PFC-MenteUp-Frontend/
├── Documentação/                    # Documentos do PFC
├── Projeto MenteUp  Frontend/
│   └── menteup/                     # Projeto React + Vite
│       ├── public/                  # Ícones e service worker do Firebase
│       ├── src/
│       │   ├── assets/              # Logo
│       │   ├── components/          # Componentes reutilizáveis e layouts por perfil
│       │   ├── context/             # Autenticação e conquistas
│       │   ├── firebase/            # Configuração e serviço de notificações
│       │   ├── hooks/               # Hooks personalizados
│       │   ├── pages/               # Telas (aluno, professor, administrador, desafio...)
│       │   ├── routes/              # Rota privada por perfil
│       │   ├── services/            # Chamadas à API e regras de apoio
│       │   ├── styles/              # Tema e superfícies
│       │   ├── types/               # Tipos TypeScript
│       │   ├── App.tsx              # Definição das rotas
│       │   └── main.tsx             # Ponto de entrada
│       ├── vercel.json              # Redireciona todas as rotas para o index.html (SPA)
│       ├── vite.config.ts
│       └── package.json
└── README.md
```

---

## 🗺️ Rotas da aplicação

| Perfil | Rotas |
|---|---|
| Público | `/`, `/login`, `/cadastro`, `/verificar-2fa`, `/esqueci-senha`, `/redefinir-senha`, `/primeiro-acesso`, `/termo-de-aceite`, `/politica-privacidade` |
| Todos os logados | `/meus-dados`, `/novo-aceite` |
| Aluno | `/aluno/dashboard`, `/aluno/atividades`, `/aluno/atividades/responder/:id`, `/aluno/desafios`, `/aluno/desafios/:id`, `/aluno/turmas`, `/aluno/ranking`, `/aluno/conquistas`, `/aluno/perfil` |
| Professor | `/professor/dashboard`, `/professor/atividades` (criar, ver e editar), `/professor/desafios` (criar, editar e conduzir), `/professor/turmas`, `/professor/turmas/:id`, `/professor/desempenho`, `/professor/perfil` |
| Administrador | `/administrador/dashboard`, `/administrador/usuarios`, `/administrador/turmas`, `/administrador/atividades`, `/administrador/desafios`, `/administrador/desempenho`, `/administrador/ranking`, `/administrador/logs`, `/administrador/perfil` |

---

## ▶️ Como executar localmente

### Pré-requisitos

- **Node.js 20 ou superior** (testado com o Node 24) e **npm**
- O **back-end** rodando localmente (`http://localhost:8080`) ou o endereço da API no Render

### Passo a passo

1. Clone o repositório:

   ```bash
   git clone https://github.com/eloisamarin/PFC-MenteUp-Frontend.git
   ```

2. Entre na pasta do projeto:

   ```bash
   cd "PFC-MenteUp-Frontend/Projeto MenteUp  Frontend/menteup"
   ```

3. Instale as dependências:

   ```bash
   npm install
   ```

4. Crie o arquivo `.env.local` :

   ```properties
   VITE_API_URL=http://localhost:8080
   ```

5. Inicie o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

6. Abra `http://localhost:5173`.

> O back-end só aceita chamadas das origens listadas em `CORS_ORIGENS`. Localmente, o padrão já é `http://localhost:5173`.

### Outros comandos

Gerar a versão de produção (pasta `dist`):

```bash
npm run build
```

Ver a versão de produção localmente:

```bash
npm run preview
```

Rodar o linter:

```bash
npm run lint
```

---

## 🔑 Variáveis de ambiente



| Variável | Obrigatória | Descrição |
|---|---|---|
| `VITE_API_URL` | Sim | Endereço da API (`http://localhost:8080` ou `https://pfc-menteup-backend.onrender.com`) |
| `VITE_GRAFANA_URL` | Não | Link do dashboard no Grafana Cloud, aberto pelo botão do administrador |
| `VITE_FIREBASE_API_KEY` | Não | Configuração do Firebase (notificações push) |
| `VITE_FIREBASE_AUTH_DOMAIN` | Não | Configuração do Firebase |
| `VITE_FIREBASE_PROJECT_ID` | Não | Configuração do Firebase |
| `VITE_FIREBASE_STORAGE_BUCKET` | Não | Configuração do Firebase |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Não | Configuração do Firebase |
| `VITE_FIREBASE_APP_ID` | Não | Configuração do Firebase |
| `VITE_FIREBASE_VAPID_KEY` | Não | Chave pública para as notificações push |

> As variáveis `VITE_` são embutidas no código no momento do build. Depois de mudar uma delas na Vercel, é preciso fazer um novo deploy.

---

## ☁️ Implantação (deploy)

O front-end está publicado na **Vercel**:

| Configuração | Valor |
|---|---|
| *Root Directory* | `Projeto MenteUp  Frontend/menteup` |
| *Framework Preset* | Vite |
| *Build Command* | `npm run build` |
| *Output Directory* | `dist` |
| *Environment Variables* | `VITE_API_URL`, `VITE_GRAFANA_URL` e, se usar as notificações, as variáveis do Firebase |

- O `vercel.json` redireciona todas as rotas para o `index.html`. Assim, abrir ou atualizar uma página como `/aluno/dashboard` funciona direto.
- Cada *push* na `main` gera um novo deploy automático. Cada Pull Request ganha uma prévia (*preview*) com endereço próprio.
- No back-end (Render), o endereço `https://menteup.vercel.app` precisa estar em `CORS_ORIGENS` e em `APP_FRONTEND_URL` (links enviados por e-mail).

---

## 🔒 Segurança e LGPD no front-end

- **Rotas protegidas por perfil:** sem token, ou com perfil diferente, a pessoa volta para o login. A permissão real é sempre conferida pela API.
- **Sessão encerrada automaticamente:** quando a API responde 401 (token expirado, senha trocada, conta bloqueada ou excluída), o front limpa os dados salvos e leva ao login com um aviso.
- **Nenhuma chave secreta no código:** o front só recebe endereços públicos e a configuração pública do Firebase, por variáveis de ambiente.
- **Senha forte** com os requisitos visíveis, igual à regra do back-end.
- **Termo de Aceite e Política de Privacidade** sempre na versão em vigor, buscados na API. O aceite só é liberado depois que a pessoa abre os dois documentos.
- **Direitos do titular:** download dos próprios dados e exclusão da conta em **Meus dados**.
- **Minimização:** cada tela mostra só os dados que o perfil pode ver. O e-mail dos alunos aparece apenas para o professor e o administrador.

---

## ✅ Instruções e evidências de execução

### 1. Verificação rápida da aplicação publicada

Os comandos abaixo podem ser executados em qualquer terminal (Git Bash, Linux ou macOS).

Página inicial:

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://menteup.vercel.app/
```

Rota interna aberta diretamente (confirma o `vercel.json`):

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://menteup.vercel.app/aluno/dashboard
```

API liberando o CORS para o front-end:

```bash
curl -i -X OPTIONS https://pfc-menteup-backend.onrender.com/documentos/termo/atual -H "Origin: https://menteup.vercel.app" -H "Access-Control-Request-Method: GET"
```

**Resultados obtidos:**

| Verificação | Resultado esperado | Resultado obtido |
|---|---|---|
| `https://menteup.vercel.app/` | HTTP 200 | ✅ HTTP 200 |
| `/login` aberto diretamente | HTTP 200 | ✅ HTTP 200 |
| `/politica-privacidade` aberto diretamente | HTTP 200 | ✅ HTTP 200 |
| `/aluno/dashboard` aberto diretamente | HTTP 200 (a SPA carrega e a rota privada leva ao login) | ✅ HTTP 200 |
| CORS da API para `https://menteup.vercel.app` | `Access-Control-Allow-Origin` com o endereço do front | ✅ `access-control-allow-origin: https://menteup.vercel.app` |
| Termo e Política carregados da API | Versão em vigor | ✅ Versão 1.1, em vigor desde 15/11/2026 |
| Build de produção (`npm run build`) | Sem erros de TypeScript nem de build | ✅ Concluído em 3,7 s |

### 2. Roteiro de verificação das funcionalidades

Siga o roteiro em https://menteup.vercel.app. Cada passo também confirma uma integração.

| # | Passo | Resultado esperado | Integração verificada |
|---|---|---|---|
| 1 | Abrir **Criar conta** e tentar marcar o aceite sem abrir os documentos | A caixa só é liberada depois de abrir o Termo e a Política | Front → API (`/documentos`) |
| 2 | Digitar uma senha fraca e depois uma forte | Os requisitos mudam de cor em tempo real; a senha fraca não é aceita | Validação no front e na API |
| 3 | Concluir o cadastro de aluno | A tela volta para o login com aviso de sucesso | API + Neon |
| 4 | Fazer login | Abre a tela do código 2FA e o código chega por e-mail | API + **Brevo** |
| 5 | Usar **Reenviar código** | Um novo código chega; o botão respeita o intervalo de 60 segundos | API + **Brevo** |
| 6 | Como aluno, abrir uma rota de professor (por exemplo, `/professor/dashboard`) | A rota privada leva de volta ao login | Proteção de rotas |
| 7 | Como professor, criar uma atividade de cada formato | As atividades aparecem para os alunos da turma | API |
| 8 | Como aluno, responder às atividades | Pontos, XP, conquistas (com animação) e ranking são atualizados | Gamificação |
| 9 | Como professor, conduzir um **desafio ao vivo** com um aluno em outra janela | As perguntas avançam juntas, com cronômetro e ranking | Desafios |
| 10 | Abrir o **Painel** com cada perfil e trocar os filtros | Cada perfil vê somente o próprio recorte | `/dashboard/painel` |
| 11 | Como administrador, criar um usuário | O convite de primeiro acesso chega com link para `menteup.vercel.app` | **Brevo** + `APP_FRONTEND_URL` |
| 12 | Como administrador, tentar excluir uma turma com alunos | Aparece o aviso explicando o motivo, com a opção de arquivar | API |
| 13 | Como administrador, clicar no botão do **Grafana** | Abre o dashboard no Grafana Cloud | **Grafana Cloud** (`VITE_GRAFANA_URL`) |
| 14 | Em **Meus dados**, baixar os dados | O arquivo traz os dados da própria pessoa | LGPD |
| 15 | Deixar a sessão expirar (ou trocar a senha em outra aba) e navegar | O front volta ao login com o aviso "Sua sessão terminou" | Tratamento do 401 |

### 3. Evidências em imagem

As capturas de tela da versão 1.0.0 ficam na pasta [`docs/evidencias`](docs/evidencias):

| Arquivo | O que mostra |
|---|---|
| `01-home.png` | Página inicial |
| `02-cadastro-termo.png` | Cadastro com o aceite do Termo e da Política |
| `03-requisitos-senha.png` | Requisitos de senha em tempo real |
| `04-verificar-2fa.png` | Tela do código 2FA com o botão de reenviar |
| `05-dashboard-aluno.png` | Dashboard do aluno com o painel de indicadores |
| `06-responder-atividade.png` | Atividade sendo respondida |
| `07-conquista.png` | Comemoração de uma conquista |
| `08-desafio-ao-vivo.png` | Desafio ao vivo com o ranking |
| `09-dashboard-professor.png` | Dashboard do professor com os filtros |
| `10-usuarios-admin.png` | Gestão de usuários pelo administrador |

### 5. Vídeo de demonstração

O vídeo mostra o uso da plataforma na versão 1.0.0, do cadastro ao painel do administrador: [assistir no Google Drive](https://drive.google.com/file/d/1mA2XsdNKIGsaFj6UkQUOCrodvDmc4DFc/view?usp=sharing).

---

## 👥 Equipe

Projeto Final de Curso (PFC), Universidade de Mogi das Cruzes (UMC).

- **Eloisa Marin** — [@eloisamarin](https://github.com/eloisamarin)
- **Nikolas Silva** -- [@Nikolas26](https://github.com/Nikolas26)

---

<p align="center">MenteUp · versão 1.0.0 · 2026</p>
