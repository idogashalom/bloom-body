<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Notification;
class NotificationController extends Controller {
    public function index() { return response()->json(Notification::where('is_active', true)->latest()->get()); }
}
