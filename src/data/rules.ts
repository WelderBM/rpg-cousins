import { GameRules } from "../interfaces/Rules";

const RULES: GameRules = {
  conditions: [
    {
      name: "Abalado",
      type: "condicao",
      description:
        "O personagem sofre –2 em testes de perícia. Se ficar abalado novamente, torna-se apavorado.",
    },
    {
      name: "Agarrado",
      type: "condicao",
      description:
        "O personagem fica desprevenido e imóvel, sofre –2 em testes de ataque e só pode atacar com armas leves.",
    },
    {
      name: "Alquebrado",
      type: "condicao",
      description:
        "O custo em pontos de mana de habilidades e magias aumenta em +1.",
    },
    {
      name: "Apavorado",
      type: "condicao",
      description:
        "O personagem sofre –5 em testes de perícia e deve fugir da fonte do medo. Não pode se aproximar voluntariamente da fonte.",
    },
    {
      name: "Atordoado",
      type: "condicao",
      description: "O personagem fica desprevenido e não pode fazer ações.",
    },
    {
      name: "Caído",
      type: "condicao",
      description:
        "Sofre –5 contra ataques corpo a corpo e recebe +5 contra ataques à distância.",
    },
    {
      name: "Cego",
      type: "condicao",
      description:
        "Fica desprevenido e lento, sofre –5 em testes de Percepção e todos os alvos recebem camuflagem total.",
    },
    {
      name: "Confuso",
      type: "condicao",
      description:
        "O personagem comporta-se de modo aleatório (veja tabela no manual).",
    },
    {
      name: "Debilitado",
      type: "condicao",
      description:
        "Deslocamento reduzido à metade, não pode correr ou fazer investidas.",
    },
    {
      name: "Desprevenido",
      type: "condicao",
      description:
        "Sofre –5 na Defesa e em Reflexos. Não pode realizar reações.",
    },
    {
      name: "Enjoado",
      type: "condicao",
      description:
        "Só pode realizar uma ação padrão ou de movimento por rodada (não ambas).",
    },
    {
      name: "Exausto",
      type: "condicao",
      description:
        "Fica debilitado, lento e vulnerável. Se ficar exausto novamente, fica inconsciente.",
    },
    {
      name: "Fascinado",
      type: "condicao",
      description:
        "Sofre –5 em Percepção e não pode fazer ações, exceto observar o que o fascinou.",
    },
    {
      name: "Imóvel",
      type: "condicao",
      description: "Todas as formas de deslocamento são reduzidas a 0m.",
    },
    {
      name: "Inconsciente",
      type: "condicao",
      description: "Fica indefeso e não pode fazer ações.",
    },
    {
      name: "Indefeso",
      type: "condicao",
      description:
        "Desprevenido, sofre –10 na Defesa e falha automaticamente em Reflexos.",
    },
    {
      name: "Paralisado",
      type: "condicao",
      description:
        "Imóvel e indefeso. Só pode realizar ações puramente mentais.",
    },
    {
      name: "Vulnerável",
      type: "condicao",
      description: "O personagem sofre –2 na Defesa.",
    },
  ],
  maneuvers: [
    {
      name: "Agarrar",
      type: "manobra",
      description:
        "Teste de Luta contra Luta. Se vencer, o alvo fica agarrado.",
    },
    {
      name: "Derrubar",
      type: "manobra",
      description: "Teste de Luta contra Luta. Se vencer, o alvo cai no chão.",
    },
    {
      name: "Desarmar",
      type: "manobra",
      description:
        "Teste de Luta contra Luta. Se vencer, o alvo deixa cair um item que esteja segurando.",
    },
    {
      name: "Empurrar",
      type: "manobra",
      description:
        "Teste de Luta contra Luta. Se vencer, o alvo é empurrado 1,5m para trás.",
    },
    {
      name: "Quebrar",
      type: "manobra",
      description:
        "Ataque contra um objeto empunhado ou vestido. Se acertar, causa dano ao objeto.",
    },
  ],
  rest: [
    {
      name: "Descanso Normal",
      type: "descanso",
      description:
        "8 horas de sono em condições aceitáveis. Recupera PV e PM igual ao seu nível.",
    },
    {
      name: "Descanso Confortável",
      type: "descanso",
      description:
        "8 horas em uma estalagem ou local limpo. Recupera o dobro do seu nível em PV e PM.",
    },
    {
      name: "Descanso Luxuoso",
      type: "descanso",
      description:
        "8 horas com extremo conforto e boa comida. Recupera o triplo do seu nível em PV e PM.",
    },
  ],
};

export default RULES;
