-- Seed a dense demo account for UI stress testing.
-- Login: demo_full
-- Password is created through the API before running this script: demo_full123

\set ON_ERROR_STOP on

SET client_min_messages TO WARNING;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
    demo_user_id uuid;
    workout_id uuid;
    run_id uuid;
    exercise_id uuid;
    i int;
    e_idx int;
    set_idx int;
    step_index int;
    status text;
    scheduled_at timestamptz;
    completed_at timestamptz;
    title text;
    muscle_groups text[];
    exercise_names text[] := ARRAY[
        'Barbell Squat',
        'Bench Press',
        'Deadlift',
        'Overhead Press',
        'Pull Up',
        'Bent Over Row',
        'Romanian Deadlift',
        'Incline Dumbbell Press',
        'Leg Press',
        'Lat Pulldown',
        'Cable Row',
        'Walking Lunge',
        'Hip Thrust',
        'Lateral Raise',
        'Triceps Pushdown',
        'Biceps Curl',
        'Plank',
        'Kettlebell Swing'
    ];
    workout_titles text[] := ARRAY[
        'Upper Strength',
        'Lower Strength',
        'Push Hypertrophy',
        'Pull Hypertrophy',
        'Leg Volume',
        'Full Body Power',
        'Chest Focus',
        'Back Focus',
        'Arms Accessories',
        'Conditioning Mix'
    ];
    exercise_ids uuid[];
    exercise_name_list text[];
    exercise_set_list int[];
    exercise_rep_list int[];
    exercise_rest_list int[];
    exercise_weight_list numeric[];
    exercise_count int;
    exercise_sets int;
    exercise_reps int;
    exercise_rest int;
    exercise_weight numeric;
    actual_reps int;
    active_workout_id uuid := gen_random_uuid();
    active_exercise_a uuid := gen_random_uuid();
    active_exercise_b uuid := gen_random_uuid();
    active_run_id uuid := gen_random_uuid();
