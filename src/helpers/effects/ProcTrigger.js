export default class ProcTrigger {
  constructor(actor) {
    this.actor = actor;
  }

  async process(event) {
    const { item, roll } = event;
    if (!item.system.procs?.list?.length) return;

    // Get d20 result - either from existing roll or make new roll
    let d20Result;
    if (item.system.hasCR && roll) {
      d20Result = roll.terms[0].results[0].result;
    } else {
      const procRoll = await new Roll('1d20').evaluate({ async: true });
      d20Result = procRoll.terms[0].results[0].result;
    }

    if (!item.system.procTrigger || d20Result < item.system.procTrigger) return;

    // Process each proc effect
    for (const procRef of item.system.procs.list) {
      const procItem = await fromUuid(procRef.uuid);
      if (!procItem) continue;

      // Find actor's version of the proc item
      const actorItem = this.actor.items.find(i => 
        i.name === procItem.name && 
        i.type === procItem.type
      );

      if (!actorItem?.hasEffects) continue;

      // Enable the effects
      await this.actor.enableLinkedEffects(actorItem);
    }
  }
}