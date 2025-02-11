export const SYSTEM_ID = 'foundryvtt-final-fantasy';
export const SYSTEM_CODE = 'FF15';
export const LOG_PREFIX = `${SYSTEM_CODE} |`;
export const LOG_PREFIX_COLOR = `%c[${SYSTEM_CODE}] |`;
export const ASSET_PATH = `systems/${SYSTEM_ID}/assets`;
export const LOG_STYLES = {
  p: 'color: purple;',
  g: 'color: green;',
  r: 'color: red;',
  o: 'color: orange;',
  b: 'color: blue;',
  y: 'color: yellow;',
  c: 'color: cyan;',
  m: 'color: magenta;',
  gr: 'color: gray;',
  br: 'color: brown;',
  pi: 'color: pink;',
  t: 'color: teal;'
};

export const getDamageDiceRerollOptions = () => [
  { value: 1, label: game.i18n.localize("FF15.Types.Item.Types.Options.DamageDiceReroll.one") },
  { value: 2, label: game.i18n.localize("FF15.Types.Item.Types.Options.DamageDiceReroll.two") },
  { value: 3, label: game.i18n.localize("FF15.Types.Item.Types.Options.DamageDiceReroll.three") },
];

export const getDurationOptions = () => [
  { value: 1, label: game.i18n.localize("FF15.one") },
  { value: 2, label: game.i18n.localize("FF15.two") },
  { value: 3, label: game.i18n.localize("FF15.three") },
  { value: 4, label: game.i18n.localize("FF15.four") },
];

export function getDurationTypeOptions() {
  return [
    { value: "hasAmount", label: game.i18n.localize("FF15.Types.Item.Types.Options.DurationType.hasAmount") },
    { value: "hasQualifier", label: game.i18n.localize("FF15.Types.Item.Types.Options.DurationType.hasQualifier") },
  ];
}

export const getDurationQualifierOptions = () => [
  { value: "endOfThis", label: game.i18n.localize("FF15.Types.Item.Duration.Options.endOfThis") },
  { value: "endOfNext", label: game.i18n.localize("FF15.Types.Item.Duration.Options.endOfNext") },
  { value: "startOfNext", label: game.i18n.localize("FF15.Types.Item.Duration.Options.startOfNext") },
  { value: "untilDamage", label: game.i18n.localize("FF15.Types.Item.Duration.Options.untilDamage") },
  { value: "nextAbility", label: game.i18n.localize("FF15.Types.Item.Duration.Options.nextAbility") },
];

export const getDurationUnits = () => [
  { value: "phase", label: game.i18n.localize("FF15.Phase") },
  { value: "turn", label: game.i18n.localize("FF15.Turn") },
  { value: "round", label: game.i18n.localize("FF15.Round") }
];
export const getLimitationOptions = () => [
  { value: 1, label: game.i18n.localize("FF15.Types.Item.Types.Options.Limitation.once") },
  { value: 2, label: game.i18n.localize("FF15.Types.Item.Types.Options.Limitation.twice") },
  { value: 3, label: game.i18n.localize("FF15.Types.Item.Types.Options.Limitation.thrice") },
];

export const getLimitationUnits = () => [
  { value: "phase", label: game.i18n.localize("FF15.Phase") },
  { value: "turn", label: game.i18n.localize("FF15.Turn") }
];

export const getTypeOptions = () => [
  { value: "primary", label: game.i18n.localize("FF15.Types.Item.Types.Options.Type.primary") },
  { value: "secondary", label: game.i18n.localize("FF15.Types.Item.Types.Options.Type.secondary") },
  { value: "reaction", label: game.i18n.localize("FF15.Types.Item.Types.Options.Type.reaction") },
  { value: "limit", label: game.i18n.localize("FF15.Types.Item.Types.Options.Type.limit") },
  { value: "combo", label: game.i18n.localize("FF15.Types.Item.Types.Options.Type.combo") },
];

export const getBaseEffectHealingTypeOptions = () => [
  { value: "self", label: game.i18n.localize("FF15.Types.Item.Types.Options.BaseEffectHealingType.self") },
  { value: "target", label: game.i18n.localize("FF15.Types.Item.Types.Options.BaseEffectHealingType.target") },
];

export const getSizeOptions = () => [
  { value: "small", label: game.i18n.localize("FF15.Types.Item.Types.Options.Size.small") },
  { value: "medium", label: game.i18n.localize("FF15.Types.Item.Types.Options.Size.medium") },
  { value: "large", label: game.i18n.localize("FF15.Types.Item.Types.Options.Size.large") },
  { value: "huge", label: game.i18n.localize("FF15.Types.Item.Types.Options.Size.huge") },
  { value: "gargantuan", label: game.i18n.localize("FF15.Types.Item.Types.Options.Size.gargantuan") }
];

export const getRangeOptions = () => [
  { value: "1sq", label: game.i18n.localize("FF15.Types.Item.Types.Options.Range.1sq") },
  { value: "5sq", label: game.i18n.localize("FF15.Types.Item.Types.Options.Range.5sq") },
  { value: "10sq", label: game.i18n.localize("FF15.Types.Item.Types.Options.Range.10sq") },
  { value: "3x3a", label: game.i18n.localize("FF15.Types.Item.Types.Options.Range.3x3a") },
  { value: "3x3aa", label: game.i18n.localize("FF15.Types.Item.Types.Options.Range.3x3aa") },
  { value: "5x5a", label: game.i18n.localize("FF15.Types.Item.Types.Options.Range.5x5a") },
  { value: "5x5e", label: game.i18n.localize("FF15.Types.Item.Types.Options.Range.5x5e") },
  { value: "5x5i", label: game.i18n.localize("FF15.Types.Item.Types.Options.Range.5x5i") },
];

