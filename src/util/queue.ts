export interface Queueable<T> {
  toString: () => string;
  equals: (o: T) => boolean;
}

class QueueItem<T extends Queueable<T>> {
  item: T;
  next: QueueItem<T> | null;
  prev: QueueItem<T> | null;

  constructor(item: T) {
    this.item = item;
    this.next = null;
    this.prev = null;
  }

  enqueue(item: QueueItem<T>) {
    this.next = item;
    item.prev = this;
  }

  detach() {
    if (this.next?.prev) {
      this.next.prev = this.prev;
    }

    if (this.prev?.next) {
      this.prev.next = this.next;
    }

    this.prev = null;
    this.next = null;
  }
}

export class Queue<T extends Queueable<T>> {
  // Doubly linked list + map for quick lookup for removal
  items: Map<string, QueueItem<T>>;
  next: QueueItem<T> | null;
  last: QueueItem<T> | null;

  constructor() {
    this.items = new Map();
    this.next = null;
    this.last = null;
  }

  contains(t: T): boolean {
    return this.items.has(t.toString());
  }

  enqueue(t: T) {
    if (this.contains(t)) return;

    const wrapped = new QueueItem(t);
    this.items.set(t.toString(), wrapped);
    if (!this.next) this.next = wrapped;

    if (this.last) {
      this.last.enqueue(wrapped);
    }
    this.last = wrapped;
  }

  dequeue(): T | null {
    if (!this.next) return null;

    const next = this.next;
    this.next = next.next;
    if (this.last?.item?.equals(next.item)) {
      this.last = null;
    }

    next.detach();
    this.items.delete(next.item.toString());
    return next.item;
  }

  remove(t: T): T | null {
    const wrapped = this.items.get(t.toString());
    if (!wrapped) return null;

    if (this.next?.item?.equals(wrapped.item)) {
      this.next = wrapped.next;
    }

    if (this.last?.item?.equals(wrapped.item)) {
      this.last = wrapped.prev;
    }

    wrapped.detach();
    this.items.delete(t.toString());
    return t;
  }
}
