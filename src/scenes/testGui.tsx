import { createGuiElement } from "../gui/builder"
import { Game } from "../model/game"
import { GuiElement } from "../gui/base"

export function testGui(state: Game): GuiElement {
  const bs = 48

  return (
    <hlayout horizontalAlignment="middle">
      <button padding={8} onClick={(b) => console.log(1)} width={bs} height={bs}>
        <image name="pause" sizeToFitParent="widthAndHeight" />
      </button>
      <button padding={8} onClick={(b) => console.log(2)} width={bs} height={bs}>
        <image name="singlespeed" sizeToFitParent="widthAndHeight" />
      </button>
      <button padding={8} onClick={() => null} width={bs} height={bs}>
        <image name="doublespeed" sizeToFitParent="widthAndHeight" />
      </button>
      <rect width={4} height={bs} fill={0xaa000033} />
      <button padding={8} onClick={() => null} width={bs} height={bs}>
        <image name="bulldozer" sizeToFitParent="widthAndHeight" />
      </button>
      <button padding={8} onClick={() => null} width={bs} height={bs}>
        <image name="zones" sizeToFitParent="widthAndHeight" />
      </button>
      <button padding={8} onClick={() => null} width={bs} height={bs}>
        <image name="road" sizeToFitParent="widthAndHeight" />
      </button>
    </hlayout>
  )
}