BEGIN
    SELECT "Id"
      INTO demo_user_id
      FROM "Users"
     WHERE "Login" = 'demo_full';

    IF demo_user_id IS NULL THEN
        RAISE EXCEPTION 'User demo_full does not exist. Register it through /api/auth/register first.';
    END IF;

    DELETE FROM "FormAnalyses"
     WHERE "OwnerUserId" = demo_user_id;

    DELETE FROM "WorkoutRunEntries"
     WHERE "WorkoutRunId" IN (
        SELECT "Id" FROM "WorkoutRuns" WHERE "OwnerUserId" = demo_user_id
     );

    DELETE FROM "WorkoutRuns"
     WHERE "OwnerUserId" = demo_user_id;

    DELETE FROM "Exercises"
     WHERE "WorkoutId" IN (
        SELECT "Id" FROM "Workouts" WHERE "OwnerUserId" = demo_user_id
     );

    DELETE FROM "Workouts"
     WHERE "OwnerUserId" = demo_user_id;

    DELETE FROM "Profiles"
     WHERE "OwnerId" = demo_user_id;

    INSERT INTO "Profiles" ("OwnerId", "Name", "Email", "BirthDate")
    VALUES (demo_user_id, 'Demo Full', 'demo.full@repforge.local', DATE '1998-05-14');

    FOR i IN 1..134 LOOP
        workout_id := gen_random_uuid();
        exercise_ids := ARRAY[]::uuid[];
        exercise_name_list := ARRAY[]::text[];
        exercise_set_list := ARRAY[]::int[];
        exercise_rep_list := ARRAY[]::int[];
        exercise_rest_list := ARRAY[]::int[];
        exercise_weight_list := ARRAY[]::numeric[];

        IF i <= 80 THEN
            status := 'completed';
            scheduled_at := date_trunc('day', now() - ((81 - i) || ' days')::interval)
                + (((6 + (i % 13)) || ' hours')::interval)
                + (((i * 7) % 50) || ' minutes')::interval;
            completed_at := scheduled_at
                + (((48 + (i % 34)) || ' minutes')::interval);
        ELSIF i <= 104 THEN
            status := 'missed';
            scheduled_at := date_trunc('day', now() - ((105 - i) || ' days')::interval)
                + (((7 + (i % 12)) || ' hours')::interval)
                + (((i * 11) % 50) || ' minutes')::interval;
            completed_at := NULL;
        ELSE
            status := 'upcoming';
            scheduled_at := date_trunc('day', now() + ((i - 104) || ' days')::interval)
                + (((6 + (i % 12)) || ' hours')::interval)
                + (((i * 13) % 50) || ' minutes')::interval;
            completed_at := NULL;
        END IF;

        title := workout_titles[((i - 1) % array_length(workout_titles, 1)) + 1]
            || ' #' || lpad(i::text, 3, '0');
        muscle_groups := CASE (i - 1) % 5
            WHEN 0 THEN ARRAY['chest','triceps']
            WHEN 1 THEN ARRAY['back','biceps']
            WHEN 2 THEN ARRAY['legs','glutes']
            WHEN 3 THEN ARRAY['shoulders','core']
            ELSE ARRAY['full body','conditioning']
        END;
        exercise_count := 3 + (i % 3);

        INSERT INTO "Workouts" (
            "Id",
            "Title",
            "ScheduledAt",
            "CompletedAt",
            "PerceivedLoad",
            "MuscleGroups",
            "OwnerUserId"
        )
        VALUES (
            workout_id,
            title,
            scheduled_at,
            completed_at,
            CASE
                WHEN status <> 'completed' THEN NULL
                WHEN i % 3 = 0 THEN 'heavy'
                WHEN i % 3 = 1 THEN 'balanced'
                ELSE 'light'
            END,
            muscle_groups,
            demo_user_id
        );

        FOR e_idx IN 1..exercise_count LOOP
            exercise_id := gen_random_uuid();
            exercise_sets := 3 + ((i + e_idx) % 3);
            exercise_reps := 5 + ((i + e_idx * 2) % 8);
            exercise_rest := 45 + (((i + e_idx) % 4) * 15);
            exercise_weight := CASE
                WHEN ((i + e_idx) % 7) = 0 THEN 0
                ELSE 10 + (((i * 7 + e_idx * 13) % 130)::numeric / 2)
            END;

            INSERT INTO "Exercises" (
                "Id",
                "OrderIndex",
                "Name",
                "Sets",
                "Reps",
                "RestTimeSec",
                "Weight",
                "WorkoutId"
            )
            VALUES (
                exercise_id,
                e_idx - 1,
                exercise_names[((i + e_idx - 2) % array_length(exercise_names, 1)) + 1],
                exercise_sets,
                exercise_reps,
                exercise_rest,
                exercise_weight,
                workout_id
            );

            exercise_ids := array_append(exercise_ids, exercise_id);
            exercise_name_list := array_append(
                exercise_name_list,
                exercise_names[((i + e_idx - 2) % array_length(exercise_names, 1)) + 1]
            );
            exercise_set_list := array_append(exercise_set_list, exercise_sets);
            exercise_rep_list := array_append(exercise_rep_list, exercise_reps);
            exercise_rest_list := array_append(exercise_rest_list, exercise_rest);
            exercise_weight_list := array_append(exercise_weight_list, exercise_weight);
        END LOOP;

        IF status = 'completed' THEN
            run_id := gen_random_uuid();

            INSERT INTO "WorkoutRuns" (
                "Id",
                "WorkoutId",
                "OwnerUserId",
                "StartedAt",
                "FinishedAt",
                "DurationSec",
                "Notes",
                "ActivePhase",
                "CurrentStepIndex",
                "RemainingSeconds",
                "PhaseDurationSec",
                "IsPaused",
                "LastProgressAt"
            )
            VALUES (
                run_id,
                workout_id,
                demo_user_id,
                scheduled_at,
                completed_at,
                2700 + ((i % 16) * 180),
                'Seeded completed session with varied volume and intensity.',
                'summary',
                0,
                0,
                0,
                true,
                completed_at
            );

            step_index := 0;
            FOR e_idx IN 1..array_length(exercise_ids, 1) LOOP
                FOR set_idx IN 1..exercise_set_list[e_idx] LOOP
                    actual_reps := GREATEST(
                        0,
                        exercise_rep_list[e_idx] + (((i + e_idx + set_idx) % 3) - 1)
                    );

                    INSERT INTO "WorkoutRunEntries" (
                        "Id",
                        "WorkoutRunId",
                        "ExerciseId",
                        "ExerciseName",
                        "StepIndex",
                        "SetNumber",
                        "ExpectedReps",
                        "ActualReps",
                        "MetTarget",
                        "ExerciseDurationSec",
                        "RestDurationSec",
                        "CompletedAt"
                    )
                    VALUES (
                        gen_random_uuid(),
                        run_id,
                        exercise_ids[e_idx],
                        exercise_name_list[e_idx],
                        step_index,
                        set_idx,
                        exercise_rep_list[e_idx],
                        actual_reps,
                        actual_reps >= exercise_rep_list[e_idx],
                        25 + ((i + e_idx + set_idx) % 80),
                        exercise_rest_list[e_idx],
                        completed_at - (((array_length(exercise_ids, 1) * 5 - step_index) * 90) || ' seconds')::interval
                    );

                    step_index := step_index + 1;
                END LOOP;
            END LOOP;
        END IF;
    END LOOP;

    INSERT INTO "Workouts" (
        "Id",
        "Title",
        "ScheduledAt",
        "CompletedAt",
        "PerceivedLoad",
        "MuscleGroups",
        "OwnerUserId"
    )
    VALUES (
        active_workout_id,
        'LIVE DEMO - Full Body Test',
        date_trunc('day', now()) + interval '18 hours 15 minutes',
        NULL,
        NULL,
        ARRAY['full body','demo'],
        demo_user_id
    );

    INSERT INTO "Exercises" (
        "Id",
        "OrderIndex",
        "Name",
        "Sets",
        "Reps",
        "RestTimeSec",
        "Weight",
        "WorkoutId"
    )
    VALUES
        (active_exercise_a, 0, 'Demo Bench Press', 4, 8, 75, 72.5, active_workout_id),
        (active_exercise_b, 1, 'Demo Cable Row', 4, 10, 60, 55, active_workout_id);

    INSERT INTO "WorkoutRuns" (
        "Id",
        "WorkoutId",
        "OwnerUserId",
        "StartedAt",
        "FinishedAt",
        "DurationSec",
        "Notes",
        "ActivePhase",
        "CurrentStepIndex",
        "RemainingSeconds",
        "PhaseDurationSec",
        "IsPaused",
        "LastProgressAt"
    )
    VALUES (
        active_run_id,
        active_workout_id,
        demo_user_id,
        now() - interval '14 minutes',
        NULL,
        840,
        'Seeded active workout for floating timer and dashboard testing.',
        'rest',
        2,
        42,
        75,
        false,
        now()
    );

    INSERT INTO "WorkoutRunEntries" (
        "Id",
        "WorkoutRunId",
        "ExerciseId",
        "ExerciseName",
        "StepIndex",
        "SetNumber",
        "ExpectedReps",
        "ActualReps",
        "MetTarget",
        "ExerciseDurationSec",
        "RestDurationSec",
        "CompletedAt"
    )
    VALUES
        (gen_random_uuid(), active_run_id, active_exercise_a, 'Demo Bench Press', 0, 1, 8, 8, true, 56, 75, now() - interval '11 minutes'),
        (gen_random_uuid(), active_run_id, active_exercise_a, 'Demo Bench Press', 1, 2, 8, 7, false, 61, 75, now() - interval '7 minutes');

    INSERT INTO "FormAnalyses" (
        "Id",
        "OwnerUserId",
        "WorkoutRunId",
        "WorkoutId",
        "ExerciseId",
        "ExerciseName",
        "ExerciseType",
        "StepIndex",
        "SetNumber",
        "Status",
        "Score",
        "Summary",
        "FindingsJson",
        "MetricsJson",
        "RawResultJson",
        "ErrorMessage",
        "SourceFileName",
        "AnalyzedFileName",
        "AnalyzerVersion",
        "ModelName",
        "CreatedAt",
        "UpdatedAt",
        "CompletedAt"
    )
    VALUES
        (
            gen_random_uuid(),
            demo_user_id,
            active_run_id,
            active_workout_id,
            active_exercise_a,
            'Demo Bench Press',
            'bench_press',
            0,
            1,
            'completed',
            82,
            'Demo analysis: elbow path and rep depth look acceptable for a beta check.',
            '["Elbow angle stayed in a reasonable range.","Full repetition depth was detected on the sampled set."]',
            '[{"label":"Exercise","value":"Bench press beta"},{"label":"Full reps","value":"3"},{"label":"Average elbow angle","value":"74 deg"}]',
            NULL,
            NULL,
            'seeded-source.mp4',
            NULL,
            'form-analysis-v1',
            'seeded-demo',
            now() - interval '8 minutes',
            now() - interval '7 minutes',
            now() - interval '7 minutes'
        ),
        (
            gen_random_uuid(),
            demo_user_id,
            active_run_id,
            active_workout_id,
            active_exercise_b,
            'Demo Cable Row',
            'other',
            2,
            1,
            'unsupported_exercise',
            NULL,
            'This analyzer currently supports squat and bench press video only.',
            '["Choose squat or bench press for the current Python analyzer.","Other exercise types can be added later behind this same upload flow."]',
            '[{"label":"Supported now","value":"Squat, bench press"}]',
            NULL,
            'This analyzer currently supports squat and bench press video only.',
            'seeded-source.webm',
            NULL,
            'form-analysis-v1',
            'seeded-demo',
            now() - interval '5 minutes',
            now() - interval '5 minutes',
            now() - interval '5 minutes'
        );
