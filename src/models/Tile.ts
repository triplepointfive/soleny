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
