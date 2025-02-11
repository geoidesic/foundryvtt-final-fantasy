console.log("[FF15] | [EFFECTS PROCESSOR] onAbilityUse call stack:", {
  stack: new Error().stack,
  event,
  itemName: event.item?.name
}); 