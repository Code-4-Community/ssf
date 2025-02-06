import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../users/user.entity';

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

  @Column({ name: 'refrigerated_donation', type: 'varchar', length: 25 })
  refrigeratedDonation: string;

  @Column({ name: 'reserve_food_for_allergic', type: 'boolean' })
  reserveFoodForAllergic: boolean;

  @Column({ name: 'reservation_explanation', type: 'text' })
  reservationExplanation: string;

  @Column({ name: 'dedicated_allergy_friendly', type: 'varchar', length: 255 })
  dedicatedAllergyFriendly: string;

  @Column({ name: 'client_visit_frequency', type: 'varchar', length: 25 })
  clientVisitFrequency: string;

  @Column({
    name: 'identify_allergens_confidence',
    type: 'varchar',
    length: 50,
  })
  identifyAllergensConfidence: string;

  @Column({ name: 'serve_allergic_children', type: 'varchar', length: 25 })
  serveAllergicChildren: string;

  @Column({ name: 'newsletter_subscription', type: 'boolean' })
  newsletterSubscription: boolean;

  @Column({ name: 'approved', type: 'boolean' })
  approved: boolean;

  @Column({ name: 'restrictions', type: 'text', array: true })
  restrictions: string[];

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({
    name: 'ssf_representative_id',
    referencedColumnName: 'user_id',
  })
  ssfRepresentative: User;

  @OneToOne(() => User, { nullable: false })
  @JoinColumn({
    name: 'pantry_representative_id',
    referencedColumnName: 'user_id',
  })
  pantryRepresentative: User;

  @Column({ name: 'activities', type: 'text' })
  activities: string;

  @Column({ name: 'questions', type: 'text', nullable: true })
  questions: string;

  @Column({ name: 'items_in_stock', type: 'text' })
  itemsInStock: string;

  @Column({ name: 'need_more_options', type: 'text' })
  needMoreOptions: string;
}
