import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

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
  reservationExplanation: Text;

  @Column({ name: 'dedicated_allergy_friendly', type: 'varchar', length: 25 })
  dedicateAllergenFriendly: string;

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

  @Column({ name: 'restrictions', type: 'text', array: true })
  restrictions: Text[];

  @Column({ name: 'ssf_representative_id', type: 'int' })
  ssfRepresentativeId: number;

  @Column({ name: 'pantry_representative_id', type: 'int' })
  pantryRepresentativeId: number;

  @Column({ name: 'status', type: 'varchar', length: 50 })
  status: string;

  @Column({
    name: 'date_applied',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  dateApplied: Date;
}
