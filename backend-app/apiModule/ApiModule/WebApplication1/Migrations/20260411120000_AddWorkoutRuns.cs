using System;
using ApiModule.Infrastructure;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ApiModule.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20260411120000_AddWorkoutRuns")]
    public partial class AddWorkoutRuns : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "WorkoutRuns",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    WorkoutId = table.Column<Guid>(type: "uuid", nullable: false),
                    OwnerUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    StartedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FinishedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DurationSec = table.Column<int>(type: "integer", nullable: true),
                    Notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkoutRuns", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WorkoutRuns_Workouts_WorkoutId",
                        column: x => x.WorkoutId,
                        principalTable: "Workouts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WorkoutRunEntries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    WorkoutRunId = table.Column<Guid>(type: "uuid", nullable: false),
                    ExerciseId = table.Column<Guid>(type: "uuid", nullable: false),
                    ExerciseName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    StepIndex = table.Column<int>(type: "integer", nullable: false),
                    SetNumber = table.Column<int>(type: "integer", nullable: false),
                    ExpectedReps = table.Column<int>(type: "integer", nullable: false),
                    ActualReps = table.Column<int>(type: "integer", nullable: false),
                    MetTarget = table.Column<bool>(type: "boolean", nullable: false),
                    ExerciseDurationSec = table.Column<int>(type: "integer", nullable: false),
                    RestDurationSec = table.Column<int>(type: "integer", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkoutRunEntries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WorkoutRunEntries_WorkoutRuns_WorkoutRunId",
                        column: x => x.WorkoutRunId,
                        principalTable: "WorkoutRuns",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_WorkoutRunEntries_WorkoutRunId",
                table: "WorkoutRunEntries",
                column: "WorkoutRunId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkoutRuns_OwnerUserId",
                table: "WorkoutRuns",
                column: "OwnerUserId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkoutRuns_WorkoutId",
                table: "WorkoutRuns",
                column: "WorkoutId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "WorkoutRunEntries");

            migrationBuilder.DropTable(
                name: "WorkoutRuns");
        }
    }
}
