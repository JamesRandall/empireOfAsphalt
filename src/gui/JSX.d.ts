declare namespace JSX {
  interface GuiElementProps {
    left?: number
    top?: number
    width?: number
    height?: number
    padding?: number
    sizeToFitParent?: SizeToFit
  }
  interface HLayoutProps extends GuiElementProps {
    horizontalAlignment?: HorizontalAlignment
  }

  interface ChromeProps {
    lightChrome?: number
    midChrome?: number
    darkChrome?: number
  }

  interface ButtonProps extends GuiElementProps, ChromeProps {
    onMouseDown?: (button: MouseButton, position: { x: number; y: number }) => void
    onMouseUp?: (button: MouseButton, position: { x: number; y: number }) => void
    onClick?: (button: MouseButton) => void
  }

  interface ImageProps extends GuiElementProps {
    name?: string
  }

  interface ShapeProps extends GuiElementProps {
    fill?: number
    stroke?: number
  }

  interface RectProps extends ShapeProps {}

  interface ContainerProps extends GuiElementProps {}

  interface WindowProps extends GuiElementProps, ChromeProps {
    title: string
  }

  interface IntrinsicElements {
    hlayout: HLayoutProps
    button: ButtonProps
    image: ImageProps
    rect: RectProps
    container: ContainerProps
    window: WindowProps
    raisedbevel: ChromeProps
    bevel: ChromeProps
  }
}
