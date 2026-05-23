<?php
namespace App\Http\Controllers\Api\Admin;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Notification;
class AdminNotificationController extends Controller {
    public function index() { return response()->json(Notification::orderBy('created_at', 'desc')->get()); }
    public function store(Request $request) {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'message' => 'nullable|string',
            'type' => 'required|in:toast,banner,image,video',
            'image' => 'nullable|string',
            'is_active' => 'boolean',
        ]);
        if ($data['type'] === 'image') {
            $data['type'] = 'banner';
        }
        return response()->json(Notification::create($data));
    }
    public function destroy($id) {
        Notification::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
