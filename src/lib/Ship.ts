import { last, isEqual, uniqWith, flatMap, filter } from "lodash"
import { Input, IdleInput } from "../Input"

// export class Ship {}

// export class Tile

// export default `
//         ####
//         #··#
//         #··#
//         #··#
//         #··#
//         #++#
//         #··#
//      ####··####
//      #··+··+··#
//      #··#··#··#
//      #··####··#
//      #··#  #··#
//    ###++#++#++###
//    #····#··#····#
//    #····#··#····#
//    #····#··#····#
//    #····#··#····#
//    #+##########+#
//    #····#··#····#
// ####····#··#····####
// #··+····#··#····+··#
// #··+····#··#····+··#
// #··###++####++###··#
// #··# #··#  #··# #··#
// ╚### #··####··# ####
//      #··+··+··#
//      ║··#··#··#
//      ╚═+#··#+##
//         #··#
//         ╚###
// `
//
export abstract class TileVisitor<T> {
  public abstract visitConstruction(construction: ConstructionTile): T
  public abstract visitDoor(door: Door): T
  public abstract visitWall(door: Wall): T
  public abstract visitFloor(door: Floor): T
}

export abstract class Tile {
  public abstract visit<T>(visitor: TileVisitor<T>): T
}

export class ConstructionTile extends Tile {
  constructor(public passable: boolean, public symbol: string) {
    super()
  }

  public visit<T>(visitor: TileVisitor<T>): T {
    return visitor.visitConstruction(this)
  }
}

export class Door extends Tile {
  constructor(public open: boolean) {
    super()
  }

  public visit<T>(visitor: TileVisitor<T>): T {
    return visitor.visitDoor(this)
  }
}

export class Wall extends Tile {
  public visit<T>(visitor: TileVisitor<T>): T {
    return visitor.visitWall(this)
  }
}

export class Floor extends Tile {
  public visit<T>(visitor: TileVisitor<T>): T {
    return visitor.visitFloor(this)
  }
}

export class SymbolTileVisitor extends TileVisitor<string> {
  public visitConstruction({ symbol }: ConstructionTile): string {
    return symbol
  }

  public visitDoor(door: Door): string {
    if (door.open) {
      return "-"
    } else {
      return "+"
    }
  }

  public visitWall(wall: Wall): string {
    return "#"
  }

  public visitFloor(floor: Floor): string {
    return "·"
  }
}

export class StyleTileVisitor extends TileVisitor<string> {
  public visitConstruction(construction: ConstructionTile): string {
    return "-construction"
  }

  public visitDoor(door: Door): string {
    return "-door"
  }

  public visitWall(wall: Wall): string {
    return "-wall"
  }

  public visitFloor(floor: Floor): string {
    return "-floor"
  }
}

export class Point {
  constructor(public x: number, public y: number) {}

  public static readonly ortho = [
    new Point(0, -1),
    new Point(-1, 0),
    new Point(1, 0),
    new Point(0, 1)
  ]

  public static readonly diag = [
    new Point(-1, -1),
    new Point(1, -1),
    new Point(-1, 1),
    new Point(1, 1)
  ]

  public static readonly dxy = [
    new Point(-1, -1),
    new Point(0, -1),
    new Point(1, -1),
    new Point(-1, 0),
    new Point(1, 0),
    new Point(-1, 1),
    new Point(0, 1),
    new Point(1, 1)
  ]

  public eq(point: Point): boolean {
    return this.x === point.x && this.y === point.y
  }

  public nextTo(point: Point): boolean {
    return Math.abs(this.x - point.x) <= 1 && Math.abs(this.y - point.y) <= 1
  }

  public copy(): Point {
    return new Point(this.x, this.y)
  }

  public add(point: Point): Point {
    return new Point(this.x + point.x, this.y + point.y)
  }

  public wrappers(): Point[] {
    return Point.dxy.map(point => this.add(point))
  }

  public orthoWraps(): Point[] {
    return Point.ortho.map(point => this.add(point))
  }

  public diagWraps(): Point[] {
    return Point.diag.map(point => this.add(point))
  }
}

export class Creature {
  constructor(public pos: Point) {}
}

export interface Drawable {
  tile: Tile
  creatures: Creature[]
}

export class Drawer {
  constructor(protected ship: Ship) {}

  public draw(pos: Point): Drawable {
    const construction = ship.constructions.find(construction =>
      construction.isIntersectional(pos)
    )

    if (construction) {
      return {
        tile: construction.tileAt(pos),
        creatures: this.ship.creaturesAt(pos)
      }
    }

    return {
      tile: this.ship.tileAt(pos),
      creatures: this.ship.creaturesAt(pos)
    }
  }
}

