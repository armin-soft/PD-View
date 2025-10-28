declare module 'better-sqlite3-session-store' {
  import { Store } from 'express-session';
  import Database from 'better-sqlite3';

  interface SqliteStoreOptions {
    client?: Database;
    expired?: {
      clear?: boolean;
      intervalMs?: number;
    };
  }

  class SqliteStore extends Store {
    constructor(options?: SqliteStoreOptions);
  }

  function SqliteStoreConstructor(session: any): typeof SqliteStore;

  export = SqliteStoreConstructor;
}