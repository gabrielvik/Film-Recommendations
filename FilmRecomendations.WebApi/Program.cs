using FilmRecomendations.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

Environment.SetEnvironmentVariable("OPENAI_API_KEY", builder.Configuration["OpenAI:ApiKey"]);
Environment.SetEnvironmentVariable("TMDb:ApiKey", builder.Configuration["TMDb:ApiKey"]);

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddSwaggerGen();
builder.Services.AddTransient<IAiService, AiService>();
builder.Services.AddHttpClient<ITMDBService, TMDBService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
