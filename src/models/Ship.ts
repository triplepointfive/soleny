import {
  includes,
  flatMapDeep,
  isEqual,
  uniqWith,
  flatMap,
  filter,
  remove
} from "lodash"
import { Input, IdleInput } from "../inputs/Input"
import { Point } from "../lib/Point"
import { Direction } from "../lib/Direction"
import { LaborType } from "../commands/Labor"
import {
  Construction,
  DoorSystem,
  MissileSystemConstruction,
  NavigationSystem,
  PhoneStation
} from "./Construction"

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

  public visitFloor(floor: Floor): boolean {
    return true
  }
}

export type CreatureId = number

export class Creature {
  private doesLabors: LaborType[] = []

  constructor(public id: CreatureId, public pos: Point) {}

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

  public moveCursor(direction: Direction): void {
    this.cursorPos = this.cursorPos.add(direction)
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

export class Ship {
  public creatures: Creature[] = []
  public constructions: Construction[] = []
  public actedCreatures: CreatureId[] = []

  constructor(
    public plan: ShipTile[],
    public width: number,
    public height: number
  ) {
    this.creatures = [new Creature(0, new Point(10, 15))]
    this.constructions = [
      new NavigationSystem(new Point(10, 1)),
      new DoorSystem(new Point(5, 13)),
      new MissileSystemConstruction(new Point(6, 18)),
      new PhoneStation(new Point(7, 8))
    ]
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
    let creature = this.creatures.find(
      ({ id }: Creature) => !includes(this.actedCreatures, id)
    )

    if (creature) {
      const nextPos = findPath(creature.pos, new Point(7, 19), this)
      if (nextPos) {
        creature.pos = nextPos
      }
    } else {
      this.actedCreatures = []
    }
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
