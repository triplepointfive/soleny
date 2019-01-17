import { includes, flatMapDeep, filter } from "lodash"
import { Input, IdleInput } from "../inputs/Input"
import { Point } from "../lib/Point"
import { Direction } from "../lib/Direction"
import {
  Construction,
  DoorSystem,
  MissileSystemConstruction,
  NavigationSystem,
  PhoneStation
} from "./Construction"
import { findPath } from "../lib/findPath"
import { ShipTile, Wall, Door, Space, Floor } from "./Tile"
import { Unit, UnitID } from "./Unit"

export interface Drawable {
  tile: ShipTile
  creatures: Unit[]
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
      selected: this.ship.isSelected()
    }
  }
}

export class Ship {
  public creatures: Unit[] = []
  public constructions: Construction[] = []
  public actedCreatures: UnitID[] = []

  constructor(
    public plan: ShipTile[],
    public width: number,
    public height: number
  ) {
    this.creatures = [new Unit(0, new Point(10, 15))]
    this.constructions = [
      new NavigationSystem(new Point(10, 1)),
      new DoorSystem(new Point(5, 13)),
      new MissileSystemConstruction(new Point(6, 18)),
      new PhoneStation(new Point(7, 8))
    ]
  }

  public creaturesAt(pos: Point): Unit[] {
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

  public isSelected(): boolean {
    return false
  }

  public tick(): void {
    let creature = this.creatures.find(
      ({ id }: Unit) => !includes(this.actedCreatures, id)
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
