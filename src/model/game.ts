import { ControlState, getDefaultControlState } from "../controls/controlState"
import { vec3 } from "gl-matrix"
import { RenderingModel } from "../resources/models"

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
  terrain: {
    size: number
    heightMap: HeightMap
    model: RenderingModel | null
  }
}

export function getDefaultGame(): Game {
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
    terrain: {
      size: 0,
      heightMap: [],
      model: null,
    },
  }
}
