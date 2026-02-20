<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class AdminUserController extends Controller
{
    private function ensureAdmin(Request $request): void
    {
        $user = $request->user();
        abort_unless($user && ($user->role ?? null) === 'admin', 403);
    }

    public function index(Request $request)
    {
        $this->ensureAdmin($request);

        $q = trim((string) $request->query('q', ''));

        // Filter: all | confirmed | blocked
        $statusFilter = (string) $request->query('status', 'all');
        if (!in_array($statusFilter, ['all', 'confirmed', 'blocked'], true)) {
            $statusFilter = 'all';
        }

        // Sort: created_at | name
        $sort = (string) $request->query('sort', 'created_at');
        if (!in_array($sort, ['created_at', 'name'], true)) {
            $sort = 'created_at';
        }

        // Dir: asc | desc
        $dir = (string) $request->query('dir', 'desc');
        if (!in_array($dir, ['asc', 'desc'], true)) {
            $dir = 'desc';
        }

        // Card oben: alle neuen Accounts (status=0)
        $pending = User::query()
            ->where('status', 0)
            ->orderByDesc('created_at')
            ->get([
                'id',
                'name',
                'email',
                'role',
                'created_at',
                'email_verified_at',
                'status',
                'notes',
            ]);

        // Card unten: alle anderen (status != 0)
        $usersQuery = User::query()->where('status', '!=', 0);

        if ($q !== '') {
            $usersQuery->where(function ($sub) use ($q) {
                $sub->where('name', 'like', "%{$q}%")
                    ->orWhere('email', 'like', "%{$q}%");
            });
        }

        if ($statusFilter === 'confirmed') {
            $usersQuery->where('status', 1);
        } elseif ($statusFilter === 'blocked') {
            $usersQuery->where('status', 2);
        }

        if ($sort === 'name') {
            $usersQuery->orderBy('name', $dir)->orderBy('created_at', 'desc');
        } else {
            $usersQuery->orderBy('created_at', $dir)->orderBy('name', 'asc');
        }

        $users = $usersQuery
            ->select(['id', 'name', 'email', 'role', 'created_at', 'email_verified_at', 'status', 'notes'])
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Users/Index', [
            'pending' => $pending,
            'users' => $users,
            'filters' => [
                'q' => $q,
                'status' => $statusFilter,
                'sort' => $sort,
                'dir' => $dir,
            ],
        ]);
    }

    public function confirm(Request $request, User $user)
    {
        $this->ensureAdmin($request);

        $user->status = 1;
        if ($user->email_verified_at === null) {
            $user->email_verified_at = now();
        }
        $user->save();

        return back()->with('success', 'Account freigegeben.');
    }

    public function block(Request $request, User $user)
    {
        $this->ensureAdmin($request);

        $user->status = 2;
        $user->save();

        return back()->with('success', 'Account wurde blockiert.');
    }

    public function edit(Request $request, User $user)
    {
        $this->ensureAdmin($request);

        return Inertia::render('Admin/Users/Edit', [
            'user' => $user->only([
                'id',
                'name',
                'email',
                'role',
                'status',
                'notes',
                'created_at',
                'email_verified_at',
            ]),
            'roleOptions' => ['user', 'host', 'admin'],
        ]);
    }

    public function update(Request $request, User $user)
    {
        $this->ensureAdmin($request);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'role' => ['required', 'string', Rule::in(['user', 'host', 'admin'])],
            'status' => ['required', 'integer', Rule::in([0, 1, 2])], // 0 New, 1 Confirmed, 2 Blocked
            'notes' => ['required', 'string'],
        ]);

        if ((int) $validated['status'] === 1 && $user->email_verified_at === null) {
            $user->email_verified_at = now();
        }

        $user->fill($validated)->save();

        return redirect()->route('admin.users.index')->with('success', 'User gespeichert.');
    }
}