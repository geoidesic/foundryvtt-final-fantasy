const SYSTEM_ID = "foundryvtt-final-fantasy";
window.log = log;
log.level = log.DEBUG;
Hooks.once("init", async () => {
  log.d(`Starting System ${SYSTEM_ID}`);
});
Hooks.once("ready", async () => {
});
//# sourceMappingURL=index.js.map
