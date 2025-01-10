import { NPCModel } from "../models/actors/NPC";
import { PCModel } from "../models/actors/PC";
import { ActionModel } from "../models/items/Action";
import { EquipmentModel } from "../models/items/Equipment";
import { JobModel } from "../models/items/Job";
import { TraitModel } from "../models/items/Trait";

/**
 * Configure all of our system documents
 * @return {void}
 */
export function setupModels() {
    // Setup models
    CONFIG.Item.dataModels["job"] = JobModel;
    CONFIG.Item.dataModels["action"] = ActionModel;
    CONFIG.Item.dataModels["trait"] = TraitModel;
    CONFIG.Item.dataModels["equipment"] = EquipmentModel;

    CONFIG.Actor.dataModels["PC"] = PCModel;
    CONFIG.Actor.dataModels["NPC"] = NPCModel;
}