// Typro.ir - Deterministic & Random Deck Cycler without Consecutive Repeats

/**
 * Modern Fisher-Yates shuffle algorithm that creates a randomized copy of an array.
 * Guarantees that if prevLastItem is provided, the new first item is different from prevLastItem.
 */
export function shuffleDeck<T>(array: T[], prevLastItem?: T): T[] {
  if (!array || array.length <= 1) return array ? [...array] : [];
  const deck = [...array];

  // Perform standard Fisher-Yates
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  // Prevent immediate repetition between deck cycles:
  // If the new first item is identical to the previous cycle's last item, swap it with another index
  if (prevLastItem && deck[0] === prevLastItem && deck.length > 1) {
    const swapIdx = Math.floor(Math.random() * (deck.length - 1)) + 1;
    [deck[0], deck[swapIdx]] = [deck[swapIdx], deck[0]];
  }

  return deck;
}

/**
 * DeckManager: Manages cycling through items randomly.
 * Each item is guaranteed to appear once per cycle.
 * Consecutive identical items are strictly avoided.
 */
export class NonRepeatingDeck<T> {
  private originalPool: T[] = [];
  private shuffledDeck: T[] = [];
  private currentIndex: number = 0;
  private lastItem?: T;

  constructor(pool: T[]) {
    this.resetPool(pool);
  }

  public resetPool(pool: T[]) {
    this.originalPool = [...pool];
    this.shuffledDeck = shuffleDeck(this.originalPool);
    this.currentIndex = 0;
    this.lastItem = undefined;
  }

  public getCurrent(): T {
    if (this.shuffledDeck.length === 0) {
      if (this.originalPool.length === 0) return '' as any;
      this.resetPool(this.originalPool);
    }
    return this.shuffledDeck[this.currentIndex];
  }

  public next(): T {
    if (this.shuffledDeck.length === 0) {
      if (this.originalPool.length === 0) return '' as any;
      this.resetPool(this.originalPool);
      return this.getCurrent();
    }

    this.lastItem = this.shuffledDeck[this.currentIndex];
    this.currentIndex++;

    // If deck cycle exhausted, re-shuffle ensuring no back-to-back duplicate
    if (this.currentIndex >= this.shuffledDeck.length) {
      this.shuffledDeck = shuffleDeck(this.originalPool, this.lastItem);
      this.currentIndex = 0;
    }

    return this.shuffledDeck[this.currentIndex];
  }

  public getDeck(): T[] {
    return this.shuffledDeck;
  }
}
