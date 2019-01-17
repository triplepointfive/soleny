import { Ship } from "../models/Ship"
import { Labor } from "../models/Labor"
import { remove } from "lodash"

export abstract class ShipCommand {
  public abstract call(game: Ship): void
}

export class AddLaborCommand extends ShipCommand {
  constructor(private labor: Labor) {
    super()
  }

  public call(ship: Ship): void {
    ship.labors.push(this.labor)
  }
}

export class RemoveLaborCommand extends ShipCommand {
  constructor(private labor: Labor) {
    super()
  }

  public call(ship: Ship): void {
    remove(ship.labors, l => l === this.labor)
    ship.creatures.forEach(u => {
      if (u.pickedLabor === this.labor) {
        u.denyLabor()
      }
    })
  }
}
