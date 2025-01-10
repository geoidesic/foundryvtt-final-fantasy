import { FFActorDataModel } from './baseActor';

const {
  HTMLField, SchemaField, NumberField, StringField, ArrayField, BooleanField
} = foundry.data.fields;

/**
 * Data model for Player Character actors
 * @extends {FFActorDataModel}
 */
export class PCModel extends FFActorDataModel {
  /**
   * Defines the schema for PC data
   * @return {object} The schema definition object
   */
  static defineSchema() {
    return {
      ...super.defineSchema(),
      biography: new HTMLField(),
      job: new SchemaField({
        uuid: new StringField({ required: true, initial: '' }),
        grants: new ArrayField(
          new StringField({ required: true, initial: '' })
        ),
        level: new NumberField({ required: true, integer: true, min: 30, initial: null }),
        role: new StringField({ required: true, initial: '' }),
        name: new StringField({ required: true, initial: '' }),
        img: new StringField({ required: true, initial: '' })
      }),
      actionState: new SchemaField({
        available: new ArrayField(new StringField(), {
          initial: ['primary', 'secondary']
        }),
        used: new ArrayField(new SchemaField({
          type: new StringField({ required: true }),
          messageId: new StringField({ required: true })
        }), {
          initial: []
        }),
        usedReaction: new BooleanField({ required: true, initial: false })
      })
    }
  }
}