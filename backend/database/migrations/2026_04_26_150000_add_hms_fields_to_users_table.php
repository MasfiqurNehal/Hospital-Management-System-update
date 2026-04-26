<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('tenant_id')->nullable()->index()->after('id');
            $table->string('role')->default('patient')->index()->after('tenant_id');
            $table->string('full_name')->nullable()->after('name');
            $table->string('phone_country_code', 8)->nullable()->after('email');
            $table->string('phone_number', 20)->nullable()->after('phone_country_code');
            $table->string('gender', 16)->nullable()->after('phone_number');
            $table->date('date_of_birth')->nullable()->after('gender');
            $table->string('status')->default('active')->index()->after('date_of_birth');
            $table->boolean('email_verified')->default(false)->after('email_verified_at');
            $table->boolean('phone_verified')->default(false)->after('email_verified');
            $table->boolean('two_factor_enabled')->default(false)->after('phone_verified');
            $table->unsignedInteger('failed_login_attempts')->default(0)->after('two_factor_enabled');
            $table->timestamp('locked_until')->nullable()->after('failed_login_attempts');
            $table->timestamp('last_login_at')->nullable()->after('locked_until');
            $table->string('last_login_ip', 45)->nullable()->after('last_login_at');
            $table->string('profile_photo_url')->nullable()->after('last_login_ip');
            $table->json('doctor_profile')->nullable()->after('profile_photo_url');
            $table->json('nurse_profile')->nullable()->after('doctor_profile');
            $table->json('lab_tech_profile')->nullable()->after('nurse_profile');
            $table->json('pharmacist_profile')->nullable()->after('lab_tech_profile');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'tenant_id',
                'role',
                'full_name',
                'phone_country_code',
                'phone_number',
                'gender',
                'date_of_birth',
                'status',
                'email_verified',
                'phone_verified',
                'two_factor_enabled',
                'failed_login_attempts',
                'locked_until',
                'last_login_at',
                'last_login_ip',
                'profile_photo_url',
                'doctor_profile',
                'nurse_profile',
                'lab_tech_profile',
                'pharmacist_profile',
            ]);
        });
    }
};

