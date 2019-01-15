import { Game } from "./Ship"

export abstract class InputCommand {
  public abstract call(game: Game): Game
}

export class IdInputCommand extends InputCommand {
  public call(game: Game): Game {
    return game
  }
}

export class GoToInputCommand extends InputCommand {
  constructor(protected input: Input) {
    super()
  }

  public call(game: Game): Game {
    game.input = this.input
    return game
  }
}

export class OpenFacilitiesInputCommand extends InputCommand {
  public call(game: Game): Game {
    game.input = new FacilitiesInput(game.pause)
    game.pause = true
    game.drawer.showCursor = true
    return game
  }
}

export class CloseFacilitiesInputCommand extends InputCommand {
  constructor(private input: FacilitiesInput) {
    super()
  }

  public call(game: Game): Game {
    game.input = new FacilitiesInput(game.pause)
    game.pause = this.input.oldPauseState
    game.drawer.showCursor = false
    game.input = new IdleInput()
    return game
  }
}

export class TogglePause extends InputCommand {
  public call(game: Game): Game {
    game.pause = !game.pause
    return game
  }
}

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
        return new TogglePause()
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
