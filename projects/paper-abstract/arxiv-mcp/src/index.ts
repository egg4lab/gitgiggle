import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { XMLParser } from "fast-xml-parser";
import fs from "node:fs/promises";
import path from "node:path";

const server = new McpServer({
  name: "arxiv-mcp",
  version: "0.1.0",
});

// Shared XML parser instance for arXiv Atom feeds
const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
});

type ArxivAuthor = {
  name?: string;
};

type ArxivLink = {
  "@_href"?: string;
  "@_rel"?: string;
  "@_title"?: string;
  "@_type"?: string;
};

type ArxivEntry = {
  id?: string;
  title?: string;
  summary?: string;
  updated?: string;
  published?: string;
  author?: ArxivAuthor | ArxivAuthor[];
  link?: ArxivLink | ArxivLink[];
};

/**
 * Extract the canonical arXiv ID (without version) from an entry id URL.
 * Example: "http://arxiv.org/abs/2410.01234v1" -> "2410.01234"
 */
function extractArxivId(id?: string): string | undefined {
  if (!id) return undefined;
  const parts = id.split("/abs/");
  if (parts.length < 2) return undefined;
  const withVersion = parts[1];
  // strip optional version suffix like "v1"
  const match = withVersion.match(/^([0-9]+\.[0-9]+)(v[0-9]+)?$/);
  if (match) return match[1];
  // fallback: remove trailing version if present
  return withVersion.split("v")[0];
}

/**
 * Normalize author field (can be a single object or array) into array of names.
 */
function normalizeAuthors(author?: ArxivEntry["author"]): string[] {
  if (!author) return [];
  if (Array.isArray(author)) {
    return author.map((a) => a.name).filter((n): n is string => !!n);
  }
  return author.name ? [author.name] : [];
}

/**
 * Find the best PDF URL from an entry's link(s).
 */
function findPdfUrl(link?: ArxivEntry["link"]): string | undefined {
  const links = Array.isArray(link) ? link : link ? [link] : [];
  for (const l of links) {
    if (
      l["@_href"] &&
      (l["@_title"] === "pdf" || l["@_type"] === "application/pdf")
    ) {
      return l["@_href"];
    }
  }
  return undefined;
}

server.registerTool(
  "search_arxiv",
  {
    description: "Search arXiv for papers and return basic metadata.",
    inputSchema: z.object({
      query: z
        .string()
        .min(1)
        .describe("Search query for arXiv (e.g. 'AI chip floorplanning')."),
      max_results: z
        .number()
        .int()
        .min(1)
        .max(50)
        .default(5)
        .describe("Maximum number of results to return (1-50)."),
    }),
  },
  async ({ query, max_results }) => {
    const maxResults = max_results ?? 5;
    const url = new URL("http://export.arxiv.org/api/query");
    url.searchParams.set("search_query", `all:${query}`);
    url.searchParams.set("start", "0");
    url.searchParams.set("max_results", String(maxResults));

    let xml: string;
    try {
      const response = await fetch(url.toString(), {
        headers: {
          "User-Agent": "arxiv-mcp/0.1.0 (MCP server for arXiv search)",
        },
      });
      if (!response.ok) {
        return {
          content: [
            {
              type: "text" as const,
              text: `arXiv API request failed with status ${response.status}`,
            },
          ],
        };
      }
      xml = await response.text();
    } catch (error: any) {
      console.error("Error calling arXiv API:", error);
      return {
        content: [
          {
            type: "text" as const,
            text: `Error calling arXiv API: ${String(error)}`,
          },
        ],
      };
    }

    let feed: any;
    try {
      feed = xmlParser.parse(xml);
    } catch (error: any) {
      console.error("Error parsing arXiv XML:", error);
      return {
        content: [
          {
            type: "text" as const,
            text: `Error parsing arXiv response XML: ${String(error)}`,
          },
        ],
      };
    }

    const entriesRaw = feed?.feed?.entry;
    const entries: ArxivEntry[] = Array.isArray(entriesRaw)
      ? entriesRaw
      : entriesRaw
      ? [entriesRaw]
      : [];

    const results = entries.map((entry) => {
      const arxivId = extractArxivId(entry.id);
      const pdfUrl =
        findPdfUrl(entry.link) ||
        (arxivId ? `https://arxiv.org/pdf/${arxivId}.pdf` : undefined);

      return {
        arxiv_id: arxivId ?? null,
        title: (entry.title ?? "").toString().trim(),
        summary: (entry.summary ?? "").toString().trim(),
        authors: normalizeAuthors(entry.author),
        published: entry.published ?? null,
        updated: entry.updated ?? null,
        pdf_url: pdfUrl ?? null,
      };
    });

    const textSummary =
      results.length === 0
        ? "No results from arXiv."
        : results
            .map((r, idx) => {
              const idPart = r.arxiv_id ? ` [${r.arxiv_id}]` : "";
              const authorsPart = r.authors.length
                ? `\nAuthors: ${r.authors.join(", ")}`
                : "";
              return `${idx + 1}. ${r.title}${idPart}${authorsPart}`;
            })
            .join("\n\n");

    return {
      content: [
        {
          type: "text" as const,
          text:
            textSummary +
            "\n\n---\nRaw JSON results (for programmatic use):\n" +
            JSON.stringify(results, null, 2),
        },
      ],
    };
  }
);

server.registerTool(
  "download_arxiv_pdf",
  {
    description:
      "Download an arXiv paper PDF to the local filesystem for later analysis.",
    inputSchema: z.object({
      arxiv_id: z
        .string()
        .min(1)
        .describe(
          "arXiv identifier without version, e.g. '2410.01234' (no 'v1')."
        ),
      target_dir: z
        .string()
        .min(1)
        .default("papers")
        .describe(
          "Relative directory (from the server working directory) to save the PDF into."
        ),
    }),
  },
  async ({ arxiv_id, target_dir }) => {
    const pdfUrl = `https://arxiv.org/pdf/${encodeURIComponent(
      arxiv_id
    )}.pdf`;

    const baseDir = process.cwd();
    const dirPath = path.resolve(baseDir, target_dir || "papers");
    const filePath = path.join(dirPath, `${arxiv_id}.pdf`);

    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error: any) {
      console.error("Error creating directory:", error);
      return {
        content: [
          {
            type: "text" as const,
            text: `Failed to create directory '${dirPath}': ${String(error)}`,
          },
        ],
      };
    }

    try {
      const response = await fetch(pdfUrl, {
        headers: {
          "User-Agent": "arxiv-mcp/0.1.0 (MCP server for arXiv PDF download)",
        },
      });

      if (!response.ok) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Failed to download PDF from arXiv (status ${response.status}). URL: ${pdfUrl}`,
            },
          ],
        };
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      await fs.writeFile(filePath, buffer);

      return {
        content: [
          {
            type: "text" as const,
            text: `Downloaded arXiv PDF '${arxiv_id}' to:\n${filePath}\nSize: ${buffer.byteLength} bytes`,
          },
        ],
      };
    } catch (error: any) {
      console.error("Error downloading or saving arXiv PDF:", error);
      return {
        content: [
          {
            type: "text" as const,
            text: `Error downloading or saving PDF: ${String(error)}`,
          },
        ],
      };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("arxiv-mcp server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in arxiv-mcp main():", error);
  process.exit(1);
});

