# Implementação de Bônus de Atributos Flexíveis

## 🎯 Problema Identificado

Raças como **Humanos** têm bônus de atributos flexíveis (`attr: 'any'`) que permitem ao jogador escolher em quais atributos aplicá-los, mas a plataforma não estava permitindo essa escolha.

## ✅ Solução Implementada

### 1. **Estado no CharacterStore**

Adicionado `flexibleAttributeChoices: Record<number, Atributo>` que mapeia:

- **Índice do bônus** (0, 1, 2...) → **Atributo escolhido** (Força, Destreza, etc.)

```typescript
interface CharacterWizardState {
  // ... outros campos
  flexibleAttributeChoices: Record<number, Atributo>;
  setFlexibleAttributeChoice: (index: number, attr: Atributo) => void;
}
```

### 2. **Função de Escolha**

```typescript
setFlexibleAttributeChoice: (index, attr) => {
  set((state) => ({
    flexibleAttributeChoices: {
      ...state.flexibleAttributeChoices,
      [index]: attr,
    },
  }));
};
```

### 3. **Limpeza Automática**

Quando o jogador troca de raça, as escolhas flexíveis são resetadas automaticamente.

## 📝 Próximos Passos para UI

Para completar a implementação, você precisa atualizar o `AttributeSelection.tsx` com:

### 1. Detectar Bônus Flexíveis

```typescript
const flexibleBonuses =
  selectedRace?.attributes.attrs
    .map((a, index) => ({ ...a, index }))
    .filter((a) => a.attr === "any") || [];
```

### 2. Calcular Bônus Total por Atributo

```typescript
const getRacialBonus = (
  race: Race | null,
  attr: Atributo,
  flexChoices: Record<number, Atributo>
) => {
  if (!race) return 0;

  // Bônus fixos
  let bonus = 0;
  race.attributes.attrs.forEach((a) => {
    if (a.attr === attr) {
      bonus += a.mod;
    }
  });

  // Bônus flexíveis escolhidos
  Object.entries(flexChoices).forEach(([indexStr, chosenAttr]) => {
    if (chosenAttr === attr) {
      const index = parseInt(indexStr);
      const flexBonus = race.attributes.attrs[index];
      if (flexBonus && flexBonus.attr === "any") {
        bonus += flexBonus.mod;
      }
    }
  });

  return bonus;
};
```

### 3. UI de Seleção de Bônus Flexíveis

Adicionar uma seção antes do grid de atributos:

```tsx
{flexibleBonuses.length > 0 && (
  <div className="bg-amber-950/30 border-2 border-amber-700/50 rounded-2xl p-6 mb-8">
    <h3 className="text-xl font-cinzel text-amber-500 mb-4">
      ⭐ Bônus Flexíveis da Raça
    </h3>
    <p className="text-sm text-neutral-400 mb-4">
      Como {selectedRace.name}, você pode escolher onde aplicar {flexibleBonuses.length} bônus(s):
    </p>

    <div className="space-y-4">
      {flexibleBonuses.map((bonus) => (
        <div key={bonus.index} className="bg-black/30 rounded-lg p-4">
          <div className="text-sm text-neutral-300 mb-2">
            Bônus {bonus.mod > 0 ? `+${bonus.mod}` : bonus.mod} - Escolha o atributo:
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {ATTRIBUTES_LIST.map((attr) => {
              const isSelected = flexibleChoices[bonus.index] === attr;
              const Icon = ATTRIBUTE_ICONS[attr];

              return (
                <button
                  key={attr}
                  onClick={() => setFlexibleAttributeChoice(bonus.index, attr)}
                  className={`p-3 rounded-lg border-2 transition-all flex items-center gap-2 ${
                    is Selected
                      ? "bg-amber-900/40 border-amber-500"
                      : "bg-neutral-900/50 border-neutral-700 hover:border-amber-700"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{attr}</span>
                  {isSelected && <Check className="w-4 h-4 ml-auto text-amber-400" />}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  </div>
)}
```

### 4. Atualizar Cálculo nos Cards

```typescript
const racialBonus = getRacialBonus(selectedRace, attr, flexibleChoices);
```

## 🎨 Visual Esperado

```
┌────────────────────────────────────────────────┐
│ ⭐ Bônus Flexíveis da Raça                     │
│                                                │
│ Como Humano, você pode escolher onde aplicar   │
│ 3 bônus(s):                                    │
│                                                │
│ Bônus +1 - Escolha o atributo:                 │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐   │
│ │⚡FO│ │🏃DE│ │❤️CO│ │🧠IN│ │👁SA│ │✨CA│   │
│ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘   │
│                                                │
│ Bônus +1 - Escolha o atributo:                 │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐   │
│ │⚡FO│ │🏃DE│ │❤️CO│ │🧠IN│ │👁SA│ │✨CA│   │
│ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘   │
│                                                │
│ Bônus +1 - Escolha o atributo:                 │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐   │
│ │⚡FO│ │🏃DE│ │❤️CO│ │🧠IN│ │👁SA│ │✨CA│   │
│ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘   │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│           Grid de Atributos                    │
│  (mostra bônus totais aplicados)              │
└────────────────────────────────────────────────┘
```

## 📊 Exemplo Prático

**Humano com 3 bônus de +1**:

Jogador escolhe:

- Bônus 0 → Força
- Bônus 1 → Força
- Bônus 2 → Destreza

**Resultado**:

- Força: +2 (raça)
- Destreza: +1 (raça)
- Outros: 0

## ⚠️ Validações Necessárias

1. **Todos os bônus devem ser distribuídos** antes de avançar
2. **Indicador visual** de quantos faltam escolher
3. **Permitir trocar** escolhas já feitas

## 🚀 Estado Atual

✅ Store atualizado com `flexibleAttributeChoices`  
✅ Função `setFlexibleAttributeChoice` implementada  
✅ Limpeza automática ao trocar de raça  
⏳ UI precisa ser implementada no `AttributeSelection.tsx`

---

**Arquivos Modificados**:

- `src/store/useCharacterStore.ts` - Estado e funções adicionados

**Próximo Arquivo a Modificar**:

- `src/components/wizard/AttributeSelection.tsx` - Adicionar UI de seleção
