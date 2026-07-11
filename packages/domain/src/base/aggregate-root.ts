import type { EntityId } from '../value-objects/entity-id.js';

/** Aggregate root marker for domain entities */
export abstract class AggregateRoot<TId extends EntityId = EntityId> {
  protected constructor(protected readonly id: TId) {}

  getId(): TId {
    return this.id;
  }
}
