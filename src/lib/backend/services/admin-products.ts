import { randomBytes } from "node:crypto";
import type {
  AdminProductInput,
  AdminProductRecord,
  CatalogRepository,
} from "../repositories/interfaces";

export interface AdminProductsDeps {
  catalog: CatalogRepository;
  id?: () => string;
}

export class AdminProductsService {
  private deps: AdminProductsDeps;

  constructor(deps: AdminProductsDeps) {
    this.deps = deps;
  }

  async list(): Promise<AdminProductRecord[]> {
    return this.deps.catalog.listAdminProducts();
  }

  async get(id: string): Promise<AdminProductRecord | null> {
    return this.deps.catalog.getAdminProduct(id);
  }

  async create(input: Omit<AdminProductInput, "id">): Promise<AdminProductRecord> {
    const id = this.deps.id ? this.deps.id() : `prd_${randomBytes(16).toString("hex")}`;
    return this.deps.catalog.createAdminProduct({ ...input, id });
  }

  async update(id: string, patch: Partial<AdminProductInput>): Promise<AdminProductRecord | null> {
    return this.deps.catalog.updateAdminProduct(id, patch);
  }

  async archive(id: string): Promise<AdminProductRecord | null> {
    return this.deps.catalog.updateAdminProduct(id, { archived: true });
  }
}