import { ControlState, getDefaultControlState } from "../controls/controlState"
import { vec3 } from "gl-matrix"
import { RenderingModel } from "../resources/models"
import { Landscape } from "./Landscape"

export enum RotationEnum {
  North,
  South,
  East,
  West,
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
      position: vec3.fromValues(1, 32, 1),
      lookAt: vec3.fromValues(0, 31, 0),
      rotation: RotationEnum.North,
      zoom: 2,
    },
    light: {
      position: vec3.fromValues(0, 300, 0),
    },
    landscape: landscape,
  }
}
