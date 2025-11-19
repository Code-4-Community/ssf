export enum RefrigeratedDonation {
  YES = 'Yes',
  NO = 'No',
  SMALL_QUANTITIES_ONLY = 'Small quantities only',
}

export enum ClientVisitFrequency {
  DAILY = 'Daily',
  MORE_THAN_ONCE_A_WEEK = 'More than once a week',
  ONCE_A_WEEK = 'Once a week',
  FEW_TIMES_A_MONTH = 'A few times a month',
  ONCE_A_MONTH = 'Once a month',
}

export enum AllergensConfidence {
  VERY_CONFIDENT = 'Very confident',
  SOMEWHAT_CONFIDENT = 'Somewhat confident',
  NOT_VERY_CONFIDENT = 'Not very confident (we need more education!)',
}

export enum ServeAllergicChildren {
  YES_MANY = 'Yes, many (> 10)',
  YES_FEW = 'Yes, a few (< 10)',
  NO = 'No',
}

export enum PantryStatus {
  APPROVED = 'approved',
  DENIED = 'denied',
  PENDING = 'pending',
}

export enum AllergyFriendlyStorage {
  DEDICATED_SHELF_OR_BOX = 'Yes, dedicated shelf',
  BACK_ROOM = 'Yes, back room',
  THROUGHOUT_PANTRY = 'No, throughout pantry',
}

export enum Activities {
  CREATE_LABELED_SHELF = 'Create a labeled, allergy-friendly shelf or shelves',
  PROVIDE_EDUCATIONAL_PAMPHLETS = 'Provide clients and staff/volunteers with educational pamphlets',
  TRACK_DIETARY_NEEDS = "Use a spreadsheet to track clients' medical dietary needs and distribution of SSF items per month",
  POST_RESOURCE_FLYERS = 'Post allergen-free resource flyers throughout pantry',
  SURVEY_CLIENTS = 'Survey your clients to determine their medical dietary needs',
  COLLECT_FEEDBACK = 'Collect feedback from allergen-avoidant clients on SSF foods',
  SOMETHING_ELSE = 'Something else',
}
