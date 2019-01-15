import { Game } from "../models/Ship"
import { Input, FacilitiesInput, IdleInput } from "../inputs/Input"
import { Direction } from "../lib/Direction"

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

export class MoveCursorInputCommand extends InputCommand {
  constructor(private direction: Direction) {
    super()
  }

  public call(game: Game): Game {
    game.drawer.moveCursor(this.direction)
    return game
  }
}

export class TogglePauseCommand extends InputCommand {
  public call(game: Game): Game {
    game.pause = !game.pause
    return game
  }
}
