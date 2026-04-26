<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenants', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('subdomain')->unique();
            $table->string('plan')->default('starter');
            $table->string('status')->default('active');
            $table->json('branding')->nullable();
            $table->json('address')->nullable();
            $table->json('limits')->nullable();
            $table->json('usage')->nullable();
            $table->timestamp('subscription_started_at')->nullable();
            $table->timestamp('subscription_renews_at')->nullable();
            $table->timestamps();
        });

        Schema::create('patients', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('tenant_id')->index();
            $table->unsignedBigInteger('user_id')->nullable()->index();
            $table->string('mrn')->unique();
            $table->string('full_name');
            $table->date('date_of_birth');
            $table->string('gender', 16);
            $table->string('marital_status', 32)->nullable();
            $table->string('nid_number')->nullable()->unique();
            $table->string('birth_certificate_number')->nullable();
            $table->string('blood_group', 8)->nullable();
            $table->string('phone_country_code', 8);
            $table->string('phone_number', 20);
            $table->string('email')->nullable();
            $table->string('profile_photo_url')->nullable();
            $table->json('address')->nullable();
            $table->string('occupation')->nullable();
            $table->json('emergency_contacts')->nullable();
            $table->json('medical_history')->nullable();
            $table->string('patient_type', 32)->default('self_registered');
            $table->string('guardian_id')->nullable();
            $table->unsignedInteger('age_years')->nullable();
            $table->timestamp('last_visit_date')->nullable();
            $table->unsignedInteger('total_visits')->default(0);
            $table->decimal('outstanding_balance_bdt', 12, 2)->default(0);
            $table->timestamps();
        });

        Schema::create('appointments', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('tenant_id')->index();
            $table->string('appointment_number')->unique();
            $table->string('patient_id')->index();
            $table->unsignedBigInteger('doctor_id')->index();
            $table->string('department')->nullable();
            $table->string('appointment_type', 32);
            $table->string('status', 32)->index();
            $table->string('source', 32)->default('online_patient');
            $table->timestamp('scheduled_at');
            $table->unsignedInteger('duration_minutes')->default(30);
            $table->text('reason')->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('checked_in_at')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->string('cancellation_reason')->nullable();
            $table->unsignedBigInteger('cancelled_by')->nullable();
            $table->decimal('fee_bdt', 12, 2)->default(0);
            $table->string('payment_status', 16)->default('pending');
            $table->string('video_link')->nullable();
            $table->string('video_room_id')->nullable();
            $table->boolean('reminder_24h_sent')->default(false);
            $table->boolean('reminder_2h_sent')->default(false);
            $table->timestamps();
        });

        Schema::create('prescriptions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('tenant_id')->index();
            $table->string('prescription_number')->unique();
            $table->string('appointment_id')->nullable()->index();
            $table->string('patient_id')->index();
            $table->unsignedBigInteger('doctor_id')->index();
            $table->string('diagnosis')->nullable();
            $table->string('diagnosis_icd10')->nullable();
            $table->text('chief_complaint')->nullable();
            $table->json('vital_signs')->nullable();
            $table->json('medicines')->nullable();
            $table->text('advice')->nullable();
            $table->timestamp('follow_up_date')->nullable();
            $table->boolean('follow_up_reminder_set')->default(false);
            $table->string('status', 32)->default('draft');
            $table->timestamp('signed_at')->nullable();
            $table->json('acknowledged_warnings')->nullable();
            $table->timestamps();
        });

        Schema::create('lab_tests', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('tenant_id')->index();
            $table->string('test_number')->unique();
            $table->string('patient_id')->index();
            $table->unsignedBigInteger('ordered_by_doctor_id')->nullable()->index();
            $table->unsignedBigInteger('entered_by_technician_id')->nullable()->index();
            $table->string('catalog_item_id')->nullable();
            $table->string('test_name');
            $table->string('test_code')->nullable();
            $table->string('category')->nullable();
            $table->string('priority', 16)->default('routine');
            $table->string('status', 32)->index();
            $table->timestamp('ordered_at')->nullable();
            $table->timestamp('sample_collected_at')->nullable();
            $table->timestamp('result_entered_at')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->timestamp('reported_at')->nullable();
            $table->json('results')->nullable();
            $table->string('overall_flag', 16)->nullable();
            $table->text('clinical_notes')->nullable();
            $table->decimal('price_bdt', 12, 2)->default(0);
            $table->string('payment_status', 16)->default('pending');
            $table->boolean('critical_alert_triggered')->default(false);
            $table->timestamp('critical_alert_sent_at')->nullable();
            $table->timestamps();
        });

        Schema::create('medicine_inventories', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('tenant_id')->index();
            $table->string('medicine_id')->index();
            $table->string('generic_name');
            $table->string('brand_name')->nullable();
            $table->string('strength')->nullable();
            $table->string('manufacturer')->nullable();
            $table->string('batch_number')->nullable();
            $table->date('manufacture_date')->nullable();
            $table->date('expiry_date')->nullable();
            $table->integer('current_stock')->default(0);
            $table->integer('min_threshold')->default(0);
            $table->integer('max_threshold')->default(0);
            $table->decimal('unit_cost_bdt', 12, 2)->default(0);
            $table->decimal('selling_price_bdt', 12, 2)->default(0);
            $table->boolean('is_expired')->default(false);
            $table->boolean('is_low_stock')->default(false);
            $table->boolean('is_out_of_stock')->default(false);
            $table->timestamps();
        });

        Schema::create('pharmacy_orders', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('tenant_id')->index();
            $table->string('order_number')->unique();
            $table->string('prescription_id')->nullable()->index();
            $table->string('patient_id')->index();
            $table->string('status', 32)->index();
            $table->decimal('total_amount_bdt', 12, 2)->default(0);
            $table->json('items')->nullable();
            $table->unsignedBigInteger('dispensed_by')->nullable();
            $table->timestamp('dispensed_at')->nullable();
            $table->string('payment_status', 16)->default('pending');
            $table->timestamps();
        });

        Schema::create('wards', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('tenant_id')->index();
            $table->string('name');
            $table->string('ward_type', 32);
            $table->string('floor')->nullable();
            $table->unsignedInteger('total_beds')->default(0);
            $table->unsignedInteger('available_beds')->default(0);
            $table->unsignedInteger('occupied_beds')->default(0);
            $table->unsignedInteger('reserved_beds')->default(0);
            $table->unsignedInteger('maintenance_beds')->default(0);
            $table->decimal('occupancy_rate', 5, 2)->default(0);
            $table->unsignedInteger('capacity_threshold')->default(90);
            $table->boolean('threshold_alert_sent')->default(false);
            $table->decimal('daily_rate_bdt', 12, 2)->default(0);
            $table->unsignedBigInteger('head_nurse_id')->nullable();
            $table->timestamps();
        });

        Schema::create('beds', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('tenant_id')->index();
            $table->string('ward_id')->index();
            $table->string('bed_number');
            $table->string('status', 32)->index();
            $table->boolean('has_oxygen')->default(false);
            $table->boolean('has_ventilator')->default(false);
            $table->boolean('has_monitor')->default(false);
            $table->decimal('daily_rate_bdt', 12, 2)->default(0);
            $table->string('current_patient_id')->nullable()->index();
            $table->timestamp('admission_date')->nullable();
            $table->timestamp('expected_discharge_date')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();
        });

        Schema::create('bills', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('tenant_id')->index();
            $table->string('bill_number')->unique();
            $table->string('patient_id')->index();
            $table->string('status', 16)->index();
            $table->timestamp('bill_date')->nullable();
            $table->json('line_items')->nullable();
            $table->decimal('subtotal_bdt', 12, 2)->default(0);
            $table->decimal('total_tax_bdt', 12, 2)->default(0);
            $table->decimal('total_discount_bdt', 12, 2)->default(0);
            $table->decimal('total_amount_bdt', 12, 2)->default(0);
            $table->decimal('amount_paid_bdt', 12, 2)->default(0);
            $table->decimal('amount_outstanding_bdt', 12, 2)->default(0);
            $table->json('payments')->nullable();
            $table->unsignedBigInteger('discount_applied_by')->nullable();
            $table->string('discount_reason')->nullable();
            $table->timestamps();
        });

        Schema::create('alerts', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('tenant_id')->index();
            $table->string('trigger_type')->index();
            $table->string('severity', 16)->index();
            $table->string('status', 32)->index();
            $table->string('title');
            $table->text('message');
            $table->string('patient_id')->nullable()->index();
            $table->string('reference_type')->nullable();
            $table->string('reference_id')->nullable()->index();
            $table->json('recipients')->nullable();
            $table->json('channels')->nullable();
            $table->json('dispatch_attempts')->nullable();
            $table->timestamp('triggered_at')->nullable();
            $table->timestamp('first_delivered_at')->nullable();
            $table->timestamp('acknowledged_at')->nullable();
            $table->boolean('escalated')->default(false);
            $table->string('action_url')->nullable();
            $table->timestamps();
        });

        Schema::create('notifications', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('alert_id')->nullable()->index();
            $table->unsignedBigInteger('user_id')->nullable()->index();
            $table->string('title');
            $table->text('message');
            $table->string('severity', 16)->default('low');
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->string('action_url')->nullable();
            $table->timestamps();
        });

        Schema::create('emergency_requests', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('tenant_id')->index();
            $table->string('request_number')->unique();
            $table->string('patient_id')->nullable()->index();
            $table->string('patient_name')->nullable();
            $table->string('patient_phone_country_code', 8)->nullable();
            $table->string('patient_phone_number', 20)->nullable();
            $table->string('requester_name')->nullable();
            $table->string('requester_relationship')->nullable();
            $table->json('pickup_location')->nullable();
            $table->string('destination_hospital_id')->nullable();
            $table->string('destination_hospital_name')->nullable();
            $table->string('status', 32)->index();
            $table->string('priority', 16)->default('medium');
            $table->text('chief_complaint')->nullable();
            $table->json('reported_vitals')->nullable();
            $table->unsignedBigInteger('dispatcher_id')->nullable();
            $table->string('dispatcher_name')->nullable();
            $table->string('ambulance_id')->nullable();
            $table->string('ambulance_number')->nullable();
            $table->timestamp('sos_received_at')->nullable();
            $table->timestamp('dispatcher_assigned_at')->nullable();
            $table->timestamp('ambulance_assigned_at')->nullable();
            $table->timestamp('ambulance_dispatched_at')->nullable();
            $table->timestamp('estimated_arrival_time')->nullable();
            $table->boolean('er_pre_notification_sent')->default(false);
            $table->timestamp('er_pre_notification_sent_at')->nullable();
            $table->timestamps();
        });

        Schema::create('health_timeline_events', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('patient_id')->index();
            $table->string('event_type', 32)->index();
            $table->timestamp('event_date')->index();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('doctor_name')->nullable();
            $table->string('department')->nullable();
            $table->string('attachment_url')->nullable();
            $table->string('reference_id')->nullable()->index();
            $table->string('icon')->nullable();
            $table->timestamps();
        });

        Schema::create('doctor_performances', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->unsignedBigInteger('doctor_id')->index();
            $table->unsignedInteger('patients_seen')->default(0);
            $table->decimal('revenue_generated_bdt', 12, 2)->default(0);
            $table->unsignedInteger('avg_appointment_minutes')->default(0);
            $table->decimal('patient_satisfaction_score', 3, 2)->default(0);
            $table->timestamps();
        });

        Schema::create('analytics_series', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->string('series_key')->index();
            $table->string('label');
            $table->decimal('value', 14, 2);
            $table->timestamps();
        });

        Schema::create('audit_logs', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('tenant_id')->nullable()->index();
            $table->unsignedBigInteger('user_id')->nullable()->index();
            $table->string('action');
            $table->string('record_type')->nullable();
            $table->string('record_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('analytics_series');
        Schema::dropIfExists('doctor_performances');
        Schema::dropIfExists('health_timeline_events');
        Schema::dropIfExists('emergency_requests');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('alerts');
        Schema::dropIfExists('bills');
        Schema::dropIfExists('beds');
        Schema::dropIfExists('wards');
        Schema::dropIfExists('pharmacy_orders');
        Schema::dropIfExists('medicine_inventories');
        Schema::dropIfExists('lab_tests');
        Schema::dropIfExists('prescriptions');
        Schema::dropIfExists('appointments');
        Schema::dropIfExists('patients');
        Schema::dropIfExists('tenants');
    }
};

