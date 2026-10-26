import type { SpellDurationScale } from './spell-duration-scale.vo.js';
import type { SpellDurationType } from './spell-duration-type.vo.js';

/** Duration of a spell (spec 028): `value` `scale` per `perLevel` levels or per `perFailure` points of RR failure. */
export class SpellDuration {
  constructor(
    public readonly type: SpellDurationType,
    public readonly value: number | null,
    public readonly scale: SpellDurationScale | null,
    public readonly perLevel: number | null,
    public readonly perFailure: number | null,
    /** Needs concentration: `C`, `(C)` or `or C`. */
    public readonly concentration: boolean,
    public readonly raw: string | null,
  ) {}
}
