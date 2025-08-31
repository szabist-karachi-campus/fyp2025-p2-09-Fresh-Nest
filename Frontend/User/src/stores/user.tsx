import { AxiosResponse } from 'axios';
import { makeAutoObservable } from 'mobx';
import { hydrateStore, makePersistable } from 'mobx-persist-store';

// Define or import the IStore and StoreKeysOf interfaces

type StoreKeysOf<T> = keyof T;
interface IStore {
  name: string;
  email: string;
  phone: string;
  verified: boolean;
  address: string;
  city: string;
  state: string;
  postalcode: string;
}

export class UserStore implements IStore {
  setAddress(data: AxiosResponse<any, any>) {
    throw new Error('Method not implemented.');
  }
  name: string = '';
  email: string = '';
  phone: string = '';
  verified: boolean = false;
  address: string = '';
  city: string = '';
  state: string = '';
  postalcode: string = '';

  constructor() {
    makeAutoObservable(this);
    // /
    makePersistable(this, {
      name: UserStore.name,
      properties: [
        'name',
        'email',
        'phone',
        'verified',
        'address',
        'city',
        'state',
        'postalcode',
      ],
    });
  }

  // Unified set methods
  set<T extends keyof UserStore>(what: T, value: UserStore[T]) {
    (this as UserStore)[what] = value;
  }
  setMany<T extends StoreKeysOf<UserStore>>(obj: Record<T, UserStore[T]>) {
    for (const [k, v] of Object.entries(obj)) {
      this.set(k as T, v as UserStore[T]);
    }
  }

  // Hydration
  hydrate = async (): Promise<void> => {
    await hydrateStore(this);
  };

  // Clear the address
  clearAddress() {
    this.address = '';
    this.city = '';
    this.state = '';
    this.postalcode = '';
  }
}
