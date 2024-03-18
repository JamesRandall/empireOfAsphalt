import { compileShaderProgram2 } from "./coregl/shader"
import { glMatrix, mat4, quat, vec3 } from "gl-matrix"
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

    const angleY = glMatrix.toRadian(game.view.rotation)
    // TODO: I'd really like to be able to use the 35.264 angle but I need to figure out how to do
    // the camera rotation such that it stays in place. The current system rotates the camera position
    // by the same angle as the landscape - which works when the rotation around X is 45 degrees as
    // the X and Y components of the position are in the same proportion. When I rotate around X to
    // 35.264 they no longer are so you end up with some offsetting taking place
    const angleX = glMatrix.toRadian(35.264) // 35.264)
    const lightPosition = vec3.rotateY(vec3.create(), game.light.position, [0, 0, 0], angleY)
    vec3.rotateX(lightPosition, lightPosition, [0, 0, 0], angleX)

    const translation = vec3.copy(vec3.create(), game.view.position)
    // this was my attempt to resolve the todo above - doesn't work!
    // I think I need to apply it to the actual position during the rotation and adjust it as the ratio will
    // be varying
    // Though I tried just applying it at certain angles but also didn't seem to work - need to investigate more
    //const yScaleFactor = Math.cos(angleX) / Math.cos(glMatrix.toRadian(45))
    //translation[1] *= yScaleFactor

    const rotation = quat.rotateX(quat.create(), quat.create(), angleX)
    quat.rotateY(rotation, rotation, angleY)

    let worldMatrix = mat4.create()
    mat4.scale(worldMatrix, worldMatrix, [game.view.zoom, game.view.zoom, game.view.zoom])
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
    gl.uniform1f(programInfo.uniformLocations.zoomedTileSize, sizes.tile * game.view.zoom * 1.5)

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
