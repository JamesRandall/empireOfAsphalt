import { createGuiElement } from "../gui/builder"
import { Game } from "../model/game"
import { GuiElement, HorizontalAlignment, SizeToFit } from "../gui/base"
import { constants } from "../gui/constants"

export function testGui(state: Game): GuiElement {
  const bs = 48

  return (
    <container>
      <hlayout horizontalAlignment="middle" sizeToFitParent={SizeToFit.Width}>
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
      <window
        title="Zoning"
        left={500}
        top={50}
        width={bs * 6}
        height={bs + constants.window.titleBarHeight}
        padding={0}
      >
        <hlayout horizontalAlignment={HorizontalAlignment.Left} sizeToFitParent={SizeToFit.Width}>
          <button
            padding={8}
            width={bs}
            height={bs}
            lightChrome={constants.lightGreen}
            midChrome={constants.midGreen}
            darkChrome={constants.darkGreen}
          >
            <image name="lightresidential" sizeToFitParent={SizeToFit.WidthAndHeight} />
          </button>
          <button
            padding={8}
            width={bs}
            height={bs}
            lightChrome={constants.lightGreen}
            midChrome={constants.midGreen}
            darkChrome={constants.darkGreen}
          >
            <image name="denseresidential" sizeToFitParent={SizeToFit.WidthAndHeight} />
          </button>
          <button
            padding={8}
            width={bs}
            height={bs}
            lightChrome={constants.lightGreen}
            midChrome={constants.midGreen}
            darkChrome={constants.darkGreen}
          >
            <image name="lightcommercial" sizeToFitParent={SizeToFit.WidthAndHeight} />
          </button>
          <button
            padding={8}
            width={bs}
            height={bs}
            lightChrome={constants.lightGreen}
            midChrome={constants.midGreen}
            darkChrome={constants.darkGreen}
          >
            <image name="densecommercial" sizeToFitParent={SizeToFit.WidthAndHeight} />
          </button>
          <button
            padding={8}
            width={bs}
            height={bs}
            lightChrome={constants.lightGreen}
            midChrome={constants.midGreen}
            darkChrome={constants.darkGreen}
          >
            <image name="lightindustrial" sizeToFitParent={SizeToFit.WidthAndHeight} />
          </button>
          <button
            padding={8}
            width={bs}
            height={bs}
            lightChrome={constants.lightGreen}
            midChrome={constants.midGreen}
            darkChrome={constants.darkGreen}
          >
            <image name="denseindustrial" sizeToFitParent={SizeToFit.WidthAndHeight} />
          </button>
        </hlayout>
      </window>
    </container>
  )
}
