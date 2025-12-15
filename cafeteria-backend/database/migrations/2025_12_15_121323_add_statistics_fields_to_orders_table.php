<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Add fields for better statistics and analysis
            $table->string('order_source')->default('web')->after('payment_status'); // web, mobile, kiosk
            $table->integer('preparation_time_minutes')->nullable()->after('order_source'); // actual preparation time
            $table->integer('queue_position')->nullable()->after('preparation_time_minutes'); // position in queue when ordered
            $table->decimal('discount_amount', 8, 2)->default(0)->after('queue_position'); // any discounts applied
            $table->string('payment_method')->default('balance')->after('discount_amount'); // balance, card, cash
            $table->integer('items_count')->default(0)->after('payment_method'); // total number of items
            $table->decimal('average_item_price', 8, 2)->default(0)->after('items_count'); // average price per item
            $table->boolean('is_repeat_customer')->default(false)->after('average_item_price'); // if user has ordered before
            $table->integer('customer_order_count')->default(1)->after('is_repeat_customer'); // how many orders this customer has made
            $table->time('order_time')->nullable()->after('customer_order_count'); // time of day order was placed
            $table->string('day_of_week')->nullable()->after('order_time'); // day of week
            $table->boolean('is_peak_hour')->default(false)->after('day_of_week'); // if ordered during peak hours
            $table->text('customer_notes')->nullable()->after('is_peak_hour'); // any customer feedback or notes
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'order_source',
                'preparation_time_minutes',
                'queue_position',
                'discount_amount',
                'payment_method',
                'items_count',
                'average_item_price',
                'is_repeat_customer',
                'customer_order_count',
                'order_time',
                'day_of_week',
                'is_peak_hour',
                'customer_notes'
            ]);
        });
    }
};