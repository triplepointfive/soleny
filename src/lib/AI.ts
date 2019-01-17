import { GameCommand, IdGameCommand } from "../commands/Command"

export class AI {
  public run(): GameCommand {
    return new IdGameCommand()
  }
}
