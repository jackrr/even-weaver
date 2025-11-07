import { describe, expect, test } from "bun:test";
import { Queue } from "./queue";

class Thing<T> {
  value: T;

  constructor(value: T) {
    this.value = value;
  }

  equals(o: Thing<T>) {
    return this.value === o.value;
  }

  toString() {
    return `${this.value}`;
  }
}

describe("Queue", () => {
  test("supports enqueueing and dequeueing", () => {
    const q = new Queue<Thing<string>>();
    q.enqueue(new Thing("a"));
    q.enqueue(new Thing("b"));
    q.enqueue(new Thing("c"));

    expect(q.contains(new Thing("a"))).toBeTrue();

    expect(q.dequeue()?.value).toBe("a");
    expect(q.dequeue()?.value).toBe("b");
    expect(q.dequeue()?.value).toBe("c");
    expect(q.dequeue()).toBeNull();
  });

  test("supports removing from front", () => {
    const q = new Queue<Thing<string>>();
    q.enqueue(new Thing("a"));
    q.enqueue(new Thing("b"));
    q.enqueue(new Thing("c"));

    expect(q.remove(new Thing("a"))?.value).toBe("a");
    expect(q.dequeue()?.value).toBe("b");
    expect(q.dequeue()?.value).toBe("c");
    expect(q.dequeue()).toBeNull();
  });

  test("supports removing from end", () => {
    const q = new Queue<Thing<string>>();
    q.enqueue(new Thing("a"));
    q.enqueue(new Thing("b"));
    q.enqueue(new Thing("c"));

    expect(q.remove(new Thing("c"))?.value).toBe("c");
    expect(q.dequeue()?.value).toBe("a");
    expect(q.dequeue()?.value).toBe("b");
    expect(q.dequeue()).toBeNull();
  });

  test("supports removing from middle", () => {
    const q = new Queue<Thing<string>>();
    q.enqueue(new Thing("a"));
    q.enqueue(new Thing("b"));
    q.enqueue(new Thing("c"));
    q.enqueue(new Thing("d"));

    expect(q.remove(new Thing("b"))?.value).toBe("b");
    expect(q.dequeue()?.value).toBe("a");
    expect(q.dequeue()?.value).toBe("c");
    expect(q.dequeue()?.value).toBe("d");
    expect(q.dequeue()).toBeNull();
  });

  test("supports adding after emptied", () => {
    const q = new Queue<Thing<string>>();
    q.enqueue(new Thing("a"));
    q.enqueue(new Thing("b"));

    expect(q.dequeue()?.value).toBe("a");
    expect(q.dequeue()?.value).toBe("b");
    expect(q.dequeue()).toBeNull();

    q.enqueue(new Thing("c"));

    expect(q.contains(new Thing("c"))).toBeTrue();
    expect(q.dequeue()?.value).toBe("c");
    expect(q.dequeue()).toBeNull();
  });

  test("ignores duplicates", () => {
    const q = new Queue<Thing<string>>();
    q.enqueue(new Thing("a"));
    q.enqueue(new Thing("b"));
    q.enqueue(new Thing("b"));
    q.enqueue(new Thing("b"));
    q.enqueue(new Thing("a"));

    expect(q.dequeue()?.value).toBe("a");
    expect(q.dequeue()?.value).toBe("b");
    expect(q.dequeue()).toBeNull();
  });
});
