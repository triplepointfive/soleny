import { GameCommand, IdInputCommand } from "../commands/Command"

export class AI {
  public run(): GameCommand {
    return new IdInputCommand()
  }
}
