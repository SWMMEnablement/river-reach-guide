import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const systemPrompt = `You are an expert hydraulic engineer and hydrologist assistant specializing in:

1. **Open Channel Hydraulics**
   - Manning's equation and channel flow calculations
   - Froude number and flow regime analysis (subcritical, critical, supercritical)
   - Hydraulic jumps and energy dissipation
   - Gradually varied flow (GVF) profiles
   - Rating curves and stage-discharge relationships

2. **Hydraulic Modeling Software**
   - Autodesk InfoWorks ICM (1D/2D modeling)
   - EPA SWMM (stormwater modeling)
   - HEC-RAS (river analysis)
   - HY-8 culvert analysis

3. **Stormwater Management**
   - Low Impact Development (LID) controls
   - Sustainable Drainage Systems (SuDS)
   - Bio-retention, permeable pavement, green roofs
   - Detention and retention basins

4. **Culvert and Bridge Hydraulics**
   - Inlet and outlet control analysis
   - Headwater calculations
   - Sizing and design methodology

5. **1D/2D Coupled Modeling**
   - Coupling zone setup
   - Lateral spill connections
   - 2D mesh design considerations

Provide clear, technically accurate answers with:
- Relevant equations and formulas when applicable
- Typical design values and ranges
- Practical engineering considerations
- References to industry standards (FHWA, AASHTO, EPA) when relevant

Keep responses focused and concise while being thorough on technical details.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, systemPrompt: customSystemPrompt } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Messages array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Calling Lovable AI Gateway with", messages.length, "messages");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: customSystemPrompt || systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Streaming response from AI Gateway");

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Hydraulics chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
