import { LaborType } from "./Labor"
import { filter } from "lodash"
import { Point } from "../lib/Point"

export type UnitID = number

export class Unit {
  private doesLabors: LaborType[] = []

  constructor(public id: UnitID, public pos: Point) {}

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
