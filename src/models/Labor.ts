import { Construction } from "./Construction"
import { Unit } from "./Unit"

export enum LaborType {
  OperateDoor,
  ShootMissiles,
  Navigation
}

export abstract class Labor {
  public abstract forConstruction(construction: Construction): boolean
  public abstract tick(): void

  public canBeRemoved: boolean = false
  public canBeCancelled: boolean = false
}

abstract class ConstructionLabor extends Labor {
  constructor(public construction: Construction) {
    super()
  }

  public forConstruction({ id }: Construction): boolean {
    return this.construction.id === id
  }
}

export class AnswerPhoneCallLabor extends ConstructionLabor {
  public ringsLeft: number = 20

  constructor(public called: Unit, construction: Construction) {
    super(construction)
  }

  public tick(): void {
    this.ringsLeft--
    this.canBeRemoved = this.ringsLeft <= 0
  }
}
