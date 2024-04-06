import { vec4 } from "gl-matrix"

function color(r: number, g: number, b: number, a: number) {
  return vec4.fromValues(r / 255.0, g / 255.0, b / 255.0, a / 255.0)
}

function gray(g: number, a: number = 255.0) {
  return color(g, g, g, a)
}

export const constants = {
  lightDarkChrome: 0x666666ff,
  midDarkChrome: 0x333333ff,
  darkDarkChrome: 0x000000ff,

  lightChrome: 0xa8a8a8ff,
  midChrome: 0x848484ff,
  darkChrome: 0x606060ff,
  midGreen: 0x687c4cff,
  lightGreen: 0x98b06cff,
  darkGreen: 0x3c5830ff,
  midBlue: 0x6267a3ff,
  lightBlue: 0x6c72c7ff,
  darkBlue: 0x575d8aff,
  midOrange: 0xd5922bff,
  lightOrange: 0xffc368ff,
  darkOrange: 0xc27500ff,
  midRed: 0xcd2c1eff,
  lightRed: 0xea6e5fff,
  darkRed: 0x921c12ff,
  chromeStrokeWidth: 2,

  window: {
    titleBarHeight: 64 / 2,
    closeButtonWidth: 64 / 2,
  },
}
