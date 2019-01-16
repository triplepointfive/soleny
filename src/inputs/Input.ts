import { Creature } from "../models/Ship"
import {
  GameCommand,
  GoToInputCommand,
  IdInputCommand,
  OpenFacilitiesInputCommand,
  TogglePauseCommand,
  CloseFacilitiesInputCommand,
  MoveCursorInputCommand,
  OpenUnitsInputCommand,
  ToggleUnitLaborCommand
} from "../commands/Command"
import { Direction } from "../lib/Direction"
import { keyBy, map, mapValues, find } from "lodash"
import { LaborType } from "../commands/Labor"

export interface InputOption {
  title: string
  style?: string
}

export type InputOptions = { [key: string]: InputOption }

export abstract class Input {
  abstract get options(): InputOptions
  public abstract process(key: string): GameCommand

  protected goIdle(): GameCommand {
    return new GoToInputCommand(new IdleInput())
  }
}

const idleCommand = new IdInputCommand()

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

export class FacilitiesInput extends Input {
  constructor(public oldPauseState: boolean) {
    super()
  }

  public get options(): InputOptions {
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

  get options(): InputOptions {
    return mapValues(this.units, unit => {
      return { title: "Human" }
    })
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

const labors = [
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

export class UnitInput extends Input {
  constructor(public unit: Creature, private previousInput: Input) {
    super()
  }

  get options(): InputOptions {
    return keyBy(
      labors.map(({ title, type }, i) => {
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
      case "Escape":
        return new GoToInputCommand(this.previousInput)

      default:
        const code = key.charCodeAt(0) - 97,
          labor = labors[code]

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
