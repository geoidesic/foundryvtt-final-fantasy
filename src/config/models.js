import { NPCModel } from "../models/actors/NPC";
import { PCModel } from "../models/actors/PC";
import { ActionModel } from "../models/items/action";
import { EquipmentModel } from "../models/items/equipment";
import { JobModel } from "../models/items/job";
import { TelegraphModel } from "../models/items/telegraph";
import { TraitModel } from "../models/items/trait";

/**
 * Configure all of our system documents
 */
export function setupModels() {
    // Setup models
    CONFIG.Item.dataModels["job"] = JobModel;
    CONFIG.Item.dataModels["action"] = ActionModel;
    CONFIG.Item.dataModels["telegraph"] = TelegraphModel;
    CONFIG.Item.dataModels["trait"] = TraitModel;
    CONFIG.Item.dataModels["equipment"] = EquipmentModel;

    CONFIG.Actor.dataModels["PC"] = PCModel;
    CONFIG.Actor.dataModels["NPC"] = NPCModel;
}