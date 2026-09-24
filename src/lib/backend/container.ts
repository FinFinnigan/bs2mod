// Composition root — assembles the backend from configuration. This is the ONLY
// place concrete repositories/adapters are chosen. Application services depend on
// interfaces, so Neon/Postgres is replaceable at the boundary (ARCHITECTURE.md).

import { bootstrapProviders, type BackendConfig } from "./config/bootstrap";
import { PaymentService } from "./payments/service";
import { PaymentProviderRegistry, paymentRegistry } from "./payments/registry";
import { DrizzleCatalogRepository } from "./repositories/drizzle/catalog";
import { DrizzleCartRepository } from "./repositories/drizzle/cart";
import { DrizzleOrderRepository } from "./repositories/drizzle/order";
import { DrizzlePaymentStore } from "./repositories/drizzle/payment";
import { DrizzleUserStore, DrizzleSessionStore } from "./repositories/drizzle/auth";
import { DrizzleSettingsRepository } from "./repositories/drizzle/settings";
import { MemoryPaymentStore } from "./repositories/memory/payment-store";
import { MemoryUserStore, MemorySessionStore } from "./repositories/memory/auth";
import { MemorySettingsRepository } from "./repositories/memory/settings";
import { hasDatabase } from "./db/client";
import { CheckoutService } from "./services/checkout";
import { OrderService } from "./orders/service";
import { AuthService } from "./auth/service";
import type {
  CatalogRepository,
  CartRepository,
  OrderRepository,
  SettingsRepository,
} from "./repositories/interfaces";
import type { UserStore, SessionStore } from "./auth/interfaces";

export interface AppContainer {
  config: BackendConfig;
  catalog: CatalogRepository;
  cart: CartRepository;
  orders: OrderRepository;
  payments: PaymentService;
  registry: PaymentProviderRegistry;
  checkout: CheckoutService;
  ordersService?: OrderService;
  users: UserStore;
  sessions: SessionStore;
  auth: AuthService;
  settings: SettingsRepository;
}

let _container: AppContainer | null = null;

export function getApp(): AppContainer {
  if (_container) return _container;

  const config = bootstrapProviders();
  const useDb = hasDatabase();

  const catalog = useDb ? new DrizzleCatalogRepository() : noopCatalog();
  const cart = useDb ? new DrizzleCartRepository() : noopCart();
  const orders = useDb ? new DrizzleOrderRepository() : noopOrders();
  const paymentStore = useDb ? new DrizzlePaymentStore() : new MemoryPaymentStore();
  const users = useDb ? new DrizzleUserStore() : new MemoryUserStore();
  const sessions = useDb ? new DrizzleSessionStore() : new MemorySessionStore();
  const settings = useDb ? new DrizzleSettingsRepository() : new MemorySettingsRepository();

  const payments = new PaymentService({ registry: paymentRegistry, store: paymentStore });
  const checkout = new CheckoutService({
    cartRepo: cart,
    orderRepo: orders,
    payments,
    shipping: config.shipping,
    publicUrl: config.publicUrl,
  });
  const ordersService = new OrderService({ orderRepo: orders, payments });
  const auth = new AuthService({ users, sessions });

  _container = {
    config,
    catalog,
    cart,
    orders,
    payments,
    registry: paymentRegistry,
    checkout,
    ordersService,
    users,
    sessions,
    auth,
    settings,
  };
  return _container;
}

// Memory fallbacks (no DATABASE_URL): throw a clear error so the live layer is
// never silently used without a database.
function noopCatalog(): CatalogRepository {
  throw new Error("No catalog repository: DATABASE_URL is not set.");
}
function noopCart(): CartRepository {
  throw new Error("No cart repository: DATABASE_URL is not set.");
}
function noopOrders(): OrderRepository {
  throw new Error("No order repository: DATABASE_URL is not set.");
}
