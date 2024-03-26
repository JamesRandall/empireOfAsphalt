import { loadTexture, Texture } from "./texture"
import { createSoundEffects, SoundEffects } from "../audio"
import { ShaderSource } from "../renderer/coregl/shader"

export interface Resources {
  textures: {
    grass: Texture
    dirt: Texture
    font: Texture
    noise: Texture
  }
  guiTextures: {
    [id: string]: Texture
  }
  shaderSource: {
    uColor: ShaderSource
    text: ShaderSource
    simpleTexture: ShaderSource
    crt: ShaderSource
    amberCrt: ShaderSource
    greenCrt: ShaderSource
    vcr: ShaderSource
    motionBlur: ShaderSource
    directional: ShaderSource
    objectPicking: ShaderSource
  }
  soundEffects: SoundEffects
}

async function loadShaderSource(name: string) {
  const fragResponse = await fetch(`shaders/${name}.frag`)
  const vertResponse = await fetch(`shaders/${name}.vert`)
  return {
    frag: await fragResponse.text(),
    vert: await vertResponse.text(),
  }
}

export async function loadResources(gl: WebGL2RenderingContext): Promise<Resources> {
  const shaderNames = [
    "uColor",
    "text",
    "simpleTexture",
    "crt",
    "ambercrt",
    "greencrt",
    "vcr",
    "motionblur",
    "directional",
    "objectPicking",
  ]
  const guiTextureNames = [
    "road",
    "bulldozer",
    "pause",
    "singlespeed",
    "doublespeed",
    "zones",
    "xmark",
    "lightResidentialZone",
    "denseResidentialZone",
    "lightCommercialZone",
    "denseCommercialZone",
    "lightIndustrialZone",
    "denseIndustrialZone",
    "lowerTerrain",
    "raiseTerrain",
    "dezone",
    "clearTerrain",
  ]
  const loadedShaders = await Promise.all(shaderNames.map((sn) => loadShaderSource(sn)))
  const namedShaders = new Map<string, ShaderSource>(shaderNames.map((sn, index) => [sn, loadedShaders[index]]))

  const textureNames = ["grass", "dirt", "font", "noise"]
  const loadedTextures = await Promise.all(textureNames.map((tn) => loadTexture(gl, `./${tn}.png`)))
  const textures = new Map<string, Texture>(loadedTextures.map((t, i) => [textureNames[i], t]))
  let guiTextureObj: { [id: string]: Texture } = {}

  const guiTextures = await Promise.all(guiTextureNames.map((tn) => loadTexture(gl, `./gui/${tn}.png`)))
  guiTextures.forEach((t, i) => (guiTextureObj[guiTextureNames[i]] = t))

  return {
    textures: {
      grass: textures.get("grass")!,
      dirt: textures.get("dirt")!,
      font: textures.get("font")!,
      noise: textures.get("noise")!,
    },
    guiTextures: guiTextureObj,
    shaderSource: {
      uColor: namedShaders.get("uColor")!,
      text: namedShaders.get("text")!,
      simpleTexture: namedShaders.get("simpleTexture")!,
      crt: namedShaders.get("crt")!,
      amberCrt: namedShaders.get("ambercrt")!,
      greenCrt: namedShaders.get("greencrt")!,
      vcr: namedShaders.get("vcr")!,
      motionBlur: namedShaders.get("motionblur")!,
      directional: namedShaders.get("directional")!,
      objectPicking: namedShaders.get("objectPicking")!,
    },
    soundEffects: await createSoundEffects(),
  }
}
