import { Tool, ToolSelectionMode } from "../model/game"

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
