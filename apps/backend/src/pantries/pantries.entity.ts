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
  RefridgeratedDonation,
  ServeAllergicChildren,
} from './types';

@Entity('pantries')
export class Pantry {
  @PrimaryGeneratedColumn({ name: 'pantry_id' })
  pantryId: number;

  @Column({ name: 'pantry_name', type: 'varchar', length: 255 })
  pantryName: string;

  @Column({ name: 'address', type: 'varchar', length: 255 })
  address: string;

  @Column({ name: 'allergen_clients', type: 'varchar', length: 25 })
  allergenClients: string;

  @Column({
    name: 'refrigerated_donation',
    type: 'enum',
    enum: RefridgeratedDonation,
    enumName: 'refrigerated_donation_enum',
  })
  refrigeratedDonation: RefridgeratedDonation;

  @Column({ name: 'reserve_food_for_allergic', type: 'boolean' })
  reserveFoodForAllergic: boolean;

  @Column({ name: 'reservation_explanation', type: 'text' })
  reservationExplanation: Text;

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

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({
    name: 'ssf_representative_id',
    referencedColumnName: 'id',
  })
  ssfRepresentative: User;

  @OneToOne(() => User, { nullable: false })
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

  @Column({ name: 'questions', type: 'text', nullable: true })
  questions: string;

  @Column({ name: 'items_in_stock', type: 'text' })
  itemsInStock: string;

  @Column({ name: 'need_more_options', type: 'text' })
  needMoreOptions: string;
}
