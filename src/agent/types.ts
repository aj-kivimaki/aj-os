/** Summary of a single tool invocation during an agent run. */
export interface ToolCallRecord {
  readonly name: string;
  readonly input: unknown;
  readonly isError: boolean;
}

/** Result of running the agent loop to completion. */
export interface AgentAnswer {
  readonly answer: string;
  readonly toolCalls: readonly ToolCallRecord[];
  readonly stopReason: string | null;
  readonly iterations: number;
}

export interface RunAgentOptions {
  readonly question: string;
  /** Max model round-trips before giving up. Defaults to 8. */
  readonly maxIterations?: number;
}

/** Result of executing a single tool, fed back to the model. */
export interface ToolExecResult {
  readonly content: string;
  readonly isError: boolean;
}
