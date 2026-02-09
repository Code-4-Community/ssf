import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Donation } from '../donations/donations.entity';
import { Allergen, DonateWastedFood, ManufacturerAttribute } from './types';
import { ApplicationStatus } from '../shared/types';

@Entity('food_manufacturers')
export class FoodManufacturer {
  @PrimaryGeneratedColumn({ name: 'food_manufacturer_id' })
  foodManufacturerId!: number;

  @Column({ name: 'food_manufacturer_name', type: 'varchar', length: 255 })
  foodManufacturerName!: string;

  @Column({ name: 'food_manufacturer_website', type: 'varchar', length: 255 })
  foodManufacturerWebsite!: string;

  @OneToOne(() => User, {
    nullable: false,
    cascade: ['insert'],
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'food_manufacturer_representative_id',
    referencedColumnName: 'id',
  })
  foodManufacturerRepresentative!: User;

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

  @Column({
    name: 'unlisted_product_allergens',
    type: 'enum',
    enum: Allergen,
    enumName: 'allergen_enum',
    array: true,
  })
  unlistedProductAllergens!: Allergen[];

  @Column({
    name: 'facility_free_allergens',
    type: 'enum',
    enum: Allergen,
    enumName: 'allergen_enum',
    array: true,
  })
  facilityFreeAllergens!: Allergen[];

  @Column({ name: 'products_gluten_free', type: 'boolean' })
  productsGlutenFree!: boolean;

  @Column({ name: 'products_contain_sulfites', type: 'boolean' })
  productsContainSulfites!: boolean;

  @Column({
    name: 'products_sustainable_explanation',
    type: 'varchar',
  })
  productsSustainableExplanation!: string;

  @Column({ name: 'in_kind_donations', type: 'boolean' })
  inKindDonations!: boolean;

  @Column({
    name: 'donate_wasted_food',
    type: 'enum',
    enum: DonateWastedFood,
    enumName: 'donate_wasted_food_enum',
  })
  donateWastedFood!: DonateWastedFood;

  @Column({
    name: 'manufacturer_attribute',
    type: 'enum',
    enum: ManufacturerAttribute,
    enumName: 'manufacturer_attribute_enum',
    nullable: true,
  })
  manufacturerAttribute?: ManufacturerAttribute;

  @Column({
    name: 'additional_comments',
    type: 'varchar',
    nullable: true,
  })
  additionalComments?: string;

  @Column({ name: 'newsletter_subscription', type: 'boolean', nullable: true })
  newsletterSubscription?: boolean;

  @OneToMany(() => Donation, (donation) => donation.foodManufacturer)
  donations!: Donation[];

  @Column({
    name: 'status',
    type: 'enum',
    enum: ApplicationStatus,
    enumName: 'application_status_enum',
  })
  status!: ApplicationStatus;

  @Column({
    name: 'date_applied',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  dateApplied!: Date;
}
