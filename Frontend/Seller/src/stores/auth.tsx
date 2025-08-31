import { makeAutoObservable } from 'mobx';
import { hydrateStore, makePersistable } from 'mobx-persist-store';

// Define or import the IStore and StoreKeysOf interfaces

type StoreKeysOf<T> = keyof T;
interface IStore {
  token: string;
  expiresAt: string;
  deviceToken: string;

  set<T extends keyof AuthStore>(what: T, value: AuthStore[T]): void;
  setMany<T extends StoreKeysOf<AuthStore>>(obj: Record<T, AuthStore[T]>): void;
  hydrate(): Promise<void>;
}

export class AuthStore implements IStore {
  token: string = '';
  expiresAt: string = '';
  isSuperAdmin: boolean = false;
  deviceToken: string = '';

  constructor() {
    makeAutoObservable(this);
    // /
    makePersistable(this, {
      name: AuthStore.name,
      properties: ['token', 'expiresAt', 'isSuperAdmin', 'deviceToken'],
    });
  }

  // Unified set methods
  set<T extends keyof AuthStore>(what: T, value: AuthStore[T]) {
    (this as AuthStore)[what] = value;
  }
  setMany<T extends StoreKeysOf<AuthStore>>(obj: Record<T, AuthStore[T]>) {
    for (const [k, v] of Object.entries(obj)) {
      this.set(k as T, v as AuthStore[T]);
    }
  }

  // Hydration
  hydrate = async (): Promise<void> => {
    await hydrateStore(this);
  };
}
