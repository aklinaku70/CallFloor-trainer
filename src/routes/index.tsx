import { createFileRoute } from "@tanstack/react-router";
import { Floor } from "@/components/floor";

export const Route = createFileRoute("/")({ component: Floor });
