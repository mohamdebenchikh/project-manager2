<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Task extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'title',
        'description',
        'project_id',
        'team_id',
        'user_id',
        'priority',
        'status',
        'due_date',
        'start_date',
        'estimated_hours',
        'actual_hours',
        'labels',
        'is_milestone',
        'completion_percentage',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'due_date' => 'datetime',
        'start_date' => 'datetime',
        'estimated_hours' => 'float',
        'actual_hours' => 'float',
        'labels' => 'array',
        'is_milestone' => 'boolean',
        'completion_percentage' => 'integer',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array<string>
     */
    protected $appends = [
        'created_at_formatted',
        'due_date_formatted',
        'start_date_formatted'
    ];

    /**
     * Get the creator of the task.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the creator of the task (alias for user).
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the users assigned to the task.
     */
    public function assignees(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'task_user', 'task_id', 'user_id')
            ->withTimestamps();
    }

    /**
     * Get the project that owns the task.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the team that owns the task.
     */
    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    /**
     * Get the user that created the task.
     */
    public function creatorOriginal(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the users assigned to the task.
     */
    public function assigneesOriginal(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'task_user')
            ->withTimestamps()
            ->withPivot(['assigned_by']);
    }

    /**
     * Get the parent task.
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Task::class, 'parent_id');
    }

    /**
     * Get the subtasks.
     */
    public function subtasks()
    {
        return $this->hasMany(Task::class, 'parent_id');
    }

    /**
     * Get the comments on the task.
     */
    public function comments()
    {
        return $this->morphMany(Comment::class, 'commentable');
    }

    /**
     * Get the attachments for the task.
     */
    public function attachments()
    {
        return $this->morphMany(Attachment::class, 'attachable');
    }

    /**
     * Get the formatted created at date.
     */
    public function getCreatedAtFormattedAttribute(): ?string
    {
        return $this->created_at ? $this->created_at->diffForHumans() : null;
    }

    /**
     * Get the formatted due date.
     */
    public function getDueDateFormattedAttribute(): ?string
    {
        return $this->due_date ? $this->due_date->format('M d, Y') : null;
    }

    /**
     * Get the formatted start date.
     */
    public function getStartDateFormattedAttribute(): ?string
    {
        return $this->start_date ? $this->start_date->format('M d, Y') : null;
    }
}
