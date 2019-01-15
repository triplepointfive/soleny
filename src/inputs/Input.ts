import { Game } from "../models/Ship"
import {
  InputCommand,
  GoToInputCommand,
  IdInputCommand,
  OpenFacilitiesInputCommand,
  TogglePauseCommand,
  CloseFacilitiesInputCommand,
  MoveCursorInputCommand
} from "../commands/Command"
import { Direction } from "../lib/Direction"

export abstract class Input {
  public abstract options(game: Game): { [key: string]: string }
  public abstract process(key: string): InputCommand

  protected goIdle(): InputCommand {
    return new GoToInputCommand(new IdleInput())
  }
}

const idleCommand = new IdInputCommand()

export class IdleInput extends Input {
  public options(game: Game): { [key: string]: string } {
    return { u: "Units", f: "Facilities", space: "Pause" }
  }

  public process(key: string): InputCommand {
    switch (key) {
      case "u":
        return new GoToInputCommand(new UnitsInput())
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

  public options(game: Game): { [key: string]: string } {
    return {}
  }

  public process(key: string): InputCommand {
    switch (key) {
      case "Escape":
        // TODO: restore old pause state
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
  public options(game: Game): { [key: string]: string } {
    let creatures: { [key: string]: string } = {}

    game.ship.creatures.forEach((creature, i) => {
      creatures[String.fromCharCode(97 + i)] = "Human"
    })

    return creatures
  }

  public process(key: string): InputCommand {
    switch (key) {
      case "Escape":
        return this.goIdle()

      default:
        return idleCommand
    }
  }
}
