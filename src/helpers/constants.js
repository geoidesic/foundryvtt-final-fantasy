export const SYSTEM_ID = 'foundryvtt-final-fantasy';
export const SYSTEM_CODE = 'FF15';
export const LOG_PREFIX = `${SYSTEM_CODE} |`;
export const ASSET_PATH = `systems/${SYSTEM_ID}/assets`;

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
