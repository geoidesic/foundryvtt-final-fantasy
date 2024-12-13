import { FFItemDataModel } from './baseItem';

const {
  HTMLField, SchemaField, StringField, BooleanField
} = foundry.data.fields;

export class TelegraphModel extends FFItemDataModel {
  static defineSchema() {
    return {
      ...super.defineSchema(),  // Merge with the base model schema
      source: new StringField({
        required: true,
        initial: ''
      }),
      controller: new StringField({
        required: false,
        initial: ''
      }),
      classification: new StringField({
        required: true,
        initial: 'fixed',
        choices: ['fixed', 'movable']
      }),
      origin: new StringField({
        required: true,
        initial: ''
      }),
      range: new StringField({
        required: true,
        initial: ''
      }),
      target: new StringField({
        required: true,
        initial: ''
      }),
      activationTrigger: new StringField({
        required: true,
        initial: ''
      }),
      effect: new HTMLField({
        required: true,
        initial: ''
      })
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