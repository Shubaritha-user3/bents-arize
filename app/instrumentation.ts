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
  console.log('🔍 [DEBUG] Starting OpenTelemetry registration');
  
  try {
    const metadata = new Metadata();
    metadata.set("space_id", "U3BhY2U6MTU3ODg6L2o1Rw==");
    metadata.set("api_key", "8bb925c083f54c64a9c");
    
    console.log('🔑 [DEBUG] Arize credentials:', {
      spaceId: "U3BhY2U6MTU3ODg6L2o1Rw==",
      apiKeyLength: "8bb925c083f54c64a9c".length
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
            console.log('🔍 [DEBUG] Processing span:', { 
              name: span.name,
              attributes: span.attributes,
              isInference: isOpenInferenceSpan(span)
            });
            return isOpenInferenceSpan(span);
          },
        }),
      ],
    });
    console.log('✅ [DEBUG] OpenTelemetry registration successful');
  } catch (error) {
    console.error('❌ [DEBUG] OpenTelemetry registration failed:', error);
  }
}