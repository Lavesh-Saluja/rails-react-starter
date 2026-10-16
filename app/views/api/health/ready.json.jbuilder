json.status @database_ready ? "ok" : "unavailable"
json.checks do
  json.database @database_ready ? "ok" : "unavailable"
end
