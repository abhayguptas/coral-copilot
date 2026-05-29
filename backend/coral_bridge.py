"""Coral Copilot — Bridge to the Coral CLI."""

import asyncio
import json
import os
import re


CORAL_BIN = os.getenv("CORAL_BIN", "coral")


async def coral_source_list() -> list[dict]:
    """Run `coral source list` and parse the output into structured data."""
    proc = await asyncio.create_subprocess_exec(
        CORAL_BIN, "source", "list",
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    stdout, _ = await proc.communicate()
    output = stdout.decode().strip()
    if not output:
        return []

    sources = []
    for line in output.splitlines():
        line = line.strip()
        if line and not line.startswith("-"):
            parts = re.split(r"\s{2,}", line)
            if parts:
                sources.append({"name": parts[0], "status": "installed"})
    return sources


async def coral_source_discover() -> list[dict]:
    """Run `coral source discover` and parse available sources."""
    proc = await asyncio.create_subprocess_exec(
        CORAL_BIN, "source", "discover",
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    stdout, _ = await proc.communicate()
    output = stdout.decode().strip()
    if not output:
        return []

    # Get community sources from the sibling coral repo if available
    community_sources = set()
    try:
        community_path = os.path.expanduser("~/personal/coral/sources/community")
        if os.path.exists(community_path):
            community_sources = set(os.listdir(community_path))
    except Exception:
        pass
        
    # Get actually installed sources to accurately determine status
    installed_list = await coral_source_list()
    installed_names = {s["name"] for s in installed_list}

    sources = []
    for line in output.splitlines():
        line = line.strip()
        if line and not line.startswith("-") and not line.startswith("Source"):
            parts = re.split(r"\s{2,}", line)
            if len(parts) >= 2:
                name = parts[0]
                category = "community" if name in community_sources else "core"
                status = "installed" if name in installed_names else "available"
                sources.append({
                    "name": name,
                    "status": status,
                    "category": category
                })
                
    # Also inject all community sources if they weren't in the CLI output, 
    # since the user mentioned they are available now.
    existing_names = {s["name"] for s in sources}
    for c_source in community_sources:
        if c_source not in existing_names and not c_source.startswith("."):
            status = "installed" if c_source in installed_names else "available"
            sources.append({
                "name": c_source,
                "status": status,
                "category": "community"
            })
            
    # Sort alphabetically
    sources.sort(key=lambda x: x["name"])
    
    return sources


async def coral_source_add(name: str, token: str | None = None) -> str:
    """Run `coral source add <name>` and return the output."""
    env_key = f"{name.upper()}_TOKEN"
    community_manifest = os.path.expanduser(f"~/personal/coral/sources/community/{name}/manifest.yaml")
    core_manifest = os.path.expanduser(f"~/personal/coral/sources/core/{name}/manifest.yaml")
    
    manifest_to_parse = community_manifest if os.path.exists(community_manifest) else (core_manifest if os.path.exists(core_manifest) else None)
    
    # Try to parse the exact secret input key from the manifest
    if manifest_to_parse:
        try:
            import yaml
            with open(manifest_to_parse, "r") as f:
                manifest_data = yaml.safe_load(f)
                inputs = manifest_data.get("inputs", {})
                for k, v in inputs.items():
                    if isinstance(v, dict) and v.get("kind") == "secret":
                        env_key = k
                        break
        except Exception as e:
            print(f"Failed to parse manifest for token key: {e}")

    if token:
        os.environ[env_key] = token
        env_path = os.path.join(os.path.dirname(__file__), ".env")
        try:
            if os.path.exists(env_path):
                with open(env_path, "r") as f:
                    lines = f.readlines()
                with open(env_path, "w") as f:
                    key_found = False
                    for line in lines:
                        if line.startswith(f"{env_key}="):
                            f.write(f"{env_key}={token}\n")
                            key_found = True
                        else:
                            f.write(line)
                    if not key_found:
                        f.write(f"{env_key}={token}\n")
            else:
                with open(env_path, "w") as f:
                    f.write(f"{env_key}={token}\n")
        except Exception as e:
            print(f"Failed to write token to .env: {e}")
            
    if os.path.exists(community_manifest):
        proc = await asyncio.create_subprocess_exec(
            CORAL_BIN, "source", "add", "--file", community_manifest,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
    else:
        proc = await asyncio.create_subprocess_exec(
            CORAL_BIN, "source", "add", name,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        
    stdout, stderr = await proc.communicate()
    if proc.returncode != 0:
        return f"Error: {stderr.decode().strip()}"
    return stdout.decode().strip()


async def coral_sql(query: str) -> str:
    """Run `coral sql` with JSON output and return the result."""
    proc = await asyncio.create_subprocess_exec(
        CORAL_BIN, "sql", "--format", "json", query,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    try:
        stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=20.0)
    except asyncio.TimeoutError:
        proc.kill()
        return "SQL Error: Query timed out after 20 seconds. You probably forgot to add LIMIT 10 to your query!"
        
    if proc.returncode != 0:
        return f"SQL Error: {stderr.decode().strip()}"
    return stdout.decode().strip()


async def coral_source_health(name: str) -> dict:
    """Check if a source is healthy by running a test query."""
    # Try to find a test query from the manifest
    test_query = None
    for base in [
        os.path.expanduser(f"~/personal/coral/sources/core/{name}/manifest.yaml"),
        os.path.expanduser(f"~/personal/coral/sources/community/{name}/manifest.yaml"),
    ]:
        if os.path.exists(base):
            try:
                import yaml
                with open(base, "r") as f:
                    manifest = yaml.safe_load(f)
                    test_queries = manifest.get("test_queries", [])
                    if test_queries:
                        test_query = test_queries[0]
            except Exception:
                pass
            break

    if not test_query:
        # Fallback: discover first table and SELECT 1 row
        tables = await coral_source_discover()
        source_tables = [t for t in tables if t.get("name", "").startswith(f"{name}.")]
        if source_tables:
            test_query = f"SELECT * FROM {source_tables[0]['name']} LIMIT 1"
        else:
            return {"status": "unhealthy", "error": "No tables found for source"}

    proc = await asyncio.create_subprocess_exec(
        CORAL_BIN, "sql", "--format", "json", test_query,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    try:
        stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=8.0)
    except asyncio.TimeoutError:
        proc.kill()
        return {"status": "unhealthy", "error": "Query timed out"}

    if proc.returncode != 0:
        return {"status": "unhealthy", "error": stderr.decode().strip()[:200]}
    return {"status": "healthy"}
