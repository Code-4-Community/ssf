import { User1725726359198 } from '../migrations/1725726359198-User';
import { AddTables1726524792261 } from '../migrations/1726524792261-addTables';
import { ReviseTables1737522923066 } from '../migrations/1737522923066-reviseTables';
import { UpdateUserRole1737816745912 } from '../migrations/1737816745912-UpdateUserRole';
import { UpdatePantriesTable1737906317154 } from '../migrations/1737906317154-updatePantriesTable';
import { UpdateDonations1738697216020 } from '../migrations/1738697216020-updateDonations';
import { UpdateDonationColTypes1741708808976 } from '../migrations/1741708808976-UpdateDonationColTypes';
import { UpdatePantriesTable1738172265266 } from '../migrations/1738172265266-updatePantriesTable';
import { UpdatePantriesTable1739056029076 } from '../migrations/1739056029076-updatePantriesTable';
import { AssignmentsPantryIdNotUnique1758384669652 } from '../migrations/1758384669652-AssignmentsPantryIdNotUnique';
import { UpdateOrdersTable1740367964915 } from '../migrations/1740367964915-updateOrdersTable';
import { UpdateFoodRequests1744051370129 } from '../migrations/1744051370129-updateFoodRequests';
import { UpdateRequestTable1741571847063 } from '../migrations/1741571847063-updateRequestTable';
import { RemoveOrderIdFromRequests1744133526650 } from '../migrations/1744133526650-removeOrderIdFromRequests';
import { AddOrders1739496585940 } from '../migrations/1739496585940-addOrders';
import { AddingEnumValues1760538239997 } from '../migrations/1760538239997-AddingEnumValues';
import { UpdateColsToUseEnumType1760886499863 } from '../migrations/1760886499863-UpdateColsToUseEnumType';
import { UpdatePantriesTable1742739750279 } from '../migrations/1742739750279-updatePantriesTable';
import { RemoveOrdersDonationId1761500262238 } from '../migrations/1761500262238-RemoveOrdersDonationId';
import { AddVolunteerPantryUniqueConstraint1760033134668 } from '../migrations/1760033134668-AddVolunteerPantryUniqueConstraint';
import { AllergyFriendlyToBoolType1763963056712 } from '../migrations/1763963056712-AllergyFriendlyToBoolType';
import { UpdatePantryUserFieldsFixed1764350314832 } from '../migrations/1764350314832-UpdatePantryUserFieldsFixed';
import { RemoveMultipleVolunteerTypes1764811878152 } from '../migrations/1764811878152-RemoveMultipleVolunteerTypes';
import { RemoveUnusedStatuses1764816885341 } from '../migrations/1764816885341-RemoveUnusedStatuses';
import { UpdatePantryFields1763762628431 } from '../migrations/1763762628431-UpdatePantryFields';
import { PopulateDummyData1768501812134 } from '../migrations/1768501812134-populateDummyData';
import { RemovePantryFromOrders1769316004958 } from '../migrations/1769316004958-RemovePantryFromOrders';
import { AddDonationRecurrenceFields1770080947285 } from '../migrations/1770080947285-AddDonationRecurrenceFields';

const schemaMigrations = [
  User1725726359198,
  AddTables1726524792261,
  ReviseTables1737522923066,
  UpdateUserRole1737816745912,
  UpdatePantriesTable1737906317154,
  UpdateDonations1738697216020,
  UpdateDonationColTypes1741708808976,
  UpdatePantriesTable1738172265266,
  UpdatePantriesTable1739056029076,
  AssignmentsPantryIdNotUnique1758384669652,
  AddOrders1739496585940,
  UpdateOrdersTable1740367964915,
  UpdateRequestTable1741571847063,
  UpdateFoodRequests1744051370129,
  RemoveOrderIdFromRequests1744133526650,
  AddingEnumValues1760538239997,
  UpdateColsToUseEnumType1760886499863,
  UpdatePantriesTable1742739750279,
  RemoveOrdersDonationId1761500262238,
  UpdatePantryFields1763762628431,
  AddVolunteerPantryUniqueConstraint1760033134668,
  AllergyFriendlyToBoolType1763963056712,
  UpdatePantryUserFieldsFixed1764350314832,
  RemoveMultipleVolunteerTypes1764811878152,
  RemoveUnusedStatuses1764816885341,
  PopulateDummyData1768501812134,
  RemovePantryFromOrders1769316004958,
  AddDonationRecurrenceFields1770080947285,
];

export default schemaMigrations;
