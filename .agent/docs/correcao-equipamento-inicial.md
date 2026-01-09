# Correção de Validação de Equipamento Inicial

## Problema Identificado

O usuário conseguiu escolher **Besta Pesada** (arma marcial) como equipamento inicial, mas a Mestre informou que isso não era permitido pelas regras do Tormenta20.

## Investigação

1. **Besta Pesada** está corretamente classificada como **arma marcial** no arquivo `equipamentos.ts`
2. As regras oficiais do Tormenta20 estabelecem:
   - Todo personagem recebe **1 arma simples**
   - Se tiver proficiência com armas marciais, recebe **1 arma marcial ADICIONAL**

## Problema no Código Anterior

O sistema permitia escolher QUALQUER arma das proficiências disponíveis, sem separar:

- Slot de arma simples (obrigatório)
- Slot de arma marcial (condicional)

## Solução Implementada

### 1. Refatoração da Lógica de Slots

```typescript
// ANTES: Número fixo de slots baseado na classe
const weaponSlots = useMemo(() => {
  if (!selectedPreview) return 0;
  if (selectedPreview.name === "Caçador") return 2;
  if (selectedPreview.name === "Ladino") return 2;
  return 1;
}, [selectedPreview]);

// DEPOIS: Slots tipados com validação de proficiência
const weaponSlots = useMemo(() => {
  if (!selectedPreview) return [];
  const profs = selectedPreview.proficiencias;
  const hasMartialProf = profs.includes("Armas Marciais");

  return [
    { type: "simple", label: "Arma Simples", weapons: availableSimpleWeapons },
    ...(hasMartialProf
      ? [
          {
            type: "martial",
            label: "Arma Marcial",
            weapons: availableMartialWeapons,
          },
        ]
      : []),
  ];
}, [selectedPreview, availableSimpleWeapons, availableMartialWeapons]);
```

### 2. Separação de Armas por Tipo

```typescript
// Armas simples - sempre disponíveis
const availableSimpleWeapons = useMemo(() => {
  return [...EQUIPAMENTOS.armasSimples];
}, []);

// Armas marciais - apenas se tiver proficiência
const availableMartialWeapons = useMemo(() => {
  if (!selectedPreview) return [];
  const profs = selectedPreview.proficiencias;
  if (profs.includes("Armas Marciais")) {
    return [...EQUIPAMENTOS.armasMarciais];
  }
  return [];
}, [selectedPreview]);
```

### 3. Interface Visual Melhorada

- **Alerta informativo** explicando as regras do Tormenta20
- **Labels claros** para cada slot:
  - "Arma Simples" (Obrigatório)
  - "Arma Marcial" (Bônus por Proficiência)
- **Feedback visual** diferenciado por proficiência:
  - Verde para classes com proficiência marcial
  - Cinza para classes sem proficiência marcial

### 4. Documentação

Criado arquivo `.agent/docs/regras-equipamento-inicial.md` com:

- Regras completas de equipamento inicial
- Lista de armas simples e marciais
- Classes com proficiência marcial
- Exemplos de uso correto e incorreto

## Resultado

✅ **Agora é IMPOSSÍVEL** escolher uma arma marcial como única arma inicial
✅ O sistema força a escolha de 1 arma simples primeiro
✅ Apenas classes com proficiência marcial veem o segundo slot
✅ Interface clara e educativa sobre as regras

## Exemplo de Uso Correto

### Classe SEM proficiência marcial (ex: Arcanista)

- Slot 1: Arma Simples (ex: Adaga) ✅

### Classe COM proficiência marcial (ex: Guerreiro)

- Slot 1: Arma Simples (ex: Besta Leve) ✅
- Slot 2: Arma Marcial (ex: Besta Pesada) ✅

## Validação

- ✅ Build bem-sucedido
- ✅ TypeScript sem erros
- ✅ Lógica de validação implementada
- ✅ Interface visual atualizada
