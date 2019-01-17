import { Ship } from "../models/Ship"
import { Labor } from "../models/Labor"

export abstract class ShipCommand {
  public abstract call(game: Ship): void
}

export class AddLabor extends ShipCommand {
  constructor(public labor: Labor) {
    super()
  }

  public call(ship: Ship): void {
    ship.labors.push(this.labor)
  }
}
