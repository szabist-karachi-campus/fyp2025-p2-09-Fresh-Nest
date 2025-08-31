import React from 'react';

import './_hydration';
import { AuthStore } from './auth';
import { UserStore } from './user';
import { ProductStore } from './products';
import { CartStore } from './cart';

export class Stores {
  async hydrate(): Promise<void> {
    for (const key in stores) {
      if (Object.prototype.hasOwnProperty.call(stores, key)) {
        const s = (stores as any)[key] as Stores;

        if (s.hydrate) {
          await s.hydrate();
        }
      }
    }
  }
  auth = new AuthStore();
  user = new UserStore();
  product = new ProductStore();
  cart = new CartStore();
}

export const stores = new Stores();

// Providers and hooks
const StoresContext = React.createContext<Stores>(stores);
export const StoresProvider = ({ children }: any) => (
  <StoresContext.Provider value={stores}>{children}</StoresContext.Provider>
);
export const useStores = (): Stores => React.useContext(StoresContext);
