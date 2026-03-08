using SportPlannerNW.Services;
using Supabase;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using FluentValidation.AspNetCore;
using FluentValidation;
using System.Reflection;
using MediatR;
using SportPlannerNW.Models.Common;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers()
    .ConfigureApiBehaviorOptions(options =>
    {
        options.InvalidModelStateResponseFactory = context =>
        {
            var errors = context.ModelState
                .Where(e => e.Value?.Errors.Count > 0)
                .ToDictionary(
                    kvp => kvp.Key,
                    kvp => kvp.Value!.Errors.Select(e => e.ErrorMessage).ToArray()
                );

            var response = ApiResponse<object>.FallidoValidacion(errors);
            return new BadRequestObjectResult(response);
        };
    });
builder.Services.AddOpenApi();

// FluentValidation
builder.Services.AddFluentValidationAutoValidation()
                .AddFluentValidationClientsideAdapters();
builder.Services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

// MediatR
builder.Services.AddMediatR(Assembly.GetExecutingAssembly());

// JWT Configuration
var jwtSecret = builder.Configuration["Supabase:JwtSecret"];
var bytes = Encoding.UTF8.GetBytes(jwtSecret ?? "super-secret-key-that-should-be-in-appsettings-but-is-missing");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(bytes),
            ValidateIssuer = false,
            ValidateAudience = false
        };
    });

// Supabase Configuration - use ServiceKey to bypass RLS
// Supabase Configuration - use ServiceKey to bypass RLS
var supabaseUrl = builder.Configuration["Supabase:Url"];
var supabaseServiceKey = builder.Configuration["Supabase:ServiceKey"]; // Ensure this is the SERVICE_ROLE key

builder.Services.AddScoped<Supabase.Client>(_ => 
    new Supabase.Client(supabaseUrl!, supabaseServiceKey!, new Supabase.SupabaseOptions
    {
        AutoRefreshToken = false,
        AutoConnectRealtime = false,
        SessionHandler = new NoOpSessionHandler() 
    }));

// Services Registration
builder.Services.AddScoped<ISubscriptionService, SubscriptionService>();
builder.Services.AddScoped<ISeasonService, SeasonService>();
builder.Services.AddScoped<ITeamService, TeamService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IConceptService, ConceptService>();
builder.Services.AddScoped<IPlayerService, PlayerService>();
builder.Services.AddScoped<IPlanService, PlanService>();

// CORS Configuration
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:4200") // URL por defecto de Angular
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// Global Exception Handler
app.UseMiddleware<SportPlannerNW.Middleware.ErrorHandlingMiddleware>();

app.UseHttpsRedirection();

app.UseCors();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
