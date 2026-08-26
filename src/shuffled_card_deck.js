'use strict';

export default class ShuffledCardDeck {
  constructor(cards = []) {
    this._cards = cards.slice();
  }

  next() {
    if (this._cards.length === 0) return { value: undefined, done: true };
    const i = Math.floor(Math.random() * this._cards.length);
    return { value: this._cards.splice(i, 1)[0], done: false };
  }

  [Symbol.iterator]() { return this; }

  draw(count = 1) {
    if (count <= 0) return [];
    return Array.from({ length: count })
      .map(() => this.next())
      .map(r => r.value)
      .filter(v => v !== undefined);
  }

  remaining() { return this._cards.slice(); }
  size() { return this._cards.length; }
}
