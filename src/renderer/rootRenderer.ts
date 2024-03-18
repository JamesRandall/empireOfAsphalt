import { RendererFunc } from "../scenes/scene"
import { bindBufferAndSetViewport, createFrameBufferTexture, setupGl } from "./coregl/common"
import { Game } from "../model/game"
import { Resources } from "../resources/resources"
import { compileShaderProgram2, ShaderSource } from "./coregl/shader"
import { createSquareModel } from "../resources/models"
import { mat4, quat, vec2, vec3 } from "gl-matrix"
import { setCommonAttributes, setViewUniformLocations } from "./coregl/programInfo"
import { sizes } from "../constants"

export enum RenderEffect {
  None,
  CRT,
  AmberCRT,
  GreenCRT,
  VCR,
}

const globalRenderEffects = [
  RenderEffect.None,
  RenderEffect.CRT,
  RenderEffect.AmberCRT,
  RenderEffect.GreenCRT,
  RenderEffect.VCR,
]

export function nextEffect(currentEffect: RenderEffect) {
  const index = globalRenderEffects.indexOf(currentEffect)
  if (index + 1 >= globalRenderEffects.length) {
    return globalRenderEffects[0]
  }
  return globalRenderEffects[index + 1]
}

export function previousEffect(currentEffect: RenderEffect) {
  const index = globalRenderEffects.indexOf(currentEffect)
  if (index - 1 < 0) {
    return globalRenderEffects[globalRenderEffects.length - 1]
  }
  return globalRenderEffects[index - 1]
}

function initShaderProgram(gl: WebGL2RenderingContext, shaderSource: ShaderSource) {
  const shaderProgram = compileShaderProgram2(gl, shaderSource)
  if (!shaderProgram) {
    return null
  }

  return {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
      textureCoords: gl.getAttribLocation(shaderProgram, "aTextureCoord"),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMatrix")!,
      modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix")!,
      textureSampler: gl.getUniformLocation(shaderProgram, "uSampler")!,
      texture2Sampler: gl.getUniformLocation(shaderProgram, "uNoise")!,
      resolution: gl.getUniformLocation(shaderProgram, "iResolution")!,
      time: gl.getUniformLocation(shaderProgram, "iTime")!,
    },
  }
}

function createRenderer(
  gl: WebGL2RenderingContext,
  width: number,
  height: number,
  source: ShaderSource,
  noise: WebGLTexture,
) {
  const programInfo = initShaderProgram(gl, source)!
  const square = createSquareModel(gl, [1.0, 0.0, 0.0, 1.0], null, true)
  const projectionMatrix = mat4.create()
  mat4.ortho(projectionMatrix, 0, width, height, 0, -1.0, 1.0)
  const resolution = vec2.fromValues(width, height)

  const dispose = () => {}
  const render = function (position: vec2, size: vec2, texture: WebGLTexture, time: number) {
    // the divide by two is because the model has extents of -1.0 to 1.0
    const modelViewMatrix = mat4.fromRotationTranslationScale(
      mat4.create(),
      quat.create(),
      [position[0] + size[0] / 2, position[1] + size[1] / 2, 0.0],
      [size[0] / 2, size[1] / 2, 1.0],
    )

    gl.useProgram(programInfo.program)
    setCommonAttributes(gl, square, programInfo)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, square.indices)
    setViewUniformLocations(
      gl,
      programInfo,
      {
        projectionMatrix,
        modelViewMatrix,
        textureIndex: 0,
        time,
      },
      texture,
      noise,
    )
    gl.uniform2fv(programInfo.uniformLocations.resolution, resolution)

    const vertexCount = square.vertexCount
    const type = gl.UNSIGNED_SHORT
    const offset = 0
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset)
  }
  return { render, dispose }
}

function createFrameBuffer(gl: WebGL2RenderingContext, width: number, height: number) {
  const frameBufferTexture = createFrameBufferTexture(gl, width, height)!
  const frameBuffer = gl.createFramebuffer()!
  gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, frameBufferTexture, 0)
  const depthBuffer = gl.createRenderbuffer()
  gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer)
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT32F, width, height)
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer)
  return { frameBuffer, frameBufferTexture }
}

export function createRootRenderer(gl: WebGL2RenderingContext, resources: Resources, sceneRenderer: RendererFunc) {
  const width = gl.canvas.width
  const height = gl.canvas.height

  // This sets up a frame buffer that will render to a texture and attaches a depth buffer to it
  const { frameBuffer, frameBufferTexture } = createFrameBuffer(gl, width, height)

  const createGlobalRenderEffect = (src: ShaderSource) =>
    createRenderer(gl, width, height, src, resources.textures.noise)

  var globalEffects = new Map([
    [RenderEffect.None, createGlobalRenderEffect(resources.shaderSource.simpleTexture)],
    [RenderEffect.CRT, createGlobalRenderEffect(resources.shaderSource.crt)],
    [RenderEffect.AmberCRT, createGlobalRenderEffect(resources.shaderSource.amberCrt)],
    [RenderEffect.GreenCRT, createGlobalRenderEffect(resources.shaderSource.greenCrt)],
    [RenderEffect.VCR, createGlobalRenderEffect(resources.shaderSource.vcr)],
  ])
  let time = 0.0

  const dispose = () => {
    gl.deleteFramebuffer(frameBuffer)
    gl.deleteTexture(frameBufferTexture)
    globalEffects.forEach((ge) => ge.dispose())
  }

  const render = (game: Game, timeDelta: number, effect: RenderEffect) => {
    const projectionMatrix = mat4.create()
    const maxDepth = game.landscape.size * sizes.tile * Math.max(2, game.camera.zoom)
    mat4.ortho(projectionMatrix, -width / 2, width / 2, -height / 2, height / 2, -maxDepth, maxDepth)

    time += timeDelta
    // Now select the frame buffer
    bindBufferAndSetViewport(gl, frameBuffer, width, height)
    setupGl(gl)
    sceneRenderer(projectionMatrix, game, timeDelta)

    // finally target the output buffer and render our texture applying a whole screen post processing effect if
    // required
    bindBufferAndSetViewport(gl, null, width, height)
    globalEffects.get(effect)!.render([0, 0], [width, height], frameBufferTexture, time)
  }

  return { render, dispose }
}
