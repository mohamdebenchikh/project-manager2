import { LucideProps } from "lucide-react";
import { ForwardRefExoticComponent, ReactNode, RefAttributes } from "react";

export interface Project {
    id:number;
    name:string;
    description:string;
    tasks:Task[];
}


export interface Task {
    id?: number;
    title: string;
    description: string | null;
    project_id: number | null;
    priority: string;
    status: string;
    due_date: string | null;
    start_date: string | null;
    estimated_hours: number | null;
    actual_hours: number | null;
    assignee_ids: number[];
    is_milestone: boolean;
    completion_percentage: number;
    creator?: User;
    labels: string[];
}


export interface Team {
    members: any;
    id: number;
    owner_id: number;
    name: string;
    description: string;
    personal_team: boolean;
    active:boolean;
    is_public: boolean;
}

export interface Notification {
    id: string;
    type: string;
    data: any;
    read_at: string | null;
    created_at: string;
}


export interface User {
    avatar: string | null;
    bio: string;
    id: number;
    name: string;
    email: string;
    email_verified_at: string;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>
> = T & {
    auth: {
        user: User;
        teams: Team[];
        current_team: Team;
        current_team_role: 'owner' | 'admin' | 'member';
    };
    notifications: {
        items: Notification[];
        unread_count: number;
    };
    teams: Team[];
    team: Team;
};

export type MenuItemProp = {
    title: string;
    href: string;
    icon?:
        | ForwardRefExoticComponent<
              Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
          >
        | ReactNode;
    variant:
        | "link"
        | "default"
        | "ghost"
        | "destructive"
        | "outline"
        | "secondary"
        | null
        | undefined;
};
