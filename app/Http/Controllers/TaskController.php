<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\Project;
use App\Models\Team;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Gate;
use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;

class TaskController extends Controller
{
    /**
     * Display a listing of the tasks.
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        $team = $user->currentTeam;

        $query = $team->tasks()
            ->with(['creator', 'assignees', 'project'])
            ->when($request->status, function ($query, $status) {
                return $query->where('status', $status);
            })
            ->when($request->priority, function ($query, $priority) {
                return $query->where('priority', $priority);
            })
            ->when($request->search, function ($query, $search) {
                return $query->where(function ($query) use ($search) {
                    $query->where('title', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            });

        $tasks = $query->latest()
            ->get()
            ->map(function ($task) {
                return array_merge($task->toArray(), [
                    'created_at_formatted' => $task->created_at->diffForHumans(),
                    'due_date_formatted' => $task->due_date?->format('M d, Y'),
                ]);
            });

        return Inertia::render('tasks/index', [
            'tasks' => $tasks,
            'filters' => [
                'status' => $request->status,
                'priority' => $request->priority,
                'search' => $request->search,
            ],
            'statuses' => ['open', 'in_progress', 'review', 'completed', 'closed'],
            'priorities' => ['low', 'medium', 'high', 'urgent'],
        ]);
    }

    /**
     * Show the form for creating a new task.
     */
    public function create()
    {
        $team = auth()->user()->currentTeam;
        
        return Inertia::render('tasks/create', [
            'projects' => $team->projects,
            'team_members' => $team->members,
            'statuses' => ['open', 'in_progress', 'review', 'completed', 'closed'],
            'priorities' => ['low', 'medium', 'high', 'urgent'],
        ]);
    }

    /**
     * Store a newly created task in storage.
     */
    public function store(StoreTaskRequest $request)
    {
        $task = Task::create([
            'title' => $request->title,
            'description' => $request->description,
            'project_id' => $request->project_id ?: null,
            'team_id' => auth()->user()->currentTeam->id,
            'user_id' => auth()->id(),
            'priority' => $request->priority,
            'status' => $request->status,
            'due_date' => $request->due_date,
            'start_date' => $request->start_date,
            'estimated_hours' => $request->estimated_hours,
            'actual_hours' => $request->actual_hours,
            'is_milestone' => $request->is_milestone,
            'completion_percentage' => $request->completion_percentage,
        ]);

        if ($request->assignee_ids) {
            $task->assignees()->sync($request->assignee_ids);
        }

        return redirect()->route('tasks.show', $task->id);
    }

    /**
     * Display the specified task.
     */
    public function show(Task $task)
    {
        Gate::authorize('viewTask', $task);

        $task->load(['user', 'team', 'project', 'assignees']);
        $team = auth()->user()->currentTeam;

        return Inertia::render('tasks/show', [
            'task' => $task,
            'team_members' => $team->members()->get(),
            'statuses' => ['open', 'in_progress', 'review', 'completed', 'closed'],
            'priorities' => ['low', 'medium', 'high', 'urgent'],
        ]);
    }

    /**
     * Show the form for editing the specified task.
     */
    public function edit(Task $task)
    {
        Gate::authorize('update', $task);
        
        $team = auth()->user()->currentTeam;
        
        return Inertia::render('tasks/edit', [
            'task' => array_merge($task->load(['assignees', 'project'])->toArray(), [
                'created_at_formatted' => $task->created_at->diffForHumans(),
                'due_date_formatted' => $task->due_date?->format('M d, Y'),
            ]),
            'projects' => $team->projects,
            'team_members' => $team->members,
            'statuses' => ['open', 'in_progress', 'review', 'completed', 'closed'],
            'priorities' => ['low', 'medium', 'high', 'urgent'],
        ]);
    }

    /**
     * Update the specified task in storage.
     */
    public function update(UpdateTaskRequest $request, Task $task)
    {
        Gate::authorize('update', $task);

        $task->update([
            'title' => $request->title,
            'description' => $request->description,
            'project_id' => $request->project_id ?: null,
            'priority' => $request->priority,
            'status' => $request->status,
            'due_date' => $request->due_date,
            'start_date' => $request->start_date,
            'estimated_hours' => $request->estimated_hours,
            'actual_hours' => $request->actual_hours,
            'is_milestone' => $request->is_milestone,
            'completion_percentage' => $request->completion_percentage,
        ]);

        if ($request->assignee_ids) {
            $task->assignees()->sync($request->assignee_ids);
        }

        return redirect()->route('tasks.show', $task->id);
    }

    /**
     * Remove the specified task from storage.
     */
    public function destroy(Task $task)
    {
        Gate::authorize('delete', $task);

        $task->delete();

        return redirect()->route('tasks.index')->with('success', 'Task deleted successfully.');
    }
}
