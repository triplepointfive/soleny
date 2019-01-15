import { concat } from "lodash"

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
