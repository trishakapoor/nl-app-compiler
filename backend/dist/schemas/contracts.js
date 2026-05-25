"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppConfigSchema = exports.UIComponentSchema = exports.APIEndpointSchema = exports.DBSchema = exports.SystemDesignSchema = exports.ArchitectureEntitySchema = exports.EntityPropertySchema = exports.IntentSchema = void 0;
const zod_1 = require("zod");
exports.IntentSchema = zod_1.z.object({
    rawFeatures: zod_1.z.array(zod_1.z.string()).describe("Core components and functional requests"),
    userRoles: zod_1.z.array(zod_1.z.string()).describe("User categories or access scopes identified"),
    integrations: zod_1.z.array(zod_1.z.string()).describe("External integrations e.g. Stripe, Sendgrid"),
    ambiguities: zod_1.z.array(zod_1.z.string()).describe("Unclear parameters requiring compiler assumptions")
});
exports.EntityPropertySchema = zod_1.z.object({
    name: zod_1.z.string(),
    type: zod_1.z.enum(['string', 'number', 'boolean', 'datetime']),
    required: zod_1.z.boolean()
});
exports.ArchitectureEntitySchema = zod_1.z.object({
    name: zod_1.z.string(),
    properties: zod_1.z.array(exports.EntityPropertySchema),
    relationships: zod_1.z.array(zod_1.z.string()).describe("Relations e.g., User has many contacts")
});
exports.SystemDesignSchema = zod_1.z.object({
    entities: zod_1.z.array(exports.ArchitectureEntitySchema),
    accessControlMatrix: zod_1.z.record(zod_1.z.string(), zod_1.z.array(zod_1.z.string())).describe("Role mapped to allowed operations")
});
exports.DBSchema = zod_1.z.object({
    tables: zod_1.z.record(zod_1.z.string(), zod_1.z.record(zod_1.z.string(), zod_1.z.string())),
    foreignKeys: zod_1.z.array(zod_1.z.string())
});
exports.APIEndpointSchema = zod_1.z.object({
    path: zod_1.z.string(),
    method: zod_1.z.enum(['GET', 'POST', 'PUT', 'DELETE']),
    requiredRole: zod_1.z.string(),
    payloadSchema: zod_1.z.record(zod_1.z.string(), zod_1.z.string()),
    responseSchema: zod_1.z.record(zod_1.z.string(), zod_1.z.string())
});
exports.UIComponentSchema = zod_1.z.object({
    componentId: zod_1.z.string(),
    type: zod_1.z.enum(['Form', 'Table', 'DashboardChart', 'Navbar', 'AuthView']),
    bindApiEndpoint: zod_1.z.string().describe("Must exactly match standard 'METHOD /path' format from API schema"),
    visibleToRoles: zod_1.z.array(zod_1.z.string())
});
exports.AppConfigSchema = zod_1.z.object({
    appName: zod_1.z.string(),
    databaseSchema: exports.DBSchema,
    apiEndpoints: zod_1.z.array(exports.APIEndpointSchema),
    uiLayout: zod_1.z.array(exports.UIComponentSchema),
    assumptionsMade: zod_1.z.array(zod_1.z.string())
});
