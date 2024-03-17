import { compileShaderProgram2 } from "./coregl/shader"
import { glMatrix, mat4, quat, vec3 } from "gl-matrix"
import { setCommonAttributes, setViewUniformLocations } from "./coregl/programInfo"
import { Resources } from "../resources/resources"
import { Game, RotationEnum } from "../model/game"
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

function rotationFromGame(game: Game) {
  switch (game.camera.rotation) {
    case RotationEnum.East:
      return 90
    case RotationEnum.South:
      return 180
    case RotationEnum.West:
      return 270
    case RotationEnum.North:
    default:
      return 0
  }
}

export function createTileRenderer(gl: WebGL2RenderingContext, resources: Resources) {
  const programInfo = initShaderProgram(gl, resources)!

  return function (projectionMatrix: mat4, game: Game) {
    gl.useProgram(programInfo.program)

    const angleY = glMatrix.toRadian(45 + rotationFromGame(game))
    const angleX = glMatrix.toRadian(45) //35.264)
    const lightPosition = vec3.rotateY(vec3.create(), game.light.position, [0, 0, 0], angleY)
    vec3.rotateX(lightPosition, lightPosition, [0, 0, 0], angleX)

    const translation = vec3.copy(vec3.create(), game.camera.position)
    const rotation = quat.rotateX(quat.create(), quat.create(), angleX)
    quat.rotateY(rotation, rotation, angleY)

    let worldMatrix = mat4.create()
    mat4.scale(worldMatrix, worldMatrix, [game.camera.zoom, game.camera.zoom, game.camera.zoom])
    mat4.rotateX(worldMatrix, worldMatrix, angleX)
    mat4.translate(worldMatrix, worldMatrix, translation)
    mat4.rotateY(worldMatrix, worldMatrix, angleY)

    const normalMatrix = mat4.create()
    mat4.invert(normalMatrix, worldMatrix)
    mat4.transpose(normalMatrix, normalMatrix)

    setViewUniformLocations(gl, programInfo, {
      projectionMatrix,
      modelViewMatrix: worldMatrix,
      normalMatrix,
      lightWorldPosition: lightPosition,
    })
    gl.uniform1f(programInfo.uniformLocations.zoomedTileSize, sizes.tile * game.camera.zoom * 1.5)

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