END $$;

SELECT
    u."Login",
    count(DISTINCT w."Id") AS workouts,
    count(DISTINCT w."Id") FILTER (WHERE w."CompletedAt" IS NOT NULL) AS completed_workouts,
    count(DISTINCT w."Id") FILTER (WHERE w."CompletedAt" IS NULL AND w."ScheduledAt" < now()) AS missed_workouts,
    count(DISTINCT w."Id") FILTER (WHERE w."CompletedAt" IS NULL AND w."ScheduledAt" >= now()) AS upcoming_workouts,
    count(DISTINCT r."Id") FILTER (WHERE r."FinishedAt" IS NULL) AS active_runs,
    count(DISTINCT e."Id") AS exercises,
    count(DISTINCT re."Id") AS run_entries,
    count(DISTINCT fa."Id") AS form_analyses
FROM "Users" u
LEFT JOIN "Workouts" w ON w."OwnerUserId" = u."Id"
LEFT JOIN "Exercises" e ON e."WorkoutId" = w."Id"
LEFT JOIN "WorkoutRuns" r ON r."WorkoutId" = w."Id"
LEFT JOIN "WorkoutRunEntries" re ON re."WorkoutRunId" = r."Id"
LEFT JOIN "FormAnalyses" fa ON fa."OwnerUserId" = u."Id"
WHERE u."Login" = 'demo_full'
GROUP BY u."Login";
