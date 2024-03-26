import { ControlState, getDefaultControlState } from "../controls/controlState"
import { glMatrix, vec3 } from "gl-matrix"
import { RenderingModel } from "../resources/models"
import { Landscape } from "./Landscape"
import { MutableProperty } from "../gui/properties/MutableProperty"
import { Range } from "./range"

type HeightMap = number[][]

export enum Tool {
  None,
  Road,
  ClearTerrain,
  RaiseTerrain,
  LowerTerrain,
  Dezone,
  LightResidential,
  DenseResidential,
  LightCommercial,
  DenseCommercial,
  LightIndustrial,
  DenseIndustrial,
}

export enum ToolSelectionMode {
  None = 0,
  Single,
  Range,
}

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

export interface WindowState {
  isVisible: MutableProperty<boolean>
  left: MutableProperty<number>
  top: MutableProperty<number>
}

export interface Position {
  x: number
  y: number
}

export interface Game {
  controlState: {
    current: ControlState
    previous: ControlState
  }
  view: {
    position: vec3
    lookAt: vec3
    rotation: number
    targetRotation: number | null
    zoom: number
  }
  light: {
    position: vec3
  }
  landscape: Landscape
  selectedObjectId: number | null
  gui: {
    windows: {
      zoning: WindowState
      bulldozer: WindowState
    }
    currentTool: Tool
    selection: Range | null
  }
}

const distance = 32 // Distance from the scene center, adjust based on your scene size
const isometricAngle = 35.264 // Tilt angle in degrees
const radians = glMatrix.toRadian(isometricAngle) // * (Math.PI / 180) // Convert angle to radians

// Calculate camera position
const eyeX = (distance * Math.cos(radians) * Math.sqrt(2)) / 2
const eyeY = 32 * Math.sin(radians)
const eyeZ = (distance * Math.cos(radians) * Math.sqrt(2)) / 2

export function createGameWithLandscape(landscape: Landscape): Game {
  return {
    controlState: {
      current: getDefaultControlState(),
      previous: getDefaultControlState(),
    },
    view: {
      position: vec3.fromValues(eyeX, eyeY, eyeZ), // vec3.fromValues(0, 0, 0),
      lookAt: vec3.fromValues(0, 0, 0),
      rotation: 0,
      targetRotation: null,
      zoom: 2,
    },
    light: {
      position: vec3.fromValues(0, 300, 0),
    },
    landscape: landscape,
    selectedObjectId: null,
    gui: {
      windows: {
        zoning: {
          isVisible: MutableProperty.with(false),
          left: MutableProperty.with(500),
          top: MutableProperty.with(50),
        },
        bulldozer: {
          isVisible: MutableProperty.with(false),
          left: MutableProperty.with(500),
          top: MutableProperty.with(50),
        },
      },
      currentTool: Tool.None,
      selection: null,
    },
  }
}
