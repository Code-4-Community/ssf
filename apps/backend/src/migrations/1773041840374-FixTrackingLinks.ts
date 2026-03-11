import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixTrackingLinks1773041840374 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            UPDATE orders
            SET tracking_link = 'https://www.samplelink.com/samplelink'
            WHERE tracking_link = 'www.samplelink/samplelink';
            `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            UPDATE orders
            SET tracking_link = 'www.samplelink/samplelink'
            WHERE tracking_link = 'https://www.samplelink.com/samplelink';
            `);
  }
}
