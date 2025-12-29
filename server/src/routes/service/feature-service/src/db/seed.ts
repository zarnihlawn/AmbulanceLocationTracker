import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { feature } from './schema';

export async function seedDatabase(
  db: NodePgDatabase<any>,
): Promise<void> {
  try {
    console.log('Seeding database with default data...');

    const existingItems = await db
      .select()
      .from(feature)
      .limit(1);

    if (existingItems.length > 0) {
      console.log(
        'Database already contains data. Skipping seed.',
      );
      return;
    }

    // Insert your default data here
    // Example default data - replace with your actual default data

    const defaultData = [
      {
        authorId: '00000000-0000-0000-0000-000000000000', // Replace with actual author ID
        name: 'Location Tracker',
        description: 'This is a default feature item',
      },
    ];

    await db.insert(feature).values(defaultData);
    console.log(
      `Seeded ${defaultData.length} default data`,
    );
  } catch (error) {
    console.error('Error seeding database: ', error);
    throw error;
  }
}
