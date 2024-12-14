import { FFItemDataModel } from './baseItem';

const {
  HTMLField, SchemaField, StringField, BooleanField
} = foundry.data.fields;

export class TelegraphModel extends FFItemDataModel {
  static defineSchema() {
    return {
      ...super.defineSchema(),  // Merge with the base model schema
      source: new StringField({ required: true, initial: '' }),
      controller: new StringField({ required: false, initial: '' }),
      classification: new StringField({ required: true, initial: 'fixed', choices: ['fixed', 'movable'] }),
      origin: new StringField({ required: true, initial: '' }),
      hasRanged: new BooleanField({ required: false, initial: false }),
      range: new StringField({ required: false, initial: '' }),
      hasTrigger: new BooleanField({ required: false, initial: false }),
      trigger: new StringField({ required: false, initial: '' }),
      hasTarget: new BooleanField({ required: false, initial: false }),
      target: new StringField({ required: false, initial: '' }),
      effect: new HTMLField({ required: false, initial: '' }),
      size: new StringField({ required: false, initial: '' }),
      hasCR: new BooleanField({ required: false, initial: false }),
      CR: new StringField({ required: false, initial: '' })
    };
  }

  get isFixedTelegraph() {
    return this.classification === 'fixed';
  }

  get isMovableTelegraph() {
    return this.classification === 'movable';
  }

  get hasController() {
    return !!this.controller;
  }
} 