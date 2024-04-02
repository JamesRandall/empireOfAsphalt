import { ControlState, getDefaultControlState } from "../controls/controlState"
import { glMatrix, vec3 } from "gl-matrix"
import { Landscape } from "./Landscape"
import { MutableProperty } from "../gui/properties/MutableProperty"
import { Range } from "./range"
import { Building } from "./building"

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
  PowerLine,
  CoalPowerPlant,
  NuclearPowerPlant,
  SolarPowerPlant,
  WindTurbine,
}

export enum ToolSelectionMode {
  None = 0,
  Single,
  Range,
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
    direction: vec3
  }
  buildingLight: {
    direction: vec3
  }
  landscape: Landscape
  buildings: Building[]
  selectedObjectId: number | null
  gui: {
    windows: {
      zoning: WindowState
      bulldozer: WindowState
      power: WindowState
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
  const defaultWindowState = () => ({
    isVisible: MutableProperty.with(false),
    left: MutableProperty.with(500),
    top: MutableProperty.with(50),
  })

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
      zoom: 15,
    },
    light: {
      direction: vec3.fromValues(0, 300, 0),
    },
    buildingLight: {
      direction: vec3.fromValues(0, 300, 0),
    },
    landscape: landscape,
    buildings: [],
    selectedObjectId: null,
    gui: {
      windows: {
        zoning: defaultWindowState(),
        bulldozer: defaultWindowState(),
        power: defaultWindowState(),
      },
      currentTool: Tool.None,
      selection: null,
    },
  }
}
