import { Game } from "./lib/Ship"

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
    return {
      u: "Units"
    }
  }

  public process(key: string): InputCommand {
    switch (key) {
      case "u":
        return new GoToInputCommand(new UnitsInput())

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
