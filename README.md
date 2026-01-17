<h1 align="center">RPG-Cousins: Automação de Sistemas & Inteligência de Dados para T20</h1>

<div align="center">
  <img src="./public/assets/preview-rpg.png" width="100%" alt="RPG-Cousins Preview" style="border-radius: 10px"/>
</div>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?logo=next.js" alt="Next.js 15">
  <img src="https://img.shields.io/badge/TypeScript-Logic-blue?logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Python-Automation-green?logo=python" alt="Python">
  <img src="https://img.shields.io/badge/Firebase-Persistence-orange?logo=firebase" alt="Firebase">
</p>

## 📌 O Projeto

O **RPG-Cousins** surgiu de uma necessidade prática: simplificar a gestão de fichas do sistema *Tormenta 20* para o meu grupo de jogo. O foco central não foi apenas criar uma interface, mas sim **automatizar o trabalho braçal e repetitivo** de consulta a manuais, permitindo que os jogadores foquem no que realmente importa: a narrativa.

## 🚀 Diferenciais de Engenharia & Criatividade

### 1. Automação de Dados (Data Scripting)
A maior barreira técnica de sistemas de RPG é a volumetria de dados (centenas de poderes, raças e magias). 
* **Abordagem Inteligente:** Em vez de inserção manual, desenvolvi scripts em **Python** para processar, extrair e normalizar dados de fontes existentes, convertendo-os em estruturas JSON otimizadas.
* **Impacto:** Redução drástica no erro humano e na latência de desenvolvimento. A inteligência do sistema é alimentada por automação, não por digitação.

### 2. Arquitetura Local-First com Persistência Híbrida
O sistema foi projetado para ser extremamente rápido e resiliente.
* **Inteligência Local:** Toda a "biblioteca" de regras, classes e poderes reside e é processada no lado do cliente. Isso garante que buscas e filtros sejam instantâneos, sem dependência constante de requisições de rede.
* **Backend como Persistência:** O **Cloud Firestore** atua exclusivamente como uma camada de backup e sincronização. Ele não armazena o livro de regras, mas sim o *resultado* da criatividade do usuário (as fichas criadas), otimizando custos e performance.

### 3. Motor de Recálculo Dinâmico
Implementação de uma lógica complexa de "efeito cascata" utilizando **Zustand** e TypeScript.
* **Solução Técnica:** Mudar um único atributo (como Força) dispara automaticamente o recálculo de perícias, bônus de ataque e carga, refletindo as regras de *Tormenta 20* em tempo real na UI.

## 🛠️ Stack Tecnológica

* **Frontend:** Next.js 15 com App Router e Tailwind CSS.
* **Gestão de Estado:** Zustand (Atômico e Modular).
* **Automação:** Python (Scripts de tratamento de dados e extração).
* **Persistência:** Firebase Firestore (Salva apenas os dados gerados pelo usuário).

## ⚙️ Como executar o projeto

1. **Clone o repositório:**
   ```bash
   git clone [https://github.com/WelderBM/rpg-cousins](https://github.com/WelderBM/rpg-cousins)
   ```
2. **Instale as dependências:**
   ```bash
   npm install
   ```
3. **Configure as variáveis do Firebase:**
   Adicione suas chaves no `.env.local` (necessário apenas para a função de salvar fichas).
4. **Inicie o servidor local:**
   ```bash
   npm run dev
   ```

---
**Autor:** [Welder Barroso](https://linkedin.com/in/welder-barroso-37b654207)
*Desenvolvendo ferramentas que otimizam o tempo e potencializam a criatividade.*
