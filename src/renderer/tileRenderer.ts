import { compileShaderProgram, compileShaderProgram2, loadShader } from "./coregl/shader"
import { glMatrix, mat4, quat, vec3, vec4 } from "gl-matrix"
import { setColorAttribute, setCommonAttributes, setViewUniformLocations } from "./coregl/programInfo"
import { Resources } from "../resources/resources"
import { Game } from "../model/game"
import { createLandscape, createTile } from "../resources/landscapeTile"
import { sizes } from "../constants"

function initOutlineShaderProgram(gl: WebGL2RenderingContext, resources: Resources) {
  const shaderProgram = compileShaderProgram2(gl, resources.shaderSource.uColor)
  if (!shaderProgram) {
    return null
  }

  return {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMatrix")!,
      modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix")!,
      color: gl.getUniformLocation(shaderProgram, "uColor")!,
    },
  }
}

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

    /*gl.useProgram(outlineProgramInfo.program)
    setCommonAttributes(gl, tile, outlineProgramInfo)

    tile.outlines?.forEach((ol) => {
      setViewUniformLocations(gl, outlineProgramInfo, {
        projectionMatrix,
        modelViewMatrix,
        color: ol.color,
      })
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ol.indices)
      gl.drawElements(gl.LINE_STRIP, ol.vertexCount, type, offset)
    })*/
  }
}
