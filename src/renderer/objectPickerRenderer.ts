import { compileShaderProgram2 } from "./coregl/shader"
import { mat4 } from "gl-matrix"
import { setCommonAttributes, setViewUniformLocations } from "./coregl/programInfo"
import { Resources } from "../resources/resources"
import { Game } from "../model/game"
import { sizes } from "../constants"
import { RendererFunc } from "../scenes/scene"
import { createProjectionViewMatrix } from "./coregl/common"
import { objectIdFromArray } from "../utilities"

function createTexture(gl: WebGL2RenderingContext) {
  const targetTexture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, targetTexture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  return targetTexture
}

function createDepthBuffer(gl: WebGL2RenderingContext) {
  const depthBuffer = gl.createRenderbuffer()
  gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer)
  return depthBuffer
}

function createFrameBuffer(gl: WebGL2RenderingContext, targetTexture: WebGLTexture, depthBuffer: WebGLRenderbuffer) {
  const fb = gl.createFramebuffer()
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb)

  // attach the texture as the first color attachment
  const attachmentPoint = gl.COLOR_ATTACHMENT0
  const level = 0
  gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, targetTexture, level)

  // make a depth buffer and the same size as the targetTexture
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer)
  return fb
}

function setFramebufferAttachmentSizes(
  gl: WebGL2RenderingContext,
  targetTexture: WebGLTexture,
  depthBuffer: WebGLRenderbuffer,
  width: number,
  height: number,
) {
  gl.bindTexture(gl.TEXTURE_2D, targetTexture)
  // define size and format of level 0
  const level = 0
  const internalFormat = gl.RGBA
  const border = 0
  const format = gl.RGBA
  const type = gl.UNSIGNED_BYTE
  const data = null
  gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, format, type, data)

  gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer)
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height)
}

export function createObjectPickerRenderer(
  gl: WebGL2RenderingContext,
  resources: Resources,
  sceneRenderer: RendererFunc,
) {
  const width = gl.canvas.width
  const height = gl.canvas.height

  let targetTexture = createTexture(gl)!
  let depthBuffer = createDepthBuffer(gl)!
  let frameBuffer = createFrameBuffer(gl, targetTexture, depthBuffer)
  setFramebufferAttachmentSizes(gl, targetTexture, depthBuffer, gl.canvas.width, gl.canvas.height)
  let selectedObjectId = -1

  const dispose = () => {
    gl.deleteTexture(targetTexture)
    gl.deleteRenderbuffer(depthBuffer)
    gl.deleteFramebuffer(frameBuffer)
  }

  const render = (game: Game, timeDelta: number) => {
    const projectionViewMatrix = createProjectionViewMatrix(game, width, height)
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer)
    gl.viewport(0, 0, width, height)

    gl.enable(gl.CULL_FACE)
    gl.enable(gl.DEPTH_TEST)
    gl.disable(gl.BLEND)

    // Clear the canvas AND the depth buffer.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    sceneRenderer(projectionViewMatrix, game, timeDelta)

    const pixelX = game.controlState.current.mousePosition.x
    const pixelY = height - game.controlState.current.mousePosition.y - 1
    const data = new Uint8Array(4)
    gl.readPixels(
      pixelX, // x
      pixelY, // y
      1, // width
      1, // height
      gl.RGBA, // format
      gl.UNSIGNED_BYTE, // type
      data,
    )
    selectedObjectId = objectIdFromArray(data)
  }

  const getObjectId = () => {
    return selectedObjectId
  }
  return { dispose, render, getObjectId }
}
