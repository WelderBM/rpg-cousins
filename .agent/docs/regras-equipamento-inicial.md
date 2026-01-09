# Regras de Equipamento Inicial - Tormenta20 (ATUALIZADO)

## ⚠️ Correção Importante

Após pesquisa aprofundada, as regras de equipamento inicial são mais complexas do que inicialmente implementado. A restrição não é apenas sobre proficiência, mas principalmente sobre **custo e riqueza inicial**.

## 📜 Regras Oficiais (Capítulo 3: Equipamento)

### Equipamento Básico (Todos os Personagens)

Todo personagem de 1º nível recebe automaticamente:

- 1 mochila
- 1 saco de dormir
- 1 traje de viajante
- **Equipamento listado em sua classe** (específico por classe)
- **T$ 4d6 (Tibutões de Ouro)** para gastar livremente

### Riqueza Inicial

- **Valor**: 4d6 Tibutões de Ouro (TO)
- **Média**: ~14 TO
- **Mínimo**: 4 TO
- **Máximo**: 24 TO

## 🚫 Por que Besta Pesada não pode ser escolhida?

### Análise de Custo

- **Besta Pesada**: T$ 50
- **Riqueza inicial máxima**: T$ 24 (4d6)
- **Conclusão**: É **IMPOSSÍVEL** comprar uma Besta Pesada com a riqueza inicial. Como ela não consta na lista de "itens gratuitos" de nenhuma classe (apenas armas simples ou marciais leves/médias), ela deve ser comprada.

### Regra Aplicada

A proibição existe porque:

1. O valor da Besta Pesada (T$ 50) é **muito superior** à quantidade de dinheiro inicial.
2. Você não "pega de graça" porque ela tem um **custo definido** na tabela de equipamentos.
3. Os métodos de criação de personagem **não fornecem automaticamente** essa arma específica.
4. Não há dinheiro suficiente para comprá-la **sem abrir mão de praticamente todo o resto do equipamento essencial**.

## 💰 Tabela de Custos - Armas Marciais

### Armas Marciais Acessíveis na Criação (até T$ 35)

| Arma               | Custo     | Acessível?         |
| ------------------ | --------- | ------------------ |
| Machadinha         | T$ 6      | ✅ Sim             |
| Cimitarra          | T$ 15     | ✅ Sim             |
| Espada Longa       | T$ 15     | ✅ Sim             |
| Florete            | T$ 20     | ✅ Sim             |
| Machado de Batalha | T$ 10     | ✅ Sim             |
| Mangual            | T$ 8      | ✅ Sim             |
| Martelo de Guerra  | T$ 12     | ✅ Sim             |
| Picareta           | T$ 8      | ✅ Sim             |
| Tridente           | T$ 15     | ✅ Sim             |
| Alabarda           | T$ 10     | ✅ Sim             |
| Gadanho            | T$ 18     | ✅ Sim             |
| Lança Montada      | T$ 10     | ✅ Sim             |
| Machado de Guerra  | T$ 20     | ✅ Sim             |
| Marreta            | T$ 20     | ✅ Sim             |
| Espada Bastarda \* | T$ 35     | ✅ Sim             |
| **Montante**       | **T$ 50** | ❌ **INACESSÍVEL** |
| **Besta Pesada**   | **T$ 50** | ❌ **INACESSÍVEL** |
| Arco Longo         | T$ 100    | ❌ Muito caro      |
| Alfange            | T$ 75     | ❌ Muito caro      |

\* Se o personagem tiver proficiência com armas exóticas.

### Armas de Fogo

| Arma     | Custo  | Acessível?    |
| -------- | ------ | ------------- |
| Pistola  | T$ 250 | ❌ Muito caro |
| Mosquete | T$ 500 | ❌ Muito caro |

## 🎯 Implementação na Plataforma

### Validação Aplicada

1. **Filtro de Custo**: Armas marciais e exóticas limitadas a **T$ 35**.
2. **Besta Pesada & Montante**: Automaticamente **excluídas** das opções de escolha no wizard.
3. **Armas de Fogo**: **Bloqueadas** na criação (T$ 250+).

### Código Implementado

```typescript
const availableMartialWeapons = useMemo(() => {
  if (!selectedPreview) return [];
  const profs = selectedPreview.proficiencias;
  if (profs.includes("Armas Marciais")) {
    // Filtrar armas marciais por custo acessível
    // Riqueza inicial: 4d6 TO (máximo 24)
    // Armas de T$ 50 ou mais são inacessíveis
    return EQUIPAMENTOS.armasMarciais.filter((weapon) => weapon.preco <= 35);
  }
  return [];
}, [selectedPreview]);
```

## 📊 Exemplos Práticos

### ❌ INCORRETO

- Escolher "Besta Pesada" (T$ 50) como arma inicial.
- Escolher "Montante" (T$ 50) como arma inicial (exceto se for a arma padrão do Bárbaro).
- Escolher "Arco Longo" (T$ 100) como arma inicial.

### ✅ CORRETO

**Guerreiro (com proficiência marcial)**

- Arma Simples: Besta Leve (T$ 35) ✅
- Arma Marcial: Espada Longa (T$ 15) ✅
- Dinheiro restante: O personagem usa sua riqueza inicial para outros itens essenciais.

## 🔍 Referências

- Livro Básico do Tormenta20, Capítulo 3: Equipamento.
- Seção "Equipamento Inicial".
- Tabela de Armas (com custos).

## 💡 Observação Final

A Besta Pesada **pode ser adquirida posteriormente** através de recompensas, compra com dinheiro acumulado ou saque. No entanto, ela **não está disponível para escolha gratuita ou compra inicial** devido ao seu alto custo comparado à riqueza inicial de um aventureiro de 1º nível.
