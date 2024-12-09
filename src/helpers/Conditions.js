import { SYSTEM_ID } from "./constants";

export const defaultStatusEffects = [
  {
    id: "dead",
    name: "Dead",
    icon: "icons/svg/skull.svg",
    description: "Dead. Deceased. Ex. Unliving. Kicked the bucket. Bought the farm.",
    flags: { surge: { periodic: false, special: false } },
    changes: []
  },
  {
    id: "comatose",
    name: "Comatose",
    icon: `systems/${SYSTEM_ID}/assets/icons/status/coma.svg`,
    description: "A comootose character cannot move, nor act, nor speak and is unaware of their surroundings.",
    flags: { surge: { periodic: false, special: false } },
    changes: []
  },
  {
    id: "ko",
    name: "Knocked Out",
    icon: "icons/svg/unconscious.svg",
    description: "Knocked out.",
    flags: { surge: { periodic: false, special: false } },
    changes: []
  },
  {
    id: "surprised",
    name: "Surprised",
    icon: `systems/${SYSTEM_ID}/assets/icons/status/enrage.svg`,
    description: "Surprised.",
    flags: { surge: { periodic: false, special: false } },
    changes: []
  },
  {
    id: "brink",
    name: "Brink of Death",
    icon: `systems/${SYSTEM_ID}/assets/icons/status/supine.svg`,
    description: "Brink of death.",
    flags: { surge: { periodic: false, special: false } },
    changes: []
  },
  {
    id: "weakness",
    name: "Weak",
    icon: `systems/${SYSTEM_ID}/assets/icons/status/crutch.svg`,
    description: "Weakness.",
    flags: { surge: { periodic: false, special: false } },
    changes: []
  },
  {
    id: "stun",
    name: "Stunned",
    icon: "icons/svg/daze.svg",
    description: "A stunned character can't move, can speak haltingly and is at disadvantage. MUS, HEA, SIG levels are halved; COG, COO, MEM, GAB are at -5 mod; ADV: -3.",
    flags: { surge: { periodic: false, special: false } },
    changes: []
  },
  {
    id: "prone",
    name: "Prone",
    icon: "systems/surge/assets/icons/prone.svg",
    description: "A prone character has fallen face-down. To change this condition to a crouch costs 1AP. While prone: SPD: /4; ADV: -2.",
    flags: { surge: { periodic: false, special: false } },
    changes: []
  },
  {
    id: "blind",
    name: "Blind",
    description: "A blind creature cannot see and automatically fails any checks related to SIG",
    icon: `systems/${SYSTEM_ID}/assets/icons/status/blindfold.svg`,
    flags: { surge: { periodic: false, special: false } },
    changes: []
  },
  {
    id: "slow",
    name: "Slow",
    description: "The character's SPD is halved, and thus AP are also halved.",
    icon: "systems/surge/assets/icons/slowed.svg",
    flags: { surge: { periodic: false, special: false } },
    changes: []
  },
];

