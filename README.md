# AgendFácil - Sistema de Reserva de Salas

Este é um projeto full-stack de um sistema de reserva de salas de reunião, desenvolvido como parte do desafio técnico da BPTech. O objetivo é criar uma solução funcional que permita o gerenciamento de reservas, com persistência de dados, autenticação segura e uma interface intuitiva.

## Tecnologias Utilizadas

### Backend

- **Framework:** NestJS
- **Linguagem:** TypeScript
- **Banco de Dados:** PostgreSQL
- **ORM:** TypeORM
- **Autenticação:** JWT (JSON Web Tokens) com Passport.js
- **Validação:** `class-validator` e `class-transformer`
- **Ambiente:** Docker

### Frontend

- **Framework:** React
- **Build Tool:** Vite
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS
- **Gerenciamento de Estado de Servidor:** TanStack Query (React Query)
- **Gerenciamento de Formulários:** React Hook Form com Zod para validação de schemas
- **Roteamento:** React Router DOM
- **Cliente HTTP:** Axios
- **Gerenciamento de Estado de UI:** React Context API e `useReducer`

## Pré-requisitos

Antes de começar, garanta que você tenha as seguintes ferramentas instaladas:

- Node.js (versão 20.x ou superior)
- Docker e Docker Compose

## Como Executar o Projeto Completo

1.  **Clone o Repositório**

    ```bash
    git clone https://github.com/Dinihz/bptech-test.git
    cd bptech-test
    ```

2.  **Configure as Variáveis de Ambiente**

    - Copie o arquivo `.env.example` para `.env` na raiz do projeto e preencha as variáveis do banco de dados (`DB_PASSWORD`, etc.).
    - Copie o arquivo `backend/.env.example` para `backend/.env` e preencha o `JWT_SECRET`.
    - Copie o arquivo `frontend/.env.example` para `frontend/.env`.

3.  **Inicie os Contêineres**
    Este comando irá construir as imagens do backend e frontend, e iniciar todos os serviços.
    ```bash
    docker-compose up --build
    ```
    - O **frontend** estará acessível em: `http://localhost`
    - A **API** do backend (para testes com Postman) estará acessível em: `http://localhost:3000/api`

## Como Rodar os Testes do Backend

### Testes Unitários

1.  Navegue até a pasta do backend:
    ```bash
    cd backend
    ```
2.  Execute o comando de teste:
    ```bash
    npm run test
    ```
3.  Para rodar em modo "watch" (que re-executa os testes a cada alteração de arquivo):
    ```bash
    npm run test:watch
    ```

### Testes de Integração

1.  Garanta que o ambiente Docker esteja rodando:
    ```bash
    # Na raiz do projeto
    docker-compose up -d
    ```
2.  Navegue até a pasta do backend:
    ```bash
    cd backend
    ```
3.  Execute o comando de teste E2E:
    ```bash
    npm run test:e2e
    ```

---
