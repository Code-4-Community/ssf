import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../users/user.entity';
import {
  Activities,
  AllergensConfidence,
  AllergyFriendlyStorage,
  ClientVisitFrequency,
  PantriesStatus,
  RefrigeratedDonation,
  ServeAllergicChildren,
} from './types';

@Entity('pantries')
export class Pantry {
  @PrimaryGeneratedColumn({ name: 'pantry_id' })
  pantryId: number;

  @Column({ name: 'pantry_name', type: 'varchar', length: 255 })
  pantryName: string;

  @Column({ name: 'address_line_1', type: 'varchar', length: 255 })
  addressLine1: string;

  @Column({
    name: 'address_line_2',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  addressLine2?: string;

  @Column({ name: 'address_city', type: 'varchar', length: 255 })
  addressCity: string;

  @Column({ name: 'address_state', type: 'varchar', length: 255 })
  addressState: string;

  @Column({ name: 'address_zip', type: 'varchar', length: 255 })
  addressZip: string;

  @Column({
    name: 'address_country',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  addressCountry?: string;

  @Column({ name: 'allergen_clients', type: 'varchar', length: 25 })
  allergenClients: string;

  @Column({
    name: 'refrigerated_donation',
    type: 'enum',
    enum: RefrigeratedDonation,
    enumName: 'refrigerated_donation_enum',
  })
  refrigeratedDonation: RefrigeratedDonation;

  @Column({ name: 'reserve_food_for_allergic', type: 'varchar', length: 25 })
  reserveFoodForAllergic: string;

  @Column({ name: 'reservation_explanation', type: 'text', nullable: true })
  reservationExplanation?: string;

  @Column({
    name: 'dedicated_allergy_friendly',
    type: 'enum',
    enum: AllergyFriendlyStorage,
    enumName: 'allergy_friendly_storage_enum',
  })
  dedicatedAllergyFriendly: AllergyFriendlyStorage;

  @Column({
    name: 'client_visit_frequency',
    type: 'enum',
    enum: ClientVisitFrequency,
    enumName: 'client_visit_frequency_enum',
  })
  clientVisitFrequency: ClientVisitFrequency;

  @Column({
    name: 'identify_allergens_confidence',
    type: 'enum',
    enum: AllergensConfidence,
    enumName: 'allergens_confidence_enum',
  })
  identifyAllergensConfidence: AllergensConfidence;

  @Column({
    name: 'serve_allergic_children',
    type: 'enum',
    enum: ServeAllergicChildren,
    enumName: 'serve_allergic_children_enum',
  })
  serveAllergicChildren: ServeAllergicChildren;

  @Column({ name: 'newsletter_subscription', type: 'boolean' })
  newsletterSubscription: boolean;

  @Column({ name: 'restrictions', type: 'text', array: true })
  restrictions: string[];

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({
    name: 'ssf_representative_id',
    referencedColumnName: 'id',
  })
  ssfRepresentative?: User;

  // cascade: ['insert'] means that when we create a new
  // pantry, the representative will automatically be added
  // to the User table
  @OneToOne(() => User, { nullable: false, cascade: ['insert'] })
  @JoinColumn({
    name: 'pantry_representative_id',
    referencedColumnName: 'id',
  })
  pantryRepresentative: User;

  @Column({
    name: 'status',
    type: 'enum',
    enum: PantriesStatus,
    enumName: 'pantries_status_enum',
  })
  status: PantriesStatus;

  @Column({
    name: 'date_applied',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  dateApplied: Date;

  @Column({ name: 'activities', type: 'text', array: true })
  activities: Activities[];

  @Column({ name: 'activities_comments', type: 'text', nullable: true })
  activitiesComments?: string;

  @Column({ name: 'items_in_stock', type: 'text' })
  itemsInStock: string;

  @Column({ name: 'need_more_options', type: 'text' })
  needMoreOptions: string;
}
