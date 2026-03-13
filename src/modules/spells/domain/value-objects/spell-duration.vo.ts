import { SpellDurationScale } from './spell-duration-scale.vo';
import { SpellDurationType } from './spell-duration-type.vo';

export class SpellDuration {
  constructor(
    public type: SpellDurationType,
    public duration: number | null,
    public durationScale: SpellDurationScale | null,
    public requiredConcentration: boolean | null,
  ) {}
}
