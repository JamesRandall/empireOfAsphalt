import { addBuildingToGame, Game } from "../model/game"
import { rectFromRange } from "../utilities"
import { updateRendererTileInfo } from "../resources/landscape"
import { canApplyToolToTile, elevatedZoneForTool, isElevatedZoningTool, isZoningTool, zoneForTool } from "./utilities"
import { Resources } from "../resources/resources"
import {
  blueprintFromTool,
  createBuilding,
  createBuildingForZone,
  createBuildingFromBlueprint,
} from "../model/building"
import { applyRoadTextures } from "./roadTextures"
import { applyPowerlineModels } from "./powerLineModels"
import { ElevatedZoneEnum, LandscapeTexture, ZoneEnum } from "../model/Tile"

export function applyTool(gl: WebGL2RenderingContext, game: Game, resources: Resources) {
  if (isZoningTool(game.gui.currentTool) && game.gui.selection !== null) {
    applyZoning(gl, game, resources)
  } else if (isElevatedZoningTool(game.gui.currentTool) && game.gui.selection !== null) {
    applyElevatedZoning(gl, game, resources)
  }
}

function applyElevatedZoning(gl: WebGL2RenderingContext, game: Game, resources: Resources) {
  const newZone = elevatedZoneForTool(game.gui.currentTool)
  const r = rectFromRange(game.gui.selection!)

  for (let x = r.left; x <= r.right; x++) {
    for (let y = r.top; y <= r.bottom; y++) {
      if (canApplyToolToTile(game.gui.currentTool, game.landscape.tileInfo[y][x])) {
        if (game.landscape.tileInfo[y][x].elevatedZone !== newZone) {
          // TODO: delete buildings etc.
        }
        game.landscape.tileInfo[y][x].elevatedZone = newZone
      }
    }
  }

  if (newZone === ElevatedZoneEnum.PowerLine) {
    applyPowerlineModels(gl, game, resources, r)
  }
}

function applyZoning(gl: WebGL2RenderingContext, game: Game, resources: Resources) {
  const newZone = zoneForTool(game.gui.currentTool)
  const r = rectFromRange(game.gui.selection!)

  for (let x = r.left; x <= r.right; x++) {
    for (let y = r.top; y <= r.bottom; y++) {
      if (canApplyToolToTile(game.gui.currentTool, game.landscape.tileInfo[y][x])) {
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
  } else {
    const blueprint = blueprintFromTool(game.gui.currentTool)
    if (blueprint !== undefined) {
      const building = createBuildingFromBlueprint(resources, blueprint, { x: r.left, z: r.top })
      //building.numberOfVoxelsToDisplay = 0
      addBuildingToGame(game, building)
      // after we place a building we re-evaluate the orientation of the power line models as we might want to connect
      // some to the building
      applyPowerlineModels(gl, game, resources, {
        top: r.top - 1,
        left: r.left - 1,
        bottom: r.bottom + 1,
        right: r.right + 1,
      })
    }
    updateRendererTileInfo(gl, game.landscape, game.gui.selection!)
  }
}
