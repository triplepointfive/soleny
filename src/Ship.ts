import { concat, flatMapDeep, isEqual, uniqWith, flatMap, filter } from "lodash"
import { Input, IdleInput } from "./Input"

export abstract class TileVisitor<T> {
  public abstract visitConstruction(construction: ConstructionTile): T
  public abstract visitDoor(door: Door): T
  public abstract visitWall(door: Wall): T
  public abstract visitFloor(door: Floor): T
  public abstract visitSpace(space: Space): T
}

export abstract class ShipTile {
  public abstract visit<T>(visitor: TileVisitor<T>): T
}

export class ConstructionTile extends ShipTile {
  constructor(public passable: boolean, public symbol: string) {
    super()
  }

  public visit<T>(visitor: TileVisitor<T>): T {
    return visitor.visitConstruction(this)
  }
}

export class Space extends ShipTile {
  public visit<T>(visitor: TileVisitor<T>): T {
    return visitor.visitSpace(this)
  }
}

export class Door extends ShipTile {
  constructor(public open: boolean) {
    super()
  }

  public visit<T>(visitor: TileVisitor<T>): T {
    return visitor.visitDoor(this)
  }
}

export class Wall extends ShipTile {
  public visit<T>(visitor: TileVisitor<T>): T {
    return visitor.visitWall(this)
  }
}

export class Floor extends ShipTile {
  public visit<T>(visitor: TileVisitor<T>): T {
    return visitor.visitFloor(this)
  }
}

export class SymbolTileVisitor extends TileVisitor<string> {
  public visitSpace(space: Space): string {
    return " "
  }

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
  public visitSpace(space: Space): string {
    return "-space"
  }

  public visitConstruction(construction: ConstructionTile): string {
    return "-construction"
  }

  public visitDoor(door: Door): string {
    if (door.open) {
      return "-open-door"
    } else {
      return "-close-door"
    }
  }

  public visitWall(wall: Wall): string {
    return "-wall"
  }

  public visitFloor(floor: Floor): string {
    return "-floor"
  }
}

export class PassableTileVisitor extends TileVisitor<boolean> {
  public visitSpace(space: Space): boolean {
    return false
  }

  public visitConstruction({ passable }: ConstructionTile): boolean {
    return passable
  }

  public visitDoor(door: Door): boolean {
    return true
  }

  public visitWall(door: Wall): boolean {
    return false
  }

  public visitFloor(door: Floor): boolean {
    return true
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

  public static readonly dxy = concat(Point.ortho, Point.diag)

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
  tile: ShipTile
  creatures: Creature[]
  selected: boolean
}

export class Drawer {
  public cursorPos: Point
  public showCursor: boolean
  public frame: number

  public tickFrame(): void {
    this.frame += 1
  }

  constructor(protected ship: Ship) {
    this.cursorPos = new Point(
      Math.floor(ship.width / 2),
      Math.floor(ship.height / 2)
    )

    this.showCursor = false
    this.frame = 0
  }

  public isCursor(pos: Point): boolean {
    return this.showCursor && this.cursorPos.eq(pos) && this.frame % 10 < 7
  }

  public draw(pos: Point): Drawable {
    return {
      tile: this.ship.tileAt(pos),
      creatures: this.ship.creaturesAt(pos),
      selected: this.ship.isSelected(pos)
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

  let turn = 0,
    toCheck = [pos],
    newPosToCheck: Point[] = [],
    passableVisitor = new PassableTileVisitor()

  while (toCheck.length && mask[dest.x + dest.y * ship.width] === undefined) {
    toCheck.forEach(checkPos => {
      const tile = ship.tileAt(checkPos)

      if (tile.visit(passableVisitor)) {
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
  public abstract tileAt({ x, y }: Point): ConstructionTile

  public isIntersectional({ x, y }: Point): boolean {
    return (
      x >= this.pos.x &&
      x < this.pos.x + this.size.x &&
      y >= this.pos.y &&
      y < this.pos.y + this.size.y
    )
  }
}

export class DoorSystem extends Construction {
  get size(): Point {
    return new Point(2, 2)
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
    public plan: ShipTile[],
    public width: number,
    public height: number
  ) {
    this.creatures = [new Creature(new Point(10, 1))]
    this.constructions = [new DoorSystem(new Point(5, 13))]
  }

  public creaturesAt(pos: Point): Creature[] {
    return filter(this.creatures, creature => creature.pos.eq(pos))
  }

  public tileAt(pos: Point): ShipTile {
    const construction = this.constructions.find(construction =>
      construction.isIntersectional(pos)
    )

    if (construction) {
      return construction.tileAt(pos)
    }

    return this.plan[pos.x + pos.y * this.width]
  }

  public isSelected(pos: Point): boolean {
    return false
  }

  public tick(): void {
    this.creatures.forEach(creature => {
      const nextPos = findPath(creature.pos, new Point(6, 14), this)
      if (nextPos) {
        creature.pos = nextPos
      }
    })
  }
}

export class Game {
  protected inAction: boolean = false
  public input: Input = new IdleInput()
  public pause: boolean
  public drawer: Drawer

  public distanceLeft = 778 * 10 ** 6
  public speed = 650000

  constructor(public ship: Ship) {
    this.pause = true
    this.drawer = new Drawer(ship)
  }

  public tick(): void {
    this.drawer.tickFrame()
    if (this.inAction || this.pause) {
      return
    }

    this.inAction = true

    this.ship.tick()
    this.distanceLeft -= this.speed / 10 // TODO: adjust by tick interval

    this.inAction = false
  }
}

const plan: ShipTile[] = flatMapDeep(
  [
    "         ####         ",
    "         #··#         ",
    "         #··#         ",
    "         #··#         ",
    "         #··#         ",
    "         #+-#         ",
    "         #··#         ",
    "      ####··####      ",
    "      #··+··+··#      ",
    "      #··#··#··#      ",
    "      #··####··#      ",
    "      #··#  #··#      ",
    "    ###++#++#++###    ",
    "    #····+··+····#    ",
    "    #····+··+····#    ",
    "    #····#··#····#    ",
    "    #····#··#····#    ",
    "    #+##########+#    ",
    "    #····#··#····#    ",
    " ####····#··#····#### ",
    " #··+····+··+····+··# ",
    " #··+····+··+····+··# ",
    " #··###++####++###··# ",
    " #··# #··#  #··# #··# ",
    " #### #··####··# #### ",
    "      #··+··+··#      ",
    "      #··#··#··#      ",
    "      ##+#··#+##      ",
    "         #··#         ",
    "         ####         "
  ],
  row => {
    return row.split("").map(symbol => {
      switch (symbol) {
        case "#":
          return new Wall()
        case "+":
          return new Door(false)
        case "-":
          return new Door(true)
        case " ":
          return new Space()
        default:
          return new Floor()
      }
    })
  }
)
export let ship = new Ship(plan, 22, 30)
