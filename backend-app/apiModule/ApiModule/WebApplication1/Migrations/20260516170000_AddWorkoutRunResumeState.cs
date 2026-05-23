using System;
using ApiModule.Infrastructure;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ApiModule.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20260516170000_AddWorkoutRunResumeState")]
    public partial class AddWorkoutRunResumeState : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ActivePhase",
                table: "WorkoutRuns",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "exercise");

            migrationBuilder.AddColumn<int>(
                name: "CurrentStepIndex",
                table: "WorkoutRuns",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsPaused",
                table: "WorkoutRuns",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastProgressAt",
                table: "WorkoutRuns",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PhaseDurationSec",
                table: "WorkoutRuns",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RemainingSeconds",
                table: "WorkoutRuns",
                type: "integer",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ActivePhase",
                table: "WorkoutRuns");

            migrationBuilder.DropColumn(
                name: "CurrentStepIndex",
                table: "WorkoutRuns");

            migrationBuilder.DropColumn(
                name: "IsPaused",
                table: "WorkoutRuns");

            migrationBuilder.DropColumn(
                name: "LastProgressAt",
                table: "WorkoutRuns");

            migrationBuilder.DropColumn(
                name: "PhaseDurationSec",
                table: "WorkoutRuns");

            migrationBuilder.DropColumn(
                name: "RemainingSeconds",
                table: "WorkoutRuns");
        }
    }
}
