import { useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { ProjectSelect } from "./project-select";
import { AssigneeSelect } from "./assignee-select";
import { StatusSelect } from "./status-select";
import { PrioritySelect } from "./priority-select";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Project, User, Task } from "@/types";
import { useForm as useHookForm } from "react-hook-form";

interface Props {
    task?: Task;
    projects: Project[];
    team_members: User[];
    statuses: string[];
    priorities: string[];
    className?: string;
}

export default function TaskForm({
    task,
    projects,
    team_members,
    statuses,
    priorities,
    className,
}: Props) {
    const { data, setData, post, put, processing, errors } = useForm({
        title: task?.title || "",
        description: task?.description || "",
        project_id: task?.project_id || null,
        priority: task?.priority || "low",
        status: task?.status || "open",
        due_date: task?.due_date || "",
        start_date: task?.start_date || "",
        estimated_hours: task?.estimated_hours || 0,
        actual_hours: task?.actual_hours || 0,
        is_milestone: task?.is_milestone || false,
        completion_percentage: task?.completion_percentage || 0,
        labels: task?.labels || [],
        assignee_ids:
            task?.assignee_ids?.map((assignee_id) => assignee_id) || [],
    });

    const form = useHookForm({
        defaultValues: {
            title: task?.title || "",
            description: task?.description || "",
            project_id: task?.project_id || null,
            priority: task?.priority || "low",
            status: task?.status || "open",
            due_date: task?.due_date || "",
            start_date: task?.start_date || "",
            estimated_hours: task?.estimated_hours || 0,
            actual_hours: task?.actual_hours || 0,
            is_milestone: task?.is_milestone || false,
            completion_percentage: task?.completion_percentage || 0,
            labels: task?.labels || [],
            assignee_ids:
                task?.assignee_ids?.map((assignee_id) => assignee_id) || [],
        },
    });

    const onSubmit = (formData: any) => {
        if (task) {
            put(route("tasks.update", task.id), formData);
        } else {
            post(route("tasks.store"), formData);
        }
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className={cn("space-y-8", className)}
            >
                <FormField
                    name="title"
                    render={() => (
                        <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                                <Input
                                    value={data.title}
                                    onChange={(e) =>
                                        setData("title", e.target.value)
                                    }
                                />
                            </FormControl>
                            <FormMessage>{errors.title}</FormMessage>
                        </FormItem>
                    )}
                />

                <FormField
                    name="description"
                    render={() => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    value={data.description}
                                    onChange={(e) =>
                                        setData("description", e.target.value)
                                    }
                                />
                            </FormControl>
                            <FormMessage>{errors.description}</FormMessage>
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        name="project_id"
                        render={() => (
                            <FormItem>
                                <FormControl>
                                    <ProjectSelect
                                        value={data.project_id}
                                        onChange={(value) =>
                                            setData("project_id", value)
                                        }
                                        projects={projects}
                                    />
                                </FormControl>
                                <FormMessage>{errors.project_id}</FormMessage>
                            </FormItem>
                        )}
                    />

                    <FormField
                        name="assignee_ids"
                        render={() => (
                            <FormItem>
                                <FormControl>
                                    <AssigneeSelect
                                        value={data.assignee_ids}
                                        onChange={(value) =>
                                            setData("assignee_ids", value)
                                        }
                                        teamMembers={team_members}
                                    />
                                </FormControl>
                                <FormMessage>{errors.assignee_ids}</FormMessage>
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        name="status"
                        render={() => (
                            <FormItem>
                                <FormControl>
                                    <StatusSelect
                                        value={data.status}
                                        onChange={(value) =>
                                            setData("status", value)
                                        }
                                        statuses={statuses}
                                    />
                                </FormControl>
                                <FormMessage>{errors.status}</FormMessage>
                            </FormItem>
                        )}
                    />

                    <FormField
                        name="priority"
                        render={() => (
                            <FormItem>
                                <FormControl>
                                    <PrioritySelect
                                        value={data.priority}
                                        onChange={(value) =>
                                            setData("priority", value)
                                        }
                                        priorities={priorities}
                                    />
                                </FormControl>
                                <FormMessage>{errors.priority}</FormMessage>
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        name="start_date"
                        render={() => (
                            <FormItem>
                                <FormLabel>Start Date</FormLabel>
                                <FormControl>
                                    <DatePicker
                                        value={
                                            data.start_date
                                                ? new Date(data.start_date)
                                                : undefined
                                        }
                                        onChange={(value) =>
                                            setData(
                                                "start_date",
                                                value
                                                    ? value
                                                          .toISOString()
                                                          .split("T")[0]
                                                    : ""
                                            )
                                        }
                                    />
                                </FormControl>
                                <FormMessage>{errors.start_date}</FormMessage>
                            </FormItem>
                        )}
                    />

                    <FormField
                        name="due_date"
                        render={() => (
                            <FormItem>
                                <FormLabel>Due Date</FormLabel>
                                <FormControl>
                                    <DatePicker
                                        value={
                                            data.due_date
                                                ? new Date(data.due_date)
                                                : undefined
                                        }
                                        onChange={(value) =>
                                            setData(
                                                "due_date",
                                                value
                                                    ? value
                                                          .toISOString()
                                                          .split("T")[0]
                                                    : ""
                                            )
                                        }
                                    />
                                </FormControl>
                                <FormMessage>{errors.due_date}</FormMessage>
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        name="estimated_hours"
                        render={() => (
                            <FormItem>
                                <FormLabel>Estimated Hours</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        value={data.estimated_hours}
                                        onChange={(e) =>
                                            setData(
                                                "estimated_hours",
                                                parseFloat(e.target.value)
                                            )
                                        }
                                    />
                                </FormControl>
                                <FormMessage>
                                    {errors.estimated_hours}
                                </FormMessage>
                            </FormItem>
                        )}
                    />

                    <FormField
                        name="actual_hours"
                        render={() => (
                            <FormItem>
                                <FormLabel>Actual Hours</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        value={data.actual_hours}
                                        onChange={(e) =>
                                            setData(
                                                "actual_hours",
                                                parseFloat(e.target.value)
                                            )
                                        }
                                    />
                                </FormControl>
                                <FormMessage>{errors.actual_hours}</FormMessage>
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        name="is_milestone"
                        render={() => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                    <Checkbox
                                        checked={data.is_milestone}
                                        onCheckedChange={(checked) =>
                                            setData(
                                                "is_milestone",
                                                checked ? true : false
                                            )
                                        }
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>Is Milestone</FormLabel>
                                    <FormDescription>
                                        Mark this task as a milestone
                                    </FormDescription>
                                </div>
                                <FormMessage>{errors.is_milestone}</FormMessage>
                            </FormItem>
                        )}
                    />

                    <FormField
                        name="completion_percentage"
                        render={() => (
                            <FormItem>
                                <FormLabel>Completion Percentage</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={data.completion_percentage}
                                        onChange={(e) =>
                                            setData(
                                                "completion_percentage",
                                                parseInt(e.target.value)
                                            )
                                        }
                                    />
                                </FormControl>
                                <FormMessage>
                                    {errors.completion_percentage}
                                </FormMessage>
                            </FormItem>
                        )}
                    />
                </div>

                <Button type="submit" disabled={processing}>
                    {task ? "Update Task" : "Create Task"}
                </Button>
            </form>
        </Form>
    );
}
