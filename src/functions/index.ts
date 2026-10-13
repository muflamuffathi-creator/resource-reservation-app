export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/health") {
      return new Response(JSON.stringify({ status: "ok", service: "reservation-neon-function" }), {
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ message: "PrimeWave Resource Reservation Neon Function" }), {
      headers: { "Content-Type": "application/json" },
    });
  },
};
