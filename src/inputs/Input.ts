import { Game, Creature } from "../models/Ship"
import {
  GameCommand,
  GoToInputCommand,
  IdInputCommand,
  OpenFacilitiesInputCommand,
  TogglePauseCommand,
  CloseFacilitiesInputCommand,
  MoveCursorInputCommand,
  OpenUnitsInputCommand
} from "../commands/Command"
import { Direction } from "../lib/Direction"
import { mapValues, find } from "lodash"

export abstract class Input {
  abstract get options(): { [key: string]: string }
  public abstract process(key: string): GameCommand

  protected goIdle(): GameCommand {
    return new GoToInputCommand(new IdleInput())
  }
}

const idleCommand = new IdInputCommand()

export class IdleInput extends Input {
  get options(): { [key: string]: string } {
    return { u: "Units", f: "Facilities", space: "Pause" }
  }

  public process(key: string): GameCommand {
    switch (key) {
      case "u":
        return new OpenUnitsInputCommand()
      case "f":
        return new OpenFacilitiesInputCommand()
      case " ":
        return new TogglePauseCommand()
      default:
        return idleCommand
    }
  }
}

export class FacilitiesInput extends Input {
  constructor(public oldPauseState: boolean) {
    super()
  }

  public get options(): { [key: string]: string } {
    return {}
  }

  public process(key: string): GameCommand {
    switch (key) {
      case "Escape":
        return new CloseFacilitiesInputCommand(this)

      case "ArrowLeft":
        return new MoveCursorInputCommand(Direction.left)
      case "ArrowRight":
        return new MoveCursorInputCommand(Direction.right)
      case "ArrowUp":
        return new MoveCursorInputCommand(Direction.up)
      case "ArrowDown":
        return new MoveCursorInputCommand(Direction.down)

      default:
        return idleCommand
    }
  }
}

export class UnitsInput extends Input {
  public readonly units: { [key: string]: Creature }

  constructor(units: Creature[], public oldPauseState: boolean) {
    super()

    this.units = {}

    units.forEach((unit, i) => {
      this.units[String.fromCharCode(97 + i)] = unit
    })
  }

  get options(): { [key: string]: string } {
    return mapValues(this.units, unit => "Human")
  }

  public process(key: string): GameCommand {
    switch (key) {
      case "Escape":
        // TODO: restore old pause state
        return this.goIdle()

      default:
        const creature = find(this.units, (unit, symbol) => symbol === key)
        if (creature) {
          return new GoToInputCommand(new UnitInput(creature, this))
        }

        return idleCommand
    }
  }
}

export class UnitInput extends Input {
  constructor(public unit: Creature, private previousInput: Input) {
    super()
  }

  get options(): { [key: string]: string } {
    return {
      "1": "Operate doors",
      "2": "Load ammo"
    }
  }

  public process(key: string): GameCommand {
    switch (key) {
      case "Escape":
        return new GoToInputCommand(this.previousInput)

      default:
        return idleCommand
    }
  }
}
