import { Unit } from "../models/Unit"
import { ShipCommand } from "./ShipCommand"
import { Ship } from "../models/Ship"

export class AI extends ShipCommand {
  constructor(protected unit: Unit) {
    super()
  }

  public call(ship: Ship): void {
    if (this.unit.pickedLabor) {
      if (this.unit.pickedLabor.canBeRemoved) {
        // TODO: Ship remove labor
        this.unit.denyLabor()
      } else {
        return this.unit.pickedLabor.perform(ship)
      }
    }

    // TODO: Sort with priority
    const labor = ship.labors.find(l => l.availableTo(this.unit))
    if (labor) {
      this.unit.pickLabor(labor)
      return labor.perform(ship)
    }
  }
}
