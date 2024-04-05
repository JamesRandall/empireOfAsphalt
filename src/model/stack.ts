export class Stack<T> {
  private items: T[] = []

  push(item: T) {
    this.items.push(item)
  }

  peek() {
    return this.items[this.items.length - 1]
  }

  pop() {
    return this.items.pop()
  }

  get size() {
    return this.items.length
  }
}
