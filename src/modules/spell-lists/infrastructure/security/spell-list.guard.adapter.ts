import { Injectable } from '@nestjs/common';
import type { SpellListGuardPort } from '../../application/ports/spell-list-guard.port.js';
import { SpellList } from '../../domain/aggregates/spell-list.js';
import { BaseEntityGuard } from '../../../shared/infrastructure/security/base-entity-guard.js';

@Injectable()
export class SpellListGuardAdapter extends BaseEntityGuard<SpellList> implements SpellListGuardPort {}
