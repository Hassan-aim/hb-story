/* Tiny synchronous event bus shared between DOM and WebGL layers. */

type Handler<T = unknown> = (payload: T) => void

const listeners = new Map<string, Set<Handler<any>>>()

export const bus = {
  on<T = unknown>(name: string, fn: Handler<T>): () => void {
    const set = listeners.get(name) ?? new Set<Handler<any>>()
    set.add(fn as Handler<any>)
    listeners.set(name, set)
    return () => {
      set.delete(fn as Handler<any>)
    }
  },
  emit<T = unknown>(name: string, payload?: T): void {
    const set = listeners.get(name)
    if (!set) return
    set.forEach((fn) => fn(payload))
  },
  clear(name?: string): void {
    if (name) listeners.delete(name)
    else listeners.clear()
  },
}