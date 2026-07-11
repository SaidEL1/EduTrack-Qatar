import { err, ok, type Result } from '@edutrack/shared';

import { ValueObject } from '../base/value-object.js';
import { DomainError } from '../errors/domain-error.js';

export interface EntityIdProps {
  readonly value: string;
}

const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class EntityId extends ValueObject<EntityIdProps> {
  private constructor(props: EntityIdProps) {
    super(props);
  }

  static create(value: string): Result<EntityId, DomainError> {
    const trimmed = value.trim();
    if (!UUID_V4_PATTERN.test(trimmed)) {
      return err(new DomainError('EntityId must be a valid UUID v4', { value }));
    }
    return ok(new EntityId({ value: trimmed }));
  }

  override toString(): string {
    return this.props.value;
  }

  get value(): string {
    return this.props.value;
  }
}
