Fitness Tracker is a full-stack web application for logging workouts and tracking fitness progress. It provides features for users to register an account, create and manage workout routines (with exercises, sets, reps, etc.), record workout schedules and completion, and view statistics/progress (such as personal records and streaks). The project is split into a React/Next.js frontend and an ASP.NET Core (C#) backend, communicating via a REST API. The architecture follows a modular design with clearly separated concerns:

Frontend: Next.js 13 (App Router) with React and TypeScript. It uses the TanStack React Query library for data fetching/caching and Context API for managing authentication state.

Backend: ASP.NET Core 8 (Minimal API project) using C# with Entity Framework Core (PostgreSQL) for database access. It implements a JWT-based authentication for securing API endpoints.

Overall, this project is a work-in-progress “fitness tracker” where a user can log in, create workouts, track their exercise history, and monitor weekly progress and personal records. The codebase is intended to be developer-friendly and is structured for future growth (e.g. adding Docker deployment, more features, etc.).

Tech Stack

Frontend: Next.js 13 (React 18, using the new App Router structure), TypeScript, HTML/CSS. State management is minimal, relying on React Query (TanStack Query) for server state and React Context for auth. The UI components are custom (no heavy UI library mentioned, but likely using some icons like Lucide).

Backend: ASP.NET Core 8 (C#) using Web API controllers. It uses Entity Framework Core with Npgsql (PostgreSQL) as the database provider. JWT (JSON Web Tokens) are used for authentication (the backend issues tokens on login/register and validates them on protected endpoints). The backend follows a layered approach: Domain (entities + repository interfaces), Infrastructure (EF Core DbContext and repository implementations, plus JWT and identity helpers), Application (business logic services), and Api (DTOs and Controllers for HTTP endpoints).

Development & Tools: Node.js and npm for the frontend. .NET SDK for the backend. The project uses ESLint/Prettier for frontend code styling (though enforcement could be improved) and relies on .NET’s conventions for C# formatting. No automated tests are present yet. Swagger (Swashbuckle) is integrated on the backend for API documentation.

Features

Some of the key features implemented (or planned) in the Fitness Tracker include:

User Authentication: Users can register a new account and log in. The backend validates credentials and returns a JWT token, which the frontend stores and attaches to API requests. (Authentication state is kept in a React Context with helper functions for login/register/logout.)

Workout Management: Users can create new workouts, including details like title, scheduled date, and a list of exercises (each with sets, reps, weight, etc.). Workouts can be marked as completed (with a completion timestamp and an optional perceived effort level). Users can also view a list of past workouts (workout history) and the last completed workout.

Progress Tracking: The application computes and displays fitness progress stats. This includes a streak of consecutive days with completed workouts, total workouts completed, total repetitions and volume lifted, and personal record (PR) highlights for each exercise (maximum weight lifted per exercise). A dedicated Progress page shows these stats, and a weekly summary view is available (filtering the stats to the last week).

Profile Management: Users can view and update their profile information (name, email, birth date) and change their password. Changing password requires providing the current password for security.

Informational Dashboard: The landing/dashboard page (after login) provides a quick overview – it may show things like tips of the day, recent highlights, or an empty state encouraging the user to add workouts if none exist. (Some of this is partially implemented; for example, there is provision for "tips" and "highlights" data, but it’s not fully wired into the UI yet.)

Note: Currently, all features run in development mode only (no production deployment yet). The app has a “mock API” mode in the frontend that returns sample data (useful if the backend is not running), but by default it is configured to call the real backend API.

Getting Started (Development Setup)

To run the application locally, you will need Node.js (for the frontend) and .NET 8 SDK (for the backend). You’ll also need a local PostgreSQL database (or you can adjust the connection string to use a different server). Below are the steps to get started:

Clone the repository (or download the source zip provided). Ensure you have both the frontend and backend code available.

Set up the Database:

Install PostgreSQL and create a database (for example, named workoutdb). Update the connection string in the backend configuration if needed. By default, the backend expects:

"ConnectionStrings": {
  "Default": "Host=localhost;Port=5432;Database=workoutdb;Username=user;Password=pass"
}


In a development environment, you can use a simple username/password (as shown above). Make sure these credentials match your local DB setup.

The project includes EF Core migrations for the database schema. The first time you run the backend, it will apply migrations automatically (ensure the connection string is correct). This will create tables for Users, Profiles, Workouts, Exercises, etc. If needed, you can also apply migrations via the CLI (dotnet ef database update) or through the Program.cs on startup.

Backend – Running the API:

Navigate to the WebApplication1/ (ApiModule) project directory.

(Optional) Adjust any configuration in appsettings.Development.json – for example, JWT settings or connection string. By default, the JWT issuer/audience are set to "ApiModule" and a placeholder key is provided (which you can change for better security).

Run the API using the .NET CLI or an IDE:

dotnet run --project WebApplication1/ApiModule.csproj


This should start the ASP.NET server on the URL and port configured. By default, it’s likely running at https://localhost:7105 (as referenced in the frontend config). You should see console output from the app indicating it’s listening, and you can visit https://localhost:7105/swagger in a browser to view the Swagger API docs (since Swagger is enabled in development).

Note: The API expects to run on HTTPS by default. For local development, you might need to trust the self-signed developer certificate that ASP.NET Core uses. Alternatively, you can configure it to allow HTTP for local use.

Frontend – Running the app:

Navigate to the frontend project directory (it contains the package.json and the Next.js app).

Create a .env file in the frontend directory. (There is an example .env.example provided.) At minimum, set:

NEXT_PUBLIC_API_MODE=real
NEXT_PUBLIC_API_URL=https://localhost:7105/api


This tells the frontend to use “real” API mode and target the backend you just ran. (The backend controllers are generally hosted under /api/... routes as per the code.)

Install dependencies and start the development server:

npm install
npm run dev


This will launch the Next.js development server on default port 3000. Open http://localhost:3000 in your browser. You should see the application’s landing page or login screen.

Usage:

Register a new account via the UI (click register on the login page and enter credentials). After successful registration, you should be automatically logged in (the app will store the JWT token in local storage).

Proceed to create workouts and explore the features (Dashboard, Progress, Profile pages, etc.). The frontend will interact with the backend API to fetch or modify data. Use the browser console or network inspector to debug any issues (e.g., CORS or API errors) – the backend is configured with CORS to accept all origins in development, so it should work by default.

Future Improvement – Docker: In the near future, the project will include Docker support – allowing you to run both the frontend and backend (as well as a Postgres database) via Docker Compose. This will simplify setup: one command to build and start containers for the API, frontend, and database. (As of now, this is not yet configured, so use manual setup as described above.) The README will be updated with Docker usage instructions once that is available.

Project Structure

The repository is structured into two main parts: the Next.js frontend and the ASP.NET backend. Below is an overview of each:

Frontend (Next.js) – Key directories and files:

/src/app/ – The Next.js App Router directory, organizing routes and pages. It uses the new Next.js 13 layout format:

/(landing)/ contains pages accessible to unauthenticated users (e.g., the landing page and the login page).

/(app)/ contains pages for authenticated users (behind the AuthGate). For example, /(app)/dashboard, /(app)/profile, /(app)/progress, /(app)/workouts correspond to the main sections after login.

Each of these pages imports a corresponding React component from the components/pagesComponents directory to render the UI.

/src/app/contexts/auth/ – Authentication context and utilities:

authContext.tsx defines the React Context for auth and provides the AuthProvider component. It stores the current user session (JWT token and user info) and exposes login, register, and logout functions to components.

authStorage.ts handles saving/loading the auth token to localStorage (so that a user stays logged in on page refresh).

authGate.tsx is a protective wrapper that redirects users to login if they are not authenticated (used for the protected routes).

authMock.ts exists to facilitate a “mock” login flow in case we simulate authentication without a backend (not heavily used in real mode).

/src/app/api/ – Frontend API layer:

API mode switching: The code is set up to use either real backend calls or mock data. The environment variable NEXT_PUBLIC_API_MODE (set in .env) controls this. If set to "mock", the frontend will use the stubbed data functions under api/apiMock/. If "real", it will call the real HTTP endpoints (under api/apiReal/).
For each domain (login, profile, progress, workouts), there is a file in api/ (e.g., login.api.ts, profile.api.ts, etc.) that exports functions like loginApi, registerApi, getProfile, etc. These decide whether to call the real API implementation or return mock data. For example, login.api.ts does:

const impl = mode === "mock" ? loginMock : loginReal;
export const loginApi = (payload) => impl.login(payload);


The real implementations (e.g., apiReal/login.real.ts) use fetch via a helper, while the mock ones (apiMock/...) return hardcoded sample data or simulate asynchronous calls.

HTTP client: httpClient.ts is a wrapper around fetch that automatically prefixes the base API URL and includes the JWT token in headers. It also centralizes error handling and JSON parsing. This is used by all *.real.ts API calls to talk to the backend.

Query keys and cache: In api/keys/ you’ll find definitions for React Query keys (e.g., workouts.keys.ts) – these are used to uniquely identify queries for caching (e.g., cache keys for workouts list, progress data, etc.).

Mappers: Some mapping functions live in api/mappers/ (though much of the mapping from API DTOs to front-end types is straightforward or handled in hooks/components directly). These might convert backend DTOs to front-end view models if needed.

/src/app/hooks/ – Custom React hooks, especially those wrapping API calls with React Query:

For each data domain, e.g., useWorkouts, useProgress, etc., there are hooks that call the API functions and internally use useQuery or useMutation from TanStack Query. This abstracts the data fetching logic out of components. For example, useWorkouts.ts will call workoutsApi.fetchWorkouts() and return the data along with loading/status. There are also specific hooks like useCreateWorkout, usePatchWorkoutMeta, useLastCompletedWorkout, etc., which correspond to creating a workout, updating a workout’s metadata, and so on (leveraging useMutation for POST/PUT/PATCH actions).

There are also some utility hooks (e.g., useNow for a constantly updating current time, useLockBodyScroll to prevent background scrolling when modals are open, etc.).

/src/app/components/ – UI Components:

The components are further organized into subfolders. Notably, components/pagesComponents/ contains page-specific components for each page (Dashboard/Home, Login, Profile, Progress, Workout pages). For example, the HomePage/ subfolder holds HomePage.tsx and related sub-components (like HeroSection, HighlightItem, etc.) used on the dashboard.

Each page component often has a corresponding “ViewModel” file (e.g., HomePageVM.ts, ProfilePageVM.ts, etc.) which contain any local state or logic for that page, including calling the hooks. For instance, LoginPageVM.ts handles toggling between login/register mode and form submission logic using the useAuth context.

Reusable components (not tied to one page) include things like Navbar (the top navigation bar), EmptyState (a placeholder message for empty lists), InfoPanel (possibly a side panel showing tips and info), FitnessButton, FitnessInput (custom styled button and input components), and others. These are in their own folders or files under components/.

/src/app/types/ – TypeScript type definitions for data structures:

This includes types for API DTOs (mirroring backend contracts) such as LoginDTO, ProfileDTO, WorkoutDTO, etc., as well as types for components’ props or state (e.g., types for form data, context values, etc.). Keeping these in one place helps ensure the front-end models align with what the backend expects/returns.

Backend (ASP.NET Core) – Key directories and files:

/WebApplication1/Domain/ – Domain Models and Interfaces:

Contains the core entity classes like Workout, Exercise, Profile, and AppUser (for user accounts). These classes mostly correspond to database tables (and have EF Core mappings). For example, a Workout has properties like Title, ScheduledAt, CompletedAt, a list of Exercises, an OwnerUserId (linking to the user who owns it), etc. An Exercise has details like name, sets, reps, weight, and a WorkoutId as foreign key.

Also in Domain are the repository interfaces (IWorkoutRepository, IProfileRepository, IUserRepository) that abstract data access. These define methods like GetAllByOwnerAsync, AddAsync, UpdateAsync, etc., without specifying the implementation. This abstraction allows the Application layer to remain agnostic of how data is stored.

ICurrentUser interface is also defined here – this is used to abstract how we get the currently authenticated user’s ID in the business logic.

/WebApplication1/Infrastructure/ – Infrastructure & Data Access:

AppDbContext.cs – The Entity Framework Core DbContext for the application. It sets up DbSet<Workout>, DbSet<Exercise>, DbSet<AppUser>, DbSet<Profile>, and configures model relationships in OnModelCreating. For instance, it defines relationships like Workout has many Exercises (with cascade delete if a workout is removed) and any field constraints (e.g., max lengths, required fields).

Repository Implementations:

EfWorkoutRepository.cs, EfUserRepository.cs, EfProfileRepository.cs – these classes implement the interfaces from Domain using EF Core. They use dependency injection to get the AppDbContext and perform queries like GetAllByOwnerAsync(userId) or AddAsync(entity) which typically call EF methods (_db.Workouts.ToListAsync(), etc.). The repositories generally call _db.SaveChangesAsync() internally to persist changes. (In some cases, a separate SaveAsync is provided for batching updates.)

The User repository likely uses EF Core to manage AppUser entries. The project doesn’t use ASP.NET Identity directly, but it does use IPasswordHasher<AppUser> from Microsoft’s Identity library to hash passwords. The EfUserRepository provides methods to get a user by login and create a new user.

Auth helpers:

JwtService (not explicitly listed above, but likely present via IJwtService in DI) would be responsible for creating JWT tokens given an AppUser. It uses the secret key and issuer/audience from configuration (JwtOptions) to create signed tokens.

HttpCurrentUser.cs – implements ICurrentUser by using the IHttpContextAccessor. It reads the JWT claims from the current HTTP context to determine the authenticated user’s ID. This allows the Application services to get the current user ID without being coupled to ASP.NET controllers.

/WebApplication1/Application/ – Application Services (Business Logic):

This layer contains services that implement the core logic for each part of the system, using the repositories and other infrastructure. Examples:

AuthService.cs – Handles login and registration logic. For login, it verifies the password using the password hasher and returns a JWT token string (via JwtService) if successful. For registration, it checks if the login is already taken, then creates a new AppUser, hashes the password, saves via IUserRepository, and returns a boolean indicating success. (It doesn’t itself generate a token on register – instead the controller calls login after a successful registration to get a token.)

WorkoutService.cs – Contains methods to create a new workout, update a workout (both the structure of exercises and partial updates like marking completion), delete workouts, and fetch workouts (all for the current user). It uses IWorkoutRepository to interact with data. Notably, for updating the workout structure it merges the lists of exercises (adding new ones, updating existing, removing those not present in the update request). It ensures all operations are scoped to the current user (so one user cannot modify another’s workouts).

ProfileService.cs – Handles retrieving and updating the user’s profile. If a profile record doesn’t exist for the user, it creates one (so each user has at most one profile). It also has ChangePasswordAsync which verifies the current password and updates the user’s password hash via the user repository.

ProgressService.cs – Computes the progress statistics for the current user. It fetches all workouts for the user and then calculates the streak, total stats, and personal records. For example, streak calculation iterates over the distinct dates of completed workouts to find the longest consecutive sequence up to today. Stats include total workouts, total reps (sum of setsreps of all exercises), total volume (sum of setsreps*weight), and max weight ever lifted. PRs are determined by grouping all exercises by name and finding the max weight for each exercise. (This service currently does calculations in memory; as the dataset grows, it might be worth optimizing or moving calculations to the database via queries, but for moderate data this is fine.)

/WebApplication1/Api/Contracts/ – DTOs (Data Transfer Objects):

These classes define the shape of data sent to/from API endpoints. For instance, LoginDto and AuthTokenDto for auth, WorkoutDto and related ExerciseDto for workouts, ProgressDto (with nested ProgressStatsDto, PrDto, StreakDto) for progress data, ProfileDto for user profile, etc. They are simple classes (often just properties) sometimes matching the domain models, but not always identical (e.g., they might omit or combine certain fields).

DTOs are used in controller method signatures (as [FromBody] parameters for POST/PUT/PATCH, or returned in ActionResult). They ensure the internal domain objects aren’t directly exposed and allow shaping the data conveniently for the client’s needs.

/WebApplication1/Api/Controllers/ – API Controllers:

These are standard ASP.NET controllers, each marked with [ApiController] and [Route("api/..")]. They use dependency-injected services to perform actions and return results to the client.

AuthController: Handles authentication endpoints (POST /api/auth/login and POST /api/auth/register). On login, it returns an AuthTokenDto with the JWT if successful (401 Unauthorized if credentials invalid). On register, it creates a new user (via AuthService) and, on success, also logs them in to return a token (so the client immediately gets a token upon registration). Both endpoints do basic validation (e.g., ensure password and confirmation match on register).

ProfileController: Protected by [Authorize]. Handles GET /api/profile (get current user’s profile info), PATCH /api/profile/update-profile (update name, email, birthdate) and POST /api/profile/change-password (to change the password). It uses ProfileService for profile changes and AuthService for password change. The controller ensures that only an authenticated user can access these, and it returns appropriate responses (e.g., 400 for invalid data, 401 if not auth, etc.).

ProgressController: Protected. Handles GET /api/progress which returns a ProgressDto for the current user. It accepts an optional query param prScope=week to filter to last week’s data; otherwise it returns overall progress. It delegates to ProgressService.GetProgressAsync with the scope.

WorkoutsController: Protected. Provides CRUD for workouts:

GET /api/workouts returns a list of the user’s workouts (as WorkoutDto list).

GET /api/workouts/lastCompleted returns the most recently completed workout (or null if none).

POST /api/workouts creates a new workout. It expects a CreateWorkoutDto (which contains a title, scheduled date, and a list of exercises with their details). The controller maps this DTO to a domain Workout via a mapper and calls WorkoutService.CreateAsync. It returns the created workout as WorkoutDto.

PUT /api/workouts/{id} updates the structure of an existing workout (title or exercises list). It uses an UpdateWorkoutStructureDto which includes a new title and an array of exercises (with each exercise’s Id if existing, or a new Id for new exercises). The service updates the workout’s exercises accordingly (preserving any that match by Id, adding new ones, removing those omitted) and returns the updated workout DTO. If the workout doesn’t exist (or doesn’t belong to the user), it returns 404.

DELETE /api/workouts/{id} deletes a workout. Returns a boolean (true if deletion succeeded, false if not found).

(Planned) PATCH /api/workouts/{id} for partial updates of workout metadata (like marking it complete or updating the scheduled date) – this endpoint is not yet implemented on the backend, even though the frontend expects it (see notes below). This would use perhaps a smaller DTO (e.g., containing just scheduledAt, completedAt, perceivedLoad fields) and call WorkoutService.UpdatePartialAsync to set those fields. Currently, this is a missing piece (one of the improvements needed).

Other Backend Files:

ProfileMapper.cs, WorkoutMapper.cs – helper classes to convert domain models to DTOs and vice versa. For example, WorkoutMapper.ToDto(domainWorkout) produces a WorkoutDto with all nested exercises converted to ExerciseDto. These are used in the controllers to return responses. Conversely, there are methods to map create/update DTOs into domain objects for processing.

Program.cs – the entry point configuring the web application. Important configurations done here:

Adds services to DI container: e.g., DbContext with connection string, repository implementations for each interface, application services, and JWT/Authentication setup.

Configures authentication scheme to JWT bearer and sets up token validation parameters (using the JwtOptions from configuration for issuer, audience, and secret key).

Enables CORS policy named "frontend" which currently allows any origin and any header/method (suitable for development/testing with local frontends; in production this should be restricted).

Enables Swagger UI in development mode.

Finally, app.UseAuthentication/Authorization and app.MapControllers() to wire up the API endpoints.

With this structure, the codebase is relatively clean: the frontend is decoupled from backend implementation (just uses the API), and the backend separates concerns of data access vs business logic vs API layer.
