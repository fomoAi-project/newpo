export async function GET() {
  return Response.json({
    status: "ok",
    service: "aibiz-employee-platform",
    timestamp: new Date().toISOString(),
  });
}
