using System;
using ApiModule.Infrastructure;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ApiModule.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20260528120000_AddFormAnalyses")]
    public partial class AddFormAnalyses : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "FormAnalyses",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OwnerUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    WorkoutRunId = table.Column<Guid>(type: "uuid", nullable: true),
                    WorkoutId = table.Column<Guid>(type: "uuid", nullable: true),
                    ExerciseId = table.Column<Guid>(type: "uuid", nullable: true),
                    ExerciseName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    ExerciseType = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    StepIndex = table.Column<int>(type: "integer", nullable: true),
                    SetNumber = table.Column<int>(type: "integer", nullable: true),
                    Status = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    Score = table.Column<int>(type: "integer", nullable: true),
                    Summary = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    FindingsJson = table.Column<string>(type: "text", nullable: false),
                    MetricsJson = table.Column<string>(type: "text", nullable: false),
                    RawResultJson = table.Column<string>(type: "text", nullable: true),
                    ErrorMessage = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    SourceFileName = table.Column<string>(type: "character varying(260)", maxLength: 260, nullable: false),
                    AnalyzedFileName = table.Column<string>(type: "character varying(260)", maxLength: 260, nullable: true),
                    AnalyzerVersion = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ModelName = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FormAnalyses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FormAnalyses_WorkoutRuns_WorkoutRunId",
                        column: x => x.WorkoutRunId,
                        principalTable: "WorkoutRuns",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_FormAnalyses_Workouts_WorkoutId",
                        column: x => x.WorkoutId,
                        principalTable: "Workouts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_FormAnalyses_CreatedAt",
                table: "FormAnalyses",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_FormAnalyses_OwnerUserId",
                table: "FormAnalyses",
                column: "OwnerUserId");

            migrationBuilder.CreateIndex(
                name: "IX_FormAnalyses_OwnerUserId_WorkoutRunId_CreatedAt",
                table: "FormAnalyses",
                columns: new[] { "OwnerUserId", "WorkoutRunId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_FormAnalyses_WorkoutId",
                table: "FormAnalyses",
                column: "WorkoutId");

            migrationBuilder.CreateIndex(
                name: "IX_FormAnalyses_WorkoutRunId",
                table: "FormAnalyses",
                column: "WorkoutRunId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FormAnalyses");
        }
    }
}
