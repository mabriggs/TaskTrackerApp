# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy sln and csproj files
COPY *.sln .
COPY TaskTrackerApp.Server/*.csproj TaskTrackerApp.Server/
COPY TaskTrackerApp.Client/*.csproj TaskTrackerApp.Client/
RUN dotnet restore

# Copy the entire source and build
COPY . .
WORKDIR /app/TaskTrackerApp.Server
RUN dotnet publish -c Release -o out

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/TaskTrackerApp.Server/out ./

# Configure port and entrypoint
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "TaskTrackerApp.Server.dll"]
