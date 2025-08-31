import { makeAutoObservable } from 'mobx';
import { hydrateStore, makePersistable } from 'mobx-persist-store';

// Define or import the IStore and StoreKeysOf interfaces

type StoreKeysOf<T> = keyof T;

interface Items {
  user: string;
  product: string;
  quantity: number;
  status: string;
  total: number;
  vendor: string;
  paymentMethod: string;
}

interface IStore {
  orders: Items[];
}

export class OrderStore implements IStore {
  orders: Items[] = [];

  constructor() {
    makeAutoObservable(this);
    makePersistable(this, {
      name: OrderStore.name,
      properties: ['orders'],
    });
  }

  // Unified set methods
  set<T extends keyof OrderStore>(what: T, value: OrderStore[T]) {
    (this as OrderStore)[what] = value;
  }

  setMany<T extends StoreKeysOf<OrderStore>>(obj: Record<T, OrderStore[T]>) {
    for (const [k, v] of Object.entries(obj)) {
      this.set(k as T, v as OrderStore[T]);
    }
  }

  // Hydration
  hydrate = async (): Promise<void> => {
    await hydrateStore(this);
  };
}
