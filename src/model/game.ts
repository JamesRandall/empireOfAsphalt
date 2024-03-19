import { ControlState, getDefaultControlState } from "../controls/controlState"
import { vec3 } from "gl-matrix"
import { RenderingModel } from "../resources/models"
import { Landscape } from "./Landscape"

type HeightMap = number[][]

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
}

let distance = 32 // Distance from the scene center, adjust based on your scene size
let angle = 35.264 // Tilt angle in degrees
let radians = angle * (Math.PI / 180) // Convert angle to radians

// Calculate camera position
let eyeX = (distance * Math.cos(radians) * Math.sqrt(2)) / 2
let eyeY = 32 * Math.sin(radians)
let eyeZ = (distance * Math.cos(radians) * Math.sqrt(2)) / 2

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
  }
}
