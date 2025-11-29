import { Exercise } from '../types';

export const EXERCISES: Exercise[] = [
    // --- PUSH ---
    { id: 'push-1', name: 'Pushups', category: 'Push' },
    { id: 'push-2', name: 'Diamond Pushups', category: 'Push' },
    { id: 'push-3', name: 'Decline Pushups', category: 'Push' },
    { id: 'push-4', name: 'Explosive Pushups', category: 'Push' },
    { id: 'push-5', name: 'Dips', category: 'Push' },
    { id: 'push-6', name: 'Pike Pushups', category: 'Push' },
    { id: 'push-7', name: 'Handstand Hold (Wall)', category: 'Push' },
    { id: 'push-8', name: 'Pseudo Planche Pushups', category: 'Push' },
    { id: 'push-9', name: 'Scapula Shrugs', category: 'Push' },
    { id: 'push-10', name: 'Dynamic Planche Lean', category: 'Push' },

    // --- PULL ---
    { id: 'pull-1', name: 'Australian Face Pull', category: 'Pull' },
    { id: 'pull-2', name: 'Supermans', category: 'Pull' },
    { id: 'pull-3', name: 'Chin ups', category: 'Pull' },
    { id: 'pull-4', name: 'Pull ups', category: 'Pull' },
    { id: 'pull-5', name: 'Wide Pull ups', category: 'Pull' },

    // --- ELITE SKILLS ---
    {
        id: 'elite-1',
        name: 'Handstand',
        category: 'Elite',
        isElite: true,
        roadmap: [
            { level: 1, name: 'Wall Hold', goal: 'Hold 30s' },
            { level: 2, name: 'Kick up to Wall', goal: '5 reps' },
            { level: 3, name: 'Freestanding Tuck Hold', goal: 'Hold 5s' },
            { level: 4, name: 'Handstand', goal: 'Mastery' },
        ],
    },
    {
        id: 'elite-2',
        name: 'Front Lever',
        category: 'Elite',
        isElite: true,
        roadmap: [
            { level: 1, name: 'Tuck Front Lever', goal: 'Hold 10s' },
            { level: 2, name: 'Adv. Tuck Front Lever', goal: 'Hold 10s' },
            { level: 3, name: 'Straddle Front Lever', goal: 'Hold 5s' },
            { level: 4, name: 'Front Lever', goal: 'Mastery' },
        ],
    },
    {
        id: 'elite-3',
        name: 'Muscle Up',
        category: 'Elite',
        isElite: true,
        roadmap: [
            { level: 1, name: 'High Pull-ups', goal: '5 reps' },
            { level: 2, name: 'Jumping Muscle Up', goal: '5 reps' },
            { level: 3, name: 'Negative Muscle Up', goal: '5 reps' },
            { level: 4, name: 'Muscle Up', goal: 'Mastery' },
        ],
    },
    {
        id: 'elite-4',
        name: 'Full Planche',
        category: 'Elite',
        isElite: true,
        roadmap: [
            { level: 1, name: 'Tuck Planche', goal: 'Hold 10s' },
            { level: 2, name: 'Adv. Tuck Planche', goal: 'Hold 10s' },
            { level: 3, name: 'Straddle Planche', goal: 'Hold 5s' },
            { level: 4, name: 'Full Planche', goal: 'Mastery' },
        ],
    },
    {
        id: 'elite-5',
        name: 'Human Flag',
        category: 'Elite',
        isElite: true,
        roadmap: [
            { level: 1, name: 'Vertical Flag', goal: 'Hold 10s' },
            { level: 2, name: 'Tucked Human Flag', goal: 'Hold 5s' },
            { level: 3, name: 'Straddle Human Flag', goal: 'Hold 5s' },
            { level: 4, name: 'Human Flag', goal: 'Mastery' },
        ],
    },
];
