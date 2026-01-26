using ApiModule.Domain;
using Microsoft.EntityFrameworkCore;

namespace ApiModule.Infrastructure;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
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

            entity.HasMany(w => w.Exercises)
                .WithOne()
                .HasForeignKey("WorkoutId")
                .IsRequired()
                .OnDelete(DeleteBehavior.Cascade);

            entity.Property(w => w.OwnerUserId)
                .IsRequired();
        });

        modelBuilder.Entity<Exercise>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(200);
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

            b.Property(x => x.BirthDate)
             .HasColumnType("date")
             .IsRequired(false);
        });

    }
}
