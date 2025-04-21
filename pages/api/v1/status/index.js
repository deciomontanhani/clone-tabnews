import database from "infra/database.js";

async function status(request, response) {
  const updatedAt = new Date().toISOString();

  const result = await database.query(
    "SELECT setting FROM pg_settings WHERE name in ('server_version', 'max_connections')",
  );

  const databaseName = process.env.POSTGRES_DB;
  const currentConnectionsResult = await database.query({
    text: "SELECT COUNT(*) FROM pg_stat_activity WHERE datname = $1",
    values: [databaseName],
  });

  const version = result.rows[1].setting;
  const maxConnections = result.rows[0].setting;
  const currentConnections = currentConnectionsResult.rows[0].count;

  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        version: version,
        max_connections: parseInt(maxConnections),
        opened_connections: parseInt(currentConnections),
      },
    },
  });
}

export default status;
