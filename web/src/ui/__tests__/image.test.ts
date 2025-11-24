import { resizeImage } from '../../lib/image'

beforeAll(() => {
  // mock 2d context for jsdom
  // @ts-expect-error override getContext for tests
  HTMLCanvasElement.prototype.getContext = () => ({
    drawImage: () => {},
    imageSmoothingQuality: 'high',
  })
})

test('resize produces target dimensions', () => {
  const img = new Image()
  Object.defineProperty(img, 'naturalWidth', { value: 4000 })
  Object.defineProperty(img, 'naturalHeight', { value: 3000 })
  const canvas = resizeImage(img as HTMLImageElement, 1024, 768)
  expect(canvas.width).toBe(1024)
  expect(canvas.height).toBe(768)
})