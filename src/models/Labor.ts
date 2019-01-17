import { Construction } from "./Construction"
import { Unit } from "./Unit"
import { Ship } from "./Ship"
import { findPath } from "../lib/findPath"

export enum LaborType {
  OperateDoor,
  ShootMissiles,
  Navigation
}

export abstract class Labor {
  public pickedBy: Unit | undefined
  public canBeRemoved: boolean = false
  public canBeCancelled: boolean = false

  public abstract forConstruction(construction: Construction): boolean
  public abstract tick(): void
  public abstract availableTo(unit: Unit): boolean
  public abstract perform(ship: Ship): void

  abstract get takenName(): string

  public assign(unit: Unit): void {
    this.pickedBy = unit
  }

  public deny(): void {
    this.pickedBy = undefined
  }
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

  get takenName(): string {
    return "Answering call from Earth"
  }

  public availableTo(unit: Unit): boolean {
    return unit.id === this.called.id
  }

  public perform(ship: Ship): void {
    if (!this.pickedBy) {
      return
    }

    const pos = findPath(this.pickedBy.pos, this.construction.pos, ship)
    if (pos) {
      this.pickedBy.pos = pos
    }
  }
}
