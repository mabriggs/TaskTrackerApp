# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy everything
COPY . .

# Build React app
WORKDIR /app/tasktrackerapp.client
RUN npm install
RUN npm run build

# Publish .NET app
WORKDIR /app/TaskTrackerApp.Server
RUN dotnet publish -c Release -o /app/out

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

COPY --from=build /app/out ./

EXPOSE 8080
ENTRYPOINT ["dotnet", "TaskTrackerApp.Server.dll"]
