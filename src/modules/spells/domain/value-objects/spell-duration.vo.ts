import type { SpellDurationScale } from './spell-duration-scale.vo.js';
import type { SpellDurationType } from './spell-duration-type.vo.js';

export class SpellDuration {
  constructor(
    public type: SpellDurationType | null,
    public duration: number | null,
    public durationScale: SpellDurationScale | null,
    public requiredConcentration: boolean | null,
    public failureScale: number | null,
  ) {}
}
