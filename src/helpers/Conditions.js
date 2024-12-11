import { SYSTEM_ID, activeEffectModes } from "./constants";

export function getDefaultStatusEffects() {
  console.log('game', game)
  return [
    {
      id: "dead",
      name: game.i18n.localize("statusEffects.dead.name"),
      icon: "icons/svg/skull.svg",
      description: game.i18n.localize("statusEffects.dead.description"),
      flags: { surge: { periodic: false, special: false } },
      changes: []
    },
    {
      id: "comatose",
      name: game.i18n.localize("statusEffects.comatose.name"),
      icon: `systems/${SYSTEM_ID}/assets/icons/status/coma.svg`,
      description: game.i18n.localize("statusEffects.comatose.description"),
      flags: { surge: { periodic: false, special: false } },
      changes: []
    },
    {
      id: "ko",
      name: game.i18n.localize("statusEffects.ko.name"),
      icon: "icons/svg/unconscious.svg",
      description: game.i18n.localize("statusEffects.ko.description"),
      flags: { surge: { periodic: false, special: false } },
      changes: []
    },
    {
      id: "surprised",
      name: game.i18n.localize("statusEffects.surprised.name"),
      icon: "icons/svg/stoned.svg",
      description: game.i18n.localize("statusEffects.surprised.description"),
      flags: { surge: { periodic: false, special: false } },
      changes: []
    },
    {
      id: "brink",
      name: game.i18n.localize("statusEffects.brink.name"),
      icon: `systems/${SYSTEM_ID}/assets/icons/status/supine.svg`,
      description: game.i18n.localize("statusEffects.brink.description"),
      flags: { surge: { periodic: false, special: false } },
      changes: []
    },
    {
      id: "bind",
      name: game.i18n.localize("statusEffects.bind.name"),
      icon: "icons/svg/net.svg",
      description: game.i18n.localize("statusEffects.bind.description"),
      flags: { surge: { periodic: false, special: false } },
      changes: []
    },
    {
      id: "enmity",
      name: game.i18n.localize("statusEffects.enmity.name"),
      icon: `systems/${SYSTEM_ID}/assets/icons/status/enrage.svg`,
      description: game.i18n.localize("statusEffects.enmity.description"),
      flags: { surge: { periodic: false, special: false } },
      changes: []
    },
    {
      id: "weakness",
      name: game.i18n.localize("statusEffects.weakness.name"),
      icon: `systems/${SYSTEM_ID}/assets/icons/status/crutch.svg`,
      description: game.i18n.localize("statusEffects.weakness.description"),
      flags: { surge: { periodic: false, special: false } },
      changes: []
    },
    {
      id: "stun",
      name: game.i18n.localize("statusEffects.stun.name"),
      icon: "icons/svg/daze.svg",
      description: game.i18n.localize("statusEffects.stun.description"),
      flags: { surge: { periodic: false, special: false } },
      changes: []
    },
    {
      id: "prone",
      name: game.i18n.localize("statusEffects.prone.name"),
      icon: "systems/surge/assets/icons/prone.svg",
      description: game.i18n.localize("statusEffects.prone.description"),
      flags: { surge: { periodic: false, special: false } },
      changes: []
    },
    {
      id: "blind",
      name: game.i18n.localize("statusEffects.blind.name"),
      description: game.i18n.localize("statusEffects.blind.description"),
      icon: `systems/${SYSTEM_ID}/assets/icons/status/blindfold.svg`,
      flags: { surge: { periodic: false, special: false } },
      changes: []
    },
    {
      id: "slow",
      name: game.i18n.localize("statusEffects.slow.name"),
      description: game.i18n.localize("statusEffects.slow.description"),
      icon: `systems/${SYSTEM_ID}/assets/icons/status/slowed.svg`,
      flags: { surge: { periodic: false, special: false } },
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
    }
  ];
}

