"use client";
import { EnokiFlowProvider } from "@mysten/enoki/react";
export default function ({ children }: { children: React.ReactNode }) {
    return <EnokiFlowProvider apiKey="enoki_public_6646caa1f30298432565ccca00c4b9a2">{children}</EnokiFlowProvider>;
}
