import { SYSTEM_ID, activeEffectModes } from "./constants";

export const defaultStatusEffects = [
  {
    id: "dead",
    name: "Dead",
    icon: "icons/svg/skull.svg",
    description: "A Dead character has died and can no longer participate in the game. Unless otherwise specified, Death cannot be reversed or removed.",
    flags: { surge: { periodic: false, special: false } },
    changes: []
  },
  {
    id: "comatose",
    name: "Comatose",
    icon: `systems/${SYSTEM_ID}/assets/icons/status/coma.svg`,
    description: "A Comatose character is treated as Knocked Out, can only recover after one in-game day with appropriate medical treatment, has all enhancements and enfeeblements removed, and can only be further afflicted with Death.",
    flags: { surge: { periodic: false, special: false } },
    changes: []
  },
  {
    id: "ko",
    name: "Knocked Out",
    icon: "icons/svg/unconscious.svg",
    description: "A Knocked Out character is unconscious, unable to act or perceive, treated as Prone and Stunned, cannot recover HP or MP, and remains in this state until explicitly removed. All enhancements and enfeeblements are cleared, and they can only be afflicted with the Comatose enfeeblement.",
    flags: { surge: { periodic: false, special: false } },
    changes: []
  },
  {
    id: "surprised",
    name: "Surprised",
    icon: "icons/svg/stoned.svg",
    description: "Characters caught by surprise cannot act on their turn or use instant abilities during the first round of the encounter.",
    flags: { surge: { periodic: false, special: false } },
    changes: []
  },
  {
    id: "brink",
    name: "Brink of Death",
    icon: `systems/${SYSTEM_ID}/assets/icons/status/supine.svg`,
    description: "A character on the Brink of Death suffers a -5 penalty on all checks, transitions to Comatose if afflicted again, and remains in this state until removed by a rest action or specific effects.",
    flags: { surge: { periodic: false, special: false } },
    changes: []
  },
  {
    id: "bind",
    name: "Bound",
    icon: "icons/svg/net.svg",
    description: "While Bound, small and medium characters’ Speed falls to 0, while larger characters’ Speed is reduced by 2. Characters receive one advantage die when making ability checks targeting a Bound character.",
    flags: { surge: { periodic: false, special: false } },
    changes: []
  },
  {
    id: "enmity",
    name: "Enmity",
    icon: `systems/${SYSTEM_ID}/assets/icons/status/enrage.svg`,
    description: "Enemies with your Enmity suffer a -5 penalty on non-targeting checks, and the effect ends after their next turn or if you are Knocked Out.",
    flags: { surge: { periodic: false, special: false } },
    changes: []
  },
  {
    id: "weakness",
    name: "Weak",
    icon: `systems/${SYSTEM_ID}/assets/icons/status/crutch.svg`,
    description: "A Weakened character incurs a -2 penalty on all checks. The Weakened enfeeblement does not wear off at the end of a phase, and can only be removed by completing a rest action, or by effects which specifically remove it.",
    flags: { surge: { periodic: false, special: false } },
    changes: []
  },
  {
    id: "stun",
    name: "Stunned",
    icon: "icons/svg/daze.svg",
    description: "A Stunned character cannot act during their turn or use instant abilities, and all markers for which they are the creator are removed. Characters receive one advantage die when making ability checks targeting a Stunned character.",
    flags: { surge: { periodic: false, special: false } },
    changes: []
  },
  {
    id: "prone",
    name: "Prone",
    icon: "systems/surge/assets/icons/prone.svg",
    description: "A Prone character cannot move unless they spend half their Speed to stand, removing the condition; they suffer a -2 penalty on checks, grant one advantage die to targeting checks, and cannot stack the Prone condition.",
    flags: { surge: { periodic: false, special: false } },
    changes: []
  },
  {
    id: "blind",
    name: "Blind",
    description: "A Blinded character cannot see, automatically fails vision-based checks, incurs a -2 penalty on all checks, grants one advantage die to targeting checks, and relies on other senses for targeting abilities.",
    icon: `systems/${SYSTEM_ID}/assets/icons/status/blindfold.svg`,
    flags: { surge: { periodic: false, special: false } },
    changes: []
  },
  {
    id: "slow",
    name: "Slow",
    description: "A Slowed character's Speed is halved, unaffected by Speed-boosting effects, and they incur a -2 penalty on all checks.",
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
  },
];

