import { Injectable } from '@nestjs/common';
import { SpellListGuardPort } from '../../application/ports/spell-list-guard.port';
import { SpellList } from '../../domain/aggregates/spell-list';
import { BaseEntityGuard } from 'src/modules/shared/infrastructure/security/base-entity-guard';

@Injectable()
export class SpellListGuardAdapter extends BaseEntityGuard<SpellList> implements SpellListGuardPort {}
