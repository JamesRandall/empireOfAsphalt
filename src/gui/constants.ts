import { vec4 } from "gl-matrix"

function color(r: number, g: number, b: number, a: number) {
  return vec4.fromValues(r / 255.0, g / 255.0, b / 255.0, a / 255.0)
}

function gray(g: number, a: number = 255.0) {
  return color(g, g, g, a)
}

export const constants = {
  lightChrome: 0xa8a8a8ff,
  midChrome: 0x848484ff,
  darkChrome: 0x606060ff,
  midGreen: 0x687c4cff,
  lightGreen: 0x98b06cff,
  darkGreen: 0x3c5830ff,
  chromeStrokeWidth: 2,

  window: {
    titleBarHeight: 64 / 2,
    closeButtonWidth: 64 / 2,
  },
}
