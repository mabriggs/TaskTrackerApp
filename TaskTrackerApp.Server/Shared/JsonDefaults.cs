using System.Text.Json;
using System.Text.Json.Serialization;

namespace TaskTrackerApp.Server.Shared
{
    public static class JsonDefaults
    {
        public static JsonSerializerOptions SetJsonSerializerOptions(JsonSerializerOptions options)
        {
            options.Converters.Add(new JsonStringEnumConverter());
            options.Converters.Add(new CustomDateTimeConverter());
            options.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
            options.WriteIndented = true;
            return options;
        }
    }
}
