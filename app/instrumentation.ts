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
  // Create Arize metadata with headers
  const metadata = new Metadata();
  metadata.set("space_id", "U3BhY2U6MTU3ODg6L2o1Rw==");
  metadata.set("api_key", "8bb925c083f54c64a9c");

  registerOTel({
    serviceName: "bents-woodworking-assistant",
    attributes: {
      model_id: "gpt-4o-mini",
      model_version: "1.0.0",
    },
    spanProcessors: [
      new OpenInferenceSimpleSpanProcessor({
        exporter: new GrpcOTLPTraceExporter({
          url: "https://otlp.arize.com",
          metadata,
        }),
        spanFilter: (span) => isOpenInferenceSpan(span),
      }),
    ],
  });
}