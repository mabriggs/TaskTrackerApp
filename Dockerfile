# Stage 1: Runtime only (build happens in GitHub Action)
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Copy pre-built app files from GitHub Action (these come from ./out)
COPY . .

EXPOSE 8080
ENTRYPOINT ["dotnet", "TaskTrackerApp.Server.dll"]