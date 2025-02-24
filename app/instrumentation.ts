import { registerOTel } from "@vercel/otel";
import { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api";
import {
  isOpenInferenceSpan,
  OpenInferenceSimpleSpanProcessor,
} from "@arizeai/openinference-vercel";
import { Metadata } from "@grpc/grpc-js";
import { OTLPTraceExporter as GrpcOTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-grpc";

// Set debug logging
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

export function register() {
  console.log('Starting OpenTelemetry registration');
  
  // Create Arize metadata with headers
  const metadata = new Metadata();
  metadata.set("space_id", process.env.ARIZE_SPACE_ID || "");
  metadata.set("api_key", process.env.ARIZE_API_KEY || "");
  
  console.log('Arize credentials configured:', {
    hasSpaceId: Boolean(process.env.ARIZE_SPACE_ID),
    hasApiKey: Boolean(process.env.ARIZE_API_KEY)
  });

  registerOTel({
    serviceName: "bents-woodworking-assistant",
    attributes: {
      model_id: "gpt-4o-2024-11-20",
      model_version: "1.0.0",
      environment: process.env.NODE_ENV || "development"
    },
    spanProcessors: [
      new OpenInferenceSimpleSpanProcessor({
        exporter: new GrpcOTLPTraceExporter({
          url: "https://otlp.arize.com",
          metadata,
        }),
        spanFilter: (span) => {
          const isInferenceSpan = isOpenInferenceSpan(span);
          console.log('Filtering span:', { 
            spanName: span.name,
            isInferenceSpan 
          });
          return isInferenceSpan;
        },
      }),
    ],
  });
  
  console.log('OpenTelemetry registration complete');
}