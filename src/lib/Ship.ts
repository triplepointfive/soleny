import { WSASYSCALLFAILURE } from "constants"

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
  public abstract visitDoor(door: Door): T
  public abstract visitWall(door: Wall): T
  public abstract visitFloor(door: Floor): T
}

export abstract class Tile {
  public abstract visit<T>(visitor: TileVisitor<T>): T
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
}

export class Ship {
  constructor(
    public plan: Tile[],
    public width: number,
    public height: number
  ) {}

  public at({ x, y }: Point): Tile {
    return this.plan[x + y * this.width]
  }
}

export class Game {
  public tick(): void {}
}

export const ship = new Ship(
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