export const getCROptions = () => [
  { value: "def", label: game.i18n.localize("FF15.Types.Item.Types.Options.CR.def") },
  { value: "mag", label: game.i18n.localize("FF15.Types.Item.Types.Options.CR.mag") },
  // { value: "vig", label: game.i18n.localize("FF15.Types.Item.Types.Options.CR.vig") },
  // { value: "spd", label: game.i18n.localize("FF15.Types.Item.Types.Options.CR.spd") },
  { value: "heal", label: game.i18n.localize("FF15.Types.Item.Types.Options.CR.heal") },
  { value: "other", label: game.i18n.localize("FF15.Other") },
  { value: "none", label: game.i18n.localize("FF15.None") },
  // { value: "special", label: game.i18n.localize("FF15.Types.Item.Types.Options.CR.special") },
];

export const getTargetOptions = () => [
  { value: "self", label: game.i18n.localize("FF15.Types.Item.Types.Options.Target.self") },
  { value: "single", label: game.i18n.localize("FF15.Types.Item.Types.Options.Target.single") },
  { value: "enemy", label: game.i18n.localize("FF15.Types.Item.Types.Options.Target.enemy") },
  { value: "all", label: game.i18n.localize("FF15.Types.Item.Types.Options.Target.all") },
  { value: "allallies", label: game.i18n.localize("FF15.Types.Item.Types.Options.Target.allallies") },
  { value: "ally", label: game.i18n.localize("FF15.Types.Item.Types.Options.Target.ally") },
];

export const getAspectedOptions = () => [
  { value: "earth", label: game.i18n.localize("FF15.Types.Item.Types.Options.Aspected.earth") },
  { value: "lightning", label: game.i18n.localize("FF15.Types.Item.Types.Options.Aspected.lightning") },
  { value: "wind", label: game.i18n.localize("FF15.Types.Item.Types.Options.Aspected.wind") },
  { value: "ice", label: game.i18n.localize("FF15.Types.Item.Types.Options.Aspected.ice") },
];

export const getUsesUnitOptions = () => [
  { value: "turn", label: game.i18n.localize("FF15.Types.Item.Types.Options.UsesUnit.turn") },
  { value: "phase", label: game.i18n.localize("FF15.Types.Item.Types.Options.UsesUnit.phase") },
  { value: "round", label: game.i18n.localize("FF15.Types.Item.Types.Options.UsesUnit.round") },
];
export const getTriggerOptions = () =>  [
  { value: "any", label: game.i18n.localize("FF15.Types.Item.Types.Options.Trigger.any") },
  { value: "ability", label: game.i18n.localize("FF15.Types.Item.Types.Options.Trigger.ability") },
  { value: "beforeresolve", label: game.i18n.localize("FF15.Types.Item.Types.Options.Trigger.beforeresolve") },
  { value: "nearby", label: game.i18n.localize("FF15.Types.Item.Types.Options.Trigger.nearby") },
  { value: "move", label: game.i18n.localize("FF15.Types.Item.Types.Options.Trigger.move") },
  { value: "beforedamage", label: game.i18n.localize("FF15.Types.Item.Types.Options.Trigger.beforedamage") },
  { value: "endturn", label: game.i18n.localize("FF15.Types.Item.Types.Options.Trigger.endturn") },
  { value: "startturn", label: game.i18n.localize("FF15.Types.Item.Types.Options.Trigger.startturn") },
  { value: "invoke", label: game.i18n.localize("FF15.Types.Item.Types.Options.Trigger.invoke") },
  { value: "adjacentinvoke", label: game.i18n.localize("FF15.Types.Item.Types.Options.Trigger.adjacentinvoke") },
];

export const getHeavyshotOptions = () => [
  { value: "straignt", label: game.i18n.localize("FF15.Types.Item.Types.Options.Heavyshot.straignt") },
  { value: "spread", label: game.i18n.localize("FF15.Types.Item.Types.Options.Heavyshot.spread") },
];

export const getDirectHitOptions = () => [
  { value: "damage", label: game.i18n.localize("FF15.Types.Item.Types.Options.DirectHit.damage") },
  { value: "markers", label: game.i18n.localize("FF15.Types.Item.Types.Options.DirectHit.markers") },
  { value: "condition", label: game.i18n.localize("FF15.Types.Item.Types.Options.DirectHit.condition") },
];

export const ACTIVE_EFFECT_MODES = {
  CUSTOM: 0,
  MULTIPLY: 1,
  ADD: 2,
  OVERRIDE: 3,
  DOWNGRADE: 4,
  UPGRADE: 5
};

export const activeEffectModes = [
  { value: ACTIVE_EFFECT_MODES.CUSTOM, label: "custom" },
  { value: ACTIVE_EFFECT_MODES.MULTIPLY, label: "multiply" },
  { value: ACTIVE_EFFECT_MODES.ADD, label: "add" },
  { value: ACTIVE_EFFECT_MODES.OVERRIDE, label: "override" },
  { value: ACTIVE_EFFECT_MODES.DOWNGRADE, label: "downgrade" },
  { value: ACTIVE_EFFECT_MODES.UPGRADE, label: "upgrade" }
];

