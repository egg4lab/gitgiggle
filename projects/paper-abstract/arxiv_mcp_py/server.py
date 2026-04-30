from __future__ import annotations

"""
Simple MCP server for arXiv.

Tools:
  - search_arxiv(query: str, max_results: int = 5) -> str
  - download_arxiv_pdf(arxiv_id: str, target_dir: str = "papers") -> str
"""

import asyncio
import textwrap
import xml.etree.ElementTree as ET
from pathlib import Path

import httpx
from mcp.server.fastmcp import FastMCP


mcp = FastMCP("arxiv-mcp")

ARXIV_API_BASE = "http://export.arxiv.org/api/query"


def _extract_arxiv_id(full_id: str | None) -> str | None:
    """Extract canonical arXiv ID (no version) from an entry id URL."""
    if not full_id:
        return None
    if "/abs/" not in full_id:
        return None
    with_version = full_id.split("/abs/", 1)[1]
    # Strip optional version suffix like "v1"
    if "v" in with_version:
        core, _sep, _ver = with_version.partition("v")
        return core
    return with_version


@mcp.tool()
async def search_arxiv(query: str, max_results: int = 5) -> str:
    """
    Search arXiv for papers and return a human-readable list.

    Args:
        query: Free-text query, e.g. "AI chip floorplanning".
        max_results: Maximum number of results (1–50).
    """
    max_results = max(1, min(int(max_results), 50))

    params = {
        "search_query": f"all:{query}",
        "start": "0",
        "max_results": str(max_results),
    }

    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(
                ARXIV_API_BASE,
                params=params,
                headers={"User-Agent": "arxiv-mcp-python/0.1.0"},
                timeout=30.0,
            )
            resp.raise_for_status()
        except Exception as exc:  # noqa: BLE001
            return f"Error calling arXiv API: {exc!r}"

    xml_text = resp.text

    try:
        root = ET.fromstring(xml_text)
    except Exception as exc:  # noqa: BLE001
        return f"Error parsing arXiv XML: {exc!r}"

    ns = {"atom": "http://www.w3.org/2005/Atom"}
    entries = root.findall("atom:entry", ns)
    if not entries:
        return "No results from arXiv."

    lines: list[str] = []
    for idx, entry in enumerate(entries, start=1):
        full_id = entry.findtext("atom:id", default="", namespaces=ns)
        arxiv_id = _extract_arxiv_id(full_id) or "UNKNOWN"
        title = entry.findtext("atom:title", default="", namespaces=ns).strip()
        summary = entry.findtext("atom:summary", default="", namespaces=ns).strip()

        authors = [
            a.findtext("atom:name", default="", namespaces=ns).strip()
            for a in entry.findall("atom:author", ns)
        ]
        authors = [a for a in authors if a]

        # Try to find an explicit PDF link; otherwise construct it.
        pdf_url = f"https://arxiv.org/pdf/{arxiv_id}.pdf"
        for link in entry.findall("atom:link", ns):
            title_attr = link.get("title")
            type_attr = link.get("type")
            href = link.get("href")
            if href and (title_attr == "pdf" or type_attr == "application/pdf"):
                pdf_url = href
                break

        block = [
            f"{idx}. {title} [{arxiv_id}]",
        ]
        if authors:
            block.append(f"   Authors: {', '.join(authors)}")
        block.append(f"   PDF: {pdf_url}")
        if summary:
            wrapped = textwrap.fill(
                summary,
                width=80,
                initial_indent="   Abstract: ",
                subsequent_indent="             ",
            )
            block.append(wrapped)

        lines.append("\n".join(block))

    return "\n\n".join(lines)


@mcp.tool()
async def download_arxiv_pdf(arxiv_id: str, target_dir: str = "papers") -> str:
    """
    Download an arXiv paper PDF to the local filesystem for later analysis.

    Args:
        arxiv_id: Identifier without version, e.g. "2410.01234" (no "v1").
        target_dir: Relative directory to save the PDF into (default: "papers").
    """
    arxiv_id = arxiv_id.strip()
    if not arxiv_id:
        return "arxiv_id must not be empty."

    pdf_url = f"https://arxiv.org/pdf/{arxiv_id}.pdf"

    dir_path = Path(target_dir)
    try:
        dir_path.mkdir(parents=True, exist_ok=True)
    except Exception as exc:  # noqa: BLE001
        return f"Failed to create directory '{dir_path}': {exc!r}"

    file_path = dir_path / f"{arxiv_id}.pdf"

    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(
                pdf_url,
                headers={"User-Agent": "arxiv-mcp-python/0.1.0"},
                timeout=60.0,
            )
            resp.raise_for_status()
        except Exception as exc:  # noqa: BLE001
            return f"Failed to download PDF from {pdf_url}: {exc!r}"

    data = resp.content

    try:
        file_path.write_bytes(data)
    except Exception as exc:  # noqa: BLE001
        return f"Failed to save PDF to '{file_path}': {exc!r}"

    return (
        f"Downloaded arXiv PDF '{arxiv_id}' to:\n"
        f"{file_path.resolve()}\n"
        f"Size: {len(data)} bytes"
    )


def main() -> None:
    # Run as an MCP stdio server.
    mcp.run(transport="stdio")


if __name__ == "__main__":
    # Allow running directly: python server.py
    asyncio.run(asyncio.to_thread(main))

