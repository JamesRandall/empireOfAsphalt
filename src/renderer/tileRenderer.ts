import { compileShaderProgram2 } from "./coregl/shader"
import { mat4 } from "gl-matrix"
import { setCommonAttributes, setViewUniformLocations } from "./coregl/programInfo"
import { Resources } from "../resources/resources"
import { Game } from "../model/game"
import { sizes } from "../constants"

function initShaderProgram(gl: WebGL2RenderingContext, resources: Resources) {
  const shaderProgram = compileShaderProgram2(gl, resources.shaderSource.directional)
  if (!shaderProgram) {
    return null
  }

  return {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
      vertexNormal: gl.getAttribLocation(shaderProgram, "aVertexNormal"),
      vertexColor: gl.getAttribLocation(shaderProgram, "aVertexColor"),
      textureCoords: gl.getAttribLocation(shaderProgram, "aTextureCoord"),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMatrix")!,
      modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix")!,
      normalMatrix: gl.getUniformLocation(shaderProgram, "uNormalMatrix")!,
      lightWorldPosition: gl.getUniformLocation(shaderProgram, "uLightWorldPosition")!,
      zoomedTileSize: gl.getUniformLocation(shaderProgram, "uZoomedTileSize"),
    },
  }
}

export function createTileRenderer(gl: WebGL2RenderingContext, resources: Resources) {
  const programInfo = initShaderProgram(gl, resources)!

  return function (projectionMatrix: mat4, game: Game) {
    const tile = game.terrain.model
    if (!tile) return

    gl.useProgram(programInfo.program)

    const modelViewMatrix = mat4.create()
    mat4.scale(modelViewMatrix, modelViewMatrix, [game.camera.zoom, game.camera.zoom, game.camera.zoom])

    const normalMatrix = mat4.create()
    mat4.invert(normalMatrix, modelViewMatrix)
    mat4.transpose(normalMatrix, normalMatrix)

    setCommonAttributes(gl, tile, programInfo)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, tile.indices)
    setViewUniformLocations(gl, programInfo, {
      projectionMatrix,
      modelViewMatrix,
      normalMatrix,
      lightWorldPosition: game.light.position,
    })
    gl.uniform1f(programInfo.uniformLocations.zoomedTileSize, sizes.tile * game.camera.zoom * 1.5)
    const vertexCount = tile.vertexCount
    const type = gl.UNSIGNED_SHORT
    const offset = 0
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset)
  }
}
