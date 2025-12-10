<?php

namespace Database\Seeders;

use App\Models\Currency;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        if (!User::where('role', 'admin')->exists()) {
            User::create([
                'name' => 'Admin',
                'email' => 'admin@gmail.com',
                'role' => 'admin',
                'password' => Hash::make('12345678')
            ]);
        }


        $path3 = database_path('seeders/sql/languages.sql');
        $sql3 = File::get($path3);
        DB::unprepared($sql3);
        $path4 = database_path('seeders/sql/pages.sql');
        $sql4 = File::get($path4);
        DB::unprepared($sql4);
        $path5 = database_path('seeders/sql/email_templates.sql');
        $sql5 = File::get($path5);
        DB::unprepared($sql5);
        $path6 = database_path('seeders/sql/currencies.sql');
        $sql6 = File::get($path6);
        DB::unprepared($sql6);
        $path8 = database_path('seeders/sql/regions.sql');
        $sql8 = File::get($path8);
        DB::unprepared($sql8);
        $path7 = database_path('seeders/sql/countries.sql');
        $sql7 = File::get($path7);
        DB::unprepared($sql7);
        $path2 = database_path('seeders/sql/flaggroups.sql');
        $sql2 = File::get($path2);
        DB::unprepared($sql2);
        $path1 = database_path('seeders/sql/systemflags.sql');
        $sql1 = File::get($path1);
        DB::unprepared($sql1);
    }
}
