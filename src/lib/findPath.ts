import { Point } from "./Point"
import { Ship } from "../models/Ship"
import { uniqWith, flatMap, isEqual } from "lodash"
import { PassableTileVisitor } from "../models/Tile"

export const findPath = function(
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
