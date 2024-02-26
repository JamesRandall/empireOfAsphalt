import { mat4 } from "gl-matrix"

export function setupGl(gl: WebGL2RenderingContext) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.clearDepth(1.0)
  gl.enable(gl.DEPTH_TEST)
  gl.disable(gl.CULL_FACE)
  gl.depthFunc(gl.LEQUAL)
  gl.enable(gl.BLEND)
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  //gl.enable(gl.SAMPLE_COVERAGE)
  //sgl.sampleCoverage(0.9, false)
}

export function bindBufferAndSetViewport(
  gl: WebGL2RenderingContext,
  frameBuffer: WebGLFramebuffer | null,
  width: number,
  height: number,
  x: number = 0,
  y: number = 0,
) {
  gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer)
  gl.viewport(x, y, width, height)
}

export function createFrameBufferTexture(gl: WebGL2RenderingContext, width: number, height: number) {
  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)

  const level = 0
  const internalFormat = gl.RGBA
  const border = 0
  const format = gl.RGBA
  const type = gl.UNSIGNED_BYTE
  const data = null

  gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, format, type, data)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

  return texture
}

export function createProjectionMatrix(width: number, height: number, zFar: number) {
  const fieldOfView = (45 * Math.PI) / 180 // in radians
  const aspect = width / height
  const zNear = 0.1
  const projectionMatrix = mat4.create()

  // note: glmatrix.js always has the first argument
  // as the destination to receive the result.
  mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar)
  return projectionMatrix
}
