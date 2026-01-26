using ApiModule.Domain;
using Microsoft.EntityFrameworkCore;

namespace ApiModule.Infrastructure;

public sealed class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Workout> Workouts => Set<Workout>();
    public DbSet<Exercise> Exercises => Set<Exercise>();
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
        });

        modelBuilder.Entity<Exercise>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(e => e.WorkoutId)
                .IsRequired();
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
