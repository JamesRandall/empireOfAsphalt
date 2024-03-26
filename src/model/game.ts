import { ControlState, getDefaultControlState } from "../controls/controlState"
import { glMatrix, vec3 } from "gl-matrix"
import { RenderingModel } from "../resources/models"
import { Landscape } from "./Landscape"
import { MutableProperty } from "../gui/properties/MutableProperty"

type HeightMap = number[][]

export enum Tool {
  None,
  LightResidential,
  DenseResidential,
  LightCommercial,
  DenseCommercial,
  LightIndustrial,
  DenseIndustrial,
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
    }
    currentTool: Tool
    selection: {
      start: Position
      end: Position
    } | null
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
      },
      currentTool: Tool.None,
      selection: null,
    },
  }
}
