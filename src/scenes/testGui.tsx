import { createGuiElement } from "../gui/builder"
import { Game } from "../model/game"
import { GuiElement } from "../gui/base"
export function testGui(state: Game): GuiElement {
  const bs = 64

  return (
    <hlayout left={50} top={0}>
      <button padding={8} onClick={() => null} width={bs} height={bs}>
        <texture name="pause" />
      </button>
      <button padding={8} onClick={() => null} width={bs} height={bs}>
        <texture name="singlespeed" />
      </button>
      <button padding={8} onClick={() => null} width={bs} height={bs}>
        <texture name="doublespeed" />
      </button>
      <rect width={4} height={bs} fill={0x00000066} />
      <button padding={8} onClick={() => null} width={bs} height={bs}>
        <texture name="bulldozer" />
      </button>
      <button padding={8} onClick={() => null} width={bs} height={bs}>
        <texture name="zones" />
      </button>
      <button padding={8} onClick={() => null} width={bs} height={bs}>
        <texture name="roads" />
      </button>
    </hlayout>
  )
}
