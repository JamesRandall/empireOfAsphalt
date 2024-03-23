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

  interface ButtonProps extends GuiElementProps {
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

  interface IntrinsicElements {
    hlayout: HLayoutProps
    button: ButtonProps
    image: ImageProps
    rect: RectProps
    container: ContainerProps
  }
}
