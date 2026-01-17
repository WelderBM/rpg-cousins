<h1 align="center">RPG-Cousins: Engine de Gestão & Automação para Tormenta 20</h1>

<div align="center">
  <img src="./public/assets/preview-rpg.png" width="100%" alt="RPG-Cousins Interface" style="border-radius: 10px"/>
</div>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js_15-black?logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-Pro-blue?logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Firebase-Auth_&_Firestore-orange?logo=firebase" alt="Firebase">
  <img src="https://img.shields.io/badge/PDF_Generation-jspdf-green" alt="PDF">
</p>

## 🐉 O Projeto

O **RPG-Cousins** é uma plataforma SaaS (Software as a Service) concebida para automatizar a complexidade do sistema de RPG *Tormenta 20*. O sistema elimina a necessidade de cálculos manuais e consultas constantes a manuais físicos, oferecendo uma experiência fluida de criação, gestão e exportação de personagens.

## 🧠 Engenharia de Software & Soluções

### 1. Motor de Recálculo Dinâmico
O núcleo do sistema é um motor de funções puras que processa o estado do personagem.
* **Problema:** No RPG, uma mudança na "Raça" pode alterar bónus de atributos, que por sua vez recalcula 28 perícias diferentes e bónus de ataque.
* **Solução:** Implementação de um middleware de cálculo centralizado (`recalculateSheet`) que garante a consistência dos dados em tempo real, utilizando **Zustand** para gestão de estado atómica e performática.

### 2. Automação e Data Crawling
Para suportar a vasta base de dados de poderes, raças e classes:
* **Desenvolvimento de Ferramentas:** Foram criados scripts em **Python** para processar e extrair dados de manuais oficiais, convertendo-os em estruturas JSON otimizadas para o Firestore.
* **Eficiência:** O que levaria semanas de input manual foi resolvido com automação, garantindo zero erros de digitação nos dados técnicos.

### 3. Sistema de Grimório & Wiki
Uma enciclopédia interativa integrada que utiliza filtros avançados de busca.
* **UX de Conhecimento:** Interface inspirada em bibliotecas digitais modernas, permitindo que jogadores consultem regras e magias sem sair da sua ficha de personagem.

### 4. Exportação Profissional para PDF
Integração com bibliotecas de geração de PDF para transformar o estado digital do React numa ficha física oficial.
* **Desafio:** Mapear coordenadas de dados dinâmicos sobre um template estático mantendo a alta resolução para impressão.

## 🛠️ Stack Tecnológica

* **Frontend:** Next.js 15 (App Router), Tailwind CSS, Lucide React.
* **Estado:** Zustand (Store modularizada para Personagem, Grimório e UI).
* **Backend & Auth:** Firebase (Cloud Firestore para persistência em tempo real e Authentication para segurança de instâncias).
* **Automação:** Python (Scripts de tratamento de dados).
* **Qualidade:** Vitest para testes unitários de lógica de atributos e bónus.

## ⚙️ Execução Local

1. **Clone:** `git clone https://github.com/WelderBM/rpg-cousins`
2. **Dependências:** `npm install`
3. **Ambiente:** Configure as chaves do Firebase em `.env.local` seguindo o ficheiro de exemplo.
4. **Dev Mode:** `npm run dev`

## 🚀 Roadmap de Funcionalidades
- [ ] Roll de dados 3D integrado na ficha.
- [ ] Gestão de Inventário com cálculo de carga automático.
- [ ] Chat em tempo real entre Mestre e Jogadores da mesma campanha.

---
**Desenvolvido por [Welder Barroso](https://linkedin.com/in/welder-barroso-37b654207)**
*Engenharia Frontend focada em lógica complexa e produtos de alto valor.*
