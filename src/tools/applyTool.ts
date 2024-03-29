import { Game } from "../model/game"
import { rectFromRange } from "../utilities"
import { LandscapeTexture, ZoneEnum } from "../model/Landscape"
import { updateRendererTileInfo } from "../resources/landscape"
import { canApplyZoneToTile, isZoningTool, zoneForTool } from "./utilities"

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
      if (canApplyZoneToTile(game.gui.currentTool, game.landscape.tileInfo[y][x])) {
        if (game.landscape.tileInfo[y][x].zone !== newZone) {
          // TODO: delete buildings etc.
        }
        game.landscape.tileInfo[y][x].zone = newZone
      }
    }
  }

  // We have to apply the road textures after we've laid the road down as they impact each other and their neighbours
  if (newZone === ZoneEnum.Road) {
    applyRoadTextures(gl, game, r)
  }

  updateRendererTileInfo(gl, game.landscape, game.gui.selection!)
}

function applyRoadTextures(
  gl: WebGL2RenderingContext,
  game: Game,
  r: { top: number; left: number; bottom: number; right: number },
) {
  for (let x = r.left; x <= r.right; x++) {
    for (let y = r.top; y <= r.bottom; y++) {
      // only have the one texture for now
      game.landscape.tileInfo[y][x].textureIndex = LandscapeTexture.RoadNorthSouth
    }
  }
}
