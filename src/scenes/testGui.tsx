import { createGuiElement } from "../gui/builder"
import { Game } from "../model/game"
import { GuiElement, SizeToFit } from "../gui/base"

export function testGui(state: Game): GuiElement {
  const bs = 48

  return (
    <container>
      <hlayout horizontalAlignment="middle">
        <button padding={8} onClick={(b) => console.log(1)} width={bs} height={bs}>
          <image name="pause" sizeToFitParent={SizeToFit.WidthAndHeight} />
        </button>
        <button padding={8} onClick={(b) => console.log(2)} width={bs} height={bs}>
          <image name="singlespeed" sizeToFitParent={SizeToFit.WidthAndHeight} />
        </button>
        <button padding={8} onClick={() => null} width={bs} height={bs}>
          <image name="doublespeed" sizeToFitParent={SizeToFit.WidthAndHeight} />
        </button>
        <rect width={4} height={bs} fill={0xaa000033} />
        <button padding={8} onClick={() => null} width={bs} height={bs}>
          <image name="bulldozer" sizeToFitParent={SizeToFit.WidthAndHeight} />
        </button>
        <button padding={8} onClick={() => null} width={bs} height={bs}>
          <image name="zones" sizeToFitParent={SizeToFit.WidthAndHeight} />
        </button>
        <button padding={8} onClick={() => null} width={bs} height={bs}>
          <image name="road" sizeToFitParent={SizeToFit.WidthAndHeight} />
        </button>
      </hlayout>
    </container>
  )
}
