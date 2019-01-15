import { Point } from "./Point"

export class Direction extends Point {
  private constructor(x: number, y: number) {
    super(x, y)
  }

  static readonly up = new Direction(0, -1)
  static readonly down = new Direction(0, 1)
  static readonly left = new Direction(-1, 0)
  static readonly right = new Direction(1, 0)

  static readonly upLeft = new Direction(-1, -1)
  static readonly upRight = new Direction(1, -1)
  static readonly downLeft = new Direction(-1, 1)
  static readonly downRight = new Direction(1, 1)

  static readonly all = [
    Direction.up,
    Direction.down,
    Direction.left,
    Direction.right,
    Direction.upLeft,
    Direction.upRight,
    Direction.downLeft,
    Direction.downRight
  ]

  public multiple(ratio: number): Point {
    return new Point(this.x * ratio, this.y * ratio)
  }
}
