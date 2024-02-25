import { ControlState, getDefaultControlState } from "../controls/controlState"
import { vec3 } from "gl-matrix"

export enum RotationEnum {
  North,
  South,
  East,
  West,
}

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
}

export function getDefaultGame() {
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
  }
}
