# Funcionalidade de Exportação de PDF - Ficha de Personagem

## Resumo

Foi implementada uma funcionalidade completa para exportar a ficha do personagem em formato PDF na página `/my-character`.

## Arquivos Modificados/Criados

### 1. `src/utils/pdfExport.ts` (NOVO)

Utilitário responsável por gerar o PDF formatado com todas as informações do personagem:

**Funcionalidades:**

- Geração de PDF em formato A4
- Layout profissional com cores do tema (amber/stone)
- Cabeçalho destacado com nome, raça, classe e nível
- Seções organizadas:
  - Informações Básicas
  - Atributos (com modificadores calculados)
  - Estatísticas de Combate (HP, MP, Defesa)
  - Dinheiro
  - Equipamento
  - Inventário
  - Poderes de Raça
  - Benefícios de Origem
  - Habilidades de Classe
  - Poderes de Classe
  - Proficiências
- Paginação automática
- Rodapé com número de página e data de geração
- Nome do arquivo baseado no nome do personagem

### 2. `src/components/character/CharacterSheetView.tsx` (MODIFICADO)

Adicionado botão de exportação de PDF no header da ficha:

**Mudanças:**

- Import do ícone `Download` do lucide-react
- Import da função `exportCharacterToPDF`
- Novo estado `isExportingPDF` para controlar o loading
- Função `handleExportPDF` para executar a exportação
- Botão de exportação ao lado do botão de favorito
- Animação de loading durante a exportação

### 3. `package.json` (MODIFICADO)

Novas dependências instaladas:

- `jspdf`: Biblioteca para geração de PDFs
- `html2canvas`: Biblioteca auxiliar (caso necessário no futuro)
- `@types/jspdf`: Tipos TypeScript para jsPDF

## Como Usar

1. Acesse a página `/my-character` com um personagem ativo
2. No header da ficha, ao lado do botão de favorito (estrela), há um novo botão com ícone de download
3. Clique no botão para exportar a ficha em PDF
4. O PDF será automaticamente baixado com o nome `{nome_do_personagem}_ficha.pdf`

## Características do PDF Gerado

- **Formato**: A4 Portrait
- **Cores**: Tema amber/stone consistente com a aplicação
- **Conteúdo**: Todas as informações relevantes do personagem
- **Layout**: Profissional e organizado com seções bem definidas
- **Paginação**: Automática com quebras de página inteligentes
- **Metadados**: Rodapé com número de página e data de geração

## Observações Técnicas

- A exportação é feita completamente no client-side usando jsPDF
- Não há necessidade de servidor ou API externa
- O PDF é gerado de forma assíncrona com feedback visual (ícone rotativo)
- Tratamento de erros com mensagens amigáveis ao usuário
- Suporte para diferentes estruturas de dados de atributos (número ou objeto)

## Próximas Melhorias Possíveis

1. Adicionar imagem do personagem no PDF
2. Opção de escolher quais seções incluir
3. Diferentes templates/estilos de PDF
4. Exportação em outros formatos (JSON, TXT)
5. Compartilhamento direto via email ou redes sociais
