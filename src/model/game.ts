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
    rotation: number
    targetRotation: number | null
    zoom: number
  }
  light: {
    position: vec3
  }
  landscape: Landscape
}

export function createGameWithLandscape(landscape: Landscape): Game {
  return {
    controlState: {
      current: getDefaultControlState(),
      previous: getDefaultControlState(),
    },
    view: {
      position: vec3.fromValues(0, 0, 0),
      rotation: 45,
      targetRotation: null,
      zoom: 2,
    },
    light: {
      position: vec3.fromValues(0, 300, 0),
    },
    landscape: landscape,
  }
}
