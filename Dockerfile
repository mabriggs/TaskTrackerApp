# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy everything
COPY . ./

# Restore and publish
RUN dotnet restore TaskTrackerApp.Server/TaskTrackerApp.Server.csproj
RUN dotnet publish TaskTrackerApp.Server/TaskTrackerApp.Server.csproj -c Release -o /app/out

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/out ./

# Expose port (adjust if needed)
EXPOSE 8080
ENTRYPOINT ["dotnet", "TaskTrackerApp.Server.dll"]