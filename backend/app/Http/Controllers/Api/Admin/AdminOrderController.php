<?php
namespace App\Http\Controllers\Api\Admin;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Notification;
use App\Models\Order;
class AdminOrderController extends Controller {
    public function index(Request $request) {
        $query = Order::with(['user', 'items.product'])->orderBy('created_at', 'desc');
        if ($request->filled('delivery_date')) {
            $query->whereDate('delivery_date', $request->delivery_date);
        }
        return response()->json($query->get());
    }
    public function scheduleDelivery(Request $request) {
        $data = $request->validate([
            'schedule_group' => 'required|in:sun_wed,thu_sat',
        ]);

        $matchingDays = $data['schedule_group'] === 'sun_wed' ? [0, 1, 2, 3] : [4, 5, 6];
        $orders = Order::whereNotIn('status', ['Delivered', 'Cancelled'])
            ->get()
            ->filter(fn ($order) => in_array((int) $order->created_at->dayOfWeek, $matchingDays, true));

        foreach ($orders as $order) {
            $order->update([
                'delivery_date' => now()->toDateString(),
                'status' => 'Order On The Way',
            ]);
        }

        return response()->json([
            'message' => 'Delivery schedule updated.',
            'count' => $orders->count(),
        ]);
    }
    public function updateStatus(Request $request, $id) {
        $request->validate(['status' => 'required|in:Pending,Preparing,Order On The Way,Delivered,Cancelled']);
        $order = Order::findOrFail($id);
        $order->update(['status' => $request->status]);
        Notification::create([
            'title' => 'Order update',
            'message' => "Your order {$order->order_number} is now {$order->status}.",
            'type' => 'toast',
            'is_active' => true,
        ]);
        return response()->json($order->fresh(['user', 'items.product']));
    }
}
