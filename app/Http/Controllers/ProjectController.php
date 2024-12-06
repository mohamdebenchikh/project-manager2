<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Team;
use Gate;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProjectController extends Controller
{
    /**
     * Display a listing of the projects.
     */
    public function index()
    {
        $team = auth()->user()->currentTeam;
        
        return Inertia::render('projects/index', [
            'projects' => $team->projects()
                ->with(['user', 'team'])
                ->latest()
                ->get()
        ]);
    }

    /**
     * Show the form for creating a new project.
     */
    public function create()
    {
        return Inertia::render('projects/create');
    }

    /**
     * Store a newly created project in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        $project = $request->user()->projects()->create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'team_id' => $request->user()->currentTeam->id,
        ]);

        return redirect()->route('projects.show', $project)->with('success', 'Project created successfully.');
    }

    /**
     * Display the specified project.
     */
    public function show(Project $project)
    {
        Gate::authorize('viewProject', $project);

        $project->load(['user', 'team', 'tasks' => function ($query) {
            $query->with(['user', 'assignees'])
                  ->latest()
                  ->take(5);
        }]);

        return Inertia::render('projects/show', [
            'project' => $project
        ]);
    }

    /**
     * Update the specified project in storage.
     */
    public function update(Request $request, Project $project)
    {
        Gate::authorize('updateProject', $project);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        $project->update([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
        ]);

        return redirect()->route('projects.show', $project)->with('success', 'Project updated successfully.');
    }

    /**
     * Remove the specified project from storage.
     */
    public function destroy(Project $project)
    {
        Gate::authorize('deleteProject', $project);

        $project->delete();

        return redirect()->route('projects.index')->with('success', 'Project deleted successfully.');
    }
}
