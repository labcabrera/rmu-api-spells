import { Injectable } from '@nestjs/common';
import type { SpellGuardPort } from '../../application/ports/spell-guard.port.js';
import { Spell } from '../../domain/aggregates/spell.js';
import { BaseEntityGuard } from '../../../shared/infrastructure/security/base-entity-guard.js';

@Injectable()
export class SpellGuardAdapter extends BaseEntityGuard<Spell> implements SpellGuardPort {}
