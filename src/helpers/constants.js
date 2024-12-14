
export const SYSTEM_ID = 'foundryvtt-final-fantasy';
export const SYSTEM_CODE = 'FF15';
export const LOG_PREFIX = `${SYSTEM_CODE} |`;
export const ASSET_PATH = `systems/${SYSTEM_ID}/assets`;

export const getTypeOptions = () => [
  { value: "primary", label: game.i18n.localize("FF15.Types.Item.Types.Options.Type.primary") },
  { value: "secondary", label: game.i18n.localize("FF15.Types.Item.Types.Options.Type.secondary") },
  { value: "reaction", label: game.i18n.localize("FF15.Types.Item.Types.Options.Type.reaction") },
  { value: "limit", label: game.i18n.localize("FF15.Types.Item.Types.Options.Type.limit") },
  { value: "combo", label: game.i18n.localize("FF15.Types.Item.Types.Options.Type.combo") },
];

export const getSizeOptions = () => [
  { value: "small", label: game.i18n.localize("FF15.Types.Item.Types.Options.Telegraph.Size.small") },
  { value: "medium", label: game.i18n.localize("FF15.Types.Item.Types.Options.Telegraph.Size.medium") },
  { value: "large", label: game.i18n.localize("FF15.Types.Item.Types.Options.Telegraph.Size.large") },
  { value: "huge", label: game.i18n.localize("FF15.Types.Item.Types.Options.Telegraph.Size.huge") },
  { value: "gargantuan", label: game.i18n.localize("FF15.Types.Item.Types.Options.Telegraph.Size.gargantuan") }
];

export const getRangeOptions = () => [
  { value: "1sq", label: game.i18n.localize("FF15.Types.Item.Types.Options.Range.1sq") },
  { value: "5sq", label: game.i18n.localize("FF15.Types.Item.Types.Options.Range.5sq") },
  { value: "10sq", label: game.i18n.localize("FF15.Types.Item.Types.Options.Range.10sq") },
  { value: "3x3a", label: game.i18n.localize("FF15.Types.Item.Types.Options.Range.3x3a") },
  { value: "3x3aa", label: game.i18n.localize("FF15.Types.Item.Types.Options.Range.3x3aa") },
  { value: "5x5a", label: game.i18n.localize("FF15.Types.Item.Types.Options.Range.5x5a") },
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

export const getLimitationOptions = () => [
  { value: "once", label: game.i18n.localize("FF15.Types.Item.Types.Options.Limitation.once") },
  { value: "twice", label: game.i18n.localize("FF15.Types.Item.Types.Options.Limitation.twice") },
  { value: "thrice", label: game.i18n.localize("FF15.Types.Item.Types.Options.Limitation.thrice") },
];

export const getTargetOptions = () => [
  { value: "single", label: game.i18n.localize("FF15.Types.Item.Types.Options.Target.single") },
  { value: "enemy", label: game.i18n.localize("FF15.Types.Item.Types.Options.Target.enemy") },
  { value: "all", label: game.i18n.localize("FF15.Types.Item.Types.Options.Target.all") },
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
  { value: "move", label: game.i18n.localize("FF15.Types.Item.Types.Options.Trigger.move") },
  { value: "turn", label: game.i18n.localize("FF15.Types.Item.Types.Options.Trigger.turn") },
  { value: "invoke", label: game.i18n.localize("FF15.Types.Item.Types.Options.Trigger.invoke") },
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


export const activeEffectModes = [
  {
    value: 0,
    label: "custom"
  },
  {
    value: 1,
    label: "multiply" // i.e. multiply value (can be a fraction and thus division)
  },
  {
    value: 2,
    label: "add" // i.e. add a scalar amount to the value (can be negative)
  },
  {
    value: 3,
    label: "override" // i.e. replace the value entirely
  },
  {
    value: 4,
    label: "downgrade" // i.e. limit the maximum value
  },
  {
    value: 5,
    label: "upgrade" // i.e. limit the minimum value
  }
]
