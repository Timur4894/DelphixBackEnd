import { DataSource } from "typeorm";
import { Company } from "../company/entities/company.entity";
import * as dotenv from "dotenv";
import companiesData from "./top-companies.js";

dotenv.config();

const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.SUPABASE_DB_URL || process.env.DATABASE_URL,
  entities: [Company],
  synchronize: false,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function seed() {
  try {
    await AppDataSource.initialize();
    console.log("✓ Database connected");

    const repo = AppDataSource.getRepository(Company);
    const companies = companiesData as Array<{
      ticker: string;
      name: string;
      description?: string;
      logo_url?: string;
    }>;

    let added = 0;
    let skipped = 0;

    for (const item of companies) {
      const exists = await repo.findOne({ where: { ticker: item.ticker } });
      if (!exists) {
        await repo.save(repo.create(item));
        added++;
        console.log(`✓ Added ${item.ticker} - ${item.name}`);
      } else {
        skipped++;
        console.log(`⊘ Skipped ${item.ticker} - already exists`);
      }
    }

    console.log(`\n✓ Companies seeded successfully!`);
    console.log(`  Added: ${added}`);
    console.log(`  Skipped: ${skipped}`);
    
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error("✗ Error seeding companies:", error);
    await AppDataSource.destroy();
    process.exit(1);
  }
}

seed();
