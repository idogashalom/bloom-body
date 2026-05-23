<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Testimonial;
class TestimonialController extends Controller {
    public function index() { return response()->json(Testimonial::with('user')->where('is_approved', true)->get()); }
    public function store(Request $request) {
        $request->validate(['content' => 'required|string', 'rating' => 'required|integer|min:1|max:5']);
        $test = Testimonial::create(['user_id' => $request->user()->id, 'content' => $request->content, 'rating' => $request->rating]);
        return response()->json($test);
    }
    public function like($id) {
        $test = Testimonial::findOrFail($id);
        $test->increment('likes');
        return response()->json($test);
    }
}