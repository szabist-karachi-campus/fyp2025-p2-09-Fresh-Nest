import { makeAutoObservable } from 'mobx';
import { hydrateStore, makePersistable } from 'mobx-persist-store';

// Define or import the IStore and StoreKeysOf interfaces

type StoreKeysOf<T> = keyof T;
interface IStore {
  products: Product[];
}

export class ProductStore implements IStore {
  products: Product[] = [];

  constructor() {
    makeAutoObservable(this);
    // /
    makePersistable(this, {
      name: ProductStore.name,
      properties: ['products'],
    });
  }

  // Unified set methods
  set<T extends keyof ProductStore>(what: T, value: ProductStore[T]) {
    (this as ProductStore)[what] = value;
  }
  setMany<T extends StoreKeysOf<ProductStore>>(
    obj: Record<T, ProductStore[T]>,
  ) {
    for (const [k, v] of Object.entries(obj)) {
      this.set(k as T, v as ProductStore[T]);
    }
  }

  // Hydration
  hydrate = async (): Promise<void> => {
    await hydrateStore(this);
  };
}
