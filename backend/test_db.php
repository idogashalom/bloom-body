<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

echo "Default connection: " . config('database.default') . "\n";
echo "MySQL connection details: host=" . config('database.connections.mysql.host') . ", database=" . config('database.connections.mysql.database') . "\n";
echo "SQLite connection details: database=" . config('database.connections.sqlite.database') . "\n";

try {
    $mysqlUsers = DB::connection('mysql')->table('users')->get();
    echo "MySQL Users count: " . count($mysqlUsers) . "\n";
    foreach ($mysqlUsers as $u) {
        echo "  - {$u->email} (ID: {$u->id})\n";
    }
} catch (\Exception $e) {
    echo "MySQL query failed: " . $e->getMessage() . "\n";
}

try {
    config(['database.connections.sqlite.database' => database_path('database.sqlite')]);
    $sqliteUsers = DB::connection('sqlite')->table('users')->get();
    echo "SQLite Users count: " . count($sqliteUsers) . "\n";
    foreach ($sqliteUsers as $u) {
        echo "  - {$u->email} (ID: {$u->id})\n";
    }
} catch (\Exception $e) {
    echo "SQLite query failed: " . $e->getMessage() . "\n";
}
