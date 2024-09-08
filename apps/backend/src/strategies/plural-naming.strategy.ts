import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

// Extend SnakeNamingStrategy to follow Postgres naming conventions
export class PluralNamingStrategy extends SnakeNamingStrategy {
  tableName(targetName: string, userSpecifiedName: string): string {
    return (
      userSpecifiedName || super.tableName(targetName, userSpecifiedName) + 's'
    ); // Pluralize the table name
  }
}
