export interface RuleItem {
  name: string;
  description: string;
}

export interface Condition extends RuleItem {
  type: "condicao";
}

export interface Maneuver extends RuleItem {
  type: "manobra";
}

export interface RestRule extends RuleItem {
  type: "descanso";
}

export interface GameRules {
  conditions: Condition[];
  maneuvers: Maneuver[];
  rest: RestRule[];
}
