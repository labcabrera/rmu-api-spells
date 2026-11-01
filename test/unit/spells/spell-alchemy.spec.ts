import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import {
  ALCHEMY_FAILURE_TABLES,
  SpellAlchemy,
  SpellAlchemyEffect,
} from '../../../src/modules/spells/domain/value-objects/spell-alchemy.vo.js';
import { SpellModifiers } from '../../../src/modules/spells/domain/value-objects/spell-modifiers.vo.js';
import { Spell } from '../../../src/modules/spells/domain/aggregates/spell.js';
import { ValidationError } from '../../../src/modules/shared/domain/errors/errors.js';
import { SpellAlchemyDto } from '../../../src/modules/spells/interfaces/http/dto/spell-alchemy.dto.js';

const newSpell = (alchemy: SpellAlchemy | null = null) =>
  Spell.create({
    spellListId: 'list',
    name: 'Synthetic spell',
    level: 3,
    modifiers: SpellModifiers.empty(),
    basedOn: null,
    effects: [],
    alchemy,
    accessType: 'public',
    entitySource: 'user',
    description: undefined,
    imageUrl: undefined,
    owner: 'owner',
  });

const errorsOf = (plain: unknown) => validateSync(plainToInstance(SpellAlchemyDto, plain) as object);

describe('SpellAlchemy', () => {
  it('lists the 10 failure tables of core', () => {
    expect(ALCHEMY_FAILURE_TABLES).toHaveLength(10);
  });

  it('reads a plain object, with defaults for the missing flags', () => {
    expect(
      SpellAlchemy.fromPlain({ failureTable: 'potion', perItem: true, alters: true, effect: { kind: 'pp-multiplier', value: 1.25 } }),
    ).toEqual(new SpellAlchemy('potion', true, true, new SpellAlchemyEffect('pp-multiplier', 1.25)));
    expect(SpellAlchemy.fromPlain({ failureTable: 'general' })).toEqual(new SpellAlchemy('general', false, false, null));
  });

  it('reads nothing as null', () => {
    expect(SpellAlchemy.fromPlain(null)).toBeNull();
    expect(SpellAlchemy.fromPlain(undefined)).toBeNull();
    expect(SpellAlchemy.fromPlain({})).toBeNull();
  });
});

describe('Spell alchemy', () => {
  it('defaults to null and is kept in the props', () => {
    expect(newSpell().alchemy).toBeNull();
    const alchemy = new SpellAlchemy('bonus', false, false, new SpellAlchemyEffect('attack', 10));
    expect(newSpell(alchemy).getProps().alchemy).toEqual(alchemy);
  });

  it('is replaced by a patch, cleared by null and kept by undefined', () => {
    const spell = newSpell(new SpellAlchemy('bonus', false, false, null));
    spell.update({ name: 'Renamed' });
    expect(spell.alchemy).toEqual(new SpellAlchemy('bonus', false, false, null));
    spell.update({ alchemy: new SpellAlchemy('organism', true, false, null) });
    expect(spell.alchemy?.failureTable).toBe('organism');
    spell.update({ alchemy: null });
    expect(spell.alchemy).toBeNull();
  });

  it('rejects an unknown failure table or effect kind', () => {
    expect(() => newSpell(new SpellAlchemy('unknown' as never, false, false, null))).toThrow(ValidationError);
    expect(() => newSpell(new SpellAlchemy('bonus', false, false, new SpellAlchemyEffect('speed' as never, 1)))).toThrow(ValidationError);
    expect(() => newSpell(new SpellAlchemy('bonus', false, false, new SpellAlchemyEffect('attack', Number.NaN)))).toThrow(ValidationError);
  });
});

describe('SpellAlchemyDto', () => {
  it('accepts every failure table and effect kind', () => {
    for (const failureTable of ALCHEMY_FAILURE_TABLES) {
      expect(errorsOf({ failureTable, perItem: false, alters: false, effect: null })).toEqual([]);
    }
    for (const kind of ['attack', 'defense', 'skill', 'spell-adder', 'pp-multiplier']) {
      expect(errorsOf({ failureTable: 'bonus', perItem: true, alters: true, effect: { kind, value: 1.5 } })).toEqual([]);
    }
  });

  it.each([
    ['an unknown failure table', { failureTable: 'other', perItem: false, alters: false }],
    ['a missing perItem', { failureTable: 'bonus', alters: false }],
    ['a flag that is not a boolean', { failureTable: 'bonus', perItem: 'yes', alters: false }],
    ['an unknown effect kind', { failureTable: 'bonus', perItem: false, alters: false, effect: { kind: 'speed', value: 1 } }],
    ['an effect without value', { failureTable: 'bonus', perItem: false, alters: false, effect: { kind: 'attack' } }],
    [
      'an effect value that is not a number',
      { failureTable: 'bonus', perItem: false, alters: false, effect: { kind: 'attack', value: '5' } },
    ],
  ])('rejects %s', (_name, plain) => {
    expect(errorsOf(plain).length).toBeGreaterThan(0);
  });

  it('maps to the entity and back', () => {
    const dto = plainToInstance(SpellAlchemyDto, {
      failureTable: 'power-enhancer',
      perItem: false,
      alters: true,
      effect: { kind: 'spell-adder', value: 2 },
    });
    const entity = SpellAlchemyDto.toEntity(dto);
    expect(entity).toEqual(new SpellAlchemy('power-enhancer', false, true, new SpellAlchemyEffect('spell-adder', 2)));
    expect(SpellAlchemyDto.fromEntity(entity)).toEqual({
      failureTable: 'power-enhancer',
      perItem: false,
      alters: true,
      effect: { kind: 'spell-adder', value: 2 },
    });
    expect(SpellAlchemyDto.toEntity(null)).toBeNull();
    expect(SpellAlchemyDto.fromEntity(null)).toBeNull();
  });
});
