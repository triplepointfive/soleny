import { Game, Creature } from "../models/Ship"
import {
  Input,
  FacilitiesInput,
  IdleInput,
  UnitsInput,
  PausedInput
} from "../inputs/Input"
import { Direction } from "../lib/Direction"
import { LaborType } from "./Labor"

export abstract class GameCommand {
  public abstract call(game: Game): Game
}

export class IdInputCommand extends GameCommand {
  public call(game: Game): Game {
    return game
  }
}

export class GoToInputCommand extends GameCommand {
  constructor(protected input: Input) {
    super()
  }

  public call(game: Game): Game {
    game.input = this.input
    return game
  }
}

export class OpenFacilitiesInputCommand extends GameCommand {
  public call(game: Game): Game {
    game.input = new FacilitiesInput(game.pause)
    game.pause = true
    game.drawer.showCursor = true
    return game
  }
}

export class OpenUnitsInputCommand extends GameCommand {
  public call(game: Game): Game {
    game.input = new UnitsInput(game.ship.creatures, game.pause)
    game.pause = true
    // game.drawer.showCursor = true
    return game
  }
}

export class ClosePausedInputCommand extends GameCommand {
  constructor(private input: PausedInput) {
    super()
  }

  public call(game: Game): Game {
    game.pause = this.input.oldPauseState
    game.drawer.showCursor = false
    game.input = new IdleInput()
    return game
  }
}

export class MoveCursorInputCommand extends GameCommand {
  constructor(private direction: Direction) {
    super()
  }

  public call(game: Game): Game {
    game.drawer.moveCursor(this.direction)
    return game
  }
}

export class TogglePauseCommand extends GameCommand {
  public call(game: Game): Game {
    game.pause = !game.pause
    return game
  }
}

export class ToggleUnitLaborCommand extends GameCommand {
  constructor(private unit: Creature, private labor: LaborType) {
    super()
  }

  public call(game: Game): Game {
    game.ship.creatures.forEach(creature => {
      if (creature.id === this.unit.id) {
        creature.toggleLabor(this.labor)
      }
    })
    return game
  }
}
