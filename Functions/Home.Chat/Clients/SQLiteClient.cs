using Microsoft.Data.Sqlite;
using Microsoft.Extensions.Options;

namespace SQLiteClient;

public class SQLiteClient(IOptions<SQLiteOptions> options)
{
    private readonly string _connectionString = $"Data Source={options.Value.DatabasePath}";

    private SqliteConnection CreateConnection()
    {
        var connection = new SqliteConnection(_connectionString);
        connection.Open();
        return connection;
    }

    public async Task ExecuteAsync(string sql, Dictionary<string, object?>? parameters = null)
    {
        await using var connection = CreateConnection();
        await using var command = connection.CreateCommand();
        command.CommandText = sql;
        BindParameters(command, parameters);
        await command.ExecuteNonQueryAsync();
    }

    public async Task<List<T>> QueryAsync<T>(string sql, Func<SqliteDataReader, T> map, Dictionary<string, object?>? parameters = null)
    {
        await using var connection = CreateConnection();
        await using var command = connection.CreateCommand();
        command.CommandText = sql;
        BindParameters(command, parameters);

        await using var reader = await command.ExecuteReaderAsync();
        var results = new List<T>();
        while (await reader.ReadAsync())
            results.Add(map(reader));

        return results;
    }

    public async Task CreateTableAsync(string tableName, Dictionary<string, string> columns)
    {
        var columnDefs = string.Join(", ", columns.Select(c => $"{c.Key} {c.Value}"));
        await ExecuteAsync($"CREATE TABLE IF NOT EXISTS {tableName} ({columnDefs})");
    }

    public async Task InsertAsync(string tableName, Dictionary<string, object?> values)
    {
        var cols = string.Join(", ", values.Keys);
        var paramNames = string.Join(", ", values.Keys.Select(k => $"@{k}"));
        var parameters = values.ToDictionary(k => $"@{k.Key}", v => v.Value);
        await ExecuteAsync($"INSERT INTO {tableName} ({cols}) VALUES ({paramNames})", parameters);
    }

    public async Task<List<Dictionary<string, object?>>> SelectAsync(string tableName, string? whereClause = null, Dictionary<string, object?>? parameters = null)
    {
        var sql = $"SELECT * FROM {tableName}";
        if (!string.IsNullOrEmpty(whereClause))
            sql += $" WHERE {whereClause}";

        return await QueryAsync(sql, reader =>
        {
            var row = new Dictionary<string, object?>();
            for (var i = 0; i < reader.FieldCount; i++)
                row[reader.GetName(i)] = reader.IsDBNull(i) ? null : reader.GetValue(i);
            return row;
        }, parameters);
    }

    private static void BindParameters(SqliteCommand command, Dictionary<string, object?>? parameters)
    {
        if (parameters is null) return;
        foreach (var (key, value) in parameters)
            command.Parameters.AddWithValue(key, value ?? DBNull.Value);
    }
}
