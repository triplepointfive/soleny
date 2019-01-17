import { Point } from "../lib/Point"
import { ConstructionTile } from "./Ship"
export abstract class Construction {
  constructor(public pos: Point) {}
  abstract get size(): Point
  public abstract tiles: { [key: string]: ConstructionTile }

  public isIntersectional({ x, y }: Point): boolean {
    return (
      x >= this.pos.x &&
      x < this.pos.x + this.size.x &&
      y >= this.pos.y &&
      y < this.pos.y + this.size.y
    )
  }

  public tileAt({ x, y }: Point): ConstructionTile {
    return (
      this.tiles[[x - this.pos.x, y - this.pos.y].join(" ")] ||
      new ConstructionTile(false, "E")
    )
  }
}

export class DoorSystem extends Construction {
  public tiles: { [key: string]: ConstructionTile } = {
    "0 0": new ConstructionTile(false, "╔"),
    "1 0": new ConstructionTile(false, "╕"),
    "0 1": new ConstructionTile(false, "╙"),
    "1 1": new ConstructionTile(true, "∅")
  }

  get size(): Point {
    return new Point(2, 2)
  }
}

export class MissileSystemConstruction extends Construction {
  public tiles: { [key: string]: ConstructionTile } = {
    "0 0": new ConstructionTile(false, "╔"),
    "1 0": new ConstructionTile(false, "╤"),
    "2 0": new ConstructionTile(false, "╗"),
    "0 1": new ConstructionTile(false, "╟"),
    "1 1": new ConstructionTile(true, "∅"),
    "2 1": new ConstructionTile(false, "╢"),
    "0 2": new ConstructionTile(false, "⊑"),
    "1 2": new ConstructionTile(true, " "),
    "2 2": new ConstructionTile(false, "⊒")
  }

  get size(): Point {
    return new Point(3, 3)
  }
}

export class NavigationSystem extends Construction {
  public tiles: { [key: string]: ConstructionTile } = {
    "0 0": new ConstructionTile(false, "⇖"),
    "1 0": new ConstructionTile(false, "⇗"),
    "0 1": new ConstructionTile(false, "⇅"),
    "1 1": new ConstructionTile(false, "⇅"),
    "0 2": new ConstructionTile(false, "╙"),
    "1 2": new ConstructionTile(true, "∅")
  }

  get size(): Point {
    return new Point(2, 3)
  }
}

export class PhoneStation extends Construction {
  public tiles: { [key: string]: ConstructionTile } = {
    "0 0": new ConstructionTile(false, "⋌"),
    "1 0": new ConstructionTile(false, "⋋"),
    "0 1": new ConstructionTile(false, "௹"),
    "1 1": new ConstructionTile(true, "∅")
  }

  get size(): Point {
    return new Point(2, 2)
  }
}
