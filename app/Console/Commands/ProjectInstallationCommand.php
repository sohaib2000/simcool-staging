<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Process;

class ProjectInstallationCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:project-install {--skip-composer : Skip composer install/update}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Complete project setup: composer install, migrations, and database seeding';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🚀 Starting project installation...');
        $this->newLine();

        try {
            // Step 1: Composer Install/Update
            if (!$this->option('skip-composer')) {
                $this->runComposerInstall();
            } else {
                $this->info('⏭️  Skipping composer install...');
            }

            // Step 2: Generate application key if not exists
            $this->generateAppKey();

            // Step 3: Run migrations
            $this->runMigrations();

            // Step 4: Seed database
            $this->seedDatabase();

            $this->newLine();
            $this->info('✅ Project installation completed successfully!');

        } catch (\Exception $e) {
            $this->error('❌ Installation failed: ' . $e->getMessage());
            return Command::FAILURE;
        }

        return Command::SUCCESS;
    }

    /**
     * Run composer install or update
     */
    private function runComposerInstall()
    {
        $this->info('📦 Installing composer dependencies...');

        // Check if vendor directory exists
        $vendorExists = is_dir(base_path('vendor'));
        $composerCommand = $vendorExists ? 'composer update' : 'composer install';

        $this->line("Running: {$composerCommand}");

        $result = Process::run($composerCommand, function (string $type, string $buffer) {
            // Show composer output in real-time
            if ($type === Process::OUT) {
                $this->line($buffer);
            }
        });

        if ($result->failed()) {
            throw new \Exception('Composer installation failed: ' . $result->errorOutput());
        }

        $this->info('✅ Composer dependencies installed successfully!');
        $this->newLine();
    }

    /**
     * Generate application key if it doesn't exist
     */
    private function generateAppKey()
    {
        if (empty(config('app.key'))) {
            $this->info('🔑 Generating application key...');
            $this->call('key:generate');
            $this->info('✅ Application key generated!');
            $this->newLine();
        }
    }

    /**
     * Run database migrations
     */
    private function runMigrations()
    {
        $this->info('🗃️  Running database migrations...');

        // Check if we can connect to database
        try {
            DB::connection()->getPdo();
        } catch (\Exception $e) {
            throw new \Exception('Database connection failed. Please check your .env configuration: ' . $e->getMessage());
        }

        $this->call('migrate', [
            '--force' => true // Skip confirmation in production
        ]);

        $this->info('✅ Database migrations completed!');
        $this->newLine();
    }

    /**
     * Seed the database
     */
    private function seedDatabase()
    {
        $this->info('🌱 Seeding database...');

        // Check if DatabaseSeeder exists
        if (!class_exists('Database\\Seeders\\DatabaseSeeder')) {
            $this->warn('⚠️  DatabaseSeeder not found, skipping seeding...');
            return;
        }

        $confirm = $this->confirm('Do you want to seed the database? This will add sample data.', true);

        if ($confirm) {
            $this->call('db:seed', [
                '--force' => true
            ]);
            $this->info('✅ Database seeded successfully!');
        } else {
            $this->info('⏭️  Database seeding skipped.');
        }

        $this->newLine();
    }
}
