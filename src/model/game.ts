import { ControlState, getDefaultControlState } from "../controls/controlState"
import { vec3 } from "gl-matrix"
import { RenderingModel } from "../resources/models"
import { Landscape } from "./Landscape"

export enum RotationEnum {
  North = 0,
  East = 1,
  South = 2,
  West = 3,
}

type HeightMap = number[][]

export interface Game {
  controlState: {
    current: ControlState
    previous: ControlState
  }
  camera: {
    position: vec3
    lookAt: vec3
    rotation: RotationEnum
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
    camera: {
      position: vec3.fromValues(0, 0, 0),
      lookAt: vec3.fromValues(0, 0, 0),
      rotation: RotationEnum.North,
      zoom: 2,
    },
    light: {
      position: vec3.fromValues(0, 300, 0),
    },
    landscape: landscape,
  }
}
