using System.Diagnostics;
using Microsoft.AspNetCore.Hosting.Server;
using Microsoft.AspNetCore.Hosting.Server.Features;

var options = new WebApplicationOptions
{
    Args = args,
    ContentRootPath = AppContext.BaseDirectory,
    WebRootPath = Path.Combine(AppContext.BaseDirectory, "wwwroot")
};

var builder = WebApplication.CreateBuilder(options);
builder.WebHost.UseUrls("http://127.0.0.1:0");

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();
app.MapFallbackToFile("index.html");

app.Lifetime.ApplicationStarted.Register(() =>
{
    var server = app.Services.GetRequiredService<IServer>();
    var addresses = server.Features.Get<IServerAddressesFeature>()?.Addresses;
    var url = addresses?.FirstOrDefault();

    if (string.IsNullOrWhiteSpace(url))
    {
        return;
    }

    Process.Start(new ProcessStartInfo
    {
        FileName = url,
        UseShellExecute = true
    });
});

app.Run();
