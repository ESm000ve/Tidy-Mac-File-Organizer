# Contributing

Start with a concrete use case and inspect existing patterns. Every change needs a source/Figma reference, named states, Light/Dark review and accessibility notes.

1. Update the token snapshot only after the design decision is reviewed.
2. Add or modify one family with a small, explicit API.
3. Add named stories and a matrix; do not use the matrix as the only regression case.
4. Assert meaningful behavior with a play function.
5. Run type checking, the static build and browser tests.
6. Inspect focus, long text, reduced motion and narrow layouts.
7. Update source mapping and record outstanding native validation.

Proposed → In review → Ready for adoption → Stable. Stable requires a production consumer. Use patch versions for fixes, minor versions for additive APIs and major versions for breaking semantics. Token changes require reviewing affected consumers before choosing a version.

Do not invent research findings, adoption counts or business impact. Document evidence and proposed measures separately.
