# Backend Auth Audit

Living catalog of every backend controller endpoint and its auth posture. This file is the source of truth for "who can call what" — keep it in sync as endpoints are added, removed, or re-gated.

**Last full sweep:** 2026-05-17

---

## Global posture

Three guards are registered globally in [app.module.ts:54-64](../app.module.ts#L54-L64):

| Guard            | Effect                                                         | Opt-out                                   |
| ---------------- | -------------------------------------------------------------- | ----------------------------------------- |
| `JwtAuthGuard`   | Requires valid JWT on every request                            | `@Public()`                               |
| `RolesGuard`     | If `@Roles(...)` present, enforces role membership             | absent decorator = any authenticated user |
| `OwnershipGuard` | If `@CheckOwnership(...)` present, enforces ownership resolver | absent decorator = no ownership check     |

**Auth is opt-out, not opt-in.** "(none)" in the table below means the route is authenticated-only but has no role / ownership constraint — _any_ logged-in user (volunteer, pantry, FM, admin) can call it. That is usually wrong.

**Anti-patterns to fix as encountered:**

- `@UseGuards(JwtAuthGuard)` or `@UseGuards(AuthGuard('jwt'))` on a handler — redundant with the global guard. Examples: [users.controller.ts:30](../users/users.controller.ts#L30), [donationItems.controller.ts:17](../donationItems/donationItems.controller.ts#L17). Strip when touching the file.

---

## 🚨 Critical anomalies (verify first)

### A1. `app.controller.ts GET /`

[app.controller.ts:9](../app.controller.ts#L9) — no decorators. Probably trivially broken under the global `JwtAuthGuard` but never called from the FE. Add `@Public()` or delete the route. Verify in the AWS console that no ALB / EB target-group health check is pointed at `/` before deleting.

---

## In-flight tickets covering some gaps

Some rows below already have an open ticket — don't duplicate work, just verify and check off.

| Ticket                                                                                                | Covers                                                                                                          |
| ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| [SSF-XXX-view-orders-deep-link-and-auth.md](../../../../SSF-XXX-view-orders-deep-link-and-auth.md) §4 | `GET /orders/`, `GET /volunteers/:id/orders`, `GET /pantries/:pantryId/orders`                                  |
| [SSF-XXX-new-donation-fm-id.md](../../../../SSF-XXX-new-donation-fm-id.md)                            | `POST /donations`                                                                                               |
| [SSF-XXX-approved-status-filter-audit.md](../../../../SSF-XXX-approved-status-filter-audit.md)        | `GET /manufacturers/pending` `@Roles(Role.ADMIN)` add                                                           |
| [SSF-XXX-missed-be-auth-gates.md](../../../../SSF-XXX-missed-be-auth-gates.md)                        | `PATCH /orders/bulk-update-tracking-cost-info`, `PATCH /donations/:donationId/fulfill`                          |
| [SSF-XXX-requests-controller-auth.md](../../../../SSF-XXX-requests-controller-auth.md)                | `POST /requests`, `PATCH /:requestId`, `DELETE /:requestId`, `GET /:requestId`, `GET /:requestId/order-details` |
| [SSF-XXX-me-route-cleanup.md](../../../../SSF-XXX-me-route-cleanup.md)                                | `GET /users/:id/stats`, `GET /volunteers/:id/recent-orders`, FM/pantry `my-id` routes                           |

---

## Legend

| Symbol | Meaning                                                                     |
| ------ | --------------------------------------------------------------------------- |
| ✅     | Correctly gated; no action                                                  |
| ⚠️     | Gap — auth obviously missing or insufficient                                |
| 🔍     | Investigate — required gate unclear without checking FE callers             |
| 🎫     | Already tracked in a ticket (see column)                                    |
| 💀     | Dead-route candidate — no known FE caller; flag for deletion                |
| ✂️     | Redundant local decorator (e.g., `@UseGuards(JwtAuthGuard)` already global) |

---

## Inventory

> `auth/auth.controller.ts` was deleted in SSF-215; the FE goes through AWS Amplify directly for signup/signin/refresh/password-reset. The `AuthService` retains `adminCreateUser` (called from `users.service.ts` during admin-driven user creation) — no controller-level auth row to track.

### app.controller.ts (`/`)

| Status | Endpoint | Line                         | Current | Required              | Notes |
| ------ | -------- | ---------------------------- | ------- | --------------------- | ----- |
| 🚨     | `GET /`  | [9](../app.controller.ts#L9) | (none)  | `@Public()` or delete | A1    |

### users/users.controller.ts (`/users`)

| Status | Endpoint                                 | Line                                   | Current                    | Required                                                                                                                       | Notes                            |
| ------ | ---------------------------------------- | -------------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------- |
| ✂️     | `GET /me`                                | [30](../users/users.controller.ts#L30) | `@UseGuards(JwtAuthGuard)` | (none) — global guard already applies                                                                                          | Strip the local decorator        |
| 🔍     | `GET /:id`                               | [35](../users/users.controller.ts#L35) | (none)                     | `@Roles(Role.ADMIN)` (admin lookup) — verify FE caller is admin-only                                                           |                                  |
| 🎫     | `GET /:id/stats`                         | [40](../users/users.controller.ts#L40) | (none)                     | `@Roles(Role.ADMIN)` + self-or-admin via `@CheckOwnership`, or add `/users/me/stats` sibling                                   | me-route-cleanup                 |
| ✅     | `GET /admin/recent-pending-applications` | [48](../users/users.controller.ts#L48) | `@Roles(Role.ADMIN)`       | —                                                                                                                              |                                  |
| ⚠️     | `DELETE /:id`                            | [53](../users/users.controller.ts#L53) | (none)                     | `@Roles(Role.ADMIN)` (and/or `@CheckOwnership` for self-delete)                                                                | Anyone can delete any user today |
| ⚠️     | `PATCH /:id`                             | [58](../users/users.controller.ts#L58) | (none)                     | `@CheckOwnership` on `:id` with admin bypass                                                                                   | Anyone can edit any user today   |
| 🔍     | `POST /`                                 | [66](../users/users.controller.ts#L66) | (none)                     | likely `@Roles(Role.ADMIN)` or `@Public()` (signup path?). Cognito flow uses `/auth/signup`; investigate whether this is dead. | Possibly 💀                      |

### volunteers/volunteers.controller.ts (`/volunteers`)

| Status | Endpoint                    | Line                                             | Current                                                 | Required                                                                                                                  | Notes                                               |
| ------ | --------------------------- | ------------------------------------------------ | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| ✅     | `GET /`                     | [29](../volunteers/volunteers.controller.ts#L29) | `@Roles(Role.ADMIN)`                                    | —                                                                                                                         |                                                     |
| ✅     | `GET /:id/pantries`         | [35](../volunteers/volunteers.controller.ts#L35) | `@Roles(Role.VOLUNTEER, Role.ADMIN)`                    | + `@CheckOwnership` on `:id` (admin bypass), unless intentional that any volunteer can see any other volunteer's pantries | Verify intent                                       |
| ⚠️     | `GET /:id`                  | [42](../volunteers/volunteers.controller.ts#L42) | (none)                                                  | `@Roles(Role.ADMIN)` (admin lookup)                                                                                       |                                                     |
| ✅     | `GET /:id/my-recent-orders` | [53](../volunteers/volunteers.controller.ts#L53) | `@CheckOwnership`, `@Roles(Role.VOLUNTEER, Role.ADMIN)` | —                                                                                                                         | me-route-cleanup will rename to `/me/recent-orders` |
| ⚠️     | `POST /:id/pantries`        | [60](../volunteers/volunteers.controller.ts#L60) | (none)                                                  | `@Roles(Role.ADMIN)`                                                                                                      | Assigning pantries to a volunteer = admin only      |
| ✅     | `GET /me/assigned-requests` | [69](../volunteers/volunteers.controller.ts#L69) | `@Roles(Role.VOLUNTEER)`                                | —                                                                                                                         |                                                     |
| 🎫     | `GET /:id/orders`           | [81](../volunteers/volunteers.controller.ts#L81) | `@Roles(Role.VOLUNTEER)`                                | + `@CheckOwnership` on `:id`                                                                                              | view-orders §4                                      |

### pantries/pantries.controller.ts (`/pantries`)

| Status | Endpoint                       | Line                                           | Current                                              | Required                                                                                      | Notes                                      |
| ------ | ------------------------------ | ---------------------------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------ |
| ✅     | `GET /stats-by-pantry`         | [50](../pantries/pantries.controller.ts#L50)   | `@Roles(Role.ADMIN)`                                 | —                                                                                             |                                            |
| ✅     | `GET /total-stats`             | [62](../pantries/pantries.controller.ts#L62)   | `@Roles(Role.ADMIN)`                                 | —                                                                                             |                                            |
| ✅     | `GET /my-id`                   | [71](../pantries/pantries.controller.ts#L71)   | `@Roles(Role.PANTRY)`                                | —                                                                                             | me-route-cleanup may fold into `/users/me` |
| ✅     | `GET /pending`                 | [82](../pantries/pantries.controller.ts#L82)   | `@Roles(Role.ADMIN)`                                 | —                                                                                             |                                            |
| ✅     | `GET /approved-names`          | [88](../pantries/pantries.controller.ts#L88)   | `@Roles(Role.ADMIN)`                                 | —                                                                                             |                                            |
| ✅     | `GET /available-years-stats`   | [94](../pantries/pantries.controller.ts#L94)   | `@Roles(Role.ADMIN)`                                 | —                                                                                             |                                            |
| 🔍     | `GET /approved`                | [99](../pantries/pantries.controller.ts#L99)   | (none)                                               | likely `@Roles(Role.ADMIN, Role.VOLUNTEER, Role.PANTRY)` — verify FE caller list              | Reachable by any auth role today           |
| ✅     | `GET /:pantryId`               | [114](../pantries/pantries.controller.ts#L114) | `@CheckOwnership`, `@Roles(Role.PANTRY, Role.ADMIN)` | —                                                                                             |                                            |
| 🎫     | `GET /:pantryId/orders`        | [122](../pantries/pantries.controller.ts#L122) | `@Roles(Role.ADMIN, Role.PANTRY)`                    | + `@CheckOwnership` on `:pantryId`                                                            | view-orders §4                             |
| ⚠️     | `GET /:pantryId/requests`      | [130](../pantries/pantries.controller.ts#L130) | `@Roles(Role.PANTRY, Role.ADMIN)`                    | + `@CheckOwnership` on `:pantryId` (admin bypass)                                             | Same shape as `/orders` row above          |
| ✅     | `POST /`                       | [373](../pantries/pantries.controller.ts#L373) | `@Public()`                                          | —                                                                                             | Application submission                     |
| 🔍     | `PATCH /:pantryId/application` | [382](../pantries/pantries.controller.ts#L382) | `@Roles(Role.PANTRY)`                                | + `@CheckOwnership` on `:pantryId` (so a pantry user can't edit another pantry's application) |                                            |
| ✅     | `PATCH /:pantryId/approve`     | [397](../pantries/pantries.controller.ts#L397) | `@Roles(Role.ADMIN)`                                 | —                                                                                             |                                            |
| ✅     | `PATCH /:pantryId/deny`        | [405](../pantries/pantries.controller.ts#L405) | `@Roles(Role.ADMIN)`                                 | —                                                                                             |                                            |
| ✅     | `PATCH /:pantryId/volunteers`  | [413](../pantries/pantries.controller.ts#L413) | `@Roles(Role.ADMIN)`                                 | —                                                                                             |                                            |

### foodManufacturers/manufacturers.controller.ts (`/manufacturers`)

| Status | Endpoint                                      | Line                                                         | Current                                                             | Required                                                                                                                                                                                | Notes                                           |
| ------ | --------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| 🎫     | `GET /pending`                                | [32](../foodManufacturers/manufacturers.controller.ts#L32)   | (none)                                                              | `@Roles(Role.ADMIN)`                                                                                                                                                                    | approved-status-filter-audit                    |
| ✅     | `GET /my-id`                                  | [38](../foodManufacturers/manufacturers.controller.ts#L38)   | `@Roles(Role.FOODMANUFACTURER)`                                     | —                                                                                                                                                                                       | me-route-cleanup may fold into `/users/me`      |
| ⚠️     | `GET /:foodManufacturerId`                    | [48](../foodManufacturers/manufacturers.controller.ts#L48)   | (none)                                                              | `@Roles(Role.ADMIN, Role.FOODMANUFACTURER)` + `@CheckOwnership` for FM                                                                                                                  | Any auth role can read any FM today             |
| 🔍     | `GET /:foodManufacturerId/donations`          | [56](../foodManufacturers/manufacturers.controller.ts#L56)   | `@Roles(Role.FOODMANUFACTURER)` + inline ownership check in service | Refactor to `@CheckOwnership` for consistency — already enforced inline at [manufacturers.service.ts:83-87](../foodManufacturers/manufacturers.service.ts#L83-L87). Not a security gap. | new-donation-fm-id out-of-scope                 |
| ✅     | `GET /:foodManufacturerId/next-two-reminders` | [78](../foodManufacturers/manufacturers.controller.ts#L78)   | `@CheckOwnership`, `@Roles(Role.FOODMANUFACTURER)`                  | —                                                                                                                                                                                       |                                                 |
| ✅     | `POST /application`                           | [207](../foodManufacturers/manufacturers.controller.ts#L207) | `@Public()`                                                         | —                                                                                                                                                                                       |                                                 |
| 🔍     | `PATCH /:manufacturerId/application`          | [218](../foodManufacturers/manufacturers.controller.ts#L218) | `@Roles(Role.FOODMANUFACTURER)`                                     | + `@CheckOwnership` on `:manufacturerId`                                                                                                                                                | An FM could edit another FM's application today |
| ⚠️     | `PATCH /:manufacturerId/approve`              | [232](../foodManufacturers/manufacturers.controller.ts#L232) | (none)                                                              | `@Roles(Role.ADMIN)`                                                                                                                                                                    | Anyone can approve any FM today                 |
| ⚠️     | `PATCH /:manufacturerId/deny`                 | [239](../foodManufacturers/manufacturers.controller.ts#L239) | (none)                                                              | `@Roles(Role.ADMIN)`                                                                                                                                                                    | Anyone can deny any FM today                    |

### donations/donations.controller.ts (`/donations`)

| Status | Endpoint                          | Line                                             | Current                                                        | Required                                                                               | Notes                                                                |
| ------ | --------------------------------- | ------------------------------------------------ | -------------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| ⚠️     | `GET /`                           | [31](../donations/donations.controller.ts#L31)   | (none)                                                         | `@Roles(Role.ADMIN)`                                                                   | Returns all donations globally                                       |
| 🔍     | `GET /count`                      | [36](../donations/donations.controller.ts#L36)   | (none)                                                         | `@Roles(Role.ADMIN)` likely                                                            |                                                                      |
| ⚠️     | `GET /:donationId`                | [41](../donations/donations.controller.ts#L41)   | (none)                                                         | `@Roles(Role.ADMIN, Role.FOODMANUFACTURER, Role.VOLUNTEER)` + `@CheckOwnership` for FM | Verify volunteer/pantry need; any auth role reads any donation today |
| 🎫     | `POST /`                          | [48](../donations/donations.controller.ts#L48)   | (none)                                                         | `@Roles(Role.FOODMANUFACTURER)` + owner derived from auth                              | new-donation-fm-id                                                   |
| 🎫     | `PATCH /:donationId/fulfill`      | [103](../donations/donations.controller.ts#L103) | (none)                                                         | `@Roles(Role.FOODMANUFACTURER, Role.ADMIN)` + `@CheckOwnership`                        | missed-be-auth-gates                                                 |
| ✅     | `PATCH /:donationId/item-details` | [126](../donations/donations.controller.ts#L126) | `@Roles(Role.ADMIN, Role.FOODMANUFACTURER)`, `@CheckOwnership` | —                                                                                      |                                                                      |
| ⚠️     | `PUT /:donationId/items`          | [135](../donations/donations.controller.ts#L135) | (none)                                                         | `@Roles(Role.FOODMANUFACTURER, Role.ADMIN)` + `@CheckOwnership`                        | Same shape as `item-details`                                         |
| ⚠️     | `DELETE /:donationId`             | [143](../donations/donations.controller.ts#L143) | (none)                                                         | `@Roles(Role.FOODMANUFACTURER, Role.ADMIN)` + `@CheckOwnership`                        | Anyone can delete any donation today                                 |

### donationItems/donationItems.controller.ts (`/donation-items`)

| Status | Endpoint               | Line                                                   | Current                        | Required                                                 | Notes                                                                                 |
| ------ | ---------------------- | ------------------------------------------------------ | ------------------------------ | -------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| ✂️     | `GET /:donationId/all` | [17](../donationItems/donationItems.controller.ts#L17) | `@UseGuards(AuthGuard('jwt'))` | Strip redundant guard; add `@Roles(...)` based on caller | Same redundancy as `users/:id/me`; also figure out who calls it (FM-only? admin too?) |

### foodRequests/request.controller.ts (`/requests`)

| Status | Endpoint                                                                 | Line                                              | Current                                           | Required                                                                                    | Notes                                                                                                                                      |
| ------ | ------------------------------------------------------------------------ | ------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| ✅     | `GET /`                                                                  | [33](../foodRequests/request.controller.ts#L33)   | `@Roles(Role.ADMIN)`                              | —                                                                                           |                                                                                                                                            |
| 🎫     | `GET /:requestId`                                                        | [39](../foodRequests/request.controller.ts#L39)   | `@Roles(Role.PANTRY, Role.ADMIN, Role.VOLUNTEER)` | + `@CheckOwnership` for pantry caller (admin/volunteer bypass)                              | [requests-controller-auth](../../../../SSF-XXX-requests-controller-auth.md) #4                                                             |
| 🎫     | `GET /:requestId/order-details`                                          | [47](../foodRequests/request.controller.ts#L47)   | `@Roles(Role.VOLUNTEER, Role.PANTRY, Role.ADMIN)` | + `@CheckOwnership` (same shape as `/:requestId`)                                           | [requests-controller-auth](../../../../SSF-XXX-requests-controller-auth.md) #5                                                             |
| ✅     | `GET /:requestId/matching-manufacturers`                                 | [55](../foodRequests/request.controller.ts#L55)   | `@Roles(Role.VOLUNTEER)`                          | —                                                                                           |                                                                                                                                            |
| ✅     | `GET /:requestId/matching-manufacturers/:manufacturerId/available-items` | [63](../foodRequests/request.controller.ts#L63)   | `@Roles(Role.VOLUNTEER)`                          | —                                                                                           |                                                                                                                                            |
| 🎫     | `POST /`                                                                 | [71](../foodRequests/request.controller.ts#L71)   | (none)                                            | `@Roles(Role.PANTRY)` + pantry id derived from auth (same pattern as `POST /donations` fix) | [requests-controller-auth](../../../../SSF-XXX-requests-controller-auth.md) #1                                                             |
| 🎫     | `PATCH /:requestId`                                                      | [108](../foodRequests/request.controller.ts#L108) | (none)                                            | `@Roles(Role.PANTRY, Role.ADMIN)` + `@CheckOwnership`                                       | [requests-controller-auth](../../../../SSF-XXX-requests-controller-auth.md) #2                                                             |
| 🎫     | `DELETE /:requestId`                                                     | [116](../foodRequests/request.controller.ts#L116) | (none)                                            | `@Roles(Role.PANTRY, Role.ADMIN)` + `@CheckOwnership`                                       | [requests-controller-auth](../../../../SSF-XXX-requests-controller-auth.md) #3                                                             |
| 🔍     | `PATCH /:requestId/close`                                                | [124](../foodRequests/request.controller.ts#L124) | `@Roles(Role.VOLUNTEER)`                          | leave as-is unless an `assignedVolunteerId` model is added                                  | Open question flagged in [requests-controller-auth](../../../../SSF-XXX-requests-controller-auth.md); `FoodRequest` has no assignee column |

### orders/order.controller.ts (`/orders`)

| Status | Endpoint                                | Line                                      | Current                                                              | Required                                                                                                                        | Notes                                               |
| ------ | --------------------------------------- | ----------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| 🎫     | `GET /`                                 | [51](../orders/order.controller.ts#L51)   | (none)                                                               | `@Roles(Role.ADMIN)`                                                                                                            | view-orders §4                                      |
| 💀     | `GET /get-current-orders`               | [62](../orders/order.controller.ts#L62)   | (none)                                                               | delete                                                                                                                          | No FE caller per view-orders out-of-scope           |
| 💀     | `GET /get-past-orders`                  | [67](../orders/order.controller.ts#L67)   | (none)                                                               | delete                                                                                                                          | Same                                                |
| 🔍     | `GET /:orderId/pantry`                  | [72](../orders/order.controller.ts#L72)   | (none)                                                               | `@Roles(Role.VOLUNTEER, Role.PANTRY, Role.ADMIN)` + `@CheckOwnership` shape from line 80                                        | Verify intent — order → pantry → pantryUser pattern |
| ✅     | `GET /:orderId/request`                 | [93](../orders/order.controller.ts#L93)   | `@CheckOwnership`, `@Roles(Role.VOLUNTEER, Role.PANTRY, Role.ADMIN)` | —                                                                                                                               |                                                     |
| 🔍     | `GET /:orderId/manufacturer`            | [100](../orders/order.controller.ts#L100) | (none)                                                               | similar to `/:orderId/pantry` but resolve through FM                                                                            |                                                     |
| 🔍     | `GET /:orderId`                         | [107](../orders/order.controller.ts#L107) | (none)                                                               | `@Roles(Role.VOLUNTEER, Role.PANTRY, Role.FOODMANUFACTURER, Role.ADMIN)` + `@CheckOwnership` resolving order → all stakeholders | Any auth role reads any order today                 |
| 🔍     | `GET /:orderId/allocations`             | [114](../orders/order.controller.ts#L114) | (none)                                                               | same shape as `/:orderId`                                                                                                       |                                                     |
| 🔍     | `POST /`                                | [121](../orders/order.controller.ts#L121) | (none)                                                               | `@Roles(Role.VOLUNTEER)` + derive from auth, OR `@Roles(Role.VOLUNTEER, Role.ADMIN)` if admin creates too                       |                                                     |
| 🔍     | `PATCH /update-status/:orderId`         | [195](../orders/order.controller.ts#L195) | (none)                                                               | `@Roles(Role.VOLUNTEER, Role.ADMIN)` + `@CheckOwnership` (volunteer is the assignee)                                            |                                                     |
| 🎫     | `PATCH /bulk-update-tracking-cost-info` | [207](../orders/order.controller.ts#L207) | `@Roles(Role.FOODMANUFACTURER)`                                      | + `@CheckOwnership` via body.donationId                                                                                         | missed-be-auth-gates                                |
| ⚠️     | `PATCH /:orderId/confirm-delivery`      | [214](../orders/order.controller.ts#L214) | (none auth) — only `@UseInterceptors`                                | `@Roles(Role.PANTRY, Role.ADMIN)` + `@CheckOwnership` (order → pantry → pantryUser)                                             | Pantry confirms receipt of their own delivery only  |
| ✅     | `PATCH /:orderId/complete-action`       | [286](../orders/order.controller.ts#L286) | `@CheckOwnership`, `@Roles(Role.VOLUNTEER)`                          | —                                                                                                                               |                                                     |

---

## How to use this file

**Before opening any auth-gating ticket:**

1. Look up the endpoint in the table above.
2. If status is 🎫, link the existing ticket — don't open a new one.
3. If ⚠️ or 🔍, scope the fix in the appropriate ticket OR open a new one citing the row.
4. Update the status here when the PR merges.

**When adding a new endpoint:** add a row in the appropriate controller's section. Set status before merging.

**When you find a new gap:** add it here first as ⚠️, then decide whether to ticket it solo or fold into an in-flight ticket. The file is the index; tickets are the work.