from __future__ import annotations

"""
Simple MCP server for arXiv:

Tools:
  - search_arxiv(query: str, max_results: int = 5) -> str
  - download_arxiv_pdf(arxiv_id: str, target_dir: str = "papers") -> str

Intended to be run as an MCP stdio server from a client like Cursor.
"""

import asyncio
import textwrap
import xml.etree.ElementTree as ET
from pathlib import Path

import httpx
from mcp.server.fastmcp import FastMCP


mcp = FastMCP("arxiv-mcp")


ARXIV_API_BASE = "http://export.arxiv.org/api/query"


def _extract_arxiv_id(full_id: str | None) -> str | None:
    """
    Extract canonical arXiv ID (without version) from an entry id URL.
    Example: "http://arxiv.org/abs/2410.01234v1" -> "2410.01234"
    """
    if not full_id:
        return None
    if "/abs/" not in full_id:
        return None
    with_version = full_id.split("/abs/", 1)[1]
    # Strip optional version suffix like "v1"
    if "v" in with_version:
        core, _sep, _ver = with_version.partition("v")
        return core
    return with_version


@mcp.tool()
async def search_arxiv(query: str, max_results: int = 5) -> str:
    """
    Search arXiv for papers and return a human-readable list.

    Args:
        query: Free-text query, e.g. "AI chip floorplanning".
        max_results: Maximum number of results (1–50).
    """
    max_results = max(1, min(int(max_results), 50))

    params = {
        "search_query": f"all:{query}",
        "start": "0",
        "max_results": str(max_results),
    }

    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(
                ARXIV_API_BASE,
                params=params,
                headers={"User-Agent": "arxiv-mcp-python/0.1.0"},
                timeout=30.0,
            )
            resp.raise_for_status()
        except Exception as exc:  # noqa: BLE001
            return f"Error calling arXiv API: {exc!r}"

    xml_text = resp.text

    try:
        root = ET.fromstring(xml_text)
    except Exception as exc:  # noqa: BLE001
        return f"Error parsing arXiv XML: {exc!r}"

    ns = {"atom": "http://www.w3.org/2005/Atom"}
    entries = root.findall("atom:entry", ns)
    if not entries:
        return "No results from arXiv."

    lines: list[str] = []
    for idx, entry in enumerate(entries, start=1):
        full_id = entry.findtext("atom:id", default="", namespaces=ns)
        arxiv_id = _extract_arxiv_id(full_id) or "UNKNOWN"
        title = entry.findtext("atom:title", default="", namespaces=ns).strip()
        summary = entry.findtext("atom:summary", default="", namespaces=ns).strip()

        authors = [
            a.findtext("atom:name", default="", namespaces=ns).strip()
            for a in entry.findall("atom:author", ns)
        ]
        authors = [a for a in authors if a]

        # Try to find an explicit PDF link; otherwise construct it.
        pdf_url = f"https://arxiv.org/pdf/{arxiv_id}.pdf"
        for link in entry.findall("atom:link", ns):
            rel = link.get("rel")
            title_attr = link.get("title")
            type_attr = link.get("type")
            href = link.get("href")
            if href and (title_attr == "pdf" or type_attr == "application/pdf"):
                pdf_url = href
                break

        block = [
            f"{idx}. {title} [{arxiv_id}]",
        ]
        if authors:
            block.append(f"   Authors: {', '.join(authors)}")
        block.append(f"   PDF: {pdf_url}")
        if summary:
            wrapped = textwrap.fill(summary, width=80, initial_indent="   Abstract: ", subsequent_indent="             ")
            block.append(wrapped)

        lines.append("\n".join(block))

    return "\n\n".join(lines)


@mcp.tool()
async def download_arxiv_pdf(arxiv_id: str, target_dir: str = "papers") -> str:
    """
    Download an arXiv paper PDF to the local filesystem for later analysis.

    Args:
        arxiv_id: Identifier without version, e.g. "2410.01234" (no "v1").
        target_dir: Relative directory to save the PDF into (default: "papers").
    """
    arxiv_id = arxiv_id.strip()
    if not arxiv_id:
        return "arxiv_id must not be empty."

    pdf_url = f"https://arxiv.org/pdf/{arxiv_id}.pdf"

    dir_path = Path(target_dir)
    try:
        dir_path.mkdir(parents=True, exist_ok=True)
    except Exception as exc:  # noqa: BLE001
        return f"Failed to create directory '{dir_path}': {exc!r}"

    file_path = dir_path / f"{arxiv_id}.pdf"

    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(
                pdf_url,
                headers={"User-Agent": "arxiv-mcp-python/0.1.0"},
                timeout=60.0,
            )
            resp.raise_for_status()
        except Exception as exc:  # noqa: BLE001
            return f"Failed to download PDF from {pdf_url}: {exc!r}"

    data = resp.content

    try:
        file_path.write_bytes(data)
    except Exception as exc:  # noqa: BLE001
        return f"Failed to save PDF to '{file_path}': {exc!r}"

    return f"Downloaded arXiv PDF '{arxiv_id}' to:\n{file_path.resolve()}\nSize: {len(data)} bytes"


def main() -> None:
    # Run as an MCP stdio server.
    mcp.run(transport="stdio")


if __name__ == "__main__":
    # Allow running directly: python server.py
    asyncio.run(asyncio.to_thread(main))

