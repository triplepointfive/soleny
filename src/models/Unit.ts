import { LaborType, Labor } from "./Labor"
import { filter } from "lodash"
import { Point } from "../lib/Point"

export type UnitID = number

export class Unit {
  private doesLabors: LaborType[] = []
  public pickedLabor: Labor | undefined
  public readonly name: string

  constructor(public id: UnitID, public pos: Point) {
    this.name = Math.random()
      .toString(36)
      .substr(2, 9)
  }

  public pickLabor(labor: Labor): void {
    this.pickedLabor = labor
    labor.assign(this)
  }

  public denyLabor(): void {
    if (this.pickedLabor) {
      this.pickedLabor.deny()
    }

    this.pickedLabor = undefined
  }

  public does(labor: LaborType): boolean {
    return this.doesLabors.find(l => l === labor) !== undefined
  }

  public toggleLabor(labor: LaborType): void {
    if (this.does(labor)) {
      this.doesLabors = filter(this.doesLabors, l => l !== labor)
    } else {
      this.doesLabors.push(labor)
    }
  }
}
