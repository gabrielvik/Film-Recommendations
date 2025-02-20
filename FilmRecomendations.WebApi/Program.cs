using System.Net.Http.Headers;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddSwaggerGen();

builder.Services.AddHttpClient(name: "TMDb.WebApi",
  configureClient: options =>
  {
      options.BaseAddress = builder.Configuration.GetSection("TMDb:BaseAddress").Get<Uri>();
      options.DefaultRequestHeaders.Accept.Add(
        new MediaTypeWithQualityHeaderValue(
        "application/json", 1.0));

      // Add the Authorization header here
      options.DefaultRequestHeaders.Authorization =
          new AuthenticationHeaderValue("Bearer", builder.Configuration["TMDb:ApiKey"]);
  });

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
