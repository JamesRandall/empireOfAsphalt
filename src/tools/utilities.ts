import { Tool, ToolSelectionMode } from "../model/game"
import { ElevatedZoneEnum, TileInfo, ZoneEnum } from "../model/Landscape"

export function applyToolClearsSelection(tool: Tool) {
  switch (tool) {
    case Tool.ClearTerrain:
    case Tool.RaiseTerrain:
    case Tool.LowerTerrain:
      return false

    default:
      return true
  }
}

export function toolAllowsSlopedSelection(tool: Tool) {
  switch (tool) {
    case Tool.RaiseTerrain:
    case Tool.LowerTerrain:
    case Tool.ClearTerrain:
    case Tool.Road:
      return true

    default:
      return false
  }
}

export function toolSelectionMode(tool: Tool) {
  switch (tool) {
    case Tool.LightCommercial:
    case Tool.LightIndustrial:
    case Tool.LightResidential:
    case Tool.DenseResidential:
    case Tool.DenseIndustrial:
    case Tool.DenseCommercial:
    case Tool.Dezone:
    case Tool.Road:
    case Tool.PowerLine:
      return ToolSelectionMode.Range
    case Tool.ClearTerrain:
    case Tool.LowerTerrain:
    case Tool.RaiseTerrain:
      return ToolSelectionMode.Single // we actually want this to be a direction locked "1 unit wide" range
    case Tool.CoalPowerPlant:
    case Tool.NuclearPowerPlant:
    case Tool.WindTurbine:
    case Tool.SolarPowerPlant:
      return ToolSelectionMode.Prefab
    default:
      return ToolSelectionMode.None
  }
}

export function toolIsAxisLocked(tool: Tool) {
  switch (tool) {
    case Tool.Road:
    case Tool.PowerLine:
      return true
    default:
      return false
  }
}

export function canApplyToolToTile(tool: Tool, tileInfo: TileInfo) {
  switch (tool) {
    case Tool.LightCommercial:
    case Tool.LightIndustrial:
    case Tool.LightResidential:
    case Tool.DenseResidential:
    case Tool.DenseIndustrial:
    case Tool.DenseCommercial:
    case Tool.CoalPowerPlant:
      return tileInfo.isFlat
    case Tool.Road:
    case Tool.Dezone:
    case Tool.PowerLine:
      // actually we can't road and powerlines to every kind of slope so we need to add that here
      return true
    default:
      return false
  }
}

export function isElevatedZoningTool(tool: Tool) {
  switch (tool) {
    case Tool.PowerLine:
      return true
    default:
      return false
  }
}

export function isZoningTool(tool: Tool) {
  switch (tool) {
    case Tool.LightCommercial:
    case Tool.LightIndustrial:
    case Tool.LightResidential:
    case Tool.DenseResidential:
    case Tool.DenseIndustrial:
    case Tool.DenseCommercial:
    case Tool.Road:
    case Tool.Dezone:
    case Tool.CoalPowerPlant:
      return true
    default:
      return false
  }
}

export function elevatedZoneForTool(tool: Tool) {
  switch (tool) {
    case Tool.PowerLine:
      return ElevatedZoneEnum.PowerLine
    default:
      return ElevatedZoneEnum.None
  }
}

export function zoneForTool(tool: Tool) {
  switch (tool) {
    case Tool.LightCommercial:
      return ZoneEnum.LightCommercial
    case Tool.LightIndustrial:
      return ZoneEnum.LightIndustrial
    case Tool.LightResidential:
      return ZoneEnum.LightResidential
    case Tool.DenseResidential:
      return ZoneEnum.DenseResidential
    case Tool.DenseIndustrial:
      return ZoneEnum.DenseIndustrial
    case Tool.DenseCommercial:
      return ZoneEnum.DenseCommercial
    case Tool.Road:
      return ZoneEnum.Road
    case Tool.CoalPowerPlant:
      return ZoneEnum.CoalPowerPlant
    default:
    case Tool.Dezone:
      return ZoneEnum.None
  }
}
