using Microsoft.EntityFrameworkCore.Migrations;
using ApiModule.Infrastructure;
using Microsoft.EntityFrameworkCore.Infrastructure;

#nullable disable

namespace ApiModule.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20260515190000_AddExerciseOrderIndex")]
    public partial class AddExerciseOrderIndex : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "OrderIndex",
                table: "Exercises",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.Sql("""
                UPDATE "Exercises" e
                SET "OrderIndex" = ordered."OrderIndex"
                FROM (
                    SELECT "Id", ROW_NUMBER() OVER (
                        PARTITION BY "WorkoutId"
                        ORDER BY ctid
                    ) - 1 AS "OrderIndex"
                    FROM "Exercises"
                ) AS ordered
                WHERE e."Id" = ordered."Id";
                """);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "OrderIndex",
                table: "Exercises");
        }
    }
}
