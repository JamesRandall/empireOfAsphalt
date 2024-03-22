import { vec4 } from "gl-matrix"

function color(r: number, g: number, b: number, a: number) {
  return vec4.fromValues(r / 255.0, g / 255.0, b / 255.0, a / 255.0)
}

function gray(g: number, a: number = 255.0) {
  return color(g, g, g, a)
}

export const constants = {
  lightChrome: gray(168),
  midChrome: gray(132),
  darkChrome: gray(96),
}
