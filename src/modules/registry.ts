import type { DatabaseDefinition } from "../schema/database.js";
import { crmModule } from "./crm/index.js";
import { portfolioModule } from "./portfolio/index.js";
import { projectsModule } from "./projects/index.js";

export interface RegisteredModule<
  TDefinition extends DatabaseDefinition = DatabaseDefinition,
> {
  readonly key: string;
  readonly displayName: string;
  readonly databaseDefinition: TDefinition;
}

const registeredModuleOrder: string[] = [];
const registeredModulesByKey = new Map<string, RegisteredModule>();

function ensureValidModule(module: RegisteredModule): void {
  if (!module.key.trim()) {
    throw new Error("Module registration requires a non-empty key.");
  }

  if (!module.displayName.trim()) {
    throw new Error(`Module "${module.key}" requires a display name.`);
  }
}

export function registerModule(module: RegisteredModule): void {
  ensureValidModule(module);

  if (registeredModulesByKey.has(module.key)) {
    throw new Error(`Module "${module.key}" is already registered.`);
  }

  registeredModulesByKey.set(module.key, module);
  registeredModuleOrder.push(module.key);
}

export function getRegisteredModules(): readonly RegisteredModule[] {
  return registeredModuleOrder.map((key) => {
    const module = registeredModulesByKey.get(key);
    if (!module) {
      throw new Error(`Module "${key}" is missing from registry state.`);
    }

    return module;
  });
}

export function getModule(key: string): RegisteredModule | undefined {
  return registeredModulesByKey.get(key);
}

export function hasModule(key: string): boolean {
  return registeredModulesByKey.has(key);
}

registerModule(projectsModule);
registerModule(crmModule);
registerModule(portfolioModule);
