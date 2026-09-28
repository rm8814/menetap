/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ResendOTPPasswordReset from "../ResendOTPPasswordReset.js";
import type * as audit from "../audit.js";
import type * as auth from "../auth.js";
import type * as authorization from "../authorization.js";
import type * as availability from "../availability.js";
import type * as bookingStatus from "../bookingStatus.js";
import type * as bookingValidation from "../bookingValidation.js";
import type * as bookings from "../bookings.js";
import type * as childPolicy from "../childPolicy.js";
import type * as commissions from "../commissions.js";
import type * as crons from "../crons.js";
import type * as csrf from "../csrf.js";
import type * as health from "../health.js";
import type * as http from "../http.js";
import type * as inventoryHolds from "../inventoryHolds.js";
import type * as notificationTemplates from "../notificationTemplates.js";
import type * as notifications from "../notifications.js";
import type * as partnerAdmin from "../partnerAdmin.js";
import type * as partnerApplications from "../partnerApplications.js";
import type * as partnerDashboard from "../partnerDashboard.js";
import type * as partnerOnboarding from "../partnerOnboarding.js";
import type * as partnerOperations from "../partnerOperations.js";
import type * as partnerProfiles from "../partnerProfiles.js";
import type * as payments from "../payments.js";
import type * as payoutStatements from "../payoutStatements.js";
import type * as properties from "../properties.js";
import type * as ratePlans from "../ratePlans.js";
import type * as refunds from "../refunds.js";
import type * as rewards from "../rewards.js";
import type * as roles from "../roles.js";
import type * as roomAddOns from "../roomAddOns.js";
import type * as roomPhotos from "../roomPhotos.js";
import type * as roomTypes from "../roomTypes.js";
import type * as rooms from "../rooms.js";
import type * as savedStays from "../savedStays.js";
import type * as seed from "../seed.js";
import type * as services from "../services.js";
import type * as supplierProducts from "../supplierProducts.js";
import type * as supplyOrders from "../supplyOrders.js";
import type * as supplyPayments from "../supplyPayments.js";
import type * as support from "../support.js";
import type * as users from "../users.js";
import type * as vendorProfiles from "../vendorProfiles.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  ResendOTPPasswordReset: typeof ResendOTPPasswordReset;
  audit: typeof audit;
  auth: typeof auth;
  authorization: typeof authorization;
  availability: typeof availability;
  bookingStatus: typeof bookingStatus;
  bookingValidation: typeof bookingValidation;
  bookings: typeof bookings;
  childPolicy: typeof childPolicy;
  commissions: typeof commissions;
  crons: typeof crons;
  csrf: typeof csrf;
  health: typeof health;
  http: typeof http;
  inventoryHolds: typeof inventoryHolds;
  notificationTemplates: typeof notificationTemplates;
  notifications: typeof notifications;
  partnerAdmin: typeof partnerAdmin;
  partnerApplications: typeof partnerApplications;
  partnerDashboard: typeof partnerDashboard;
  partnerOnboarding: typeof partnerOnboarding;
  partnerOperations: typeof partnerOperations;
  partnerProfiles: typeof partnerProfiles;
  payments: typeof payments;
  payoutStatements: typeof payoutStatements;
  properties: typeof properties;
  ratePlans: typeof ratePlans;
  refunds: typeof refunds;
  rewards: typeof rewards;
  roles: typeof roles;
  roomAddOns: typeof roomAddOns;
  roomPhotos: typeof roomPhotos;
  roomTypes: typeof roomTypes;
  rooms: typeof rooms;
  savedStays: typeof savedStays;
  seed: typeof seed;
  services: typeof services;
  supplierProducts: typeof supplierProducts;
  supplyOrders: typeof supplyOrders;
  supplyPayments: typeof supplyPayments;
  support: typeof support;
  users: typeof users;
  vendorProfiles: typeof vendorProfiles;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
