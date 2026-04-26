class ManagerRegistry {
  constructor() {
    this.managers = new Map();
    this.initialized = false;
  }

  registerManager(name, manager) {
    if (this.managers.has(name)) {
      console.warn(`Manager ${name} already registered, overwriting`);
    }
    this.managers.set(name, manager);
    console.log(`Registered manager: ${name}`);
  }

  getManager(name) {
    const manager = this.managers.get(name);
    if (!manager) {
      throw new Error(`Manager ${name} not found in registry`);
    }
    return manager;
  }

  hasManager(name) {
    return this.managers.has(name);
  }

  listManagers() {
    return Array.from(this.managers.keys());
  }

  async clearAllCaches() {
    for (const [name, manager] of this.managers.entries()) {
      if (typeof manager.clearCache === 'function') {
        manager.clearCache();
        console.log(`Cleared cache for manager: ${name}`);
      }
    }
  }

  getStatus() {
    const status = {};
    for (const [name, manager] of this.managers.entries()) {
      status[name] = {
        registered: true,
        hasClearCache: typeof manager.clearCache === 'function',
        methods: Object.getOwnPropertyNames(Object.getPrototypeOf(manager))
          .filter(m => m !== 'constructor' && typeof manager[m] === 'function')
      };
    }
    return status;
  }

  setInitialized() {
    this.initialized = true;
    console.log('ManagerRegistry initialized with', this.managers.size, 'managers');
  }

  isInitialized() {
    return this.initialized;
  }
}

module.exports = ManagerRegistry;
