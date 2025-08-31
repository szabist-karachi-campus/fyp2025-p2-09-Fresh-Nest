import { makeAutoObservable } from 'mobx';
import { hydrateStore, makePersistable } from 'mobx-persist-store';

type StoreKeysOf<T> = keyof T;
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
  image?: string;
}
interface IStore {
  cartItems: CartItem[];
  set<T extends keyof CartStore>(what: T, value: CartStore[T]): void;
  setMany<T extends StoreKeysOf<CartStore>>(obj: Record<T, CartStore[T]>): void;
  hydrate(): Promise<void>;
}

export class CartStore implements IStore {
  cartItems: CartItem[] = [];
  constructor() {
    makeAutoObservable(this);
    // /
    makePersistable(this, {
      name: CartStore.name,
      properties: ['cartItems'],
    });
  }
  addToCart(item: CartItem) {
    const existingItem = this.cartItems.find(
      (cartItem) => cartItem.id === item.id,
    );

    if (existingItem) {
      // Update quantity and total for an existing item
      existingItem.quantity += item.quantity;
      existingItem.total += item.total;
    } else {
      // Add new item to the cart
      this.cartItems.push(item);
    }
  }

  removeFromCart(itemId: string) {
    this.cartItems = this.cartItems.filter(
      (cartItem) => cartItem.id !== itemId,
    );
  }

  // Update item quantity in the cart
  updateItemQuantity(itemId: string, newQuantity: number) {
    const item = this.cartItems.find((cartItem) => cartItem.id === itemId);

    if (item && newQuantity > 0) {
      item.quantity = newQuantity;
      item.total = item.price * newQuantity;
    } else if (item && newQuantity === 0) {
      this.removeFromCart(itemId);
    }
  }

  // Clear the cart
  clearCart() {
    this.cartItems = [];
  }

  // Get total price of all items in the cart
  totalPrice(): number {
    return this.cartItems.reduce((total, item) => total + item.total, 0);
  }
  // Unified set methods
  set<T extends keyof CartStore>(what: T, value: CartStore[T]) {
    (this as CartStore)[what] = value;
  }
  setMany<T extends StoreKeysOf<CartStore>>(obj: Record<T, CartStore[T]>) {
    for (const [k, v] of Object.entries(obj)) {
      this.set(k as T, v as CartStore[T]);
    }
  }

  // Hydration
  hydrate = async (): Promise<void> => {
    await hydrateStore(this);
  };
}
