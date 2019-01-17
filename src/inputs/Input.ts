import {
  GameCommand,
  GoToInputCommand,
  IdGameCommand,
  OpenFacilitiesInputCommand,
  TogglePauseCommand,
  MoveCursorInputCommand,
  OpenUnitsInputCommand,
  ToggleUnitLaborCommand,
  ClosePausedInputCommand
} from "../commands/Command"
import { Direction } from "../lib/Direction"
import { keyBy, mapValues, find } from "lodash"
import { LaborType } from "../models/Labor"
import { Unit } from "../models/Unit"

export interface InputOption {
  title: string
  style?: string
  description?: string
}

export type InputOptions = { [key: string]: InputOption }

export abstract class Input {
  abstract get options(): InputOptions
  public abstract process(key: string): GameCommand

  protected goIdle(): GameCommand {
    return new GoToInputCommand(new IdleInput())
  }
}

export abstract class PausedInput extends Input {
  constructor(public oldPauseState: boolean) {
    super()
  }
}

const idleCommand = new IdGameCommand()

export class IdleInput extends Input {
  get options(): InputOptions {
    return {
      u: { title: "Units" },
      f: { title: "Facilities" },
      space: { title: "Pause" }
    }
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

export class FacilitiesInput extends PausedInput {
  public get options(): InputOptions {
    return {}
  }

  public process(key: string): GameCommand {
    switch (key) {
      case "Backspace":
      case "Escape":
        return new ClosePausedInputCommand(this)

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

export class UnitsInput extends PausedInput {
  public readonly units: { [key: string]: Unit }

  constructor(units: Unit[], oldPauseState: boolean) {
    super(oldPauseState)

    this.units = {}

    units.forEach((unit, i) => {
      this.units[String.fromCharCode(97 + i)] = unit
    })
  }

  get options(): InputOptions {
    return mapValues(this.units, unit => {
      return {
        title: `Human ${unit.name}`,
        description: unit.pickedLabor ? unit.pickedLabor.takenName : "Slacking"
      }
    })
  }

  public process(key: string): GameCommand {
    switch (key) {
      case "Backspace":
      case "Escape":
        return new ClosePausedInputCommand(this)

      default:
        const creature = find(this.units, (_unit, symbol) => symbol === key)
        if (creature) {
          return new GoToInputCommand(new UnitInput(creature, this))
        }

        return idleCommand
    }
  }
}

export class UnitInput extends Input {
  public static readonly labors = [
    {
      title: "Operate doors",
      type: LaborType.OperateDoor
    },
    {
      title: "Shooting",
      type: LaborType.ShootMissiles
    },
    {
      title: "Navigation",
      type: LaborType.Navigation
    }
  ]

  constructor(public unit: Unit, private previousInput: Input) {
    super()
  }

  get options(): InputOptions {
    return keyBy(
      UnitInput.labors.map(({ title, type }, i) => {
        return {
          i,
          title,
          style: this.activeStyle(type)
        }
      }),
      ({ i }) => String.fromCharCode(97 + i)
    )
  }

  public process(key: string): GameCommand {
    switch (key) {
      case "Backspace":
      case "Escape":
        return new GoToInputCommand(this.previousInput)

      default:
        const code = key.charCodeAt(0) - 97,
          labor = UnitInput.labors[code]

        if (labor) {
          return new ToggleUnitLaborCommand(this.unit, labor.type)
        }

        return idleCommand
    }
  }

  private activeStyle(labor: LaborType): string {
    return this.unit.does(labor) ? "-active" : "-inactive"
  }
}
