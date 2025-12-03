export enum RefrigeratedDonation {
  YES = 'Yes, always',
  NO = 'No',
  SOMETIMES = 'Sometimes (check in before sending)',
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

export enum Activity {
  CREATE_LABELED_SHELF = 'Create labeled shelf',
  PROVIDE_EDUCATIONAL_PAMPHLETS = 'Provide educational pamphlets',
  TRACK_DIETARY_NEEDS ='Spreadsheet to track dietary needs',
  POST_RESOURCE_FLYERS = 'Post allergen-free resource flyers',
  SURVEY_CLIENTS = 'Survey clients to determine medical dietary needs',
  COLLECT_FEEDBACK = 'Collect feedback from allergen-avoidant clients',
  SOMETHING_ELSE = 'Something else',
}

export enum ReserveFoodForAllergic {
  YES = 'Yes',
  SOME = 'Some',
  NO = 'No',
}