import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  ManyToMany,
} from 'typeorm';
import { User } from '../users/user.entity';
import {
  Activity,
  AllergensConfidence,
  ClientVisitFrequency,
  PantryStatus,
  RefrigeratedDonation,
  ReserveFoodForAllergic,
  ServeAllergicChildren,
} from './types';

@Entity('pantries')
export class Pantry {
  @PrimaryGeneratedColumn({ name: 'pantry_id' })
  pantryId!: number;

  @Column({ name: 'pantry_name', type: 'varchar', length: 255 })
  pantryName!: string;

  @Column({ name: 'shipment_address_line_1', type: 'varchar', length: 255 })
  shipmentAddressLine1!: string;

  @Column({
    name: 'shipment_address_line_2',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  shipmentAddressLine2?: string;

  @Column({ name: 'shipment_address_city', type: 'varchar', length: 255 })
  shipmentAddressCity!: string;

  @Column({ name: 'shipment_address_state', type: 'varchar', length: 255 })
  shipmentAddressState!: string;

  @Column({ name: 'shipment_address_zip', type: 'varchar', length: 255 })
  shipmentAddressZip!: string;

  @Column({
    name: 'shipment_address_country',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  shipmentAddressCountry?: string;

  @Column({ name: 'mailing_address_line_1', type: 'varchar', length: 255 })
  mailingAddressLine1!: string;

  @Column({
    name: 'mailing_address_line_2',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  mailingAddressLine2?: string;

  @Column({ name: 'mailing_address_city', type: 'varchar', length: 255 })
  mailingAddressCity!: string;

  @Column({ name: 'mailing_address_state', type: 'varchar', length: 255 })
  mailingAddressState!: string;

  @Column({ name: 'mailing_address_zip', type: 'varchar', length: 255 })
  mailingAddressZip!: string;

  @Column({
    name: 'mailing_address_country',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  mailingAddressCountry?: string;

  @Column({ name: 'allergen_clients', type: 'varchar', length: 25 })
  allergenClients!: string;

  @Column({
    name: 'refrigerated_donation',
    type: 'enum',
    enum: RefrigeratedDonation,
    enumName: 'refrigerated_donation_enum',
  })
  refrigeratedDonation!: RefrigeratedDonation;

  @Column({ name: 'accept_food_deliveries', type: 'boolean' })
  acceptFoodDeliveries!: boolean;

  @Column({
    name: 'delivery_window_instructions',
    type: 'text',
    nullable: true,
  })
  deliveryWindowInstructions?: string;

  @Column({
    name: 'reserve_food_for_allergic',
    type: 'enum',
    enum: ReserveFoodForAllergic,
    enumName: 'reserve_food_for_allergic_enum',
  })
  reserveFoodForAllergic!: string;

  @Column({ name: 'reservation_explanation', type: 'text', nullable: true })
  reservationExplanation?: string;

  @Column({
    name: 'dedicated_allergy_friendly',
    type: 'boolean',
  })
  dedicatedAllergyFriendly!: boolean;

  @Column({
    name: 'client_visit_frequency',
    type: 'enum',
    enum: ClientVisitFrequency,
    enumName: 'client_visit_frequency_enum',
    nullable: true,
  })
  clientVisitFrequency?: ClientVisitFrequency;

  @Column({
    name: 'identify_allergens_confidence',
    type: 'enum',
    enum: AllergensConfidence,
    enumName: 'allergens_confidence_enum',
    nullable: true,
  })
  identifyAllergensConfidence?: AllergensConfidence;

  @Column({
    name: 'serve_allergic_children',
    type: 'enum',
    enum: ServeAllergicChildren,
    enumName: 'serve_allergic_children_enum',
    nullable: true,
  })
  serveAllergicChildren?: ServeAllergicChildren;

  @Column({ name: 'newsletter_subscription', type: 'boolean', nullable: true })
  newsletterSubscription?: boolean;

  @Column({ name: 'restrictions', type: 'text', array: true })
  restrictions!: string[];

  @Column({ name: 'has_email_contact', type: 'boolean' })
  hasEmailContact!: boolean;

  @Column({ name: 'email_contact_other', type: 'text', nullable: true })
  emailContactOther?: string;

  @Column({
    name: 'secondary_contact_first_name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  secondaryContactFirstName?: string;

  @Column({
    name: 'secondary_contact_last_name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  secondaryContactLastName?: string;

  @Column({
    name: 'secondary_contact_email',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  secondaryContactEmail?: string;

  @Column({
    name: 'secondary_contact_phone',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  secondaryContactPhone?: string;

  // cascade: ['insert'] means that when we create a new
  // pantry, the pantry user will automatically be added
  // to the User table
  @OneToOne(() => User, {
    nullable: false,
    cascade: ['insert'],
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'pantry_user_id',
    referencedColumnName: 'id',
  })
  pantryUser!: User;

  @Column({
    name: 'status',
    type: 'enum',
    enum: PantryStatus,
    enumName: 'pantries_status_enum',
  })
  status!: PantryStatus;

  @Column({
    name: 'date_applied',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  dateApplied!: Date;

  @Column({
    name: 'activities',
    type: 'enum',
    enum: Activity,
    enumName: 'activity_enum',
    array: true,
  })
  activities!: Activity[];

  @Column({ name: 'activities_comments', type: 'text', nullable: true })
  activitiesComments?: string;

  @Column({ name: 'items_in_stock', type: 'text' })
  itemsInStock!: string;

  @Column({ name: 'need_more_options', type: 'text' })
  needMoreOptions!: string;

  @ManyToMany(() => User, (user) => user.pantries)
  volunteers?: User[];
}