const findPath = function(
  pos: Point,
  dest: Point,
  ship: Ship
): Point | undefined {
  if (pos.eq(dest)) {
    return
  }

  let mask: Array<undefined | number> = []

  let turn = 0
  let toCheck = [pos]
  let newPosToCheck: Point[] = []

  while (toCheck.length && mask[dest.x + dest.y * ship.width] === undefined) {
    toCheck.forEach(checkPos => {
      const tile = ship.tileAt(checkPos)

      if (tile instanceof Door || tile instanceof Floor) {
        mask[checkPos.x + checkPos.y * ship.width] = turn
        newPosToCheck.push(checkPos)
      } else {
        mask[checkPos.x + checkPos.y * ship.width] = -1
      }
    })

    turn += 1

    toCheck = uniqWith(
      flatMap(newPosToCheck, nextPos => nextPos.wrappers()),
      isEqual
    ).filter(({ x, y }: Point) => mask[x + y * ship.width] === undefined)
    newPosToCheck = []
  }

  if (mask[dest.x + dest.y * ship.width]) {
    let lastPos: Point | undefined = dest,
      prevPos: Point | undefined = lastPos

    turn -= 2
    while (turn > 0 && prevPos) {
      lastPos = prevPos
        .orthoWraps()
        .find(({ x, y }: Point) => mask[x + y * ship.width] === turn)

      lastPos =
        lastPos ||
        prevPos
          .diagWraps()
          .find(({ x, y }: Point) => mask[x + y * ship.width] === turn)

      turn -= 1
      prevPos = lastPos
    }

    return lastPos
  }

  return
}

export abstract class Construction {
  constructor(public pos: Point) {}

  abstract get size(): Point
  public abstract isIntersectional({ x, y }: Point): boolean
  public abstract tileAt({ x, y }: Point): ConstructionTile
}

export class DoorSystem extends Construction {
  get size(): Point {
    return new Point(2, 2)
  }

  public isIntersectional({ x, y }: Point): boolean {
    return (
      x >= this.pos.x &&
      x < this.pos.x + this.size.x &&
      y >= this.pos.y &&
      y < this.pos.y + this.size.y
    )
  }

  public tileAt({ x, y }: Point): ConstructionTile {
    switch ([x - this.pos.x, y - this.pos.y].join(" ")) {
      case "0 0":
        return new ConstructionTile(false, "╔")
      case "0 1":
        return new ConstructionTile(false, "╙")
      case "1 0":
        return new ConstructionTile(false, "╕")
      case "1 1":
        return new ConstructionTile(true, "∅")
      default:
        return new ConstructionTile(false, "E")
    }
  }
}

export class Ship {
  public creatures: Creature[] = []
  public constructions: Construction[] = []

  constructor(
    public plan: Tile[],
    public width: number,
    public height: number
  ) {
    this.creatures = [new Creature(new Point(1, 1))]
    this.constructions = [new DoorSystem(new Point(1, 4))]
  }

  public creaturesAt(pos: Point): Creature[] {
    return filter(this.creatures, creature => creature.pos.eq(pos))
  }

  public tileAt(pos: Point): Tile {
    return this.plan[pos.x + pos.y * this.width]
  }

  public tick(): void {
    this.creatures.forEach(creature => {
      const nextPos = findPath(creature.pos, new Point(2, 5), this)
      if (nextPos) {
        creature.pos = nextPos
      }
    })
  }
}

export class Game {
  protected inAction: boolean = false
  public input: Input = new IdleInput()

  public distanceLeft = 778 * 10 ** 6
  public speed = 650000

  constructor(public ship: Ship) {}

  public tick(): void {
    if (this.inAction) {
      return
    }

    this.inAction = true

    this.ship.tick()
    this.distanceLeft -= this.speed / 10 // TODO: adjust by tick interval

    this.inAction = false
  }
}

export let ship = new Ship(
  [
    new Wall(),
    new Wall(),
    new Wall(),
    new Wall(),
    new Wall(),
    new Wall(),
    new Wall(),
    new Wall(),
    new Wall(),

    new Wall(),
    new Floor(),
    new Floor(),
    new Floor(),
    new Wall(),
    new Floor(),
    new Floor(),
    new Floor(),
    new Wall(),

    new Wall(),
    new Floor(),
    new Floor(),
    new Floor(),
    new Wall(),
    new Floor(),
    new Floor(),
    new Floor(),
    new Wall(),

    new Wall(),
    new Floor(),
    new Floor(),
    new Floor(),
    new Wall(),
    new Floor(),
    new Floor(),
    new Floor(),
    new Wall(),

    new Wall(),
    new Floor(),
    new Floor(),
    new Floor(),
    new Wall(),
    new Wall(),
    new Door(false),
    new Wall(),
    new Wall(),

    new Wall(),
    new Floor(),
    new Floor(),
    new Floor(),
    new Door(false),
    new Floor(),
    new Floor(),
    new Floor(),
    new Wall(),

    new Wall(),
    new Wall(),
    new Wall(),
    new Wall(),
    new Wall(),
    new Wall(),
    new Wall(),
    new Wall(),
    new Wall()
  ],
  9,
  7
)
