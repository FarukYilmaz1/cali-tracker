export type Category = 'Push' | 'Pull' | 'Elite';

export interface Set {
    reps: string; // Changed to string to allow flexible input like "10" or "10s" or "Fail" if user wants, though prompt says [Input Reps] [Input Weight/Time]
    weightOrTime: string;
}

export interface SkillLevel {
    level: number;
    name: string;
    goal: string;
}

export interface Exercise {
    id: string;
    name: string;
    category: Category;
    // Specific to Elite Skills
    isElite?: boolean;
    roadmap?: SkillLevel[];
}

export interface Session {
    id: string;
    exerciseId: string;
    timestamp: number;
    sets: Set[];
    durationSeconds: number;
}

export interface WorkoutLog {
    [exerciseId: string]: Session[];
}

export interface UserSettings {
    // For elite skills tracking
    skillProgress: Record<string, number>; // exerciseId -> currentLevel (1-based)
}
