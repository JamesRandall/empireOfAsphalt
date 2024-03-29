import { Tool, ToolSelectionMode } from "../model/game"
import { ZoneEnum } from "../model/Landscape"

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
      return ToolSelectionMode.Range
    case Tool.ClearTerrain:
    case Tool.LowerTerrain:
    case Tool.RaiseTerrain:
    case Tool.Road:
      return ToolSelectionMode.Single // we actually want this to be a direction locked "1 unit wide" range
    default:
      return ToolSelectionMode.None
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
    case Tool.Dezone:
      return true
    default:
      return false
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
    default:
    case Tool.Dezone:
      return ZoneEnum.None
  }
}
