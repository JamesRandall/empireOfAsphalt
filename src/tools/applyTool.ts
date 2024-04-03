import { addBuildingToGame, Game } from "../model/game"
import { rectFromRange } from "../utilities"
import { LandscapeTexture, ZoneEnum } from "../model/Landscape"
import { updateRendererTileInfo } from "../resources/landscape"
import { canApplyZoneToTile, isZoningTool, zoneForTool } from "./utilities"
import { Resources } from "../resources/resources"
import {
  blueprintFromTool,
  createBuilding,
  createBuildingForZone,
  createBuildingFromBlueprint,
} from "../model/building"
import { applyRoadTextures } from "./roadTextures"
import { applyPowerlineModels } from "./powerLineModels"

export function applyTool(gl: WebGL2RenderingContext, game: Game, resources: Resources) {
  if (isZoningTool(game.gui.currentTool) && game.gui.selection !== null) {
    applyZoning(gl, game, resources)
  }
}

function applyZoning(gl: WebGL2RenderingContext, game: Game, resources: Resources) {
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
  } else if (newZone === ZoneEnum.PowerLine) {
    applyPowerlineModels(gl, game, resources, r)
  } else {
    const blueprint = blueprintFromTool(game.gui.currentTool)
    if (blueprint !== undefined) {
      const building = createBuildingFromBlueprint(resources, blueprint, { x: r.left, z: r.bottom })
      building.numberOfVoxelsToDisplay = 0
      addBuildingToGame(game, building)
    } else if (newZone === ZoneEnum.LightResidential) {
      const building = createBuilding(resources.voxelModels.residential.house, 1, 1, r.left, r.top, 0)
      addBuildingToGame(game, building)
    }
    updateRendererTileInfo(gl, game.landscape, game.gui.selection!)
  }
}
