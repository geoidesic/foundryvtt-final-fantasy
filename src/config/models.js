import { ActorModel } from "../models/actors/baseActor";
import { NPCModel } from "../models/actors/NPC";
import { PCModel } from "../models/actors/PC";
import { AbilityModel } from "../models/items/ability";
import { ActionModel } from "../models/items/action";
import { EquipmentModel } from "../models/items/equipment";
import { JobModel } from "../models/items/job";
import { TelegraphModel } from "../models/items/telegraph";
import { TraitModel } from "../models/items/trait";
import { ItemModel } from "../models/items/baseItem";

/**
 * Configure all of our system documents
 */
export function setupModels() {
    // Setup models
    CONFIG.Item.dataModels["junk"] = ItemModel; // Where we send items we don't really care to / know how to render yet
    CONFIG.Item.dataModels["job"] = JobModel;
    CONFIG.Item.dataModels["ability"] = AbilityModel;
    CONFIG.Item.dataModels["Action"] = ActionModel;
    CONFIG.Item.dataModels["Telegraph"] = TelegraphModel;
    CONFIG.Item.dataModels["Trait"] = TraitModel;
    CONFIG.Item.dataModels["Equipment"] = EquipmentModel;

    CONFIG.Actor.dataModels["junk"] = ActorModel; // Where we send actors we don't really care to deal with yet
    CONFIG.Actor.dataModels["PC"] = PCModel;
    CONFIG.Actor.dataModels["NPC"] = NPCModel;
r}