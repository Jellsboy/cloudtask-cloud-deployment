const port = process.env.PORT || 3000;
try {
  const response = await fetch(`http://127.0.0.1:${port}/api/health`);
  const payload = await response.json();
  console.log(JSON.stringify(payload, null, 2));
  process.exit(response.ok ? 0 : 1);
} catch (error) {
  console.error(`Health check failed: ${error.message}`);
  process.exit(1);
}
