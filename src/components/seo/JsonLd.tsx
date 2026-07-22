/** Injects a JSON-LD <script> for structured data / rich snippets. */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe to inline as structured data.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
