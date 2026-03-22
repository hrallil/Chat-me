FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy project files first for layer caching
COPY Home.Chat.csproj .

RUN dotnet restore Home.Chat.csproj

# Copy the rest and publish
COPY . .
RUN dotnet publish Home.Chat.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/azure-functions/dotnet-isolated:4-dotnet-isolated10.0
WORKDIR /home/site/wwwroot

COPY --from=build /app/publish .

ENV AzureWebJobsScriptRoot=/home/site/wwwroot \
    AzureFunctionsJobHost__Logging__Console__IsEnabled=true

EXPOSE 80
