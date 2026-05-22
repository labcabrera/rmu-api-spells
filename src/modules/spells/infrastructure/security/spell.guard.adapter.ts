import { Injectable } from '@nestjs/common';
import { ForbiddenError } from 'src/modules/shared/domain/errors/errors';
import { SpellGuardPort } from '../../application/ports/spell-guard.port';
import { Spell } from '../../domain/aggregates/spell';
import { BaseEntityGuard } from 'src/modules/shared/infrastructure/security/base-entity-guard';

@Injectable()
export class SpellGuardAdapter extends BaseEntityGuard<Spell> implements SpellGuardPort {}
