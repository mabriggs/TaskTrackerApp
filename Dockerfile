# STAGE 1: Build the client
FROM node:20 AS client-builder
WORKDIR /app/client
COPY tasktrackerapp.client/ .
RUN npm install && npm run build

# STAGE 2: Build the server
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS server-builder
WORKDIR /app
COPY TaskTrackerApp.Server/*.csproj TaskTrackerApp.Server/
RUN dotnet restore TaskTrackerApp.Server/TaskTrackerApp.Server.csproj

# Copy everything now that restore is done
COPY . .
RUN dotnet publish TaskTrackerApp.Server/TaskTrackerApp.Server.csproj -c Release -o /app/out

# STAGE 3: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
ENV ASPNETCORE_ENVIRONMENT=Production
WORKDIR /app
COPY --from=server-builder /app/out ./
COPY --from=client-builder /app/client/dist ./wwwroot

EXPOSE 8080
RUN printenv > /tmp/env.dump
ENTRYPOINT ["dotnet", "TaskTrackerApp.Server.dll"]
