import { SYSTEM_ID } from "~/src/helpers/constants"
import { log } from "~/src/helpers/utility"

window.log = log;
log.level = log.DEBUG;



Hooks.once("init", async () => {
  log.d(`Starting System ${SYSTEM_ID}`);

});

Hooks.once("ready", async () => {
});
