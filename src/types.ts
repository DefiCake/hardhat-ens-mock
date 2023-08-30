export type EnsMockConfig = {
  enabled?: boolean;
  ensOwnerAccount?: number;
};

export interface RPC {
  send: (method: string, params?: any[]) => Promise<any>;
}
