export default class ProcTrigger {
  constructor(actor) {
    game.system.log.d("[PROC] Creating ProcTrigger processor for actor:", actor.name);
    this.actor = actor;
  }

  async process(event) {
    game.system.log.d("[PROC] ProcTrigger processor called with event:", {
      itemName: event.item.name,
      hasRoll: !!event.roll,
      d20Result: event.roll ? event.roll.terms[0].results[0].result : null,
      procsList: event.item.system.procs?.list
    });

    const { item, roll } = event;
    if (!item.system.procs?.list?.length) {
      game.system.log.d("[PROC] No procs list found on item");
      return;
    }

    // Get d20 result - either from existing roll or make new roll
    let d20Result;
    if (item.system.hasCR && roll) {
      const d20Term = roll.terms[0];
      d20Result = d20Term.modifiers.includes('kh1') 
        ? Math.max(...d20Term.results.map(r => r.result))
        : d20Term.results[0].result;
    } else {
      const procRoll = await new Roll('1d20').evaluate();
      d20Result = procRoll.terms[0].results[0].result;
    }

    game.system.log.d("[PROC] D20 result check:", {
      d20Result,
      procTrigger: item.system.procTrigger,
      meetsThreshold: d20Result >= item.system.procTrigger
    });

    if (!item.system.procTrigger || d20Result < item.system.procTrigger) {
      game.system.log.d("[PROC] Proc trigger check failed");
      return;
    }

    // Process each proc effect
    for (const procRef of item.system.procs.list) {
      game.system.log.d("[PROC] Processing proc ref:", procRef);
      
      const procItem = await fromUuid(procRef.uuid);
      if (!procItem) {
        game.system.log.w("[PROC] Could not find proc item from uuid:", procRef.uuid);
        continue;
      }

      // Find actor's version of the proc item
      const actorItem = this.actor.items.find(i => 
        i.name === procItem.name && 
        i.type === procItem.type
      );

      game.system.log.d("[PROC] Found actor item:", {
        found: !!actorItem,
        name: actorItem?.name,
        hasEffects: actorItem?.hasEffects
      });

      if (!actorItem?.hasEffects) {
        game.system.log.d("[PROC] Actor item has no effects, skipping");
        continue;
      }

      // Enable the effects
      const enabled = await this.actor.enableLinkedEffects(actorItem);
      game.system.log.d("[PROC] Enabled effects:", enabled);
    }
  }
}