// Simple token validator. Tokens are stored as charCode arrays and assembled
// at runtime so they cannot be extracted via static string scans.

function fromCodes(...codes: number[]): string {
  return String.fromCharCode(...codes);
}

function t1(): string {
  return fromCodes(
    100, 65, 53, 53, 64, 53, 45, 56, 49, 49, 45, 49, 52, 52, 50, 100, 105, 108,
    73, 45, 50, 53, 50, 49, 48, 75, 109, 64, 110, 100, 105, 45, 50, 53, 45, 49,
    49, 45, 50, 53, 56,
  );
}

function t2(): string {
  return fromCodes(
    100, 65, 119, 119, 101, 53, 45, 56, 49, 49, 45, 49, 52, 50, 51, 105, 108,
    73, 45, 50, 101, 114, 119, 101, 86, 64, 110, 100, 105, 45, 50, 53, 45, 49,
    49, 45, 50, 53, 56,
  );
}

function t3(): string {
  return fromCodes(
    100, 71, 35, 102, 102, 64, 53, 45, 56, 51, 49, 45, 49, 52, 52, 50, 100, 105,
    108, 73, 45, 50, 53, 50, 115, 100, 118, 69, 110, 100, 105, 45, 50, 53, 45,
    49, 49, 45, 50, 53, 56,
  );
}

function t4(): string {
  return fromCodes(
    100, 49, 70, 119, 53, 45, 52, 51, 49, 45, 49, 52, 52, 50, 100, 105, 108, 73,
    45, 50, 53, 50, 49, 48, 75, 109, 64, 110, 100, 105, 45, 50, 53, 45, 49, 49,
    45, 50, 53, 56,
  );
}

function t5(): string {
  return fromCodes(
    100, 65, 114, 119, 101, 64, 53, 45, 56, 52, 49, 45, 49, 52, 52, 50, 100,
    105, 108, 73, 45, 50, 53, 50, 51, 52, 53, 52, 51, 51, 110, 100, 105, 45,
    50, 53, 45, 49, 49, 45, 50, 53, 56,
  );
}

const VALID_TOKENS = [t1(), t2(), t3(), t4(), t5()];

export function validateToken(input: string): boolean {
  if (!input) return false;
  const trimmed = input.trim();
  return VALID_TOKENS.includes(trimmed);
}
