import { Game, Tool } from "../model/game"
import { rectFromRange } from "../utilities"
import { ZoneEnum } from "../model/Landscape"
import { updateRendererTileInfo } from "../resources/landscape"
import { isZoningTool, zoneForTool } from "./utilities"

export function applyTool(gl: WebGL2RenderingContext, game: Game) {
  if (isZoningTool(game.gui.currentTool) && game.gui.selection !== null) {
    applyZoning(gl, game)
  }
}

function applyZoning(gl: WebGL2RenderingContext, game: Game) {
  const newZone = zoneForTool(game.gui.currentTool)
  const r = rectFromRange(game.gui.selection!)

  for (let x = r.left; x <= r.right; x++) {
    for (let y = r.top; y <= r.bottom; y++) {
      if (game.landscape.tileInfo[y][x].isFlat) {
        if (game.landscape.tileInfo[y][x].zone !== newZone) {
          // TODO: delete buildings etc.
        }
        game.landscape.tileInfo[y][x].zone = newZone
      }
    }
  }

  updateRendererTileInfo(gl, game.landscape, game.gui.selection!)
}
