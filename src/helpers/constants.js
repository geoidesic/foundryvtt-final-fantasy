
export const SYSTEM_ID = 'foundryvtt-final-fantasy';
export const SYSTEM_CODE = 'FF15';
export const LOG_PREFIX = `${SYSTEM_CODE} |`;
export const ASSET_PATH = `systems/${SYSTEM_ID}/assets`;



export const getRangeOptions = () => [
  { value: "1sq", label: game.i18n.localize("FF15.Types.Item.Types.Options.Range.1sq") },
  { value: "5sq", label: game.i18n.localize("FF15.Types.Item.Types.Options.Range.5sq") },
  { value: "10sq", label: game.i18n.localize("FF15.Types.Item.Types.Options.Range.10sq") },
  { value: "3x3a", label: game.i18n.localize("FF15.Types.Item.Types.Options.Range.3x3a") },
  { value: "3x3aa", label: game.i18n.localize("FF15.Types.Item.Types.Options.Range.3x3aa") },
  { value: "5x5a", label: game.i18n.localize("FF15.Types.Item.Types.Options.Range.5x5a") },
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
