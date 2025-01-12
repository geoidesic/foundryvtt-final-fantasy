import { SYSTEM_ID, activeEffectModes } from "./constants";
import { localize } from "~/src/helpers/util";

/**
 * Returns an array of default status effects for the system
 * @return {Array<object>} Array of status effect configurations
 */
export function getDefaultStatusEffects() {
  return [
    {
      id: "dead",
      name: localize("statusEffects.dead.name"),
      icon: "icons/svg/skull.svg",
      description: localize("statusEffects.dead.description"),
      flags: { [SYSTEM_ID]: { periodic: false, special: false } },
      changes: []
    },
    {
      id: "comatose",
      name: localize("statusEffects.comatose.name"),
      icon: `systems/${SYSTEM_ID}/assets/icons/status/coma.svg`,
      description: localize("statusEffects.comatose.description"),
      flags: { [SYSTEM_ID]: { periodic: false, special: false } },
      changes: []
    },
    {
      id: "ko",
      name: localize("statusEffects.ko.name"),
      icon: "icons/svg/unconscious.svg",
      description: localize("statusEffects.ko.description"),
      flags: { [SYSTEM_ID]: { periodic: false, special: false } },
      changes: []
    },
    {
      id: "surprised",
      name: localize("statusEffects.surprised.name"),
      icon: "icons/svg/stoned.svg",
      description: localize("statusEffects.surprised.description"),
      flags: { [SYSTEM_ID]: { periodic: false, special: false } },
      changes: []
    },
    {
      id: "brink",
      name: localize("statusEffects.brink.name"),
      icon: `systems/${SYSTEM_ID}/assets/icons/status/supine.svg`,
      description: localize("statusEffects.brink.description"),
      flags: { [SYSTEM_ID]: { periodic: false, special: false } },
      changes: []
    },
    {
      id: "bind",
      name: localize("statusEffects.bind.name"),
      icon: "icons/svg/net.svg",
      description: localize("statusEffects.bind.description"),
      flags: { [SYSTEM_ID]: { periodic: false, special: false } },
      changes: []
    },
    {
      id: "enmity",
      name: localize("statusEffects.enmity.name"),
      icon: `systems/${SYSTEM_ID}/assets/icons/status/enrage.svg`,
      description: localize("statusEffects.enmity.description"),
      flags: { [SYSTEM_ID]: { periodic: false, special: false } },
      changes: []
    },
    {
      id: "weakness",
      name: localize("statusEffects.weakness.name"),
      icon: `systems/${SYSTEM_ID}/assets/icons/status/crutch.svg`,
      description: localize("statusEffects.weakness.description"),
      flags: { [SYSTEM_ID]: { periodic: false, special: false } },
      changes: []
    },
    {
      id: "stun",
      name: localize("statusEffects.stun.name"),
      icon: "icons/svg/daze.svg",
      description: localize("statusEffects.stun.description"),
      flags: { [SYSTEM_ID]: { periodic: false, special: false } },
      changes: []
    },
    {
      id: "prone",
      name: localize("statusEffects.prone.name"),
      icon: `systems/${SYSTEM_ID}/assets/icons/status/prone.svg`,
      description: localize("statusEffects.prone.description"),
      flags: { [SYSTEM_ID]: { periodic: false, special: false } },
      changes: []
    },
    {
      id: "blind",
      name: localize("statusEffects.blind.name"),
      description: localize("statusEffects.blind.description"),
      icon: `systems/${SYSTEM_ID}/assets/icons/status/blindfold.svg`,
      flags: { [SYSTEM_ID]: { periodic: false, special: false } },
      changes: []
    },
    {
      id: "slow",
      name: localize("statusEffects.slow.name"),
      description: localize("statusEffects.slow.description"),
      icon: `systems/${SYSTEM_ID}/assets/icons/status/slowed.svg`,
      flags: { [SYSTEM_ID]: { periodic: false, special: false } },
      changes: [
        {
          key: "system.attributes.secondary.spd.val",
          value: 0.5,
          mode: activeEffectModes.find(mode => mode.label === "multiply").value,
          priority: 1
        },
        {
          key: "system.globalCheckMod",
          value: -2,
          mode: activeEffectModes.find(mode => mode.label === "add").value,
          priority: 1
        },
      ]
    },
    {
      id: "transcendent",
      name: localize("statusEffects.transcendent.name"),
      icon: "icons/svg/ice-aura.svg",
      description: localize("statusEffects.transcendent.description"),
      flags: { [SYSTEM_ID]: { periodic: false, special: true } },
      changes: []
    },
    {
      id: "focus",
      name: localize("statusEffects.focus.name"),
      icon: "icons/svg/eye.svg",
      description: localize("statusEffects.focus.description"),
      flags: { [SYSTEM_ID]: { periodic: false, special: true } },
      changes: []
    }
  ];
}

