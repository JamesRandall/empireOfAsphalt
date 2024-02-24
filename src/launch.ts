import { loadResources } from "./resources/resources"
import { createTestLandscapeScene } from "./scenes/testLandscapeScene"

require("./extensions.ts")

async function mount(viewCanvas: HTMLCanvasElement) {
  function setSize() {
    viewCanvas.width = viewCanvas.clientWidth
    viewCanvas.height = viewCanvas.clientHeight
  }

  const urlSearchParams = new URLSearchParams(window.location.search)

  const gl = viewCanvas.getContext("webgl2")
  if (gl === null) {
    console.error("Your browser doesn't support WebGL 2")
    return
  }

  const resources = await loadResources(gl)
  setSize()
  let scene = createTestLandscapeScene(gl, resources)

  let resizeDebounce: ReturnType<typeof setTimeout> | undefined = undefined
  window.addEventListener("resize", (ev) => {
    clearTimeout(resizeDebounce)
    resizeDebounce = setTimeout(() => {
      setSize()
      scene.resize()
    }, 100)
  })

  function render(now: number) {
    scene = scene.update(now) ?? scene
    requestAnimationFrame(render)
  }
  requestAnimationFrame(render)
}

mount(document.getElementById("canvas") as HTMLCanvasElement)
