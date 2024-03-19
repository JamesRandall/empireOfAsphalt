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
      worldMatrix: gl.getUniformLocation(shaderProgram, "uWorldMatrix")!,
      viewMatrix: gl.getUniformLocation(shaderProgram, "uViewMatrix")!,
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
    gl.useProgram(programInfo.program)
    const lightPosition = game.light.position

    // apply zoom
    let worldMatrix = mat4.create()
    //mat4.scale(worldMatrix, worldMatrix, [game.view.zoom, game.view.zoom, game.view.zoom])

    const normalMatrix = mat4.create()
    mat4.invert(normalMatrix, worldMatrix)
    mat4.transpose(normalMatrix, normalMatrix)

    setViewUniformLocations(gl, programInfo, {
      projectionMatrix,
      modelViewMatrix: worldMatrix,
      normalMatrix,
      lightWorldPosition: lightPosition,
    })
    gl.uniform1f(programInfo.uniformLocations.zoomedTileSize, sizes.tile * 1.5)

    game.landscape.chunks.forEach((chunk) => {
      setCommonAttributes(gl, chunk.model, programInfo)
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, chunk.model.indices)

      const vertexCount = chunk.model.vertexCount
      const type = gl.UNSIGNED_SHORT
      const offset = 0
      gl.drawElements(gl.TRIANGLES, vertexCount, type, offset)
    })
  }
}
