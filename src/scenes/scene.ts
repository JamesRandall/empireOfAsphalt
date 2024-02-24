import { RenderEffect } from "../renderer/rootRenderer"
import { Game } from "../model/game"

export interface Scene {
  update: (now: number) => Scene | null
}

export type RendererFunc = (game: Game, timeDelta: number) => void
export type RendererEffectFunc = (game: Game, timeDelta: number, effect: RenderEffect) => void
