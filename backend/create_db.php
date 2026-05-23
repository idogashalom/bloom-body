<?php
try {
    $db = new PDO('mysql:host=127.0.0.1;port=3306', 'root', '');
    $db->exec('CREATE DATABASE IF NOT EXISTS bloom_body');
    echo "Database created successfully.\n";
} catch (PDOException $e) {
    echo 'Connection failed: ' . $e->getMessage();
    exit(1);
}
