import { Game, Tool } from "../../model/game"
import { rectFromRange } from "../../utilities"
import { ZoneEnum } from "../../model/Landscape"
import { updateRendererTileInfo } from "../../resources/landscape"

export function applyTool(gl: WebGL2RenderingContext, game: Game) {
  if (game.gui.currentTool === Tool.DenseResidential && game.gui.selection !== null) {
    const r = rectFromRange(game.gui.selection)
    for (let x = r.left; x <= r.right; x++) {
      for (let y = r.top; y <= r.bottom; y++) {
        game.landscape.tileInfo[y][x].zone = ZoneEnum.DenseResidential
      }
    }
    updateRendererTileInfo(gl, game.landscape, game.gui.selection)
  }
}
