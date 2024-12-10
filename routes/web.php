<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\TeamInvitationController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\FileUploadController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('dashboard');
})->middleware(['auth'])->name('dashboard');

Route::middleware(['auth'])->group(function () {

    // Profile routes
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::patch('/profile/avatar', [ProfileController::class, 'updateAvatar'])->name('profile.updateAvatar');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Teams routes
    Route::get('/teams', [TeamController::class, 'index'])->name('teams.index');
    Route::post('/teams/switch', [TeamController::class, 'switch'])->name('teams.switch');
    Route::get('/teams/create', [TeamController::class, 'create'])->name('teams.create');
    Route::post('/teams', [TeamController::class, 'store'])->name('teams.store');
    Route::get('/teams/{team}', [TeamController::class, 'show'])->name('teams.show');
    Route::get('/teams/{team}/settings', [TeamController::class, 'settings'])->name('teams.settings');
    Route::patch('/teams/{team}', [TeamController::class, 'update'])->name('teams.update');
    Route::patch('/teams/{team}/members/{member}', [TeamController::class, 'updateMemberRole'])
        ->name('teams.update-member-role');
    Route::delete('/teams/{team}/members/{member}', [TeamController::class, 'removeMember'])
        ->name('teams.remove-member');
    Route::patch('/teams/{team}/status', [TeamController::class, 'updateStatus'])->name('teams.update-status');
    Route::delete('/teams/{team}', [TeamController::class, 'destroy'])->name('teams.destroy');
    Route::get('/current-team-settings', [TeamController::class, 'currentTeamSettings'])->name('current-team-settings');
    

    // file upload
    Route::post('/files', [FileUploadController::class, 'upload'])->name('upload');
    Route::delete('/files', [FileUploadController::class, 'destroy'])->name('upload.destroy');



    // Projects
    Route::resource('projects', ProjectController::class);

    // Tasks
    Route::resource('tasks', TaskController::class);
    Route::patch('/tasks/{task}/status', [TaskController::class, 'updateStatus'])->name('tasks.update-status');
    Route::patch('/tasks/{task}/assignees', [TaskController::class, 'updateAssignees'])->name('tasks.update-assignees');

    // Team Invitations
    Route::get('/teams/{team}/users/search', [TeamInvitationController::class, 'search'])->name('teams.search-users');
    Route::post('/teams/{team}/invitations', [TeamInvitationController::class, 'invite'])->name('team-invitations.send');
    Route::post('/invitations/{token}/accept', [TeamInvitationController::class, 'accept'])->name('team-invitations.accept');
    Route::post('/invitations/{token}/decline', [TeamInvitationController::class, 'decline'])->name('team-invitations.decline');
    Route::delete('/teams/{team}/invitations/{invitation}', [TeamInvitationController::class, 'destroy'])->name('team-invitations.destroy');
    Route::post('/teams/{team}/invitations/{invitation}/remind', [TeamInvitationController::class, 'remind'])->name('team-invitations.remind');

    // Notifications Routes
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/{id}/mark-as-read', [NotificationController::class, 'markAsRead'])->name('notifications.mark-as-read');
    Route::post('/notifications/mark-all-as-read', [NotificationController::class, 'markAllAsRead'])->name('notifications.mark-all-as-read');
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy'])->name('notifications.destroy');
});

require __DIR__.'/auth.php';
