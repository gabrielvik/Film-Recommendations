using FilmRecomendations.Services;

using FilmRecomendations.Db;
using FilmRecomendations.Db.DbModels;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.


Environment.SetEnvironmentVariable("OPENAI_API_KEY", builder.Configuration["OpenAI:ApiKey"]);
Environment.SetEnvironmentVariable("TMDb:ApiKey", builder.Configuration["TMDb:ApiKey"]);
Environment.SetEnvironmentVariable("GROK_API_KEY", builder.Configuration["GROK:ApiKey"]);

//dbservice
builder.Services.AddDbContext<FilmDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("FilmConnectionString")));

//identity
builder.Services.AddIdentity<ApplicationUser, IdentityRole>()
        .AddEntityFrameworkStores<FilmDbContext>()
        .AddDefaultTokenProviders();

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = builder.Configuration["Jwt:Issuer"],
                ValidAudience = builder.Configuration["Jwt:Audience"],
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
            };
        });

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddSwaggerGen();
builder.Services.AddTransient<IAiService, AiService>();

//CORS policy for frontend localhost:5173
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        builder =>
        {
            builder.WithOrigins("http://localhost:5173", "http://localhost:5291")
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
});
builder.Services.AddHttpClient<ITMDBService, TMDBService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
