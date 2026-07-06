export const ROUTES = {
  HOME: '/',

  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  UNAUTHORIZED: '/unauthorized',

  PROFILE: '/profile',

  PANTRY_APPLICATION: '/pantry-application',
  FOOD_MANUFACTURER_APPLICATION: '/food-manufacturer-application',
  APPLICATION_SUBMITTED: '/application-submitted',

  PANTRY_APPLICATION_DETAILS: '/pantry-details/application/:applicationId',
  PANTRY_MANAGEMENT_DETAILS: '/pantry-details/pantry/:pantryId',
  FOOD_MANUFACTURER_APPLICATION_DETAILS:
    '/food-manufacturer-application-details/:applicationId',
  FOOD_MANUFACTURER_MANAGEMENT_DETAILS:
    '/food-manufacturer-details/manufacturer/:foodManufacturerId',

  APPROVE_PANTRIES: '/approve-pantries',
  APPROVE_FOOD_MANUFACTURERS: '/approve-food-manufacturers',
  VOLUNTEER_MANAGEMENT: '/volunteer-management',
  PANTRY_MANAGEMENT: '/pantry-management',
  FOOD_MANUFACTURER_MANAGEMENT: '/food-manufacturer-management',
  ADMIN_ORDER_MANAGEMENT: '/admin-order-management',
  ADMIN_DONATION: '/admin-donation',
  ADMIN_DONATION_STATS: '/admin-donation-stats',
  ADMIN_REQUEST_MANAGEMENT: '/admin-request-management',
  ADMIN_DASHBOARD: '/admin-dashboard',

  VOLUNTEER_ASSIGNED_PANTRIES: '/volunteer-assigned-pantries',
  VOLUNTEER_REQUEST_MANAGEMENT: '/volunteer-request-management',
  VOLUNTEER_ORDER_MANAGEMENT: '/volunteer-order-management',

  PANTRY_ORDER_MANAGEMENT: '/pantry-order-management',
  REQUEST_FORM: '/request-form',
  PANTRY_DASHBOARD: '/pantry-dashboard',
  VOLUNTEER_DASHBOARD: '/volunteer-dashboard',

  FM_DONATION_MANAGEMENT: '/fm-donation-management',
  FM_DASHBOARD: '/fm-dashboard',
};
