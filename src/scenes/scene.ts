import { RenderEffect } from "../renderer/rootRenderer"
import { Game } from "../model/game"
import { mat4 } from "gl-matrix"

export interface Scene {
  update: (now: number) => Scene | null
}

export type RendererFunc = (projectionMatrix: mat4, game: Game, timeDelta: number) => void
export type RendererEffectFunc = (game: Game, timeDelta: number, effect: RenderEffect) => void
