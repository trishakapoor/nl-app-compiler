// ─── Stage 1: Intent ─────────────────────────────────────────────────────────
export interface IntentOutput {
  appName: string;
  appType: string;
  coreFeatures: string[];
  entities: string[];
  roles: string[];
  hasPayments: boolean;
  hasAnalytics: boolean;
  authRequired: boolean;
  ambiguities: string[];
  assumptions: string[];
}
 
// ─── Stage 2: Design ─────────────────────────────────────────────────────────
export interface DesignOutput {
  pages: {
    name: string;
    route: string;
    accessRoles: string[];
    components: string[];
  }[];
  apiGroups: {
    resource: string;
    endpoints: { method: string; path: string; auth: boolean }[];
  }[];
  dbTables: {
    name: string;
    fields: { name: string; type: string; required: boolean }[];
    relations: string[];
  }[];
  authStrategy: string;
  paymentProvider: string | null;
}
 
// ─── Stage 3/4: Full App Config ───────────────────────────────────────────────
export interface UIComponent {
  type: string;
  id: string;
  props: Record<string, unknown>;
  boundTo: string | null;
}
 
export interface UIPage {
  id: string;
  title: string;
  route: string;
  layout: string;
  accessRoles: string[];
  components: UIComponent[];
}
 
export interface APIEndpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  auth: boolean;
  roles: string[];
  requestBody: Record<string, unknown> | null;
  responseSchema: Record<string, unknown>;
}
 
export interface DBField {
  name: string;
  type: string;
  required: boolean;
  unique: boolean;
}
 
export interface DBRelation {
  type: string;
  targetTable: string;
  foreignKey: string;
}
 
export interface DBTable {
  name: string;
  fields: DBField[];
  indexes: string[];
  relations: DBRelation[];
}
 
export interface PaymentPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  features: string[];
}
 
export interface AppConfigOutput {
  ui: {
    pages: UIPage[];
    theme: { primaryColor: string; fontFamily: string };
  };
  api: {
    baseUrl: string;
    endpoints: APIEndpoint[];
  };
  database: {
    dialect: string;
    tables: DBTable[];
  };
  auth: {
    strategy: string;
    roles: string[];
    permissions: Record<string, string[]>;
  };
  payments: {
    enabled: boolean;
    provider: string | null;
    plans: PaymentPlan[];
  };
}
 