using ApiModule.Domain;
using Microsoft.EntityFrameworkCore;

namespace ApiModule.Infrastructure;

public sealed class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Workout> Workouts => Set<Workout>();
    public DbSet<Exercise> Exercises => Set<Exercise>();
    public DbSet<WorkoutRun> WorkoutRuns => Set<WorkoutRun>();
    public DbSet<WorkoutRunEntry> WorkoutRunEntries => Set<WorkoutRunEntry>();
    public DbSet<FormAnalysis> FormAnalyses => Set<FormAnalysis>();
    public DbSet<AppUser> Users => Set<AppUser>();
    public DbSet<Profile> Profiles => Set<Profile>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Workout>(entity =>
        {
            entity.HasKey(w => w.Id);

            entity.Property(w => w.Title)
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(w => w.MuscleGroups)
                .HasColumnType("text[]");

            entity.Property(w => w.OwnerUserId)
                .IsRequired();

            entity.HasMany(w => w.Exercises)
                .WithOne(e => e.Workout)
                .HasForeignKey(e => e.WorkoutId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(w => w.Runs)
                .WithOne(r => r.Workout)
                .HasForeignKey(r => r.WorkoutId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(w => w.FormAnalyses)
                .WithOne(a => a.Workout)
                .HasForeignKey(a => a.WorkoutId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Exercise>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.OrderIndex)
                .IsRequired();

            entity.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(e => e.WorkoutId)
                .IsRequired();
        });

        modelBuilder.Entity<WorkoutRun>(entity =>
        {
            entity.HasKey(run => run.Id);

            entity.Property(run => run.OwnerUserId)
                .IsRequired();

            entity.Property(run => run.StartedAt)
                .IsRequired();

            entity.Property(run => run.Notes)
                .HasMaxLength(1000);

            entity.Property(run => run.ActivePhase)
                .IsRequired()
                .HasMaxLength(20);

            entity.Property(run => run.CurrentStepIndex)
                .IsRequired();

            entity.Property(run => run.IsPaused)
                .IsRequired();

            entity.HasMany(run => run.Entries)
                .WithOne(entry => entry.WorkoutRun)
                .HasForeignKey(entry => entry.WorkoutRunId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(run => run.FormAnalyses)
                .WithOne(analysis => analysis.WorkoutRun)
                .HasForeignKey(analysis => analysis.WorkoutRunId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<WorkoutRunEntry>(entity =>
        {
            entity.HasKey(entry => entry.Id);

            entity.Property(entry => entry.ExerciseName)
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(entry => entry.StepIndex)
                .IsRequired();

            entity.Property(entry => entry.SetNumber)
                .IsRequired();

            entity.Property(entry => entry.ExpectedReps)
                .IsRequired();

            entity.Property(entry => entry.ActualReps)
                .IsRequired();

            entity.Property(entry => entry.CompletedAt)
                .IsRequired();
        });

        modelBuilder.Entity<FormAnalysis>(entity =>
        {
            entity.HasKey(analysis => analysis.Id);

            entity.Property(analysis => analysis.OwnerUserId)
                .IsRequired();

            entity.Property(analysis => analysis.ExerciseName)
                .HasMaxLength(200);

            entity.Property(analysis => analysis.ExerciseType)
                .IsRequired()
                .HasMaxLength(80);

            entity.Property(analysis => analysis.Status)
                .IsRequired()
                .HasMaxLength(40);

            entity.Property(analysis => analysis.Summary)
                .IsRequired()
                .HasMaxLength(1000);

            entity.Property(analysis => analysis.FindingsJson)
                .IsRequired()
                .HasColumnType("text");

            entity.Property(analysis => analysis.MetricsJson)
                .IsRequired()
                .HasColumnType("text");

            entity.Property(analysis => analysis.RawResultJson)
                .HasColumnType("text");

            entity.Property(analysis => analysis.ErrorMessage)
                .HasMaxLength(1000);

            entity.Property(analysis => analysis.SourceFileName)
                .IsRequired()
                .HasMaxLength(260);

            entity.Property(analysis => analysis.AnalyzedFileName)
                .HasMaxLength(260);

            entity.Property(analysis => analysis.AnalyzerVersion)
                .IsRequired()
                .HasMaxLength(50);

            entity.Property(analysis => analysis.ModelName)
                .HasMaxLength(160);

            entity.Property(analysis => analysis.CreatedAt)
                .IsRequired();

            entity.HasIndex(analysis => analysis.OwnerUserId);
            entity.HasIndex(analysis => analysis.WorkoutRunId);
            entity.HasIndex(analysis => analysis.WorkoutId);
            entity.HasIndex(analysis => analysis.CreatedAt);
            entity.HasIndex(analysis => new { analysis.OwnerUserId, analysis.WorkoutRunId, analysis.CreatedAt });
        });

        modelBuilder.Entity<AppUser>(entity =>
        {
            entity.HasKey(u => u.Id);

            entity.Property(u => u.Login)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(u => u.PasswordHash)
                .IsRequired()
                .HasMaxLength(500);

            entity.HasIndex(u => u.Login)
                .IsUnique();
        });

        modelBuilder.Entity<Profile>(b =>
        {
            b.HasKey(x => x.OwnerId);

            b.Property(x => x.Name).IsRequired(false);
            b.Property(x => x.Email).IsRequired(false);
            b.Property(x => x.BirthDate).HasColumnType("date").IsRequired(false);
        });
    }
}
